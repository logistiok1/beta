<?php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error', 'message' => 'Auth required']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$time = time();

// === ПОЛУЧИТЬ ИНФО О ПОДЗЕМЕЛЬЕ ===
if ($action === 'get_info') {
    $dungeonId = (int)$_POST['dungeon_id'];
    
    // 1. Данные данжа
    $stmt = $pdo->prepare("SELECT * FROM dungeons WHERE id = ?");
    $stmt->execute([$dungeonId]);
    $dungeon = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$dungeon) exit(json_encode(['status' => 'error', 'message' => 'Подземелье не найдено']));
    
    // 2. Статус Босса (Жив/Мертв)
    $isDead = false;
    $respawnIn = 0;
    
    // Если босс убит и время респавна еще не прошло
    if ($dungeon['death_time'] > 0) {
        if ($time < ($dungeon['death_time'] + $dungeon['respawn_time'])) {
            $isDead = true;
            $respawnIn = ($dungeon['death_time'] + $dungeon['respawn_time']) - $time;
        } else {
            // Время прошло, воскрешаем
            $pdo->prepare("UPDATE dungeons SET death_time = 0, boss_hp = boss_max_hp WHERE id = ?")->execute([$dungeonId]);
            $dungeon['boss_hp'] = $dungeon['boss_max_hp']; // Обновляем для вывода
        }
    }
    
    // 3. Кулдаун игрока (если умер)
    $cdStmt = $pdo->prepare("SELECT cooldown_end FROM dungeon_cooldowns WHERE user_id = ? AND dungeon_id = ?");
    $cdStmt->execute([$userId, $dungeonId]);
    $cd = $cdStmt->fetchColumn();
    
    $userCooldown = 0;
    if ($cd && $cd > $time) {
        $userCooldown = $cd - $time;
    } else if ($cd) {
        // Кулдаун прошел, удаляем запись
        $pdo->prepare("DELETE FROM dungeon_cooldowns WHERE user_id = ? AND dungeon_id = ?")->execute([$userId, $dungeonId]);
    }
    
    // 4. Дроп (список картинок и шансов)
    $dropsStmt = $pdo->prepare("
        SELECT dd.chance, i.img, i.name, i.rarity 
        FROM dungeon_drops dd 
        JOIN items i ON dd.item_id = i.id 
        WHERE dd.dungeon_id = ?
    ");
    $dropsStmt->execute([$dungeonId]);
    $drops = $dropsStmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'dungeon' => [
            'name' => $dungeon['name'],
            'boss_name' => $dungeon['boss_name'],
            'boss_img' => $dungeon['boss_img'],
            'boss_hp' => $dungeon['boss_hp'],
            'boss_max_hp' => $dungeon['boss_max_hp'],
            'attack_interval' => $dungeon['attack_interval']
        ],
        'is_dead' => $isDead,
        'respawn_in' => $respawnIn,
        'user_cooldown' => $userCooldown,
        'drops' => $drops
    ]);
}

// === АТАКА БОССА ===
if ($action === 'attack_boss') {
    $dungeonId = (int)$_POST['dungeon_id'];
    
    $pdo->beginTransaction();
    try {
        // Проверки
        $uStmt = $pdo->prepare("SELECT * FROM users WHERE id = ? FOR UPDATE"); $uStmt->execute([$userId]); $user = $uStmt->fetch();
        $dStmt = $pdo->prepare("SELECT * FROM dungeons WHERE id = ? FOR UPDATE"); $dStmt->execute([$dungeonId]); $boss = $dStmt->fetch();
        
        // Кулдаун игрока
        $cdStmt = $pdo->prepare("SELECT cooldown_end FROM dungeon_cooldowns WHERE user_id = ? AND dungeon_id = ?");
        $cdStmt->execute([$userId, $dungeonId]);
        if ($cdStmt->fetchColumn() > $time) throw new Exception("Вы восстанавливаете силы");

        // Босс мертв?
        if ($boss['death_time'] > 0 && ($time < $boss['death_time'] + $boss['respawn_time'])) throw new Exception("Босс мертв");

        // 1. Урон по Боссу
        $dmg = max(1, $user['damage'] - $boss['boss_defense']);
        $newBossHp = max(0, $boss['boss_hp'] - $dmg);
        
        $bossDead = ($newBossHp <= 0);
        $loot = null;
        
        if ($bossDead) {
            // === ПОБЕДА ===
            $gold = rand($boss['gold_min'], $boss['gold_max']);
            $exp = rand($boss['exp_min'], $boss['exp_max']);
            
            // Начисление игроку
            $newExp = $user['exp'] + $exp;
            if ($newExp >= $user['next_level_exp']) {
                $user['level']++; $newExp = 0; $user['next_level_exp'] = (int)($user['next_level_exp'] * 1.5);
                $user['max_hp'] += 10; $user['damage']++;
                $pdo->prepare("UPDATE users SET level=?, next_level_exp=?, max_hp=?, damage=? WHERE id=?")->execute([$user['level'], $user['next_level_exp'], $user['max_hp'], $user['damage'], $userId]);
            }
            $pdo->prepare("UPDATE users SET gold = gold + ?, exp = ? WHERE id = ?")->execute([$gold, $newExp, $userId]);
            
            // Смерть босса
            $pdo->prepare("UPDATE dungeons SET boss_hp = 0, death_time = ? WHERE id = ?")->execute([$time, $dungeonId]);
            
            // Очистка кулдауна игрока (победителей не судят)
            $pdo->prepare("DELETE FROM dungeon_cooldowns WHERE user_id = ? AND dungeon_id = ?")->execute([$userId, $dungeonId]);
            
            // Чат Системы: Убийство
            $sysMsg = "Система: Герой {$user['username']} сразил {$boss['boss_name']}! Следующее появление через " . gmdate("i:s", $boss['respawn_time']);
            $pdo->prepare("INSERT INTO chat (user_id, username, message) VALUES (0, 'SYSTEM', ?)")->execute([$sysMsg]);
            
            // Дроп предметов
            $dropsStmt = $pdo->prepare("SELECT dd.chance, i.id, i.name, i.rarity FROM dungeon_drops dd JOIN items i ON dd.item_id = i.id WHERE dd.dungeon_id = ?");
            $dropsStmt->execute([$dungeonId]);
            $dropTxt = "";
            
            foreach($dropsStmt->fetchAll() as $d) {
                if(rand(1, 100) <= $d['chance']) {
                    $pdo->prepare("INSERT INTO inventory (user_id, item_id, quantity) VALUES (?, ?, 1)")->execute([$userId, $d['id']]);
                    $dropTxt .= "<br>+" . $d['name'];
                    
                    // Легендарный дроп в чат
                    if ($d['rarity'] == 'legendary' || $d['rarity'] == 'mythic') {
                        $legMsg = "Система: {$user['username']} получает предмет <span style='color:orange; font-weight:bold;'>{$d['name']}</span> за убийство босса!";
                        $pdo->prepare("INSERT INTO chat (user_id, username, message) VALUES (0, 'SYSTEM', ?)")->execute([$legMsg]);
                    }
                }
            }
            
            $loot = ['gold'=>$gold, 'exp'=>$exp, 'msg'=>$dropTxt];
            $respawnTime = $boss['respawn_time'];
            
        } else {
            // Обновляем HP босса
            $pdo->prepare("UPDATE dungeons SET boss_hp = ? WHERE id = ?")->execute([$newBossHp, $dungeonId]);
        }
        
        $pdo->commit();
        echo json_encode([
            'status' => 'success',
            'dmg' => $dmg,
            'boss_hp' => $newBossHp,
            'boss_max_hp' => $boss['boss_max_hp'],
            'dead' => $bossDead,
            'loot' => $loot,
            'respawn_time' => $bossDead ? $boss['respawn_time'] : 0
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// === ОТВЕТНЫЙ УДАР БОССА ===
if ($action === 'boss_hit') {
    $dungeonId = (int)$_POST['dungeon_id'];
    
    $dStmt = $pdo->prepare("SELECT boss_damage, death_time, respawn_time FROM dungeons WHERE id = ?"); 
    $dStmt->execute([$dungeonId]); 
    $boss = $dStmt->fetch();
    
    // Если босс мертв, он не бьет
    if ($boss['death_time'] > 0 && ($time < $boss['death_time'] + $boss['respawn_time'])) {
        exit(json_encode(['status' => 'error', 'message' => 'Босс мертв']));
    }
    
    $uStmt = $pdo->prepare("SELECT hp, defense FROM users WHERE id = ?");
    $uStmt->execute([$userId]);
    $user = $uStmt->fetch();
    
    $dmg = max(1, $boss['boss_damage'] - $user['defense']);
    $newHp = max(0, $user['hp'] - $dmg);
    
    $pdo->prepare("UPDATE users SET hp = ? WHERE id = ?")->execute([$newHp, $userId]);
    
    if ($newHp <= 0) {
        // Игрок умер -> Кулдаун 5 минут (300 сек)
        $cooldownEnd = $time + 300;
        $pdo->prepare("REPLACE INTO dungeon_cooldowns (user_id, dungeon_id, cooldown_end) VALUES (?, ?, ?)")
            ->execute([$userId, $dungeonId, $cooldownEnd]);
            
        // Восстанавливаем 10 HP
        $pdo->prepare("UPDATE users SET hp = 10 WHERE id = ?")->execute([$userId]);
    }
    
    echo json_encode([
        'status' => 'success',
        'dmg' => $dmg,
        'user_hp' => $newHp,
        'died' => ($newHp <= 0)
    ]);
}
?>