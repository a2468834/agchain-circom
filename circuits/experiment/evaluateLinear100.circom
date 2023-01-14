pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template Main(num) {
    signal input in[num + 1];
    signal output hash;
    
    component hashes[num];
    
    for (var i = 0; i < num; i++) {
        hashes[i] = Poseidon(2);
        
        hashes[i].inputs[0] <== (i == 0) ? (in[0]) : (in[i+1]);
        hashes[i].inputs[1] <== (i == 0) ? (in[1]) : (hashes[i - 1].out);
    }
    
    hash <==  hashes[num - 1].out;
}

component main { public [in] } = Main(100);