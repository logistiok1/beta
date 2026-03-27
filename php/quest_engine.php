<?php
session_start();
require 'db.php';
require_once 'engine_lib.php';

if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));
$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'accept_quest') {
    $questId = (int)$_POST['quest_id'];
    $check = $pdo->prepare("SELECT id FROM user_quests WHERE user_id = ? AND quest_id = ?");
    $check->execute([$userId, $questId]);
    if($check->fetch()) exit(json_encode(['status' => 'error', 'message' => 'Уже взят']));

    $pdo->prepare("INSERT INTO user_quests (user_id, quest_id, status, current_count) VALUES (?, ?, 0, 0)")->execute([$userId, $questId]);
    echo json_encode(['status' => 'success']);
}

if ($action === 'complete_quest') {
    $questId = (int)$_POST['quest_id'];
    $stmt = $pdo->prepare("SELECT uq.*, q.reward_gold, q.reward_exp, q.npc_id FROM user_quests uq JOIN quests q ON uq.quest_id = q.id WHERE uq.user_id = ? AND uq.quest_id = ?");
    $stmt->execute([$userId, $questId]);
    $questData = $stmt->fetch();

    if(!$questData) exit(json_encode(['status' => 'error', 'message' => 'Квест не найден']));
    if($questData['status'] == 2) exit(json_encode(['status' => 'error', 'message' => 'Уже сдан']));
    if($questData['status'] == 0) exit(json_encode(['status' => 'error', 'message' => 'Еще не выполнен']));

    $pdo->beginTransaction();
    try {
        $pdo->prepare("UPDATE users SET gold = gold + ?, exp = exp + ? WHERE id = ?")->execute([$questData['reward_gold'], $questData['reward_exp'], $userId]);

        $itemStmt = $pdo->prepare("SELECT item_id, count FROM quest_item_rewards WHERE quest_id = ?");
        $itemStmt->execute([$questId]);
        $items = $itemStmt->fetchAll();

        foreach($items as $item) {
            giveItem($pdo, $userId, $item['item_id'], $item['count']);
        }

        $pdo->prepare("UPDATE user_quests SET status = 2 WHERE id = ?")->execute([$questData['id']]);
        
        // ДОБАВЛЕН ХУК АЧИВОК (Плюс 1 квест)
        progressAchievement($pdo, $userId, 'quest', 0, 1);
        
        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

if ($action === 'get_log') {
    $stmt = $pdo->prepare("SELECT uq.status, uq.current_count, q.title, q.description, q.target_count, n.name as npc_name FROM user_quests uq JOIN quests q ON uq.quest_id = q.id JOIN npcs n ON q.npc_id = n.id WHERE uq.user_id = ? ORDER BY uq.status ASC");
    $stmt->execute([$userId]);
    
    $active = [];
    $completed = [];
    foreach($stmt->fetchAll() as $q) {
        if ($q['status'] == 2) $completed[] = $q;
        else $active[] = $q;
    }
    
    echo json_encode(['status' => 'success', 'active' => $active, 'completed' => $completed]);
}
?>