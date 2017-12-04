
function mode(data){
    var max_val = Math.max.apply(null, data);
    var histog = Array(max_val+1).fill(0);
    for (var i = 0; i < data.length; i++){
        histog[data[i]] += 1;
    }
    var mode = Math.max.apply(null, histog);
    return histog.indexOf(mode);
}

function median(data){
    var sorted = data.sort();
    return sorted[Math.floor(sorted.length/2)]
}