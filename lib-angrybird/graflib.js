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
        const W = this.image_data.width
        const H = this.image_data.height
        const stack = []
        stack.push({x:Math.round(x),y:Math.round(y)})
        while (stack.length>0){
            const current = stack.pop()
            // Lewati titik di luar canvas agar tidak loop tanpa akhir
            if (current.x < 0 || current.x >= W || current.y < 0 || current.y >= H){
                continue;
            }
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









