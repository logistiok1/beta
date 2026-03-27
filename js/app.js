// js/app.js v50 (Big Map Update)
console.log(">>> App.js: ЗАГРУЖЕН (v50) <<<");

window.GRID_SIZE = 50;
let regData = { class: null, nickname: null, password: null };
let welcomeTypingInterval = null; // Таймер для печати текста

// === ФУНКЦИЯ ДЛЯ LOADER.JS ===
function checkSessionAndStart(callback) {
    let formData = new FormData();
    formData.append('action', 'check_session');

    fetch('php/auth_engine.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        if(data.status === 'logged_in') {
            startGame(false); // Запуск для СТАРОГО игрока
        } else {
            showScreen('screen-main');
        }
        if(callback) callback(); 
    })
    .catch(err => {
        showScreen('screen-main');
        if(callback) callback();
    });
}

// Флаг isNew определяет, новый это игрок или нет
function startGame(isNew = false) {
    showScreen('game-screen');
    setTimeout(() => {
        if(typeof initGame === 'function') initGame();
        
        // Если игрок только что зарегистрировался - показываем Пьера
        if (isNew) {
            showWelcomeModal();
        }
    }, 100);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function startRegistration() { showScreen('screen-class'); }

function selectClass(className, element) { 
    regData.class = className; 
    document.querySelectorAll('.class-card').forEach(el => el.classList.remove('selected')); 
    element.classList.add('selected'); 
}

function confirmClass() { 
    if(!regData.class) return alert('Выберите класс!'); 
    showScreen('screen-nickname'); 
}

function confirmNick() { 
    const nick = document.getElementById('reg-nick').value; 
    if(nick.length < 3) return alert('Ник слишком короткий'); 
    regData.nickname = nick; 
    showScreen('screen-password'); 
}

function finishRegistration() {
    const pass = document.getElementById('reg-pass').value; 
    if(pass.length < 4) return alert('Пароль слишком короткий'); 
    regData.password = pass;
    
    let fd = new FormData(); 
    fd.append('action', 'register'); 
    fd.append('class_type', regData.class); 
    fd.append('nickname', regData.nickname); 
    fd.append('password', regData.password);
    
    fetch('php/auth_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => { 
        if(data.status === 'success') {
            startGame(true); // <--- ПЕРЕДАЕМ TRUE! ЭТО НОВЫЙ ИГРОК!
        } else {
            alert(data.message); 
        } 
    });
}

function performLogin() {
    let fd = new FormData(document.getElementById('login-form')); 
    fd.append('action', 'login');
    
    fetch('php/auth_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => { 
        if(data.status === 'success') {
            checkSessionAndStart(() => { location.reload(); }); 
        } else {
            alert(data.message); 
        } 
    });
}

function logoutGame() {
    let fd = new FormData(); 
    fd.append('action', 'logout');
    fetch('php/auth_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => { 
        if(data.status === 'success') location.reload(); 
    });
}

// === ЛОГИКА ДЛЯ ОКНА ПРИВЕТСТВИЯ ПЬЕРА ===
function showWelcomeModal() {
    document.getElementById('welcome-modal').style.display = 'flex';
    const textContainer = document.getElementById('welcome-text');
    const closeBtn = document.getElementById('btn-close-welcome');
    
    textContainer.innerHTML = '';
    closeBtn.style.display = 'none'; // Прячем кнопку Закрыть до конца анимации
    
    const fullText = "Добро пожаловать в игру. Мир стал огромным! Теперь локация 50x50, а камера следует за тобой. Исследуй новые просторы!";
    let i = 0;
    
    if (welcomeTypingInterval) clearInterval(welcomeTypingInterval);
    
    // Эффект печати текста
    welcomeTypingInterval = setInterval(() => {
        textContainer.innerHTML += fullText.charAt(i);
        i++;
        if (i >= fullText.length) {
            clearInterval(welcomeTypingInterval);
            closeBtn.style.display = 'block'; // Текст написан, показываем кнопку
        }
    }, 50); // 50 миллисекунд на каждую букву (можешь изменить скорость)
}

// Глобальная функция, чтобы срабатывала из HTML
window.closeWelcomeModal = function() {
    document.getElementById('welcome-modal').style.display = 'none';
};

// ==========================================
// === ЛОГИКА ДОБЫЧИ РЕСУРСОВ (НОВОЕ) ===
// ==========================================
let currentGatherRes = null;
let isGathering = false;

document.addEventListener('DOMContentLoaded', () => {
    const gatherWindow = document.querySelector('.gather-window');
    if (gatherWindow && !document.getElementById('gather-alert-box')) {
        const alertBox = document.createElement('div');
        alertBox.id = 'gather-alert-box';
        alertBox.className = 'gather-alert-msg';
        gatherWindow.insertBefore(alertBox, gatherWindow.querySelector('.gather-img-box'));
    }
    
    const gatherBtn = document.getElementById('gather-btn');
    if(gatherBtn) gatherBtn.onclick = performGathering;
});

// Перезаписываем глобальную функцию tryGather
window.tryGather = function(res) {
    currentGatherRes = res;
    
    let nameEl = document.getElementById('gather-name');
    let iconEl = document.getElementById('gather-icon');
    let modalEl = document.getElementById('gathering-modal');
    let btnEl = document.getElementById('gather-btn');
    let alertBox = document.getElementById('gather-alert-box');
    
    if (nameEl) nameEl.innerText = res.name;
    if (iconEl) iconEl.src = 'images/res/' + res.img;
    if (alertBox) alertBox.style.display = 'none';
    
    if (btnEl) {
        btnEl.innerText = '⛏️ ДОБЫТЬ';
        btnEl.disabled = false;
    }
    
    if (modalEl) modalEl.style.display = 'flex';
};

window.closeGathering = function() {
    let modalEl = document.getElementById('gathering-modal');
    if (modalEl) modalEl.style.display = 'none';
    currentGatherRes = null;
};

function performGathering() {
    if (!currentGatherRes || isGathering) return;
    isGathering = true;
    
    const btn = document.getElementById('gather-btn');
    const alertBox = document.getElementById('gather-alert-box');
    const imgBox = document.querySelector('.gather-img-box');
    
    // Анимация удара киркой
    if (imgBox) {
        imgBox.classList.add('anim-mine');
        setTimeout(() => imgBox.classList.remove('anim-mine'), 300);
    }
    
    if (btn) {
        btn.innerText = '⏳ Добываем...';
        btn.disabled = true;
    }
    if (alertBox) alertBox.style.display = 'none';

    let fd = new FormData();
    fd.append('action', 'gather');
    fd.append('res_id', currentGatherRes.id);

    fetch('php/gathering_engine.php', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
        isGathering = false;
        if (btn) btn.innerText = '⛏️ ДОБЫТЬ';
        
        if (data.status === 'success') {
            if(alertBox) {
                alertBox.className = 'gather-alert-msg success';
                alertBox.innerHTML = data.message;
                alertBox.style.display = 'block';
            }
            if(typeof updateState === 'function') updateState();
            if (btn) btn.disabled = true; // Защита от спама
        } else {
            if (btn) btn.disabled = false;
            if(alertBox) {
                alertBox.className = 'gather-alert-msg error';
                alertBox.innerHTML = data.message || 'Ошибка добычи';
                alertBox.style.display = 'block';
            }
        }
    })
    .catch(err => {
        isGathering = false;
        if (btn) {
            btn.innerText = '⛏️ ДОБЫТЬ';
            btn.disabled = false;
        }
        if(alertBox) {
            alertBox.className = 'gather-alert-msg error';
            alertBox.innerHTML = 'Ошибка связи с сервером';
            alertBox.style.display = 'block';
        }
    });
}
