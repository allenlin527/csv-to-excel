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
    });
});