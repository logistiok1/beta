<?php
session_start();
require 'db.php';
ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'get_skills') {
    $u = $pdo->prepare("SELECT class_type, skill_points, skill_1_lvl, skill_2_lvl, skill_3_lvl FROM users WHERE id = ?");
    $u->execute([$userId]);
    $data = $u->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success', 
        'class_type' => $data['class_type'], 
        'sp' => $data['skill_points'],
        'levels' => [1 => $data['skill_1_lvl'], 2 => $data['skill_2_lvl'], 3 => $data['skill_3_lvl']]
    ]);
}

if ($action === 'upgrade_skill') {
    $skillId = (int)$_POST['skill_id'];
    $col = "skill_" . $skillId . "_lvl";
    
    $u = $pdo->prepare("SELECT skill_points, $col as lvl FROM users WHERE id = ?");
    $u->execute([$userId]);
    $data = $u->fetch();
    
    $nextLvl = $data['lvl'] + 1;
    $cost = $nextLvl;
    
    if ($data['skill_points'] >= $cost && $data['lvl'] < 10) {
        $pdo->prepare("UPDATE users SET skill_points = skill_points - ?, $col = $col + 1 WHERE id = ?")->execute([$cost, $userId]);
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Не хватает SP или макс. уровень']);
    }
}

// Специальный обработчик урона от УМЕНИЙ (чтобы не путать с обычной автоатакой)
if ($action === 'skill_attack') {
    $mobId = (int)$_POST['mob_id'];
    $dmg = (float)$_POST['damage'];
    
    $m = $pdo->prepare("SELECT hp, max_hp, drop_gold, drop_exp FROM mobs WHERE id = ?");
    $m->execute([$mobId]);
    $mob = $m->fetch();
    
    if (!$mob) exit(json_encode(['status' => 'error', 'message' => 'Моб мертв']));
    
    $newHp = max(0, $mob['hp'] - $dmg);
    $pdo->prepare("UPDATE mobs SET hp = ? WHERE id = ?")->execute([$newHp, $mobId]);
    
    if ($newHp <= 0) {
        // Моб убит умением
        $pdo->prepare("DELETE FROM mobs WHERE id = ?")->execute([$mobId]);
        $pdo->prepare("UPDATE users SET gold = gold + ?, exp = exp + ? WHERE id = ?")->execute([$mob['drop_gold'], $mob['drop_exp'], $userId]);
        echo json_encode(['status' => 'success', 'dead' => true, 'mob_hp' => 0, 'mob_max_hp' => $mob['max_hp'], 'loot' => ['gold' => $mob['drop_gold'], 'exp' => $mob['drop_exp']]]);
    } else {
        echo json_encode(['status' => 'success', 'dead' => false, 'mob_hp' => $newHp, 'mob_max_hp' => $mob['max_hp']]);
    }
}
?>