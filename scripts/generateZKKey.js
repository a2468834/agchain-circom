// Packages
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const fs   = require("fs");


// Constants
const proving_system = "groth16"; // Or "plonk"
const entropy_length = "20";
const VDF_iteration  = "10"; // i.e., 2^10


// Auxiliary function
async function randomByteString(length) {
    const hex_alphabets = "0123456789abcdef";
    let random_string = [];
    
    for(let i = 0; i < length; i++) {
        random_string.push(hex_alphabets[Math.floor(Math.random()*100) % 16]);
    }
    
    return random_string.join('');
}

function printConsoleLog(stdio) {
    if(!stdio.error) {
        console.log();
        console.log(stdio.stdout);
    }
    else {
        console.log();
        console.log(stdio.stdout);
        console.log("----------");
        console.error(stdio.stderr);
    }
}


// Main function
async function main() {
    if((process.argv).length !== 4) {
        const argv2 = "<circuit_name>";
        const argv3 = "<path_to_powers_of_tau.ptau>";
        
        console.error("\n[Example usage]");
        console.error(`$ node scripts/generateZKKey.js ${argv2} ${argv3}`);
        process.exit(1);
    }
    
    if(proving_system === "groth16") {
        // Setup zk key
        {
            const param1 = `artifacts/${process.argv[2]}.r1cs`;
            const param2 = process.argv[3];
            const param3 = `circuits/zkey/${process.argv[2]}_00.zkey`;
            printConsoleLog(
                await exec(`yarn snarkjs ${proving_system} setup ${param1} ${param2} ${param3}`)
            );
        }
        
        // Three time contributions - 1st
        {
            const param1 = `circuits/zkey/${process.argv[2]}_00.zkey`;
            const param2 = `circuits/zkey/${process.argv[2]}_01.zkey`;
            const param3 = await randomByteString(entropy_length);
            const param4 = "1st zkey contribution";
            printConsoleLog(
                await exec(`yarn snarkjs zkey contribute ${param1} ${param2} -e="${param3}" -n="${param4}" -v`)
            );
        }
        
        // Three time contributions - 2nd
        {
            const param1 = `circuits/zkey/${process.argv[2]}_01.zkey`;
            const param2 = `circuits/zkey/${process.argv[2]}_02.zkey`;
            const param3 = await randomByteString(entropy_length);
            const param4 = "2nd zkey contribution";
            printConsoleLog(
                await exec(`yarn snarkjs zkey contribute ${param1} ${param2} -e="${param3}" -n="${param4}" -v`)
            );
        }
        
        // Three time contributions - 3rd
        {
            const param1 = `circuits/zkey/${process.argv[2]}_02.zkey`;
            const param2 = `circuits/zkey/${process.argv[2]}_03.zkey`;
            const param3 = await randomByteString(entropy_length);
            const param4 = "3rd zkey contribution";
            printConsoleLog(
                await exec(`yarn snarkjs zkey contribute ${param1} ${param2} -e="${param3}" -n="${param4}" -v`)
            );
        }
        
        // Apply random beacon
        {
            const param1 = `circuits/zkey/${process.argv[2]}_03.zkey`;
            const param2 = `circuits/zkey/${process.argv[2]}_final.zkey`;
            const param3 = await randomByteString(entropy_length);
            const param4 = VDF_iteration;
            const param5 = "final beacon phase 2"
            printConsoleLog(
                await exec(`yarn snarkjs zkey beacon ${param1} ${param2} ${param3} ${param4} -n="${param5}" -v`)
            );
        }
    }
    else {
        // Setup zk key
        {
            const param1 = `artifacts/${process.argv[2]}.r1cs`;
            const param2 = process.argv[3];
            const param3 = `circuits/zkey/${process.argv[2]}_final.zkey`;
            printConsoleLog(
                await exec(`yarn snarkjs ${proving_system} setup ${param1} ${param2} ${param3}`)
            );
        }
        
        // PLONK does not require the phase 2 ceremony for every circuits.
    }
    
    // Verify the final zk key
    {
        const param1 = `artifacts/${process.argv[2]}.r1cs`;
        const param2 = process.argv[3];
        const param3 = `circuits/zkey/${process.argv[2]}_final.zkey`;
        printConsoleLog(
            await exec(`yarn snarkjs zkey verify ${param1} ${param2} ${param3} -v`)
        );
    }
}

main()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/**
 * `public.json` and `proof.json` are ONLY two files which will be "broadcasted" to everyone.
 */