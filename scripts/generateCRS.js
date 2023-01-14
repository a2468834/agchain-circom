// Packages
const util = require("node:util");
const exec = util.promisify(require("node:child_process").exec);


// Constants
/**** Generate CRSs with the following configs will cost at least 6 hours. ****/
const curve_name     = "bn128";
const max_constraint = "20"; // i.e., 2^20
const entropy_length = "20";
const VDF_iteration  = "20"; // i.e., 2^20


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
        console.log(stdio.stdout);
    }
    else {
        console.log(stdio.stdout);
        console.log("----------");
        console.error(stdio.stderr);
    }
}


// Main function
async function main() {
    // Generate CRS phase 1 (i.e., Powers of Tau Ceremony)
    {
        const param1 = curve_name;
        const param2 = max_constraint;
        const param3 = `./powers_of_tau_backup/pot${max_constraint}_00.ptau`;
        printConsoleLog(
            await exec(`yarn snarkjs powersoftau new ${param1} ${param2} ${param3} -v`)
        );
    }
    
    // Three time contributions
    {
        {
            const param1 = `./powers_of_tau_backup/pot${max_constraint}_00.ptau`;
            const param2 = `./powers_of_tau_backup/pot${max_constraint}_01.ptau`;
            const param3 = await randomByteString(entropy_length);
            const param4 = "1st contribution";
            printConsoleLog(
                await exec(`yarn snarkjs powersoftau contribute ${param1} ${param2} -e="${param3}" -n="${param4}" -v`)
            );
        }
        {
            const param1 = `./powers_of_tau_backup/pot${max_constraint}_01.ptau`;
            const param2 = `./powers_of_tau_backup/pot${max_constraint}_02.ptau`;
            const param3 = await randomByteString(entropy_length);
            const param4 = "2nd contribution";
            printConsoleLog(
                await exec(`yarn snarkjs powersoftau contribute ${param1} ${param2} -e="${param3}" -n="${param4}" -v`)
            );
        }
        {
            const param1 = `./powers_of_tau_backup/pot${max_constraint}_02.ptau`;
            const param2 = `./powers_of_tau_backup/pot${max_constraint}_03.ptau`;
            const param3 = await randomByteString(entropy_length);
            const param4 = "3rd contribution";
            printConsoleLog(
                await exec(`yarn snarkjs powersoftau contribute ${param1} ${param2} -e="${param3}" -n="${param4}" -v`)
            );
        }
    }
    
    // Apply random beacon and do preparation works for phase 2
    {
        {
            const param1 = `./powers_of_tau_backup/pot${max_constraint}_03.ptau`;
            const param2 = `./powers_of_tau_backup/pot${max_constraint}_beacon.ptau`;
            const param3 = await randomByteString(entropy_length);
            const param4 = VDF_iteration;
            const param5 = "final beacon";
            printConsoleLog(
                await exec(`yarn snarkjs powersoftau beacon ${param1} ${param2} ${param3} ${param4} -n="${param5}" -v`)
            );
        }
        {
            const param1 = `./powers_of_tau_backup/pot${max_constraint}_beacon.ptau`;
            const param2 = `./powers_of_tau_backup/pot${max_constraint}_final.ptau`;
            printConsoleLog(
                await exec(`yarn snarkjs powersoftau prepare phase2 ${param1} ${param2} -v`)
            );
        }
    }
    
    // Verify CRS
    {
        const param1 = `./powers_of_tau_backup/pot${max_constraint}_final.ptau`;
        printConsoleLog(
            await exec(`yarn snarkjs powersoftau verify ${param1} -v`)
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