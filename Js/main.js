window.addEventListener('DOMContentLoaded', () => {
    SaveData.load();
    Sfx.init();

    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('game-container');

    // Input e Game são criados UMA só vez: não há listeners duplicados ao reiniciar
    const input = new Input(container, UI.$('joy-base'), UI.$('joy-knob'));
    const game = new Game(canvas, input);

    UI.refreshMenu();

    function startRun() {
        Sfx.unlock();
        ['start-screen', 'shop-screen', 'game-over-screen', 'upgrade-screen', 'pause-screen'].forEach(UI.hide);
        game.start();
    }

    function openMenu() {
        ['game-over-screen', 'shop-screen', 'pause-screen'].forEach(UI.hide);
        UI.refreshMenu();
        UI.show('start-screen');
    }

    UI.$('start-btn').onclick = startRun;
    UI.$('restart-btn').onclick = startRun;
    UI.$('menu-btn').onclick = openMenu;

    UI.$('shop-btn').onclick = () => {
        UI.hide('start-screen');
        UI.renderShop();
        UI.refreshMenu();
        UI.show('shop-screen');
    };
    UI.$('shop-back-btn').onclick = openMenu;

    // Pausa: botão, teclas P / Esc, e automática ao sair do separador
    UI.$('pause-btn').onclick = () => game.pause();
    UI.$('resume-btn').onclick = () => game.resume();
    UI.$('quit-btn').onclick = () => { game.quit(); openMenu(); };

    window.addEventListener('keydown', e => {
        if (e.repeat) return;
        const k = e.key.toLowerCase();
        if (k === 'p' || k === 'escape') game.togglePause();
        if (k === 'm') toggleSound();
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) game.pause();
    });

    // Som: botão e tecla M
    const muteBtn = UI.$('mute-btn');
    function refreshMuteButton() {
        muteBtn.textContent = Sfx.muted ? '\u{1F507}' : '\u{1F50A}';
    }
    function toggleSound() {
        Sfx.unlock();
        Sfx.toggleMute();
        refreshMuteButton();
    }
    muteBtn.onclick = toggleSound;
    refreshMuteButton();

    // Telemóvel na vertical: pausa o jogo enquanto o aviso de rotação está visível
    const portraitPhone = window.matchMedia('(orientation: portrait) and (pointer: coarse)');
    portraitPhone.addEventListener('change', e => { if (e.matches) game.pause(); });
});
