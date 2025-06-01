import csv

def fix_csv(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Process header
    header = lines[0].strip().strip('"').split('","')
    fixed_lines = [','.join(f'"{h}"' for h in header)]
    
    # Process data rows
    current_row = []
    current_field = []
    in_quotes = False
    
    for line in lines[1:]:
        line = line.strip()
        if not line:
            continue
            
        # Split by quote boundaries
        parts = []
        current_part = []
        for char in line:
            if char == '"':
                if current_part:
                    parts.append(''.join(current_part))
                    current_part = []
                in_quotes = not in_quotes
            else:
                current_part.append(char)
        if current_part:
            parts.append(''.join(current_part))
        
        # Process parts
        for part in parts:
            if not in_quotes:
                if current_field:
                    current_field.append(part)
                    current_row.append(''.join(current_field))
                    current_field = []
                else:
                    current_row.append(part)
            else:
                current_field.append(part)
        
        # If we have a complete row, write it
        if len(current_row) == len(header):
            fixed_line = ','.join(f'"{field}"' for field in current_row)
            fixed_lines.append(fixed_line)
            current_row = []
    
    # Write the fixed file
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        f.write('\n'.join(fixed_lines))

if __name__ == '__main__':
    input_file = 'public/enhanced_city.csv'
    output_file = 'public/enhanced_city_fixed.csv'
    fix_csv(input_file, output_file)
    print(f"Fixed CSV written to {output_file}") 