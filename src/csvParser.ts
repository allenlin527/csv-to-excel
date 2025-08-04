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
        
        // 如果首行為空，返回預設分隔符
        if (!firstLine.trim()) {
            return ',';
        }
        
        let maxCount = 0;
        let bestDelimiter = ',';
        
        for (const delimiter of delimiters) {
            const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                bestDelimiter = delimiter;
            }
        }
        
        // 如果沒有找到任何分隔符，預設使用逗號
        if (maxCount === 0) {
            console.warn('Warning: No delimiter detected, using comma as default');
        }
        
        return bestDelimiter;
    }

    /**
     * 解析CSV檔案
     */
    async parseCsv(filePath: string, options: CsvParseOptions = {}): Promise<CsvParseResult> {
        try {
            // 檢查檔案是否存在
            if (!fs.existsSync(filePath)) {
                throw new Error(`CSV file does not exist: ${filePath}`);
            }

            // 偵測編碼
            const encoding = options.encoding || this.detectEncoding(filePath);
            
            // 讀取檔案內容
            const buffer = fs.readFileSync(filePath);
            const content = iconv.decode(buffer, encoding);
            
            // 檢查檔案是否為空
            if (!content.trim()) {
                throw new Error('CSV file is empty');
            }
            
            // 偵測分隔符號
            const delimiter = options.delimiter || this.detectDelimiter(content);
            
            // 解析CSV - 使用 flatKeys: true 確保保留帶點的標題
            const jsonArray = await csvtojson({
                delimiter: delimiter,
                trim: true,
                checkType: true,
                flatKeys: true,  // 關鍵設定：防止嵌套物件，保持標題為字串
                ignoreEmpty: true  // 忽略空行
            }).fromString(content);
            
            // 取得標題 - 從原始內容直接解析以確保準確性
            const firstLine = content.split('\n')[0].trim();
            const rawHeaders = firstLine.split(delimiter).map(h => h.trim());
            
            // 驗證標題與解析結果一致性
            const parsedHeaders = jsonArray.length > 0 ? Object.keys(jsonArray[0]) : [];
            
            // 使用原始標題以確保點號等特殊字元不被修改
            const headers = rawHeaders.length === parsedHeaders.length ? rawHeaders : parsedHeaders;
            
            // 檢查是否有資料
            if (jsonArray.length === 0) {
                console.warn('Warning: CSV file contains headers but no data rows');
            }
            
            return {
                data: jsonArray,
                headers: headers,
                encoding: encoding,
                delimiter: delimiter
            };
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to parse CSV file '${filePath}': ${errorMessage}`);
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