function openMenu() {
    document.getElementById('menu-modal').style.display = 'flex';
}

function closeMenu() {
    document.getElementById('menu-modal').style.display = 'none';
    
    // Автоматически сворачиваем меню обратно при его закрытии
    const extras = document.querySelectorAll('.menu-extra');
    extras.forEach(el => el.classList.remove('show'));
    const btn = document.getElementById('btn-menu-toggle');
    if (btn) btn.innerText = '▼ РАЗВЕРНУТЬ ▼';
}

// Логика развертывания / сворачивания дополнительных кнопок
function toggleMenuExtra() {
    const extras = document.querySelectorAll('.menu-extra');
    const btn = document.getElementById('btn-menu-toggle');
    
    // Проверяем, скрыта ли сейчас первая дополнительная кнопка
    let isHidden = !extras[0].classList.contains('show');
    
    if (isHidden) {
        extras.forEach(el => el.classList.add('show'));
        btn.innerText = '▲ СВЕРНУТЬ ▲';
    } else {
        extras.forEach(el => el.classList.remove('show'));
        btn.innerText = '▼ РАЗВЕРНУТЬ ▼';
    }
}

// Функция для обновления бейджика на кнопке "Сообщения" в меню
function updateMenuBadges(pmCount) {
    const badge = document.getElementById('menu-pm-badge');
    if(badge) {
        if(pmCount > 0) {
            badge.style.display = 'flex';
            badge.innerText = pmCount;
        } else {
            badge.style.display = 'none';
        }
    }
}
