export default class GrafLib{

    constructor(canvas_width, image_data){
        this.canvas_width = canvas_width
        this.image_data = image_data

    }

    draw_dot(x,y,color) {
        let index = 4*(x+(y*this.canvas_width));
        this.image_data.data[index] = color.r;
        this.image_data.data[index+1] = color.g;
        this.image_data.data[index+2] = color.b;
        this.image_data.data[index+3] = 255;
    }

    dda_line(x1, y1, x2, y2, color) {
        let dx = x2 - x1;
        let dy = y2 - y1;


        if (Math.abs(dx) > Math.abs(dy)) {
            if (x1 > x2) {
                var y = y1;

                for (var x = x1; x >= x2; x--) {
                    this.draw_dot(
                        Math.round(x),
                        Math.round(y),
                        color
                    );

                    y += dy / Math.abs(dx);
                }
            } else {
                var y = y1;

                for (var x = x1; x <= x2; x++) {
                    this.draw_dot(
                        Math.round(x),
                        Math.round(y),
                        color
                    );

                    y += dy / Math.abs(dx);
                }
            }
        } else {
            if (y1 > y2) {
                var x = x1;

                for (var y = y1; y >= y2; y--) {
                    this.draw_dot(
                        Math.round(x),
                        Math.round(y),
                        color
                    );

                    x += dx / Math.abs(dy);
                }
            } else {
                var x = x1;

                for (var y = y1; y <= y2; y++) {
                    this.draw_dot(
                        Math.round(x),
                        Math.round(y),
                        color
                    );

                    x += dx / Math.abs(dy);
                }
            }
        }
    }


    polygon(array_titik,color){
        for(var i=0;i<array_titik.length-1;i++){
            this.dda_line(array_titik[i].x,array_titik[i].y,
            array_titik[i+1].x,array_titik[i+1].y,color)
        }
        this.dda_line(array_titik[i].x,array_titik[i].y,
        array_titik[0].x,array_titik[0].y,color)
    }

    get_dot(x,y){
        let index = 4*(x+(y*this.canvas_width));
        let r = this.image_data.data[index]
        let g = this.image_data.data[index+1]
        let b = this.image_data.data[index+2]
        return{r:r,g:g,b:b}
    }
    
    check_warna(warna_sekarang,warna_stop){
        let flag = 0
        if((warna_sekarang.r != warna_stop.r) || (warna_sekarang.g != warna_stop.g) || (warna_sekarang.b != warna_stop.b)){
            flag = 1
        }
        return flag
    }
    
    boundary_fill(x,y,warna_stop,warna_cat){
        let warna_sekarang = this.get_dot(x,y);
        if(this.check_warna(warna_sekarang,warna_stop)==0 || (this.check_warna(warna_sekarang,warna_cat)==0) ){
            return;
        }
        else{
            this.draw_dot(x,y,warna_cat);
            this.boundary_fill(x+1,y,warna_stop,warna_cat)
            this.boundary_fill(x-1,y,warna_stop,warna_cat)
            this.boundary_fill(x,y+1,warna_stop,warna_cat)
            this.boundary_fill(x,y-1,warna_stop,warna_cat)
        }
    
    }
    
    FloodFillNonRecursive(x,y,warna_stop,warna_cat){
        const stack = []
        stack.push({x:x,y:y})
        while (stack.length>0){
            const current = stack.pop()
            const currentColor = this.get_dot(current.x,current.y)
            if(this.check_warna(currentColor,warna_stop)==0 || (this.check_warna(currentColor,warna_cat)==0) ){
                continue;
            }
            this.draw_dot(current.x,current.y,warna_cat)
            stack.push({x:current.x+1,y:current.y})
            stack.push({x:current.x-1,y:current.y})
            stack.push({x:current.x,y:current.y+1})
            stack.push({x:current.x,y:current.y-1})
            
        }
    }

    lingkaran_polar(xc,yc,radius,color){
        for(let theta=0;theta<=Math.PI*2;theta+=1/radius){
            let x = xc + radius*Math.cos(theta)
            let y = yc + radius*Math.sin(theta)
            this.draw_dot(Math.round(x),Math.round(y),color)
        }
    }
    
    ellipse_polar(xc,yc,radiusX,radiusY,color){
        for(let theta=0;theta<=Math.PI*2;theta+=0.01){
            let x = xc + radiusX*Math.cos(theta)
            let y = yc + radiusY*Math.sin(theta)
            this.draw_dot(Math.round(x),Math.round(y),color)
        }
    }

    multiply(matA,matB){
        let hasil = []
        for (let i=0;i<matA.length;i++){
            hasil.push([])
            for (let j=0;j<matB.length;j++){
                let sum = 0
                for (let k=0;k<matA.length;k++){
                    sum += matA[i][k]*matB[k][j]
                }
                hasil[i].push(sum)
            }
        }
        return hasil
    }
    
    transform_point(point,matT){
        return{
            x: point.x * matT[0][0] + point.y * matT[0][1] +  matT[0][2]*1,
            y: point.x * matT[1][0] + point.y *  matT[1][1] + matT[1][2]*1
        }
    
    }

    
    transform_points(points,matT){
        let hasil = []
        for(let i=0;i<points.length;i++){
            hasil.push(this.transform_point(points[i],matT))
        }
        return hasil
    }

    create_identity(){

        return[
            [1,0,0],
            [0,1,0],
            [0,0,1]
        ]
    }

    create_translate(tx,ty){

        return[
            [1,0,tx],
            [0,1,ty],
            [0,0,1]
        ];
    }

    create_scale (sx,sy){
        return[
            [sx,0,0],
            [0,sy,0],
            [0,0,1]
        ]
    }
    create_rotation(degree){
        return[
            [Math.cos(degree * Math.PI / 180),-Math.sin(degree * Math.PI / 180),0],
            [Math.sin(degree * Math.PI / 180),Math.cos(degree * Math.PI / 180),0],
            [0,0,1]
        ]
    }
    create_fixedp_rotation(xc,yc,degree){
        let m1 = this.create_translate(-xc,-yc)
        let m2 = this.create_rotation(degree)
        let m3 = this.create_translate(xc,yc)
        let hasil = this.multiply(this.multiply(m3,m2),m1)
        return hasil

    }
    create_fixedp_scale(xc,yc,sx,sy){
        let m1 = this.create_translate(-xc,-yc)
        let m2 = this.create_scale(sx,sy)
        let m3 = this.create_translate(xc,yc)
        let hasil = this.multiply(this.multiply(m3,m2),m1)
        return hasil
    }

    clearScreen(context,canvas_handler){
        context.clearRect(
            0,0,
            canvas_handler.width,
            canvas_handler.height
        )
    
        this.image_data = context.getImageData(
            0,0,
            canvas_handler.width,
            canvas_handler.height
        )
    }
}

export class Bird{
    constructor(x, y, color, damage = 50) {
        this.startX = x
        this.startY = y
        this.x = x
        this.y = y
        this.color = color
        this.damage = damage
        this.radius = 18
        this.vx = 0
        this.vy = 0
        // ready, flying, dragging, stopped, done
        this.state = 'ready'
        this.skillUsed = false
    }

    getState(){
        return this.state
    }

    setState(state){
        this.state = state
    }

    launch(vx, vy) { 
        this.vx = vx; 
        this.vy = vy; 
        this.state = 'flying'; 
    }

    update(dt) {
        if (this.state !== 'flying') {
            return;
        }
        this.vy += 300 * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }
    useSkill(game) { 
        return false; 
    }

    reset() {
        this.x = this.startX; 
        this.y = this.startY;
        this.vx = this.vy = 0; 
        this.state = 'ready'; 
        this.skillUsed = false;
    }
    draw(graf) {
        if (this.state === 'done') return;

        const x = this.x
        const y = this.y
        const r = this.radius
        const merah = {r: 120, g: 0, b: 0}
        const putih = {r: 255, g: 255, b: 255}
        

        graf.lingkaran_polar(this.x, this.y, this.radius, this.color);
        graf.lingkaran_polar(this.x + 6, this.y - 5, 3, {r:0,g:0,b:0});
        graf.polygon(
            [{x:this.x+14,y:this.y-2},{x:this.x+26,y:this.y+3},
            {x:this.x+14,y:this.y+7}], {r:230,g:140,b:0}
        );
    }



}


export class Pig {
    constructor(x, y, maxHp) {
        this.startX = x
        this.startY = y
        this.x = x
        this.y = y
        this.maxHp = maxHp
        this.hp = maxHp
        this.state = 'idle'
        this.condition = 'healthy'
        this.radius = 20;
        this.vx = 0;
        this.vy = 0;

    }

    update(dt) {
        if (this.condition === 'dead') {
            return;
        }
        this.vy += 300 * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
    }

    takeDamage(damage) {
        this.hp -= damage
        if (this.hp <= 0){
            this.condition = 'dead'
        }
        else if (this.hp <= this.maxHp *0.5){
            this.condition = 'unhealthy'
        }else {
            this.condition = 'healthy';
        }
    }


    getCondition() {
        return this.condition
    }

    push(vx, vy) {
        this.vx += vx
        this.vy += vy
    }

    draw(graf) {
        if (this.condition === 'dead') return;

        const x = this.x;
        const y = this.y;
        const r = this.radius;

        const hijau = { r: 90, g: 180, b: 50 };
        const hijauGelap = { r: 40, g: 100, b: 30 };
        const hitam = { r: 0, g: 0, b: 0 };
        const ungu = { r: 140, g: 60, b: 180 };

        // Telinga
        graf.lingkaran_polar(x - r * 0.6, y - r * 0.8, r * 0.3, hijau);
        graf.lingkaran_polar(x + r * 0.6, y - r * 0.8, r * 0.3, hijau);

        // Kepala
        graf.lingkaran_polar(x, y, r, hijau);

        // Lingkaran mata
        var warnaMata;
        if (this.condition === 'unhealthy'){
            warnaMata = ungu
        }else{
            warnaMata = hijauGelap;
        }

        graf.lingkaran_polar(x - r * 0.35, y - r * 0.25, r * 0.22, warnaMata);
        graf.lingkaran_polar(x + r * 0.35, y - r * 0.25, r * 0.22, warnaMata);

        // Pupil
        graf.lingkaran_polar(x - r * 0.35, y - r * 0.25, r * 0.08, hitam);
        graf.lingkaran_polar(x + r * 0.35, y - r * 0.25, r * 0.08, hitam);

        // Moncong
        graf.ellipse_polar(x, y + r * 0.25, r * 0.4, r * 0.28, hijauGelap);

        // Lubang hidung
        graf.lingkaran_polar(x - r * 0.15, y + r * 0.25, r * 0.07, hitam);
        graf.lingkaran_polar(x + r * 0.15, y + r * 0.25, r * 0.07, hitam);

        // Luka X di pipi
        if (this.condition === 'unhealthy') {
            const pipiX = x - r * 0.65;
            const pipiY = y + r * 0.3;
            const ukuran = r * 0.13;

            graf.dda_line(
                pipiX - ukuran, pipiY - ukuran,
                pipiX + ukuran, pipiY + ukuran,
                ungu
            );

            graf.dda_line(
                pipiX - ukuran, pipiY + ukuran,
                pipiX + ukuran, pipiY - ukuran,
                ungu
            );
        }
    }
}

export class WoodBlock {
    constructor(x, y, width, height, maxHp = 150,damage = 50) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.maxHp = maxHp;
        this.hp = maxHp;
        this.condition = 'healthy';
        this.damage = damage
        this.minDamageSpeed = 30;
        this.hitPigs = [];

        this.vx = 0;
        this.vy = 0;
        

        this.theta = 0;
    }

    update(dt) {
        if (this.condition === 'destroyed') return;

        this.vy += 400 * dt;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.vx *= 0.96;

        if (Math.abs(this.vx) < 10) {
            this.vx = 0;
        }
    }

    takeDamage(damage) {
        if (this.condition === 'destroyed') return;

        this.hp -= damage;

        if (this.hp <= 0) {
            this.condition = 'destroyed';
        } else if (this.hp <= this.maxHp * 0.5) {
            this.condition = 'cracked';
        } else {
            this.condition = 'healthy';
        }
    }

    getCondition() {
        return this.condition;
    }

    push(vx, vy) {
        if (this.condition === 'destroyed') return;

        this.vx += vx;
        this.vy += vy;
    }

    draw(graf) {
        if (this.condition === 'destroyed') return;

        const coklat = { r: 150, g: 90, b: 40 };
        const coklatGelap = { r: 85, g: 45, b: 20 };

        const w = this.width / 2;
        const h = this.height / 2;

       
        const titikKayu = [
            { x: -w, y: -h },
            { x:  w, y: -h },
            { x:  w, y:  h },
            { x: -w, y:  h }
        ];

        const rotasi = graf.create_rotation(this.theta);
        const translasi = graf.create_translate(this.x, this.y);
        const transformasi = graf.multiply(translasi, rotasi);

        const hasil = graf.transform_points(titikKayu,transformasi);

        graf.polygon(hasil, coklat);

        if (this.condition === 'cracked') {
            const retakan = [
                { x: -w * 0.3, y: -h },
                { x:  w * 0.2, y: -h * 0.3 },
                { x: -w * 0.2, y:  h * 0.3 },
                { x:  w * 0.3, y:  h }
            ];

            const hasilRetakan = graf.transform_points(
                retakan,
                transformasi
            );

            for (let i = 0; i < hasilRetakan.length - 1; i++) {
                graf.dda_line(
                    hasilRetakan[i].x,
                    hasilRetakan[i].y,
                    hasilRetakan[i + 1].x,
                    hasilRetakan[i + 1].y,
                    coklatGelap
                );
            }
        }
    }
}

export class SlingShot {
    constructor(x, y, maxPull = 80, power = 5) {
        this.x = x;
        this.y = y;

        this.maxPull = maxPull;
        this.power = power;
        this.dragging = false;
    }

    startDrag(bird, mouseX, mouseY) {
        if (bird.getState() !== 'ready'){
            return false;
        }

        const dx = mouseX - bird.x;
        const dy = mouseY - bird.y;
        const jarak = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        if (jarak > bird.radius) return false;

        this.dragging = true;
        bird.setState('dragging');

        return true;
    }

    drag(bird, mouseX, mouseY) {
        if (!this.dragging) return;

        let dx = mouseX - this.x;
        let dy = mouseY - this.y;

        const jarak = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        // Batasi jarak burung dari pusat ketapel
        if (jarak > this.maxPull) {
            dx = dx / jarak * this.maxPull;
            dy = dy / jarak * this.maxPull;
        }

        bird.x = this.x + dx;
        bird.y = this.y + dy;
    }

    release(bird) {
        if (!this.dragging) return false;

        // Arah lontaran berlawanan dengan arah tarikan
        const vx = (this.x - bird.x) * this.power;
        const vy = (this.y - bird.y) * this.power;

        this.dragging = false;
        bird.launch(vx, vy);

        return true;
    }

    draw(graf, bird) {
        const coklat = { r: 120, g: 65, b: 25 };
        const karet = { r: 65, g: 35, b: 20 };
        const warna_cat = { r: 107, g: 64, b: 20 }

        const titikKayu = [
            { x: this.x - 7,  y: this.y + 100 },
            { x: this.x + 7,  y: this.y + 100 },
            { x: this.x + 7,  y: this.y + 30 },
            { x: this.x + 26, y: this.y - 5 },
            { x: this.x + 14, y: this.y - 10 },
            { x: this.x,      y: this.y + 15 },
            { x: this.x - 14, y: this.y - 10 },
            { x: this.x - 26, y: this.y - 5 },
            { x: this.x - 7,  y: this.y + 30 }
        ];

        graf.polygon(titikKayu, coklat);
        graf.boundary_fill(this.x, this.y + 30, coklat, warna_cat);

        let ujungX = this.x;
        let ujungY = this.y;


        if (bird && (bird.state === 'ready' || bird.state === 'dragging')){
            ujungX = bird.x;
            ujungY = bird.y;
        }

        graf.dda_line(
            this.x - 20, this.y - 7,
            ujungX, ujungY,
            karet
        );

        graf.dda_line(
            this.x + 20, this.y - 7,
            ujungX, ujungY,
            karet
        );


    }
}

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        let imageData = this.context.getImageData(0, 0, canvas.width, canvas.height);
        this.graf = new GrafLib(canvas.width, imageData);

        this.groundY = canvas.height - 40;
        this.ketapel = new SlingShot(150, this.groundY - 100, 80, 7);
        this.birds = [];
        this.pigs = [];
        this.blocks = [];
        this.bird = null;

        this.status = 'start';
        this.level = 1;
        this.maxLevel = 3;
        this.running = false;
        this.eventsReady = false;
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

        let merah = {r:255, g:0, b:0};
        for (let i = 0; i < 10; i++) {
            this.birds.push(new Bird(this.ketapel.x, this.ketapel.y, merah, 100));
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
            let kiri = this.canvas.width - 300;
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

    // Mengatur mouse saat menekan, menggeser, dan melepas ketapel.
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

    // Menggerakkan semua objek, lalu memeriksa tabrakan.
    update(dt) {
        if (this.status !== 'playing') return;
        if (dt > 0.04) dt = 0.04;

        if (this.bird) this.bird.update(dt);
        for (let pig of this.pigs) pig.update(dt);
        for (let block of this.blocks) block.update(dt);

        this.checkCollisions(dt);

        if (this.bird && this.bird.state === 'flying') {
            this.shotTime += dt;
            let diTanah = this.bird.y + this.bird.radius >= this.groundY - 1;
            let berhenti = Math.abs(this.bird.vx) < 20 && Math.abs(this.bird.vy) < 20;

            // Ganti burung jika sudah berhenti atau terlalu lama terbang.
            if ((diTanah && berhenti) || this.shotTime > 7) {
                this.nextBird();
            }
        }
        this.checkGameStatus();
    }

    // Tabrakan dengan tanah, antar kayu, babi, dan burung.
    checkCollisions(dt) {
        // 1. Semua objek tidak boleh jatuh melewati tanah.
        let objek = [];
        if (this.bird && this.bird.state === 'flying') objek.push(this.bird);
        for (let pig of this.pigs) {
            if (pig.condition !== 'dead') objek.push(pig);
        }
        for (let block of this.blocks) {
            if (block.condition !== 'destroyed') objek.push(block);
        }

        for (let obj of objek) {
            let lebar = obj.radius || obj.width / 2;
            let tinggi = obj.radius || obj.height / 2;

            if (obj.x < lebar) {
                obj.x = lebar;
                if (obj.vx < 0) obj.vx *= -0.3;
            }
            if (obj.x + lebar >= this.canvas.width) {

                if (obj === this.bird) {
                    this.nextBird();
                    continue;
                }

                obj.x = this.canvas.width - lebar;
                if (obj.vx > 0) obj.vx *= -0.3;
            }
            if (obj.y + tinggi >= this.groundY) {
                obj.y = this.groundY - tinggi;
                if (obj === this.bird && obj.vy > 40) {
                    obj.vy *= -0.3;  // Burung memantul sedikit
                } else {
                    obj.vy = 0;
                }
                obj.vx *= 0.9; // Gesekan dengan tanah
            }
        }

        // 2. Kayu saling menahan agar bisa ditumpuk.
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
                    }
                }
            }

            for (let j = i + 1; j < this.blocks.length; j++) {
                let b = this.blocks[j];
                if (b.condition === 'destroyed') continue;

                let dx = a.x - b.x;
                let dy = a.y - b.y;
                let tumpangX = (a.width + b.width) / 2 - Math.abs(dx);
                let tumpangY = (a.height + b.height) / 2 - Math.abs(dy);
                if (tumpangX <= 0 || tumpangY <= 0) continue;

                if (tumpangY < tumpangX) {
                    let atas = a.y < b.y ? a : b;
                    let bawah = a.y < b.y ? b : a;
                    atas.y = bawah.y - bawah.height / 2 - atas.height / 2;
                    if (atas.vy > 0) atas.vy = 0;
                } else {
                    if (dx < 0) a.x -= tumpangX / 2;
                    else a.x += tumpangX / 2;
                    if (dx < 0) b.x += tumpangX / 2;
                    else b.x -= tumpangX / 2;
                    a.vx = 0;
                    b.vx = 0;
                }
            }
        }

        // 3. Babi tidak menembus kayu (termasuk babi di atas kayu).
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
                    pig.vx = block.vx * 0.8;
                }
            }

            
        }

        // Tidak ada tabrakan tembakan ketika burung masih di ketapel.
        if (!this.bird || this.bird.state !== 'flying') return;
        let bird = this.bird;

        // 4. Burung menabrak babi (lingkaran dengan lingkaran).
        for (let pig of this.pigs) {
            if (pig.condition === 'dead') continue;
            let dx = bird.x - pig.x;
            let dy = bird.y - pig.y;
            let jarak = Math.sqrt(dx * dx + dy * dy);
            if (jarak >= bird.radius + pig.radius) continue;

            if (this.hitObjects.indexOf(pig) === -1) {
                pig.takeDamage(bird.damage);
                pig.push(bird.vx * 0.2, bird.vy * 0.1);
                this.hitObjects.push(pig);
            }
            if (jarak > 0) {
                bird.x += dx / jarak * (bird.radius + pig.radius - jarak);
                bird.y += dy / jarak * (bird.radius + pig.radius - jarak);
            }
            bird.vx *= -0.35;
            bird.vy *= 0.7;
        }

        // 5. Burung menabrak kayu (lingkaran dan kotak sederhana).
        for (let block of this.blocks) {
            if (block.condition === 'destroyed') continue;
            let dx = bird.x - block.x;
            let dy = bird.y - block.y;
            let tumpangX = block.width / 2 + bird.radius - Math.abs(dx);
            let tumpangY = block.height / 2 + bird.radius - Math.abs(dy);
            if (tumpangX <= 0 || tumpangY <= 0) continue;

            if (this.hitObjects.indexOf(block) === -1) {
                block.takeDamage(bird.damage);
                block.push(bird.vx * 0.25, bird.vy * 0.1);
                this.hitObjects.push(block);
            }
            if (tumpangX < tumpangY) {
                if (dx < 0) bird.x -= tumpangX;
                else bird.x += tumpangX;
                bird.vx *= -0.3;
            } else {
                if (dy < 0) bird.y -= tumpangY;
                else bird.y += tumpangY;
                bird.vy *= -0.3;
            }
        }
    }

    // Mengambil burung yang belum pernah ditembak.
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

    // Menjalankan animasi game.
    start() {
        if (this.running) return;
        this.running = true;
        let waktuLalu = 0;

        const loop = (waktu) => {
            let dt = (waktu - waktuLalu) / 1000;
            waktuLalu = waktu;
            if (dt > 0.04) dt = 0.04;

            this.update(dt);
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    draw() {
        let hitam = {r:10, g:10, b:10};
        let hijau = {r:0, g:255, b:0};
        let tepi = [
            {x:0, y:0},
            {x:this.canvas.width - 1, y:0},
            {x:this.canvas.width - 1, y:this.canvas.height - 1},
            {x:0, y:this.canvas.height - 1}
        ];

        this.graf.clearScreen(this.context, this.canvas);
        this.graf.polygon(tepi, hitam);
        this.graf.dda_line(0, this.groundY, this.canvas.width - 1, this.groundY, hijau);

        for (let block of this.blocks) block.draw(this.graf);
        this.ketapel.draw(this.graf, this.bird);
        if (this.bird) this.bird.draw(this.graf);
        for (let pig of this.pigs) pig.draw(this.graf);

        this.context.putImageData(this.graf.image_data, 0, 0);
    }
}
