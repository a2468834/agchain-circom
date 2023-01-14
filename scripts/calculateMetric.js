// Package
const { FPNumber }         = require("./fixedPointNumber");
const { convertToFPArray } = require("./fixedPointNumber");
const { FPA }              = require("./fixedPointNumber");
const { checkArrayType }   = require("./fixedPointNumber");


// Function
function calcAverage(array) {
    checkArrayType(array, [FPA(0)]);
    
    let sum = FPA(0);
    for(let i = 0; i < array.length; i++) {
        sum = sum.add(array[i]);
    }
    
    return new FPNumber(
        sum.number / BigInt(array.length),
        false,
        sum.base,
        sum.exponent
    );
}

function calcVariance(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average = calcAverage(array);
    
    // SDM := Squared Deviations from the Mean
    let sum_SDM = FPA(0);
    for(let i = 0; i < array.length; i++) {
        sum_SDM = sum_SDM.add(
            (array[i].sub(average)).mul(array[i].sub(average))
        );
    }
    
    return new FPNumber(
        sum_SDM.number / BigInt(array.length),
        false,
        sum_SDM.base,
        sum_SDM.exponent
    );
}

function calcSdmArray(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average = calcAverage(array);
    
    // SDM := Squared Deviations from the Mean
    const array_SDM = [];
    for(let i = 0; i < array.length; i++) {
        array_SDM.push(
            (array[i].sub(average)).mul(array[i].sub(average))
        );
    }
    
    return array_SDM;
}

function getThreshold(metric) {
    const threshold = {
        avg: [],         // average
        var: [0.1, 0.5], // variance
        dst: [0.7, 0.3], // distribution
    };
    
    switch (metric) {
        case "AT":
            threshold.avg = [26, 1, 15, 2.5];
            break;
        case "TD":
            threshold.avg = [7, 2, 5, 2];
            break;
        case "ST":
            threshold.avg = [22, 0.6, 18, 1.6];
            break;
        case "AH":
            threshold.avg = [90, 2.5, 55, 0.75];
            break;
        case "SH":
            threshold.avg = [30, 2, 17, 1]
            break;
        case "WC":
            threshold.avg = [0.5, 1]
            break;
        case "SE":
            threshold.avg = [400, 4, 1000, 2000, 4000, 25];
            break;
        default:
            throw new Error(`Unknown metric tag: ${metric}`);
    }
    
    const threshold_FPA = {
        avg: convertToFPArray(threshold.avg),
        var: convertToFPArray(threshold.var),
        dst: convertToFPArray(threshold.dst),
    };
    
    return threshold_FPA;
}

function metricAT(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average   = calcAverage(array);
    const variance  = calcVariance(array);
    const threshold = getThreshold("AT");
    
    /*************************** Grading Algorithm ****************************/
    let avg_point   = FPA(0);
    let var_point   = FPA(0);
    let final_point = FPA(0);
    
    if ((average.gt(FPA(25))) && (average.lt(FPA(30)))) {
        const temp1 = FPNumber.abs(average.sub(FPA(27)));
        const temp2 = FPA(10).mul(temp1).div(FPA(3.0));
        avg_point = FPA(100).sub(temp2);
    }
    else {
        const temp1 = FPNumber.abs(average.sub(FPA(27)));
        const temp2 = FPA(10).mul(temp1).div(FPA(2));
        avg_point = FPA(100).sub(temp2);
    }
    
    if (variance.lt(FPA(5))) {
        var_point = FPA(100);
    }
    else if (variance.lt(FPA(10))) {
        var_point = FPA(90);
    }
    else if (variance.le(50)) {
        const temp1 = variance.sub(FPA(10));
        const temp2 = temp1.div(FPA(0.8)); 
        var_point = FPA(90).sub(temp2);
    }
    else {
        var_point = FPA(30);
    }
    
    final_point = (avg_point.mul(threshold.dst[0])).add(var_point.mul(threshold.dst[1]));
    return (final_point.lt(FPA(75))) ? (FPA(75)) : (final_point);
}

function metricTD(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average   = calcAverage(array);
    const variance  = calcVariance(array);
    const threshold = getThreshold("TD");
    
    /*************************** Grading Algorithm ****************************/
    let avg_point   = FPA(0);
    let var_point   = FPA(0);
    let final_point = FPA(0);
    
    if(average.gt(FPA(0)) && (average.lt(FPA(3)))) {
        avg_point = FPA(100);
    }
    else if(average.lt(FPA(5))) {
        const temp1 = FPNumber.abs(average.sub(FPA(3)));
        const temp2 = FPA(10).mul(temp1).div(FPA(2.0));
        avg_point = FPA(100).sub(temp2);
    }
    else {
        const temp1 = FPNumber.abs(average.sub(FPA(3)));
        const temp2 = FPA(10).mul(temp1).div(FPA(1.5));
        avg_point = FPA(100).sub(temp2);
    }
    
    if(variance.lt(FPA(5))) {
        var_point = FPA(100);
    }
    else if(variance.lt(FPA(10))) {
        var_point = FPA(90);
    }
    else if(variance.le(FPA(50))) {
        const temp = (variance.sub(FPA(10))).div(FPA(0.8));
        var_point = FPA(90).sub(temp);
    }
    else {
        var_point = FPA(30);
    }
        
    final_point = (avg_point.mul(threshold.dst[0])).add(var_point.mul(threshold.dst[1]));
    return (final_point.lt(FPA(75))) ? (FPA(75)) : (final_point);
}

function metricST(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average   = calcAverage(array);
    const variance  = calcVariance(array);
    const threshold = getThreshold("ST");
    
    /*************************** Grading Algorithm ****************************/
    let avg_point   = FPA(0);
    let var_point   = FPA(0);
    let final_point = FPA(0);
    
    if(average.gt(threshold.avg[0])) {
        const temp1 = FPNumber.abs(average.sub(threshold.avg[0]));
        const temp2 = FPA(10).mul(temp1).div(threshold.avg[1]);
        avg_point = FPA(100).sub(temp2);
    }
    else if(average.lt(threshold.avg[2])) {
        const temp1 = FPNumber.abs(average.sub(threshold.avg[2]));
        const temp2 = FPA(10).mul(temp1).div(threshold.avg[3]);
        avg_point = FPA(100).sub(temp2);
    }
    else {
        avg_point = FPA(100);
    }
    
    if(variance.lt(threshold.var[0])) {
        var_point = FPA(100);
    }
    else if(variance.le(threshold.var[1])) {
        const temp1 = variance.sub(FPA(0.1));
        const temp2 = temp1.div(FPA(0.4)).mul(FPA(100));
        var_point = FPA(100).sub(temp2);
    }
    
    final_point = (avg_point.mul(threshold.dst[0])).add(var_point.mul(threshold.dst[1]));
    return (final_point.lt(FPA(75))) ? (FPA(75)) : (final_point);
}

function metricAH(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average   = calcAverage(array);
    const variance  = calcVariance(array);
    const threshold = getThreshold("AH");
    
    /*************************** Grading Algorithm ****************************/
    let avg_point   = FPA(0);
    let var_point   = FPA(0);
    let final_point = FPA(0);
    
    if(average.gt(threshold.avg[0])) {
        const temp1 = FPNumber.abs(average.sub(threshold.avg[0]));
        const temp2 = FPA(10).mul(temp1).div(threshold.avg[1]);
        avg_point = FPA(100).sub(temp2);
    }
    else if(average.lt(threshold.avg[2])) {
        const temp1 = FPNumber.abs(average.sub(threshold.avg[2]));
        const temp2 = FPA(10).mul(temp1).div(threshold.avg[3]);
        avg_point = FPA(100).sub(temp2);
    }
    
    if(variance.lt(threshold.var[0])) {
        var_point = FPA(100);
    }
    else if(variance.le(threshold.var[1])) {
        const temp1 = variance.sub(FPA(0.1));
        const temp2 = temp1.div(FPA(0.4)).mul(FPA(100));
        var_point = FPA(100).sub(temp2);
    }
    
    final_point = (avg_point.mul(threshold.dst[0])).add(var_point.mul(threshold.dst[1]));
    return (final_point.lt(FPA(75))) ? (FPA(75)) : (final_point);
}

function metricSH(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average   = calcAverage(array);
    const variance  = calcVariance(array);
    const threshold = getThreshold("SH");
    
    /*************************** Grading Algorithm ****************************/
    let avg_point   = FPA(0);
    let var_point   = FPA(0);
    let final_point = FPA(0);
    
    if(average.gt(threshold.avg[0])) {
        const temp1 = FPNumber.abs(average.sub(threshold.avg[0]));
        const temp2 = FPA(10).mul(temp1).div(threshold.avg[1]);
        avg_point = FPA(100).sub(temp2);
    }
    else if(average.lt(threshold.avg[2])) {
        const temp1 = FPNumber.abs(average.sub(threshold.avg[2]));
        const temp2 = FPA(10).mul(temp1).div(threshold.avg[3]);
        avg_point = FPA(100).sub(temp2);
    }
    
    if(variance.lt(threshold.var[0])) {
        var_point = FPA(100);
    }
    else if(variance.le(threshold.var[1])) {
        const temp1 = variance.sub(FPA(0.1));
        const temp2 = temp1.div(FPA(0.4)).mul(FPA(100));
        var_point = FPA(100).sub(temp2);
    }
    
    final_point = (avg_point.mul(threshold.dst[0])).add(var_point.mul(threshold.dst[1]));
    return (final_point.lt(FPA(75))) ? (FPA(75)) : (final_point);
}

function metricWC(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average   = calcAverage(array);
    const variance  = calcVariance(array);
    const threshold = getThreshold("WC");
    
    /*************************** Grading Algorithm ****************************/
    let avg_point   = FPA(0);
    let var_point   = FPA(0);
    let final_point = FPA(0);
    
    if(average.le(threshold.avg[0])) {
        final_point = FPA(100);
    }
    else if(average.le(threshold.avg[1])) {
        final_point = FPA(90);
    }
    else {
        const temp1 = average.div(FPA(0.5)).mul(FPA(10));
        const temp2 = FPA(90).sub(temp1);
        final_point = (temp2.lt(FPA(0))) ? (FPA(0)) : (temp2);
    }
}

function metricSE(array) {
    checkArrayType(array, [FPA(0)]);
    
    const average   = calcAverage(array);
    const variance  = calcVariance(array);
    const threshold = getThreshold("SE");
    
    /*************************** Grading Algorithm ****************************/
    let avg_point   = FPA(0);
    let var_point   = FPA(0);
    let final_point = FPA(0);
    
    if(average.lt(FPA(400.009))) {            // i.e., `round(average, 2) < 400`
        final_point = (FPA(400).sub(average)).div(4);
    }
    else if(average.le(FPA(1000.009))) {    // i.e., `round(average, 2) <= 1000`
        final_point = FPA(100);
    }
    else if(average.le(FPA(2000.009))) {    // i.e., `round(average, 2) <= 2000`
        final_point = FPA(80);
    }
    else {
        const temp = (FPA(4000).sub(average)).div(25.0);
        final_point = FPA(80).sub(temp);
    }
}


module.exports = {
    calcAverage,
    calcVariance,
    calcSdmArray,
    metricAT,
    metricTD,
    metricST,
    metricAH,
    metricSH,
    metricWC,
    metricSE,
};