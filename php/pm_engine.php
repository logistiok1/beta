<?php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

// === ПОЛУЧИТЬ СПИСОК ДИАЛОГОВ ===
if ($action === 'get_conversations') {
    // Выбираем последние сообщения от каждого уникального собеседника
    // Это сложный запрос, упростим: найдем всех, с кем были переписки
    $sql = "
        SELECT u.id, u.username, u.class_type,
        (SELECT count(*) FROM private_messages pm WHERE pm.receiver_id = ? AND pm.sender_id = u.id AND pm.is_read = 0) as unread
        FROM users u
        WHERE u.id IN (
            SELECT sender_id FROM private_messages WHERE receiver_id = ?
            UNION
            SELECT receiver_id FROM private_messages WHERE sender_id = ?
        )
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId, $userId, $userId]);
    echo json_encode(['status' => 'success', 'dialogs' => $stmt->fetchAll()]);
}

// === ПОЛУЧИТЬ ИСТОРИЮ ЧАТА ===
if ($action === 'get_chat_history') {
    $otherId = (int)$_POST['target_id'];
    
    // Помечаем прочитанными
    $pdo->prepare("UPDATE private_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?")->execute([$otherId, $userId]);

    $stmt = $pdo->prepare("
        SELECT * FROM private_messages 
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY id ASC LIMIT 50
    ");
    $stmt->execute([$userId, $otherId, $otherId, $userId]);
    echo json_encode(['status' => 'success', 'messages' => $stmt->fetchAll()]);
}

// === ОТПРАВИТЬ СООБЩЕНИЕ ===
if ($action === 'send_pm') {
    $targetId = (int)$_POST['target_id'];
    $msg = htmlspecialchars($_POST['message']);
    
    if (empty($msg)) exit(json_encode(['status' => 'error']));

    $pdo->prepare("INSERT INTO private_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)")
        ->execute([$userId, $targetId, $msg]);

    // Уведомление (если получатель не в чате прямо сейчас - упрощенно просто шлем нотификацию)
    // Чтобы не спамить, можно проверять last_active, но пока шлем всегда
    $myName = $_SESSION['username'];
    // Проверка, чтобы не дублировать, если было недавно
    // Но по ТЗ: "При получении сообщения появлялось уведомление"
    // Добавим уведомление только если оно не прочитано сразу (сложно синхронизировать), 
    // поэтому просто добавим нотификацию в движок уведомлений
    $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")
        ->execute([$targetId, "$myName отправил вам сообщение!"]);

    echo json_encode(['status' => 'success']);
}
?>