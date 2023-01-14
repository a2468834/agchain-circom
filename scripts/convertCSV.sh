for file in 'circuits/data/csv/'*'.csv'
do
    name_ext="$(basename -- $file)"
    name="${name_ext%.*}"
    ext="${name_ext##*.}"
    
    echo "Converting $file"
    node scripts/csvToJson.js "$file" "circuits/data/json/$name.json"
done