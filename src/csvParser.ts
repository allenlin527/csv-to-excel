import * as fs from 'fs';
import * as path from 'path';
import csvtojson from 'csvtojson';
import * as chardet from 'chardet';
import * as iconv from 'iconv-lite';

export interface CsvParseOptions {
    delimiter?: string;
    encoding?: string;
}

export interface CsvParseResult {
    data: any[];
    headers: string[];
    encoding: string;
    delimiter: string;
}

export class CsvParser {
    
    /**
     * 偵測檔案編碼
     */
    private detectEncoding(filePath: string): string {
        const buffer = fs.readFileSync(filePath);
        const detected = chardet.detect(buffer);
        return detected || 'utf8';
    }

    /**
     * 偵測CSV分隔符號
     */
    private detectDelimiter(content: string): string {
        const delimiters = [',', ';', '\t', '|'];
        const firstLine = content.split('\n')[0];
        
        let maxCount = 0;
        let bestDelimiter = ',';
        
        for (const delimiter of delimiters) {
            const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                bestDelimiter = delimiter;
            }
        }
        
        return bestDelimiter;
    }

    /**
     * 解析CSV檔案
     */
    async parseCsv(filePath: string, options: CsvParseOptions = {}): Promise<CsvParseResult> {
        try {
            // 偵測編碼
            const encoding = options.encoding || this.detectEncoding(filePath);
            
            // 讀取檔案內容
            const buffer = fs.readFileSync(filePath);
            const content = iconv.decode(buffer, encoding);
            
            // 偵測分隔符號
            const delimiter = options.delimiter || this.detectDelimiter(content);
            
            // 解析CSV
            const jsonArray = await csvtojson({
                delimiter: delimiter,
                trim: true,
                checkType: true,
                flatKeys: true  // 防止嵌套物件，保持標題為字串
            }).fromString(content);
            
            // 取得標題
            const headers = jsonArray.length > 0 ? Object.keys(jsonArray[0]) : [];
            
            return {
                data: jsonArray,
                headers: headers,
                encoding: encoding,
                delimiter: delimiter
            };
            
        } catch (error) {
            throw new Error(`Failed to parse CSV file: ${error}`);
        }
    }

    /**
     * 驗證CSV檔案
     */
    validateCsvFile(filePath: string): boolean {
        if (!fs.existsSync(filePath)) {
            return false;
        }
        
        const ext = path.extname(filePath).toLowerCase();
        return ext === '.csv';
    }
}