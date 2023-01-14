pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Main() {
    signal input one;
    signal input two;
    signal input three;
    signal input myRoot;
    signal output root;
    
    component hash[2];
    
    hash[0] = Poseidon(2);
    hash[0].inputs[0] <== one;
    hash[0].inputs[1] <== two;
    
    hash[1] = Poseidon(2);
    hash[1].inputs[0] <== three;
    hash[1].inputs[1] <== hash[0].out;
    
    myRoot === hash[1].out;
    
    root <== hash[1].out;
}

component main { public [one,two,three,myRoot] } = Main();