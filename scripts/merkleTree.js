// Package
const circomlib = require("circomlibjs");
const ethers = require("ethers");


// Function
BigInt.prototype.toJSON = function () {
    return this.toString();
}


// Class
class MerkleTree {
    _poseidon; // The function body of poseidon hash
    _levels; // # of levels of this tree (i.e., `(this._layers).length`)
    _zeroElement; // The definition of a "zero element" for this tree
    _zeros; // The "placeholder" for those tree's node that don't have sibling
    _layers; // [[leaf, leaf, ...], [higher layer of the tree], ..., [root]]
    _isInit; // A tag identified whether this tree is ready for use
    _enablePoseidon;
    
    constructor(leaves = [], zero_element = new Uint8Array([0]), hash_function = null) {
        if(leaves.length === 0) {
            throw new Error("Cannot new `MerkleTree` with an empty array.");
        }
        
        // Check whether use other customized hash function for building tree
        if(hash_function === null) {
            this._poseidon       = null;
            this._enablePoseidon = true;
        }
        else {
            this._poseidon       = hash_function;
            this._enablePoseidon = false;
        }
        
        this._levels      = Math.ceil(Math.log2(leaves.length)) + 1;
        this._zeroElement = zero_element;
        this._zeros       = [];
        this._layers      = [leaves.slice()];
        this._isInit      = false;
    }
    
    async init() {
        // Prepare Poseidon function
        if(this._enablePoseidon) {
            await this.#preparePoseidon();
        }
        else {
            // Do nothing
        }
        
        // Prepare `_zeros` array
        for(let i = 0; i < (this._levels - 1); i++) {
            if(i === 0) {
                this._zeros.push(
                    this._zeroElement
                );
            }
            else {
                this._zeros.push(
                    this._poseidon(this._zeros[i - 1], this._zeros[i - 1])
                );
            }
        }
        
        // Construct the rest layers (i.e., except leaf layer) of Merkle tree
        for(let layer_i = 1; layer_i < this._levels; layer_i++) {
            this._layers[layer_i] = this.#buildNodes(
                this._layers[layer_i - 1],
                (layer_i - 1)
            );
        }
        
        // Finish initialization procedure
        this._isInit = true;
    }
    
    height() {
        this.#checkInit();
        return this._layers.length;
    }
    
    hash(left, right){
        this.#checkInit();
        return this._poseidon(left, right);
    }
    
    root() {
        this.#checkInit();
        return this._layers[(this._layers).length - 1][0];
    }
    
    printLeaves() {
        this.#checkInit();
        console.log(this._layers[0]);
    }
    
    getPath(leafIndex) {
        this.#checkInit();
        
        const condition1 = !Number.isInteger(leafIndex);
        const condition2 = leafIndex < 0;
        const condition3 = leafIndex > ((this._layers[0]).length - 1);
        if(condition1 || condition2 || condition3) {
            throw new Error(`Invalid leaf index: ${leafIndex}`);
        }
        
        let traverse_index  = leafIndex; // The initial traversing index is the given leaf index.
        const path_elements = [];
        const path_indices  = [];
        
        // Loop for each layer except the root
        for(let i = 0; i < ((this._layers).length - 1); i++) {
            const isOldLength = ((this._layers[i]).length % 2) === 1;
            
            // Extend the current layer with `_zeros`
            let full_curr_layer_nodes;
            if(isOldLength) {
                full_curr_layer_nodes = [...(this._layers[i]), this._zeros[i]];
            }
            else {
                full_curr_layer_nodes = [...(this._layers[i])];
            }
            
            // Push `path_element` and `path_index`
            if((traverse_index % 2) === 0) { // "L" child
                // The sibling is the "R" child
                path_elements.push(
                    ethers.BigNumber
                        .from(full_curr_layer_nodes[traverse_index + 1])
                        .toString()
                );
                path_indices.push("1");
            }
            else { // "R" child
                // The sibling is the "L" child
                path_elements.push(
                    ethers.BigNumber
                        .from(full_curr_layer_nodes[traverse_index - 1])
                        .toString()
                );
                path_indices.push("0");
            }
            traverse_index = Math.floor(traverse_index / 2); // L/R children's parent index = `child // 2` 
        }
        
        // Make sure all items are in the form of "finite field" decimal string
        return {
            root:         ethers.BigNumber.from(this.root()).toString(),
            pathElements: path_elements, 
            pathIndices:  path_indices,
            leafValue:    ethers.BigNumber.from(this._layers[0][leafIndex]).toString()
        };
    }
    
    #checkInit() {
        if(this._isInit === false) {
            throw new Error("This Merkle tree has not been initialized.");
        }
        else {
            // Do nothing
        }
    }
    
    #buildNodes(prev_layer_nodes, prev_layer_level) {
        const pl_length = prev_layer_nodes.length; // "pl" := previous layer
        const isOldLength = ((pl_length % 2) === 1);
        
        if(isOldLength) {
            const full_pl_nodes = [
                ...prev_layer_nodes,
                this._zeros[prev_layer_level]
            ];
            const curr_layer_nodes = [];
            
            for(let i = 0; i < full_pl_nodes.length; i+=2) {
                curr_layer_nodes.push(
                    this._poseidon(
                        full_pl_nodes[i],
                        full_pl_nodes[i+1]
                ));
            }
            
            return curr_layer_nodes;
        }
        else {
            const curr_layer_nodes = [];
            
            for(let i = 0; i < pl_length; i+=2) {
                curr_layer_nodes.push(
                    this._poseidon(
                        prev_layer_nodes[i],
                        prev_layer_nodes[i+1]
                ));
            }
            
            return curr_layer_nodes;
        }
    }
    
    async #preparePoseidon() {
        const poseidon_obj = await circomlib.buildPoseidon();
        this._poseidon = (left, right) => {
            const inputs = [
                ethers.BigNumber.from(left).toBigInt(),
                ethers.BigNumber.from(right).toBigInt()
            ];
            const hash_u8array = poseidon_obj(inputs);
            const hash_dec_str = poseidon_obj.F.toString(hash_u8array); // dec := decimal
            const hash_hex_str = ethers.BigNumber.from(hash_dec_str).toHexString();
            const hash_hex_pad = ethers.utils.hexZeroPad(hash_hex_str, 32);
            return hash_hex_pad;
        };
    }
}


module.exports = {
    MerkleTree
};