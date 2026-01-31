# Protobuf Encoder/Decoder Web App

A simple web application for encoding and decoding Protocol Buffer binary files.

## Features

- **Encode**: Convert JSON data to protobuf binary format
- **Decode**: Convert protobuf binary files back to JSON
- **Upload .proto files**: Load custom protobuf schemas
- **File handling**: Upload binary files for decoding, download encoded results
- **Interactive UI**: Easy-to-use interface with syntax highlighting

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

### Decoding a Binary File

1. Upload your `.proto` schema file
2. Select the message type from the dropdown
3. Upload your binary protobuf file
4. Click "Decode" to see the JSON output

### Encoding JSON to Binary

1. Upload your `.proto` schema file
2. Select the message type from the dropdown
3. Enter your JSON data in the input area
4. Click "Encode" to generate the binary file
5. Download the resulting binary file

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
