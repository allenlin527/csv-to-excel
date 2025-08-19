"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csvParser_1 = require("../src/csvParser");
describe('CsvParser', () => {
    let csvParser;
    const testDataDir = path.join(__dirname, '../test-data');
    beforeEach(() => {
        csvParser = new csvParser_1.CsvParser();
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
//# sourceMappingURL=csvParser.test.js.map