<?php
session_start();
require 'db.php';

ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');

$action = $_POST['action'] ?? '';
$currentTime = time();

// === ПРОВЕРКА СЕССИИ (АВТО-ВХОД) ===
if ($action === 'check_session') {
    if (isset($_SESSION['user_id'])) {
        // Проверяем время последней активности в БД
        $stmt = $pdo->prepare("SELECT last_active FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $lastActive = $stmt->fetchColumn();

        // Если прошло больше 3 минут (180 секунд) - выбрасываем
        if ($lastActive && ($currentTime - $lastActive > 180)) {
            session_unset();
            session_destroy();
            echo json_encode(['status' => 'guest', 'message' => 'Сессия истекла (AFK)']);
        } else {
            // Все ок, обновляем активность
            $pdo->prepare("UPDATE users SET last_active = ? WHERE id = ?")->execute([$currentTime, $_SESSION['user_id']]);
            echo json_encode(['status' => 'logged_in']);
        }
    } else {
        echo json_encode(['status' => 'guest']);
    }
    exit;
}

// === РЕГИСТРАЦИЯ ===
if ($action === 'register') {
    $class = $_POST['class_type'];
    $nick = $_POST['nickname'];
    $pass = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$nick]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Ник занят']);
        exit;
    }

    $sql = "INSERT INTO users (username, password, class_type, loc_x, loc_y, level, exp, next_level_exp, hp, max_hp, damage, defense, gold, location_id, last_active) VALUES (?, ?, ?, 10, 10, 1, 0, 100, 100, 100, 2, 0, 0, 1, ?)";
    $stmt = $pdo->prepare($sql);
    
    if ($stmt->execute([$nick, $pass, $class, $currentTime])) {
        $_SESSION['user_id'] = $pdo->lastInsertId();
        $_SESSION['username'] = $nick;
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка БД']);
    }
}

// === ВХОД ===
if ($action === 'login') {
    $nick = $_POST['nickname'];
    $pass = $_POST['password'];

    $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->execute([$nick]);
    $user = $stmt->fetch();

    if ($user && password_verify($pass, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $pdo->prepare("UPDATE users SET last_active = ? WHERE id = ?")->execute([$currentTime, $user['id']]);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Неверный логин или пароль']);
    }
}

// === ВЫХОД ===
if ($action === 'logout') {
    session_unset();
    session_destroy();
    echo json_encode(['status' => 'success']);
}
?>