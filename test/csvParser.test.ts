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

        it('should handle empty CSV file', async () => {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const emptyFile = path.join(tempDir, 'empty.csv');
            fs.writeFileSync(emptyFile, '   '); // Only whitespace

            await expect(csvParser.parseCsv(emptyFile)).rejects.toThrow('CSV file is empty');

            // Cleanup
            if (fs.existsSync(emptyFile)) fs.unlinkSync(emptyFile);
        });

        it('should handle CSV with empty first line', async () => {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const testFile = path.join(tempDir, 'empty-first-line.csv');
            fs.writeFileSync(testFile, '\nName,Age\nJohn,25'); // Empty first line

            const result = await csvParser.parseCsv(testFile);
            
            expect(result.delimiter).toBe(','); // Should default to comma
            expect(result.data).toBeInstanceOf(Array);

            // Cleanup
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        });

        it('should warn when no delimiter is detected', async () => {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const testFile = path.join(tempDir, 'no-delimiter.csv');
            fs.writeFileSync(testFile, 'Name Age\nJohn 25'); // No clear delimiter

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            const result = await csvParser.parseCsv(testFile);
            
            expect(result.delimiter).toBe(','); // Should default to comma
            expect(consoleSpy).toHaveBeenCalledWith('Warning: No delimiter detected, using comma as default');
            
            consoleSpy.mockRestore();
            
            // Cleanup
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        });

        it('should warn when CSV has headers but no data', async () => {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const testFile = path.join(tempDir, 'headers-only.csv');
            fs.writeFileSync(testFile, 'Name,Age\n'); // Headers with newline but no data rows

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            const result = await csvParser.parseCsv(testFile);
            
            expect(result.data).toHaveLength(0);
            expect(result.headers).toEqual([]); // parsedHeaders is empty when no data rows
            expect(consoleSpy).toHaveBeenCalledWith('Warning: CSV file contains headers but no data rows');
            
            consoleSpy.mockRestore();
            
            // Cleanup
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        });

        it('should handle encoding detection fallback', async () => {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const testFile = path.join(tempDir, 'encoding-test.csv');
            // Create a file with special encoding to test fallback
            fs.writeFileSync(testFile, Buffer.from('Name,Value\nTest,123', 'ascii'));

            // Mock chardet to return null to test fallback
            const originalDetect = require('chardet').detect;
            require('chardet').detect = jest.fn().mockReturnValue(null);

            const result = await csvParser.parseCsv(testFile);
            
            expect(result.encoding).toBe('utf8'); // Should fallback to utf8
            
            // Restore original function
            require('chardet').detect = originalDetect;
            
            // Cleanup
            if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
        });
    });
});