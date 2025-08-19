import * as Excel from 'exceljs';
import * as path from 'path';
import { CsvParseResult } from './csvParser';

export interface ExcelGenerateOptions {
    outputPath?: string;
    sheetName?: string;
    autoFitColumns?: boolean;
    headerStyle?: boolean;
}

export class ExcelGenerator {
    
    /**
     * 生成Excel檔案
     */
    async generateExcel(
        csvResult: CsvParseResult, 
        originalFilePath: string, 
        options: ExcelGenerateOptions = {}
    ): Promise<string> {
        try {
            // 建立工作簿
            const workbook = new Excel.Workbook();
            const worksheet = workbook.addWorksheet(options.sheetName || 'Sheet1');
            
            // 設定標題行
            if (csvResult.headers.length > 0) {
                worksheet.addRow(csvResult.headers);
                
                // 標題樣式
                if (options.headerStyle !== false) {
                    const headerRow = worksheet.getRow(1);
                    headerRow.font = { bold: true };
                    headerRow.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE0E0E0' }
                    };
                }
            }
            
            // 加入資料行
            csvResult.data.forEach(row => {
                const values = csvResult.headers.map(header => row[header]);
                worksheet.addRow(values);
            });
            
            // 自動調整欄位寳度
            if (options.autoFitColumns !== false) {
                worksheet.columns.forEach(column => {
                    let maxLength = 0;
                    if (column.eachCell) {
                        column.eachCell({ includeEmpty: true }, (cell) => {
                            const columnLength = cell.value ? cell.value.toString().length : 0;
                            if (columnLength > maxLength) {
                                maxLength = columnLength;
                            }
                        });
                    }
                    column.width = Math.min(Math.max(maxLength + 2, 10), 50);
                });
            }
            
            // 確定輸出路徑
            const outputPath = this.getOutputPath(originalFilePath, options.outputPath);
            
            // 儲存檔案
            await workbook.xlsx.writeFile(outputPath);
            
            return outputPath;
            
        } catch (error) {
            throw new Error(`Failed to generate Excel file: ${error}`);
        }
    }
    
    /**
     * 取得輸出檔案路徑
     */
    private getOutputPath(originalFilePath: string, customPath?: string): string {
        if (customPath) {
            return customPath;
        }
        
        const dir = path.dirname(originalFilePath);
        const basename = path.basename(originalFilePath, path.extname(originalFilePath));
        return path.join(dir, `${basename}.xlsx`);
    }
    
}