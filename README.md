# Protobuf I/O

A powerful web application for encoding and decoding Protocol Buffer binary files with advanced features like randomized sample data generation, drag-and-drop support, and intelligent message type search.

🌐 **[Try it online](https://alxpark.github.io/protobuf-io/)**

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

1. Upload your `.proto` schema file(s) or folder
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
