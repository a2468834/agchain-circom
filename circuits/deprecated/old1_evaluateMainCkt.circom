pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/compconstant.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

function abs(x) {
    return (x > 0) ? (x):(0 - x);
}

template checkArrayAvg(length) {
    signal input average;
    signal input in[length];
    
    var sum = 0;
    
    for (var i = 0; i < length; i++) {
        sum = sum + in[i];
    }
    
    average === (sum \ length); // Do Z(p) floor division
}

template checkArrayVar(length) {
    signal input variance;
    signal input in_SDM[length];
        
    var sum;
    
    for (var i = 0; i < length; i++) {
        sum = sum + in_SDM[i];
    }
    
    variance === (sum \ length); // Do Z(p) floor division
}

// SDM := Squared Deviations from the Mean
template checkArraySDM(length) {
    signal input average;
    signal input in[length];
    signal input in_SDM[length];
    
    for (var i = 0; i < length; i++) {
        in_SDM[i] === ((in[i] - average) ** 2);
    }
}

template Main(length) {
    signal input metric;
    signal input average;
    signal input variance;
    signal input value[length];
    signal input value_SDM[length];
    signal input score;
    
    // component constant = threshold();
    // constant.selector <== metric;
    // `constant.avg_threshold[6]`
    // `constant.var_threshold[2]`
    
    component check1 = checkArrayAvg(length);
    check1.average <== average;
    for (var i = 0; i < length; i++) {
        check1.in[i] <== value[i];
    }
    
    component check2 = checkArraySDM(length);
    check2.average <== average;
    for (var i = 0; i < length; i++) {
        check2.in[i] <== value[i];
    }
    for (var i = 0; i < length; i++) {
        check2.in_SDM[i] <== value_SDM[i];
    }
    
    component check3 = checkArrayVar(length);
    check3.variance <== variance;
    for (var i = 0; i < length; i++) {
        check3.in_SDM[i] <== value_SDM[i];
    }
        
    var AT_point = metricAT(average, variance);
    log(AT_point);
    
    component equal = IsEqual();
    equal.in[0] <-- score;
    equal.in[1] <-- AT_point;
    
    0 === equal.out;
    
    // AT_point.average <== average.out;
    // AT_point.variance <== variance.out;
    // for (var i = 0; i < 6; i++) {
    //     AT_point.avg_threshold[i] <== constant.avg_threshold[i];
    // }
    // for (var i = 0; i < 2; i++) {
    //     AT_point.var_threshold[i] <== constant.var_threshold[i];
    // }
    // `AT_point.out`
}

function metricAT(average, variance) {
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
    
    return avg_point * 70000000 + var_point * 30000000;
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

component main { public [metric,value] } = Main(172800);