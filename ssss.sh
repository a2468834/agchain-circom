#!/bin/bash
set -x

node scripts/test.js
echo "------------------------------------------------------------"
yarn compile merkleTree
echo "------------------------------------------------------------"
yarn zkey merkleTree powers-of-tau/powersOfTau28_hez_final_25.ptau
echo "------------------------------------------------------------"
yarn proof merkleTree circuits/data/input.json