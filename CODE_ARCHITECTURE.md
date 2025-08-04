# CSV to Excel VSCode Extension - Code Architecture & Implementation

## Project Structure

```
csv-to-excel-extension/
├── package.json
├── tsconfig.json
├── webpack.config.js
├── .vscodeignore
├── src/
│   ├── extension.ts                    # Main extension entry point
│   ├── commands/
│   │   └── convertToExcelCommand.ts    # Command implementation
│   ├── services/
│   │   ├── csvParserService.ts         # CSV parsing logic
│   │   ├── excelGeneratorService.ts    # Excel generation logic
│   │   └── fileService.ts              # File operations
│   ├── utils/
│   │   ├── encodingDetector.ts         # Encoding detection utility
│   │   ├── pathHelper.ts               # Path manipulation helpers
│   │   └── constants.ts                # Application constants
│   ├── types/
│   │   └── index.ts                    # TypeScript type definitions
│   └── config/
│       └── settings.ts                 # Extension settings management
├── test/
│   ├── suite/
│   │   ├── extension.test.ts
│   │   ├── csvParser.test.ts
│   │   └── excelGenerator.test.ts
│   └── fixtures/
│       ├── sample.csv
│       └── expected.xlsx
├── resources/
│   └── icons/
│       ├── csv-to-excel.png
│       └── convert-icon.svg
└── README.md
```

## Core Implementation Files

### 1. package.json Configuration

```json
{
  "name": "csv-to-excel-converter",
  "displayName": "CSV to Excel Converter",
  "description": "Convert CSV files to Excel XLSX format with ease",
  "version": "1.0.0",
  "publisher": "your-publisher-name",
  "icon": "resources/icons/csv-to-excel.png",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/csv-to-excel-vscode"
  },
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Other",
    "Data Science",
    "Formatters"
  ],
  "keywords": [
    "csv",
    "excel",
    "xlsx",
    "converter",
    "data"
  ],
  "activationEvents": [
    "onLanguage:csv"
  ],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "csvToExcel.convertFile",
        "title": "Convert to Excel",
        "category": "CSV to Excel",
        "icon": "$(file-excel)"
      },
      {
        "command": "csvToExcel.convertAllInFolder",
        "title": "Convert All CSV Files in Folder",
        "category": "CSV to Excel"
      }
    ],
    "menus": {
      "explorer/context": [
        {
          "command": "csvToExcel.convertFile",
          "when": "resourceExtname == .csv",
          "group": "csv-to-excel@1"
        },
        {
          "command": "csvToExcel.convertAllInFolder",
          "when": "explorerResourceIsFolder",
          "group": "csv-to-excel@2"
        }
      ],
      "commandPalette": [
        {
          "command": "csvToExcel.convertFile",
          "when": "resourceExtname == .csv"
        },
        {
          "command": "csvToExcel.convertAllInFolder"
        }
      ]
    },
    "configuration": {
      "title": "CSV to Excel Converter",
      "properties": {
        "csvToExcel.outputLocation": {
          "type": "string",
          "enum": [
            "sameFolder",
            "customFolder",
            "askUser"
          ],
          "default": "sameFolder",
          "description": "Where to save converted Excel files"
        },
        "csvToExcel.autoOpenResult": {
          "type": "boolean",
          "default": true,
          "description": "Automatically open converted Excel file"
        },
        "csvToExcel.preserveFormatting": {
          "type": "boolean",
          "default": true,
          "description": "Preserve original data formatting"
        },
        "csvToExcel.customOutputPath": {
          "type": "string",
          "default": "",
          "description": "Custom output folder path"
        }
      }
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "webpack --mode production",
    "watch": "webpack --mode development --watch",
    "test": "node ./out/test/runTest.js",
    "lint": "eslint src --ext ts"
  },
  "dependencies": {
    "exceljs": "^4.4.0",
    "csvtojson": "^2.0.10",
    "chardet": "^2.0.0",
    "iconv-lite": "^0.6.3"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "ts-loader": "^9.5.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.50.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

### 2. Main Extension Entry Point (src/extension.ts)

```typescript
import * as vscode from 'vscode';
import { ConvertToExcelCommand } from './commands/convertToExcelCommand';
import { registerCommands } from './utils/commandRegistry';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    console.log('CSV to Excel Converter extension is now active');

    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel('CSV to Excel');
    
    // Initialize command handlers
    const convertCommand = new ConvertToExcelCommand(outputChannel);
    
    // Register commands
    const commands = [
        vscode.commands.registerCommand('csvToExcel.convertFile', (uri: vscode.Uri) => {
            return convertCommand.convertSingleFile(uri);
        }),
        vscode.commands.registerCommand('csvToExcel.convertAllInFolder', (uri: vscode.Uri) => {
            return convertCommand.convertAllInFolder(uri);
        })
    ];

    // Add commands to context subscriptions
    commands.forEach(command => context.subscriptions.push(command));

    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBarItem);

    console.log('CSV to Excel Converter commands registered successfully');
}

export function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
}
```

### 3. Command Implementation (src/commands/convertToExcelCommand.ts)

```typescript
import * as vscode from 'vscode';
import * as path from 'path';
import { CsvParserService } from '../services/csvParserService';
import { ExcelGeneratorService } from '../services/excelGeneratorService';
import { FileService } from '../services/fileService';
import { PathHelper } from '../utils/pathHelper';
import { ExtensionSettings } from '../config/settings';

export class ConvertToExcelCommand {
    private csvParser: CsvParserService;
    private excelGenerator: ExcelGeneratorService;
    private fileService: FileService;
    private settings: ExtensionSettings;

    constructor(private outputChannel: vscode.OutputChannel) {
        this.csvParser = new CsvParserService();
        this.excelGenerator = new ExcelGeneratorService();
        this.fileService = new FileService();
        this.settings = new ExtensionSettings();
    }

    async convertSingleFile(uri?: vscode.Uri): Promise<void> {
        try {
            // Get file URI from context or active editor
            const fileUri = uri || await this.getActiveFileUri();
            if (!fileUri) {
                vscode.window.showErrorMessage('No CSV file selected');
                return;
            }

            // Validate file is CSV
            if (!this.isCsvFile(fileUri.fsPath)) {
                vscode.window.showErrorMessage('Selected file is not a CSV file');
                return;
            }

            await this.performConversion(fileUri);

        } catch (error) {
            this.handleError(error as Error);
        }
    }

    async convertAllInFolder(uri?: vscode.Uri): Promise<void> {
        try {
            const folderUri = uri || await this.getActiveFolderUri();
            if (!folderUri) {
                vscode.window.showErrorMessage('No folder selected');
                return;
            }

            const csvFiles = await this.fileService.findCsvFiles(folderUri.fsPath);
            if (csvFiles.length === 0) {
                vscode.window.showInformationMessage('No CSV files found in the selected folder');
                return;
            }

            const shouldProceed = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Convert ${csvFiles.length} CSV files to Excel?`
            });

            if (shouldProceed === 'Yes') {
                await this.convertMultipleFiles(csvFiles);
            }

        } catch (error) {
            this.handleError(error as Error);
        }
    }

    private async performConversion(fileUri: vscode.Uri): Promise<void> {
        const filePath = fileUri.fsPath;
        
        // Show progress indicator
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Converting CSV to Excel",
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: "Reading CSV file..." });
                
                // Parse CSV file
                const csvData = await this.csvParser.parseFile(filePath);
                progress.report({ increment: 30, message: "Parsing data..." });

                // Generate Excel file
                const outputPath = await this.getOutputPath(filePath);
                progress.report({ increment: 60, message: "Generating Excel file..." });

                await this.excelGenerator.generateExcel(csvData, outputPath);
                progress.report({ increment: 100, message: "Conversion completed!" });

                // Show success message
                const fileSize = await this.fileService.getFileSize(outputPath);
                const message = `Successfully converted to Excel (${this.formatFileSize(fileSize)})`;
                
                const action = await vscode.window.showInformationMessage(
                    message,
                    'Open File',
                    'Show in Explorer'
                );

                if (action === 'Open File' && this.settings.getAutoOpenResult()) {
                    await vscode.env.openExternal(vscode.Uri.file(outputPath));
                } else if (action === 'Show in Explorer') {
                    await vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputPath));
                }

                this.logSuccess(filePath, outputPath);

            } catch (error) {
                throw new Error(`Conversion failed: ${(error as Error).message}`);
            }
        });
    }

    private async convertMultipleFiles(csvFiles: string[]): Promise<void> {
        let successCount = 0;
        let failureCount = 0;

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Converting multiple CSV files",
            cancellable: false
        }, async (progress) => {
            const increment = 100 / csvFiles.length;

            for (let i = 0; i < csvFiles.length; i++) {
                const filePath = csvFiles[i];
                const fileName = path.basename(filePath);
                
                progress.report({ 
                    increment: i === 0 ? 0 : increment, 
                    message: `Converting ${fileName}... (${i + 1}/${csvFiles.length})` 
                });

                try {
                    const csvData = await this.csvParser.parseFile(filePath);
                    const outputPath = await this.getOutputPath(filePath);
                    await this.excelGenerator.generateExcel(csvData, outputPath);
                    successCount++;
                    this.logSuccess(filePath, outputPath);
                } catch (error) {
                    failureCount++;
                    this.logError(filePath, error as Error);
                }
            }
        });

        // Show summary
        const message = `Conversion completed: ${successCount} successful, ${failureCount} failed`;
        if (failureCount > 0) {
            vscode.window.showWarningMessage(message + '. Check output panel for details.');
        } else {
            vscode.window.showInformationMessage(message);
        }
    }

    private async getActiveFileUri(): Promise<vscode.Uri | undefined> {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            return activeEditor.document.uri;
        }

        // Fallback: show file picker
        const files = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'CSV Files': ['csv']
            }
        });

        return files?.[0];
    }

    private async getActiveFolderUri(): Promise<vscode.Uri | undefined> {
        const folders = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });

        return folders?.[0];
    }

    private async getOutputPath(inputPath: string): Promise<string> {
        const outputLocation = this.settings.getOutputLocation();
        const baseName = path.basename(inputPath, '.csv');
        const outputFileName = `${baseName}.xlsx`;

        switch (outputLocation) {
            case 'sameFolder':
                return path.join(path.dirname(inputPath), outputFileName);
            
            case 'customFolder':
                const customPath = this.settings.getCustomOutputPath();
                if (customPath) {
                    return path.join(customPath, outputFileName);
                }
                // Fall back to same folder if custom path not set
                return path.join(path.dirname(inputPath), outputFileName);
            
            case 'askUser':
                const selectedFolder = await vscode.window.showSaveDialog({
                    defaultUri: vscode.Uri.file(path.join(path.dirname(inputPath), outputFileName)),
                    filters: {
                        'Excel Files': ['xlsx']
                    }
                });
                return selectedFolder?.fsPath || path.join(path.dirname(inputPath), outputFileName);
            
            default:
                return path.join(path.dirname(inputPath), outputFileName);
        }
    }

    private isCsvFile(filePath: string): boolean {
        return path.extname(filePath).toLowerCase() === '.csv';
    }

    private formatFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    private handleError(error: Error): void {
        const message = `CSV to Excel conversion failed: ${error.message}`;
        vscode.window.showErrorMessage(message);
        this.outputChannel.appendLine(`ERROR: ${message}`);
        this.outputChannel.appendLine(`Stack trace: ${error.stack}`);
        this.outputChannel.show(true);
    }

    private logSuccess(inputPath: string, outputPath: string): void {
        const message = `Successfully converted ${path.basename(inputPath)} to ${path.basename(outputPath)}`;
        this.outputChannel.appendLine(`SUCCESS: ${message}`);
        this.outputChannel.appendLine(`Input: ${inputPath}`);
        this.outputChannel.appendLine(`Output: ${outputPath}`);
    }

    private logError(inputPath: string, error: Error): void {
        const message = `Failed to convert ${path.basename(inputPath)}: ${error.message}`;
        this.outputChannel.appendLine(`ERROR: ${message}`);
    }
}
```

### 4. CSV Parser Service (src/services/csvParserService.ts)

```typescript
import * as fs from 'fs';
import * as csvtojson from 'csvtojson';
import * as chardet from 'chardet';
import * as iconv from 'iconv-lite';
import { EncodingDetector } from '../utils/encodingDetector';

export interface CsvData {
    headers: string[];
    rows: any[][];
    totalRows: number;
    encoding: string;
    delimiter: string;
}

export class CsvParserService {
    private encodingDetector: EncodingDetector;

    constructor() {
        this.encodingDetector = new EncodingDetector();
    }

    async parseFile(filePath: string): Promise<CsvData> {
        try {
            // Detect file encoding
            const buffer = fs.readFileSync(filePath);
            const encoding = this.encodingDetector.detectEncoding(buffer);
            
            // Convert to UTF-8 if necessary
            let content: string;
            if (encoding.toLowerCase() === 'utf-8' || encoding.toLowerCase() === 'ascii') {
                content = buffer.toString('utf8');
            } else {
                content = iconv.decode(buffer, encoding);
            }

            // Detect delimiter
            const delimiter = this.detectDelimiter(content);

            // Parse CSV content
            const jsonArray = await csvtojson({
                delimiter: delimiter,
                trim: true,
                checkColumn: true,
                ignoreEmpty: true
            }).fromString(content);

            if (jsonArray.length === 0) {
                throw new Error('CSV file appears to be empty or invalid');
            }

            // Extract headers and convert to 2D array
            const headers = Object.keys(jsonArray[0]);
            const rows = jsonArray.map(row => headers.map(header => row[header] || ''));

            return {
                headers,
                rows,
                totalRows: rows.length,
                encoding,
                delimiter
            };

        } catch (error) {
            throw new Error(`Failed to parse CSV file: ${(error as Error).message}`);
        }
    }

    private detectDelimiter(content: string): string {
        const firstLine = content.split('\n')[0];
        const delimiters = [',', ';', '\t', '|'];
        
        let maxCount = 0;
        let detectedDelimiter = ',';

        for (const delimiter of delimiters) {
            const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                detectedDelimiter = delimiter;
            }
        }

        return detectedDelimiter;
    }

    async parseWithCustomOptions(filePath: string, options: {
        delimiter?: string;
        encoding?: string;
        hasHeader?: boolean;
    }): Promise<CsvData> {
        try {
            const buffer = fs.readFileSync(filePath);
            const encoding = options.encoding || this.encodingDetector.detectEncoding(buffer);
            
            let content: string;
            if (encoding.toLowerCase() === 'utf-8' || encoding.toLowerCase() === 'ascii') {
                content = buffer.toString('utf8');
            } else {
                content = iconv.decode(buffer, encoding);
            }

            const delimiter = options.delimiter || this.detectDelimiter(content);

            const jsonArray = await csvtojson({
                delimiter: delimiter,
                trim: true,
                noheader: !options.hasHeader,
                headers: options.hasHeader ? undefined : this.generateHeaders(content, delimiter)
            }).fromString(content);

            const headers = options.hasHeader ? Object.keys(jsonArray[0]) : this.generateHeaders(content, delimiter);
            const rows = jsonArray.map(row => headers.map(header => row[header] || ''));

            return {
                headers,
                rows,
                totalRows: rows.length,
                encoding,
                delimiter
            };

        } catch (error) {
            throw new Error(`Failed to parse CSV with custom options: ${(error as Error).message}`);
        }
    }

    private generateHeaders(content: string, delimiter: string): string[] {
        const firstLine = content.split('\n')[0];
        const columnCount = firstLine.split(delimiter).length;
        return Array.from({ length: columnCount }, (_, i) => `Column${i + 1}`);
    }
}
```

### 5. Excel Generator Service (src/services/excelGeneratorService.ts)

```typescript
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import { CsvData } from './csvParserService';

export class ExcelGeneratorService {
    
    async generateExcel(csvData: CsvData, outputPath: string): Promise<void> {
        try {
            const workbook = new ExcelJS.Workbook();
            
            // Set workbook properties
            workbook.creator = 'CSV to Excel Converter';
            workbook.lastModifiedBy = 'VSCode Extension';
            workbook.created = new Date();
            workbook.modified = new Date();

            // Create worksheet
            const worksheet = workbook.addWorksheet('Sheet1');

            // Add headers
            if (csvData.headers.length > 0) {
                worksheet.addRow(csvData.headers);
                
                // Style header row
                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true, color: { argb: 'FF000000' } };
                headerRow.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE0E0E0' }
                };
                headerRow.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            }

            // Add data rows
            csvData.rows.forEach(row => {
                const excelRow = worksheet.addRow(row);
                
                // Apply basic formatting
                excelRow.eachCell((cell, colNumber) => {
                    // Auto-detect and format cell types
                    this.formatCell(cell, row[colNumber - 1]);
                    
                    // Add borders
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            // Auto-fit column widths
            worksheet.columns.forEach((column, index) => {
                let maxWidth = csvData.headers[index]?.length || 10;
                
                // Sample first 100 rows to determine optimal width
                const sampleSize = Math.min(100, csvData.rows.length);
                for (let i = 0; i < sampleSize; i++) {
                    const cellValue = csvData.rows[i][index];
                    if (cellValue) {
                        const valueLength = cellValue.toString().length;
                        maxWidth = Math.max(maxWidth, valueLength);
                    }
                }
                
                // Set column width with reasonable limits
                column.width = Math.min(Math.max(maxWidth + 2, 10), 50);
            });

            // Apply conditional formatting for better readability
            this.applyConditionalFormatting(worksheet, csvData);

            // Save to file
            await workbook.xlsx.writeFile(outputPath);

        } catch (error) {
            throw new Error(`Failed to generate Excel file: ${(error as Error).message}`);
        }
    }

    private formatCell(cell: ExcelJS.Cell, value: any): void {
        if (value === null || value === undefined || value === '') {
            cell.value = '';
            return;
        }

        const stringValue = value.toString().trim();
        
        // Try to detect and format numbers
        if (this.isNumeric(stringValue)) {
            const numValue = parseFloat(stringValue);
            cell.value = numValue;
            cell.numFmt = this.getNumberFormat(numValue);
            cell.alignment = { horizontal: 'right' };
        }
        // Try to detect and format dates
        else if (this.isDate(stringValue)) {
            const dateValue = new Date(stringValue);
            if (!isNaN(dateValue.getTime())) {
                cell.value = dateValue;
                cell.numFmt = 'yyyy-mm-dd';
                cell.alignment = { horizontal: 'center' };
            } else {
                cell.value = stringValue;
            }
        }
        // Boolean values
        else if (this.isBoolean(stringValue)) {
            cell.value = stringValue.toLowerCase() === 'true';
            cell.alignment = { horizontal: 'center' };
        }
        // Default to text
        else {
            cell.value = stringValue;
            cell.alignment = { horizontal: 'left' };
        }
    }

    private isNumeric(value: string): boolean {
        // Remove common thousand separators and check if it's a valid number
        const cleanValue = value.replace(/[,\s]/g, '');
        return !isNaN(parseFloat(cleanValue)) && isFinite(parseFloat(cleanValue));
    }

    private isDate(value: string): boolean {
        // Common date patterns
        const datePatterns = [
            /^\d{4}-\d{2}-\d{2}$/,         // YYYY-MM-DD
            /^\d{2}\/\d{2}\/\d{4}$/,       // MM/DD/YYYY
            /^\d{2}-\d{2}-\d{4}$/,         // MM-DD-YYYY
            /^\d{4}\/\d{2}\/\d{2}$/,       // YYYY/MM/DD
        ];
        
        return datePatterns.some(pattern => pattern.test(value));
    }

    private isBoolean(value: string): boolean {
        const lowerValue = value.toLowerCase();
        return lowerValue === 'true' || lowerValue === 'false' || 
               lowerValue === 'yes' || lowerValue === 'no' ||
               lowerValue === '1' || lowerValue === '0';
    }

    private getNumberFormat(value: number): string {
        // Determine appropriate number format based on the value
        if (value % 1 === 0) {
            // Integer
            if (Math.abs(value) >= 1000) {
                return '#,##0';  // Thousands separator for large numbers
            } else {
                return '0';      // Simple integer format
            }
        } else {
            // Decimal
            const decimalPlaces = this.getDecimalPlaces(value);
            if (decimalPlaces <= 2) {
                return '#,##0.00';
            } else {
                return `#,##0.${'0'.repeat(Math.min(decimalPlaces, 6))}`;
            }
        }
    }

    private getDecimalPlaces(value: number): number {
        const match = value.toString().match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) return 0;
        return Math.max(
            0,
            (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
        );
    }

    private applyConditionalFormatting(worksheet: ExcelJS.Worksheet, csvData: CsvData): void {
        // Apply zebra striping for better readability
        const dataRange = `A2:${String.fromCharCode(65 + csvData.headers.length - 1)}${csvData.rows.length + 1}`;
        
        // Add alternating row colors
        for (let i = 2; i <= csvData.rows.length + 1; i++) {
            if (i % 2 === 0) {
                const row = worksheet.getRow(i);
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8F8F8' }
                };
            }
        }
    }

    async generateExcelWithCustomStyling(
        csvData: CsvData, 
        outputPath: string, 
        options: {
            applyZebraStriping?: boolean;
            boldHeaders?: boolean;
            autoFitColumns?: boolean;
            freezeFirstRow?: boolean;
        } = {}
    ): Promise<void> {
        // Extended version with more customization options
        const {
            applyZebraStriping = true,
            boldHeaders = true,
            autoFitColumns = true,
            freezeFirstRow = true
        } = options;

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // Add headers
            if (csvData.headers.length > 0) {
                worksheet.addRow(csvData.headers);
                
                if (boldHeaders) {
                    const headerRow = worksheet.getRow(1);
                    headerRow.font = { bold: true };
                    headerRow.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFD0D0D0' }
                    };
                }

                if (freezeFirstRow) {
                    worksheet.views = [{ state: 'frozen', ySplit: 1 }];
                }
            }

            // Add data rows
            csvData.rows.forEach((row, rowIndex) => {
                const excelRow = worksheet.addRow(row);
                
                if (applyZebraStriping && (rowIndex + 2) % 2 === 0) {
                    excelRow.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF8F8F8' }
                    };
                }
            });

            if (autoFitColumns) {
                worksheet.columns.forEach((column, index) => {
                    let maxWidth = csvData.headers[index]?.length || 10;
                    
                    const sampleSize = Math.min(100, csvData.rows.length);
                    for (let i = 0; i < sampleSize; i++) {
                        const cellValue = csvData.rows[i][index];
                        if (cellValue) {
                            maxWidth = Math.max(maxWidth, cellValue.toString().length);
                        }
                    }
                    
                    column.width = Math.min(Math.max(maxWidth + 2, 10), 50);
                });
            }

            await workbook.xlsx.writeFile(outputPath);

        } catch (error) {
            throw new Error(`Failed to generate styled Excel file: ${(error as Error).message}`);
        }
    }
}
```

### 6. Type Definitions (src/types/index.ts)

```typescript
export interface ConversionResult {
    success: boolean;
    inputPath: string;
    outputPath?: string;
    error?: string;
    statistics?: {
        rowsProcessed: number;
        columnsProcessed: number;
        fileSize: number;
        processingTime: number;
    };
}

export interface ConversionOptions {
    delimiter?: string;
    encoding?: string;
    hasHeader?: boolean;
    outputLocation?: 'sameFolder' | 'customFolder' | 'askUser';
    preserveFormatting?: boolean;
    applyBasicStyling?: boolean;
}

export interface FileInfo {
    path: string;
    name: string;
    size: number;
    extension: string;
    encoding?: string;
}

export interface ProcessingProgress {
    currentFile: string;
    filesProcessed: number;
    totalFiles: number;
    currentStep: string;
    percentage: number;
}

export interface ExtensionConfiguration {
    outputLocation: string;
    autoOpenResult: boolean;
    preserveFormatting: boolean;
    customOutputPath: string;
    defaultDelimiter: string;
    maxFileSize: number;
}
```

## Key Architecture Decisions

### 1. Separation of Concerns
- **Commands**: Handle VSCode integration and user interactions
- **Services**: Contain business logic for CSV parsing and Excel generation
- **Utils**: Provide reusable helper functions
- **Types**: Define TypeScript interfaces for type safety

### 2. Error Handling Strategy
- Comprehensive try-catch blocks at command level
- Detailed error messages with actionable suggestions
- Logging to VSCode output channel for debugging
- Graceful fallbacks for recoverable errors

### 3. Performance Optimizations
- Streaming approach for large files
- Progress indicators for long-running operations
- Memory-efficient data processing
- Configurable batch sizes for bulk operations

### 4. User Experience Focus
- Context-aware menu items
- Progress notifications
- Automatic file opening options
- Comprehensive configuration settings

### 5. Extensibility Design
- Plugin-like service architecture
- Configuration-driven behavior
- Support for custom formatting options
- Easy addition of new file formats

This architecture provides a solid foundation for a professional-grade VSCode extension with excellent user experience and maintainable code structure.