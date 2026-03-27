<div id="menu-modal" style="display:none;">
<div class="menu-box">
    <div class="menu-title">МЕНЮ</div>
    <div class="menu-grid">
        <button class="menu-img-btn" onclick="openProfile()"><img src="images/ui/btn_profile.png" alt="Профиль"></button>
        <button class="menu-img-btn" onclick="openInventory()"><img src="images/ui/btn_inv.png" alt="Сумка"></button>
        <button class="menu-img-btn" onclick="openCrafting()"><img src="images/ui/btn_craft.png" alt="Крафт"></button>
        <button class="menu-img-btn" onclick="openSkills()"><img src="images/ui/btn_skills.png" alt="Умения" onerror="this.src='images/ui/btn_craft.png';"></button>
        
        <button class="menu-img-btn" onclick="openPets()"><img src="images/ui/btn_pets.png" alt="Питомцы" onerror="this.src='images/ui/no_image.png';"></button>
        <button class="menu-img-btn" onclick="openQuestLog()"><img src="images/ui/btn_quests.png" alt="Задания"></button>
        
        <button class="menu-img-btn menu-extra" onclick="openFriends()"><img src="images/ui/btn_friends.png" alt="Друзья"></button>
        <button class="menu-img-btn menu-extra" onclick="openClansMenu()"><img src="images/ui/btn_clans.png" alt="Кланы"></button>
        <button class="menu-img-btn menu-extra" onclick="openTower()"><img src="images/ui/btn_tower.png" alt="Башня"></button>
        <button id="menu-btn-pm" class="menu-img-btn menu-extra" onclick="openPM()"><img src="images/ui/btn_pm.png" alt="Почта"><div id="menu-pm-badge" class="notif-badge"></div></button>
        
        <button class="menu-img-btn menu-extra" onclick="openAchievements()"><img src="images/ui/btn_achiev.png" alt="Достижения"></button>
        <button class="menu-img-btn menu-extra" onclick="openArena()"><img src="images/ui/btn_arena.png" alt="ПВП Арена"></button>
        <button class="menu-img-btn menu-extra" onclick="openPremiumShop()"><img src="images/ui/btn_shop.png" alt="Магазин"></button>
        
        <button id="btn-menu-toggle" class="btn-menu-toggle" onclick="toggleMenuExtra()">▼ РАЗВЕРНУТЬ ▼</button>
    </div>
    <div class="menu-divider"></div>
    <div class="menu-footer-btns">
        <button class="menu-img-btn" onclick="logoutGame()"><img src="images/ui/btn_exit.png" alt="Выход"></button>
        <button class="menu-img-btn" onclick="closeMenu()"><img src="images/ui/btn_close.png" alt="Закрыть"></button>
    </div>
</div>
</div>

<div id="skills-modal" style="display:none;">
<div class="skills-window">
    <div class="skills-title">Дерево умений</div>
    <div class="sp-info">Очки навыков: <span id="skill-points-val">0</span> SP</div>
    <div id="skills-list-render" class="skills-tree-container"></div>
    <button class="menu-img-btn" style="width:150px; height:50px; background:#d32f2f !important; border-radius:10px !important; color:white; font-weight:bold; font-size:16px;" onclick="document.getElementById('skills-modal').style.display='none'">ЗАКРЫТЬ</button>
</div>
</div>

<div id="inventory-modal" style="display:none;">
<div class="inventory-window">
    <div class="inv-title">Сумка Героя</div>
    <div class="inv-tabs">
        <div id="inv-tab-main" class="inv-tab active" onclick="switchInvTab('main')">Снаряжение</div>
        <div id="inv-tab-res" class="inv-tab" onclick="switchInvTab('resources')">Ресурсы</div>
        <div id="inv-tab-misc" class="inv-tab" onclick="switchInvTab('misc')">Разное</div>
    </div>
    <div class="inv-grid" id="inv-grid-container"></div>
    <button class="btn-close-inv" onclick="document.getElementById('inventory-modal').style.display='none'">Закрыть</button>
</div>
</div>

<div id="crafting-modal" style="display:none;">
<div class="craft-window">
    <div class="inv-title">Мастерская</div>
    <div class="craft-tabs">
        <div id="ctab-weapon" class="craft-tab active" onclick="switchCraftTab('weapon')">Оружие</div>
        <div id="ctab-body" class="craft-tab" onclick="switchCraftTab('body')">Броня</div>
        <div id="ctab-head" class="craft-tab" onclick="switchCraftTab('head')">Шлемы</div>
        <div id="ctab-legs" class="craft-tab" onclick="switchCraftTab('legs')">Ноги</div>
    </div>
    <div id="craft-list" class="craft-list"></div>
    <button class="menu-btn-item menu-close" onclick="closeCrafting()">Закрыть</button>
</div>
</div>

<div id="item-modal" style="display:none; z-index:8500;">
<div class="item-card">
    <button class="btn-close-item" onclick="closeItemModal()">×</button>
    <div id="modal-item-name" class="item-name">Название</div>
    <div id="modal-item-type" class="item-type">Тип</div>
    <div class="item-img-lg"><img id="modal-item-img" src="" alt=""></div>
    <div id="modal-item-stats" class="item-stats">Статы...</div>
    <div id="modal-item-desc" class="item-desc">Описание...</div>
    <div class="item-actions">
        <button id="btn-item-action" class="btn-equip">Одеть</button>
        <button id="btn-item-drop" class="btn-drop">Выбросить</button>
    </div>
</div>
</div>

<div id="combat-modal" style="display:none;">
<div class="combat-window-modern">
    <div class="combat-header-title">СРАЖЕНИЕ</div>
    <div class="combat-arena">
        <div class="combat-side player-side">
            <div class="combat-avatar-wrap" id="combat-player-wrap"><img id="combat-player-img" src=""></div>
            <div class="combat-name-tag">ВЫ</div>
            <div class="combat-hp-box"><div class="combat-hp-fill hp-player" id="combat-player-hp-bar"></div><div class="combat-hp-text" id="combat-player-hp-text">100/100</div></div>
            <button class="btn-sword-attack" onclick="attackMob()">⚔️</button>
        </div>
        <div class="combat-vs-badge">VS</div>
        <div class="combat-side mob-side">
            <div class="combat-avatar-wrap" id="combat-mob-wrap"><img id="combat-mob-img" src=""></div>
            <div class="combat-name-tag mob-name-tag" id="combat-mob-name">Моб</div>
            <div class="combat-hp-box"><div class="combat-hp-fill hp-mob" id="combat-mob-hp-bar"></div><div class="combat-hp-text" id="combat-mob-hp-text">100/100</div></div>
        </div>
    </div>
    <div id="combat-skills-render" class="combat-skills-panel"></div>
    <div class="combat-log-modern" id="combat-log-box"></div>
    <button class="menu-btn-item menu-close" onclick="fleeCombat()" style="margin-top: 15px; background: #5d4037; border-color: #3e2723;">Сбежать</button>
</div>
</div>

<div id="victory-modal" style="display:none;">
<div class="victory-window-new">
    <div class="victory-glow"></div>
    <div class="victory-header-text">ПОБЕДА!</div>
    <img src="images/ui/victory_icon.png" style="width:100px; position:relative; z-index:1;" onerror="this.style.display='none'">
    <div class="victory-rewards-box" id="victory-loot-text"></div>
    <button class="menu-btn-item" style="background:#4CAF50; font-size:18px; font-weight:bold; width:100%; position:relative; z-index:1;" onclick="closeVictory()">ЗАБРАТЬ</button>
</div>
</div>

<div id="defeat-modal" style="display:none;">
<div class="defeat-window-new">
    <div class="defeat-header-text">ПОРАЖЕНИЕ</div>
    <img src="images/ui/defeat_icon.png" style="width:100px;" onerror="this.style.display='none'">
    <div class="defeat-desc">Вы пали в бою. Ваши силы иссякли, но вы возродитесь в безопасном месте...</div>
    <button class="menu-btn-item" style="background:#d32f2f; font-size:18px; font-weight:bold; width:100%;" onclick="closeDefeat()">ВОСКРЕСНУТЬ</button>
</div>
</div>

<div id="dungeon-modal" style="display:none;">
<div class="dungeon-window">
    <div class="boss-title" id="boss-name-title">БОСС</div>
    <div class="boss-preview"><img id="boss-preview-img" src=""></div>
    <div class="boss-hp-container">
        <div id="modal-boss-hp-bar" class="boss-hp-fill"></div>
        <div id="modal-boss-hp-text" class="boss-hp-text">100/100</div>
    </div>
    <div id="dungeon-status-text" style="text-align:center; margin-bottom:10px;"></div>
    <button id="btn-dungeon-fight" class="btn-fight">В БОЙ ⚔️</button>
    <div class="drop-list-title">Награды:</div>
    <div id="dungeon-drops" class="drop-list"></div>
    <button class="menu-btn-item menu-close" onclick="closeDungeon()">Уйти</button>
</div>
</div>

<div id="profile-modal" style="display:none; z-index:8000;">
<div class="profile-window">
    <div class="prof-top-info">
        <div class="prof-name-row">
            <span id="prof-username" class="prof-name-text">Имя</span>
            <span class="prof-lvl-badge">Ур. <span id="prof-lvl">...</span></span>
        </div>
        <div class="prof-hp-bar-bg">
            <div class="prof-hp-bar-fill" id="prof-hp-bar-fill"></div>
            <div class="prof-hp-text" id="prof-hp">...</div>
        </div>
    </div>
    <div class="profile-equip-area">
        <div class="equip-col-left">
            <div class="equip-slot" id="slot-head"></div>
            <div class="equip-slot" id="slot-amulet"></div>
            <div class="equip-slot" id="slot-legs"></div>
        </div>
        <div class="equip-col-center" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
            <div class="profile-avatar-frame">
                <img id="prof-wings-img" src="" alt="" style="display:none;">
                <img id="prof-img" src="" alt="">
            </div>
            <div class="equip-slot wings-slot-ui" id="slot-wings"></div>
        </div>
        <div class="equip-col-right">
            <div class="equip-slot" id="slot-body"></div>
            <div class="equip-slot" id="slot-ring"></div>
            <div class="equip-slot" id="slot-weapon"></div>
        </div>
    </div>
    <div class="profile-pet-area">
        <div class="prof-pet-slot" id="prof-pet-slot"></div>
        <div class="prof-pet-info" id="prof-pet-info">Нет питомца</div>
    </div>
    <div class="profile-stats-frame">
        <div class="stat-box"><div class="stat-icon">❤️</div><div class="stat-val" id="prof-hp-stat">0/0</div><div class="stat-lbl">Здоровье</div></div>
        <div class="stat-box"><div class="stat-icon">⚔️</div><div class="stat-val" id="prof-dmg">0</div><div class="stat-lbl">Урон</div></div>
        <div class="stat-box"><div class="stat-icon">🛡</div><div class="stat-val" id="prof-def">0</div><div class="stat-lbl">Защита</div></div>
    </div>
    <div id="profile-actions"></div>
    <button class="btn-close-profile" onclick="closeProfile()">ЗАКРЫТЬ</button>
</div>
</div>

<div id="gathering-modal" style="display:none;">
<div class="gather-window">
    <div class="gather-title" id="gather-name">Ресурс</div>
    <div class="gather-img-box"><img id="gather-icon" src=""></div>
    <div class="gather-info">Нажмите, чтобы добыть</div>
    <button id="gather-btn" class="btn-gather">⛏️ ДОБЫТЬ</button>
    <button class="menu-btn-item menu-close" onclick="closeGathering()">Уйти</button>
</div>
</div>

<div id="blacksmith-modal" style="display:none;">
   <div class="bs-window-modern">
       <div class="bs-header-modern">
           <div class="bs-title-modern">Кузница</div>
           <button class="btn-close-bs" onclick="closeBlacksmith()">✖</button>
       </div>
       <div class="bs-content-modern">
           <div class="bs-items-grid-modern" id="bs-items-grid"></div>
           <div class="bs-selected-area-modern" id="bs-selected-area" style="display:none;">
               <div class="bs-anvil-glow"></div> 
               <div class="bs-item-preview-modern" id="bs-preview-slot"></div>
               <div class="bs-stats-modern" id="bs-current-stats"></div>
               <div class="bs-cost-modern">Цена: <span id="bs-cost-val" class="text-gold">0</span> <img src="images/ui/coin.png" alt="G" style="width:18px;height:18px;vertical-align:middle;margin-left:5px;"></div>
               <div class="bs-actions-modern">
                   <button class="btn-upg-modern btn-upg-dmg" onclick="performUpgrade('damage')"><span style="font-size:16px;">⚔️</span> Урон</button>
                   <button class="btn-upg-modern btn-upg-hp" onclick="performUpgrade('hp')"><span style="font-size:16px;">❤️</span> Здоровье</button>
                   <button class="btn-upg-modern btn-upg-def" onclick="performUpgrade('defense')"><span style="font-size:16px;">🛡️</span> Защита</button>
               </div>
           </div>
       </div>
   </div>
</div>

<div id="achievements-modal" style="display:none;">
<div class="achiev-window">
    <div class="achiev-title">Достижения</div>
    <div id="achiev-grid-render" class="achiev-grid"></div>
    <button class="menu-btn-item menu-close" onclick="closeAchievements()">Закрыть</button>
</div>
</div>

<div id="achiev-info-modal" style="display:none;">
<div class="achiev-info-box">
    <div id="achiev-info-title" class="achiev-info-title">Название</div>
    <img id="achiev-info-icon" class="achiev-info-icon" src="">
    <div id="achiev-info-desc" class="achiev-info-desc">Описание</div>
    <div id="achiev-info-progress" class="achiev-info-progress">0 / 10</div>
    <button class="menu-btn-item menu-close" onclick="closeAchievInfo()">ОК</button>
</div>
</div>

<div id="clans-modal" style="display:none;"><div class="clans-window"><div class="clans-tabs"><div id="ctab-my" class="clans-tab active" onclick="switchClanTab('my')">Мой клан</div><div id="ctab-buildings" class="clans-tab" onclick="switchClanTab('buildings')">Постройки</div><div id="ctab-list" class="clans-tab" onclick="switchClanTab('list')">Кланы</div></div><div id="clans-content" class="clans-content"></div><button class="btn-close-inv" onclick="closeClansMenu()">Закрыть</button></div></div>
<div id="friends-modal" style="display:none;"><div class="friends-window"><div class="friends-tabs"><div id="ftab-list" class="friends-tab active" onclick="switchFriendTab('list')">Друзья</div><div id="ftab-req" class="friends-tab" onclick="switchFriendTab('req')">Запросы</div></div><div id="friends-list" class="friends-list"></div><button class="btn-close-inv" onclick="closeFriends()">Закрыть</button></div></div>
<div id="pm-modal" style="display:none;"><div class="pm-window"><div id="pm-dialogs-view" style="display:flex; flex-direction:column; height:100%;"><div class="pm-header">Почта</div><div id="pm-list" class="pm-list"></div><button class="btn-close-inv" onclick="closePM()">Закрыть</button></div><div id="pm-chat-view" class="pm-chat-view" style="display:none;"><div class="pm-header"><button class="btn-back-pm" onclick="backToDialogs()">❮</button><span id="pm-chat-title">Ник</span></div><div id="pm-messages-area" class="pm-messages-area"></div><div class="pm-input-area"><input type="text" id="pm-input" class="pm-input" placeholder="..."><button class="btn-pm-send" onclick="sendPM()">➤</button></div></div></div></div>
<div id="npc-modal" style="display:none;"><div class="npc-window"><div class="npc-header"><img id="npc-portrait" class="npc-portrait" src=""><div><div id="npc-name" class="npc-name">Имя</div><div id="npc-desc" class="npc-desc">Описание</div></div></div><div id="npc-quest-list" class="npc-quest-list"></div><button class="menu-btn-item menu-close" onclick="closeNPCWindow()">Уйти</button></div></div>
<div id="quest-log-modal" style="display:none;"><div class="quest-log-window"><div class="quest-tabs"><div id="tab-active" class="quest-tab active" onclick="switchQuestTab('active')">Активные</div><div id="tab-completed" class="quest-tab" onclick="switchQuestTab('completed')">Завершенные</div></div><div id="quest-list-container" class="quest-list-container"></div><button class="btn-close-inv" onclick="closeQuestLog()">Закрыть</button></div></div>
<div id="tower-modal" style="display:none;"><div class="tower-window"><div class="tower-title">Башня Героев</div><div id="tower-list" class="tower-list"></div><button class="menu-btn-item menu-close" onclick="closeTower()">Закрыть</button></div></div>

<div id="auction-modal" style="display:none;"><div class="auction-window"><div class="auction-title">Аукцион</div><div class="auction-tabs"><div id="atab-equip" class="auc-tab active" onclick="switchAucTab('equip')">Экипировка</div><div id="atab-res" class="auc-tab" onclick="switchAucTab('res')">Ресурсы</div><div id="atab-my" class="auc-tab" onclick="switchAucTab('my')">Мои лоты</div><div id="atab-sell" class="auc-tab" style="color:#4CAF50;" onclick="switchAucTab('sell')">ПРОДАТЬ</div></div><div id="auction-filters" class="auc-filters"></div><div id="auction-list" class="auction-list"></div><div id="auction-sell-area" class="auc-sell-form" style="display:none;"><div style="color:gold; text-align:center; margin-bottom:10px;">Выставление лота</div><select id="auc-sell-item" class="auc-sell-select" onchange="updateSellForm()"></select><div id="auc-sell-qty-wrap" style="display:none;"><div style="font-size:12px; color:#aaa; margin-bottom:5px;">Количество:</div><input type="number" id="auc-sell-qty" class="auc-sell-input" min="1" value="1"></div><div style="font-size:12px; color:#aaa; margin-bottom:5px; margin-top:5px;" id="auc-price-label">Цена:</div><input type="number" id="auc-sell-price" class="auc-sell-input" placeholder="Сумма золота" min="1"><button class="btn-auc-submit" onclick="submitSell()">Выставить на продажу</button><div style="font-size:10px; color:#777; text-align:center; margin-top:10px;">Комиссия аукциона 0%</div></div><button class="menu-btn-item menu-close" style="margin-top:15px;" onclick="closeAuction()">Закрыть</button></div></div>
<div id="auc-buy-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:5600; justify-content:center; align-items:center;"><div class="auction-window" style="width:300px; height:auto; padding:20px; align-items:center; border-color:#4CAF50;"><div style="color:#4CAF50; font-size:20px; font-weight:bold; margin-bottom:15px; text-transform:uppercase;">Покупка ресурса</div><div id="auc-buy-info" style="margin-bottom:15px; text-align:center; font-size:14px; line-height:1.5;"></div><div style="width:100%; display:flex; flex-direction:column; gap:10px; margin-bottom:15px;"><input type="number" id="auc-buy-qty-input" class="auc-sell-input" min="1" value="1" oninput="calcAucBuyPrice()"><div id="auc-buy-total" style="color:gold; text-align:center; font-size:16px; font-weight:bold;">К оплате: 0 💰</div></div><div style="display:flex; gap:10px; width:100%;"><button class="btn-auc-buy" style="flex:1; padding:12px; font-size:14px;" onclick="confirmAucBuy()">КУПИТЬ</button><button class="btn-auc-cancel" style="flex:1; padding:12px; font-size:14px;" onclick="closeAucBuyModal()">ОТМЕНА</button></div></div></div>

<div id="arena-modal" style="display:none;"><div class="arena-window"><div class="arena-title">ПВП Арена</div><div class="arena-energy-wrap"><div class="arena-energy-text"><span>Энергия: <span id="arena-energy-val" style="color:white;">0/5</span></span><span id="arena-energy-timer" style="color:#aaa; font-weight:normal;"></span></div><div class="arena-energy-bg"><div class="arena-energy-fill" id="arena-energy-fill" style="width:0%;"></div></div></div><div class="arena-top-panel"><img src="images/ui/league_silver_1.png" class="league-icon" id="arena-league-img" onclick="openArenaLeagues()" style="cursor:pointer; width:50px; height:50px; object-fit:contain;" title="Смотреть все лиги" onerror="this.src='images/ui/no_image.png'"><div class="league-info"><div class="league-name" id="arena-league-name">Лига 1</div><div class="league-bar-bg"><div class="league-bar-fill" id="arena-league-fill" style="width:0%;"></div><div class="league-bar-text" id="arena-league-text">0 / 5 Очков</div></div></div></div><div class="arena-btn-row"><button class="btn-arena-shop" onclick="openArenaShop()">Магазин 🪙</button><button class="btn-arena-search" onclick="loadArenaData()">Обновить 🔄</button><button class="btn-arena-rating" onclick="openArenaRating()">Топ 🏆</button></div><div class="arena-opp-list" id="arena-opp-list"></div><button class="menu-btn-item menu-close" style="margin-top:10px;" onclick="closeArena()">Выйти</button></div></div>
<div id="arena-shop-modal" style="display:none;"><div class="arena-shop-window"><div class="arena-title" style="margin-bottom:10px;">Магазин Арены</div><div class="shop-coins-info">Ваши монеты: <span id="shop-coins-val">0</span> 🪙</div><div class="shop-grid" id="arena-shop-grid"></div><button class="menu-btn-item menu-close" style="margin-top:15px;" onclick="closeArenaShop()">Закрыть</button></div></div>
<div id="arena-rating-modal" style="display:none;"><div class="rating-window"><div class="arena-title" style="margin-bottom:15px; color:#9C27B0; text-shadow:0 0 10px rgba(156,39,176,0.8);">Зал Славы</div><div class="rating-podium" id="rating-podium-render"></div><div class="rating-list" id="arena-rating-list"></div><button class="menu-btn-item menu-close" style="margin-top:15px;" onclick="closeArenaRating()">Закрыть</button></div></div>
<div id="premium-shop-modal" style="display:none;"><div class="pshop-window"><div class="pshop-header"><div class="pshop-title">Магазин</div><div class="pshop-valor-box"><img src="images/ui/valor.png" class="pshop-valor-icon" onerror="this.src='images/ui/no_image.png'"><span class="pshop-valor-val" id="pshop-valor-val">0</span></div></div><div class="pshop-tabs"><div id="pstab-promo" class="ps-tab active" onclick="switchPShopTab('promo')">Акции</div><div id="pstab-cosmetic" class="ps-tab" onclick="switchPShopTab('cosmetic')">Косметика</div><div id="pstab-pet" class="ps-tab" onclick="switchPShopTab('pet')">Питомцы</div><div id="pstab-resource" class="ps-tab" onclick="switchPShopTab('resource')">Ресурсы</div></div><div class="pshop-grid" id="pshop-grid"></div><button class="menu-btn-item menu-close" style="margin-top:15px;" onclick="closePremiumShop()">Закрыть</button></div></div>
<div id="arena-leagues-modal" style="display:none;"><div class="arena-leagues-window"><div class="arena-leagues-header">Лиги Арены</div><div class="arena-leagues-info">Сражайтесь и зарабатывайте очки для продвижения по лигам!</div><div class="arena-leagues-list" id="arena-leagues-list"></div><button class="menu-btn-item menu-close" onclick="closeArenaLeagues()">Закрыть</button></div></div>

<div id="notification-modal" style="display:none;">
   <div class="notif-window-modern">
       <div class="notif-bg-overlay"></div>
       <div class="notif-header-modern">
           <div class="notif-title-modern">Уведомления</div>
           <button class="btn-close-notif" onclick="closeNotifications()">✖</button>
       </div>
       <div id="notif-list" class="notif-list-modern"></div>
   </div>
</div>

<div id="storage-modal" style="display:none;">
   <div class="storage-window-modern">
       <div class="storage-bg-overlay"></div>
       <div class="storage-header-modern">
           <div class="storage-title-modern">Хранилище</div>
           <button class="btn-close-storage" onclick="closeStorage()">✖</button>
       </div>
       <div class="storage-info-modern">Ваши вещи с временным сроком хранения</div>
       <div id="storage-grid" class="storage-grid-modern"></div>
   </div>
</div>

<div id="daily-modal" style="display:none;">
   <div class="daily-window-modern">
       <div class="daily-bg-overlay"></div>
       <div class="daily-header-modern">
           <div class="daily-title-modern">Подарки</div>
           <button class="btn-close-daily" onclick="closeDailyRewards()">✖</button>
       </div>
       <div class="daily-subtitle">Заходите каждый день и получайте награды!</div>
       <div id="daily-grid" class="daily-grid-modern"></div>
       <div style="padding: 0 15px 15px 15px; position:relative; z-index:1;">
           <button id="btn-daily-claim" class="btn-daily-claim-modern">ЗАБРАТЬ НАГРАДУ</button>
       </div>
   </div>
</div>

<div id="pets-modal" style="display:none;">
   <div class="pets-window-modern">
       <div class="pets-bg-overlay"></div>
       <div class="pets-header-modern">
           <div class="pets-title-modern">Питомцы</div>
           <button class="btn-close-pets" onclick="closePets()">✖</button>
       </div>
       <div class="pets-content-modern">
           <div id="pets-list" class="pets-list-modern"></div>
           <div id="pet-info-panel" class="pet-info-panel-modern" style="display:none;"></div>
       </div>
   </div>
</div>

<div id="forum-modal" style="display:none;">
   <div class="forum-window-modern">
       <div class="forum-bg-overlay"></div>
       <div class="forum-header-modern">
           <div class="forum-title-modern">Форум Игроков</div>
           <button class="btn-close-forum" onclick="closeForum()">✖</button>
       </div>
       
       <div id="forum-view-categories" class="forum-view">
           <div id="forum-admin-panel" class="forum-admin-panel" style="display:none;">
               <input type="text" id="forum-new-cat-title" placeholder="Название нового раздела...">
               <input type="text" id="forum-new-cat-desc" placeholder="Описание раздела...">
               <button class="btn-forum-admin" onclick="createForumCategory()">Создать раздел</button>
           </div>
           <div id="forum-categories-list" class="forum-content-list"></div>
       </div>

       <div id="forum-view-topics" class="forum-view" style="display:none;">
           <div class="forum-nav-bar">
               <button class="btn-forum-back" onclick="showForumCategories()">❮ Назад</button>
               <span id="forum-current-cat-title" style="font-weight:bold; color:#f1c40f;">Раздел</span>
           </div>
           
           <div id="forum-topic-admin-panel" class="forum-admin-panel" style="display:none;">
               <button class="btn-forum-admin" id="btn-toggle-topic-creation" onclick="toggleCategoryTopics()">Вкл/Выкл создание тем</button>
           </div>

           <div id="forum-create-topic-panel" class="forum-create-panel" style="display:none;">
               <input type="text" id="forum-new-topic-title" placeholder="Название вашей темы...">
               <textarea id="forum-new-topic-msg" placeholder="Текст первого сообщения..."></textarea>
               <div style="display:flex; gap:10px;">
                   <button class="btn-forum-submit" style="flex:1;" onclick="createForumTopic()">Создать тему</button>
                   <button class="btn-forum-attach" onclick="openForumItemPicker('forum-new-topic-msg')">🎒 Предмет</button>
               </div>
           </div>
           
           <div id="forum-topics-list" class="forum-content-list"></div>
       </div>

       <div id="forum-view-messages" class="forum-view" style="display:none;">
           <div class="forum-nav-bar">
               <button class="btn-forum-back" onclick="showForumTopics(window.currentForumCategoryId, window.currentForumCategoryTitle, window.currentForumCategoryCanCreate)">❮ Назад</button>
               <span id="forum-current-topic-title" style="font-weight:bold; color:#3498db; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; text-align:right;">Тема</span>
           </div>
           
           <div id="forum-messages-list" class="forum-messages-area"></div>
           
           <div class="forum-reply-panel">
               <button class="btn-forum-attach-sm" onclick="openForumItemPicker('forum-reply-input')">🎒</button>
               <input type="text" id="forum-reply-input" placeholder="Написать ответ...">
               <button class="btn-forum-send" onclick="postForumMessage()">➤</button>
           </div>
       </div>
   </div>
</div>

<div id="forum-item-picker-modal" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index: 7000; justify-content:center; align-items:center;">
   <div class="f-picker-box" style="width: 90%; max-width: 400px; height: 70vh; background:#111; border: 2px solid gold; border-radius:10px; display:flex; flex-direction:column;">
       <div class="f-picker-header" style="padding: 15px; background: #222; text-align: center; color: gold; font-weight: bold; border-bottom: 1px solid #444; position:relative;">
           Выберите предмет
           <button class="btn-close-forum" style="position:absolute; right:15px; top:10px; width:25px; height:25px; background:rgba(0,0,0,0.5); border:1px solid #fff; color:white; border-radius:5px; cursor:pointer;" onclick="closeForumItemPicker()">✖</button>
       </div>
       <div id="forum-item-picker-grid" class="f-picker-grid" style="flex:1; overflow-y:auto; display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; padding:15px;"></div>
   </div>
</div>

<div id="world-boss-modal">
   <div class="wb-window">
       <div class="wb-bg"></div>
       <div class="wb-header">
           <div class="wb-title" id="wb-info-title">БОСС</div>
           <button class="btn-close-forum" style="position:absolute; right:15px; top:12px; width:30px; height:30px;" onclick="closeWorldBossInfo()">✖</button>
       </div>
       <div class="wb-content" id="wb-info-content"></div>
   </div>
</div>

<div id="wb-combat-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:7100; justify-content:center; align-items:center;">
   <div class="combat-window-modern" style="border-color:#e74c3c; box-shadow:0 0 30px rgba(231,76,60,0.5);">
       <div class="combat-header-title" style="background:linear-gradient(180deg, #c0392b, #8e44ad); color:gold;">МИРОВОЙ БОСС</div>
       
       <div class="combat-arena">
           <div class="combat-side player-side">
               <div class="combat-avatar-wrap" id="wb-combat-player-wrap"><img id="wb-combat-player-img" src=""></div>
               <div class="combat-name-tag">ВЫ</div>
               <div class="combat-hp-box"><div class="combat-hp-fill hp-player" id="wb-combat-player-hp-bar"></div><div class="combat-hp-text" id="wb-combat-player-hp-text">100/100</div></div>
               <button class="btn-sword-attack" id="btn-wb-attack-action" onclick="attackWorldBossAction()">⚔️</button>
           </div>
           <div class="combat-vs-badge" style="color:#e74c3c;">VS</div>
           <div class="combat-side mob-side">
               <div class="combat-avatar-wrap" id="wb-combat-mob-wrap" style="border-color:#e74c3c; box-shadow:0 0 15px #e74c3c;"><img id="wb-combat-mob-img" src=""></div>
               <div class="combat-name-tag mob-name-tag" style="background:#c0392b;" id="wb-combat-mob-name">Босс</div>
               <div class="combat-hp-box"><div class="combat-hp-fill hp-mob" id="wb-combat-mob-hp-bar" style="background:linear-gradient(90deg, #c0392b, #e74c3c);"></div><div class="combat-hp-text" id="wb-combat-mob-hp-text">100/100</div></div>
           </div>
       </div>
       
       <div id="wb-combat-skills-render" class="combat-skills-panel"></div>
       
       <div class="combat-log-modern" id="wb-combat-log-box" style="border-top:1px solid #e74c3c;"></div>
       <button class="menu-btn-item menu-close" onclick="closeWbCombat()" style="margin-top: 15px; background: #5d4037; border-color: #3e2723;">Отступить</button>
   </div>
</div>