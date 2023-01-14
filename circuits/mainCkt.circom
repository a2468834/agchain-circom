pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "./arrayChecking.circom";
include "./calculateMetric.circom";
include "./fixedPointArithmetic.circom";

template Main(length) {
    signal input metric;            // The index of `value` array's metric attribute
    signal input average;           // Average value of the `value` array
    signal input variance;          // Variance value of the `value` array
    signal input value[length];     // The input data array of grading algorithm
    signal input value_SDM[length]; // The auxiliary array for calculating `variance`
    signal input score;             // The grading algorithm's final crop score
    
    // Check `average`
    component check1 = checkArrayAvg(length);
    check1.average <== average;
    for (var i = 0; i < length; i++) {
        check1.in[i] <== value[i];
    }
    
    // Check SDM array
    component check2 = checkArraySDM(length);
    check2.average <== average;
    for (var i = 0; i < length; i++) {
        check2.in[i] <== value[i];
        check2.in_SDM[i] <== value_SDM[i];
    }
    
    // Check `variance`
    component check3 = checkArrayVar(length);
    check3.variance <== variance;
    for (var i = 0; i < length; i++) {
        check3.in_SDM[i] <== value_SDM[i];
    }
    
    // Check `metric` ${\in}$ {0, 1, 2, 3, 4, 5, 6}
    signal t1 <== (0 - metric) * (1 - metric);
    signal t2 <== (2 - metric) * (3 - metric);
    signal t3 <== (4 - metric) * (5 - metric);
    signal t4 <== (6 - metric);
    signal t5 <== t1 * t2;
    signal t6 <== t3 * t4;
    t5 * t6 === 0;
    
    // Start to executing grading algorithm
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

component main { public [
        metric,
        average,
        variance,
        value,
        value_SDM,
        score
    ] } = Main(4);
// # of minutes of 30 days = 43200