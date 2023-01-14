// Constant
const FactorBase = 10;
const FactorExp  = 8; // 10 ** 8


// Function
BigInt.prototype.toJSON = function () { return this.toString(10); }

function checkArrayType(array, targetType) {
    const type_name = Object.prototype.toString.call(targetType[0]);
    
    if(!(array instanceof Array)) {
        throw new Error(`Please provide Array<${(type_name).slice(8, -1)}>`);
    }
    for(let i = 0; i < array.length; i++) {
        if(typeof(targetType[0]) === "object") {
            if(!((array[i]) instanceof (targetType[0]).constructor)) {
                throw new Error(`Please provide Array<${(type_name).slice(8, -1)}>`);
            }
        }
        else { // Case for JavaScript primitive types
            if(typeof(array[i]) !== typeof(targetType[0])) {
                throw new Error(`Please provide Array<${(type_name).slice(8, -1)}>`);
            }
        }
    }
}

function convertToFPArray(raw_array) {
    checkArrayType(raw_array, [0.0]);
    
    const array = raw_array.slice();
    
    for(let i = 0; i < array.length; i++) {
        try {
            array[i] = FPA(array[i]);
        }
        catch (error) {
            throw new Error(error.message);
        }
    }
    
    return array;
}


// Class
class FPNumber {
    #number; // A `BigInt` fixed point number with multiplier (base ** exponent)
    #factor_base;
    #factor_exponent;
    
    constructor(number, enableScale = true, base = FactorBase, exponent = FactorExp) {
        if(enableScale) {
            this.#number          = this.#toFPA(number, true, base, exponent);
            this.#factor_base     = base;
            this.#factor_exponent = exponent;
        }
        else {
            this.#number          = this.#toFPA(number, false);
            this.#factor_base     = base;
            this.#factor_exponent = exponent;
        }
    }
    /**
     * Absolute value
     */
    static abs(number) {
        if(!(number instanceof FPNumber)) {
            throw new Error(`Try to do arithmetic with non-\`FPNumber\` object: ${Object.prototype.toString.call(number)}`);
        }
        else {
            return (number.gt(FPA(0))) ? (number) : (FPA(0).sub(number));
        }
    }
    
    get [Symbol.toStringTag]() {
        return "FPNumber";
    }
    
    get number() {
        return this.#number;
    }
    
    get base() {
        return this.#factor_base;
    }
    
    get exponent() {
        return this.#factor_exponent;
    }
    
    toString(radix = 10) {
        return (this.#number).toString(radix);
    }
    
    /**
     * Addition
     */
    add(y) {
        this.#checkOperand(y);
        return new FPNumber(
            this.#number + y.#number,
            false,
            this.#factor_base,
            this.#factor_exponent
        );
    }
    
    /**
     * Subtraction
     */
    sub(y) {
        this.#checkOperand(y);
        return new FPNumber(
            this.#number - y.#number,
            false,
            this.#factor_base,
            this.#factor_exponent
        );
    }
    
    /**
     * Multiplication
     */
    mul(y) {
        this.#checkOperand(y);
        return new FPNumber(
            this.#number * y.#number / BigInt(this.#factor_base ** this.#factor_exponent),
            false,
            this.#factor_base,
            this.#factor_exponent
        );
    }
    
    /**
     * Floor division
     */
    div(y) {
        this.#checkOperand(y);
        return new FPNumber(
            this.#number / y.#number * BigInt(this.#factor_base ** this.#factor_exponent),
            false,
            this.#factor_base,
            this.#factor_exponent
        );
    }
    
    /**
     * Less than <
     */
    lt(y) {
        this.#checkOperand(y);
        return (this.#number < y.#number);
    }
    
    /**
     * Less than or equal to <=
     */
    le(y) {
        this.#checkOperand(y);
        return (this.#number <= y.#number);
    }
    
    /**
     * Greater than >
     */
    gt(y) {
        this.#checkOperand(y);
        return (this.#number > y.#number);
    }
    
    /**
     * Greater than or equal to >=
     */
    ge(y) {
        this.#checkOperand(y);
        return (this.#number >= y.#number);
    }
    
    /**
     * Equal to ==
     */
    eq(y) {
        this.#checkOperand(y);
        return (this.#number === y.#number);
    }
    
    /**
     * Not equal to !=
     */
    ne(y) {
        this.#checkOperand(y);
        return (this.#number !== y.#number);
    }
    
    #checkOperand(y) {
        if(!(y instanceof FPNumber)) {
            throw new Error(`Try to do arithmetic with non-\`FPNumber\` object: ${Object.prototype.toString.call(y)}`);
        }
        else if((this.#factor_base !== y.#factor_base) || (this.#factor_exponent !== y.#factor_exponent)) {
            console.error(`${this.#factor_base} ${this.#factor_exponent}`);
            console.error(`${y.#factor_base} ${y.#factor_exponent}`);
            
            throw new Error(`Different multiplier: ${y.#factor_base} ** ${y.#factor_exponent}`);
        }
        else {
            // Do nothing
        }
    }
    
    #toFPA(number, enableScale, base = FactorBase, exp = FactorExp) {
        if(enableScale) {
            if(typeof(number) !== "number") {
                throw new Error(`Cannot convert type: ${
                    Object.prototype.toString.call(number)
                }`);
            }
            
            if(number > Number.MAX_SAFE_INTEGER || number < Number.MIN_SAFE_INTEGER) {
                throw new Error(`Cannot convert number larger than ${Number.MAX_SAFE_INTEGER}`);
            }
            
            return BigInt(
                Math.floor(number *  (base ** exp))
            );
        }
        else {
            if(typeof(number) === "number") {
                return BigInt(Math.floor(number));
            }
            else {
                try {
                    return BigInt(number);
                }
                catch (error) {
                    console.error(error.message);
                }
            }
        }
    }
}

// Fixed Point number Arithmetic
function FPA(number) {
    return new FPNumber(number);
}


module.exports = {
    FPNumber,
    FPA,
    checkArrayType,
    convertToFPArray,
};