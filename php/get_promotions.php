<?php
// php/get_promotions.php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    die(json_encode(['status' => 'error', 'message' => 'Not logged in']));
}

// Если акции уже всплывали во время этой игровой сессии (чтобы не бесить при F5)
if (isset($_SESSION['promos_shown']) && $_SESSION['promos_shown'] === true) {
    die(json_encode(['status' => 'success', 'offers' => []]));
}

$userId = $_SESSION['user_id'];

// Выбираем только АКТИВНЫЕ акции, которые игрок ЕЩЕ НЕ ПОКУПАЛ
$stmt = $pdo->prepare("
    SELECT * FROM login_offers 
    WHERE is_active = 1 
    AND id NOT IN (SELECT offer_id FROM user_purchased_offers WHERE user_id = ?)
    ORDER BY id ASC
");
$stmt->execute([$userId]);
$offers = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($offers) > 0) {
    // Отмечаем в сессии, что мы уже показали акции, чтобы при рефреше они не лезли
    $_SESSION['promos_shown'] = true;
}

// Подтягиваем информацию о предметах для каждой акции
foreach ($offers as &$offer) {
    $offer['items'] = [];
    for ($i = 1; $i <= 3; $i++) {
        $itemId = (int)$offer["item_{$i}_id"];
        $itemQty = (int)$offer["item_{$i}_qty"];
        
        if ($itemId > 0 && $itemQty > 0) {
            $itemStmt = $pdo->prepare("SELECT id, name, img, rarity, type, description, damage, defense, hp_bonus FROM items WHERE id = ?");
            $itemStmt->execute([$itemId]);
            $itemData = $itemStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($itemData) {
                $itemData['quantity'] = $itemQty;
                $offer['items'][] = $itemData;
            }
        }
    }
}

echo json_encode(['status' => 'success', 'offers' => $offers]);
?>
