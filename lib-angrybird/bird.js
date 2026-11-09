export default class Bird{
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
        this.state = 'ready'
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

    update(dt,graf) {
        if (this.state !== 'flying') {
            return;
        }
        this.vy += 350 * dt;
        const M = graf.create_translate(this.vx*dt,this.vy*dt)
        const point = graf.transform_point({x:this.x, y:this.y},M)
        this.x = point.x
        this.y = point.y;
    }
   

    reset() {
        this.x = this.startX; 
        this.y = this.startY;
        this.vx = this.vy = 0; 
        this.state = 'ready'; 
    }
    draw(graf) {
        if (this.state === 'done') return;

        const x = this.x
        const y = this.y
        const merah = {r: 220, g: 30, b: 40}
        const putih = {r: 255, g: 255, b: 255}
        const oranye = {r: 255, g: 170, b: 0}
        const hitam = {r: 1, b: 2, g: 3}

        // Badan burung
        graf.lingkaran_polar(this.x, this.y, this.radius, merah);
        graf.FloodFillNonRecursive(Math.round(x), Math.round(y), merah, merah)

        // Pupil
        graf.lingkaran_polar(this.x + 6, this.y - 5, 5, hitam);
        graf.FloodFillNonRecursive(Math.round(this.x + 6), Math.round(this.y - 5), hitam, putih)
        graf.lingkaran_polar(this.x + 6, this.y -5, 2, hitam)
        graf.FloodFillNonRecursive(Math.round(this.x + 6), Math.round(this.y -5), hitam, hitam)
        


        // Paruh
        graf.polygon([{x:this.x+14,y:this.y-2}, {x:this.x+26,y:this.y+3}, {x:this.x+14,y:this.y+7}], oranye);
        graf.FloodFillNonRecursive(Math.round(this.x + 18), Math.round(this.y + 3), oranye, oranye)        

    }
}
