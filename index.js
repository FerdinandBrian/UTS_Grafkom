import { Game } from './myLib2.js';

const canvas_handler = document.querySelector('#mycanvas');

const game = new Game(canvas_handler);

game.loadLevel(3);
game.setEvent()

game.start()

canvas_handler.addEventListener("click",function(ev){
    let req = canvas_handler.getBoundingClientRect()
    let x = ev.clientX-req.left
    let y = ev.clientY-req.top
    console.log("x:",x," y:",y)
})