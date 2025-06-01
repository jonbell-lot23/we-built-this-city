import csv

def clean_csv(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as infile, \
         open(output_file, 'w', encoding='utf-8', newline='') as outfile:
        
        # Read the input file
        reader = csv.reader(infile)
        writer = csv.writer(outfile, quoting=csv.QUOTE_ALL)
        
        # Process each row
        for row in reader:
            # Clean each field
            cleaned_row = []
            for field in row:
                # Remove any extra quotes and clean up the field
                cleaned_field = field.strip().strip('"')
                # Replace any remaining quotes with escaped quotes
                cleaned_field = cleaned_field.replace('"', '""')
                cleaned_row.append(cleaned_field)
            
            # Write the cleaned row
            writer.writerow(cleaned_row)

if __name__ == "__main__":
    input_file = "public/enhanced_city.csv"
    output_file = "public/enhanced_city_cleaned.csv"
    clean_csv(input_file, output_file) 