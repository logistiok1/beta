<?php
session_start();
require 'db.php';

ob_clean();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Auth required']);
    exit;
}

$myId = (int)$_SESSION['user_id'];
$targetId = (isset($_POST['target_id']) && is_numeric($_POST['target_id']) && (int)$_POST['target_id'] > 0) 
            ? (int)$_POST['target_id'] 
            : $myId;

// 1. ПОЛУЧАЕМ ПРОФИЛЬ (Теперь с role)
$stmt = $pdo->prepare("SELECT id, username, class_type, active_outfit, active_background, level, hp, max_hp, damage, defense, gold, role FROM users WHERE id = ?");
$stmt->execute([$targetId]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    echo json_encode(['status' => 'error', 'message' => 'Игрок не найден']);
    exit;
}

// 2. ПОЛУЧАЕМ ЭКИПИРОВКУ
$stmtEq = $pdo->prepare("SELECT * FROM equipment WHERE user_id = ?");
$stmtEq->execute([$targetId]);
$equippedIds = $stmtEq->fetch(PDO::FETCH_ASSOC);

if (!$equippedIds) {
    $equippedIds = ['slot_head'=>0, 'slot_body'=>0, 'slot_legs'=>0, 'slot_weapon'=>0, 'slot_amulet'=>0, 'slot_ring'=>0, 'slot_wings'=>0];
}

$equipment = [];
$slots = ['head', 'body', 'legs', 'weapon', 'amulet', 'ring', 'wings'];
foreach ($slots as $type) {
    $itemId = $equippedIds["slot_$type"];
    $equipment[$type] = null;
    
    if ($itemId > 0) {
        $invStmt = $pdo->prepare("SELECT inv.id as unique_id, inv.upgrade_level, inv.bonus_dmg, inv.bonus_hp, inv.bonus_def, i.* FROM inventory inv JOIN items i ON inv.item_id = i.id WHERE inv.id = ?");
        $invStmt->execute([$itemId]);
        $invItem = $invStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($invItem) {
            $equipment[$type] = $invItem;
        } else {
            $baseStmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
            $baseStmt->execute([$itemId]);
            $baseItem = $baseStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($baseItem) {
                $baseItem['unique_id'] = 0; 
                $baseItem['upgrade_level'] = 0;
                $baseItem['bonus_dmg'] = 0;
                $baseItem['bonus_hp'] = 0;
                $baseItem['bonus_def'] = 0;
                $equipment[$type] = $baseItem;
            }
        }
    }
}

// 3. ОПРЕДЕЛЯЕМ ОТНОШЕНИЯ
$relation = [
    'is_self' => ($targetId === $myId),
    'is_friend' => false,
    'request_sent' => false,
    'request_received' => false
];

if (!$relation['is_self']) {
    $stmtF = $pdo->prepare("SELECT user_id_1, status FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)");
    $stmtF->execute([$myId, $targetId, $targetId, $myId]);
    $friendData = $stmtF->fetch(PDO::FETCH_ASSOC);

    if ($friendData) {
        if ($friendData['status'] == 1) {
            $relation['is_friend'] = true;
        } elseif ($friendData['user_id_1'] == $myId) {
            $relation['request_sent'] = true;
        } else {
            $relation['request_received'] = true;
        }
    }
}

// 4. ПОЛУЧАЕМ АКТИВНОГО ПИТОМЦА
$stmtPet = $pdo->prepare("
    SELECT p.name, p.img, up.level, 
           (p.base_dmg * up.level) as dmg, 
           (p.base_hp * up.level) as hp, 
           (p.base_def * up.level) as def
    FROM user_pets up
    JOIN pets p ON up.pet_id = p.id
    WHERE up.user_id = ? AND up.is_summoned = 1
");
$stmtPet->execute([$targetId]);
$activePet = $stmtPet->fetch(PDO::FETCH_ASSOC);

// 5. ПОЛУЧАЕМ ВЫПОЛНЕННЫЕ ДОСТИЖЕНИЯ ИГРОКА ДЛЯ ПРОФИЛЯ
$stmtAch = $pdo->prepare("
    SELECT a.id, a.title, a.description, a.icon, a.bonus_dmg, a.bonus_hp, a.bonus_def 
    FROM user_achievements ua 
    JOIN achievements a ON ua.achievement_id = a.id 
    WHERE ua.user_id = ? AND ua.is_completed = 1
");
$stmtAch->execute([$targetId]);
$completedAchievements = $stmtAch->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'status' => 'success', 
    'profile' => $profile, 
    'equipment' => $equipment, 
    'relation' => $relation,
    'pet' => $activePet,
    'achievements' => $completedAchievements
]);
?>
