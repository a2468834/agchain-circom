pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

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
    signal input root;
    signal input leaf;
    signal input pathElements[levels - 1];
    signal input pathIndices[levels - 1];
    
    component selectors[levels - 1];
    component hashes[levels - 1];
    
    for (var i = 0; i < (levels - 1); i++) {
        selectors[i] = DualMux();
        hashes[i] = Poseidon(2);
        
        // Fulfill the input arguments of `DualMux()`
        selectors[i].in[0] <== pathElements[i];
        selectors[i].in[1] <== (i == 0) ? (leaf) : (hashes[i - 1].out);
        selectors[i].s     <== pathIndices[i];
        
        // Fulfill the input arguments of `Poseidon()`
        hashes[i].inputs[0] <== selectors[i].out[0];
        hashes[i].inputs[1] <== selectors[i].out[1];
    }
    
    // The final requirement checking
    root === hashes[levels - 2].out;
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

component main { public [root] } = Main(25);