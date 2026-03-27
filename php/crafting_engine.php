<?php
session_start();
require 'db.php';
require_once 'engine_lib.php'; // Подключаем чтобы видеть giveItem

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

if ($action === 'get_recipes') {
    $category = $_POST['category'] ?? 'weapon'; 
    $stmt = $pdo->prepare("SELECT r.*, i.name, i.img, i.rarity, i.type, i.description, i.damage, i.defense, i.hp_bonus FROM craft_recipes r JOIN items i ON r.result_item_id = i.id WHERE r.category = ?");
    $stmt->execute([$category]);
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $uStmt = $pdo->prepare("SELECT level, gold FROM users WHERE id = ?");
    $uStmt->execute([$userId]);
    $user = $uStmt->fetch(PDO::FETCH_ASSOC);

    foreach ($recipes as &$rec) {
        // ИСПРАВЛЕНО: craft_materials и material_item_id
        $mStmt = $pdo->prepare("SELECT cm.amount as needed, i.id as item_id, i.name, i.img, (SELECT SUM(quantity) FROM inventory WHERE user_id = ? AND item_id = i.id AND is_equipped = 0) as have FROM craft_materials cm JOIN items i ON cm.material_item_id = i.id WHERE cm.recipe_id = ?");
        $mStmt->execute([$userId, $rec['id']]);
        $rec['mats'] = $mStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach($rec['mats'] as &$m) { if(!$m['have']) $m['have'] = 0; }
        
        $rec['can_craft'] = true;
        if ($user['gold'] < $rec['gold_cost'] || $user['level'] < $rec['min_level']) $rec['can_craft'] = false;
        foreach ($rec['mats'] as $m) { if ($m['have'] < $m['needed']) $rec['can_craft'] = false; }
    }
    echo json_encode(['status' => 'success', 'recipes' => $recipes]);
}

if ($action === 'craft') {
    $recipeId = (int)$_POST['recipe_id'];
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM craft_recipes WHERE id = ? FOR UPDATE");
        $stmt->execute([$recipeId]);
        $recipe = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$recipe) throw new Exception("Рецепт не найден");

        $uStmt = $pdo->prepare("SELECT level, gold FROM users WHERE id = ?");
        $uStmt->execute([$userId]);
        $user = $uStmt->fetch(PDO::FETCH_ASSOC);

        if ($user['level'] < $recipe['min_level']) throw new Exception("Маленький уровень");
        if ($user['gold'] < $recipe['gold_cost']) throw new Exception("Мало золота");

        // ИСПРАВЛЕНО: craft_materials и material_item_id
        $mStmt = $pdo->prepare("SELECT material_item_id, amount FROM craft_materials WHERE recipe_id = ?");
        $mStmt->execute([$recipeId]);
        $mats = $mStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($mats as $m) {
            // ИСПРАВЛЕНО: material_item_id
            $itemId = $m['material_item_id'];
            $needed = $m['amount'];

            $invStmt = $pdo->prepare("SELECT id, quantity FROM inventory WHERE user_id = ? AND item_id = ? AND is_equipped = 0 FOR UPDATE");
            $invStmt->execute([$userId, $itemId]);
            $stacks = $invStmt->fetchAll(PDO::FETCH_ASSOC);

            $totalHave = 0;
            foreach ($stacks as $s) $totalHave += $s['quantity'];

            if ($totalHave < $needed) throw new Exception("Не хватает ресурсов (ID: $itemId)");

            $leftToTake = $needed;
            foreach ($stacks as $s) {
                if ($leftToTake <= 0) break;
                $take = min($leftToTake, $s['quantity']);
                $newQty = $s['quantity'] - $take;
                
                if ($newQty <= 0) {
                    $pdo->prepare("DELETE FROM inventory WHERE id = ?")->execute([$s['id']]);
                } else {
                    $pdo->prepare("UPDATE inventory SET quantity = ? WHERE id = ?")->execute([$newQty, $s['id']]);
                }
                $leftToTake -= $take;
            }
        }

        $pdo->prepare("UPDATE users SET gold = gold - ? WHERE id = ?")->execute([$recipe['gold_cost'], $userId]);
        
        // ВЫДАЕМ ЧЕРЕЗ НОВУЮ СИСТЕМУ
        $dest = giveItem($pdo, $userId, $recipe['result_item_id'], 1);

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => "Создано! $dest"]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>