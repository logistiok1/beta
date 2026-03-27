<?php
// php/buy_promotion.php
session_start();
require_once 'db.php';
require_once 'engine_lib.php'; 

if (!isset($_SESSION['user_id'])) {
    die(json_encode(['status' => 'error', 'message' => 'Not logged in']));
}

$userId = $_SESSION['user_id'];
$offerId = (isset($_POST['offer_id'])) ? (int)$_POST['offer_id'] : 0;

try {
    $pdo->beginTransaction();
    
    // Проверяем, не купил ли он её уже (защита от двойного клика)
    $checkStmt = $pdo->prepare("SELECT 1 FROM user_purchased_offers WHERE user_id = ? AND offer_id = ?");
    $checkStmt->execute([$userId, $offerId]);
    if ($checkStmt->fetchColumn()) {
        throw new Exception("Вы уже приобрели этот набор!");
    }

    // Блокируем акцию для проверки
    $stmt = $pdo->prepare("SELECT * FROM login_offers WHERE id = ? AND is_active = 1 FOR UPDATE");
    $stmt->execute([$offerId]);
    $offer = $stmt->fetch();
    
    if (!$offer) throw new Exception("Акция не найдена или уже завершена!");
    
    $cost = (int)$offer['new_price'];
    
    // Проверяем золото игрока
    $uStmt = $pdo->prepare("SELECT gold FROM users WHERE id = ? FOR UPDATE");
    $uStmt->execute([$userId]);
    $user = $uStmt->fetch();
    
    if ($user['gold'] < $cost) throw new Exception("Недостаточно золота!");
    
    // Списываем золото
    $pdo->prepare("UPDATE users SET gold = gold - ? WHERE id = ?")->execute([$cost, $userId]);
    
    // Выдаем предметы
    $msg = "";
    for ($i = 1; $i <= 3; $i++) {
        $itemId = (int)$offer["item_{$i}_id"];
        $itemQty = (int)$offer["item_{$i}_qty"];
        if ($itemId > 0 && $itemQty > 0) {
            $res = giveItem($pdo, $userId, $itemId, $itemQty);
            if ($res) $msg .= " " . $res;
        }
    }
    
    // ЗАПИСЫВАЕМ ПОКУПКУ, ЧТОБЫ АКЦИЯ БОЛЬШЕ НЕ ПОЯВЛЯЛАСЬ
    $pdo->prepare("INSERT INTO user_purchased_offers (user_id, offer_id) VALUES (?, ?)")->execute([$userId, $offerId]);
    
    $pdo->commit();
    echo json_encode(['status' => 'success', 'message' => 'Покупка успешна!' . $msg]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
