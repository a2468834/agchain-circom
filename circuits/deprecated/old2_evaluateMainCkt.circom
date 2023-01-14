pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/compconstant.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

// template threshold() {
//     signal input selector;
//     signal output avg_threshold[6];
//     signal output var_threshold[2];
//     // signal output dst_threshold[2];
    
//     component bits = Num2Bits(254);
//     component comp = CompConstant(6);
    
//     bits.in <== selector;
    
//     for (var i = 0; i < 254; i++) {
//         comp.in[i] <== bits.out[i];
//     }
    
//     comp.out === 0; // `selector` <= 6
    
//     // TEMPERATURE_DIFFERENCE
//     if (selector == 0) {
//         avg_threshold[0] <== 7 * (10 ** 8);
//         avg_threshold[1] <== 2 * (10 ** 8);
//         avg_threshold[2] <== 5 * (10 ** 8);
//         avg_threshold[3] <== 2 * (10 ** 8);
//         avg_threshold[4] <== 0;
//         avg_threshold[5] <== 0;
//         var_threshold[0] <== 10000000; // 0.1
//         var_threshold[1] <== 50000000; // 0.5
//         // dst_threshold[0] <== 70000000; // 0.7
//         // dst_threshold[1] <== 30000000; // 0.3
//     }  
//     if (selector == 1) {
//         avg_threshold[0] <== 26 * (10 ** 8);
//         avg_threshold[1] <== 1  * (10 ** 8);
//         avg_threshold[2] <== 15 * (10 ** 8);
//         avg_threshold[3] <== 250000000; // 2.5
//         avg_threshold[4] <== 0;
//         avg_threshold[5] <== 0;
//         var_threshold[0] <== 10000000; // 0.1
//         var_threshold[1] <== 50000000; // 0.5
//         // dst_threshold[0] <== 70000000; // 0.7
//         // dst_threshold[1] <== 30000000; // 0.3
//     }  
//     if (selector == 2) {
//         avg_threshold[0] <== 22 * (10 ** 8);
//         avg_threshold[1] <== 60000000; // 0.6
//         avg_threshold[2] <== 18 * (10 ** 8);
//         avg_threshold[3] <== 160000000; // 1.6
//         avg_threshold[4] <== 0;
//         avg_threshold[5] <== 0;
//         var_threshold[0] <== 10000000; // 0.1
//         var_threshold[1] <== 50000000; // 0.5
//         // dst_threshold[0] <== 70000000; // 0.7
//         // dst_threshold[1] <== 30000000; // 0.3
//     }  
//     if (selector == 3) {
//         avg_threshold[0] <== 90 * (10 ** 8);
//         avg_threshold[1] <== 250000000; // 2.5
//         avg_threshold[2] <== 55 * (10 ** 8);
//         avg_threshold[3] <== 75000000;// 0.75
//         avg_threshold[4] <== 0;
//         avg_threshold[5] <== 0;
//         var_threshold[0] <== 10000000; // 0.1
//         var_threshold[1] <== 50000000; // 0.5
//         // dst_threshold[0] <== 70000000; // 0.7
//         // dst_threshold[1] <== 30000000; // 0.3
//     }  
//     if (selector == 4) {
//         avg_threshold[0] <== 30 * (10 ** 8);
//         avg_threshold[1] <== 2 * (10 ** 8);
//         avg_threshold[2] <== 17 * (10 ** 8);
//         avg_threshold[3] <== 1 * (10 ** 8);
//         avg_threshold[4] <== 0;
//         avg_threshold[5] <== 0;
//         var_threshold[0] <== 10000000; // 0.1
//         var_threshold[1] <== 50000000; // 0.5
//         // dst_threshold[0] <== 70000000; // 0.7
//         // dst_threshold[1] <== 30000000; // 0.3
//     }  
//     if (selector == 5) {
//         avg_threshold[0] <== 50000000; // 0.5
//         avg_threshold[1] <== 1 * (10 ** 8);
//         avg_threshold[2] <== 0;
//         avg_threshold[3] <== 0;
//         avg_threshold[4] <== 0;
//         avg_threshold[5] <== 0;
//         var_threshold[0] <== 10000000; // 0.1
//         var_threshold[1] <== 50000000; // 0.5
//         // dst_threshold[0] <== 70000000; // 0.7
//         // dst_threshold[1] <== 30000000; // 0.3
//     }  
//     else {
//         avg_threshold[0] <== 400 * (10 ** 8);
//         avg_threshold[1] <== 4 * (10 ** 8);
//         avg_threshold[2] <== 1000 * (10 ** 8);
//         avg_threshold[3] <== 2000 * (10 ** 8);
//         avg_threshold[4] <== 4000 * (10 ** 8);
//         avg_threshold[5] <== 25 * (10 ** 8);
//         var_threshold[0] <== 10000000; // 0.1
//         var_threshold[1] <== 50000000; // 0.5
//         // dst_threshold[0] <== 70000000; // 0.7
//         // dst_threshold[1] <== 30000000; // 0.3
//     }
// }

template arrayAvg(length) {
    signal input in[length];
    signal output out;
    
    var sum = 0;
    
    for (var i = 0; i < length; i++) {
        sum = sum + in[i];
    }
    
    out <== (sum \ length); // Do Z(p) floor division
}

template arrayVar(length) {
    signal input in[length];
    signal output out;
    
    component average = arrayAvg(length);
    
    for (var i = 0; i < length; i++) {
        average.in[i] <== in[i];
    }
    
    var sum = 0;
    
    for (var i = 0; i < length; i++) {
        sum = sum + ((in[i] - average.out) * (in[i] - average.out));
    }
    
    out <== (sum \ length); // Do Z(p) floor division
}

function abs(x) {
    return (x > 0) ? (x):(0 - x);
}

template Main(length) {
    signal input metric;
    signal input value[length];
    signal input score;
    
    // component constant = threshold();
    // constant.selector <== metric;
    // `constant.avg_threshold[6]`
    // `constant.var_threshold[2]`
    
    component average = arrayAvg(length);
    for (var i = 0; i < length; i++) {
        average.in[i] <== value[i];
    }
    // `average.out`    
    
    component variance = arrayVar(length);
    for (var i = 0; i < length; i++) {
        variance.in[i] <== value[i];
    }
    // `variance.out`
    
    component AT_point = metricAT();
    AT_point.average <== average.out;
    AT_point.variance <== variance.out;
    // for (var i = 0; i < 6; i++) {
    //     AT_point.avg_threshold[i] <== constant.avg_threshold[i];
    // }
    // for (var i = 0; i < 2; i++) {
    //     AT_point.var_threshold[i] <== constant.var_threshold[i];
    // }
    // `AT_point.out`
    
    signal output out;
    out <== AT_point.out;
}

template metricAT() {
    signal input average;
    signal input variance;
    signal output out;
    
    var avg_point;
    var var_point;
    
    var param1 = 100 * (10 ** 8);
    var param2 = 10 * (10 ** 8);
    var param3 = 27 * (10 ** 8);
    var param4 = 3 * (10 ** 8);
    var param5 = 2 * (10 ** 8);
    
    if ((average > 25 * (10 ** 8)) && (average < 30 * (10 ** 8))) {
        avg_point = param1 - (param2 * abs(average - param3)) \ param4;
    }
    else {
        avg_point = param1 - (param2 * abs(average - param3)) \ param5;
    }
    
    if (variance < 5 * (10**8)) {
        var_point = 100 * (10 ** 8);
    }
    if (variance < 10 * (10**8)) {
        var_point = 90 * (10 ** 8);
    }
    if (variance <= 50 * (10**8)) {
        var_point = 90 * (10 ** 8) - (variance - 10 * (10 ** 8)) \ 80000000;
    }
    else {
        var_point = 30 * (10 ** 8);
    }
    
    out <== avg_point * 70000000 + var_point * 30000000;
}

template metricTD() {
}

template metricST() {
}

template metricAH() {
}

template metricSH() {
}

template metricWC() {
}

template metricSE() {
}

component main { public [metric,value,score] } = Main(4);