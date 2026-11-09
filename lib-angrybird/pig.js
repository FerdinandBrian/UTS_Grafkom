export default class Pig {
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
        this.theta = 0

    }

    update(dt,graf) {
        if (this.condition === 'dead') {
            return;
        }
        this.vy += 350 * dt;
        const M = graf.create_translate(this.vx*dt,this.vy*dt)
        const point = graf.transform_point({x:this.x, y:this.y},M)
        this.x = point.x
        this.y = point.y
        this.theta += (this.vx / this.radius) * (dt+0.002) * 180 / Math.PI;
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

        const r = this.radius;
        const hijau      = { r: 90,  g: 180, b: 50 };
        const hijauGelap = { r: 40,  g: 100, b: 30 };
        const hitam      = { r: 0,   g: 0,   b: 0 };
        const ungu       = { r: 140, g: 60,  b: 180 };
        const putih      = { r: 255, g: 255, b: 255 };

        const rotasi    = graf.create_rotation(this.theta);
        const translasi = graf.create_translate(this.x, this.y);
        const M = graf.multiply(translasi, rotasi);


        const pusat     = graf.transform_point({x: 0, y: 0},M);
        const telingaKi = graf.transform_point({x: -r * 0.6,  y: -r * 0.8},M);
        const telingaKa = graf.transform_point({x:  r * 0.6,  y: -r * 0.8},M);
        const mataKi    = graf.transform_point({x: -r * 0.35, y: -r * 0.25},M);
        const mataKa    = graf.transform_point({x:  r * 0.35, y: -r * 0.25},M);
        const moncong   = graf.transform_point({x: 0,         y:  r * 0.25},M);
        const hidungKi  = graf.transform_point({x: -r * 0.15, y:  r * 0.25},M);
        const hidungKa  = graf.transform_point({x:  r * 0.15, y:  r * 0.25},M);

        // Telinga
        graf.lingkaran_polar(telingaKi.x, telingaKi.y, r * 0.3, hijau);  
        graf.FloodFillNonRecursive(telingaKi.x, telingaKi.y, hijau, hijau);
        graf.lingkaran_polar(telingaKa.x, telingaKa.y, r * 0.3, hijau);
        graf.FloodFillNonRecursive(telingaKa.x, telingaKa.y, hijau, hijau);

        // Kepala
        graf.lingkaran_polar(pusat.x, pusat.y, r, hijau);
        graf.FloodFillNonRecursive(pusat.x, pusat.y, hijau, hijau);

        // Mata
        let warnaMata = hijauGelap;
        if (this.condition === 'unhealthy') warnaMata = ungu;

        for (const m of [mataKi, mataKa]) {
            graf.lingkaran_polar(m.x, m.y, r * 0.22, warnaMata);
            graf.FloodFillNonRecursive(m.x, m.y, warnaMata, putih);
            if (this.getCondition() === 'unhealthy') {
                graf.FloodFillNonRecursive(m.x, m.y, warnaMata, warnaMata);
            }

            // Pupil
            graf.lingkaran_polar(m.x, m.y, r * 0.08, hitam);
            graf.FloodFillNonRecursive(m.x, m.y, warnaMata, hitam);
            if (this.getCondition() === 'unhealthy') {
                graf.FloodFillNonRecursive(m.x, m.y, hitam, putih);
                graf.draw_dot(m.x, m.y, hitam);
            }
        }

        // Moncong (lingkaran, karena elips tidak bisa ikut miring)
        graf.lingkaran_polar(moncong.x, moncong.y, r * 0.35, hijauGelap);

        // Lubang hidung
        graf.lingkaran_polar(hidungKi.x, hidungKi.y, r * 0.07, hitam);
        graf.lingkaran_polar(hidungKa.x, hidungKa.y, r * 0.07, hitam);

        
    }
}