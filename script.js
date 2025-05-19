let currentGrid = [];
let moveCount = 0;
let minSteps = 0;
let initialGrid = [];
let timer = 0;
let timerInterval = null;
let currentLevelKey = '';
let levels = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/levels.json')
        .then(res => res.json())
        .then(levelsData => {
            levels = levelsData;
            initGame();
        })
        .catch(err => console.error('Не вдалося завантажити рівні:', err));
});

function initGame() {
    const select = document.getElementById('levelSelect');


    for (let key of Object.keys(levels)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key.toUpperCase();
        select.appendChild(opt);
    }

    select.addEventListener('change', () => {
        if (!select.value) {
            resetBoard();
            return;
        }
        currentLevelKey = select.value;
        loadLevel(levels[currentLevelKey]);
    });

    
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (currentLevelKey) {
            loadLevel(levels[currentLevelKey]);
        }
    });

    document.getElementById('newGameBtn').addEventListener('click', () => {
        select.value = '';
        currentLevelKey = '';
        stopTimer();
        resetBoard();
    });
}

function loadLevel({ grid, minSteps: m }) {
    initialGrid = grid.map(row => row.slice());
    currentGrid = grid.map(row => row.slice());
    moveCount = 0;
    minSteps = m;

    document.getElementById('moveCount').textContent = moveCount;
    document.getElementById('minSteps').textContent = minSteps;
    renderGrid();
    startTimer();
}

function resetBoard() {
    currentGrid = [];
    initialGrid = [];
    document.getElementById('grid').innerHTML = '';
    document.getElementById('moveCount').textContent = '0';
    document.getElementById('minSteps').textContent = '–';
    document.getElementById('timer').textContent = '0:00';
    stopTimer();
}

function renderGrid() {
    const container = document.getElementById('grid');
    container.innerHTML = '';
    if (!currentGrid.length) return;

    container.style.gridTemplateColumns = `repeat(${currentGrid[0].length}, 40px)`;

    currentGrid.forEach((row, r) => {
        row.forEach((cell, c) => {
            const div = document.createElement('div');
            div.className = `cell ${cell ? 'on' : 'off'}`;
            div.dataset.r = r;
            div.dataset.c = c;
            div.addEventListener('click', onCellClick);
            container.appendChild(div);
        });
    });
}

function onCellClick(e) {
    const r = +e.currentTarget.dataset.r;
    const c = +e.currentTarget.dataset.c;

    toggle(r, c);
    toggle(r - 1, c);
    toggle(r + 1, c);
    toggle(r, c - 1);
    toggle(r, c + 1);

    moveCount++;
    document.getElementById('moveCount').textContent = moveCount;
    updateUI();

    if (checkWin()) {
        stopTimer();
        setTimeout(() => {
            alert(`Вітаю! Ви перемогли за ${moveCount} ходів та ${formatTime(timer)} (мінімум — ${minSteps}).`);
        }, 100);
    }
}

function toggle(r, c) {
    if (r < 0 || r >= currentGrid.length || c < 0 || c >= currentGrid[0].length) return;
    currentGrid[r][c] = currentGrid[r][c] ? 0 : 1;
}

function updateUI() {
    document.querySelectorAll('#grid .cell').forEach(div => {
        const r = +div.dataset.r;
        const c = +div.dataset.c;
        div.className = `cell ${currentGrid[r][c] ? 'on' : 'off'}`;
    });
}

function checkWin() {
    return currentGrid.every(row => row.every(cell => cell === 0));
}



function startTimer() {
    stopTimer(); 
    timer = 0;
    document.getElementById('timer').textContent = '0:00';
    timerInterval = setInterval(() => {
        timer++;
        document.getElementById('timer').textContent = formatTime(timer);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}
