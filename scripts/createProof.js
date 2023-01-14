// Packages
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);
const fs   = require("fs");


// Constants
const proving_system = "groth16"; // Or "plonk"


// Auxiliary function
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
        const argv3 = "<path_to_input.json>";
        
        console.error("\n[Example usage]");
        console.error(`$ node scripts/createProof.js ${argv2} ${argv3}`);
        process.exit(1);
    }
    
    // Generate proofs
    {
        const param1 = process.argv[3];
        const param2 = `artifacts/${process.argv[2]}_js/${process.argv[2]}.wasm`;
        const param3 = `circuits/zkey/${process.argv[2]}_final.zkey`;
        const param4 = `circuits/data/${process.argv[2]}_proof.json`;
        const param5 = `circuits/data/${process.argv[2]}_public.json`;
        printConsoleLog(
            await exec(`yarn snarkjs ${proving_system} fullprove ${param1} ${param2} ${param3} ${param4} ${param5} -v`)
        );
    }
    
    // Verify validity of proofs (:= export verification key + verify proofs)
    {
        {
            const param1 = `circuits/zkey/${process.argv[2]}_final.zkey`;
            const param2 = `circuits/zkey/${process.argv[2]}_verification_key.json`;
            printConsoleLog(
                await exec(`yarn snarkjs zkey export verificationkey ${param1} ${param2} -v`)
            );
        }
        {
            const param1 = `circuits/zkey/${process.argv[2]}_verification_key.json`;
            const param2 = `circuits/data/${process.argv[2]}_public.json`;
            const param3 = `circuits/data/${process.argv[2]}_proof.json`;
            printConsoleLog(
                await exec(`yarn snarkjs ${proving_system} verify ${param1} ${param2} ${param3} -v`)
            );
        }
    }
    
    // Generate Verifier solidity contract
    {
        const param1 = `circuits/zkey/${process.argv[2]}_final.zkey`;
        const param2 = `contracts/${process.argv[2]}_verifier.sol`;
        printConsoleLog(
            await exec(`yarn snarkjs zkey export solidityverifier ${param1} ${param2} -v`)
        );
    }
    
    // Generate transaction calldata
    {
        const param1 = `circuits/data/${process.argv[2]}_public.json`;
        const param2 = `circuits/data/${process.argv[2]}_proof.json`;
        printConsoleLog(
            await exec(`yarn snarkjs zkey export soliditycalldata ${param1} ${param2} -v`)
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