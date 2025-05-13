document.addEventListener('DOMContentLoaded', () => {
    fetch('data/levels.json')
        .then(res => res.json())
        .then(levelsData => initGame(levelsData))
        .catch(err => console.error('Не вдалося завантажити рівні:', err));
});

let currentGrid = [];
let moveCount = 0;
let minSteps = 0;

function initGame(levels) {
    const select = document.getElementById('levelSelect');

    for (let key of Object.keys(levels)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key.toUpperCase();
        select.appendChild(opt);
    }

    select.addEventListener('change', () => {
        if (!select.value) return resetBoard();
        loadLevel(levels[select.value]);
    });

    document.getElementById('resetBtn').addEventListener('click', resetBoard);
}

function loadLevel({ grid, minSteps: m }) {
    // Зберігаємо копію початкового стану
    currentGrid = grid.map(row => row.slice());
    moveCount = 0;
    minSteps = m;
    document.getElementById('moveCount').textContent = moveCount;
    document.getElementById('minSteps').textContent = minSteps;
    renderGrid();
}

function resetBoard() {
    currentGrid = [];
    document.getElementById('grid').innerHTML = '';
    document.getElementById('moveCount').textContent = '0';
    document.getElementById('minSteps').textContent = '–';
}

function renderGrid() {
    const container = document.getElementById('grid');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${currentGrid[0].length}, 40px)`;

    currentGrid.forEach((row, r) => {
        row.forEach((cell, c) => {
            const div = document.createElement('div');
            div.className = `cell ${(cell ? 'on':'off')}`;
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
    // Міняємо стан клітинки та суміжних
    toggle(r, c);
    toggle(r-1, c);
    toggle(r+1, c);
    toggle(r, c-1);
    toggle(r, c+1);

    moveCount++;
    document.getElementById('moveCount').textContent = moveCount;
    updateUI();
    if (checkWin()) {
        setTimeout(() => alert(`Вітаю! Ви перемогли за ${moveCount} ходів (мінімум — ${minSteps}).`), 100);
    }
}

function toggle(r, c) {
    if (r < 0 || r >= currentGrid.length || c < 0 || c >= currentGrid[0].length) return;
    currentGrid[r][c] = currentGrid[r][c] ? 0 : 1;
}

function updateUI() {
    document.querySelectorAll('#grid .cell').forEach(div => {
        const r = +div.dataset.r, c = +div.dataset.c;
        div.className = `cell ${(currentGrid[r][c] ? 'on':'off')}`;
    });
}

function checkWin() {
    return currentGrid.every(row => row.every(cell => cell === 0));
}
