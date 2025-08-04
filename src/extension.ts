import * as vscode from 'vscode';
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
            
            // 顯示進度
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
                const outputPath = await excelGenerator.generateExcel(csvResult, uri.fsPath);
                
                progress.report({ increment: 100, message: "Conversion completed!" });
                
                // 顯示成功訊息並詢問是否開啟檔案
                const action = await vscode.window.showInformationMessage(
                    `CSV file converted successfully to: ${outputPath}`,
                    "Open File",
                    "Show in Explorer"
                );
                
                if (action === "Open File") {
                    // 使用系統預設程式開啟 Excel 檔案
                    await vscode.commands.executeCommand('vscode.open', vscode.Uri.file(outputPath));
                } else if (action === "Show in Explorer") {
                    vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputPath));
                }
            });
            
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