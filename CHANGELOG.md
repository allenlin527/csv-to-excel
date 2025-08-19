# Change Log

All notable changes to the "CSV to Excel Converter" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2025-08-19

### 🔧 User Experience Improvements
- **Unified Command**: Simplified to single "Convert to Excel" command for both single and batch operations
- **Smart Detection**: Automatically detects single vs multiple file selection
- **Cleaner Menu**: Removed redundant "Convert Multiple CSV to Excel" command
- **Intuitive Workflow**: One button adapts behavior based on selection (1 file = single conversion, multiple files = batch conversion)

### 📋 Technical Changes
- Combined `csvToExcel.convert` and `csvToExcel.batchConvert` into single intelligent command
- Extracted `performBatchConversion` helper function for better code organization
- Simplified VSCode command registration and menu contributions
- Maintained full backwards compatibility and feature parity

## [0.1.0] - 2025-08-19

### 🚀 Major Features
- **Batch Conversion**: Convert multiple CSV files to Excel in one operation
- **Smart Multi-File Selection**: Select multiple CSV files and convert them all at once
- **Progress Tracking**: Real-time progress display showing current file being processed
- **Comprehensive Results**: Detailed success/failure reporting for batch operations

### 🔧 Core Optimizations  
- **Non-Blocking Operations**: Fixed synchronous file operations that could freeze VSCode
- **Memory Efficiency**: Converted `fs.readFileSync` to async `fs.promises.readFile`
- **Code Quality**: Removed 28 lines of unused `formatCellValue` function
- **Error Handling**: Simplified error processing without unnecessary type checking

### 🧪 Testing Infrastructure
- **Jest Integration**: Full testing framework setup with TypeScript support
- **100% Core Coverage**: Complete test coverage for `csvParser.ts` and `excelGenerator.ts`
- **15 Test Cases**: Comprehensive edge case testing including:
  - Empty files and encoding detection failures
  - Delimiter detection edge cases  
  - Custom output paths and error conditions
  - Batch processing logic verification

### 📋 Enhanced Menu System
- **Dual Commands**: Both single and batch conversion available in context menu
- **VSCode Integration**: Improved command registration and menu organization
- **Better UX**: Cleaner progress reporting without fake progress values

### 🏗️ Architecture Improvements
- **Clean Separation**: Maintained single-responsibility principle across modules
- **Backwards Compatibility**: All existing functionality preserved (Never break userspace)
- **Production Ready**: Professional-grade code quality with full test protection

### 🔄 Future-Proof Foundation
- Established comprehensive testing pipeline
- Created extensible batch processing architecture  
- Implemented robust error handling patterns

## [0.0.9] - 2025-08-04

### 🐛 Fixed
- **Success Notification**: Success message now automatically disappears after 3 seconds
- **Status Bar Integration**: Changed from persistent dialog to auto-dismissing status bar message
- **User Experience**: Cleaner notification flow without manual dismissal required

## [0.0.8] - 2025-08-04

### 🚀 Improved
- **User Experience**: Removed unnecessary "Open File" confirmation dialog after conversion
- **Simplified Workflow**: Conversion now shows success message without additional prompts
- **Cleaner Interface**: Streamlined conversion process for better user experience

### 🧹 Housekeeping
- Cleaned up temporary diagnostic tools and test files
- Removed old .vsix package files
- Project cleanup for better maintainability

## [0.0.7] - 2025-08-04

### 🐛 Fixed
- **Progress Notification**: Fixed progress notification not disappearing automatically after conversion completion
- **User Experience**: Progress dialog now closes after 500ms delay when conversion completes
- **UI Improvement**: Cleaner user experience with proper progress notification handling

### 🔧 Technical Changes
- Added setTimeout delay in progress callback for better UX
- Restructured progress notification flow to ensure proper closure
- Improved async function handling in extension activation

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