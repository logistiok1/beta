console.log(">>> Loader.js: ЗАПУСК <<<");

const assetsToLoad = [
    { name: 'App Core', check: () => typeof startGame === 'function' },
    { name: 'Joystick', check: () => typeof initGame === 'function' },
    { name: 'Profile', check: () => typeof openProfile === 'function' },
    { name: 'Others', check: () => typeof renderOtherPlayers === 'function' }
];

document.addEventListener('DOMContentLoaded', () => {
    const bar = document.getElementById('loader-bar');
    const txt = document.getElementById('loader-text');
    const screen = document.getElementById('loading-screen');

    let step = 0;
    const totalSteps = assetsToLoad.length + 3; 

    function updateProgress(msg) {
        step++;
        let pct = Math.min(100, Math.floor((step / totalSteps) * 100));
        if(bar) bar.style.width = pct + '%';
        if(txt) txt.innerText = msg + ` (${pct}%)`;
    }

    let checkInterval = setInterval(() => {
        let allReady = true;
        assetsToLoad.forEach(asset => {
            if (!asset.check()) allReady = false;
        });

        if (allReady) {
            clearInterval(checkInterval);
            updateProgress("Инициализация...");
            
            if(typeof checkSessionAndStart === 'function') {
                checkSessionAndStart(() => {
                    updateProgress("Готово!");
                    setTimeout(() => {
                        // Используем CSS класс для скрытия
                        screen.classList.add('hidden');
                        // Удаляем из DOM через секунду
                        setTimeout(() => { screen.style.display = 'none'; }, 1000);
                    }, 500);
                });
            } else {
                screen.style.display = 'none';
            }
        }
    }, 200);
});