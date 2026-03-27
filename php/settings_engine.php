<?php
// php/settings_engine.php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(0); header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['status' => 'error', 'message' => 'Не авторизован']));
}

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

// === СМЕНА ЛОГИНА ===
if ($action === 'change_login') {
    $newLogin = trim($_POST['new_login'] ?? '');
    $cost = 10000;

    if (mb_strlen($newLogin, 'UTF-8') < 3 || mb_strlen($newLogin, 'UTF-8') > 15) {
        exit(json_encode(['status' => 'error', 'message' => 'Логин должен быть от 3 до 15 символов!']));
    }
    
    // Разрешаем только буквы (рус/англ) и цифры, чтобы не было багов с HTML кодом в никах
    if (!preg_match('/^[a-zA-Zа-яА-Я0-9_]+$/u', $newLogin)) {
        exit(json_encode(['status' => 'error', 'message' => 'Логин содержит недопустимые символы!']));
    }

    // Проверяем золото игрока
    $stmt = $pdo->prepare("SELECT gold FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $userGold = (int)$stmt->fetchColumn();

    if ($userGold < $cost) {
        exit(json_encode(['status' => 'error', 'message' => 'Недостаточно золота! Нужно ' . $cost]));
    }

    // Проверяем, не занят ли ник (игнорируем регистр)
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(?)");
    $checkStmt->execute([$newLogin]);
    if ($checkStmt->fetchColumn() > 0) {
        exit(json_encode(['status' => 'error', 'message' => 'Такой ник уже занят!']));
    }

    // Обновляем ник и списываем золото
    try {
        $pdo->beginTransaction();
        $pdo->prepare("UPDATE users SET username = ?, gold = gold - ? WHERE id = ?")->execute([$newLogin, $cost, $userId]);
        $pdo->commit();
        
        // Обновляем сессию, чтобы при обновлении страницы ник тоже был новый
        $_SESSION['username'] = $newLogin; 

        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Внутренняя ошибка сервера.']);
    }
    exit;
}

// === СМЕНА ПАРОЛЯ ===
if ($action === 'change_password') {
    $oldPass = $_POST['old_pass'] ?? '';
    $newPass = $_POST['new_pass'] ?? '';

    if (mb_strlen($newPass, 'UTF-8') < 5) {
        exit(json_encode(['status' => 'error', 'message' => 'Новый пароль слишком короткий!']));
    }

    // Достаем старый хэш пароля из БД
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $currentHash = $stmt->fetchColumn();

    // Сверяем введенный старый пароль с хэшем из БД
    if (!password_verify($oldPass, $currentHash)) {
        exit(json_encode(['status' => 'error', 'message' => 'Текущий пароль введен неверно!']));
    }

    // Хэшируем новый пароль и сохраняем
    $newHash = password_hash($newPass, PASSWORD_DEFAULT);
    $pdo->prepare("UPDATE users SET password = ? WHERE id = ?")->execute([$newHash, $userId]);

    echo json_encode(['status' => 'success']);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие']);
?>
