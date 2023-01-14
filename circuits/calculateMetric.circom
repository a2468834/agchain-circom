pragma circom 2.0.0;

/**
 * Circom does not support multi-layer function call.
 * E.g., `a + b - c*d` cannot be written as `fpaAdd(a, fpaSub(b, fpaMul(c, d)))`
 */

// AT := Air Temperature
function metricAT(average, variance) {
    var avg_point   = 0;
    var var_point   = 0;
    var final_point = 0;
    
    var param1 = 100 * (10 ** 8); // 100
    var param2 = 10 * (10 ** 8);  // 10
    var param3 = 27 * (10 ** 8);  // 27
    var param4 = 3 * (10 ** 8);   // 3
    var param5 = 2 * (10 ** 8);   // 2
    var param6 = 90 * (10 ** 8);  // 90
    var param7 = 30 * (10 ** 8);  // 30
    var param8 = 80000000;        // 0.8
    
    /******************************* avg_point ********************************/
    if ((average > 25 * (10 ** 8)) && (average < 30 * (10 ** 8))) {
        var temp1 = abs(average - param3);
        var temp2 = param2 * temp1 \ 100000000;
        var temp3 = temp2 \ param4 * 100000000;
        var temp4 = param1 - temp3;
        avg_point = temp4;
    }
    else {
        var temp1 = abs(average - param3);
        var temp2 = param2 * temp1 \ 100000000;
        var temp3 = temp2 \ param5 * 100000000;
        var temp4 = param1 - temp3;
        avg_point = temp4;
    }
    
    /******************************* var_point ********************************/
    if (variance < 5 * (10**8)) {
        var_point = param1;
    }
    else {
        if (variance < 10 * (10**8)) {
            var_point = param6;
        }
        else {
            if (variance <= 50 * (10**8)) {
                var temp1 = variance - param2;
                var temp2 = temp1 \ param8 * 100000000;
                var temp3 = param6 - temp2;
                var_point = temp3;
            }
            else {
                var_point = param7;
            }
        }
    }
    
    /****************************** final_point *******************************/
    //                      ↓0.7
    var temp1 = avg_point * 70000000 \ 100000000;
    //                      ↓0.3
    var temp2 = var_point * 30000000 \ 100000000;
    final_point = temp1 + temp2;
    //                    ↓Minimum score
    return (final_point < 75 * (10 ** 8)) ? (75 * (10 ** 8)) : (final_point);
}

// TD := Temperature Difference
function metricTD(average, variance) {
    var avg_point   = 0;
    var var_point   = 0;
    var final_point = 0;
    
    var param1 = 100 * (10 ** 8); // 100
    var param2 = 10 * (10 ** 8);  // 10
    var param3 = 3 * (10 ** 8);   // 3
    var param4 = 2 * (10 ** 8);   // 2.0
    var param5 = 150000000;       // 1.5
    var param6 = 90 * (10 ** 8);  // 90
    var param7 = 80000000;        // 0.8
    var param8 = 30 * (10 ** 8);  // 30
    
    /******************************* avg_point ********************************/
    if ((average > 0 * (10 ** 8)) && (average < 3 * (10 ** 8))) {
        avg_point = param1;
    }
    else {
        if (average < 5 * (10 ** 8)) {
            var temp1 = abs(average - param3);
            var temp2 = param2 * temp1 \ 100000000;
            var temp3 = temp2 \ param4 * 100000000;
            var temp4 = param1 - temp3;
            avg_point = temp4;
        }
        else {
            var temp1 = abs(average - param3);
            var temp2 = param2 * temp1 \ 100000000;
            var temp3 = temp2 \ param5 * 100000000;
            var temp4 = param1 - temp3;
            avg_point = temp4;
        }
    }
    
    /******************************* var_point ********************************/
    if (variance < 5 * (10 ** 8)) {
        var_point = param1;
    }
    else {
        if (variance < 10 * (10 ** 8)) {
            var_point = param6;
        }
        else {
            if (variance <= 50 * (10 ** 8)) {
                var temp1 = variance - param2;
                var temp2 = temp1 \ param7 * 100000000;
                var temp3 = param6 - temp2;
                var_point = temp3;
            }
            else {
                var_point = param8;
            }
        }
    }
    
    /****************************** final_point *******************************/
    //                      ↓0.7
    var temp1 = avg_point * 70000000 \ 100000000;
    //                      ↓0.3
    var temp2 = var_point * 30000000 \ 100000000;
    final_point = temp1 + temp2;
    //                    ↓Minimum score
    return (final_point < 75 * (10 ** 8)) ? (75 * (10 ** 8)) : (final_point);
}

// ST := Soil Temperature
function metricST(average, variance) {
    var avg_point   = 0;
    var var_point   = 0;
    var final_point = 0;
    
    var param1 = 100 * (10 ** 8); // 100
    var param2 = 10 * (10 ** 8);  // 10
    var param3 = 22 * (10 ** 8);  // 22  threshold["avg"][0]
    var param4 = 60000000;        // 0.6 threshold["avg"][1]
    var param5 = 18 * (10 ** 8);  // 18  threshold["avg"][2]
    var param6 = 160000000;       // 1.6 threshold["avg"][3]
    var param7 = 10000000;        // 0.1 threshold["var"][0]
    var param8 = 50000000;        // 0.5 threshold["var"][1]
    var param9 = 10000000;        // 0.1
    var paramA = 40000000;        // 0.4
    var paramB = 70000000;        // 0.7 threshold["dst"][0]
    var paramC = 30000000;        // 0.3 threshold["dst"][1]
    
    /******************************* avg_point ********************************/
    if (average > param3) {
        var temp1 = abs(average - param3);
        var temp2 = param2 * temp1 \ 100000000;
        var temp3 = temp2 \ param4 * 100000000;
        var temp4 = param1 - temp3;
        avg_point = temp4;
    }
    else {
        if (average < param5) {
            var temp1 = abs(average - param5);
            var temp2 = param2 * temp1 \ 100000000;
            var temp3 = temp2 \ param6 * 100000000;
            var temp4 = param1 - temp3;
            avg_point = temp4;
        }
        else {
            avg_point = param1;
        }
    }
    
    /******************************* var_point ********************************/
    if (variance < param7) {
        var_point = param1;
    }
    else {
        if (variance <= param8) {
            var temp1 = variance - param9;
            var temp2 = temp1 / paramA * 100000000;
            var temp3 = temp2 * param1 \ 100000000;
            var temp4 = param1 - temp3;
            var_point = temp4;
        }
    }
    
    /****************************** final_point *******************************/
    var temp1 = avg_point * paramB \ 100000000;
    var temp2 = var_point * paramC \ 100000000;
    final_point = temp1 + temp2;
    //                    ↓Minimum score
    return (final_point < 75 * (10 ** 8)) ? (75 * (10 ** 8)) : (final_point);
}

// AH := Air Humidity
function metricAH(average, variance) {
    var avg_point   = 0;
    var var_point   = 0;
    var final_point = 0;
    
    var param1 = 100 * (10 ** 8); // 100
    var param2 = 10 * (10 ** 8);  // 10
    var param3 = 90 * (10 ** 8);  // 90   threshold["avg"][0]
    var param4 = 250000000;       // 2.5  threshold["avg"][1]
    var param5 = 55 * (10 ** 8);  // 55   threshold["avg"][2]
    var param6 = 75000000;        // 0.75 threshold["avg"][3]
    var param7 = 10000000;        // 0.1  threshold["var"][0]
    var param8 = 50000000;        // 0.5  threshold["var"][1]
    var param9 = 10000000;        // 0.1
    var paramA = 40000000;        // 0.4
    var paramB = 70000000;        // 0.7  threshold["dst"][0]
    var paramC = 30000000;        // 0.3  threshold["dst"][1]
    
    /******************************* avg_point ********************************/
    if (average > param3) {
        var temp1 = abs(average - param3);
        var temp2 = param2 * temp1 \ 100000000;
        var temp3 = temp2 \ param4 * 100000000;
        var temp4 = param1 - temp3;
        avg_point = temp4;
    }
    else {
        if (average < param5) {
            var temp1 = abs(average - param5);
            var temp2 = param2 * temp1 \ 100000000;
            var temp3 = temp2 \ param6 * 100000000;
            var temp4 = param1 - temp3;
            avg_point = temp4;
        }
    }
    
    /******************************* var_point ********************************/
    if (variance < param7) {
        var_point = param1;
    }
    else {
        if (variance <= param8) {
            var temp1 = variance - param9;
            var temp2 = temp1 / paramA * 100000000;
            var temp3 = temp2 * param1 \ 100000000;
            var temp4 = param1 - temp3;
            var_point = temp4;
        }
    }
    
    /****************************** final_point *******************************/
    var temp1 = avg_point * paramB \ 100000000;
    var temp2 = var_point * paramC \ 100000000;
    final_point = temp1 + temp2;
    //                    ↓Minimum score
    return (final_point < 75 * (10 ** 8)) ? (75 * (10 ** 8)) : (final_point);
}

// SH := Soil Humidity
function metricSH(average, variance) {
    var avg_point   = 0;
    var var_point   = 0;
    var final_point = 0;
    
    var param1 = 100 * (10 ** 8); // 100
    var param2 = 10 * (10 ** 8);  // 10
    var param3 = 30 * (10 ** 8);  // 30  threshold["avg"][0]
    var param4 = 2 * (10 ** 8);   // 2   threshold["avg"][1]
    var param5 = 17 * (10 ** 8);  // 17  threshold["avg"][2]
    var param6 = 1 * (10 ** 8);   // 1   threshold["avg"][3]
    var param7 = 10000000;        // 0.1 threshold["var"][0]
    var param8 = 50000000;        // 0.5 threshold["var"][1]
    var param9 = 10000000;        // 0.1
    var paramA = 40000000;        // 0.4
    var paramB = 70000000;        // 0.7 threshold["dst"][0]
    var paramC = 30000000;        // 0.3 threshold["dst"][1]
    
    /******************************* avg_point ********************************/
    if (average > param3) {
        var temp1 = abs(average - param3);
        var temp2 = param2 * temp1 \ 100000000;
        var temp3 = temp2 \ param4 * 100000000;
        var temp4 = param1 - temp3;
        avg_point = temp4;
    }
    else {
        if (average < param5) {
            var temp1 = abs(average - param5);
            var temp2 = param2 * temp1 \ 100000000;
            var temp3 = temp2 \ param6 * 100000000;
            var temp4 = param1 - temp3;
            avg_point = temp4;
        }
    }
    
    /******************************* var_point ********************************/
    if (variance < param7) {
        var_point = param1;
    }
    else {
        if (variance <= param8) {
            var temp1 = variance - param9;
            var temp2 = temp1 / paramA * 100000000;
            var temp3 = temp2 * param1 \ 100000000;
            var temp4 = param1 - temp3;
            var_point = temp4;
        }
    }
    
    /****************************** final_point *******************************/
    var temp1 = avg_point * paramB \ 100000000;
    var temp2 = var_point * paramC \ 100000000;
    final_point = temp1 + temp2;
    //                    ↓Minimum score
    return (final_point < 75 * (10 ** 8)) ? (75 * (10 ** 8)) : (final_point);
}

// WC := Watering Cycle
function metricWC(average, variance) {
    var avg_point   = 0;
    var var_point   = 0;
    var final_point = 0;
    
    var param1 = 100 * (10 ** 8); // 100
    var param2 = 90 * (10 ** 8);  // 90
    var param3 = 50000000;        // 0.5 threshold["avg"][0]
    var param4 = 1 * (10 ** 8);   // 1   threshold["avg"][1]
    var param5 = 10 * (10 ** 8);  // 10
    
    if (average <= param3) {
        final_point = param1;
    }
    else {
        if (average <= param4) {
            final_point = param2;
        }
        else {
            var temp1 = average \ param3 * 100000000;
            var temp2 = temp1 * param5 \ 100000000;
            var temp3 = param2 - temp2;
            final_point = (temp3 < 0) ? (0) : (temp3);
        }
    }
    
    /****************************** final_point *******************************/
    //                    ↓Minimum score
    return (final_point < 75 * (10 ** 8)) ? (75 * (10 ** 8)) : (final_point);
}

// SE := Soil Electrical conductivity
function metricSE(average, variance) {
    var avg_point   = 0;
    var var_point   = 0;
    var final_point = 0;
    
    var param1 = 400 * (10 ** 8);  // 400
    var param2 = 4 * (10 ** 8);    // 4
    var param3 = 100 * (10 ** 8);  // 100
    var param4 = 80 * (10 ** 8);   // 80
    var param5 = 4000 * (10 ** 8); // 4000
    var param6 = 25 * (10 ** 8);   // 25.0
    
    //            ↓400.009
    if (average < 40000900000) {
        var temp1 = param1 - average;
        var temp2 = temp1 \ param2 * 100000000;
        final_point = temp2;
    }
    else {
        //             ↓1000.009
        if (average <= 100000900000) {
            final_point = param3;
        }
        else {
            //             ↓2000.009
            if (average <= 200000900000) {
                final_point = param4;
            }
            else {
                var temp1 = param5 - average;
                var temp2 = temp1 \ param6 * 100000000;
                var temp3 = param4 - temp2;
                final_point = temp3;
            }
        }
    }
    
    /****************************** final_point *******************************/
    //                    ↓Minimum score
    return (final_point < 75 * (10 ** 8)) ? (75 * (10 ** 8)) : (final_point);
}