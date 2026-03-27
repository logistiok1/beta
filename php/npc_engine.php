<?php
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error']);
    exit;
}

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'get_npc_dialog') {
    $npcId = (int)$_POST['npc_id'];

    $stmt = $pdo->prepare("SELECT * FROM npcs WHERE id = ?");
    $stmt->execute([$npcId]);
    $npc = $stmt->fetch();

    if (!$npc) {
        echo json_encode(['status' => 'error', 'message' => 'НПС не найден']);
        exit;
    }

    $stmtU = $pdo->prepare("SELECT loc_x, loc_y FROM users WHERE id = ?");
    $stmtU->execute([$userId]);
    $user = $stmtU->fetch();

    $dist = max(abs($user['loc_x'] - $npc['loc_x']), abs($user['loc_y'] - $npc['loc_y']));
    if ($dist > 2) {
        echo json_encode(['status' => 'error', 'message' => 'Слишком далеко']);
        exit;
    }

    // Если это кузнец или аукцион, нам не нужны квесты, просто отдаем тип
    if ($npc['type'] === 'blacksmith' || $npc['type'] === 'auction') {
         echo json_encode([
            'status' => 'success',
            'npc' => [
                'name' => $npc['name'],
                'desc' => $npc['description'],
                'img' => $npc['img'],
                'type' => $npc['type']
            ],
            'quests' => []
        ]);
        exit;
    }

    // Логика квестов для обычных НПС
    $qStmt = $pdo->prepare("SELECT * FROM quests WHERE npc_id = ?");
    $qStmt->execute([$npcId]);
    $quests = $qStmt->fetchAll();

    $availableQuests = [];

    foreach ($quests as $q) {
        $uqStmt = $pdo->prepare("SELECT * FROM user_quests WHERE user_id = ? AND quest_id = ?");
        $uqStmt->execute([$userId, $q['id']]);
        $uq = $uqStmt->fetch();

        $qStatus = 'available'; 
        $progress = 0;

        if ($uq) {
            if ($uq['status'] == 0) $qStatus = 'active';
            elseif ($uq['status'] == 1) $qStatus = 'ready';
            elseif ($uq['status'] == 2) $qStatus = 'completed';
            $progress = $uq['current_count'];
        }

        if ($qStatus !== 'completed') {
            $availableQuests[] = [
                'id' => $q['id'],
                'title' => $q['title'],
                'description' => $q['description'],
                'target_count' => $q['target_count'],
                'current_count' => $progress,
                'status' => $qStatus,
                'rewards' => [
                    'gold' => $q['reward_gold'],
                    'exp' => $q['reward_exp']
                ]
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'npc' => [
            'name' => $npc['name'],
            'desc' => $npc['description'],
            'img' => $npc['img'],
            'type' => $npc['type']
        ],
        'quests' => $availableQuests
    ]);
}
?>