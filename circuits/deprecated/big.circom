pragma circom 2.0.0;

template Main () {
    signal input x;
    signal input ans;
    signal output out;
    
    var x2;
    x2 = x * x;
    
    ans === x2 + x + 5;
    out <== 1 * 1;
}

component main {public [ans]} = Main();