<?php
// php/teleport_engine.php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

try {
    // 1. Создаем таблицы (CREATE TABLE IF NOT EXISTS работает везде)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `teleport_destinations` (
        `teleport_id` INT NOT NULL,
        `location_id` INT NOT NULL,
        PRIMARY KEY (`teleport_id`, `location_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS `user_visited_locations` (
        `user_id` INT NOT NULL,
        `location_id` INT NOT NULL,
        PRIMARY KEY (`user_id`, `location_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 2. БЕЗОПАСНОЕ добавление колонок (без IF NOT EXISTS, ошибки просто игнорируются)
    try { $pdo->exec("ALTER TABLE `teleports` ADD COLUMN `name` VARCHAR(50) DEFAULT 'Телепорт'"); } catch(Exception $e) {}
    try { $pdo->exec("ALTER TABLE `locations` ADD COLUMN `min_level` INT DEFAULT 1"); } catch(Exception $e) {}

    // Узнаем текущую локацию и уровень игрока
    $uStmt = $pdo->prepare("SELECT location_id, level FROM users WHERE id = ?");
    $uStmt->execute([$userId]);
    $user = $uStmt->fetch(PDO::FETCH_ASSOC);
    $userLoc = $user['location_id'];
    $userLevel = $user['level'];

    // Автоматически запоминаем текущую локацию (на всякий случай, если потом пригодится для достижений)
    if ($userLoc) {
        $pdo->prepare("INSERT IGNORE INTO user_visited_locations (user_id, location_id) VALUES (?, ?)")->execute([$userId, $userLoc]);
    }

    // --- ОТДАЕМ КООРДИНАТЫ И ИМЕНА ПОРТАЛОВ НА ТЕКУЩЕЙ ЛОКАЦИИ ---
    if ($action === 'get_map_portals') {
        // --- НОВОЕ: Добавлены offset_x, offset_y, font_size в запрос БД ---
        $stmt = $pdo->prepare("SELECT id, from_x as loc_x, from_y as loc_y, IFNULL(name, 'Телепорт') as name, offset_x, offset_y, font_size FROM teleports WHERE from_loc_id = ?");
        $stmt->execute([$userLoc]);
        echo json_encode(['status' => 'success', 'portals' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    // --- ОТДАЕМ СПИСОК ДОСТУПНЫХ НАПРАВЛЕНИЙ ---
    if ($action === 'get_destinations') {
        $tpId = (int)$_POST['tp_id'];

        $stmt = $pdo->prepare("
            SELECT l.id, l.name, IFNULL(l.min_level, 1) as min_level 
            FROM locations l
            WHERE l.id IN (SELECT location_id FROM teleport_destinations WHERE teleport_id = ?)
               OR l.id IN (SELECT to_loc_id FROM teleports WHERE id = ?)
            ORDER BY l.min_level ASC
        ");
        $stmt->execute([$tpId, $tpId]);
        $destinations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Получаем список ID посещенных локаций (не используется для блокировки, но отдаем)
        $vStmt = $pdo->prepare("SELECT location_id FROM user_visited_locations WHERE user_id = ?");
        $vStmt->execute([$userId]);
        $visited = $vStmt->fetchAll(PDO::FETCH_COLUMN);
        if (!is_array($visited)) $visited = []; 
        $visitedInt = array_map('intval', $visited);

        echo json_encode([
            'status' => 'success',
            'destinations' => $destinations,
            'visited' => $visitedInt,
            'user_level' => $userLevel,
            'current_loc' => $userLoc
        ]);
        exit;
    }

    // --- СОВЕРШАЕМ ПЕРЕМЕЩЕНИЕ ---
    if ($action === 'teleport_to') {
        $destId = (int)$_POST['dest_id'];
        
        $pdo->prepare("UPDATE users SET location_id = ?, loc_x = 10, loc_y = 10 WHERE id = ?")->execute([$destId, $userId]);
        $pdo->prepare("INSERT IGNORE INTO user_visited_locations (user_id, location_id) VALUES (?, ?)")->execute([$userId, $destId]);
        
        echo json_encode(['status' => 'success']);
        exit;
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка БД: ' . $e->getMessage()]);
    exit;
}
?>
