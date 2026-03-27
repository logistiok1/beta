<?php
session_start();
require 'db.php';
require_once 'engine_lib.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$time = time();

try {
    if ($action === 'get_shop') {
        $tab = $_POST['tab'] ?? 'promo';
        
        $uStmt = $pdo->prepare("SELECT valor FROM users WHERE id = ?");
        $uStmt->execute([$userId]);
        $valor = (int)$uStmt->fetchColumn();

        $stmt = $pdo->prepare("
            SELECT s.*, i.name, i.img, i.type, i.rarity, i.description 
            FROM premium_shop s 
            JOIN items i ON s.item_id = i.id 
            WHERE s.tab = ?
        ");
        $stmt->execute([$tab]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ИСПРАВЛЕНИЕ: Проверяем, куплен ли уже товар из Акции
        foreach ($items as &$item) {
            $item['is_bought'] = false;
            if ($item['tab'] === 'promo') {
                $chk1 = $pdo->prepare("SELECT count(*) FROM inventory WHERE user_id = ? AND item_id = ?");
                $chk1->execute([$userId, $item['item_id']]);
                
                $chk2 = $pdo->prepare("SELECT count(*) FROM storage WHERE user_id = ? AND item_id = ?");
                $chk2->execute([$userId, $item['item_id']]);
                
                if ($chk1->fetchColumn() > 0 || $chk2->fetchColumn() > 0) {
                    $item['is_bought'] = true;
                }
            }
        }

        echo json_encode(['status' => 'success', 'valor' => $valor, 'items' => $items, 'server_time' => $time]);
        exit;
    }

    if ($action === 'buy_item') {
        $shopId = (int)$_POST['shop_id'];

        $stmt = $pdo->prepare("SELECT s.*, i.name FROM premium_shop s JOIN items i ON s.item_id = i.id WHERE s.id = ?");
        $stmt->execute([$shopId]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$item) exit(json_encode(['status' => 'error', 'message' => 'Товар не найден']));

        if ($item['tab'] === 'promo') {
            if ($item['promo_end'] > 0 && $item['promo_end'] < $time) {
                exit(json_encode(['status' => 'error', 'message' => 'Акция на этот товар уже закончилась!']));
            }
            
            // Защита от двойной покупки
            $chk = $pdo->prepare("SELECT count(*) FROM inventory WHERE user_id = ? AND item_id = ?");
            $chk->execute([$userId, $item['item_id']]);
            if ($chk->fetchColumn() > 0) {
                exit(json_encode(['status' => 'error', 'message' => 'Вы уже купили этот товар!']));
            }
        }

        $uStmt = $pdo->prepare("SELECT valor FROM users WHERE id = ? FOR UPDATE");
        $uStmt->execute([$userId]);
        $valor = (int)$uStmt->fetchColumn();

        if ($valor < $item['price']) exit(json_encode(['status' => 'error', 'message' => 'Недостаточно Валора!']));

        $pdo->beginTransaction();
        $pdo->prepare("UPDATE users SET valor = valor - ? WHERE id = ?")->execute([$item['price'], $userId]);
        
        $msg = giveItem($pdo, $userId, $item['item_id'], 1);
        $pdo->commit();

        echo json_encode(['status' => 'success', 'message' => 'Успешно куплено! ' . $msg]);
        exit;
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Ошибка: ' . $e->getMessage()]);
}
?>
