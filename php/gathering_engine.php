<?php
// php/gathering_engine.php
session_start();
require 'db.php';
require 'engine_lib.php';

ini_set('display_errors', 0); error_reporting(0); header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    exit(json_encode(['status' => 'error', 'message' => 'Не авторизован']));
}

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'gather') {
    $resId = (int)($_POST['res_id'] ?? 0);
    if ($resId <= 0) {
        exit(json_encode(['status' => 'error', 'message' => 'Неверный ресурс']));
    }
    
    // Вызываем твою оригинальную функцию добычи из engine_lib.php
    $result = tryGatherResource($pdo, $userId, $resId); 
    
    echo json_encode($result);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие']);
?>
