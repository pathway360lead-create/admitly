/**
 * Simple CSV Parser for Admin Panel
 * Handles standard CSV format including quoted fields.
 */

export interface ParseResult<T> {
    data: T[];
    errors: string[];
}

export const parseCSV = <T>(
    csvText: string,
    mappings: Record<string, keyof T>
): ParseResult<T> => {
    const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
    const data: T[] = [];
    const errors: string[] = [];

    if (lines.length < 2) {
        return { data: [], errors: ['CSV file is empty or missing headers'] };
    }

    // Parse headers
    const headers = parseCSVLine(lines[0]);

    // Validate headers
    const requiredHeaders = Object.keys(mappings);
    const missingHeaders = requiredHeaders.filter(
        (h) => !headers.map((hdr) => hdr.toLowerCase()).includes(h.toLowerCase())
    );

    if (missingHeaders.length > 0) {
        return {
            data: [],
            errors: [`Missing required columns: ${missingHeaders.join(', ')}`],
        };
    }

    // Map CSV indices to object keys
    const columnMap: Record<number, keyof T> = {};
    headers.forEach((header, index) => {
        // Find matching mapping key (case-insensitive)
        const mappingKey = Object.keys(mappings).find(
            (k) => k.toLowerCase() === header.toLowerCase()
        );
        if (mappingKey) {
            columnMap[index] = mappings[mappingKey];
        }
    });

    // Parse rows
    for (let i = 1; i < lines.length; i++) {
        try {
            const values = parseCSVLine(lines[i]);

            // Skip empty rows
            if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

            const row: Partial<T> = {};
            let hasData = false;

            Object.entries(columnMap).forEach(([index, key]) => {
                const val = values[parseInt(index)]?.trim();
                if (val) {
                    row[key] = val as any; // Type casting for simplicity
                    hasData = true;
                }
            });

            if (hasData) {
                data.push(row as T);
            }
        } catch (e: any) {
            errors.push(`Row ${i + 1}: ${e.message}`);
        }
    }

    return { data, errors };
};

// Helper to parse a single CSV line handling quotes
const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                // Toggle quotes
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
};
