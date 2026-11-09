export default class SlingShot {
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

        // jarak burung dari pusat ketapel
        if (jarak > this.maxPull) {
            dx = dx / jarak * this.maxPull;
            dy = dy / jarak * this.maxPull;
        }

        bird.x = this.x + dx;
        bird.y = this.y + dy;
    }

    release(bird) {
        if (!this.dragging) return false;

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