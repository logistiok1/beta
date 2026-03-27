<?php
session_start();
require 'db.php';
require_once 'engine_lib.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) { echo json_encode(['status' => 'error']); exit; }

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$currentTime = time();

$stmt = $pdo->prepare("SELECT daily_day, last_daily_claim FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch();

$lastDate = date('Y-m-d', $user['last_daily_claim']);
$todayDate = date('Y-m-d', $currentTime);
$canClaim = ($lastDate !== $todayDate);

if ($action === 'get_daily_info') {
    // Берем данные строго из твоей БД
    $rewards = $pdo->query("SELECT * FROM daily_rewards ORDER BY day_number ASC")->fetchAll(PDO::FETCH_ASSOC);
    
    if (!$rewards) {
        echo json_encode(['status' => 'error', 'message' => 'В базе данных нет наград (таблица daily_rewards пуста)']);
        exit;
    }

    // Подтягиваем красивые названия и картинки для фронтенда
    foreach ($rewards as &$r) {
        if ($r['reward_type'] === 'item') {
            $iStmt = $pdo->prepare("SELECT name, img FROM items WHERE id = ?");
            $iStmt->execute([$r['reward_value']]);
            $itemData = $iStmt->fetch(PDO::FETCH_ASSOC);
            if ($itemData) {
                $r['name'] = $itemData['name'];
                $r['img'] = $itemData['img'];
            } else {
                $r['name'] = 'Секретный предмет';
                $r['img'] = 'no_image.png';
            }
        } else {
            $r['name'] = $r['reward_value'] . ' Золота';
            $r['img'] = 'coin.png';
        }
    }

    echo json_encode([
        'status' => 'success', 
        'current_day' => (int)$user['daily_day'] == 0 ? 1 : (int)$user['daily_day'], 
        'can_claim' => $canClaim, 
        'rewards' => $rewards
    ]);
    exit;
}

if ($action === 'claim_reward') {
    if (!$canClaim) exit(json_encode(['status' => 'error', 'message' => 'Уже получено сегодня']));

    $currentDay = (int)$user['daily_day'];
    if ($currentDay < 1) $currentDay = 1;

    $rStmt = $pdo->prepare("SELECT * FROM daily_rewards WHERE day_number = ?");
    $rStmt->execute([$currentDay]);
    $reward = $rStmt->fetch(PDO::FETCH_ASSOC);

    // Если игрок дошел до конца списка (например, день 8, а наград в БД всего 7), сбрасываем на 1
    if (!$reward) {
        $currentDay = 1;
        $rStmt->execute([1]);
        $reward = $rStmt->fetch(PDO::FETCH_ASSOC);
        if (!$reward) exit(json_encode(['status' => 'error', 'message' => 'Награды не настроены']));
    }

    $pdo->beginTransaction();
    try {
        $msg = "";
        $isItem = false;
        
        if ($reward['reward_type'] === 'gold') {
            $pdo->prepare("UPDATE users SET gold = gold + ? WHERE id = ?")->execute([$reward['reward_value'], $userId]);
            $msg = "Получено: " . $reward['reward_value'] . " Золота";
        } elseif ($reward['reward_type'] === 'item') {
            $dest = giveItem($pdo, $userId, $reward['reward_value'], 1);
            $iName = $pdo->prepare("SELECT name FROM items WHERE id = ?");
            $iName->execute([$reward['reward_value']]);
            $itemName = $iName->fetchColumn();
            $msg = "Вы получили награду: " . $itemName . ($dest ? " ($dest)" : "");
            $isItem = true;
        }

        // Узнаем, какой день последний в твоей таблице
        $maxDay = $pdo->query("SELECT MAX(day_number) FROM daily_rewards")->fetchColumn();
        
        // Переводим на следующий день или сбрасываем на 1
        $nextDay = ($currentDay >= $maxDay) ? 1 : $currentDay + 1;
        
        $pdo->prepare("UPDATE users SET daily_day = ?, last_daily_claim = ? WHERE id = ?")->execute([$nextDay, $currentTime, $userId]);
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => $msg, 'is_item' => $isItem]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>
