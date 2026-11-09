export default class WoodBlock {
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

    update(dt,graf) {
        if (this.condition === 'destroyed') return;

        this.vy += 400 * dt;
        
        this.vx *= 0.96;

        if (Math.abs(this.vx) < 2) {
            this.vx = 0;
        }
        const M = graf.create_translate(this.vx*dt,this.vy*dt)
        const point = graf.transform_point({x:this.x, y:this.y},M)
        this.x = point.x
        this.y = point.y
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
        const coklatMuda = {r: 205, g: 145, b: 80}

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

        graf.FloodFillNonRecursive(Math.round(this.x), Math.round(this.y), coklat, coklatMuda); 

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