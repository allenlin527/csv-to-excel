import * as vscode from 'vscode';
import * as path from 'path';
import { CsvParser } from './csvParser';
import { ExcelGenerator } from './excelGenerator';

export function activate(context: vscode.ExtensionContext) {
    const csvParser = new CsvParser();
    const excelGenerator = new ExcelGenerator();
    
    // 註冊轉換命令
    const convertCommand = vscode.commands.registerCommand('csvToExcel.convert', async (uri: vscode.Uri) => {
        try {
            // 驗證檔案
            if (!uri || !csvParser.validateCsvFile(uri.fsPath)) {
                vscode.window.showErrorMessage('Please select a valid CSV file.');
                return;
            }
            
            // 顯示進度並執行轉換
            let outputPath: string = '';
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Converting CSV to Excel",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 0, message: "Processing..." });
                
                // 解析CSV
                const csvResult = await csvParser.parseCsv(uri.fsPath);
                progress.report({ increment: 50 });
                
                // 生成Excel
                outputPath = await excelGenerator.generateExcel(csvResult, uri.fsPath);
                progress.report({ increment: 100 });
                
                await new Promise(resolve => setTimeout(resolve, 500));
            });
            
            // 顯示會自動消失的成功通知
            vscode.window.setStatusBarMessage(
                `✅ CSV converted to: ${path.basename(outputPath)}`,
                3000 // 3秒後自動消失
            );
            
        } catch (error) {
            vscode.window.showErrorMessage(`Conversion failed: ${error}`);
        }
    });
    
    // 註冊批次轉換命令
    const batchConvertCommand = vscode.commands.registerCommand('csvToExcel.batchConvert', async (uri: vscode.Uri, allUris: vscode.Uri[]) => {
        try {
            // 取得所有CSV檔案
            const csvFiles = allUris.filter(u => csvParser.validateCsvFile(u.fsPath));
            
            if (csvFiles.length === 0) {
                vscode.window.showErrorMessage('No valid CSV files selected.');
                return;
            }

            // 批次轉換結果
            const results = {
                successful: [] as string[],
                failed: [] as string[]
            };

            // 顯示進度並執行批次轉換
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Converting ${csvFiles.length} CSV files to Excel`,
                cancellable: false
            }, async (progress) => {
                const total = csvFiles.length;
                
                for (let i = 0; i < csvFiles.length; i++) {
                    const file = csvFiles[i];
                    const fileName = path.basename(file.fsPath);
                    
                    progress.report({ 
                        increment: (100 / total),
                        message: `Converting ${fileName} (${i + 1}/${total})` 
                    });

                    try {
                        // 解析CSV
                        const csvResult = await csvParser.parseCsv(file.fsPath);
                        
                        // 生成Excel
                        const outputPath = await excelGenerator.generateExcel(csvResult, file.fsPath);
                        results.successful.push(path.basename(outputPath));
                    } catch (error) {
                        results.failed.push(`${fileName}: ${error}`);
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            });

            // 顯示結果
            const successCount = results.successful.length;
            const failedCount = results.failed.length;
            
            if (failedCount === 0) {
                vscode.window.setStatusBarMessage(
                    `✅ Successfully converted ${successCount} CSV files to Excel`,
                    3000
                );
            } else {
                const message = `Batch conversion completed: ${successCount} successful, ${failedCount} failed`;
                vscode.window.showWarningMessage(message);
                
                if (failedCount > 0) {
                    console.error('Failed conversions:', results.failed);
                }
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Batch conversion failed: ${error}`);
        }
    });
    
    context.subscriptions.push(convertCommand, batchConvertCommand);
}

export function deactivate() {}