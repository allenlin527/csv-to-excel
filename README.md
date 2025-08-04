# CSV to Excel Converter

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/csv-to-excel-converter?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=csv-to-excel-converter)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/csv-to-excel-converter?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=csv-to-excel-converter)

A powerful VSCode extension that converts CSV files to Excel (.xlsx) format with just a right-click. Perfect for developers and data analysts who need quick and reliable CSV to Excel conversion.

> **Note**: Microsoft Excel is a trademark of Microsoft Corporation. This extension is not affiliated with or endorsed by Microsoft Corporation.

## ✨ Features

- **🖱️ Right-click Integration**: Convert CSV files directly from the file explorer
- **🔍 Smart Encoding Detection**: Automatically detects UTF-8, Big5, GBK, and other encodings
- **📊 Delimiter Auto-detection**: Supports comma, semicolon, tab, and pipe delimiters
- **🎨 Excel Formatting**: Automatically formats headers with bold styling and background color
- **📐 Auto-fit Columns**: Automatically adjusts column widths for optimal readability
- **⚡ Progress Indication**: Shows conversion progress with visual feedback
- **🛡️ Error Handling**: Comprehensive error handling with user-friendly messages

## 🚀 Usage

### Method 1: Right-click Menu
1. Right-click on any `.csv` file in the VSCode file explorer
2. Select **"Convert to Excel"** from the context menu
3. The converted `.xlsx` file will be created in the same directory

### Method 2: Command Palette
1. Open the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux)
2. Type **"Convert to Excel"**
3. Select the command and choose your CSV file

## 📋 Requirements

- Visual Studio Code version 1.74.0 or higher
- No additional dependencies required - everything is built-in!

## 🔧 Supported File Formats

### Input (CSV)
- Standard CSV files with various delimiters (`,`, `;`, `\t`, `|`)
- Multiple character encodings (UTF-8, Big5, GBK, ISO-8859-1, etc.)
- Files with or without headers

### Output (Excel)
- Excel 2007+ format (.xlsx)
- Formatted headers with bold text and background color
- Auto-adjusted column widths
- Preserved data types (numbers, dates, text)

## 📖 Examples

### Before (CSV)
```csv
Name,Age,Email,City
John Doe,30,john@example.com,New York
Jane Smith,25,jane@example.com,Los Angeles
```

### After (Excel)
- Professional Excel file with formatted headers
- Auto-fitted columns for optimal viewing
- Preserved data integrity

## 🛠️ Technical Details

- **Built with**: TypeScript, ExcelJS, csvtojson
- **Architecture**: Modular design with separate parsing and generation components
- **Performance**: Handles large CSV files efficiently with streaming support
- **Cross-platform**: Works on Windows, macOS, and Linux

## 📝 Release Notes

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

## 🐛 Known Issues

- Very large files (>100MB) may take longer to process
- Complex CSV structures with nested quotes may require manual review

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and enhancement requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Libraries

This extension uses several open-source libraries. See [THIRD-PARTY-LICENSES.md](THIRD-PARTY-LICENSES.md) for detailed license information.

### Trademarks

Microsoft Excel is a trademark of Microsoft Corporation. This extension is not affiliated with or endorsed by Microsoft Corporation.

## 📞 Support

If you encounter any issues or have suggestions, please:
- Create an issue on our [GitHub repository](https://github.com/allenlin527/csv-to-excel-converter/issues)
- Check our [FAQ section](https://github.com/allenlin527/csv-to-excel-converter/wiki/FAQ)

---

**Enjoy converting your CSV files! 🎉**