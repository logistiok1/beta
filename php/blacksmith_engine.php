<?php
session_start();
require 'db.php';
require_once 'engine_lib.php'; // ОБЯЗАТЕЛЬНО для recalcStats

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'get_items') {
    $npcId = (int)$_POST['npc_id'];

    $npc = $pdo->prepare("SELECT loc_x, loc_y FROM npcs WHERE id = ? AND type='blacksmith'");
    $npc->execute([$npcId]);
    $npcData = $npc->fetch();

    if (!$npcData) exit(json_encode(['status' => 'error', 'message' => 'Кузнец не найден']));
    
    $user = $pdo->prepare("SELECT loc_x, loc_y, gold FROM users WHERE id = ?");
    $user->execute([$userId]);
    $userData = $user->fetch();

    $dist = max(abs($userData['loc_x'] - $npcData['loc_x']), abs($userData['loc_y'] - $npcData['loc_y']));
    if ($dist > 2) exit(json_encode(['status' => 'error', 'message' => 'Слишком далеко от Кузнеца']));

    $sql = "SELECT inv.id as unique_id, inv.quantity, inv.upgrade_level, inv.bonus_dmg, inv.bonus_hp, inv.bonus_def, i.* FROM inventory inv JOIN items i ON inv.item_id = i.id WHERE inv.user_id = ? AND inv.is_equipped = 0 AND i.type NOT IN ('material', 'outfit', 'background')";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'items' => $items, 'gold' => $userData['gold']]);
}

if ($action === 'upgrade') {
    $invId = (int)$_POST['inv_id'];
    $statType = $_POST['stat_type']; 
    
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM inventory WHERE id = ? AND user_id = ? FOR UPDATE");
        $stmt->execute([$invId, $userId]);
        $item = $stmt->fetch();
        
        if (!$item) throw new Exception("Предмет не найден в инвентаре");
        
        $uStmt = $pdo->prepare("SELECT gold FROM users WHERE id = ? FOR UPDATE");
        $uStmt->execute([$userId]);
        $userGold = $uStmt->fetchColumn();
        
        $cost = 50 + ($item['upgrade_level'] * 100);
        if ($userGold < $cost) throw new Exception("Не хватает золота для улучшения");
        
        // Списываем золото
        $pdo->prepare("UPDATE users SET gold = gold - ? WHERE id = ?")->execute([$cost, $userId]);
        
        $addDmg = ($statType == 'damage') ? 1 : 0;
        $addHp = ($statType == 'hp') ? 10 : 0;
        $addDef = ($statType == 'defense') ? 1 : 0;
        
        // Применяем улучшения
        $pdo->prepare("UPDATE inventory SET upgrade_level = upgrade_level + 1, bonus_dmg = bonus_dmg + ?, bonus_hp = bonus_hp + ?, bonus_def = bonus_def + ? WHERE id = ?")
            ->execute([$addDmg, $addHp, $addDef, $invId]);
            
        // Если вдруг вещь была надета
        if ($item['is_equipped'] == 1) {
            recalcStats($pdo, $userId);
        }
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'new_level' => $item['upgrade_level'] + 1]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>
