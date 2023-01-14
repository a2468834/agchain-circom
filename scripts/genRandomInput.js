// Package
const circomlib = require("circomlibjs");
const ethers    = require("ethers");
const fs        = require("fs");
const { performance }      = require("perf_hooks");
const { calcAverage }      = require("./calculateMetric");
const { calcVariance }     = require("./calculateMetric");
const { calcSdmArray }     = require("./calculateMetric");
const { metricAT, metricTD, metricST, metricAH, metricSH, metricWC, metricSE, } = require("./calculateMetric");
const { FPA, FPNumber }              = require("./fixedPointNumber");
const { checkArrayType }   = require("./fixedPointNumber");
const { convertToFPArray } = require("./fixedPointNumber");


// Auxiliary function
function genRandomArray(day_num, metric) {
    const genRandom = (min, max) => {
        const random = min + Math.random() * (max - min);
        return Math.round((random + Number.EPSILON) * 100) / 100; // At most 2 decimals
    }
    
    let metric_index = null;
    const value = [];
    switch (metric) {
        case "AT": // Air Temperature
            for(let i = 0; i < (day_num * 1440); i++) {
                value.push(
                    genRandom(25, 30)
                );
            }
            metric_index = 0;
            break;
        case "TD": // Temperature Difference
            for(let i = 0; i < (day_num * 1440); i++) {
                value.push(
                    genRandom(0, 3)
                );
            }
            metric_index = 1;
            break;
        case "ST": // Soil Temperature
            for(let i = 0; i < (day_num * 1440); i++) {
                value.push(
                    genRandom(22, 30)
                );
            }
            metric_index = 2;
            break;
        case "AH": // Air Humidity
            for(let i = 0; i < (day_num * 1440); i++) {
                value.push(
                    genRandom(90, 100)
                );
            }
            metric_index = 3;
            break;
        case "SH": // Soil Humidity
            for(let i = 0; i < (day_num * 1440); i++) {
                value.push(
                    genRandom(30, 50)
                );
            }
            metric_index = 4;
            break;
        case "WC": // Watering Cycle
            for(let i = 0; i < (day_num * 1440); i++) {
                value.push(
                    genRandom(0.01, 0.5)
                );
            }
            metric_index = 5;
            break;
        case "SE": // Soil Electrical conductivity
            for(let i = 0; i < (day_num * 1440); i++) {
                value.push(
                    genRandom(300, 400)
                );
            }
            metric_index = 6;
            break;
        default:
            throw new Error(`Unknown metric index: ${metric}`);
    }
    
    return [value, metric_index];
}


// Main function
async function main1() {
    /***************************** Manual configs *****************************/
    if((process.argv).length !== 4) {
        console.error("\n[Example usage]");
        console.error("$ node scripts/genRandomInput.js <day_num> <metric>");
        process.exit(1);
    }
    const day_num = parseInt(process.argv[2]);
    const metric  = process.argv[3];
    /**************************************************************************/
    
    const input_json = {
        metric: 0,
        average: 0,
        variance: 0,
        value: [],
        value_SDM: [],
        score: 0
    };
    const [raw_value, metric_index] = genRandomArray(day_num, metric);
    const value = convertToFPArray(raw_value);
    
    const value_SDM = calcSdmArray(value);
    const average   = calcAverage(value);
    const variance  = calcVariance(value);
    
    input_json.average   = average.toString();
    input_json.variance  = variance.toString();
    input_json.value     = value.toString();
    input_json.value_SDM = value_SDM.toString();
    input_json.metric    = metric_index;
    input_json.score     = (metricAT(value)).toString();
    
    fs.writeFileSync(
        `circuits/data/input.${day_num}.${metric}.json`,
        JSON.stringify(input_json),
        (error) => {
            if(error) {
                console.error(error.message);
            }
    });
    
    console.log(raw_value);
    console.log(value.toString());
}

const {MerkleTree} = require("./merkleTree");
async function main() {
    const input_u8 = fs.readFileSync("circuits/data/json/93c49454-0f3f-4082-b973-94566e0f4296.json");
    //const input_u8 = fs.readFileSync("circuits/data/input.json");
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
        "circuits/data/qkuwerhqkwe.json",
        JSON.stringify(tree, null, 2),
        (error) => {
            if(error) {
                console.error(error.message);
            }
    });
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });