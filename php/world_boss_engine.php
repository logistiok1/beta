<?php
session_start();
require 'db.php';
require 'engine_lib.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$time = time();

try {
    if ($action === 'get_boss_info') {
        $bossId = (int)$_POST['boss_id'];
        
        $stmt = $pdo->prepare("SELECT * FROM world_bosses WHERE id = ?");
        $stmt->execute([$bossId]);
        $boss = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$boss) throw new Exception("Босс не найден");
        
        // ПОДТЯГИВАЕМ ТВОЕ ХП, КЛАСС И УМЕНИЯ!
        $uStmt = $pdo->prepare("SELECT username, class_type, hp, max_hp, skill_1_lvl, skill_2_lvl, skill_3_lvl FROM users WHERE id = ?");
        $uStmt->execute([$userId]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);
        
        $dStmt = $pdo->prepare("SELECT d.chance, i.* FROM world_boss_drops d JOIN items i ON d.item_id = i.id WHERE d.boss_id = ?");
        $dStmt->execute([$bossId]);
        $drops = $dStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'boss' => $boss, 'drops' => $drops, 'user' => $user]);
        exit;
    }

    // НОВОЕ: Обработка урона от умений (доты, прямые удары скиллом), без ответного удара
    if ($action === 'wb_skill_attack') {
        $bossId = (int)$_POST['boss_id'];
        $dmg = (float)$_POST['damage'];
        
        $pdo->beginTransaction();
        $bStmt = $pdo->prepare("SELECT * FROM world_bosses WHERE id = ? FOR UPDATE");
        $bStmt->execute([$bossId]);
        $boss = $bStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$boss || $boss['hp'] <= 0) {
            $pdo->rollBack();
            exit(json_encode(['status' => 'error', 'message' => 'Босс уже мертв']));
        }
        
        $newBossHp = max(0, $boss['hp'] - $dmg);
        $bossDead = ($newBossHp <= 0);
        
        $pdo->prepare("UPDATE world_bosses SET hp = ? WHERE id = ?")->execute([$newBossHp, $bossId]);
        
        $loot = null;
        if ($bossDead) {
            $pdo->prepare("UPDATE world_bosses SET death_time = ? WHERE id = ?")->execute([$time, $bossId]);
            
            $uStmt = $pdo->prepare("SELECT username FROM users WHERE id = ?");
            $uStmt->execute([$userId]);
            $username = $uStmt->fetchColumn();
            
            $msg = "Система: Герой <span style='color:gold;'>{$username}</span> добил Мирового Босса <span style='color:#ff5252; font-weight:bold;'>{$boss['name']}</span> с помощью умения!";
            $pdo->prepare("INSERT INTO global_chat (user_id, channel, message, created_at) VALUES (0, 'general', ?, NOW())")->execute([$msg]);
            
            $gold = $boss['level'] * 50;
            $exp = $boss['level'] * 100;
            $pdo->prepare("UPDATE users SET gold = gold + ?, exp = exp + ? WHERE id = ?")->execute([$gold, $exp, $userId]);
            
            $dropTxt = "";
            $dStmt = $pdo->prepare("SELECT item_id, chance FROM world_boss_drops WHERE boss_id = ?");
            $dStmt->execute([$bossId]);
            foreach($dStmt->fetchAll() as $d) {
                if(rand(1, 100) <= $d['chance']) {
                    $destMsg = giveItem($pdo, $userId, $d['item_id'], 1);
                    $iName = $pdo->prepare("SELECT name FROM items WHERE id = ?"); $iName->execute([$d['item_id']]);
                    $dropTxt .= "<br>ЭПИК ДРОП: " . $iName->fetchColumn() . ($destMsg ? " ($destMsg)" : "");
                }
            }
            
            $loot = ['msg' => "<div style='color:#f1c40f'>Мировой Босс повержен!</div><br>Получено Золото: {$gold}<br>Получен Опыт: {$exp}" . $dropTxt];
        }
        
        $pdo->commit();
        echo json_encode([
            'status' => 'success',
            'boss_hp' => $newBossHp,
            'boss_max_hp' => $boss['max_hp'],
            'boss_dead' => $bossDead,
            'loot' => $loot
        ]);
        exit;
    }

    if ($action === 'attack_boss') {
        $bossId = (int)$_POST['boss_id'];
        $isStunned = isset($_POST['is_stunned']) ? (int)$_POST['is_stunned'] : 0;
        
        $pdo->beginTransaction();
        
        $uStmt = $pdo->prepare("SELECT username, hp, max_hp, damage, defense FROM users WHERE id = ? FOR UPDATE");
        $uStmt->execute([$userId]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user['hp'] <= 0) throw new Exception("Вы мертвы");
        
        $bStmt = $pdo->prepare("SELECT * FROM world_bosses WHERE id = ? FOR UPDATE");
        $bStmt->execute([$bossId]);
        $boss = $bStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$boss || $boss['hp'] <= 0) throw new Exception("Босс уже мертв");
        
        $userDmg = $user['damage'];
        $finalUserDmg = max(1, $userDmg - $boss['defense']);
        $newBossHp = max(0, $boss['hp'] - $finalUserDmg);
        $bossDead = ($newBossHp <= 0);
        
        $pdo->prepare("UPDATE world_bosses SET hp = ? WHERE id = ?")->execute([$newBossHp, $bossId]);
        
        $userTaken = 0;
        $newUserHp = $user['hp'];
        $userDead = false;
        $loot = null;
        
        if ($bossDead) {
            $pdo->prepare("UPDATE world_bosses SET death_time = ? WHERE id = ?")->execute([$time, $bossId]);
            
            $msg = "Система: Герой <span style='color:gold;'>{$user['username']}</span> добил Мирового Босса <span style='color:#ff5252; font-weight:bold;'>{$boss['name']}</span>!";
            $pdo->prepare("INSERT INTO global_chat (user_id, channel, message, created_at) VALUES (0, 'general', ?, NOW())")->execute([$msg]);
            
            $gold = $boss['level'] * 50;
            $exp = $boss['level'] * 100;
            $pdo->prepare("UPDATE users SET gold = gold + ?, exp = exp + ? WHERE id = ?")->execute([$gold, $exp, $userId]);
            
            $dropTxt = "";
            $dStmt = $pdo->prepare("SELECT item_id, chance FROM world_boss_drops WHERE boss_id = ?");
            $dStmt->execute([$bossId]);
            foreach($dStmt->fetchAll() as $d) {
                if(rand(1, 100) <= $d['chance']) {
                    $destMsg = giveItem($pdo, $userId, $d['item_id'], 1);
                    $iName = $pdo->prepare("SELECT name FROM items WHERE id = ?"); $iName->execute([$d['item_id']]);
                    $dropTxt .= "<br>ЭПИК ДРОП: " . $iName->fetchColumn() . ($destMsg ? " ($destMsg)" : "");
                }
            }
            
            $loot = ['msg' => "<div style='color:#f1c40f'>Мировой Босс повержен!</div><br>Получено Золото: {$gold}<br>Получен Опыт: {$exp}" . $dropTxt];
            
        } else {
            // Если босс в стане, то он пропускает ход (не бьет в ответ)
            if ($isStunned === 1) {
                $userTaken = 0;
                $newUserHp = $user['hp'];
                $userDead = false;
            } else {
                $bossHit = rand($boss['min_damage'], $boss['max_damage']);
                $userTaken = max(1, $bossHit - $user['defense']);
                $newUserHp = max(0, $user['hp'] - $userTaken);
                $userDead = ($newUserHp <= 0);
                
                if ($userDead) {
                    $pdo->prepare("UPDATE users SET hp = max_hp, loc_x = 10, loc_y = 10 WHERE id = ?")->execute([$userId]);
                } else {
                    $pdo->prepare("UPDATE users SET hp = ? WHERE id = ?")->execute([$newUserHp, $userId]);
                }
            }
        }
        
        $pdo->commit();
        
        echo json_encode([
            'status' => 'success',
            'dmg' => $finalUserDmg,
            'dmg_taken' => $userTaken,
            'boss_hp' => $newBossHp,
            'boss_max_hp' => $boss['max_hp'],
            'user_hp' => $newUserHp,
            'user_max_hp' => $user['max_hp'],
            'user_dead' => $userDead,
            'boss_dead' => $bossDead,
            'loot' => $loot
        ]);
        
    }
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>