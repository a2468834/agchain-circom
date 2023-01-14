pragma circom 2.0.0;

// Multiplier factor := 10 ** 8 = 100000000

function abs(x) {
    return (x > 0) ? (x):(0 - x);
}

function fpaPos(x) {
    return 0 + x;
}

function fpaNeg(x) {
    return (0 - x);
}

function fpaAdd(x, y) {
    return x + y;
}

function fpaSub(x, y) {
    return x - y;
}

function fpaMul(x, y) {
    return x * y \ (100000000);
}

function fpaFloorDiv(x, y) {
    return x \ y * (100000000);
}

function fpaMod(x, y) {
    return x % y;
}

function fpaRounding(x, ndigits) {
    return x \ (10**ndigits) * (10**ndigits);
}