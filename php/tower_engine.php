<?php
session_start();
require 'db.php';
require_once 'engine_lib.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$currentTime = time();

// === АВТО-ИСПРАВЛЕНИЕ И СОЗДАНИЕ ТАБЛИЦ ===
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `tower_levels` (
        `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `level_number` int NOT NULL,
        `mob_name` varchar(50) NOT NULL,
        `mob_img` varchar(50) NOT NULL,
        `mob_hp` int NOT NULL,
        `mob_damage` int NOT NULL,
        `mob_defense` int NOT NULL,
        `reward_gold_min` int NOT NULL,
        `reward_gold_max` int NOT NULL,
        `reward_exp_min` int NOT NULL,
        `reward_exp_max` int NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `tower_drops` (
        `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `level_id` int NOT NULL,
        `item_id` int NOT NULL,
        `chance` int NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `user_tower_progress` (
        `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `user_id` int NOT NULL,
        `level_number` int NOT NULL,
        `is_completed` tinyint DEFAULT '0',
        `cooldown_until` int DEFAULT '0',
        `current_mob_hp` int DEFAULT '0'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    
    // ПАТЧИ ДЛЯ СТАРЫХ БАЗ ДАННЫХ: Добавляем колонки, если их нет (гасит ошибки 1054)
    try { $pdo->exec("ALTER TABLE `user_tower_progress` ADD COLUMN `current_mob_hp` int DEFAULT '0';"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE `user_tower_progress` ADD COLUMN `cooldown_until` int DEFAULT '0';"); } catch (Exception $e) {}
    
} catch (Exception $e) {}

try {
    if ($action === 'get_levels') {
        $levels = $pdo->query("SELECT * FROM tower_levels ORDER BY level_number ASC")->fetchAll(PDO::FETCH_ASSOC);
        $stmt = $pdo->prepare("SELECT * FROM user_tower_progress WHERE user_id = ?");
        $stmt->execute([$userId]);
        $progressRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $userProgress = [];
        $maxCompleted = 0;
        foreach ($progressRaw as $p) {
            $userProgress[$p['level_number']] = $p;
            if ($p['is_completed'] == 1 && $p['level_number'] > $maxCompleted) {
                $maxCompleted = $p['level_number'];
            }
        }

        $result = [];
        foreach ($levels as $lvl) {
            $num = $lvl['level_number'];
            
            $dStmt = $pdo->prepare("SELECT i.name, i.img, i.type, td.chance FROM tower_drops td JOIN items i ON td.item_id = i.id WHERE td.level_id = ? OR td.level_id = ?");
            $dStmt->execute([$lvl['id'], $num]);
            $drops = $dStmt->fetchAll(PDO::FETCH_ASSOC);

            $lvlData = [
                'id' => $lvl['id'],
                'level_number' => $num,
                'mob_name' => $lvl['mob_name'],
                'mob_img' => $lvl['mob_img'],
                'drops' => $drops,
                'is_completed' => false,
                'is_locked' => true,
                'cooldown_left' => 0
            ];

            if ($num <= $maxCompleted + 1) $lvlData['is_locked'] = false;
            
            if (isset($userProgress[$num]) && $userProgress[$num]['is_completed'] == 1) {
                $lvlData['is_completed'] = true;
            }
            
            if (!$lvlData['is_locked']) {
                if (isset($userProgress[$num]) && $userProgress[$num]['cooldown_until'] > $currentTime) {
                    $lvlData['cooldown_left'] = $userProgress[$num]['cooldown_until'] - $currentTime;
                }
            }
            $result[] = $lvlData;
        }
        echo json_encode(['status' => 'success', 'levels' => $result]);
        exit;
    }

    if ($action === 'start_battle') {
        $lvlNum = (int)$_POST['level_number'];
        
        $stmt = $pdo->prepare("SELECT * FROM tower_levels WHERE level_number = ?");
        $stmt->execute([$lvlNum]);
        $mob = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$mob) exit(json_encode(['status' => 'error', 'message' => 'Уровень не найден']));

        $pStmt = $pdo->prepare("SELECT * FROM user_tower_progress WHERE user_id = ? AND level_number = ?");
        $pStmt->execute([$userId, $lvlNum]);
        $prog = $pStmt->fetch(PDO::FETCH_ASSOC);

        if ($prog) {
            if ($prog['cooldown_until'] > $currentTime) exit(json_encode(['status' => 'error', 'message' => 'В откате, ждите!']));
        }

        if (!$prog) {
            $pdo->prepare("INSERT INTO user_tower_progress (user_id, level_number, current_mob_hp) VALUES (?, ?, ?)")->execute([$userId, $lvlNum, $mob['mob_hp']]);
        } else {
            $pdo->prepare("UPDATE user_tower_progress SET current_mob_hp = ? WHERE id = ?")->execute([$mob['mob_hp'], $prog['id']]);
        }

        echo json_encode(['status' => 'success', 'mob' => [
            'level_number' => $mob['level_number'],
            'mob_hp' => $mob['mob_hp'],
            'mob_img' => $mob['mob_img'],
            'mob_name' => $mob['mob_name']
        ]]);
        exit;
    }

    // === ОБРАБОТКА УРОНА ОТ СКИЛЛОВ ===
    if ($action === 'skill_attack') {
        $lvlNum = (int)$_POST['level_number'];
        $dmg = (float)$_POST['damage'];
        
        $stmt = $pdo->prepare("SELECT * FROM tower_levels WHERE level_number = ?");
        $stmt->execute([$lvlNum]);
        $mob = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$mob) exit(json_encode(['status' => 'error', 'message' => 'Уровень не найден']));

        $pStmt = $pdo->prepare("SELECT * FROM user_tower_progress WHERE user_id = ? AND level_number = ?");
        $pStmt->execute([$userId, $lvlNum]);
        $prog = $pStmt->fetch(PDO::FETCH_ASSOC);

        if (!$prog || $prog['cooldown_until'] > $currentTime) exit(json_encode(['status' => 'error', 'message' => 'В откате']));
        
        $mobCurrentHp = $prog['current_mob_hp'];
        if ($mobCurrentHp <= 0) $mobCurrentHp = $mob['mob_hp']; 

        $mobCurrentHp = max(0, $mobCurrentHp - $dmg);
        $pdo->prepare("UPDATE user_tower_progress SET current_mob_hp = ? WHERE id = ?")->execute([$mobCurrentHp, $prog['id']]);

        $result = [
            'status' => 'success',
            'mob_hp' => $mobCurrentHp,
            'mob_max_hp' => $mob['mob_hp'],
            'dead' => false
        ];

        if ($mobCurrentHp <= 0) {
            $result['dead'] = true;
            $gold = rand($mob['reward_gold_min'], $mob['reward_gold_max']);
            $exp = rand($mob['reward_exp_min'], $mob['reward_exp_max']);
            
            $dStmt = $pdo->prepare("SELECT item_id, chance FROM tower_drops WHERE level_id = ? OR level_id = ?");
            $dStmt->execute([$mob['id'], $mob['level_number']]);
            $rewards = $dStmt->fetchAll();
            
            $lootMsg = "";
            $pdo->prepare("UPDATE users SET gold = gold + ?, exp = exp + ? WHERE id = ?")->execute([$gold, $exp, $userId]);
            
            if ($rewards) {
                foreach ($rewards as $r) {
                    if (mt_rand(1, 100) <= $r['chance']) {
                        $dest = giveItem($pdo, $userId, $r['item_id'], 1);
                        $n = $pdo->prepare("SELECT name FROM items WHERE id = ?");
                        $n->execute([$r['item_id']]);
                        $lootMsg .= "<br>Получено: " . $n->fetchColumn() . " ($dest)";
                    }
                }
            }
            
            $cd = $currentTime + 86400; 
            $pdo->prepare("UPDATE user_tower_progress SET is_completed = 1, cooldown_until = ? WHERE id = ?")->execute([$cd, $prog['id']]);
            $result['loot'] = ['gold' => $gold, 'exp' => $exp, 'msg' => $lootMsg];
        }
        
        echo json_encode($result);
        exit;
    }

    if ($action === 'attack') {
        $lvlNum = (int)$_POST['level_number'];
        $isStunned = (int)($_POST['is_stunned'] ?? 0);
        
        $stmt = $pdo->prepare("SELECT * FROM tower_levels WHERE level_number = ?");
        $stmt->execute([$lvlNum]);
        $mob = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$mob) exit(json_encode(['status' => 'error', 'message' => 'Уровень не найден']));

        $uStmt = $pdo->prepare("SELECT hp, max_hp, damage, defense FROM users WHERE id = ?");
        $uStmt->execute([$userId]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);
        if ($user['hp'] <= 0) exit(json_encode(['status' => 'error', 'message' => 'Вы мертвы!']));

        $pStmt = $pdo->prepare("SELECT * FROM user_tower_progress WHERE user_id = ? AND level_number = ?");
        $pStmt->execute([$userId, $lvlNum]);
        $prog = $pStmt->fetch(PDO::FETCH_ASSOC);

        if (!$prog || $prog['cooldown_until'] > $currentTime) exit(json_encode(['status' => 'error', 'message' => 'В откате']));
        
        $mobCurrentHp = $prog['current_mob_hp'];
        if ($mobCurrentHp <= 0) $mobCurrentHp = $mob['mob_hp']; 

        $dmgToMob = max(1, $user['damage'] - $mob['mob_defense']);
        $mobCurrentHp = max(0, $mobCurrentHp - $dmgToMob);

        $pdo->prepare("UPDATE user_tower_progress SET current_mob_hp = ? WHERE id = ?")->execute([$mobCurrentHp, $prog['id']]);

        $result = [
            'status' => 'success',
            'dmg' => $dmgToMob,
            'mob_hp' => $mobCurrentHp,
            'mob_max_hp' => $mob['mob_hp'],
            'dead' => false,
            'user_dead' => false,
            'dmg_taken' => 0
        ];

        if ($mobCurrentHp <= 0) {
            $result['dead'] = true;
            $gold = rand($mob['reward_gold_min'], $mob['reward_gold_max']);
            $exp = rand($mob['reward_exp_min'], $mob['reward_exp_max']);
            
            $dStmt = $pdo->prepare("SELECT item_id, chance FROM tower_drops WHERE level_id = ? OR level_id = ?");
            $dStmt->execute([$mob['id'], $mob['level_number']]);
            $rewards = $dStmt->fetchAll();
            
            $lootMsg = "";
            $pdo->prepare("UPDATE users SET gold = gold + ?, exp = exp + ? WHERE id = ?")->execute([$gold, $exp, $userId]);
            
            if ($rewards) {
                foreach ($rewards as $r) {
                    if (mt_rand(1, 100) <= $r['chance']) {
                        $dest = giveItem($pdo, $userId, $r['item_id'], 1);
                        $n = $pdo->prepare("SELECT name FROM items WHERE id = ?");
                        $n->execute([$r['item_id']]);
                        $lootMsg .= "<br>Получено: " . $n->fetchColumn() . " ($dest)";
                    }
                }
            }
            
            $cd = $currentTime + 86400;
            $pdo->prepare("UPDATE user_tower_progress SET is_completed = 1, cooldown_until = ? WHERE id = ?")->execute([$cd, $prog['id']]);
            $result['loot'] = ['gold' => $gold, 'exp' => $exp, 'msg' => $lootMsg];
            
        } else {
            // Если босс в стане - он не наносит урон в ответ!
            if ($isStunned === 1) {
                $result['dmg_taken'] = 0;
                $result['user_hp'] = $user['hp'];
            } else {
                $dmgToUser = max(1, $mob['mob_damage'] - $user['defense']);
                $newHp = max(0, $user['hp'] - $dmgToUser);
                $pdo->prepare("UPDATE users SET hp = ? WHERE id = ?")->execute([$newHp, $userId]);

                $result['dmg_taken'] = $dmgToUser;
                $result['user_hp'] = $newHp;

                if ($newHp <= 0) {
                    $result['user_dead'] = true;
                    $cd = $currentTime + 86400;
                    $pdo->prepare("UPDATE user_tower_progress SET cooldown_until = ?, current_mob_hp = ? WHERE id = ?")->execute([$cd, $mob['mob_hp'], $prog['id']]);
                    $pdo->prepare("UPDATE users SET hp = max_hp, loc_x = 10, loc_y = 10 WHERE id = ?")->execute([$userId]);
                }
            }
        }
        echo json_encode($result);
        exit;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'DB Error: ' . $e->getMessage()]);
}
?>
