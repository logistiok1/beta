<?php
// php/game_engine.php
session_start();
require 'db.php';
require 'engine_lib.php'; 

ini_set('display_errors', 0); 
error_reporting(E_ALL); 
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['status' => 'error', 'message' => 'Auth required']));
}

$action = $_POST['action'] ?? '';
$userId = $_SESSION['user_id'];

try {
    switch ($action) {
        // --- 1. Состояние игры ---
        case 'get_state':
            $inCombat = ($_POST['in_combat'] ?? 'false') === 'true';
            echo json_encode(getGameState($pdo, $userId, $inCombat));
            break;

        // --- 2. Перемещение ---
        case 'move':
            $dx = (int)$_POST['dx']; 
            $dy = (int)$_POST['dy'];
            $u = $pdo->prepare("SELECT loc_x, loc_y FROM users WHERE id = ?"); 
            $u->execute([$userId]); 
            $cur = $u->fetch();
            
            $nx = $cur['loc_x'] + $dx; 
            $ny = $cur['loc_y'] + $dy;
            
            // ВАЖНО: Ограничиваем карту от 5 до 45!
            // Это не дает подойти к самому краю карты, 
            // поэтому камера НИКОГДА не выйдет за границы текстуры и не покажет черноту.
            if ($nx >= 5 && $nx <= 45 && $ny >= 5 && $ny <= 45) {
                $pdo->prepare("UPDATE users SET loc_x = ?, loc_y = ? WHERE id = ?")->execute([$nx, $ny, $userId]);
                echo json_encode(['status' => 'success', 'x' => $nx, 'y' => $ny]);
            } else {
                echo json_encode(['status' => 'limit']);
            }
            break;

        // --- 3. Атака ИГРОКА (Игрок -> Моб) ---
        case 'attack_mob':
            $mobId = (int)$_POST['mob_id'];
            echo json_encode(processPlayerAttack($pdo, $userId, $mobId));
            break;

        // --- 4. Атака МОБА (Моб -> Игрок, вызывается таймером) ---
        case 'mob_attack':
            $mobId = (int)$_POST['mob_id'];
            echo json_encode(processMobAttack($pdo, $userId, $mobId));
            break;

        // --- 5. Сбор ресурсов ---
        case 'gather_resource':
            $resId = (int)$_POST['resource_id'];
            echo json_encode(tryGatherResource($pdo, $userId, $resId));
            break;

        // --- 6. Телепортация ---
        case 'use_teleport':
            $tpId = (int)$_POST['tp_id'];
            echo json_encode(tryTeleport($pdo, $userId, $tpId));
            break;

        // --- 7. Чат ---
        case 'send_msg':
            $msg = htmlspecialchars($_POST['message']);
            if(!empty($msg)) {
                $pdo->prepare("INSERT INTO chat (user_id, username, message) VALUES (?, ?, ?)")
                    ->execute([$userId, $_SESSION['username'], $msg]);
                echo json_encode(['status' => 'success']);
            }
            break;

        case 'get_chat':
            $msgs = $pdo->query("SELECT username, message FROM chat ORDER BY id DESC LIMIT 20")->fetchAll();
            echo json_encode(['status' => 'success', 'messages' => array_reverse($msgs)]);
            break;

        // --- 8. Уведомления ---
        case 'get_notifications':
            $stmt = $pdo->prepare("SELECT message, DATE_FORMAT(created_at, '%H:%i') as date FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 10");
            $stmt->execute([$userId]);
            $notifs = $stmt->fetchAll();
            $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0")->execute([$userId]);
            echo json_encode(['status' => 'success', 'notifications' => $notifs]);
            break;

        default:
            echo json_encode(['status' => 'error', 'message' => 'Unknown action']);
            break;
    }

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>