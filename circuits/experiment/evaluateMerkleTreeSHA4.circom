pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template DualMux() {
    signal input in[256][2];
    signal input s;
    signal output out[256][2];
    
    s * (1 - s) === 0;
    
    for (var i = 0; i < 256; i++) {
        out[i][0] <== (in[i][1] - in[i][0])*s + in[i][0];
        out[i][1] <== (in[i][0] - in[i][1])*s + in[i][1];
    }
}

template MerkleTree(levels) {
    signal input root;
    signal input leaf;
    signal input pathElements[levels - 1];
    signal input pathIndices[levels - 1];
    
    component pathElementsToBits[levels - 1];
    component selectors[levels - 1];
    component hashes[levels - 1];
    component leafToBits;
        
    // Bitify the input signal `leaf`
    leafToBits = Num2Bits(256);
    leafToBits.in <== leaf;    
    
    // Do hashing
    for (var i = 0; i < (levels - 1); i++) {
        selectors[i]          = DualMux();
        hashes[i]             = Sha256(512);
        pathElementsToBits[i] = Num2Bits(256);
        
        pathElementsToBits[i].in <== pathElements[i];
        
        // Fulfill the input arguments of `DualMux()`
        for (var j = 0; j < 256; j++) {
            selectors[i].in[j][0] <== pathElementsToBits[i].out[j];
            selectors[i].in[j][1] <== (i == 0) ? (leafToBits.out[j]) : (hashes[i - 1].out[j]);
            selectors[i].s        <== pathIndices[i];
        }
        
        // // Fulfill the input arguments of `Sha256(512)`
        // for (var k0 = 0; k0 < 256; k0++) {
        //     hashes[i].in[k0] = selectors[i].out[0][k0];
        // }
        // for (var k1 = 0; k1 < 256; k1++) {
        //     hashes[i].in[k1 + 256] = selectors[i].out[1][k1];
        // }
    }
    
    // component finalHashToNum = Bits2Num(256);
    
    // for (var i = 0; i < 256; i++) {
    //     finalHashToNum.in[i] <== hashes[levels - 2].out[i];
    // }
    
    // // The final requirement checking
    // log(finalHashToNum.out);
    // //root === finalHashToNum.out;
}

template Main(levels) {
    signal input root;
    signal input leaf;
    signal input pathElements[levels - 1];
    signal input pathIndices[levels - 1];
    
    component tree = MerkleTree(levels);
    
    // Fulfill the input arguments of `MerkleTree()`
    tree.leaf <== leaf;
    tree.root <== root;
    
    for (var i = 0; i < (levels - 1); i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }
}

component main { public [root] } = Main(4);