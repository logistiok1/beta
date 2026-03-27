<?php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

// Автоматически создаем крутую новую таблицу для чата, если её нет!
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `global_chat` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `channel` VARCHAR(20) DEFAULT 'general',
        `message` TEXT,
        `item_data` TEXT,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch(Exception $e) {}

// === ОТПРАВКА СООБЩЕНИЯ ===
if ($action === 'send') {
    $channel = $_POST['channel'] ?? 'general';
    $msg = htmlspecialchars($_POST['message'] ?? '');
    $itemData = $_POST['item_data'] ?? '';

    if (empty($msg) && empty($itemData)) exit(json_encode(['status' => 'error', 'message' => 'Пустое сообщение']));

    $pdo->prepare("INSERT INTO global_chat (user_id, channel, message, item_data) VALUES (?, ?, ?, ?)")
        ->execute([$userId, $channel, $msg, $itemData]);

    echo json_encode(['status' => 'success']);
    exit;
}

// === ПОЛУЧЕНИЕ СООБЩЕНИЙ ===
if ($action === 'get') {
    $channel = $_POST['channel'] ?? 'general';
    
    // Получаем последние 40 сообщений из нужного канала
    $stmt = $pdo->prepare("
        SELECT c.*, u.username, u.class_type, u.active_outfit 
        FROM global_chat c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.channel = ? 
        ORDER BY c.id DESC LIMIT 40
    ");
    $stmt->execute([$channel]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Подготавливаем данные для красивого вывода
    foreach ($messages as &$m) {
        $m['time'] = date('H:i', strtotime($m['created_at']));
        // Аватарка (шмот или базовый класс)
        $m['avatar'] = $m['active_outfit'] ? 'images/shmot/'.$m['active_outfit'] : 'images/class_'.$m['class_type'].'.png';
        
        // Парсим предмет, если он был прикреплен
        if (!empty($m['item_data'])) {
            $m['item_obj'] = json_decode($m['item_data'], true);
        } else {
            $m['item_obj'] = null;
        }
    }

    // Разворачиваем массив, чтобы старые были сверху, новые снизу
    echo json_encode(['status' => 'success', 'messages' => array_reverse($messages)]);
    exit;
}
?>