<?php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

// === ОТПРАВИТЬ ЗАПРОС ===
if ($action === 'send_request') {
    $targetId = (int)$_POST['target_id'];
    if ($targetId == $userId) exit(json_encode(['status' => 'error', 'message' => 'Нельзя добавить себя']));

    // Проверка, есть ли уже связь
    $check = $pdo->prepare("SELECT * FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)");
    $check->execute([$userId, $targetId, $targetId, $userId]);
    if ($check->fetch()) exit(json_encode(['status' => 'error', 'message' => 'Уже есть запрос или дружба']));

    $pdo->prepare("INSERT INTO friends (user_id_1, user_id_2, status) VALUES (?, ?, 0)")->execute([$userId, $targetId]);
    
    // Уведомление получателю
    $myName = $_SESSION['username'];
    $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")
        ->execute([$targetId, "$myName отправил вам запрос в друзья!"]);

    echo json_encode(['status' => 'success']);
}

// === СПИСОК ДРУЗЕЙ И ЗАПРОСОВ ===
if ($action === 'get_friends_list') {
    $currentTime = time();
    
    // 1. Друзья (status = 1)
    // Сложный запрос: выбираем друга (id_1 или id_2), джойним users для ника/аватара/онлайна
    $stmtF = $pdo->prepare("
        SELECT u.id, u.username, u.class_type, u.last_active 
        FROM friends f
        JOIN users u ON (CASE WHEN f.user_id_1 = ? THEN f.user_id_2 ELSE f.user_id_1 END) = u.id
        WHERE (f.user_id_1 = ? OR f.user_id_2 = ?) AND f.status = 1
    ");
    $stmtF->execute([$userId, $userId, $userId]);
    $friendsRaw = $stmtF->fetchAll();
    
    $friends = [];
    foreach($friendsRaw as $f) {
        $isOnline = ($currentTime - $f['last_active']) < 300; // 5 минут
        $f['status_text'] = $isOnline ? 'Онлайн' : 'Был: ' . date('d.m H:i', $f['last_active']);
        $f['is_online'] = $isOnline;
        $friends[] = $f;
    }

    // 2. Входящие запросы (где я user_id_2 и status = 0)
    $stmtR = $pdo->prepare("
        SELECT u.id, u.username, u.class_type 
        FROM friends f
        JOIN users u ON f.user_id_1 = u.id
        WHERE f.user_id_2 = ? AND f.status = 0
    ");
    $stmtR->execute([$userId]);
    $requests = $stmtR->fetchAll();

    echo json_encode(['status' => 'success', 'friends' => $friends, 'requests' => $requests]);
}

// === ПРИНЯТЬ / ОТКЛОНИТЬ ===
if ($action === 'handle_request') {
    $targetId = (int)$_POST['target_id'];
    $decision = $_POST['decision']; // accept / decline

    if ($decision === 'accept') {
        $pdo->prepare("UPDATE friends SET status = 1 WHERE user_id_1 = ? AND user_id_2 = ?")->execute([$targetId, $userId]);
        
        // Уведомление отправителю
        $myName = $_SESSION['username'];
        $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")->execute([$targetId, "$myName принял вашу заявку в друзья!"]);
    } else {
        $pdo->prepare("DELETE FROM friends WHERE user_id_1 = ? AND user_id_2 = ?")->execute([$targetId, $userId]);
    }
    echo json_encode(['status' => 'success']);
}
?>