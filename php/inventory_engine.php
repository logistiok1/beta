<?php
session_start();
require 'db.php';
require_once 'engine_lib.php'; // ОБЯЗАТЕЛЬНО для recalcStats

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

try {
    if ($action === 'get_inventory') {
        $tab = $_POST['tab'] ?? 'main';
        $sql = "SELECT inv.id as unique_id, inv.quantity, inv.upgrade_level, inv.bonus_dmg, inv.bonus_hp, inv.bonus_def, inv.is_equipped, i.* FROM inventory inv JOIN items i ON inv.item_id = i.id WHERE inv.user_id = ? ";
        
        if ($tab === 'resources') {
            $sql .= "AND inv.is_equipped = 0 AND i.type = 'material'";
        } elseif ($tab === 'misc') {
            $sql .= "AND i.type IN ('outfit', 'background')";
        } else {
            // В главную вкладку попадает вся экипировка (оружие, броня, кольца, крылья и тд)
            $sql .= "AND inv.is_equipped = 0 AND i.type NOT IN ('material', 'outfit', 'background')";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $inventory = array_fill(0, 12, null);
        foreach ($items as $index => $item) {
            if ($index < 12) $inventory[$index] = $item;
        }

        echo json_encode(['status' => 'success', 'inventory' => $inventory]);
        exit;
    }

    if ($action === 'equip') {
        $invId = (int)$_POST['inv_id'];
        
        $stmt = $pdo->prepare("SELECT inv.*, i.type FROM inventory inv JOIN items i ON inv.item_id = i.id WHERE inv.id = ? AND inv.user_id = ? AND inv.is_equipped = 0 FOR UPDATE");
        $stmt->execute([$invId, $userId]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$item) exit(json_encode(['status' => 'error', 'message' => 'Item not found or already equipped']));

        $pdo->beginTransaction();
        
        // Создаем запись об экипировке, если игрок новый
        $eqCheck = $pdo->prepare("SELECT user_id FROM equipment WHERE user_id = ?");
        $eqCheck->execute([$userId]);
        if (!$eqCheck->fetch()) {
            $pdo->prepare("INSERT INTO equipment (user_id) VALUES (?)")->execute([$userId]);
        }
        
        if ($item['type'] === 'outfit') {
            $pdo->prepare("UPDATE users SET active_outfit = (SELECT img FROM items WHERE id = ?) WHERE id = ?")->execute([$item['item_id'], $userId]);
            $pdo->prepare("UPDATE inventory SET is_equipped = 0 WHERE user_id = ? AND item_id IN (SELECT id FROM items WHERE type = 'outfit')")->execute([$userId]);
            $pdo->prepare("UPDATE inventory SET is_equipped = 1 WHERE id = ?")->execute([$invId]);
        } elseif ($item['type'] === 'background') {
            $pdo->prepare("UPDATE users SET active_background = (SELECT img FROM items WHERE id = ?) WHERE id = ?")->execute([$item['item_id'], $userId]);
            $pdo->prepare("UPDATE inventory SET is_equipped = 0 WHERE user_id = ? AND item_id IN (SELECT id FROM items WHERE type = 'background')")->execute([$userId]);
            $pdo->prepare("UPDATE inventory SET is_equipped = 1 WHERE id = ?")->execute([$invId]);
        } else {
            // Эта логика универсальна: если тип "wings", она обновит "slot_wings"
            $slot = "slot_" . $item['type'];
            
            // Если в слоте что-то было, снимаем
            $eqStmt = $pdo->prepare("SELECT $slot FROM equipment WHERE user_id = ?");
            $eqStmt->execute([$userId]);
            $currentEquippedInvId = $eqStmt->fetchColumn();
            
            if ($currentEquippedInvId > 0) {
                $pdo->prepare("UPDATE inventory SET is_equipped = 0 WHERE id = ?")->execute([$currentEquippedInvId]);
            }
            
            // Надеваем новое
            $pdo->prepare("UPDATE equipment SET $slot = ? WHERE user_id = ?")->execute([$invId, $userId]);
            $pdo->prepare("UPDATE inventory SET is_equipped = 1 WHERE id = ?")->execute([$invId]);
            
            // ПЕРЕРАСЧЕТ ХАРАКТЕРИСТИК (Учитывает базовые статы + заточки + крылья)
            recalcStats($pdo, $userId);
        }
        
        $pdo->commit();
        echo json_encode(['status' => 'success']);
        exit;
    }

    if ($action === 'unequip') {
        $invId = (int)$_POST['inv_id'];
        
        $stmt = $pdo->prepare("SELECT inv.*, i.type FROM inventory inv JOIN items i ON inv.item_id = i.id WHERE inv.id = ? AND inv.user_id = ? AND inv.is_equipped = 1 FOR UPDATE");
        $stmt->execute([$invId, $userId]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$item) exit(json_encode(['status' => 'error', 'message' => 'Item not found or not equipped']));

        $pdo->beginTransaction();
        
        if ($item['type'] === 'outfit') {
            $pdo->prepare("UPDATE users SET active_outfit = NULL WHERE id = ?")->execute([$userId]);
        } elseif ($item['type'] === 'background') {
            $pdo->prepare("UPDATE users SET active_background = NULL WHERE id = ?")->execute([$userId]);
        } else {
            // Снятие универсально: "wings" очистит "slot_wings"
            $slot = "slot_" . $item['type'];
            $pdo->prepare("UPDATE equipment SET $slot = 0 WHERE user_id = ?")->execute([$userId]);
            $pdo->prepare("UPDATE inventory SET is_equipped = 0 WHERE id = ?")->execute([$invId]);
            
            // УБИРАЕМ ХАРАКТЕРИСТИКИ ВЕЩИ ПРИ СНЯТИИ
            recalcStats($pdo, $userId);
        }
        
        $pdo->commit();
        echo json_encode(['status' => 'success']);
        exit;
    }

    if ($action === 'drop') {
        $invId = (int)$_POST['inv_id'];
        $pdo->prepare("DELETE FROM inventory WHERE id = ? AND user_id = ? AND is_equipped = 0")->execute([$invId, $userId]);
        echo json_encode(['status' => 'success']);
        exit;
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
