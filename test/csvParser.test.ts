import * as fs from 'fs';
import * as path from 'path';
import { CsvParser } from '../src/csvParser';

describe('CsvParser', () => {
    let csvParser: CsvParser;
    const testDataDir = path.join(__dirname, '../test-data');

    beforeEach(() => {
        csvParser = new CsvParser();
    });

    describe('validateCsvFile', () => {
        it('should validate CSV file extension', () => {
            const csvFile = path.join(testDataDir, 'sample.csv');
            const txtFile = path.join(testDataDir, 'sample.txt');
            
            expect(csvParser.validateCsvFile(csvFile)).toBe(true);
            expect(csvParser.validateCsvFile(txtFile)).toBe(false);
            expect(csvParser.validateCsvFile('nonexistent.csv')).toBe(false);
        });
    });

    describe('parseCsv', () => {
        it('should parse basic CSV file', async () => {
            const testFile = path.join(testDataDir, 'sample.csv');
            
            // Skip test if file doesn't exist
            if (!fs.existsSync(testFile)) {
                console.warn(`Test file ${testFile} not found, skipping test`);
                return;
            }

            const result = await csvParser.parseCsv(testFile);
            
            expect(result).toBeDefined();
            expect(result.data).toBeInstanceOf(Array);
            expect(result.headers).toBeInstanceOf(Array);
            expect(result.encoding).toBeDefined();
            expect(result.delimiter).toBeDefined();
        });

        it('should handle non-existent file', async () => {
            await expect(csvParser.parseCsv('nonexistent.csv')).rejects.toThrow('CSV file does not exist');
        });
    });
});