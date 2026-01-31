# Protobuf Encoder/Decoder Web App

A powerful web application for encoding and decoding Protocol Buffer binary files with advanced features like randomized sample data generation, drag-and-drop support, and intelligent message type search.

## Features

### Core Functionality
- **Encode**: Convert JSON data to protobuf binary format with automatic validation
- **Decode**: Convert protobuf binary files back to JSON
- **Sample Generation**: Generate randomized sample JSON data with intelligent field detection
- **Auto-Encoding**: Automatically encode generated samples to binary in one click

### File Handling
- **Drag & Drop**: Drag proto files and binary files directly onto upload areas
- **Multi-file Upload**: Upload multiple .proto files at once
- **Folder Upload**: Upload entire folders containing .proto schemas
- **Import Detection**: Automatically detects and warns about missing proto imports
- **Multiple Downloads**: Download binary (.pb), JSON (.json), and sample (.sample.json) files

### User Interface
- **Smart Search**: Message type autocomplete with keyboard navigation (arrow keys, tab, enter)
- **Adjustable Depth**: Slider control for sample generation depth (1-20 levels)
- **Tab-Based Layout**: Clean interface with separate Encode and Decode views
- **Copy to Clipboard**: Quick copy for JSON and hex outputs
- **Responsive Design**: Modern gradient UI with purple theme

### Sample Data Intelligence
- Randomized values on each generation
- Smart field name detection:
  - Email fields → `user123@example.com`
  - Name fields → Random names (Alice, Bob, Charlie, etc.)
  - Phone fields → `+1-555-1234`
  - URL fields → `https://example.com/...`
  - City/Country fields → Random realistic values
- Random enum selection
- Random boolean values
- Circular reference detection

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser to `http://localhost:8080`

## Usage

### Quick Start with Sample Data

1. **Upload your `.proto` schema**:
   - Click "Choose .proto file" or drag files onto the upload area
   - Supports multiple files and folders
2. **Select message type**:
   - Type to search and filter message types
   - Use arrow keys to navigate, Tab/Enter to select
3. **Generate sample JSON**:
   - Adjust Max Depth slider (1-20) for nested complexity
   - Click "✨ Generate Sample JSON"
   - Sample data is automatically encoded to binary
4. **Download results**:
   - 💾 Download Sample (.sample.json)
   - 💾 Download Binary (.pb)

### Decoding a Binary File

1. Upload your `.proto` schema file(s)
2. Type to search and select the message type
3. Upload or drag your binary protobuf file
4. Click "🔓 Decode to JSON" to see the output
5. Copy to clipboard or download as JSON

### Encoding JSON to Binary

1. Upload your `.proto` schema file(s)
2. Type to search and select the message type
3. Enter your JSON data or generate sample data
4. Click "🔒 Encode to Binary" to generate the binary file
5. View hex output and download the binary file

## Example .proto File

```protobuf
syntax = "proto3";

message Person {
  string name = 1;
  int32 id = 2;
  string email = 3;
}
```

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- protobufjs library

## License

MIT
