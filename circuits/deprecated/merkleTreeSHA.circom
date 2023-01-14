pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/sha256/sha256_2.circom";


/**
 * If `s` is 0, then returns [in[0], in[1]]
 * If `s` is 1, then returns [in[1], in[0]] i.e., flip the input array
 */
template DualMux() {
    signal input in[2];
    signal input s;
    signal output out[2];

    s * (1 - s) === 0;
    out[0] <== (in[1] - in[0])*s + in[0];
    out[1] <== (in[0] - in[1])*s + in[1];
}


/**
 * Prover provides a `leaf` and a `pathElements` array of the Merkle tree and
 * then prove that they truely belongs to that tree (equals to `root`).
 * @dev Hash funciton is Poseidon hash function (Grassi, Lorenzo, et al.)
 * @dev `pathIndices` is an array of 0/1 that indicates whether a given 
 *      `pathElement[i]` is on the left or right child of the Merkle path.
 */
template MerkleTree(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    component selectors[levels];
    component hashes[levels];
    
    for (var i = 0; i < (levels - 1); i++) {
        selectors[i] = DualMux();
        
        selectors[i].in[0] <== i == 0 ? (leaf) : (hashes[i - 1].out);
        selectors[i].in[1] <== pathElements[i];
        selectors[i].s     <== pathIndices[i];
        
        hashes[i] = Sha256_2();
        hashes[i].a <== selectors[i].out[0];
        hashes[i].b <== selectors[i].out[1];
        
        log(selectors[i].out[0]);
        log(selectors[i].out[1]);
        log();
    }
    
    log("-----");
    
    for (var j = 0; j < (levels - 1); j++) {
        log(hashes[j].out);
        log();
    }
    
    // The final requirement checking
    pathElements[levels - 1] === hashes[levels - 2].out;
    root === hashes[levels - 2].out;
}

template Main(levels) {
    signal input root;
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component tree = MerkleTree(levels);
    tree.leaf <== leaf;
    tree.root <== root;
    
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }
}

component main { public [root] } = Main(4);