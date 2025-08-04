# Change Log

All notable changes to the "CSV to Excel Converter" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] - 2025-08-04 

### 🐛 Fixed
- **CSV Parsing**: Fixed handling of column headers with dots (e.g., "Subject.Name")
- **Data Structure**: Prevented nested object creation from dotted column names
- **Excel Generation**: Ensured proper flat data structure for Excel output
- **Compatibility**: Improved support for complex CSV header formats

### 🔧 Technical Changes
- Added `flatKeys: true` option to csvtojson parser
- Fixed column header parsing to preserve original names with special characters
- Enhanced CSV to Excel conversion reliability

## [0.0.5] - 2025-08-04

### 🐛 Fixed
- **File Opening**: Fixed "File seems to be binary" error when opening converted Excel files
- **User Experience**: Excel files now open with system default application (Excel/Numbers)
- **Error Handling**: Improved handling of binary file formats

### 🔧 Technical Changes
- Changed from `openTextDocument` to `vscode.open` command for Excel files
- Proper binary file handling for .xlsx format

## [0.0.4] - 2025-08-04

### ✨ Enhanced
- **User Experience**: Extension now activates automatically after VSCode startup
- **Immediate Availability**: Right-click menu and commands ready without manual trigger
- **Performance**: Uses `onStartupFinished` for optimal startup performance

### 🔧 Technical Changes
- Changed activation from manual trigger to automatic startup activation
- Improved user experience for immediate functionality access

## [0.0.3] - 2025-08-04

### 🐛 Fixed
- **Critical**: Fixed extension failing to activate due to missing dependencies
- **Packaging**: Corrected .vscodeignore to include required node_modules
- **Dependencies**: Ensured ExcelJS, csvtojson, chardet, and iconv-lite are bundled

### 🔧 Technical Changes
- Updated .vscodeignore to exclude only development dependencies
- Fixed "Activating..." indefinite state issue

## [0.0.2] - 2025-08-04

### 🐛 Fixed
- **Command Registration**: Fixed 'csvToExcel.convert' command not found error
- **Activation Events**: Updated to modern VSCode extension activation pattern
- **Extension Loading**: Improved extension loading reliability

### 🔧 Technical Changes
- Changed `activationEvents` from `["onCommand:csvToExcel.convert"]` to `[]`
- Relies on automatic activation based on `contributes` configuration
- Follows current VSCode extension best practices

## [0.0.1] - 2025-08-04

### 🎉 Initial Release

#### Added
- **Core Functionality**
  - CSV to Excel (.xlsx) conversion with right-click context menu
  - Command palette integration for conversion
  - Smart encoding detection (UTF-8, Big5, GBK, ISO-8859-1)
  - Automatic delimiter detection (comma, semicolon, tab, pipe)

- **Excel Formatting Features**
  - Automatic header styling with bold text and background color
  - Auto-fit column widths for optimal readability
  - Data type preservation (numbers, dates, text)

- **User Experience**
  - Progress indication during conversion process
  - User-friendly error messages and handling
  - File opening options after successful conversion
  - Cross-platform compatibility (Windows, macOS, Linux)

- **Technical Features**
  - TypeScript implementation for type safety
  - Modular architecture with separate CSV parsing and Excel generation
  - Comprehensive error handling
  - Memory-efficient processing for large files

#### Technical Details
- Built with ExcelJS for Excel file generation
- Uses csvtojson for CSV parsing with automatic type detection
- Implements chardet for character encoding detection
- iconv-lite for encoding conversion support

### 🚀 Features Highlight
- **One-click conversion**: Right-click any CSV file and select "Convert to Excel"
- **Intelligent parsing**: Automatically detects file encoding and delimiter
- **Professional output**: Creates properly formatted Excel files with styled headers
- **No configuration required**: Works out of the box with sensible defaults

### 📋 Requirements
- Visual Studio Code 1.74.0 or higher
- No additional dependencies required

### 🔄 Future Plans
- Batch conversion support for multiple files
- Custom formatting options
- CSV preview functionality
- Configuration settings for advanced users