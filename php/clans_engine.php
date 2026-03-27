<?php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$username = $_SESSION['username'];
$action = $_POST['action'] ?? '';

// === ПОЛУЧИТЬ МОЙ КЛАН ===
if ($action === 'get_my_clan') {
    $uStmt = $pdo->prepare("SELECT clan_id FROM users WHERE id = ?");
    $uStmt->execute([$userId]);
    $user = $uStmt->fetch();

    if (!$user['clan_id']) {
        echo json_encode(['status' => 'no_clan']);
        exit;
    }

    $cStmt = $pdo->prepare("SELECT * FROM clans WHERE id = ?");
    $cStmt->execute([$user['clan_id']]);
    $clan = $cStmt->fetch();

    $cntStmt = $pdo->prepare("SELECT id, username FROM users WHERE clan_id = ?");
    $cntStmt->execute([$clan['id']]);
    $members = $cntStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Максимум участников зависит от Ратуши: 10 + (Уровень Ратуши * 2)
    $maxMembers = 10 + ($clan['building_hall'] * 2);

    echo json_encode([
        'status' => 'success',
        'clan' => $clan,
        'members' => $members,
        'members_count' => count($members),
        'max_members' => $maxMembers,
        'is_leader' => ($clan['leader_id'] == $userId)
    ]);
}

// === ПОЛУЧИТЬ ВСЕ КЛАНЫ ===
if ($action === 'get_all_clans') {
    $stmt = $pdo->query("
        SELECT c.id, c.name, c.is_open, c.building_hall,
        (SELECT COUNT(*) FROM users WHERE clan_id = c.id) as members_count
        FROM clans c
    ");
    $clans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($clans as &$c) {
        $c['max_members'] = 10 + ($c['building_hall'] * 2);
    }
    
    echo json_encode(['status' => 'success', 'clans' => $clans]);
}

// === СОЗДАТЬ КЛАН ===
if ($action === 'create_clan') {
    $name = htmlspecialchars($_POST['name']);
    $pdo->beginTransaction();
    try {
        $u = $pdo->prepare("SELECT gold, clan_id FROM users WHERE id = ? FOR UPDATE");
        $u->execute([$userId]);
        $user = $u->fetch();

        if ($user['clan_id']) throw new Exception("Вы уже в клане");
        if ($user['gold'] < 1000) throw new Exception("Нужно 1000 золота");

        $pdo->prepare("UPDATE users SET gold = gold - 1000 WHERE id = ?")->execute([$userId]);
        $pdo->prepare("INSERT INTO clans (name, leader_id, gold, is_open) VALUES (?, ?, 0, 1)")->execute([$name, $userId]);
        $clanId = $pdo->lastInsertId();
        $pdo->prepare("UPDATE users SET clan_id = ? WHERE id = ?")->execute([$clanId, $userId]);

        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// === ВСТУПИТЬ В КЛАН ===
if ($action === 'join_clan') {
    $clanId = (int)$_POST['clan_id'];
    $pdo->beginTransaction();
    try {
        $u = $pdo->prepare("SELECT clan_id FROM users WHERE id = ? FOR UPDATE");
        $u->execute([$userId]);
        if ($u->fetch()['clan_id']) throw new Exception("Вы уже в клане");

        $c = $pdo->prepare("SELECT * FROM clans WHERE id = ? FOR UPDATE");
        $c->execute([$clanId]);
        $clan = $c->fetch();

        if (!$clan || $clan['is_open'] == 0) throw new Exception("Клан закрыт");

        $mStmt = $pdo->prepare("SELECT count(*) FROM users WHERE clan_id = ?");
        $mStmt->execute([$clanId]);
        $mCount = $mStmt->fetchColumn();

        $maxMembers = 10 + ($clan['building_hall'] * 2);
        if ($mCount >= $maxMembers) throw new Exception("Клан переполнен");

        // ВЫДАЕМ БОНУСЫ ИГРОКУ ОТ ПОСТРОЕК КЛАНА!
        $bonus_dmg = $clan['building_armory'] * 0.5;
        $bonus_hp = $clan['building_barracks'] * 5;

        $pdo->prepare("UPDATE users SET clan_id = ?, damage = damage + ?, max_hp = max_hp + ?, hp = hp + ? WHERE id = ?")
            ->execute([$clanId, $bonus_dmg, $bonus_hp, $bonus_hp, $userId]);

        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// === ВЫЙТИ ИЗ КЛАНА ===
if ($action === 'leave_clan') {
    $pdo->beginTransaction();
    try {
        $u = $pdo->prepare("SELECT clan_id FROM users WHERE id = ? FOR UPDATE");
        $u->execute([$userId]);
        $clanId = $u->fetchColumn();

        if (!$clanId) throw new Exception("Вы не в клане");

        $c = $pdo->prepare("SELECT leader_id, building_armory, building_barracks FROM clans WHERE id = ?");
        $c->execute([$clanId]);
        $clan = $c->fetch();

        if ($clan['leader_id'] == $userId) throw new Exception("Лидер не может выйти, сначала передайте лидерство");

        // ЗАБИРАЕМ БОНУСЫ ПОСТРОЕК КЛАНА У ИГРОКА!
        $bonus_dmg = $clan['building_armory'] * 0.5;
        $bonus_hp = $clan['building_barracks'] * 5;

        $pdo->prepare("UPDATE users SET clan_id = NULL, damage = GREATEST(1, damage - ?), max_hp = GREATEST(10, max_hp - ?), hp = LEAST(hp, GREATEST(10, max_hp - ?)) WHERE id = ?")
            ->execute([$bonus_dmg, $bonus_hp, $bonus_hp, $userId]);

        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// === ВЫГНАТЬ ИЗ КЛАНА ===
if ($action === 'kick_member') {
    $targetId = (int)$_POST['target_id'];
    $pdo->beginTransaction();
    try {
        $u = $pdo->prepare("SELECT clan_id FROM users WHERE id = ?");
        $u->execute([$userId]);
        $clanId = $u->fetchColumn();

        $c = $pdo->prepare("SELECT leader_id, building_armory, building_barracks FROM clans WHERE id = ?");
        $c->execute([$clanId]);
        $clan = $c->fetch();

        if ($clan['leader_id'] != $userId) throw new Exception("Только лидер может выгонять");

        // ЗАБИРАЕМ БОНУСЫ У ИЗГНАННОГО ИГРОКА!
        $bonus_dmg = $clan['building_armory'] * 0.5;
        $bonus_hp = $clan['building_barracks'] * 5;

        $pdo->prepare("UPDATE users SET clan_id = NULL, damage = GREATEST(1, damage - ?), max_hp = GREATEST(10, max_hp - ?), hp = LEAST(hp, GREATEST(10, max_hp - ?)) WHERE id = ? AND clan_id = ?")
            ->execute([$bonus_dmg, $bonus_hp, $bonus_hp, $targetId, $clanId]);

        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// === ВЗНОС В КАЗНУ ===
if ($action === 'donate') {
    $amount = (int)$_POST['amount'];
    if ($amount <= 0) exit(json_encode(['status' => 'error']));

    $pdo->beginTransaction();
    try {
        $u = $pdo->prepare("SELECT gold, clan_id FROM users WHERE id = ? FOR UPDATE");
        $u->execute([$userId]);
        $user = $u->fetch();

        if (!$user['clan_id']) throw new Exception("Вы не в клане");
        if ($user['gold'] < $amount) throw new Exception("Не хватает золота");

        $pdo->prepare("UPDATE users SET gold = gold - ? WHERE id = ?")->execute([$amount, $userId]);
        $pdo->prepare("UPDATE clans SET gold = gold + ? WHERE id = ?")->execute([$amount, $user['clan_id']]);

        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

// === СМЕНА СТАТУСА (ОТКРЫТ/ЗАКРЫТ) ===
if ($action === 'toggle_status') {
    $status = (int)$_POST['is_open'];
    $u = $pdo->prepare("SELECT clan_id FROM users WHERE id = ?");
    $u->execute([$userId]);
    $clanId = $u->fetchColumn();

    $c = $pdo->prepare("SELECT leader_id FROM clans WHERE id = ?");
    $c->execute([$clanId]);
    if ($c->fetchColumn() == $userId) {
        $pdo->prepare("UPDATE clans SET is_open = ? WHERE id = ?")->execute([$status, $clanId]);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
}

// === УЛУЧШИТЬ ПОСТРОЙКУ ===
if ($action === 'upgrade_building') {
    $type = $_POST['build_type']; // hall, armory, barracks
    $validTypes = ['hall', 'armory', 'barracks'];
    
    if (!in_array($type, $validTypes)) exit(json_encode(['status' => 'error', 'message' => 'Неверный тип постройки']));

    $pdo->beginTransaction();
    try {
        $u = $pdo->prepare("SELECT clan_id FROM users WHERE id = ?");
        $u->execute([$userId]);
        $clanId = $u->fetchColumn();
        if (!$clanId) throw new Exception("Вы не в клане");

        $c = $pdo->prepare("SELECT * FROM clans WHERE id = ? FOR UPDATE");
        $c->execute([$clanId]);
        $clan = $c->fetch();

        if ($clan['leader_id'] != $userId) throw new Exception("Только лидер может строить");

        $col = "building_" . $type;
        $currentLvl = (int)$clan[$col];
        $cost = 1000 + ($currentLvl * 1000);

        if ($clan['gold'] < $cost) throw new Exception("В казне не хватает золота ($cost)");

        // Снимаем золото и повышаем уровень
        $pdo->prepare("UPDATE clans SET gold = gold - ?, $col = $col + 1 WHERE id = ?")->execute([$cost, $clanId]);

        // ВЫДАЕМ ГЛОБАЛЬНЫЕ БОНУСЫ ВСЕМ УЧАСТНИКАМ КЛАНА В РЕАЛЬНОМ ВРЕМЕНИ
        if ($type === 'armory') {
            // Оружейная: +0.5 урона каждому соклановцу
            $pdo->prepare("UPDATE users SET damage = damage + 0.5 WHERE clan_id = ?")->execute([$clanId]);
        } 
        elseif ($type === 'barracks') {
            // Казарма: +5 здоровья каждому соклановцу
            $pdo->prepare("UPDATE users SET max_hp = max_hp + 5, hp = hp + 5 WHERE clan_id = ?")->execute([$clanId]);
        }

        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>