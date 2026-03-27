// js/settings.js
console.log("Settings.js Loaded");

function injectSettingsModal() {
    if (document.getElementById('settings-modal')) return;
    
    let div = document.createElement('div');
    div.id = 'settings-modal';
    div.className = 'settings-modal-overlay';
    div.innerHTML = `
        <div class="settings-window">
            <div class="settings-header">
                <span id="settings-title">НАСТРОЙКИ</span>
                <button class="btn-close-settings" onclick="closeSettings()">✖</button>
            </div>
            <div class="settings-body" id="settings-body-content">
                </div>
        </div>
    `;
    document.body.appendChild(div);
}

document.addEventListener('DOMContentLoaded', () => {
    injectSettingsModal();
});

function openSettings() {
    renderSettingsMain();
    document.getElementById('settings-modal').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settings-modal').style.display = 'none';
}

function showSettingsAlert(msg, isError = true) {
    let alertBox = document.getElementById('settings-alert-box');
    if (!alertBox) return;
    alertBox.className = 'settings-alert ' + (isError ? 'error' : 'success');
    alertBox.innerHTML = msg;
    alertBox.style.display = 'block';
}

function hideSettingsAlert() {
    let alertBox = document.getElementById('settings-alert-box');
    if (alertBox) alertBox.style.display = 'none';
}

// === ГЛАВНОЕ МЕНЮ НАСТРОЕК ===
function renderSettingsMain() {
    document.getElementById('settings-title').innerText = 'НАСТРОЙКИ';
    const body = document.getElementById('settings-body-content');
    body.innerHTML = `
        <button class="settings-menu-btn" onclick="renderChangeLogin()">
            Изменить Логин <span>▶</span>
        </button>
        <button class="settings-menu-btn" onclick="renderChangePassword()">
            Изменить Пароль <span>▶</span>
        </button>
    `;
}

// === МЕНЮ СМЕНЫ ЛОГИНА ===
function renderChangeLogin() {
    document.getElementById('settings-title').innerText = 'СМЕНА ЛОГИНА';
    const body = document.getElementById('settings-body-content');
    body.innerHTML = `
        <div id="settings-alert-box" class="settings-alert"></div>
        <div style="color:#aaa; font-size:12px; text-align:center; margin-bottom:10px;">Цена смены: <span style="color:gold; font-weight:bold;">10000</span> <img src="images/coin.png" onerror="this.src='images/ui/coin.png'" style="width:12px; vertical-align:middle;"></div>
        
        <input type="text" id="settings-new-login" class="settings-input" placeholder="Введите новый никнейм" maxlength="15">
        
        <button class="settings-submit-btn" onclick="submitChangeLogin()">ИЗМЕНИТЬ <img src="images/coin.png" onerror="this.src='images/ui/coin.png'" style="width:16px;"></button>
        <button class="settings-back-btn" onclick="renderSettingsMain()">Назад в настройки</button>
    `;
}

function submitChangeLogin() {
    hideSettingsAlert();
    let newLogin = document.getElementById('settings-new-login').value.trim();
    
    if(newLogin.length < 3) {
        showSettingsAlert("Логин должен быть больше 2 символов!");
        return;
    }

    let fd = new FormData();
    fd.append('action', 'change_login');
    fd.append('new_login', newLogin);

    fetch('php/settings_engine.php', { method: 'POST', body: fd })
    .then(r => r.json()).then(data => {
        if(data.status === 'success') {
            showSettingsAlert("Логин успешно изменен!", false);
            setTimeout(() => { closeSettings(); if(typeof updateState === 'function') updateState(); }, 1500);
        } else {
            showSettingsAlert(data.message);
        }
    }).catch(e => showSettingsAlert("Ошибка связи с сервером."));
}

// === МЕНЮ СМЕНЫ ПАРОЛЯ ===
function renderChangePassword() {
    document.getElementById('settings-title').innerText = 'СМЕНА ПАРОЛЯ';
    const body = document.getElementById('settings-body-content');
    body.innerHTML = `
        <div id="settings-alert-box" class="settings-alert"></div>
        
        <input type="password" id="settings-old-pass" class="settings-input" placeholder="Текущий пароль">
        <input type="password" id="settings-new-pass" class="settings-input" placeholder="Новый пароль">
        <input type="password" id="settings-new-pass2" class="settings-input" placeholder="Повторите новый пароль">
        
        <button class="settings-submit-btn" onclick="submitChangePassword()">ИЗМЕНИТЬ ПАРОЛЬ</button>
        <button class="settings-back-btn" onclick="renderSettingsMain()">Назад в настройки</button>
    `;
}

function submitChangePassword() {
    hideSettingsAlert();
    let oldPass = document.getElementById('settings-old-pass').value;
    let newPass = document.getElementById('settings-new-pass').value;
    let newPass2 = document.getElementById('settings-new-pass2').value;

    if(!oldPass || !newPass || !newPass2) {
        showSettingsAlert("Заполните все поля!"); return;
    }
    if(newPass !== newPass2) {
        showSettingsAlert("Новые пароли не совпадают!"); return;
    }
    if(newPass.length < 5) {
        showSettingsAlert("Новый пароль слишком короткий!"); return;
    }

    let fd = new FormData();
    fd.append('action', 'change_password');
    fd.append('old_pass', oldPass);
    fd.append('new_pass', newPass);

    fetch('php/settings_engine.php', { method: 'POST', body: fd })
    .then(r => r.json()).then(data => {
        if(data.status === 'success') {
            showSettingsAlert("Пароль успешно изменен!", false);
            setTimeout(() => { closeSettings(); }, 1500);
        } else {
            showSettingsAlert(data.message);
        }
    }).catch(e => showSettingsAlert("Ошибка связи с сервером."));
}
