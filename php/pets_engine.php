<?php
session_start();
require 'db.php';
require_once 'engine_lib.php'; // Подключаем для функции recalcStats()

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

// АВТО-ОБНОВЛЕНИЕ БАЗЫ ДАННЫХ (Добавляем колонку exp, если её нет)
try {
    $pdo->exec("ALTER TABLE `user_pets` ADD COLUMN `exp` INT DEFAULT 0");
} catch(Exception $e) {}

if ($action === 'get_pets') {
    // Получаем питомцев игрока и его уровень
    $stmt = $pdo->prepare("
        SELECT up.id as up_id, up.level, IFNULL(up.exp, 0) as exp, up.is_summoned, 
               p.id as pet_id, p.name, p.img, p.base_dmg, p.base_hp, p.base_def 
        FROM user_pets up 
        JOIN pets p ON up.pet_id = p.id 
        WHERE up.user_id = ?
    ");
    $stmt->execute([$userId]);
    $pets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($pets as &$p) {
        $p['next_exp'] = $p['level'] * 100;
    }
    
    $uStmt = $pdo->prepare("SELECT level FROM users WHERE id = ?");
    $uStmt->execute([$userId]);
    $userLvl = $uStmt->fetchColumn();

    echo json_encode(['status' => 'success', 'pets' => $pets, 'user_level' => $userLvl]);
    exit;
}

if ($action === 'toggle_summon') {
    $upId = (int)$_POST['up_id'];
    $pdo->beginTransaction();
    try {
        // Ищем целевого питомца
        $pStmt = $pdo->prepare("SELECT up.* FROM user_pets up WHERE up.id = ? AND up.user_id = ? FOR UPDATE");
        $pStmt->execute([$upId, $userId]);
        $targetPet = $pStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$targetPet) throw new Exception("Питомец не найден");

        $uStmt = $pdo->prepare("SELECT level FROM users WHERE id = ? FOR UPDATE");
        $uStmt->execute([$userId]);
        $userLvl = $uStmt->fetchColumn();

        // Ищем текущего призванного питомца
        $currStmt = $pdo->prepare("SELECT id FROM user_pets WHERE user_id = ? AND is_summoned = 1 FOR UPDATE");
        $currStmt->execute([$userId]);
        $currPetId = $currStmt->fetchColumn();

        if ($targetPet['is_summoned'] == 1) {
            // ОТОЗВАТЬ
            $pdo->prepare("UPDATE user_pets SET is_summoned = 0 WHERE id = ?")->execute([$upId]);
            $msg = "Питомец отозван";
        } else {
            // ПРИЗВАТЬ
            if ($targetPet['level'] > $userLvl) throw new Exception("Уровень питомца слишком велик для вас");
            
            if ($currPetId) {
                // Сначала отзываем старого
                $pdo->prepare("UPDATE user_pets SET is_summoned = 0 WHERE id = ?")->execute([$currPetId]);
            }

            // Призываем нового
            $pdo->prepare("UPDATE user_pets SET is_summoned = 1 WHERE id = ?")->execute([$upId]);
            $msg = "Питомец призван";
        }

        // ИДЕАЛЬНЫЙ ПЕРЕРАСЧЕТ ХАРАКТЕРИСТИК (функция сама всё добавит и убавит)
        recalcStats($pdo, $userId); 
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => $msg]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

if ($action === 'feed_pet') {
    $upId = (int)$_POST['up_id'];
    
    $pdo->beginTransaction();
    try {
        $uStmt = $pdo->prepare("SELECT gold FROM users WHERE id = ? FOR UPDATE");
        $uStmt->execute([$userId]);
        $gold = (int)$uStmt->fetchColumn();
        
        if ($gold < 100) throw new Exception('Вам не хватает золота! Нужно 100 💰');
        
        $chk = $pdo->prepare("SELECT * FROM user_pets WHERE id = ? AND user_id = ? FOR UPDATE");
        $chk->execute([$upId, $userId]);
        $pet = $chk->fetch(PDO::FETCH_ASSOC);
        
        if (!$pet) throw new Exception('Питомец не найден');
        
        $pdo->prepare("UPDATE users SET gold = gold - 100 WHERE id = ?")->execute([$userId]);
        
        $expAdd = 50; 
        $newExp = $pet['exp'] + $expAdd;
        $nextExp = $pet['level'] * 100;
        
        if ($newExp >= $nextExp) {
            $pdo->prepare("UPDATE user_pets SET level = level + 1, exp = 0 WHERE id = ?")->execute([$upId]);
            // Уровень вырос - статы выросли, пересчитываем!
            recalcStats($pdo, $userId); 
        } else {
            $pdo->prepare("UPDATE user_pets SET exp = ? WHERE id = ?")->execute([$newExp, $upId]);
        }
        
        // Возвращаем обновленные данные питомца
        $nStmt = $pdo->prepare("
            SELECT up.id as up_id, up.level, IFNULL(up.exp, 0) as exp, up.is_summoned, 
                   p.id as pet_id, p.name, p.img, p.base_dmg, p.base_hp, p.base_def 
            FROM user_pets up 
            JOIN pets p ON up.pet_id = p.id 
            WHERE up.id = ?
        ");
        $nStmt->execute([$upId]);
        $updatedPet = $nStmt->fetch(PDO::FETCH_ASSOC);
        $updatedPet['next_exp'] = $updatedPet['level'] * 100;
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'pet' => $updatedPet]);
    } catch(Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}
?>
