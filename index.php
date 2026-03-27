<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>RPG Mobile: Legend</title>
    
    <link rel="stylesheet" href="css/main.css?v=128">
    <link rel="stylesheet" href="css/auth.css?v=128">
    <link rel="stylesheet" href="css/game_ui.css?v=128">
    <link rel="stylesheet" href="css/joystick.css?v=128">
    <link rel="stylesheet" href="css/menu.css?v=128">
    <link rel="stylesheet" href="css/profile.css?v=200021"> <link rel="stylesheet" href="css/profile_achievements.css?v=200021">
    <link rel="stylesheet" href="css/inventory.css?v=128">
    <link rel="stylesheet" href="css/items.css?v=128">
    <link rel="stylesheet" href="css/npcs.css?v=128">
    <link rel="stylesheet" href="css/quests.css?v=128">
    <link rel="stylesheet" href="css/teleports.css?v=128">
    <link rel="stylesheet" href="css/notifications.css?v=128">
    <link rel="stylesheet" href="css/daily.css?v=128">
    <link rel="stylesheet" href="css/friends.css?v=128">
    <link rel="stylesheet" href="css/pm.css?v=128">
    <link rel="stylesheet" href="css/clans.css?v=128">
    <link rel="stylesheet" href="css/clan_buildings.css?v=128">
    <link rel="stylesheet" href="css/gathering.css?v=128">
    <link rel="stylesheet" href="css/blacksmith_modern.css?v=129">
    <link rel="stylesheet" href="css/crafting.css?v=128">
    <link rel="stylesheet" href="css/dungeons.css?v=128">
    <link rel="stylesheet" href="css/loader.css?v=128">
    <link rel="stylesheet" href="css/tower.css?v=128">
    <link rel="stylesheet" href="css/storage.css?v=128">
    <link rel="stylesheet" href="css/combat_ui.css?v=128">
    <link rel="stylesheet" href="css/skills.css?v=128">
    <link rel="stylesheet" href="css/achievements.css?v=128">
    <link rel="stylesheet" href="css/pets.css?v=2"> 
    <link rel="stylesheet" href="css/auction.css?v=128">
    <link rel="stylesheet" href="css/arena.css?v=128">
    <link rel="stylesheet" href="css/arena_leagues.css?v=1">
    <link rel="stylesheet" href="css/premium_shop.css?v=128">
    <link rel="stylesheet" href="css/chat.css?v=128"> 
    <link rel="stylesheet" href="css/wings.css?v=1">
    <link rel="stylesheet" href="css/forum.css?v=1">
    <link rel="stylesheet" href="css/world_boss.css?v=1">
    <link rel="stylesheet" href="css/settings.css?v=1"> 
    
    <link rel="stylesheet" href="css/promotions.css?v=1"> 

</head>
<body>

    <div id="loading-screen">
        <div class="loader-logo">RPG LEGEND</div>
        <div class="loader-bar-bg"><div id="loader-bar" class="loader-bar-fill"></div></div>
        <div id="loader-text" class="loader-text">Загрузка мира...</div>
    </div>

    <div id="screen-main" class="screen active auth-bg">
        <img src="images/ui/logo.png" class="main-logo" alt="RPG Legend Logo">
        
        <div style="display: flex; flex-direction: column; align-items: center; width: 100%; gap: 0;">
            <div class="img-btn-wrap" onclick="startRegistration()">
                <img src="images/ui/btn_start.png" class="img-button" alt="Начать игру">
            </div>
            
            <div class="img-btn-wrap" onclick="showScreen('screen-login')">
                <img src="images/ui/btn_login.png" class="img-button" alt="Вход">
            </div>
        </div>
    </div>

    <div id="screen-login" class="screen auth-bg">
        <h2 style="color: gold; text-shadow: 0 0 5px #000; margin-bottom: 20px;">Вход</h2>
        <form id="login-form" onsubmit="event.preventDefault(); performLogin();" style="display:flex; flex-direction:column; align-items:center; width:100%;">
            <input type="text" name="nickname" placeholder="Никнейм">
            <input type="password" name="password" placeholder="Пароль">
            
            <div class="img-btn-wrap" onclick="performLogin()" style="margin-top: 10px;">
                <img src="images/ui/btn_enter.png" class="img-button" alt="Войти">
            </div>
        </form>
        
        <div class="img-btn-wrap" onclick="showScreen('screen-main')" style="margin-top: 10px;">
            <img src="images/ui/btn_back.png" class="img-button" alt="Назад">
        </div>
    </div>

    <div id="screen-class" class="screen auth-bg">
        <h2 style="color: gold; text-shadow: 0 0 5px #000; margin-bottom: 20px;">Выберите класс</h2>
        <div class="class-selection">
            <div class="class-card" onclick="selectClass('warrior', this)"><img src="images/class_warrior.png"><p>Воин</p></div>
            <div class="class-card" onclick="selectClass('mage', this)"><img src="images/class_mage.png"><p>Маг</p></div>
        </div>
        <div class="img-btn-wrap" onclick="confirmClass()">
            <img src="images/ui/btn_next.png" class="img-button" alt="Далее">
        </div>
    </div>
    
    <div id="screen-nickname" class="screen auth-bg">
        <h2 style="color: gold; text-shadow: 0 0 5px #000; margin-bottom: 20px;">Имя героя</h2>
        <input type="text" id="reg-nick" placeholder="Введите имя">
        <div class="img-btn-wrap" onclick="confirmNick()">
            <img src="images/ui/btn_next.png" class="img-button" alt="Далее">
        </div>
    </div>
    
    <div id="screen-password" class="screen auth-bg">
        <h2 style="color: gold; text-shadow: 0 0 5px #000; margin-bottom: 20px;">Пароль</h2>
        <input type="password" id="reg-pass" placeholder="Придумайте пароль">
        <div class="img-btn-wrap" onclick="finishRegistration()">
            <img src="images/ui/btn_battle.png" class="img-button" alt="В БОЙ!">
        </div>
    </div>

    <div id="game-screen" class="screen">
        <div id="world-map"><div id="player-char"></div></div>
        
        <div class="ui-layer">
            <div class="ui-top-left">
                <button class="menu-btn" onclick="openMenu()">
                    <img src="images/ui/btn_menu.png" alt="Меню" onerror="this.src='images/ui/no_image.png'">
                </button>
                <button class="chat-btn" onclick="toggleChat()">
                    <img src="images/ui/btn_chat.png" alt="Чат" onerror="this.src='images/ui/no_image.png'">
                </button>
                <button class="forum-btn-ui" onclick="openForum()">
                    <img src="images/ui/btn_forum.png" alt="Форум" onerror="this.src='images/ui/no_image.png'">
                </button>
            </div>
            
            <div class="hud-container">
                <div class="hud-bars">
                    <div class="bar-wrap"><div id="hud-hp-bar" class="hp-fill"></div><div class="hud-text" id="hud-hp-text">100/100</div></div>
                    <div class="bar-wrap"><div id="hud-xp-bar" class="xp-fill"></div><div class="hud-text" id="hud-xp-text">0/100</div></div>
                    
                    <div class="hud-bottom-actions">
                        <div class="hud-gold">
                            <span id="hud-gold-amount">0</span> 
                            <img src="images/ui/coin.png" alt="G" onerror="this.src='images/ui/no_image.png'">
                        </div>
                    </div>
                </div>
                
                <div class="hud-avatar-wrapper">
                    <div class="hud-avatar-block" onclick="openProfile()">
                        <div class="hud-avatar-img"><img id="hud-avatar" src="images/ui/no_image.png"></div>
                        <div id="hud-level" class="hud-level-badge">1</div>
                    </div>
                    
                    <button id="btn-toggle-hud" class="hud-toggle-btn" onclick="toggleHudButtons()">▲</button>
                    
                    <div id="hud-buttons-collapse" class="hud-buttons-collapse show">
                        <div class="hud-buttons-row">
                            <button id="btn-daily" class="daily-btn" onclick="openDailyRewards()">
                                <img src="images/ui/btn_daily.png" class="hud-btn-img" onerror="this.src='images/ui/no_image.png'">
                            </button>
                            <button id="btn-notifications" class="notification-btn" onclick="openNotifications()">
                                <img src="images/ui/btn_notif.png" class="hud-btn-img" onerror="this.src='images/ui/no_image.png'">
                                <div class="notif-badge"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="chat-window-modern" class="chat-modern">
                <div class="chat-header-modern">
                    <div class="chat-tabs">
                        <div id="chat-tab-gen" class="chat-tab active" onclick="switchChatTab('general')">Общий</div>
                        <div id="chat-tab-trade" class="chat-tab" onclick="switchChatTab('trade')">Торговля</div>
                    </div>
                    <button class="chat-close-btn-modern" onclick="toggleChat()">✖</button>
                </div>
                
                <div id="chat-messages-area" class="chat-messages-area"></div>

                <div class="chat-input-wrapper">
                    <div id="chat-attached-item" class="chat-attachment-preview" style="display:none;"></div>
                    
                    <div class="chat-input-controls">
                        <div id="chat-input-general" class="chat-input-group">
                            <button class="chat-icon-btn" onclick="toggleEmojiPicker()">😀</button>
                            <input type="text" id="chat-input-text-gen" class="chat-text-input" placeholder="Введите сообщение...">
                        </div>

                        <div id="chat-input-trade" class="chat-input-group" style="display:none;">
                            <button class="chat-icon-btn" onclick="openChatItemPicker()" style="color:gold;">🎒</button>
                            <input type="text" id="chat-input-text-trade" class="chat-text-input" placeholder="Доп. текст к предмету...">
                        </div>
                        
                        <button class="chat-send-btn" onclick="sendChatMessage()">➤</button>
                    </div>
                </div>

                <div id="emoji-picker" class="chat-emoji-picker"></div>
            </div>
            
            <div id="btn-enter-portal" onclick="onPortalClick()" style="display:none; pointer-events: auto !important;">
                <div style="display:flex; flex-direction:column; align-items:center; pointer-events: none;">
                    <img src="images/portal_icon.png" alt="" style="width:30px;height:30px; margin-bottom:2px;">
                    <span style="font-size:12px; font-weight:bold; color:white;">Enter</span>
                </div>
            </div>
        </div>

        <?php 
            if (file_exists('templates/modals.php')) {
                include 'templates/modals.php'; 
            } else {
                echo "<div style='color:red; background:white; position:fixed; top:0; z-index:9999;'>ОШИБКА: templates/modals.php</div>";
            }
        ?>
        
        <div id="chat-item-picker-modal">
            <div class="chat-picker-box">
                <div class="chat-picker-header">Выберите предмет <button onclick="closeChatItemPicker()" style="background:none; border:none; color:red; font-size:20px; float:right; cursor:pointer;">✖</button></div>
                <div class="chat-picker-tabs">
                    <button id="cptab-main" class="active" onclick="loadChatPickerTab('main')">Экип</button>
                    <button id="cptab-resources" onclick="loadChatPickerTab('resources')">Ресы</button>
                    <button id="cptab-misc" onclick="loadChatPickerTab('misc')">Разное</button>
                </div>
                <div id="chat-picker-grid" class="chat-picker-grid"></div>
            </div>
        </div>

        <div id="welcome-modal">
            <div class="welcome-window">
                <img src="images/npc/pierre.png" class="welcome-npc-img" alt="Пьер" onerror="this.src='images/npc/default.png'">
                <div class="welcome-npc-name">Пьер</div>
                <div id="welcome-text" class="welcome-text"></div>
                <button id="btn-close-welcome" style="display:none; width: 100%; background: #03A9F4;" onclick="closeWelcomeModal()">Закрыть</button>
            </div>
        </div>

        <div class="d-pad" id="d-pad" style="z-index: 50 !important;">
            <div class="d-btn d-up" onclick="movePlayer(0, -1)">▲</div>
            <div class="d-btn d-left" onclick="movePlayer(-1, 0)">◄</div>
            <div class="d-btn d-right" onclick="movePlayer(1, 0)">►</div>
            <div class="d-btn d-down" onclick="movePlayer(0, 1)">▼</div>
        </div>
    </div>

    <script src="js/renderer.js?v=128"></script>
    <script src="js/combat.js?v=128"></script>
    <script src="js/joystick.js?v=128"></script>
    <script src="js/teleports.js?v=128"></script>
    <script src="js/friends.js?v=128"></script>
    <script src="js/pm.js?v=128"></script>
    <script src="js/other_players.js?v=130"></script>
    
    <script src="js/chat_modern.js?v=128"></script>
    
    <script src="js/menu.js?v=128"></script>
    <script src="js/inventory.js?v=128"></script>
    <script src="js/inventory_logic.js?v=128"></script>
    <script src="js/npcs.js?v=128"></script>
    <script src="js/quests.js?v=128"></script>
    <script src="js/notifications.js?v=128"></script>
    <script src="js/daily.js?v=128"></script>
    <script src="js/clans.js?v=128"></script>
    <script src="js/clan_leagues.js?v=1"></script>
    <script src="js/blacksmith_modern.js?v=129"></script>
    <script src="js/crafting.js?v=128"></script>
    <script src="js/dungeons.js?v=128"></script>
    
    <script src="js/profile.js?v=200023"></script> <script src="js/profile_achievements.js?v=1"></script>
    
    <script src="js/tower.js?v=128"></script>
    <script src="js/storage.js?v=128"></script>
    <script src="js/achievements.js?v=128"></script>
    <script src="js/skills.js?v=128"></script>
    <script src="js/pets.js?v=2"></script> 
    <script src="js/auction.js?v=128"></script>
    <script src="js/arena.js?v=128"></script>
    <script src="js/arena_leagues.js?v=1"></script>
    <script src="js/premium_shop.js?v=128"></script>
    <script src="js/forum.js?v=1"></script>
    <script src="js/world_boss.js?v=1"></script>
    <script src="js/settings.js?v=1"></script> 
    <script src="js/app.js?v=128"></script>
    <script src="js/loader.js?v=128"></script>
    
    <script src="js/promotions.js?v=1"></script>
    
    <script>
        function toggleHudButtons() {
            const collapseDiv = document.getElementById('hud-buttons-collapse');
            const btn = document.getElementById('btn-toggle-hud');
            
            if (collapseDiv.classList.contains('show')) {
                collapseDiv.classList.remove('show');
                btn.innerHTML = '▼'; 
            } else {
                collapseDiv.classList.add('show');
                btn.innerHTML = '▲'; 
            }
        }

        // Хитрый триггер: проверяем акции 1 раз, как только игрок попадает на карту!
        let hasCheckedPromos = false;
        let promoCheckInterval = setInterval(() => {
            let gameScreen = document.getElementById('game-screen');
            // Если экран с картой активен и акции еще не проверялись
            if (gameScreen && gameScreen.classList.contains('active') && !hasCheckedPromos) {
                if (typeof checkPromotions === 'function') {
                    checkPromotions();
                    hasCheckedPromos = true;
                    clearInterval(promoCheckInterval); // Останавливаем проверку, она больше не нужна
                }
            }
        }, 1000);
    </script>
</body>
</html>
