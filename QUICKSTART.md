# Quick Start Guide

## Running the Application

1. **Install dependencies** (optional - the app uses CDN for protobuf.js):
   ```bash
   npm install
   ```

2. **Start the local server**:
   ```bash
   npm start
   ```
   Or use any HTTP server:
   ```bash
   python3 -m http.server 8080
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8080`

## Example Usage

### Try the Demo

1. **Load the example schema**:
   - Click "Choose .proto file" and select `example.proto`

2. **Encode JSON to Binary**:
   - Click the "Encode JSON → Binary" tab
   - Select "Person" from the message type dropdown
   - Enter this JSON:
     ```json
     {
       "name": "Alice Johnson",
       "id": 12345,
       "email": "alice@example.com",
       "phones": [
         {
           "number": "555-1234",
           "type": "MOBILE"
         }
       ]
     }
     ```
   - Click "🔒 Encode to Binary"
   - Download the binary file

3. **Decode Binary to JSON**:
   - Click the "Decode Binary → JSON" tab
   - Make sure "Person" is selected
   - Upload the binary file you just downloaded
   - Click "🔓 Decode to JSON"
   - See the original JSON data!

## Features

- ✅ Upload custom `.proto` schema files
- ✅ Support for nested messages and enums
- ✅ JSON to Protobuf binary encoding
- ✅ Binary to JSON decoding
- ✅ Hex visualization of binary data
- ✅ Download encoded binary files
- ✅ Copy JSON/Hex to clipboard
- ✅ Beautiful, responsive UI

## Troubleshooting

**"No message types found"**: Make sure your `.proto` file has valid message definitions.

**Encoding fails**: Verify your JSON matches the schema structure. Check for:
- Correct field names (case-sensitive)
- Correct data types (strings, numbers, booleans)
- Required vs optional fields

**Decoding fails**: Ensure the binary file was encoded with the same message type you're trying to decode.
