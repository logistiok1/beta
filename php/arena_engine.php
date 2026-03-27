<?php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$time = time();

// === АВТО-ОБНОВЛЕНИЕ БАЗЫ ДАННЫХ (БЕЗОПАСНЫЙ МЕТОД ДЛЯ ЛЮБЫХ ВЕРСИЙ MYSQL) ===
try { $pdo->exec("ALTER TABLE `users` ADD COLUMN `arena_coins` int DEFAULT '0'"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `users` ADD COLUMN `arena_league` int DEFAULT '1'"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `users` ADD COLUMN `arena_points` int DEFAULT '0'"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `users` ADD COLUMN `arena_wins` int DEFAULT '0'"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `users` ADD COLUMN `arena_energy` int DEFAULT '5'"); } catch (Exception $e) {}
try { $pdo->exec("ALTER TABLE `users` ADD COLUMN `last_arena_energy` int DEFAULT '0'"); } catch (Exception $e) {}

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `user_arena_battle` (
        `user_id` int NOT NULL PRIMARY KEY,
        `opp_id` int NOT NULL,
        `opp_current_hp` int NOT NULL,
        `opp_max_hp` int NOT NULL,
        `opp_dmg` int NOT NULL,
        `opp_def` int NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Exception $e) {}

try {
    // Таблица для кулдауна в 24 часа на каждого игрока
    $pdo->exec("CREATE TABLE IF NOT EXISTS `arena_cooldowns` (
        `user_id` int NOT NULL,
        `target_id` int NOT NULL,
        `last_fight` int NOT NULL,
        PRIMARY KEY (`user_id`, `target_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Exception $e) {}

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `arena_shop` (
        `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `item_id` int NOT NULL,
        `price` int NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    if ($pdo->query("SELECT count(*) FROM arena_shop")->fetchColumn() == 0) {
        $items = $pdo->query("SELECT id FROM items LIMIT 5")->fetchAll();
        foreach ($items as $i) {
            $price = rand(10, 50);
            $pdo->exec("INSERT INTO arena_shop (item_id, price) VALUES ({$i['id']}, $price)");
        }
    }
} catch (Exception $e) {}

// Функция конфигурации лиг арены
function getArenaLeaguesConfig() {
    return [
        ['id' => 1,  'name' => 'Серебро 1', 'img' => 'league_silver_1.png'],
        ['id' => 2,  'name' => 'Серебро 2', 'img' => 'league_silver_2.png'],
        ['id' => 3,  'name' => 'Серебро 3', 'img' => 'league_silver_3.png'],
        ['id' => 4,  'name' => 'Золото 1',  'img' => 'league_gold_1.png'],
        ['id' => 5,  'name' => 'Золото 2',  'img' => 'league_gold_2.png'],
        ['id' => 6,  'name' => 'Золото 3',  'img' => 'league_gold_3.png'],
        ['id' => 7,  'name' => 'Алмаз 1',   'img' => 'league_diamond_1.png'],
        ['id' => 8,  'name' => 'Алмаз 2',   'img' => 'league_diamond_2.png'],
        ['id' => 9,  'name' => 'Алмаз 3',   'img' => 'league_diamond_3.png'],
        ['id' => 10, 'name' => 'Изумруд 1', 'img' => 'league_emerald_1.png'],
        ['id' => 11, 'name' => 'Изумруд 2', 'img' => 'league_emerald_2.png'],
        ['id' => 12, 'name' => 'Изумруд 3', 'img' => 'league_emerald_3.png']
    ];
}

// Функция доставки предметов
function deliverItemSafe($pdo, $uId, $itemId, $qty, $upg = 0, $bDmg = 0, $bHp = 0, $bDef = 0) {
    global $time;
    $iStmt = $pdo->prepare("SELECT type FROM items WHERE id = ?");
    $iStmt->execute([$itemId]);
    $itemType = $iStmt->fetchColumn();
    $isStackable = ($itemType === 'material');
    $left = $qty; $toStorage = false;
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
                $pdo->prepare("INSERT INTO inventory (user_id, item_id, quantity, is_equipped, upgrade_level, bonus_dmg, bonus_hp, bonus_def) VALUES (?, ?, ?, 0, ?, ?, ?, ?)")->execute([$uId, $itemId, $add, $upg, $bDmg, $bHp, $bDef]);
                $left -= $add;
            } else {
                $expires = $time + 86400; 
                if ($isStackable) {
                    $pdo->prepare("INSERT INTO storage (user_id, item_id, quantity, expires_at) VALUES (?, ?, ?, ?)")->execute([$uId, $itemId, $left, $expires]);
                    $left = 0;
                } else {
                    for ($i = 0; $i < $left; $i++) {
                        $pdo->prepare("INSERT INTO storage (user_id, item_id, quantity, expires_at, upgrade_level, bonus_dmg, bonus_hp, bonus_def) VALUES (?, ?, 1, ?, ?, ?, ?, ?)")->execute([$uId, $itemId, $expires, $upg, $bDmg, $bHp, $bDef]);
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
    // === ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ВСЕХ ЛИГАХ ДЛЯ МОДАЛЬНОГО ОКНА ===
    if ($action === 'get_leagues_info') {
        $uStmt = $pdo->prepare("SELECT arena_league FROM users WHERE id = ?");
        $uStmt->execute([$userId]);
        $myLeague = (int)$uStmt->fetchColumn();
        if ($myLeague < 1) $myLeague = 1;

        echo json_encode([
            'status' => 'success',
            'my_league' => $myLeague,
            'leagues' => getArenaLeaguesConfig()
        ]);
        exit;
    }

    if ($action === 'get_arena') {
        $uStmt = $pdo->prepare("SELECT level, arena_league, arena_points, arena_coins, arena_energy, last_arena_energy FROM users WHERE id = ? FOR UPDATE");
        $uStmt->execute([$userId]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);

        // ЗАЩИТА: Если столбцы только что создались, и они NULL, даем 5 энергии
        if (is_null($user['arena_energy'])) {
            $pdo->prepare("UPDATE users SET arena_energy = 5, last_arena_energy = ?, arena_league = 1, arena_points = 0, arena_wins = 0, arena_coins = 0 WHERE id = ?")->execute([$time, $userId]);
            $user['arena_energy'] = 5;
            $user['last_arena_energy'] = $time;
            $user['arena_league'] = 1;
            $user['arena_points'] = 0;
        }

        // Дополняем объект $user красивыми названиями и иконкой текущей лиги
        $leaguesConfig = getArenaLeaguesConfig();
        $currIndex = min(count($leaguesConfig) - 1, max(0, $user['arena_league'] - 1));
        $user['league_name'] = $leaguesConfig[$currIndex]['name'];
        $user['league_img'] = $leaguesConfig[$currIndex]['img'];

        // ВОССТАНОВЛЕНИЕ ЭНЕРГИИ (1 раз в 3 часа = 10800 сек)
        $energy = (int)$user['arena_energy'];
        $lastEnergyTime = (int)$user['last_arena_energy'];
        if ($lastEnergyTime == 0) $lastEnergyTime = $time;

        if ($energy < 5) {
            $diff = $time - $lastEnergyTime;
            $regen = floor($diff / 10800);
            if ($regen > 0) {
                $energy = min(5, $energy + $regen);
                $lastEnergyTime += $regen * 10800;
                $pdo->prepare("UPDATE users SET arena_energy = ?, last_arena_energy = ? WHERE id = ?")->execute([$energy, $lastEnergyTime, $userId]);
            }
        } elseif ($energy >= 5) {
            $pdo->prepare("UPDATE users SET last_arena_energy = ? WHERE id = ?")->execute([$time, $userId]);
            $lastEnergyTime = $time;
        }
        
        $user['arena_energy'] = $energy;
        $user['energy_regen_left'] = ($energy < 5) ? (10800 - ($time - $lastEnergyTime)) : 0;

        // ИСКЛЮЧАЕМ ТЕХ, КОГО БИЛИ МЕНЕЕ 24 ЧАСОВ НАЗАД
        $timeLimit = $time - 86400;
        
        $minLvl = max(1, $user['level'] - 5);
        $maxLvl = $user['level'] + 5;

        $oppStmt = $pdo->prepare("
            SELECT id, username, class_type, level, max_hp, damage, defense, arena_league 
            FROM users 
            WHERE id != ? 
            AND level BETWEEN ? AND ? 
            AND id NOT IN (SELECT target_id FROM arena_cooldowns WHERE user_id = ? AND last_fight > ?)
            ORDER BY RAND() LIMIT 20
        ");
        $oppStmt->execute([$userId, $minLvl, $maxLvl, $userId, $timeLimit]);
        $opponents = $oppStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'user' => $user, 'opponents' => $opponents]);
        exit;
    }

    if ($action === 'start_battle') {
        $oppId = (int)$_POST['opp_id'];

        $uStmt = $pdo->prepare("SELECT arena_energy FROM users WHERE id = ?");
        $uStmt->execute([$userId]);
        $userEnergy = $uStmt->fetchColumn();

        if ($userEnergy < 1) exit(json_encode(['status' => 'error', 'message' => 'Недостаточно энергии арены!']));
        
        $cdStmt = $pdo->prepare("SELECT last_fight FROM arena_cooldowns WHERE user_id = ? AND target_id = ?");
        $cdStmt->execute([$userId, $oppId]);
        $lastF = $cdStmt->fetchColumn();
        if ($lastF && ($time - $lastF < 86400)) {
            exit(json_encode(['status' => 'error', 'message' => 'С этим игроком можно драться раз в 24 часа!']));
        }

        $stmt = $pdo->prepare("SELECT id, username, class_type, level, max_hp, damage, defense FROM users WHERE id = ?");
        $stmt->execute([$oppId]);
        $opp = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$opp) exit(json_encode(['status' => 'error', 'message' => 'Противник не найден']));

        // Снимаем энергию и начинаем бой
        $pdo->prepare("UPDATE users SET arena_energy = arena_energy - 1 WHERE id = ?")->execute([$userId]);
        $pdo->prepare("REPLACE INTO user_arena_battle (user_id, opp_id, opp_current_hp, opp_max_hp, opp_dmg, opp_def) VALUES (?, ?, ?, ?, ?, ?)")->execute([$userId, $opp['id'], $opp['max_hp'], $opp['max_hp'], $opp['damage'], $opp['defense']]);

        echo json_encode(['status' => 'success', 'opp' => [
            'id' => $opp['id'],
            'name' => $opp['username'],
            'img' => "class_{$opp['class_type']}.png",
            'hp' => $opp['max_hp']
        ]]);
        exit;
    }

    if ($action === 'attack') {
        $uStmt = $pdo->prepare("SELECT hp, max_hp, damage, defense, arena_league, arena_points, arena_coins, arena_wins FROM users WHERE id = ?");
        $uStmt->execute([$userId]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);
        if ($user['hp'] <= 0) exit(json_encode(['status' => 'error', 'message' => 'Вы мертвы!']));

        $bStmt = $pdo->prepare("SELECT * FROM user_arena_battle WHERE user_id = ?");
        $bStmt->execute([$userId]);
        $battle = $bStmt->fetch(PDO::FETCH_ASSOC);
        if (!$battle) exit(json_encode(['status' => 'error', 'message' => 'Бой не найден']));

        $dmgToOpp = max(1, $user['damage'] - $battle['opp_def']);
        $newOppHp = max(0, $battle['opp_current_hp'] - $dmgToOpp);
        
        $pdo->prepare("UPDATE user_arena_battle SET opp_current_hp = ? WHERE user_id = ?")->execute([$newOppHp, $userId]);

        $res = [ 'status' => 'success', 'dmg' => $dmgToOpp, 'opp_hp' => $newOppHp, 'opp_max_hp' => $battle['opp_max_hp'], 'dead' => false, 'user_dead' => false, 'dmg_taken' => 0 ];

        if ($newOppHp <= 0) {
            $res['dead'] = true;
            $league = (int)$user['arena_league'];
            $points = (int)$user['arena_points'] + 1;
            $coins = (int)$user['arena_coins'] + 1;
            $wins = (int)$user['arena_wins'] + 1;

            if ($points >= 5) {
                $points = 0; 
                $league += 1;
                if ($league > 12) $league = 12; // Кап лиг - Изумруд 3
                
                $leaguesConfig = getArenaLeaguesConfig();
                $newLeagueName = $leaguesConfig[$league - 1]['name'];
                $res['msg'] = "<div style='color:#FFEB3B'>ПОВЫШЕНИЕ ЛИГИ! Теперь вы в лиге $newLeagueName!</div>";
            } else {
                $res['msg'] = "<div style='color:#4CAF50'>Победа! +1 Очко Лиги, +1 Монета Арены</div>";
            }
            $pdo->prepare("UPDATE users SET arena_league = ?, arena_points = ?, arena_coins = ?, arena_wins = ? WHERE id = ?")->execute([$league, $points, $coins, $wins, $userId]);
            $pdo->prepare("DELETE FROM user_arena_battle WHERE user_id = ?")->execute([$userId]);
            
            // Записываем кулдаун 24 часа
            $pdo->prepare("REPLACE INTO arena_cooldowns (user_id, target_id, last_fight) VALUES (?, ?, ?)")->execute([$userId, $battle['opp_id'], $time]);

        } else {
            $dmgToUser = max(1, $battle['opp_dmg'] - $user['defense']);
            $newUserHp = max(0, $user['hp'] - $dmgToUser);
            $pdo->prepare("UPDATE users SET hp = ? WHERE id = ?")->execute([$newUserHp, $userId]);

            $res['dmg_taken'] = $dmgToUser;
            $res['user_hp'] = $newUserHp;

            if ($newUserHp <= 0) {
                $res['user_dead'] = true;
                $league = (int)$user['arena_league'];
                $points = (int)$user['arena_points'] - 1;

                if ($points < 0) {
                    if ($league > 1) { $league -= 1; $points = 4; } 
                    else { $points = 0; }
                }
                $pdo->prepare("UPDATE users SET hp = max_hp, loc_x = 10, loc_y = 10, arena_league = ?, arena_points = ? WHERE id = ?")->execute([$league, $points, $userId]);
                $pdo->prepare("DELETE FROM user_arena_battle WHERE user_id = ?")->execute([$userId]);
                
                // Записываем кулдаун 24 часа
                $pdo->prepare("REPLACE INTO arena_cooldowns (user_id, target_id, last_fight) VALUES (?, ?, ?)")->execute([$userId, $battle['opp_id'], $time]);
            }
        }
        echo json_encode($res);
        exit;
    }

    if ($action === 'get_rating') {
        $stmt = $pdo->query("SELECT id, username, class_type, level, arena_league, arena_points, arena_wins FROM users ORDER BY arena_league DESC, arena_points DESC, arena_wins DESC LIMIT 50");
        $top = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'top' => $top]);
        exit;
    }

    if ($action === 'get_shop') {
        $cStmt = $pdo->prepare("SELECT arena_coins FROM users WHERE id = ?");
        $cStmt->execute([$userId]);
        $coins = (int)$cStmt->fetchColumn();

        $sStmt = $pdo->query("SELECT s.id as shop_id, s.price, i.* FROM arena_shop s JOIN items i ON s.item_id = i.id");
        $items = $sStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'coins' => $coins, 'items' => $items]);
        exit;
    }

    if ($action === 'buy_item') {
        $shopId = (int)$_POST['shop_id'];

        $sStmt = $pdo->prepare("SELECT * FROM arena_shop WHERE id = ? FOR UPDATE");
        $sStmt->execute([$shopId]);
        $shopItem = $sStmt->fetch(PDO::FETCH_ASSOC);
        if (!$shopItem) exit(json_encode(['status' => 'error', 'message' => 'Предмет не найден']));

        $uStmt = $pdo->prepare("SELECT arena_coins FROM users WHERE id = ? FOR UPDATE");
        $uStmt->execute([$userId]);
        $coins = (int)$uStmt->fetchColumn();

        if ($coins < $shopItem['price']) exit(json_encode(['status' => 'error', 'message' => 'Не хватает монет арены']));

        $pdo->beginTransaction();
        $pdo->prepare("UPDATE users SET arena_coins = arena_coins - ? WHERE id = ?")->execute([$shopItem['price'], $userId]);
        $toStorage = deliverItemSafe($pdo, $userId, $shopItem['item_id'], 1);
        $pdo->commit();

        echo json_encode(['status' => 'success', 'message' => 'Успешная покупка!' . ($toStorage ? ' (Отправлено в Хранилище)' : '')]);
        exit;
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => 'Ошибка: ' . $e->getMessage()]);
}
?>
