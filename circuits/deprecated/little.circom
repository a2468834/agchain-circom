pragma circom 2.0.0;

// x**2 + x + 5 = 11

template Main () {
    signal input x;
    signal output y;
    
    var x2;
    x2 = x * x;
    
    y <== x2 + x + 5;
}

component main = Main();