pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";
include "./fixedPointArithmetic.circom";

template checkArrayAvg(length) {
    signal input average;
    signal input in[length];
    
    var sum = 0;
    
    for (var i = 0; i < length; i++) {
        sum = fpaAdd(sum, in[i]);
    }
    
    component equal = IsEqual();
    equal.in[0] <-- average;
    equal.in[1] <-- (sum \ length); // Do Z(p) floor division
    
    1 === equal.out;
}

template checkArrayVar(length) {
    signal input variance;
    signal input in_SDM[length];
        
    var sum = 0;
    
    for (var i = 0; i < length; i++) {
        sum = fpaAdd(sum, in_SDM[i]);
    }
    
    component equal = IsEqual();
    equal.in[0] <-- variance;
    equal.in[1] <-- (sum \ length); // Do Z(p) floor division
    
    1 === equal.out;
}

// SDM := Squared Deviations from the Mean
template checkArraySDM(length) {
    signal input average;
    signal input in[length];
    signal input in_SDM[length];
    
    component equal[length];
    
    for (var i = 0; i < length; i++) {
        var sdm = fpaMul((in[i] - average), (in[i] - average));
        
        equal[i] = IsEqual();
        equal[i].in[0] <-- sdm;
        equal[i].in[1] <-- in_SDM[i];
        
        1 === equal[i].out;
    }
}