<?php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$time = time();

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `auction_lots` (
        `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `seller_id` int NOT NULL,
        `item_id` int NOT NULL,
        `type` varchar(20) NOT NULL,
        `quantity` int DEFAULT '1',
        `price` int NOT NULL,
        `upgrade_level` int DEFAULT '0',
        `bonus_dmg` int DEFAULT '0',
        `bonus_hp` int DEFAULT '0',
        `bonus_def` int DEFAULT '0',
        `created_at` int NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    $pdo->exec("ALTER TABLE `storage` ADD COLUMN IF NOT EXISTS `upgrade_level` int DEFAULT '0'");
    $pdo->exec("ALTER TABLE `storage` ADD COLUMN IF NOT EXISTS `bonus_dmg` int DEFAULT '0'");
    $pdo->exec("ALTER TABLE `storage` ADD COLUMN IF NOT EXISTS `bonus_hp` int DEFAULT '0'");
    $pdo->exec("ALTER TABLE `storage` ADD COLUMN IF NOT EXISTS `bonus_def` int DEFAULT '0'");
} catch (Exception $e) {}

function deliverItemSafe($pdo, $uId, $itemId, $qty, $upg = 0, $bDmg = 0, $bHp = 0, $bDef = 0) {
    global $time;
    $iStmt = $pdo->prepare("SELECT type FROM items WHERE id = ?");
    $iStmt->execute([$itemId]);
    $itemType = $iStmt->fetchColumn();
    $isStackable = ($itemType === 'material');

    $left = $qty;
    $toStorage = false;

    while ($left > 0) {
        $stack = false;
        if ($isStackable) {
            $sStmt = $pdo->prepare("SELECT id, quantity FROM inventory WHERE user_id = ? AND item_id = ? AND quantity < 32 AND is_equipped = 0 LIMIT 1 FOR UPDATE");
            $sStmt->execute([$uId, $itemId]);
            $stack = $sStmt->fetch();
        }

        if ($stack) {
            $add = min($left, 32 - $stack['quantity']);
            $pdo->prepare("UPDATE inventory SET quantity = quantity + ? WHERE id = ?")->execute([$add, $stack['id']]);
            $left -= $add;
        } else {
            $cStmt = $pdo->prepare("SELECT count(*) FROM inventory WHERE user_id = ? AND is_equipped = 0");
            $cStmt->execute([$uId]);
            if ((int)$cStmt->fetchColumn() < 12) {
                $add = $isStackable ? min($left, 32) : 1;
                $pdo->prepare("INSERT INTO inventory (user_id, item_id, quantity, is_equipped, upgrade_level, bonus_dmg, bonus_hp, bonus_def) VALUES (?, ?, ?, 0, ?, ?, ?, ?)")
                    ->execute([$uId, $itemId, $add, $upg, $bDmg, $bHp, $bDef]);
                $left -= $add;
            } else {
                $expires = $time + 86400; // 24 часа в хранилище
                if ($isStackable) {
                    $pdo->prepare("INSERT INTO storage (user_id, item_id, quantity, expires_at) VALUES (?, ?, ?, ?)")->execute([$uId, $itemId, $left, $expires]);
                    $left = 0;
                } else {
                    for ($i = 0; $i < $left; $i++) {
                        $pdo->prepare("INSERT INTO storage (user_id, item_id, quantity, expires_at, upgrade_level, bonus_dmg, bonus_hp, bonus_def) VALUES (?, ?, 1, ?, ?, ?, ?, ?)")
                            ->execute([$uId, $itemId, $expires, $upg, $bDmg, $bHp, $bDef]);
                    }
                    $left = 0;
                }
                $toStorage = true;
            }
        }
    }
    return $toStorage;
}

try {
    if ($action === 'get_lots') {
        $tab = $_POST['tab'] ?? 'equip';
        $sub = $_POST['sub'] ?? 'all';
        
        // ИСПРАВЛЕНИЕ: Вытягиваем все статы (description, damage...) для модалки инфо!
        $sql = "SELECT a.*, i.name, i.img, i.rarity, i.type as item_type, i.description, i.damage, i.defense, i.hp_bonus, u.username as seller_name 
                FROM auction_lots a 
                JOIN items i ON a.item_id = i.id 
                JOIN users u ON a.seller_id = u.id ";
                
        $params = [];
        
        if ($tab === 'res') {
            $sql .= "WHERE a.type = 'material' ";
        } else {
            $sql .= "WHERE a.type != 'material' ";
            if ($sub !== 'all') { $sql .= "AND i.type = ? "; $params[] = $sub; }
        }
        
        $sql .= "ORDER BY a.price ASC LIMIT 50";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['status' => 'success', 'lots' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if ($action === 'get_my_lots') {
        $stmt = $pdo->prepare("SELECT a.*, i.name, i.img, i.rarity, i.type as item_type, i.description, i.damage, i.defense, i.hp_bonus FROM auction_lots a JOIN items i ON a.item_id = i.id WHERE a.seller_id = ? ORDER BY a.id DESC");
        $stmt->execute([$userId]);
        echo json_encode(['status' => 'success', 'lots' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

    if ($action === 'sell') {
        $invId = (int)$_POST['inv_id'];
        $price = (int)$_POST['price'];
        $qtyToSell = (int)$_POST['qty'];

        if ($price <= 0 || $qtyToSell <= 0) exit(json_encode(['status' => 'error', 'message' => 'Неверные данные']));

        $pdo->beginTransaction();
        $invStmt = $pdo->prepare("SELECT inv.*, i.type as item_type FROM inventory inv JOIN items i ON inv.item_id = i.id WHERE inv.id = ? AND inv.user_id = ? AND inv.is_equipped = 0 FOR UPDATE");
        $invStmt->execute([$invId, $userId]);
        $inv = $invStmt->fetch(PDO::FETCH_ASSOC);

        if (!$inv) { $pdo->rollBack(); exit(json_encode(['status' => 'error', 'message' => 'Предмет не найден в сумке'])); }
        if ($inv['quantity'] < $qtyToSell) { $pdo->rollBack(); exit(json_encode(['status' => 'error', 'message' => 'Недостаточно количества'])); }

        $isMat = ($inv['item_type'] === 'material');
        $finalQty = $isMat ? $qtyToSell : 1;
        $totalPrice = $isMat ? ($price * $finalQty) : $price;

        if ($inv['quantity'] == $finalQty) {
            $pdo->prepare("DELETE FROM inventory WHERE id = ?")->execute([$invId]);
        } else {
            $pdo->prepare("UPDATE inventory SET quantity = quantity - ? WHERE id = ?")->execute([$finalQty, $invId]);
        }

        $pdo->prepare("INSERT INTO auction_lots (seller_id, item_id, type, quantity, price, upgrade_level, bonus_dmg, bonus_hp, bonus_def, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
            ->execute([$userId, $inv['item_id'], $inv['item_type'], $finalQty, $totalPrice, $inv['upgrade_level'], $inv['bonus_dmg'], $inv['bonus_hp'], $inv['bonus_def'], $time]);

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Выставлено на аукцион']);
        exit;
    }

    if ($action === 'buy') {
        $lotId = (int)$_POST['lot_id'];
        $buyQty = isset($_POST['qty']) ? (int)$_POST['qty'] : 1; // ИСПРАВЛЕНИЕ: Берем запрошенное кол-во
        
        if ($buyQty <= 0) exit(json_encode(['status' => 'error', 'message' => 'Неверное количество']));

        $pdo->beginTransaction();
        $lotStmt = $pdo->prepare("SELECT a.*, i.name FROM auction_lots a JOIN items i ON a.item_id = i.id WHERE a.id = ? FOR UPDATE");
        $lotStmt->execute([$lotId]);
        $lot = $lotStmt->fetch(PDO::FETCH_ASSOC);

        if (!$lot) { $pdo->rollBack(); exit(json_encode(['status' => 'error', 'message' => 'Лот уже куплен или снят'])); }
        if ($lot['seller_id'] == $userId) { $pdo->rollBack(); exit(json_encode(['status' => 'error', 'message' => 'Это ваш лот'])); }
        if ($buyQty > $lot['quantity']) { $pdo->rollBack(); exit(json_encode(['status' => 'error', 'message' => 'В лоте нет столько предметов'])); }

        // Считаем цену за то количество, которое покупают
        $unitPrice = floor($lot['price'] / $lot['quantity']);
        $totalCost = $unitPrice * $buyQty;

        $uStmt = $pdo->prepare("SELECT gold FROM users WHERE id = ? FOR UPDATE");
        $uStmt->execute([$userId]);
        $userGold = $uStmt->fetchColumn();

        if ($userGold < $totalCost) { $pdo->rollBack(); exit(json_encode(['status' => 'error', 'message' => 'Не хватает золота'])); }

        // Снимаем золото у покупателя
        $pdo->prepare("UPDATE users SET gold = gold - ? WHERE id = ?")->execute([$totalCost, $userId]);
        
        // Разбираемся с лотом (если купили всё — удаляем лот, если часть — отнимаем)
        if ($buyQty == $lot['quantity']) {
            $pdo->prepare("DELETE FROM auction_lots WHERE id = ?")->execute([$lotId]);
            $msg = "Ваш лот [{$lot['name']}" . ($lot['quantity']>1 ? " x{$lot['quantity']}" : "") . "] был полностью куплен! Получено: {$totalCost} 💰";
        } else {
            $pdo->prepare("UPDATE auction_lots SET quantity = quantity - ?, price = price - ? WHERE id = ?")->execute([$buyQty, $totalCost, $lotId]);
            $msg = "Часть вашего лота [{$lot['name']}] (x{$buyQty}) была куплена! Получено: {$totalCost} 💰";
        }

        // Начисляем золото продавцу и шлем уведомление
        $pdo->prepare("UPDATE users SET gold = gold + ? WHERE id = ?")->execute([$totalCost, $lot['seller_id']]);
        $pdo->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)")->execute([$lot['seller_id'], $msg]);

        // Отдаем товар покупателю (только то количество, что он купил)
        $toStorage = deliverItemSafe($pdo, $userId, $lot['item_id'], $buyQty, $lot['upgrade_level'], $lot['bonus_dmg'], $lot['bonus_hp'], $lot['bonus_def']);

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Успешно куплено!' . ($toStorage ? ' (Рюкзак полон, отправлено в Хранилище)' : '')]);
        exit;
    }

    if ($action === 'cancel') {
        $lotId = (int)$_POST['lot_id'];
        
        $pdo->beginTransaction();
        $lotStmt = $pdo->prepare("SELECT * FROM auction_lots WHERE id = ? AND seller_id = ? FOR UPDATE");
        $lotStmt->execute([$lotId, $userId]);
        $lot = $lotStmt->fetch(PDO::FETCH_ASSOC);

        if (!$lot) { $pdo->rollBack(); exit(json_encode(['status' => 'error', 'message' => 'Лот не найден'])); }

        $pdo->prepare("DELETE FROM auction_lots WHERE id = ?")->execute([$lotId]);
        $toStorage = deliverItemSafe($pdo, $userId, $lot['item_id'], $lot['quantity'], $lot['upgrade_level'], $lot['bonus_dmg'], $lot['bonus_hp'], $lot['bonus_def']);

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Лот снят!' . ($toStorage ? ' (Отправлено в Хранилище)' : '')]);
        exit;
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Ошибка: ' . $e->getMessage()]);
}
?>