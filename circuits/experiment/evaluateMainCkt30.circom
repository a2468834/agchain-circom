pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "./arrayChecking.circom";
include "./calculateMetric.circom";
include "./fixedPointArithmetic.circom";

template Main(length) {
    signal input metric;
    signal input average;
    signal input variance;
    signal input value[length];
    signal input value_SDM[length];
    signal input score;
    
    component check1 = checkArrayAvg(length);
    check1.average <== average;
    for (var i = 0; i < length; i++) {
        check1.in[i] <== value[i];
    }
    
    component check2 = checkArraySDM(length);
    check2.average <== average;
    for (var i = 0; i < length; i++) {
        check2.in[i] <== value[i];
        check2.in_SDM[i] <== value_SDM[i];
    }
    
    component check3 = checkArrayVar(length);
    check3.variance <== variance;
    for (var i = 0; i < length; i++) {
        check3.in_SDM[i] <== value_SDM[i];
    }
    
    var calculation;
    if (metric == 0) {
        // AT_point
        calculation = metricAT(average, variance);
    }
    else {
        if (metric == 1) {
            // TD_point
            calculation = metricTD(average, variance);
        }
        else {
            if (metric == 2) {
                // ST_point
                calculation = metricST(average, variance);
            }
            else {
                if (metric == 3) {
                    // AH_point
                    calculation =  metricAH(average, variance);
                }
                else {
                    if (metric == 4) {
                        // SH_point
                        calculation = metricSH(average, variance);
                    }
                    else {
                        if (metric == 5) {
                            // WC_point
                            calculation = metricWC(average, variance);
                        }
                        else { // metric == 6, SE_point
                            calculation = metricSE(average, variance);
                        }
                    }
                }
            }
        }
    }
    
    // Check the equalitues of all of seven `__point`
    component equal = IsEqual();
    equal.in[0] <-- score;
    equal.in[1] <-- calculation;
    1 === equal.out;
}

component main { public [metric,score] } = Main(30*1440);