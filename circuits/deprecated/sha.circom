pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/sha256/sha256_2.circom";

template Main() {
    signal input left;
    signal input right;
    signal output root;
    
    component hash;
    
    hash = Sha256_2();
    hash.a <== left;
    hash.b <== right;
    
    root <== hash.out;
    
    log(left);
    log(right);
    log(hash.out);
}

component main { public [left, right] } = Main();