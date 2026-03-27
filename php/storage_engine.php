<?php
// php/storage_engine.php
session_start();
require 'db.php';
require 'engine_lib.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$time = time();

// Авто-очистка просроченного
$pdo->prepare("DELETE FROM storage WHERE expires_at < ?")->execute([$time]);

// === ПОЛУЧИТЬ ПРЕДМЕТЫ ИЗ ХРАНИЛИЩА ===
if ($action === 'get_storage') {
    $stmt = $pdo->prepare("
        SELECT s.id, s.quantity, s.expires_at, i.name, i.img, i.type, i.id as item_id 
        FROM storage s 
        JOIN items i ON s.item_id = i.id 
        WHERE s.user_id = ?
        ORDER BY s.expires_at ASC
    ");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['status' => 'success', 'items' => $items, 'server_time' => $time]);
}

// === ЗАБРАТЬ ПРЕДМЕТ В РЮКЗАК ===
if ($action === 'take') {
    $storageId = (int)$_POST['id'];
    
    // Получаем предмет
    $stmt = $pdo->prepare("SELECT s.*, i.type, i.id as item_id FROM storage s JOIN items i ON s.item_id = i.id WHERE s.id = ? AND s.user_id = ? FOR UPDATE");
    $stmt->execute([$storageId, $userId]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$item) exit(json_encode(['status' => 'error', 'message' => 'Предмет не найден']));
    
    $isStackable = ($item['type'] === 'material');

    // ИСПРАВЛЕНИЕ: Определяем условие для подсчета лимита по вкладкам (макс 12)
    if ($item['type'] === 'material') {
        $typeCondition = "i.type = 'material'";
    } elseif ($item['type'] === 'outfit' || $item['type'] === 'background') {
        $typeCondition = "i.type IN ('outfit', 'background')";
    } else {
        $typeCondition = "i.type NOT IN ('material', 'outfit', 'background')";
    }

    $pdo->beginTransaction();
    
    $stack = false;
    if ($isStackable) {
        $sStmt = $pdo->prepare("SELECT id, quantity FROM inventory WHERE user_id = ? AND item_id = ? AND quantity < 32 AND is_equipped = 0 LIMIT 1 FOR UPDATE");
        $sStmt->execute([$userId, $item['item_id']]);
        $stack = $sStmt->fetch();
    }

    if ($stack) {
        $space = 32 - $stack['quantity'];
        if ($item['quantity'] <= $space) {
            $pdo->prepare("UPDATE inventory SET quantity = quantity + ? WHERE id = ?")->execute([$item['quantity'], $stack['id']]);
            $pdo->prepare("DELETE FROM storage WHERE id = ?")->execute([$storageId]);
        } else {
            $pdo->prepare("UPDATE inventory SET quantity = 32 WHERE id = ?")->execute([$stack['id']]);
            $pdo->prepare("UPDATE storage SET quantity = quantity - ? WHERE id = ?")->execute([$space, $storageId]);
        }
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Перенесено в рюкзак']);
    } else {
        // ИСПРАВЛЕНИЕ: Считаем занятые ячейки только в ТЕКУЩЕЙ вкладке
        $cStmt = $pdo->prepare("
            SELECT count(inv.id) 
            FROM inventory inv 
            JOIN items i ON inv.item_id = i.id 
            WHERE inv.user_id = ? AND inv.is_equipped = 0 AND $typeCondition
        ");
        $cStmt->execute([$userId]);
        
        if ((int)$cStmt->fetchColumn() < 12) {
            // Для экипировки забираем строго 1 штуку
            $takeQty = $isStackable ? $item['quantity'] : 1;
            
            $pdo->prepare("INSERT INTO inventory (user_id, item_id, quantity, is_equipped) VALUES (?, ?, ?, 0)")->execute([$userId, $item['item_id'], $takeQty]);
            
            // Если забрали всё (или была 1 штука), удаляем из хранилища
            if ($item['quantity'] <= $takeQty) {
                $pdo->prepare("DELETE FROM storage WHERE id = ?")->execute([$storageId]);
            } else {
                $pdo->prepare("UPDATE storage SET quantity = quantity - ? WHERE id = ?")->execute([$takeQty, $storageId]);
            }
            
            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Перенесено в рюкзак']);
        } else {
            $pdo->rollBack();
            echo json_encode(['status' => 'error', 'message' => 'В этой вкладке рюкзака нет мест! (Макс 12)']);
        }
    }
}
?>
