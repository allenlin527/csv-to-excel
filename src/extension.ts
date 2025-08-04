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
                
                progress.report({ increment: 0, message: "Reading CSV file..." });
                
                // 解析CSV
                const csvResult = await csvParser.parseCsv(uri.fsPath);
                
                progress.report({ increment: 50, message: "Generating Excel file..." });
                
                // 生成Excel
                outputPath = await excelGenerator.generateExcel(csvResult, uri.fsPath);
                
                progress.report({ increment: 100, message: "Conversion completed!" });
                
                // 短暫延遲讓用戶看到完成訊息，然後自動關閉進度
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
    
    // 註冊批次轉換命令 (未來功能)
    const batchConvertCommand = vscode.commands.registerCommand('csvToExcel.batchConvert', async (uri: vscode.Uri) => {
        vscode.window.showInformationMessage('Batch conversion feature coming soon!');
    });
    
    context.subscriptions.push(convertCommand, batchConvertCommand);
}

export function deactivate() {}