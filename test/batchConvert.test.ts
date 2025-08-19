import * as fs from 'fs';
import * as path from 'path';
import { CsvParser } from '../src/csvParser';
import { ExcelGenerator } from '../src/excelGenerator';

describe('Batch Conversion Logic', () => {
    let csvParser: CsvParser;
    let excelGenerator: ExcelGenerator;

    beforeEach(() => {
        csvParser = new CsvParser();
        excelGenerator = new ExcelGenerator();
    });

    describe('Multi-file processing', () => {
        it('should filter valid CSV files', () => {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            // Create test files
            const csvFile1 = path.join(tempDir, 'test1.csv');
            const csvFile2 = path.join(tempDir, 'test2.csv');
            const txtFile = path.join(tempDir, 'test.txt');
            const xlsxFile = path.join(tempDir, 'test.xlsx');
            
            fs.writeFileSync(csvFile1, 'test');
            fs.writeFileSync(csvFile2, 'test');
            fs.writeFileSync(txtFile, 'test');
            fs.writeFileSync(xlsxFile, 'test');

            const files = [csvFile1, txtFile, csvFile2, xlsxFile];
            const csvFiles = files.filter(file => csvParser.validateCsvFile(file));
            
            expect(csvFiles).toHaveLength(2);
            expect(csvFiles).toContain(csvFile1);
            expect(csvFiles).toContain(csvFile2);

            // Cleanup
            [csvFile1, csvFile2, txtFile, xlsxFile].forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
            });
        });

        it('should handle batch conversion results structure', () => {
            const results = {
                successful: [] as string[],
                failed: [] as string[]
            };

            // Simulate successful conversion
            results.successful.push('file1.xlsx');
            results.successful.push('file2.xlsx');
            
            // Simulate failed conversion
            results.failed.push('file3.csv: Parse error');

            expect(results.successful).toHaveLength(2);
            expect(results.failed).toHaveLength(1);
            expect(results.successful[0]).toContain('.xlsx');
            expect(results.failed[0]).toContain('Parse error');
        });

        it('should process multiple CSV files sequentially', async () => {
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            // Create test CSV files
            const testFile1 = path.join(tempDir, 'test1.csv');
            const testFile2 = path.join(tempDir, 'test2.csv');
            
            fs.writeFileSync(testFile1, 'Name,Age\nJohn,25\nJane,30');
            fs.writeFileSync(testFile2, 'Product,Price\nApple,1.5\nBanana,2.0');

            const files = [testFile1, testFile2];
            const results = {
                successful: [] as string[],
                failed: [] as string[]
            };

            // Process files sequentially (like in the actual batch conversion)
            for (const file of files) {
                try {
                    const csvResult = await csvParser.parseCsv(file);
                    const outputPath = await excelGenerator.generateExcel(csvResult, file);
                    results.successful.push(path.basename(outputPath));
                } catch (error) {
                    results.failed.push(`${path.basename(file)}: ${error}`);
                }
            }

            expect(results.successful).toHaveLength(2);
            expect(results.failed).toHaveLength(0);
            expect(results.successful).toContain('test1.xlsx');
            expect(results.successful).toContain('test2.xlsx');

            // Cleanup
            [testFile1, testFile2].forEach(file => {
                if (fs.existsSync(file)) fs.unlinkSync(file);
                
                const excelFile = file.replace('.csv', '.xlsx');
                if (fs.existsSync(excelFile)) fs.unlinkSync(excelFile);
            });
        });
    });
});