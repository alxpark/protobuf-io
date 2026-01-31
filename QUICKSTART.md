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

### Quick Demo with Sample Generation

1. **Load the example schema**:
   - Click "Choose .proto file" or drag `example.proto` onto the upload area
   - Or try uploading the entire `samples/` folder!

2. **Generate and Encode Sample Data**:
   - Click the "Encode JSON → Binary" tab
   - Type "Person" in the message type search (autocomplete will help)
   - Adjust the Max Depth slider (try 3-5 for good depth)
   - Click "✨ Generate Sample JSON"
   - Sample JSON appears with randomized data
   - Binary encoding happens automatically!
   - Click "💾 Download Sample" to save the JSON
   - Click "💾 Download Binary" to save the .pb file

3. **Decode the Binary**:
   - Click the "Decode Binary → JSON" tab
   - Type "Person" to select the message type
   - Drag the downloaded .pb file onto the binary upload area
   - Click "🔓 Decode to JSON"
   - See your data decoded!
   - Click "💾 Download JSON" to save the decoded output

### Advanced Features

#### Drag and Drop
- Drag .proto files onto the schema upload area
- Drag .pb binary files onto the decode upload area
- Visual feedback with purple highlight on drag-over

#### Smart Message Type Search
- Start typing to filter message types
- Use ↑↓ arrow keys to navigate
- Press Tab or Enter to select
- Press Esc to close dropdown

#### Folder Upload
- Click "📁 Select Folder" to upload entire proto directories
- Automatically handles imports within the folder
- Shows warning for missing external imports

#### Sample Generation Options
- Max Depth slider: Control nesting level (1-20)
- Randomized data on each generation
- Smart field detection:
  - Email fields get realistic email addresses
  - Name fields get random names
  - Phone fields get formatted numbers
  - URLs get proper formatting
  - Enums get random valid values
  - Booleans get random true/false

## Features Overview

### ✨ New & Advanced Features
- ✅ **Randomized sample generation** with smart field detection
- ✅ **Automatic encoding** after sample generation
- ✅ **Drag & drop** for proto and binary files
- ✅ **Folder upload** support
- ✅ **Autocomplete search** for message types with keyboard navigation
- ✅ **Adjustable depth slider** for nested message generation
- ✅ **Three download options**: Sample JSON, Decoded JSON, Binary
- ✅ **Import detection** with warnings
- ✅ **Circular reference detection** for safe sample generation

### 📝 Core Features
- ✅ Upload custom `.proto` schema files (single/multiple/folder)
- ✅ Support for nested messages and enums
- ✅ JSON to Protobuf binary encoding
- ✅ Binary to JSON decoding
- ✅ Hex visualization of binary data
- ✅ Copy JSON/Hex to clipboard
- ✅ Beautiful, responsive UI with gradient theme

## Troubleshooting

**"No message types found"**: Make sure your `.proto` file has valid message definitions.

**Encoding fails**: Verify your JSON matches the schema structure. Check for:
- Correct field names (case-sensitive)
- Correct data types (strings, numbers, booleans)
- Required vs optional fields

**Decoding fails**: Ensure the binary file was encoded with the same message type you're trying to decode.
