import { Game } from './myLib.js';

const canvas_handler = document.querySelector('#mycanvas');

const game = new Game(canvas_handler);

const menuAwal = document.querySelector('#menuAwal');
const menuLevel = document.querySelector('#menuLevel');
const areaGame = document.querySelector('#areaGame');
const labelLevel = document.querySelector('#labelLevel');
const popupMenang = document.querySelector('#popupMenang');
const popupKalah = document.querySelector('#popupKalah');
const btnNextLevel = document.querySelector('#btnNextLevel');
const teksMenang = document.querySelector('#teksMenang');

// Menampilkan satu layar saja (menu awal, pilih level, atau game)
function tampilkan(layar) {
    menuAwal.classList.add('sembunyi');
    menuLevel.classList.add('sembunyi');
    areaGame.classList.add('sembunyi');
    layar.classList.remove('sembunyi');
}

function tutupPopup() {
    popupMenang.classList.add('sembunyi');
    popupKalah.classList.add('sembunyi');
}

function mainLevel(level) {
    tutupPopup();
    game.loadLevel(level);
    labelLevel.textContent = 'Level ' + game.level;
    tampilkan(areaGame);
}

function keMenuLevel() {
    tutupPopup();
    game.status = 'start'; // hentikan game
    tampilkan(menuLevel);
}

// Cek status game setiap frame, munculkan popup saat menang atau kalah
let statusLalu = game.status;
function cekStatus() {
    if (game.status !== statusLalu) {
        statusLalu = game.status;

        if (game.status === 'won') {
            if (game.level < game.maxLevel) {
                teksMenang.textContent = 'Semua babi di level ' + game.level + ' Meminta Ampun Kepadamu';
                btnNextLevel.classList.remove('sembunyi');
            } else {
                teksMenang.textContent = 'Selamat, Kaum Babi sudah musnah!';
                btnNextLevel.classList.add('sembunyi');
            }
            popupMenang.classList.remove('sembunyi');
        } else if (game.status === 'lost') {
            popupKalah.classList.remove('sembunyi');
        }
    }
    requestAnimationFrame(cekStatus);
}

// Tombol menu awal
document.querySelector('#btnStart').addEventListener('click', () => mainLevel(1));
document.querySelector('#btnPilihLevel').addEventListener('click', () => tampilkan(menuLevel));
document.querySelector('#btnKembali').addEventListener('click', () => tampilkan(menuAwal));
document.querySelector('#btnMenu').addEventListener('click', keMenuLevel);

// Tombol pilih level
document.querySelectorAll('.btn-level').forEach((btn) => {
    btn.addEventListener('click', () => mainLevel(Number(btn.dataset.level)));
});

// Tombol di popup
btnNextLevel.addEventListener('click', () => mainLevel(game.level + 1));
document.querySelector('#btnRetry').addEventListener('click', () => mainLevel(game.level));
document.querySelectorAll('.btn-ke-level').forEach((btn) => {
    btn.addEventListener('click', keMenuLevel);
});

game.setEvent();
game.start();
cekStatus();
