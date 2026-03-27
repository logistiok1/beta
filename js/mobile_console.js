(function() {
    // Создаем окно консоли
    const consoleDiv = document.createElement('div');
    consoleDiv.id = 'debug-console';
    consoleDiv.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100%; height: 35vh;
        background: rgba(0, 0, 0, 0.85);
        color: #0f0;
        font-family: monospace;
        font-size: 11px;
        overflow-y: auto;
        z-index: 10000;
        pointer-events: none; /* Пропускать клики сквозь консоль */
        padding: 5px;
        border-bottom: 2px solid #0f0;
        white-space: pre-wrap;
    `;
    document.body.appendChild(consoleDiv);

    function logToScreen(msg, color = '#fff') {
        const line = document.createElement('div');
        line.style.color = color;
        line.style.borderBottom = '1px solid #333';
        const time = new Date().toLocaleTimeString();
        line.innerText = `[${time}] ${msg}`;
        consoleDiv.appendChild(line);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    // Перехват console.log
    const originalLog = console.log;
    console.log = function(...args) {
        originalLog.apply(console, args);
        const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
        logToScreen(msg, '#fff');
    };

    // Перехват console.error
    const originalError = console.error;
    console.error = function(...args) {
        originalError.apply(console, args);
        const msg = args.map(a => String(a)).join(' ');
        logToScreen("ERR: " + msg, '#ff4444');
    };

    logToScreen("--- КОНСОЛЬ ЗАПУЩЕНА (v10) ---", '#0f0');
})();