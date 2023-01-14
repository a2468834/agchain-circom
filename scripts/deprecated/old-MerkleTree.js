const { createHash } = require("crypto");
const fs = require("fs");
const circomlib = require("circomlibjs");
const ethers = require("ethers");

function SimpleHash(data, seed, hashLength = 40) {
    const str = data.join('');
    let i, l, hval = seed !== null && seed !== void 0 ? seed : 0x811c9dcc5;
    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 6) + (hval << 8) + (hval << 24);
    }
    const hash = (hval >>> 0).toString(16);
    return BigInt('0x' + hash.padEnd(hashLength - (hash.length - 1), '0')).toString(10);
}

function simpleHash(left, right) {
    return SimpleHash([left, right]);
}

class BaseTree {
    _levels;
    _zeroElement;
    _zeros;
    _layers; // `this._layers[0]` is the layer of all leaves
    _hashFunction;
    
    get levels() {
        return this._levels;
    }
    get capacity() {
        return 2 ** (this._levels);
    }
    get layers() {
        return this._layers.slice();
    }
    get zeros() {
        return this._zeros.slice();
    }
    get elements() {
        return this._layers[0].slice();
    }
    get root() {
        // var _a;
        // return (_a = this._layers[this.levels][0]) !== null && _a !== void 0 ? _a : this._zeros[this.levels];
        
        let temp = this._layers[this.levels][0];
        
        if((temp !== null) && (temp !== undefined)) {
            return this._layers[this.levels][0];
        }
        else {
            return this._zeros[this._levels];
        }
    }
    /**
     * Find a specific `element` in the tree
     * @param {Array} elements An array of `element`s
     * @param {*} element An `element` to be found
     * @param {number} fromIndex The index to start the search at. If the index is >= the array's length, return `-1`
     * @param {*} comparator A function that checks leaf value equality
     * @returns {number} Index if `element` is found, otherwise `-1`
     */
    static indexOf(elements, element, fromIndex, comparator = null) {
        if(comparator) {
            return elements.findIndex((e) => comparator(element, e));
        }
        else {
            return elements.indexOf(element, fromIndex);
        }
    }
    
    /**
     * Insert a new `element` into the tree
     * @param element `element` to be inserted
     */
    insert(element) {
        if(this._layers[0].length >= this.capacity) {
            throw new Error("Tree is full");
        }
        this.update(this._layers[0].length, element);
    }
    
    /**
     * Insert multiple `element`s into the tree
     * @param {Array} elements An array of `element`s
     */
    bulkInsert(elements) {
        if(elements.length === 0) {
            // Do nothing
        }
        else {
            if(this._layers[0].length + elements.length > this.capacity) {
                throw new Error("Tree is full");
            }
            else {
                // (1) Insert all `element`s except the last one
                // (2) Update only full subtree hashes (all layers where inserted element has odd index)
                // (3) The last element will update the full path to the root making the tree consistent again
                for(let i = 0; i < (elements.length - 1); i++) {
                    this._layers[0].push(elements[i]);
                    
                    let level = 0;
                    let index = this._layers[0].length - 1;
                    
                    while (index % 2 === 1) {
                        level++;
                        index >>= 1;
                        
                        const left  = this._layers[level - 1][index * 2];
                        const right = this._layers[level - 1][index * 2 + 1];
                        this._layers[level][index] = this._hashFunction(left, right);
                    }
                }
                
                this.insert(elements[elements.length - 1]);
            }
        }
    }
    
    /**
     * Change an `element` in the tree
     * @param {number} index The index of `element` to be changed
     * @param {*} element Updated value
     */
    update(index, element) {
        let idx = Number(index);
        
        if(isNaN(idx) || idx < 0 || idx > this._layers[0].length || idx >= this.capacity) {
            throw new Error(`Insert index out of bounds: ${index}`);
        }
        
        this._layers[0][idx] = element;
        this._processUpdate(idx);
    }
    
    /**
     * Get Merkle path from root to a leaf
     * @param {number} index The index of a leaf you want know its Merkle path
     * @returns {{pathElements: Object[], pathIndex: number[]}} An object containing adjacent elements and left-right index
     */
    path(index) {
        let idx = Number(index);
        
        if(isNaN(idx) || idx < 0 || idx >= this._layers[0].length) {
            throw new Error(`Insert index out of bounds: ${index}`);
        }
        
        const pathElements  = [];
        const pathIndices   = [];
        const pathPositions = [];
        
        for(let level = 0; level < this.levels; level++) {
            pathIndices[level] = idx % 2;
            const leafIndex = idx ^ 1;
            
            if(leafIndex < this._layers[level].length) {
                pathElements[level]  = this._layers[level][leafIndex];
                pathPositions[level] = leafIndex;
            }
            else {
                pathElements[level]  = this._zeros[level];
                pathPositions[level] = 0;
            }
            
            idx >>= 1;
        }
        
        return {
            pathElements:  pathElements,
            pathIndices:   pathIndices,
            pathPositions: pathPositions,
            pathRoot:      this.root
        };
    }
    
    /**
     * 
     */
    _buildZeros() {
        this._zeros = [this._zeroElement];
        for(let i = 1; i <= this.levels; i++) {
            this._zeros[i] = this._hashFunction(this._zeros[i - 1], this._zeros[i - 1]);
        }
    }
    
    /**
     * 
     * @param {*} nodes 
     * @param {*} layerIndex 
     * @returns 
     */
    _processNodes(nodes, layerIndex) {
        const length = nodes.length;
        let currentLength = Math.ceil(length / 2);
        const currentLayer = new Array(currentLength);
        currentLength--;
        const starFrom = length - ((length % 2) ^ 1);
        let j = 0;
        
        for (let i = starFrom; i >= 0; i -= 2) {
            if(nodes[i - 1] === undefined) {
                break;
            }
            const left  = nodes[i - 1];
            const right = (i === starFrom && length % 2 === 1) ? this._zeros[layerIndex - 1] : nodes[i];
            currentLayer[currentLength - j] = this._hashFunction(left, right);
            j++;
        }
        
        return currentLayer;
    }
    
    /**
     * 
     * @param {*} index 
     */
    _processUpdate(index) {
        let idx = Number(index);
        
        for(let level = 1; level <= this.levels; level++) {
            idx >>= 1;
            const left  = this._layers[level - 1][idx * 2];
            const right = idx * 2 + 1 < this._layers[level - 1].length
                ? this._layers[level - 1][idx * 2 + 1]
                : this._zeros[level - 1];
            this._layers[level][idx] = this._hashFunction(left, right);
        }
    }
}

class MerkleTree extends BaseTree {
    constructor(
        levels, 
        elements = [], 
        {
            hashFunction = simpleHash, 
            zeroElement  = 0
        } = {}
    ) {
        super();
        
        this._levels       = levels;
        this._hashFunction = hashFunction;
        this._zeroElement  = zeroElement;
        this._layers = [elements.slice()]; // `this._layers[0]` stores all leaves
        
        if(elements.length > this.capacity) {
            throw new Error("Tree is full");
        }
        
        this._buildZeros();
        this._buildHashes();
    }
    
    _buildHashes() {
        for(let layerIndex = 1; layerIndex <= this.levels; layerIndex++) {
            this._layers[layerIndex] = this._processNodes(
                this._layers[layerIndex - 1], 
                layerIndex
            );
        }
    }
    
    bulkInsert(elements) {
        if(elements.length === 0) {
            // Do nothing
        }
        else {
            if(this._layers[0].length + elements.length > this.capacity) {
                throw new Error("Tree is full");
            }
            else {
                // (1) Insert all `element`s except the last one
                // (2) Update only full subtree hashes (all layers where inserted element has odd index)
                // (3) The last element will update the full path to the root making the tree consistent again
                for(let i = 0; i < elements.length - 1; i++) {
                    this._layers[0].push(elements[i]);
                    
                    let level = 0;
                    let index = this._layers[0].length - 1;
                    
                    while (index % 2 === 1) {
                        level++;
                        index >>= 1;
                        
                        const left  = this._layers[level - 1][index * 2];
                        const right = this._layers[level - 1][index * 2 + 1];
                        this._layers[level][index] = this._hashFunction(left, right);
                    }
                }
                
                this.insert(elements[elements.length - 1]);
            }
        }
    }
    
    indexOf(element, comparator) {
        return BaseTree.indexOf(
            this._layers[0], 
            element, 
            0, 
            comparator
        );
    }
    
    proof(element) {
        return this.path(
            this.indexOf(element)
        );
    }
    
    getTreeEdge(edgeIndex) {
        const edgeElement = this._layers[0][edgeIndex];
        
        if(edgeElement === undefined) {
            throw new Error("Element not found");
        }
        const edgePath = this.path(edgeIndex);
        
        return {
            edgePath:          edgePath,
            edgeElement:       edgeElement,
            edgeIndex:         edgeIndex,
            edgeElementsCount: this._layers[0].length
        };
    }
    
    getTreeSlices(count = 4) {
        const length = this._layers[0].length;
        const slices = [];
        
        let size = Math.ceil(length / count);
        
        if(size % 2) {
            size++;
        }
        
        for(let i = 0; i < length; i += size) {
            const edgeLeft  = i;
            const edgeRight = i + size;
            slices.push(
                {
                    edge: this.getTreeEdge(edgeLeft),
                    elements: this.elements.slice(edgeLeft, edgeRight)
                }
            );
        }
        
        return slices;
    }
    
    toString() {
        return JSON.stringify(this._serialize());
    }
    
    _serialize() {
        return {
            levels: this._levels,
            zeros:  this._zeros,
            layers: this._layers
        };
    }
    
    static deserialize(data, hashFunction) {
        const instance = Object.assign(Object.create(this.prototype), data);
        instance._hashFunction = hashFunction || simpleHash;
        instance._zeroElement  = instance._zeros[0];
        return instance;
    }
}

class JsStorage {
    #database;
    
    constructor() {
        this.#database = {};
    }
    
    create(key, value) {
        if(key === undefined || value === undefined) {
            throw new Error("`key` or `value` is undefined.");
        }
        else {
            if(this.#database[key] !== undefined) {
                throw new Error("Try to create an existed `key`.");
            }
            else {
                this.#edit(key, value);
            }
        }
    }
    
    read(key) {
        if(key === undefined) {
            throw new Error("`key` is undefined.");
        }
        else {
            if(this.#database[key] === undefined) {
                throw new Error("Try to read an un-existed `key`.");
            }
            else {
                return this.#database[key];
            }
        }
    }
    
    update(key, value) {
        if(key === undefined || value === undefined) {
            throw new Error("`key` or `value` is undefined.");
        }
        else {
            if(this.#database[key] === undefined) {
                throw new Error("Try to update an un-existed `key`.");
            }
            else {
                this.#edit(key, value);
            }
        }
    }
        
    delete(key) {
        if(key === undefined) {
            throw new Error("`key` is undefined.");
        }
        else {
            if(this.#database[key] === undefined) {
                throw new Error("Try to delete an un-existed `key`.");
            }
            else {
                delete this.#database[key];
            }
        }
    }
    
    #edit(key, value) {
        this.#database[key] = value;
    }
}

const leftChild  = (i) => {return (2 * i + 1);};
const rightChild = (i) => {return (2 * i + 2);};
const sha256Hash = (left, right) => createHash('sha256').update(`${left}${right}`).digest('hex');


async function makeMerkleTree(leaves, hashFunc) {
    if(leaves.length === 0) {
        throw new Error("The array of leaves cannot be empty.");
    }
    
    else {
        const node_num = 2 * leaves.length - 1;
        const tree = new Array(node_num); // Full binary tree
        
        // Copy leaves to the Merkle tree's leaves
        for(let i = 0; i < leaves.length; i++) {
            tree[node_num - i - 1] = leaves[i];
        }
        
        for(let i = (node_num - leaves.length - 1); i >= 0; i--) {
            console.log(`L: ${tree[leftChild(i)]}`);
            console.log(`R: ${tree[rightChild(i)]}`);
            
            tree[i] = hashFunc(
                tree[leftChild(i)], 
                tree[rightChild(i)]
            );
        }
        
        return tree;
    }
}

async function main() {
    const condition = (number) => {return `Condition ${number}`;};
    let counter = 1;
    
    // Constructor
    {
        {
            const tree = new MerkleTree(10, []);
            console.assert((tree.root === '3060353338620102847451617558650138132480'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1]);
            console.assert((tree.root === '4059654748770657324723044385589999697920'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1, 2]);
            console.assert((tree.root === '3715471817149864798706576217905179918336'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1, 2, 3]);
            console.assert((tree.root === '5199180210167621115778229238102210117632'), condition(counter++));
        }
        {
            try {
                const temp = new MerkleTree(2, [1, 2, 3, 4]);
            } catch(e) {
                console.error(e);
            }
            
        }
        {
            try {
                const temp = new MerkleTree(2, [1, 2, 3, 4, 5]);
                console.assert(false, "No error thrown!");
            } catch(e) {
                console.assert(e.message === "Tree is full", condition(counter++));
            }
        }
        
        {
            const tree = new MerkleTree(10, [1, 2, 3, 4, 5, 6], { hashFunction: sha256Hash, zeroElement: 'zero' });
            console.assert((tree.root === 'a377b9fa0ed41add83e56f7e1d0e2ebdb46550b9d8b26b77dece60cb67283f19'), condition(counter++));
        }
        console.log("Pass constructor");
    }
    
    // Insert
    {
        {
            const tree = new MerkleTree(10);
            tree.insert(42);
            console.assert((tree.root, '750572848877730275626358141391262973952'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1])
            tree.insert(42)
            console.assert((tree.root, '5008383558940708447763798816817296703488'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1, 2])
            tree.insert(42)
            console.assert((tree.root, '5005864318873356880627322373636156817408'), condition(counter++));
        }
        {
            try {
                const tree = new MerkleTree(2, [1, 2, 3])
                tree.insert(4)
            } catch(e) {
                console.error(e);
            }
        }
        {
            try {
                const tree = new MerkleTree(2, [1, 2, 3, 4])
                tree.insert(5)
                console.assert(false, "No error thrown!");
                
            } catch(e) {
                console.assert(e.message === "Tree is full", condition(counter++));
            }
        }
        
        console.log("Pass insert");
    }
    
    // Bulk Insert
    {
        {
            const tree = new MerkleTree(10, [1, 2, 3])
            tree.bulkInsert([4, 5, 6])
            console.assert((tree.root, '4066635800770511602067209448381558554624'), condition(counter++));
        }
        {
            const initialArray = [
                [1],
                [1, 2],
                [1, 2, 3],
                [1, 2, 3, 4],
            ]
            const insertedArray = [
                [11],
                [11, 12],
                [11, 12, 13],
                [11, 12, 13, 14],
            ]
            for (const initial of initialArray) {
                for (const inserted of insertedArray) {
                    const tree1 = new MerkleTree(10, initial)
                    const tree2 = new MerkleTree(10, initial)
                    tree1.bulkInsert(inserted)
                    for (const item of inserted) {
                        tree2.insert(item)
                    }
                    console.assert((tree1.root, tree2.root), condition(counter++));
                }
            }
        }
        {
            try {
                const tree = new MerkleTree(2, [1, 2])
                tree.bulkInsert([3, 4])
            } catch(e) {
                console.error(e);
            }
        }
        {
            try {
                const tree = new MerkleTree(2, [1, 2])
                tree.bulkInsert([3, 4, 5])
                console.assert(false, "No error thrown!");
            } catch(e) {
                console.assert(e.message === "Tree is full", condition(counter++));
            }
        }
        {
            const elements = [1, 2, 3, 4]
            const tree = new MerkleTree(2, elements)
            tree.bulkInsert([])
            console.assert((JSON.stringify(tree.elements) === JSON.stringify(elements)), condition(counter++));
        }
        
        console.log("Pass bulk insert");
    }
    
    // Update
    {
        {
            const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
            tree.update(0, 42)
            console.assert((tree.root === '3884161948856565981263417078389340635136'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
            tree.update(4, 42)
            console.assert((tree.root === '3564959811529894228734180300843252711424'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
            tree.update(1, 42)
            console.assert((tree.root === '4576704573778433422699674477203122290688'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
            tree.update(2, 42)
            console.assert((tree.root === '1807994110952186123819489133812038762496'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1, 2, 3, 4])
            tree.update(4, 5)
            console.assert((tree.root === '1099080610107164849381389194938128793600'), condition(counter++));
        }
        {
            const tree = new MerkleTree(10, [1, 2, 3, 4, 5])
            try {
                tree.update(-1, 42)
                console.assert(false, "No error thrown!");
            } catch(e) {
                console.assert(e.message === 'Insert index out of bounds: -1', condition(counter++));
            }
            try {
                tree.update(6, 42)
                console.assert(false, "No error thrown!");
            } catch(e) {
                console.assert(e.message === 'Insert index out of bounds: 6', condition(counter++));
            }
            try {
                tree.update('qwe', 42)
                console.assert(false, "No error thrown!");
            } catch(e) {
                console.assert(e.message === 'Insert index out of bounds: qwe', condition(counter++));
            }
        }
        {
            const tree = new MerkleTree(2, [1, 2, 3, 4])
            try {
                tree.update(4, 42)
                console.assert(false, "No error thrown!");
            } catch(e) {
                console.assert(e.message === 'Insert index out of bounds: 4', condition(counter++));
            }
        }
        
        console.log("Pass update");
    }
    
    // IndexOf
    {
    }
}

module.exports = {
    BaseTree,
    MerkleTree
};