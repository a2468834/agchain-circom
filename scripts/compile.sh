mkdir -p artifacts

if [ $# -ne 0 ]; then
    echo ""
    echo "[Compile]" $file
    circom 'circuits/'$1'.circom' --O0 --r1cs --wasm --json --output=artifacts --verbose
else
    for file in 'circuits/'*'.circom'
    do
        if [[ $file == *"~"* ]]; then
            echo "[Skipped compile]" $file
        elif [[ $file == *".lib."* ]]; then
            echo "[Skipped library]" $file
        else
            echo ""
            echo "[Compile]" $file
            circom $file --O0 --r1cs --wasm --json --output=artifacts --verbose
        fi
        echo ""
    done
fi