// Packages
const fs = require("fs");
const path = require("path");


// Constants
const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;

// Main function
async function main() {
    if(process.argv.length !== 4) {
        throw new Error("Example: $ node scripts/csvToJson.js <source CSV> <destination JSON>");
    }
    
    const data = [];
    
    const input = fs.readFileSync(
        path.resolve(process.argv[2])
    );
    const input_array = input.toString().split("\r\n");
    
    for(let i = 1; i < (input_array.length - 1); i++) {
        const row = input_array[i].split(",");
        
        if(data[row[3]] === undefined) {
            data[row[3]] = []; // sensorType
        }
        
        data[row[3]].push(
            {
                value: row[1],
                timestamp: row[2]
            }
        );
    }
    
    const output = [];
    
    for(const [key, value] of Object.entries(data)) {
        output.push(
            {
                sensorType: key,
                sensorData: value
            }
        );
    }
    fs.writeFileSync(
        path.resolve(process.argv[3]),
        JSON.stringify(output, null, 2),
        "utf-8"
    );
}


main()
    .then(() => {
        process.exit(EXIT_SUCCESS);
    })
    .catch((error) => {
        console.error(error);
        process.exit(EXIT_FAILURE);
    });