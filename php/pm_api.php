<?php
// php/pm_api.php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    die(json_encode(['status' => 'error', 'message' => 'Не авторизован']));
}

$userId = (int)$_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'send') {
    $receiverId = (int)$_POST['receiver_id'];
    $message = trim(htmlspecialchars($_POST['message']));
    
    if (empty($message)) {
        die(json_encode(['status' => 'error', 'message' => 'Пустое сообщение']));
    }
    
    $pdo->prepare("INSERT INTO private_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)")
        ->execute([$userId, $receiverId, $message]);
        
    echo json_encode(['status' => 'success']);
} 
elseif ($action === 'get_chat') {
    $targetId = (int)$_POST['target_id'];
    
    if (!$targetId) {
        die(json_encode(['status' => 'success', 'messages' => []]));
    }
    
    $pdo->prepare("UPDATE private_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?")
        ->execute([$targetId, $userId]);
        
    // ДОБАВЛЕНО: JOIN с users, чтобы вытянуть внешность отправителя
    $stmt = $pdo->prepare("
        SELECT m.*, u.class_type, u.active_outfit 
        FROM private_messages m
        JOIN users u ON m.sender_id = u.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) 
        ORDER BY m.created_at ASC LIMIT 100
    ");
    $stmt->execute([$userId, $targetId, $targetId, $userId]);
    $msgs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $result = [];
    foreach($msgs as $m) {
        // Формируем путь к аватарке
        $avatar = $m['active_outfit'] ? 'images/shmot/'.$m['active_outfit'] : 'images/class_'.$m['class_type'].'.png';
        
        $result[] = [
            'is_self' => ($m['sender_id'] == $userId),
            'message' => $m['message'],
            'time' => date('H:i', strtotime($m['created_at'])),
            'avatar' => $avatar
        ];
    }
    echo json_encode(['status' => 'success', 'messages' => $result]);
}
elseif ($action === 'get_dialogs') {
    // ДОБАВЛЕНО: Вытягиваем class_type и active_outfit для аватарок
    $stmt = $pdo->prepare("
        SELECT 
            u.id as user_id, 
            u.username, 
            u.class_type,
            u.active_outfit,
            (SELECT message FROM private_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY id DESC LIMIT 1) as last_msg,
            (SELECT count(id) FROM private_messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread,
            (SELECT MAX(id) FROM private_messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id)) as last_time_id
        FROM users u
        WHERE u.id IN (SELECT sender_id FROM private_messages WHERE receiver_id = ?) 
           OR u.id IN (SELECT receiver_id FROM private_messages WHERE sender_id = ?)
        ORDER BY last_time_id DESC
    ");
    
    $stmt->execute([
        $userId, $userId,
        $userId,         
        $userId, $userId, 
        $userId,          
        $userId           
    ]);
    
    $dialogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'dialogs' => $dialogs]);
}
?>
