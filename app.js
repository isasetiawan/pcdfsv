var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var image = new Image();
var imgmatrx; //current image
var imgmatrx_ori; //original image
var paramater = document.getElementById('val');
var sizeinfo = document.getElementById('ukuran');

document.getElementById('btnClear').onclick = clear;
document.getElementById('btnZoom').onclick = function(){
    if (paramater.value > 0)
        scale(paramater.value);
    sizeinfo.innerHTML = imgmatrx.shape[0] + 'x' + imgmatrx.shape[1]
};
document.getElementById('btnflipx').onclick = flipx;
document.getElementById('btnflipy').onclick = flipy;
document.getElementById('btnrot').onclick = function(){
    if (paramater.value > 0)
        rotate(paramater.value);
    sizeinfo.innerHTML = imgmatrx.shape[0] + 'x' + imgmatrx.shape[1]

};
document.getElementById('btnsave').onclick = function(){
    document.getElementById('btnsave').href = canvas.toDataURL("image/png");
    document.getElementById('btnsave').download = 'gambarku.png'
};

document.getElementById('kelabu').onclick = function () { maekgrey() };
document.getElementById('equali').onclick = equalization;

image.onload = function () {
    console.log("image loaded");
    // clear()
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    imgmatrx = nj.images.read(image);
    imgmatrx_ori = imgmatrx;
    sizeinfo.innerHTML = imgmatrx.shape[0] + 'x' + imgmatrx.shape[1]

};

function clear(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
}

function openfile(e) {
    var files = e.files;
    if (!files.length) return;
    image.src = URL.createObjectURL(files[0])
}

// *
// *
// Basic Operation  
// *
// *

function scale(n){
    var size = imgmatrx.shape;

    var zoomed = nj.zeros([
        Math.floor(size[0]*n),
        Math.floor(size[1]*n),
        size[2]],
    'uint8');

    var isrgb = size[2];
    var z_dim = 1;
    if (isrgb) {
        z_dim = isrgb;
    } else {
        zoomed = nj.zeros([
            Math.floor(size[0]*n),
            Math.floor(size[1]*n)],
        'uint8');
    }

    var newsize = zoomed.shape;

    for (var y = 0; y < newsize[0]; y++){
        for (var x = 0; x < newsize[1]; x++){
            for (var z = 0; z < z_dim; z++){
                if (isrgb){
                    zoomed.set(y,x,z,imgmatrx.get(Math.floor(y/n),Math.floor(x/n),z))
                } else {
                    zoomed.set(y,x,imgmatrx.get(Math.floor(y/n),Math.floor(x/n)))
                }
            }
        }
    }
    sizeinfo.innerHTML = newsize[0] + 'x' + newsize[1];
    clear();
    canvas.height = newsize[0];
    canvas.width = newsize[1];
    imgmatrx = zoomed;
    nj.images.save(zoomed,canvas)
}

function flipy(){
    var flipped = nj.zeros(imgmatrx.shape);
    var shape = imgmatrx.shape;
    var isrgb = shape[2];
    var z_dim = 1;
    if (isrgb) {
        z_dim = isrgb;
    }

    for (var y = 0; y < shape[0]; y++){
        for (var x = 0; x < shape[1]; x++){
            for (var z = 0; z < z_dim; z++){
                if (isrgb){
                    flipped.set(y,shape[1]-x-1,z,imgmatrx.get(y,x,z))
                } else {
                    flipped.set(y,shape[1]-x-1,imgmatrx.get(y,x))                    
                }
            }
        }
    }

    imgmatrx = flipped;
    nj.images.save(imgmatrx,canvas)
}

function flipx(){
    var flipped = nj.zeros(imgmatrx.shape);
    var shape = imgmatrx.shape;
    var isrgb = shape[2];
    var z_dim = 1;
    if (isrgb) {
        z_dim = isrgb;
    }

    for (var y = 0; y < shape[0]; y++){
        for (var x = 0; x < shape[1]; x++){
            for (var z = 0; z < z_dim; z++){
                if (isrgb){
                    flipped.set(shape[0]-y-1,x,z,imgmatrx.get(y,x,z))
                } else {
                    flipped.set(shape[0]-y-1,x,imgmatrx.get(y,x))                    
                }
            }
        }
    }

    imgmatrx = flipped;
    nj.images.save(imgmatrx,canvas)

}

function crop(xa,ya,xb,yb){
    var newH = yb - ya;
    var newW = xb - xa;

    var croppedsize = imgmatrx.shape;
    croppedsize[0] = newH;
    croppedsize[1] = newW;

    var croped = nj.zeros(croppedsize);
    var newsize = croped.shape;

    for (var y = 0; y < newH; y++){
        for (var x = 0; x < newW; x++){
            if (croppedsize[2]!=undefined){
                for (var z = 0; z < croppedsize[2]; z++){
                    croped.set(y,x,z,imgmatrx.get(y+ya,x+xa,z))
                }
            } else {
                croped.set(y,x,imgmatrx.get(y+ya,x+xa))
            }
        }
    }

    sizeinfo.innerHTML = croppedsize[0] + 'x' + croppedsize[1];

    // clear()
    canvas.height = newH;
    canvas.width = newW;
    nj.images.save(croped,canvas);
    imgmatrx = croped
}

var iscropactive = false;
function cropactivated(){
    iscropactive = !iscropactive;
    //set listener
    if (iscropactive){
        document.getElementById('btncrop').classList.add('active');
        canvas.onmousedown = begingetpoint;
        canvas.onmouseup = endgetpoint;
    } else {
        document.getElementById('btncrop').classList.remove('active');        
        canvas.onmousedown = null;
        canvas.onmouseup = null;
    }
}

document.getElementById('btncrop').onclick = cropactivated;

//untuk mendapatkan nilai posisi
//a adalah awal, b adalah ahir
var xa,ya,xb,yb;
function begingetpoint(e){
    xa = e.offsetX;
    ya = e.offsetY
};
function endgetpoint (e){
    xb = e.offsetX;
    yb = e.offsetY;
    //jika penarikan gambar dari arah berlawanan maka nilai awal adalah akhir dan sebaliknya
    var temp = 0;
    if (xa > xb) {
        temp = xa;
        xa = xb;
        xb = temp
    }
    if (ya > yb){
        temp = ya;
        ya = yb;
        yb = temp
    }
    crop(xa,ya,xb,yb)
};

function rotate(tetha){
    //menentukan ukurna citra setelah rotasi
    var radians = tetha * Math.PI / 180;
    var size = imgmatrx.shape; //[H,W,n]
    var newH,newW;
    if (tetha<=90) {
        newH = (size[1] * Math.sin(radians)) + (size[0] * Math.cos(radians));
        newW = (size[1] * Math.cos(radians)) + (size[0] * Math.sin(radians))
    }
    // if (tetha>90) {
    //     var ha = size[1]
    //     var wa = size[0]

    //     var tethaa = tetha - 90
    //     var radiansa = tethaa * Math.PI / 180
    //     newW = (wa * Math.cos(radiansa)) + (ha * Math.sin(radiansa))
    //     newH = (wa * Math.sin(radiansa)) + (ha * Math.cos(radiansa))
    // }

    var rotated = nj.zeros([
        Math.floor(newH),
        Math.floor(newW),
        size[2]
    ]);

    // mengisi matrix rotated
    for (var y = 0; y < size[0]; y++){
        for (var x = 0; x < size[1]; x++){
            var newX = (x * Math.cos(radians)) - (y * Math.sin(radians));
            var newY = (x * Math.sin(radians)) + (y * Math.cos(radians));
            for (var z = 0; z < size[2]; z++){
                rotated.set(Math.floor(newY),Math.floor(newX),z,imgmatrx_ori.get(y,x,z))
            }
        }
    }

    canvas.height = newH;
    canvas.width = newW;
    clear();
    nj.images.save(rotated,canvas);
    imgmatrx = rotated
}

// *
// *
// Grey Section
// *
// *

//inisialisasi chart histogram
var label = [];
for (var i=0; i < 256; i++){
    label[i] = i + '';
}
var chart_histo = new Chart(document.getElementById("histogram"), {
    type: 'bar',
    options: {
        legend: { display: true },
        title: {
            display: true,
            text: 'Histogram Kelabu'
        }
    }
});

//membuat citra menjadi kelabu
function maekgrey() {
    //perlihatkan grafik histogram
    document.getElementById('histogram').style.visibility="visible"
    //kelabukan citra
    imgmatrx = nj.images.rgb2gray(imgmatrx);
    // hitung histogram
    histogram();
    //tampilkan citra kelabu
    nj.images.save(imgmatrx, canvas)
    document.getElementById('equali').disabled = false;
    document.getElementById('spesifi').disabled = false;
    document.getElementById('kelabu').disabled = true;
    document.getElementById('edgedet').disabled = false;
}

//variabel global histogram
var histo = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);

//memuat data histogram kelabu
function histogram() {
    histo.map(x=>0);
    size = imgmatrx.shape;

    for (var y = 0; y < size[0]; y++) {
        for (var x = 0; x < size[1]; x++) {
            histo[imgmatrx.get(y, x)] += 1;
        }
    }

    chart_histo.data.datasets = [{
        data: histo
    }];
    chart_histo.data.labels = label;
    chart_histo.update()
}

var probs = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
function equalization() {
    var size = imgmatrx.shape;
    var n_pixel = imgmatrx.shape[0] * imgmatrx.shape[1];
    var imgequalized = nj.zeros(size)
    probs = probs.map((x, i)=>histo[i]/n_pixel);
    var cum_probs = probs.map((x, i) => probs.slice(0,i).reduce((sum, value) => sum + value, 0) )
    var eq_histo = cum_probs.map(x => Math.round(x*255))

    for (var y = 0; y < size[0]; y++){
        for (var x = 0; x < size[1]; x++){
            imgequalized.set(y, x, eq_histo[imgmatrx.get(y,x,0)])
        }
    }
    imgmatrx = imgequalized;

    nj.images.save(imgequalized,canvas);
    histogram();
    console.log(eq_histo);
}

document.getElementById('histogram').onmousedown = getdesiredhisto;

function getdesiredhisto(e){
    var points = chart_histo.getElementsAtEvent(e);
    console.log(e.screenX,e.screenY);
}

function spesification(){
    var size = imgmatrx.shape;
    var n_pixel = imgmatrx.shape[0] * imgmatrx.shape[1];

    var desired_histo = Array.apply(null, new Array(256)).map(Number.prototype.valueOf,0);
    desired_histo = desired_histo.map((x, i) => i);
    // Equalization Desired Histogram
    var probs_des = desired_histo.map(x => x/n_pixel);
    var cum_probs = probs_des.map((x, i) => probs_des.slice(0,i).reduce((sum, value) => sum + value, 0) )
    console.log(cum_probs)

}

// *
// *
// Filtering Section
// *
// *

function meanfiltering(neighbor_size){
    var filtered = nj.zeros(imgmatrx.shape);

    for (var channel = 0; channel < filtered.shape[2]; channel++){
        for (var y = 0; y < filtered.shape[0]; y++){
            for (var x = 0; x < filtered.shape[1]; x++){
                //mendapatkan rata-rata pixel-pixel tetangga
                var sum_of_pixels = 0;
                for (var n = y - Math.floor(neighbor_size/2); n <= y + Math.floor(neighbor_size/2); n++){
                    for (var m = x - Math.floor(neighbor_size/2); m <= x + Math.floor(neighbor_size/2) ; m++){
                        var pixel = imgmatrx.get(n,m,channel);
                        if (pixel !== undefined){
                            sum_of_pixels += pixel;
                        }
                    }
                }
                var average_pixels = sum_of_pixels / (neighbor_size*neighbor_size);
                filtered.set(y,x,channel,Math.floor(average_pixels));
            }
        }
    }
    imgmatrx = filtered;
    nj.images.save(imgmatrx,canvas);
    console.log("done");
}

function modefiltering(neighbor_size){
    var filtered = nj.zeros(imgmatrx.shape);

    for (var channel = 0; channel < filtered.shape[2]; channel++){
        for (var y = 0; y < filtered.shape[0]; y++){
            for (var x = 0; x < filtered.shape[1]; x++){
                //mendapatkan modus dari pixel-pixel tetangga
                var neighbor_pixels = [];
                for (var n = y - Math.floor(neighbor_size/2); n <= y + Math.floor(neighbor_size/2); n++){
                    for (var m = x - Math.floor(neighbor_size/2); m <= x + Math.floor(neighbor_size/2) ; m++){
                        var pixel = imgmatrx.get(n,m,channel);
                        if (pixel !== undefined){
                            neighbor_pixels.push(pixel);
                        }
                    }
                }
                filtered.set(y,x,channel,mode(neighbor_pixels));
            }
        }
    }
    imgmatrx = filtered;
    nj.images.save(imgmatrx,canvas);
    console.log("done");
}

function medianfiltering(neighbor_size){
    var filtered = nj.zeros(imgmatrx.shape);

    for (var channel = 0; channel < filtered.shape[2]; channel++){
        for (var y = 0; y < filtered.shape[0]; y++){
            for (var x = 0; x < filtered.shape[1]; x++){
                //mendapatkan modus dari pixel-pixel tetangga
                var neighbor_pixels = [];
                for (var n = y - Math.floor(neighbor_size/2); n <= y + Math.floor(neighbor_size/2); n++){
                    for (var m = x - Math.floor(neighbor_size/2); m <= x + Math.floor(neighbor_size/2) ; m++){
                        var pixel = imgmatrx.get(n,m,channel);
                        if (pixel !== undefined){
                            neighbor_pixels.push(pixel);
                        }
                    }
                }
                filtered.set(y,x,channel,median(neighbor_pixels));
            }
        }
    }
    imgmatrx = filtered;
    nj.images.save(imgmatrx,canvas);
    console.log("done");
}

// document.getElementById('gaus').onclick = function(e) {
//     var k = nj.array([[1.0, 2.0, 1.0], [2.0, 4.0, 2.0], [1.0, 2.0, 1.0]]);
//     nj.multiply(k,1.0/16.0)
//     convolve(k);
// }

document.getElementById('sharp').onclick = function(e) {
    var k = nj.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]]);
    convolve(k);
}

document.getElementById('mean').onclick = function(e) {
    if (paramater.value>0 && paramater.value%2===1){
        meanfiltering(paramater.value);
    } else {
        alert("masukkan parameter yang lebih dari nol dan ganjil");
    }
}

document.getElementById('median').onclick = function(e) {
    if (paramater.value>0 && paramater.value%2===1){
        medianfiltering(paramater.value);
    } else {
        alert("masukkan parameter yang lebih dari nol dan ganjil");
    }
}

document.getElementById('modus').onclick = function(e) {
    if (paramater.value>0 && paramater.value%2===1){
        modefiltering(paramater.value);
    } else {
        alert("masukkan parameter yang lebih dari nol dan ganjil");
    }
}

function marker(x,y){
    ctx.fillStyle = "rgba("+100+","+100+","+100+","+(0/255)+")";
    ctx.fillRect( x, y, 1, 1 );
}

// edge detection section

function convolve(kernel){

    var ker_size = kernel.shape[0]
    var half_ker = Math.floor(ker_size/2); //setengah ukuran kernel simetris
    var flat_kernle = kernel.flatten();

    var convolved = nj.zeros(imgmatrx.shape);
    size = imgmatrx.shape

    var isrgb = imgmatrx.shape[2];
    var z = 1;
    if (isrgb) {
        z = isrgb;
    }

    for (var c = 0; c < z; c++){
        for (var y = 2; y < size[0]-2; y++){
            for (var x = 2; x < size[1]-2; x++){
                //Mendapatkan pixels tetangga
                var neighbor_pixels = [];
                for (var n = y - half_ker; n <= y + half_ker; n++){
                    for (var m = x - half_ker; m <= x + half_ker ; m++){
                        var pixel;
                        if (isrgb){
                            pixel = imgmatrx.get(n,m,c);
                        } else {
                            pixel = imgmatrx.get(n,m);
                        }
                        if (pixel === undefined){
                            neighbor_pixels.push(0);
                        } else {
                            neighbor_pixels.push(pixel);
                        }
                    }
                }

                // mengalikan kernel dengan pixel tetangga
                var multiplied = neighbor_pixels.map((x,i)=> flat_kernle.get(i)*x);
                // menjumlahkan pixel tetana hasil perkalian
                var result = multiplied.reduce((acc,x)=>acc+x);

                if (isrgb){
                    convolved.set(y,x,c,result);
                } else {
                    convolved.set(y,x,result);
                }

            }
        }
    }
    console.log("done");
    imgmatrx = convolved;
    nj.images.save(imgmatrx,canvas);
}

function normalisasi(taknormal){
    var factor = 255/(taknormal.max()-taknormal.min())
    var subres = nj.subtract(taknormal, taknormal.min())
    return nj.multiply(subres,factor);
}

function padding(){
    var w = imgmatrx.shape[0];
    var h = imgmatrx.shape[1];

    var paded = nj.zeros([w+4,h+4]);

    for (var y = 0; y < w; y++){
        for (var x = 0; x < h; x++){
            var pixel = imgmatrx.get(y,x);
            paded.set(y+2,x+2,pixel);
        }
    }

    return paded
}

function toninary(){
    var binimages = nj.zeros(imgmatrx.shape);

    for (var y = 0; y < imgmatrx.shape[0]; y++){
        for (var x = 0; x < imgmatrx.shape[1]; x++){
            var pix = imgmatrx.get(y,x);
            if (pix > 0) {
                binimages.set(y,x,255);
            } else {
                binimages.set(y,x,0);
            }
        }
    }

    imgmatrx = binimages;
    nj.images.save(imgmatrx,canvas);
    histogram();
}

// var labe = 0;
// var labels;


// function regionContourLabeling(){
//     labels = nj.zeros(imgmatrx.shape);

//     var w = imgmatrx.shape[0];
//     var h = imgmatrx.shape[1];

//     var outer_contour = [];
//     var inner_contour = [];

//     var r = 0;

//     for (var y = 0; y < w; y++){
//         labe = 0;
//         for (var x = 0; x < h; x++){
//             if (imgmatrx.get(y,x) > 0){
//                 if (labe !== 0 ) {
//                     labels.set(y,x,labe)
//                 } else {
//                     labe = labels.get(y,x);
//                     if (labe === 0) {
//                         r += 1;
//                         labe = r;
//                         var c = TraceContour([y,x],0,labe);
//                         outer_contour.push(c);
//                         labels.get(y,x,label);
//                     }
//                 }
//             } else {
//                 if (labe !== 0){
//                     if (labels.get(y,x) === 0){
//                         var c = TraceContour([y-1,x],1,label);
//                         inner_contour.push(c);
//                     }
//                     labe = 0;
//                 }
//             }
//         }
//     }
//     return [inner_contour,outer_contour,labels]
// }

// function TraceContour(xs, ds, labe){
//     next_point = FindNextContour(xs,ds);
//     c = [];
//     c.push(next_point.x);
//     var xp = xs;
//     var xc = next_point.x;

//     var done = JSON.stringify(xs) === JSON.stringify(next_point.x);
//     while (!done){
//         labels.set(xc[0],xc[1], labe);
//         next_point_n = FindNextContour(xc,(d + 6) % 8);
//         xp = xc;
//         xc = next_point_n.x;
//         done = (JSON.stringify(xp) === JSON.stringify(xs) || JSON.stringify(xc) === JSON.stringify(next_point.x))
//         if (!done){
//             c.push(next_point_n.x);
//         }
//     }
//     return c;
// }

// function FindNextContour(x, d){
//     var new_d = 0;
//     for (var i = 0; i < 7; i++){
//         console.log(x);
//         var xn = [x[0] + Delta(d)[0], x[1] + Delta(d)[1]]
//         if (imgmatrx.get(xn[0],xn[1]) === 0){
//             labels.set((xn[0],xn[1],-1));
//             d = (d + 1) % 8;
//         } else {
//             return {x:x,d:d}
//         }
//     }
//     return {x:x,d:d}
// }

// function Delta(d){
//     delta_x = [1, 1, 0, -1, -1, -1,  0,  1]
//     delta_y = [0, 1, 1,  1,  0, -1, -1, -1]
//     return [delta_x[d], delta_y[d]]
// }

function edgedetection(){
    var kernel = nj.array([[0,1,0],[1,-4,1],[0,1,0]]);
    convolve(kernel);
    histogram();
    document.getElementById('binari').disabled = false;
}

//morphology section

function dilasi(neighbor_size){
    var filtered = nj.zeros(imgmatrx.shape);

    var isrgb = imgmatrx.shape[2];
    var z = 1;
    if (isrgb) {
        z = isrgb;
    }

    for (var channel = 0; channel < z; channel++){
        for (var y = 0; y < filtered.shape[0]; y++){
            for (var x = 0; x < filtered.shape[1]; x++){
                //mendapatkan modus dari pixel-pixel tetangga
                var neighbor_pixels = [];
                for (var n = y - Math.floor(neighbor_size/2); n <= y + Math.floor(neighbor_size/2); n++){
                    for (var m = x - Math.floor(neighbor_size/2); m <= x + Math.floor(neighbor_size/2) ; m++){
                        var pixel;
                        if (isrgb){
                            pixel = imgmatrx.get(n,m,channel);
                        } else {
                            pixel = imgmatrx.get(n,m);
                        }
                        if (pixel !== undefined){
                            neighbor_pixels.push(pixel);
                        }
                    }
                }
                var ma = Math.max.apply(null, neighbor_pixels);
                if (isrgb) {
                    filtered.set(y,x,channel, ma);
                } else {
                    filtered.set(y,x,ma);
                }
            }
        }
    }
    imgmatrx = filtered;
    nj.images.save(imgmatrx,canvas);
    console.log("done");
}

function erosi(neighbor_size){
    var filtered = nj.zeros(imgmatrx.shape);

    var isrgb = imgmatrx.shape[2];
    var z = 1;
    if (isrgb) {
        z = isrgb;
    }

    for (var channel = 0; channel < z; channel++){
        for (var y = 0; y < filtered.shape[0]; y++){
            for (var x = 0; x < filtered.shape[1]; x++){
                //mendapatkan modus dari pixel-pixel tetangga
                var neighbor_pixels = [];
                for (var n = y - Math.floor(neighbor_size/2); n <= y + Math.floor(neighbor_size/2); n++){
                    for (var m = x - Math.floor(neighbor_size/2); m <= x + Math.floor(neighbor_size/2) ; m++){
                        var pixel;
                        if (isrgb){
                            pixel = imgmatrx.get(n,m,channel);
                        } else {
                            pixel = imgmatrx.get(n,m);
                        }
                        if (pixel !== undefined){
                            neighbor_pixels.push(pixel);
                        }
                    }
                }
                var mi = Math.min.apply(null, neighbor_pixels);
                if (isrgb) {
                    filtered.set(y,x,channel, mi);
                } else {
                    filtered.set(y,x,mi);
                }
            }
        }
    }
    imgmatrx = filtered;
    nj.images.save(imgmatrx,canvas);
    console.log("done");
}

document.getElementById('dilasi').onclick = function(e) {
    if (paramater.value>0 && paramater.value%2===1){
        dilasi(paramater.value);
    } else {
        alert("masukkan parameter yang lebih dari nol dan ganjil");
    }
}

document.getElementById('erosi').onclick = function(e) {
    if (paramater.value>0 && paramater.value%2===1){
        erosi(paramater.value);
    } else {
        alert("masukkan parameter yang lebih dari nol dan ganjil");
    }
}