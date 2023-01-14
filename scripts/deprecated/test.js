// Package
const fs = require("fs");
const { MerkleTree } = require("./merkleTree");
const circomlib = require("circomlibjs");
const ethers = require("ethers");
const { performance } = require("perf_hooks");
const crypto = require("crypto");

// Auxiliary function
const printType = (object) => {console.log(Object.prototype.toString.call(object));};
const sha256Hash = (left, right) => {return `0x${crypto.createHash('sha256').update(`${left}${right}`).digest('hex')}`;};

// Convert Uint8Array into Array<Uint248>
function uint8ArrayToUint248Array(uint8_array) {
    if(!(uint8_array instanceof Uint8Array)) {
        throw new Error("`uint8_array` must be an instance of `Uint8Array`.");
    }
    
    if((uint8_array.length % 31) !== 0 || ((uint8_array.length === 0))) {
        throw new Error("The length of `uint8_array` (non-empty) must be a multiple of 31.");
    }
    
    const uint248_array = new Array(Math.floor(uint8_array.length / 31));
    
    for(let i = 0; i < uint8_array.length; i+=31) { // (248 / 8) = 31
        let uint248 = 0n;
        
        for(let j = 0; j < 31; j++) {
            uint248 = (uint248 << 8n) + BigInt(uint8_array[i+j]);
        }
        
        uint248_array[Math.floor(i / 31)] = uint248;
    }
    
    return uint248_array;
}

// Pad `uint8_array` with `Uint8(0)`s and turn it into a length of multiple 31
/**
 * const input_u8_padded = padZeroToEnd(input_u8);
 * const input_u248 = uint8ArrayToUint248Array(input_u8_padded);
 */
function padZeroToEnd(uint8_array) {
    const all_zero_pad = new Uint8Array(
        31 * Math.ceil(uint8_array.length / 31) - uint8_array.length
    );
    const result = new Uint8Array([...uint8_array, ...all_zero_pad]);
    return result;
}


// Main function
async function main1() {
    const input_u8 = fs.readFileSync("circuits/data/json/0ef131c0-9248-4b74-afa7-37786c6835a5.json");
    // const input_u8_padded = padZeroToEnd(input_u8);
    // const input_u248 = uint8ArrayToUint248Array(input_u8_padded);
    const tree = new MerkleTree(input_u8);
    await tree.init();
    
    const leaf_index = 1;
    const path = tree.getPath(leaf_index);
    
    const input_json = {
        root: path.root, 
        leaf: path.leafValue,
        pathElements: path.pathElements,
        pathIndices: path.pathIndices
    };
    
    fs.writeFileSync(
        "circuits/data/input.json",
        JSON.stringify(input_json),
        (error) => {
            if(error) {
                console.error(error.message);
            }
    });
}

async function main2() {
    // const start = performance.now();
    // tree.height = 14 ----> 0.83 sec
    // tree.height = 20 ----> 29.6 sec
    // tree.height = 25 ----> 962.5 sec
    
    const input_u8 = fs.readFileSync("circuits/data/json/0ef131c0-9248-4b74-afa7-37786c6835a5.json");
    
    const tree = new MerkleTree(input_u8);
    await tree.init();
    console.log(tree.root());
    console.log(tree.height());
        
}

async function main3() {
    const poseidon_obj = await circomlib.buildPoseidon();
    
    const one = 1;
    const two = 2;
    const three = 3;
    let temp;
    
    {
        const inputs = [
            ethers.BigNumber.from(one).toBigInt(),
            ethers.BigNumber.from(two).toBigInt()
        ];
        
        const hash_u8array = poseidon_obj(inputs);
        const hash_dec_str = poseidon_obj.F.toString(hash_u8array);
        const hash_hex_str = ethers.BigNumber.from(hash_dec_str).toHexString();
        const hash_hex_pad = ethers.utils.hexZeroPad(hash_hex_str, 32);
        
        temp = hash_hex_pad;
    }
    {
        const inputs = [
            ethers.BigNumber.from(three).toBigInt(),
            ethers.BigNumber.from(temp).toBigInt()
        ];
        
        const hash_u8array = poseidon_obj(inputs);
        const hash_dec_str = poseidon_obj.F.toString(hash_u8array);
        // const hash_hex_str = ethers.BigNumber.from(hash_dec_str).toHexString();
        // const hash_hex_pad = ethers.utils.hexZeroPad(hash_hex_str, 32);
        
        temp = hash_dec_str;
    }
    
    const ans = {
        one: one,
        two: two,
        three: three,
        myRoot: temp
    };
    
    console.log(ans);
    
    // fs.writeFileSync(
    //     "circuits/data/input.json",
    //     JSON.stringify(ans),
    //     (error) => {
    //         if(error) {
    //             console.error(error.message);
    //         }
    // });
}

async function main4() {
    const num = parseInt(process.argv[2]);
    let _in = [];
    
    for (let i = 0; i < (num + 1); i++) {
        _in.push(`${i}`);
    }
    
    const input_json = {
        in: _in
    };
    
    fs.writeFileSync(
        `circuits/data/input${num}.json`,
        JSON.stringify(input_json),
        (error) => {
            if(error) {
                console.error(error.message);
            }
    });
}

async function main5() {
    const height = parseInt(process.argv[2]);
    const leaves_num = 2 ** (height - 1);
    const tree = new MerkleTree(Array.from(Array(leaves_num).keys()));
    await tree.init();
    
    const leaf_index = 1;
    const path = tree.getPath(leaf_index);
    
    const input_json = {
        root: path.root, 
        leaf: path.leafValue,
        pathElements: path.pathElements,
        pathIndices: path.pathIndices
    };
    
    fs.writeFileSync(
        `circuits/data/input${height}.json`,
        JSON.stringify(input_json),
        (error) => {
            if(error) {
                console.error(error.message);
            }
    });
}

async function main() {
    const height = parseInt(process.argv[2]);
    const leaves_num = 2 ** (height - 1);
    const aa = Array.from(Array(leaves_num).keys());
    const tree = new MerkleTree(aa, 0, sha256Hash);
    await tree.init();
    
    const leaf_index = 1;
    const path = tree.getPath(leaf_index);
    
    const input_json = {
        root: path.root, 
        leaf: path.leafValue,
        pathElements: path.pathElements,
        pathIndices: path.pathIndices
    };
    
    fs.writeFileSync(
        `circuits/data/input${height}.json`,
        JSON.stringify(input_json),
        (error) => {
            if(error) {
                console.error(error.message);
            }
    });
    
    // console.log(tree);
    // console.log(ethers.BigNumber.from(`0x${tree.root()}`).toString());
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });