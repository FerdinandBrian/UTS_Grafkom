import Bird from './bird.js';
import Pig from './pig.js';
import WoodBlock from './woodblock.js';
import SlingShot from './slingshot.js';
import GrafLib from './graflib.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        let imageData = this.context.getImageData(0, 0, canvas.width, canvas.height);
        this.graf = new GrafLib(canvas.width, imageData);

        this.groundY = canvas.height - 50;
        this.ketapel = new SlingShot(150, this.groundY - 100, 80, 7.5);
        this.birds = [];
        this.pigs = [];
        this.blocks = [];
        this.bird = null;

        this.status = 'start';
        this.level = 1;
        this.maxLevel = 3;
        this.running = false;
        this.hitObjects = []; 
        this.shotTime = 0;   
    }

    loadLevel(level) {
        if (level < 1 || level > this.maxLevel) level = 1;

        this.level = level;
        this.status = 'playing';
        this.birds = [];
        this.pigs = [];
        this.blocks = [];
        this.bird = null;
        this.hitObjects = [];
        this.shotTime = 0;
        this.ketapel.dragging = false;

        let kuning = {r: 255, g: 215, b: 0}
        for (let i = 0; i < 10; i++) {
            this.birds.push(new Bird(this.ketapel.x, this.ketapel.y, kuning, 100));
        }

        let tanah = this.groundY;
        if (level === 1) {
            let tengah = this.canvas.width - 220;
            this.blocks.push(
                new WoodBlock(tengah - 50, tanah - 50, 30,100),
                new WoodBlock(tengah + 50, tanah - 50, 30, 100),
                new WoodBlock(tengah, tanah - 115, 150, 30)
            );
            this.pigs.push(new Pig(tengah + 100, tanah - 20, 100));
        } else if (level === 2) {
            let kiri = this.canvas.width - 350;
            this.blocks.push(
                new WoodBlock(kiri - 50, tanah - 50, 30, 100),
                new WoodBlock(kiri + 50, tanah - 50, 30, 100),
                new WoodBlock(kiri, tanah - 115, 130, 30),
                new WoodBlock(kiri + 200, tanah - 50, 30, 100,),
                new WoodBlock(kiri + 260, tanah - 50, 30, 100),
                new WoodBlock(kiri + 230, tanah - 115, 80, 30)
            );
            this.pigs.push(
                new Pig(kiri, tanah - 20, 100),
                new Pig(kiri + 230, tanah - 150, 100)
            );
        } else {
            let kiri = this.canvas.width - 360;
            let kanan = this.canvas.width - 100;
            this.blocks.push(
                new WoodBlock(kiri - 50, tanah - 50, 30, 100,150),
                new WoodBlock(kiri + 50, tanah - 50, 30, 100,150),
                new WoodBlock(kiri, tanah - 115, 130, 30),
                new WoodBlock(kanan - 50, tanah - 50, 30, 100,150),
                new WoodBlock(kanan + 50, tanah - 50, 30, 100),
                new WoodBlock(kanan, tanah - 115, 130, 30,150),
                new WoodBlock((kiri + kanan) / 2, tanah - 140, 180, 20,150)
            );
            this.pigs.push(
                new Pig(kiri, tanah - 20, 100),
                new Pig(kanan, tanah - 20, 100),
                new Pig((kiri + kanan) / 2, tanah - 170, 100)
            );
        }

        this.nextBird();
    }

    setEvent() {
        if (this.eventsReady) return;
        this.eventsReady = true;

        this.canvas.addEventListener('mousedown', (event) => {
            if (this.status !== 'playing' || !this.bird) return;
            if (event.button !== 0) return;

            let rect = this.canvas.getBoundingClientRect();
            let x = (event.clientX - rect.left) * this.canvas.width / rect.width;
            let y = (event.clientY - rect.top) * this.canvas.height / rect.height;
            this.ketapel.startDrag(this.bird, x, y);
        });

        window.addEventListener('mousemove', (event) => {
            if (!this.bird || !this.ketapel.dragging) return;

            let rect = this.canvas.getBoundingClientRect();
            let x = (event.clientX - rect.left) * this.canvas.width / rect.width;
            let y = (event.clientY - rect.top) * this.canvas.height / rect.height;
            this.ketapel.drag(this.bird, x, y);
        });

        window.addEventListener('mouseup', (event) => {
            if (event.button !== 0 || !this.bird) return;
            if (this.ketapel.release(this.bird)) {
                this.hitObjects = [];
                this.shotTime = 0;
            }
        });
    }

    update(dt) {
        if (this.status !== 'playing') return;
        if (this.bird) this.bird.update(dt,this.graf);
        for (let pig of this.pigs) pig.update(dt,this.graf);
        for (let block of this.blocks) block.update(dt,this.graf);

        this.checkCollisions(dt);

        if (this.bird && this.bird.state === 'flying') {
            this.shotTime += dt;
            let diTanah = this.bird.y + this.bird.radius >= this.groundY - 1;
            let berhenti = Math.abs(this.bird.vx) < 20 && Math.abs(this.bird.vy) < 20;

            if ((diTanah && berhenti) || this.shotTime > 3) {
                this.nextBird();
            }
            
        }
        this.checkGameStatus();
    }

    // Tabrakan dengan tanah, antar kayu, babi, dan burung.
    checkCollisions(dt) {
        // Semua objek tidak boleh jatuh melewati tanah.
        let objek = [];
        if (this.bird && this.bird.state === 'flying') {
            objek.push(this.bird);
        }

        for (let pig of this.pigs) {
            if (pig.condition !== 'dead') objek.push(pig);
        }

        for (let block of this.blocks) {
            if (block.condition !== 'destroyed') objek.push(block);
        }

        for (let obj of objek) {
            let lebar;
            let tinggi;
            
            if (obj instanceof(WoodBlock)){
                lebar = obj.width / 2;
                tinggi =obj.height / 2;
            }
            else{
                lebar = obj.radius
                tinggi = obj.radius
            }
            // kiri
            if (obj.x < lebar) {
                // langsung ganti burung 
                if (obj === this.bird) {   
                    this.nextBird();
                    continue;
                }
            }

            // atas
            if (obj.y - tinggi < 0) {
                obj.y = tinggi;
                // mantul ke bawah jika kena atas                   
                if (obj.vy < 0) obj.vy *= -0.9;    
            }

            // kanan
            if (obj.x + lebar >= this.canvas.width) {
                if (obj === this.bird) {
                    this.nextBird();
                    continue;
                }

                // selain burung mantau balik
                obj.x = this.canvas.width - lebar;
                if (obj.vx > 0) obj.vx *= -0.5;
            }

            // objek melewati tanah
            if (obj.y + tinggi >= this.groundY) {
                obj.y = this.groundY - tinggi;

                // burung mantul tanah
                if (obj === this.bird) {
                    // console.log('Kena tanah:', obj.vx, obj.vy);
                    obj.vy *= -0.3;  // Burung memantul ke atas sedikit
                    obj.vx *= 0.6;
                // objek lain langung berhenti di tanah
                } else {
                    obj.vy = 0;
                }
                // Gesekan dengan tanah
                obj.vx *= 0.92;
                
               
            }

        }
           

        // Kayu saling menahan agar bisa ditumpuk.
        for (let i = 0; i < this.blocks.length; i++) {
            let a = this.blocks[i];
            if (a.condition === 'destroyed') continue;


            // Cek kayu jatuh menimpa babi
            for (let pig of this.pigs) {
                if (pig.condition === 'dead') continue;

                for (let block of this.blocks) {
                    if (block.condition === 'destroyed') continue;

                    let dx = pig.x - block.x;
                    let dy = pig.y - block.y;

                    let tumpangX = block.width / 2 + pig.radius - Math.abs(dx);
                    let tumpangY = block.height / 2 + pig.radius - Math.abs(dy);

                    if (tumpangX > 0 && tumpangY > 0) {

                        if (block.y < pig.y && block.vy > block.minDamageSpeed) {
                            if (!block.hitPigs.includes(pig)) {
                                pig.takeDamage(block.damage);
                                block.hitPigs.push(pig);
                                console.log("Babi terkena kayu! HP:", pig.hp);
                            }
                        }

                        if(block.x < pig.x && block.vx > block.minDamageSpeed){
                            if (!block.hitPigs.includes(pig)) {
                                pig.takeDamage(block.damage);
                                block.hitPigs.push(pig);
                                console.log("Babi terkena kayu! HP:", pig.hp);
                            }
                        }
                    }
                    
                }
            }

            // kayu dengan kayu
            for (let j = i + 1; j < this.blocks.length; j++) {
                let b = this.blocks[j];
                if (b.condition === 'destroyed') continue;

                let dx = a.x - b.x;
                let dy = a.y - b.y;
                let tumpangX = (a.width + b.width) / 2 - Math.abs(dx);
                let tumpangY = (a.height + b.height) / 2 - Math.abs(dy);
                if (tumpangX <= 0 || tumpangY <= 0) continue;

                // atas dan bawah
                if (tumpangY < tumpangX) {
                    let atas ;
                    if(a.y<b.y){
                        atas = a;
                    }else{
                        atas = b;
                    }
                    let bawah;
                    if(a.y<b.y){
                        bawah = b;
                    }else{
                        bawah = a;
                    }
                    atas.y = bawah.y - bawah.height / 2 - atas.height / 2;
                    if (atas.vy > 0) {
                        atas.vy = 0 ;
                        atas.vx *= 0.965;
                    }
                    
                } 
                // kiri dan kanan
                else {
                    // blok a di kiri blok b di kanan
                    if (dx < 0) a.x -= tumpangX / 2;
                    else a.x += tumpangX / 2;
                    if (dx < 0) b.x += tumpangX / 2;
                    else b.x -= tumpangX / 2;
                    a.vx = 0;
                    b.vx = 0;
                }
            }
        }

        // Babi tidak menembus kayu.
        for (let pig of this.pigs) {
            if (pig.condition === 'dead') continue;

            for (let block of this.blocks) {
                if (block.condition === 'destroyed') continue;
                let dx = pig.x - block.x;
                let dy = pig.y - block.y;
                let tumpangX = block.width / 2 + pig.radius - Math.abs(dx);
                let tumpangY = block.height / 2 + pig.radius - Math.abs(dy);
                if (tumpangX <= 0 || tumpangY <= 0) continue;

                if (tumpangY < tumpangX) {
                    if (dy < 0) {
                        // Babi berada di atas kayu
                        pig.y -= tumpangY;
                        if (pig.vy > 0) pig.vy = 0;
                        pig.vx *= 0.995     
                    } else {
                        // Kayu berada di atas babi
                        block.y -= tumpangY;
                        if (block.vy > 0) block.vy = 0;
                    }
                } else {
                    // Tabrakan dari samping
                    if (dx < 0) pig.x -= tumpangX;
                    else pig.x += tumpangX;
                }

                // Kayu yang bergerak mendorong babi
                if (Math.abs(block.vx) > 20) {
                    pig.vx = block.vx;
                }
            }

            
        }

        // Tidak ada tabrakan tembakan ketika burung masih di ketapel.
        if (!this.bird || this.bird.state !== 'flying') return;
        let bird = this.bird;

        // Burung menabrak babi
        for (let pig of this.pigs) {
            if (pig.condition === 'dead') continue;
            let dx = bird.x - pig.x;
            let dy = bird.y - pig.y;
            let jarak = Math.sqrt(dx * dx + dy * dy);
            if (jarak >= bird.radius + pig.radius) continue;

            if (!this.hitObjects.includes(pig)) {
                pig.takeDamage(bird.damage);
                pig.push(bird.vx * 0.2, bird.vy * 0.1);
                this.hitObjects.push(pig);
            }
            if (jarak > 0) {
                bird.x += dx / jarak * (bird.radius + pig.radius - jarak);
                bird.y += dy / jarak * (bird.radius + pig.radius - jarak);
            }
            bird.vx *= 0.35;
            bird.vy *= 0.7;
        }

        // Burung menabrak kayu
        for (let block of this.blocks) {
            if (block.condition === 'destroyed') continue;
            let dx = bird.x - block.x;
            let dy = bird.y - block.y;
            let tumpangX = block.width / 2 + bird.radius - Math.abs(dx);
            let tumpangY = block.height / 2 + bird.radius - Math.abs(dy);
            if (tumpangX <= 0 || tumpangY <= 0) continue;

            // cek apakah sudah menabrak 
            if (!this.hitObjects.includes(block)) {
                block.takeDamage(bird.damage);
                block.push(bird.vx * 0.9, bird.vy * 0.4);
                this.hitObjects.push(block);
            }

            // burung nabrak kiri atau kanan kayu 
            if (tumpangX < tumpangY) {

                if (dx < 0){
                    bird.x -= tumpangX;
                } 
                else{
                    bird.x += tumpangX;
                } 
                bird.vx *= -0.3;
            }

            // burung nabrak atas atau bawah kayu
            else {
                if (dy < 0){
                    bird.y -= tumpangY;
                } 
                else{
                    bird.y += tumpangY;
                }
                bird.vy *= -0.35;
                bird.vx *= 0.9;
            }
        }
    }

    nextBird() {
        if (this.bird && this.bird.state === 'flying') {
            this.bird.state = 'done';
            this.bird.vx = 0;
            this.bird.vy = 0;
        }

        this.bird = null;
        for (let bird of this.birds) {
            if (bird.state === 'ready') {
                this.bird = bird;
                break;
            }
        }
        this.hitObjects = [];
        this.shotTime = 0;
        this.ketapel.dragging = false;
    }

    // Menang jika semua babi mati, kalah jika burung habis.
    checkGameStatus() {
        let babiHidup = 0;
        for (let pig of this.pigs) {
            if (pig.condition !== 'dead') babiHidup++;
        }

        if (babiHidup === 0) {
            this.status = 'won';
        } else if (this.bird === null) {
            this.status = 'lost';
        }
    }

    start() {
        if (this.running) return;
        this.running = true;

        const game = this;  
        let waktuLalu = 0;

        function loop(ev) {
            let dt = (ev - waktuLalu) / 1000;
            waktuLalu = ev;
            if (dt > 0.04) dt = 0.04;

            game.update(dt);  
            game.draw();
            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
    }

    drawPath() {
        if (!this.bird || !this.ketapel.dragging) return;

        const ketapel = this.ketapel;
        const W = this.canvas.width;
        const putih = {r: 255, g: 255, b: 255};
        const dt = 1 / 120;       
        let x = this.bird.x;
        let y = this.bird.y;
        let vx = (ketapel.x - this.bird.x) * ketapel.power;
        let vy = (ketapel.y - this.bird.y) * ketapel.power;

        for (let langkah = 1; langkah <= 70; langkah++) {
            vy += 350 * dt;
            x += vx * dt;
            y += vy * dt;

            if (x < 3 || x > W - 4 || y > this.groundY) break;
            
            if (y < 3) continue;

            
            if (langkah % 6 === 0) {
                const px = Math.round(x)
                const py = Math.round(y)
                var r = 2;
                if (langkah<40) r=3
                this.graf.lingkaran_polar(px, py, r, putih);

            }
        }
    }

    draw() {
        const hitam = {r: 10, g: 30, b: 40};
        const hijau = {r:50, g:200, b:70};
        const W = this.canvas.width
        const H = this.canvas.height
        let tepi = [
            {x:0, y:0},
            {x:this.canvas.width - 1, y:0},
            {x:this.canvas.width - 1, y:this.canvas.height - 1},
            {x:0, y:this.canvas.height - 1}
        ];

        let tanah = [
            {x: 0, y: this.groundY},
            {x: W - 1, y: this.groundY},
            {x: W - 1, y: H - 1},
            {x: 0, y: H -1},
        ]
        
        // Tanah
        this.graf.clearScreen(this.context, this.canvas);
        this.graf.polygon(tanah, hijau);
        this.graf.dda_line(0, this.groundY, this.canvas.width - 1, this.groundY, hijau);
        this.graf.FloodFillNonRecursive(508, 468, hijau, hijau)
        this.graf.polygon(tepi, hitam)

        for (let block of this.blocks) block.draw(this.graf);
        this.ketapel.draw(this.graf, this.bird);
        this.drawPath()
        if (this.bird) this.bird.draw(this.graf);
        for (let pig of this.pigs) pig.draw(this.graf);

        this.context.putImageData(this.graf.image_data, 0, 0);
    }
}