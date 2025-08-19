import * as fs from 'fs';
import * as path from 'path';
import { ExcelGenerator } from '../src/excelGenerator';
import { CsvParseResult } from '../src/csvParser';

describe('ExcelGenerator', () => {
    let excelGenerator: ExcelGenerator;

    beforeEach(() => {
        excelGenerator = new ExcelGenerator();
    });

    describe('generateExcel', () => {
        it('should generate Excel file from CSV data', async () => {
            const mockCsvResult: CsvParseResult = {
                data: [
                    { 'Name': 'John', 'Age': '25' },
                    { 'Name': 'Jane', 'Age': '30' }
                ],
                headers: ['Name', 'Age'],
                encoding: 'utf8',
                delimiter: ','
            };

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const testCsvPath = path.join(tempDir, 'test.csv');
            const outputPath = await excelGenerator.generateExcel(mockCsvResult, testCsvPath);
            
            expect(outputPath).toContain('.xlsx');
            expect(fs.existsSync(outputPath)).toBe(true);
            
            // Cleanup
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });

        it('should use custom output path when provided', async () => {
            const mockCsvResult: CsvParseResult = {
                data: [{ 'Test': 'Value' }],
                headers: ['Test'],
                encoding: 'utf8',
                delimiter: ','
            };

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const customPath = path.join(tempDir, 'custom-output.xlsx');
            const testCsvPath = path.join(tempDir, 'test.csv');
            
            const outputPath = await excelGenerator.generateExcel(
                mockCsvResult, 
                testCsvPath,
                { outputPath: customPath }
            );
            
            expect(outputPath).toBe(customPath);
            expect(fs.existsSync(outputPath)).toBe(true);
            
            // Cleanup
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });

        it('should handle Excel generation errors', async () => {
            const invalidCsvResult = null as any; // Force error
            const testCsvPath = '/tmp/test.csv';
            
            await expect(excelGenerator.generateExcel(invalidCsvResult, testCsvPath))
                .rejects.toThrow('Failed to generate Excel file');
        });

        it('should handle cells with null values', async () => {
            const mockCsvResult: CsvParseResult = {
                data: [
                    { 'Name': null, 'Age': '' }, // Test null and empty values  
                    { 'Name': 'Jane', 'Age': '30' }
                ],
                headers: ['Name', 'Age'],
                encoding: 'utf8',
                delimiter: ','
            };

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const testCsvPath = path.join(tempDir, 'null-test.csv');
            const outputPath = await excelGenerator.generateExcel(mockCsvResult, testCsvPath);
            
            expect(outputPath).toContain('.xlsx');
            expect(fs.existsSync(outputPath)).toBe(true);
            
            // Cleanup
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
        });
    });
});