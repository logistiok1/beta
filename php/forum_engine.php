<?php
session_start();
require 'db.php';

ini_set('display_errors', 0); error_reporting(E_ALL); header('Content-Type: application/json');
if (!isset($_SESSION['user_id'])) exit(json_encode(['status' => 'error', 'message' => 'Auth required']));

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';
$time = time();

// Получаем инфу о текущем игроке
$uStmt = $pdo->prepare("SELECT username, role FROM users WHERE id = ?");
$uStmt->execute([$userId]);
$user = $uStmt->fetch(PDO::FETCH_ASSOC);
$role = $user['role'] ?? 'player';

// ФУНКЦИЯ ДЛЯ ВСТАВКИ КАРТИНОК ПРЕДМЕТОВ В ТЕКСТ ФОРУМА (ИСПРАВЛЕНО ОТКРЫТИЕ)
function formatForumText($text, $pdo) {
    // 1. Безопасно экранируем весь текст
    $text = htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
    // 2. Переносы строк
    $text = nl2br($text);
    // 3. Ищем теги [item:ID] и заменяем их на красивые плашки
    $text = preg_replace_callback('/\[item:(\d+)\]/', function($m) use ($pdo) {
        $id = (int)$m[1];
        $stmt = $pdo->prepare("SELECT * FROM items WHERE id = ?");
        $stmt->execute([$id]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        if($item) {
            // Безопасно упаковываем данные предмета в data-item
            $json = htmlspecialchars(json_encode($item), ENT_QUOTES, 'UTF-8');
            $dir = $item['type'] === 'material' ? 'res' : 'shmot';
            
            // Используем this.getAttribute('data-item') для надежного открытия модалки
            return "<div class='forum-inline-item' data-item='{$json}' onclick='if(typeof showItemModal === \"function\") showItemModal(JSON.parse(this.getAttribute(\"data-item\")), \"readonly\")'><img src='images/{$dir}/{$item['img']}'> <span>{$item['name']}</span></div>";
        }
        return "<span style='color:#e74c3c;'>[Предмет не найден]</span>";
    }, $text);
    return $text;
}

try {
    if ($action === 'get_categories') {
        $stmt = $pdo->query("SELECT * FROM forum_categories ORDER BY id ASC");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'role' => $role, 'categories' => $categories]);
        exit;
    }

    if ($action === 'create_category') {
        if ($role !== 'admin') exit(json_encode(['status' => 'error', 'message' => 'Нет прав']));
        $title = trim($_POST['title']);
        $desc = trim($_POST['desc'] ?? '');
        if (!$title) exit(json_encode(['status' => 'error', 'message' => 'Пустое название']));

        $stmt = $pdo->prepare("INSERT INTO forum_categories (title, description, created_at) VALUES (?, ?, ?)");
        $stmt->execute([$title, $desc, $time]);
        echo json_encode(['status' => 'success']);
        exit;
    }

    if ($action === 'toggle_category') {
        if ($role !== 'admin') exit(json_encode(['status' => 'error', 'message' => 'Нет прав']));
        $catId = (int)$_POST['category_id'];
        $stmt = $pdo->prepare("SELECT can_create_topics FROM forum_categories WHERE id = ?");
        $stmt->execute([$catId]);
        $curr = (int)$stmt->fetchColumn();
        $newStatus = $curr == 1 ? 0 : 1;
        $pdo->prepare("UPDATE forum_categories SET can_create_topics = ? WHERE id = ?")->execute([$newStatus, $catId]);
        echo json_encode(['status' => 'success', 'new_status' => $newStatus]);
        exit;
    }

    if ($action === 'get_topics') {
        $catId = (int)$_POST['category_id'];
        $stmt = $pdo->prepare("
            SELECT t.id, t.title, t.created_at, t.likes, u.id as user_id, u.username, u.role 
            FROM forum_topics t 
            JOIN users u ON t.user_id = u.id 
            WHERE t.category_id = ? 
            ORDER BY t.id DESC
        ");
        $stmt->execute([$catId]);
        $topics = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'topics' => $topics]);
        exit;
    }

    if ($action === 'create_topic') {
        $catId = (int)$_POST['category_id'];
        $title = trim($_POST['title']);
        $message = trim($_POST['message']);
        
        if (!$title || !$message) exit(json_encode(['status' => 'error', 'message' => 'Заполните все поля']));

        $cStmt = $pdo->prepare("SELECT can_create_topics FROM forum_categories WHERE id = ?");
        $cStmt->execute([$catId]);
        if ((int)$cStmt->fetchColumn() == 0 && $role !== 'admin') {
            exit(json_encode(['status' => 'error', 'message' => 'В этом разделе запрещено создавать темы']));
        }

        $tStmt = $pdo->prepare("INSERT INTO forum_topics (category_id, user_id, title, message, created_at) VALUES (?, ?, ?, ?, ?)");
        $tStmt->execute([$catId, $userId, $title, $message, $time]);
        echo json_encode(['status' => 'success']);
        exit;
    }

    if ($action === 'get_messages') {
        $topicId = (int)$_POST['topic_id'];
        
        // Получаем саму ТЕМУ (как главное сообщение)
        $tStmt = $pdo->prepare("SELECT t.*, u.id as author_id, u.username, u.role FROM forum_topics t JOIN users u ON t.user_id = u.id WHERE t.id = ?");
        $tStmt->execute([$topicId]);
        $topic = $tStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$topic) exit(json_encode(['status' => 'error', 'message' => 'Тема не найдена']));
        
        // Проверяем, лайкнул ли Я эту тему
        $lChk1 = $pdo->prepare("SELECT id FROM forum_likes WHERE user_id = ? AND target_type = 'topic' AND target_id = ?");
        $lChk1->execute([$userId, $topicId]);
        $topic['is_liked'] = $lChk1->fetch() ? true : false;
        $topic['message_parsed'] = formatForumText($topic['message'], $pdo);

        // Получаем ОТВЕТЫ
        $stmt = $pdo->prepare("
            SELECT m.*, u.id as author_id, u.username, u.role 
            FROM forum_messages m 
            JOIN users u ON m.user_id = u.id 
            WHERE m.topic_id = ? 
            ORDER BY m.id ASC
        ");
        $stmt->execute([$topicId]);
        $messagesRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $messages = [];
        foreach ($messagesRaw as $m) {
            $lChk = $pdo->prepare("SELECT id FROM forum_likes WHERE user_id = ? AND target_type = 'message' AND target_id = ?");
            $lChk->execute([$userId, $m['id']]);
            $m['is_liked'] = $lChk->fetch() ? true : false;
            $m['message_parsed'] = formatForumText($m['message'], $pdo);
            $messages[] = $m;
        }

        echo json_encode(['status' => 'success', 'topic' => $topic, 'messages' => $messages]);
        exit;
    }

    if ($action === 'post_message') {
        $topicId = (int)$_POST['topic_id'];
        $message = trim($_POST['message']);
        if (!$message) exit(json_encode(['status' => 'error', 'message' => 'Пустое сообщение']));

        $tStmt = $pdo->prepare("SELECT is_closed FROM forum_topics WHERE id = ?");
        $tStmt->execute([$topicId]);
        if ((int)$tStmt->fetchColumn() == 1 && $role !== 'admin') {
            exit(json_encode(['status' => 'error', 'message' => 'Тема закрыта']));
        }

        $stmt = $pdo->prepare("INSERT INTO forum_messages (topic_id, user_id, message, created_at) VALUES (?, ?, ?, ?)");
        $stmt->execute([$topicId, $userId, $message, $time]);
        echo json_encode(['status' => 'success']);
        exit;
    }

    if ($action === 'like_post') {
        $targetType = $_POST['target_type']; 
        $targetId = (int)$_POST['target_id'];
        
        if (!in_array($targetType, ['topic', 'message'])) exit(json_encode(['status' => 'error']));

        $table = $targetType === 'topic' ? 'forum_topics' : 'forum_messages';

        $check = $pdo->prepare("SELECT id FROM forum_likes WHERE user_id = ? AND target_type = ? AND target_id = ?");
        $check->execute([$userId, $targetType, $targetId]);
        
        if ($check->fetch()) {
            // УБИРАЕМ ЛАЙК
            $pdo->prepare("DELETE FROM forum_likes WHERE user_id = ? AND target_type = ? AND target_id = ?")->execute([$userId, $targetType, $targetId]);
            $pdo->prepare("UPDATE $table SET likes = GREATEST(0, likes - 1) WHERE id = ?")->execute([$targetId]);
            echo json_encode(['status' => 'success', 'liked' => false]);
        } else {
            // СТАВИМ ЛАЙК
            $pdo->prepare("INSERT INTO forum_likes (user_id, target_type, target_id) VALUES (?, ?, ?)")->execute([$userId, $targetType, $targetId]);
            $pdo->prepare("UPDATE $table SET likes = likes + 1 WHERE id = ?")->execute([$targetId]);
            echo json_encode(['status' => 'success', 'liked' => true]);
        }
        exit;
    }

    if ($action === 'get_all_items') {
        $stmt = $pdo->query("SELECT id, name, type, img, rarity FROM items ORDER BY id DESC");
        echo json_encode(['status' => 'success', 'items' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        exit;
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
