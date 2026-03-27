<?php
session_start();
require 'db.php';
ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'get_achievements') {
    // Получаем все достижения и склеиваем с личным прогрессом игрока
    $stmt = $pdo->prepare("
        SELECT a.id, a.title, a.description, a.icon, a.cond_value, 
               IFNULL(ua.progress, 0) as progress, 
               IFNULL(ua.is_completed, 0) as is_completed 
        FROM achievements a 
        LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
        ORDER BY ua.is_completed DESC, a.id ASC
    ");
    $stmt->execute([$userId]);
    $achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'achievements' => $achievements]);
}
?>