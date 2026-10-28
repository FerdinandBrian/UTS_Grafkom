import { Game } from './myLib.js';

const canvas_handler = document.querySelector('#mycanvas');

const game = new Game(canvas_handler);

const btnNextLevel = document.querySelector('#btnNextLevel');

// Menampilkan satu layar saja (menu awal, pilih level, atau game)
function tampilkan(id) {
    document.querySelector('#menuAwal').classList.add('sembunyi');
    document.querySelector('#menuLevel').classList.add('sembunyi');
    document.querySelector('#areaGame').classList.add('sembunyi');
    document.querySelector(id).classList.remove('sembunyi');
}

function tutupPopup() {
    document.querySelector('#popupMenang').classList.add('sembunyi');
    document.querySelector('#popupKalah').classList.add('sembunyi');
}

function mainLevel(level) {
    tutupPopup();
    game.loadLevel(level);
    document.querySelector('#labelLevel').textContent = 'Level ' + game.level;
    tampilkan('#areaGame');
}

function keMenuLevel() {
    tutupPopup();
    game.status = 'start';
    tampilkan('#menuLevel');
}

// Cek status game setiap frame
let statusLalu = game.status;
function cekStatus() {
    if (game.status !== statusLalu) {
        statusLalu = game.status;

        if (game.status === 'won') {
            if (game.level < game.maxLevel) {
                document.querySelector('#teksMenang').textContent = 'Semua babi di level ' + game.level + ' Meminta Ampun Kepadamu';
                document.querySelector('#btnNextLevel').classList.remove('sembunyi');
            } else {
                document.querySelector('#teksMenang').textContent = 'Selamat, Kaum Babi sudah musnah!';
                document.querySelector('#btnNextLevel').classList.add('sembunyi');
            }
            document.querySelector('#popupMenang').classList.remove('sembunyi');
        } else if (game.status === 'lost') {
            document.querySelector('#popupKalah').classList.remove('sembunyi');
        }
    }
    requestAnimationFrame(cekStatus);
}

// Tombol menu awal
document.querySelector('#btnStart').addEventListener('click', () => mainLevel(1));
document.querySelector('#btnPilihLevel').addEventListener('click', () => tampilkan('#menuLevel'));
document.querySelector('#btnKembali').addEventListener('click', () => tampilkan('#menuAwal'));
document.querySelector('#btnMenu').addEventListener('click', keMenuLevel);

// Tombol pilih level
const tombolLevel = document.querySelectorAll('.btn-level');

for (let i = 0; i < tombolLevel.length; i++) {
    tombolLevel[i].addEventListener('click', function () {
        mainLevel(tombolLevel[i].value);
    });
}

// Tombol di popup
btnNextLevel.addEventListener('click', () => mainLevel(game.level + 1));
document.querySelector('#btnRetry').addEventListener('click', () => mainLevel(game.level));
document.querySelectorAll('.btn-ke-level').forEach((btn) => {
    btn.addEventListener('click', keMenuLevel);
});

game.setEvent();
game.start();
cekStatus();
