let isChatOpen = false;

function toggleChat() {
    const chatWin = document.getElementById('chat-window');
    isChatOpen = !isChatOpen;
    chatWin.style.display = isChatOpen ? 'flex' : 'none';
    if(isChatOpen) updateChat();
}

function sendMessage() {
    const input = document.getElementById('chat-msg-input');
    const msg = input.value;
    if(!msg) return;

    let formData = new FormData();
    formData.append('action', 'send_msg');
    formData.append('message', msg);

    fetch('php/game_engine.php', { method: 'POST', body: formData })
    .then(() => {
        input.value = '';
        updateChat();
    });
}

function updateChat() {
    if(!isChatOpen) return;
    
    let formData = new FormData();
    formData.append('action', 'get_chat');

    fetch('php/game_engine.php', { method: 'POST', body: formData })
    .then(r => r.json())
    .then(data => {
        const box = document.getElementById('chat-messages');
        box.innerHTML = '';
        data.messages.forEach(m => {
            let line = document.createElement('div');
            line.innerHTML = `<b>${m.username}:</b> ${m.message}`;
            box.appendChild(line);
        });
    });
}

// Автообновление чата раз в 3 сек
setInterval(updateChat, 3000);