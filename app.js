// Global variables
let protoRoot = null;
let currentMessageType = null;
let binaryData = null;

// DOM Elements
const elements = {
    protoFileInput: document.getElementById('protoFileInput'),
    protoFileName: document.getElementById('protoFileName'),
    schemaStatus: document.getElementById('schemaStatus'),
    messageTypeSelect: document.getElementById('messageTypeSelect'),
    selectFilesBtn: document.getElementById('selectFilesBtn'),
    selectFolderBtn: document.getElementById('selectFolderBtn'),
    
    // Decode elements
    binaryFileInput: document.getElementById('binaryFileInput'),
    binaryFileName: document.getElementById('binaryFileName'),
    decodeBtn: document.getElementById('decodeBtn'),
    decodeOutput: document.getElementById('decodeOutput'),
    copyDecodeBtn: document.getElementById('copyDecodeBtn'),
    
    // Encode elements
    jsonInput: document.getElementById('jsonInput'),
    encodeBtn: document.getElementById('encodeBtn'),
    encodeOutput: document.getElementById('encodeOutput'),
    downloadBinaryBtn: document.getElementById('downloadBinaryBtn'),
    copyHexBtn: document.getElementById('copyHexBtn'),
    generateSampleBtn: document.getElementById('generateSampleBtn'),
    maxDepthInput: document.getElementById('maxDepthInput'),
    
    errorDisplay: document.getElementById('errorDisplay'),
    
    // Tabs
    tabButtons: document.querySelectorAll('.tab-button'),
    decodeTab: document.getElementById('decode-tab'),
    encodeTab: document.getElementById('encode-tab')
};

// Initialize event listeners
function init() {
    // File uploads
    elements.protoFileInput.addEventListener('change', handleProtoFileUpload);
    elements.selectFilesBtn.addEventListener('click', () => {
        elements.protoFileInput.removeAttribute('webkitdirectory');
        elements.protoFileInput.removeAttribute('directory');
        elements.protoFileInput.click();
    });
    elements.selectFolderBtn.addEventListener('click', () => {
        elements.protoFileInput.setAttribute('webkitdirectory', '');
        elements.protoFileInput.setAttribute('directory', '');
        elements.protoFileInput.click();
    });
    elements.binaryFileInput.addEventListener('change', handleBinaryFileUpload);
    
    // Message type selection
    elements.messageTypeSelect.addEventListener('change', handleMessageTypeChange);
    
    // Action buttons
    elements.decodeBtn.addEventListener('click', handleDecode);
    elements.encodeBtn.addEventListener('click', handleEncode);
    elements.generateSampleBtn.addEventListener('click', generateSampleJSON);
    
    // Copy buttons
    elements.copyDecodeBtn.addEventListener('click', () => copyToClipboard(elements.decodeOutput.value));
    elements.copyHexBtn.addEventListener('click', () => copyToClipboard(elements.encodeOutput.value));
    
    // Download button
    elements.downloadBinaryBtn.addEventListener('click', handleDownloadBinary);
    
    // Tab switching
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
}

// Tab switching
function switchTab(tabName) {
    elements.tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    elements.decodeTab.classList.remove('active');
    elements.encodeTab.classList.remove('active');
    
    if (tabName === 'decode') {
        elements.decodeTab.classList.add('active');
    } else {
        elements.encodeTab.classList.add('active');
    }
    
    hideError();
}

// Handle .proto file upload
async function handleProtoFileUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    // Filter only .proto files
    const protoFilesOnly = files.filter(f => f.name.endsWith('.proto'));
    
    if (protoFilesOnly.length === 0) {
        showError('No .proto files found in selection');
        return;
    }
    
    if (protoFilesOnly.length === 1) {
        elements.protoFileName.textContent = protoFilesOnly[0].name;
    } else {
        elements.protoFileName.textContent = `${protoFilesOnly.length} .proto files selected`;
    }
    hideError();
    
    try {
        // Read all files with their paths
        const protoFiles = await Promise.all(
            protoFilesOnly.map(async file => ({
                name: file.name,
                path: file.webkitRelativePath || file.name,
                content: await readFileAsText(file)
            }))
        );
        
        await loadProtoSchemas(protoFiles);
        showStatus(`Schema loaded successfully! (${protoFilesOnly.length} file${protoFilesOnly.length > 1 ? 's' : ''})`, 'success');
    } catch (error) {
        showError(`Failed to load schema: ${error.message}`);
        showStatus('Failed to load schema', 'error');
    }
}

// Load and parse multiple .proto schemas
async function loadProtoSchemas(protoFiles) {
    try {
        // Create a new root for parsing
        protoRoot = new protobuf.Root();
        
        // Extract imports from all files
        const allImports = new Set();
        const uploadedPaths = new Set(protoFiles.map(f => f.path || f.name));
        const uploadedFileNames = new Set(protoFiles.map(f => f.name));
        
        protoFiles.forEach(file => {
            const imports = extractImports(file.content);
            imports.forEach(imp => allImports.add(imp));
        });
        
        // Check for missing imports
        const missingImports = Array.from(allImports).filter(imp => {
            const fileName = imp.split('/').pop(); // Get filename from path
            // Check both full path and filename
            return !uploadedPaths.has(imp) && !uploadedFileNames.has(fileName) && !uploadedFileNames.has(imp);
        });
        
        // Show warning but don't fail if imports are missing
        if (missingImports.length > 0) {
            const fileList = missingImports.map(f => `  • ${f}`).join('\n');
            console.warn(`Missing imported proto files:\n${fileList}`);
            showStatus(`⚠️ Warning: Some imports may be missing (${missingImports.length} files). Check console for details.`, 'error');
        }
        
        // Parse all files into the same root to resolve imports
        let parseErrors = [];
        for (const file of protoFiles) {
            try {
                protobuf.parse(file.content, protoRoot, { keepCase: true, filename: file.path || file.name });
            } catch (error) {
                parseErrors.push(`${file.name}: ${error.message}`);
                console.error(`Error parsing ${file.name}:`, error);
            }
        }
        
        // If all files failed to parse, throw error
        if (parseErrors.length === protoFiles.length) {
            throw new Error(`All files failed to parse:\n${parseErrors.join('\n')}`);
        }
        
        // Resolve all types
        try {
            protoRoot.resolveAll();
        } catch (error) {
            console.warn('Some types could not be resolved:', error);
            // Continue anyway - partial resolution might work
        }
        
        // Extract all message types
        const messageTypes = extractMessageTypes(protoRoot);
        
        if (messageTypes.length === 0) {
            throw new Error('No message types found in the .proto file(s). Make sure your files contain message definitions.');
        }
        
        // Populate message type dropdown
        elements.messageTypeSelect.innerHTML = '<option value="">-- Select a message type --</option>';
        messageTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            elements.messageTypeSelect.appendChild(option);
        });
        
        elements.messageTypeSelect.disabled = false;
        
        // Show final status
        if (parseErrors.length > 0) {
            showStatus(`⚠️ Loaded with ${parseErrors.length} warning(s). Found ${messageTypes.length} message type(s).`, 'success');
        }
        
    } catch (error) {
        console.error('Schema parsing failed:', error);
        throw new Error(`Schema parsing failed: ${error.message}`);
    }
}

// Extract import statements from proto content
function extractImports(protoContent) {
    const imports = [];
    const importRegex = /^\s*import\s+["']([^"']+)["']\s*;/gm;
    let match;
    
    while ((match = importRegex.exec(protoContent)) !== null) {
        imports.push(match[1]);
    }
    
    return imports;
}

// Extract message types from proto root
function extractMessageTypes(root, prefix = '') {
    const types = [];
    
    if (root.nested) {
        for (const [name, nested] of Object.entries(root.nested)) {
            const fullName = prefix ? `${prefix}.${name}` : name;
            
            if (nested instanceof protobuf.Type) {
                types.push(fullName);
            }
            
            if (nested.nested) {
                types.push(...extractMessageTypes(nested, fullName));
            }
        }
    }
    
    return types;
}

// Handle message type selection
function handleMessageTypeChange(event) {
    const messageTypeName = event.target.value;
    
    if (!messageTypeName) {
        currentMessageType = null;
        elements.decodeBtn.disabled = true;
        elements.encodeBtn.disabled = true;
        elements.generateSampleBtn.disabled = true;
        return;
    }
    
    try {
        currentMessageType = protoRoot.lookupType(messageTypeName);
        elements.encodeBtn.disabled = false;
        elements.generateSampleBtn.disabled = false;
        
        if (binaryData) {
            elements.decodeBtn.disabled = false;
        }
        
        hideError();
    } catch (error) {
        showError(`Failed to load message type: ${error.message}`);
        currentMessageType = null;
    }
}

// Handle binary file upload for decoding
async function handleBinaryFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    elements.binaryFileName.textContent = file.name;
    hideError();
    
    try {
        binaryData = await readFileAsArrayBuffer(file);
        
        if (currentMessageType) {
            elements.decodeBtn.disabled = false;
        }
    } catch (error) {
        showError(`Failed to read binary file: ${error.message}`);
        binaryData = null;
    }
}

// Handle decode operation
function handleDecode() {
    if (!currentMessageType || !binaryData) {
        showError('Please select a message type and upload a binary file');
        return;
    }
    
    try {
        const uint8Array = new Uint8Array(binaryData);
        const decoded = currentMessageType.decode(uint8Array);
        const jsonObject = currentMessageType.toObject(decoded, {
            longs: String,
            enums: String,
            bytes: String,
            defaults: true,
            arrays: true,
            objects: true,
            oneofs: true
        });
        
        const jsonString = JSON.stringify(jsonObject, null, 2);
        elements.decodeOutput.value = jsonString;
        elements.copyDecodeBtn.style.display = 'inline-block';
        hideError();
        
    } catch (error) {
        showError(`Decoding failed: ${error.message}`);
        elements.decodeOutput.value = '';
        elements.copyDecodeBtn.style.display = 'none';
    }
}

// Handle encode operation
function handleEncode() {
    console.log('handleEncode called');
    console.log('currentMessageType:', currentMessageType);
    console.log('jsonInput value:', elements.jsonInput.value);
    
    if (!currentMessageType) {
        showError('Please select a message type');
        return;
    }
    
    const jsonText = elements.jsonInput.value.trim();
    if (!jsonText) {
        showError('Please enter JSON data to encode');
        return;
    }
    
    try {
        const jsonObject = JSON.parse(jsonText);
        console.log('Parsed JSON:', jsonObject);
        
        // Create message from JSON (this handles enum conversion)
        const message = currentMessageType.fromObject(jsonObject);
        console.log('Created message:', message);
        
        // Encode message
        const buffer = currentMessageType.encode(message).finish();
        
        // Convert to hex for display
        const hexString = bufferToHex(buffer);
        elements.encodeOutput.value = hexString;
        
        // Store binary data for download
        window.encodedBinaryData = buffer;
        
        elements.downloadBinaryBtn.style.display = 'inline-block';
        elements.copyHexBtn.style.display = 'inline-block';
        hideError();
        
    } catch (error) {
        showError(`Encoding failed: ${error.message}`);
        elements.encodeOutput.value = '';
        elements.downloadBinaryBtn.style.display = 'none';
        elements.copyHexBtn.style.display = 'none';
    }
}

// Handle binary file download
function handleDownloadBinary() {
    if (!window.encodedBinaryData) {
        showError('No encoded data to download');
        return;
    }
    
    // Use message type name for filename
    const fileName = currentMessageType ? `${currentMessageType.name}.pb` : 'encoded.pb';
    
    const blob = new Blob([window.encodedBinaryData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generate sample JSON from message type
function generateSampleJSON() {
    if (!currentMessageType) {
        showError('Please select a message type');
        return;
    }
    
    try {
        // Get max depth from input (default to 3 if invalid)
        const maxDepth = parseInt(elements.maxDepthInput.value) || 3;
        const sampleData = generateSampleData(currentMessageType, 0, new Set(), maxDepth);
        const jsonString = JSON.stringify(sampleData, null, 2);
        elements.jsonInput.value = jsonString;
        hideError();
    } catch (error) {
        showError(`Failed to generate sample: ${error.message}`);
    }
}

// Recursively generate sample data for a message type
function generateSampleData(messageType, depth = 0, visitedTypes = new Set(), maxDepth = 3) {
    
    if (depth > maxDepth) {
        return {}; // Return empty object at max depth
    }
    
    const sample = {};
    
    if (!messageType.fields) return sample;
    
    // Track this type to detect circular references
    const typeKey = messageType.fullName || messageType.name;
    
    Object.values(messageType.fields).forEach(field => {
        const value = generateFieldValue(field, messageType, depth, visitedTypes, maxDepth);
        if (value !== undefined) {
            sample[field.name] = value;
        }
    });
    
    return sample;
}

// Generate value for a specific field
function generateFieldValue(field, parentType, depth, visitedTypes, maxDepth) {
    // Handle repeated fields
    if (field.repeated) {
        // Only add one sample item for repeated fields
        return [generateSingleFieldValue(field, parentType, depth, visitedTypes, maxDepth)];
    }
    
    return generateSingleFieldValue(field, parentType, depth, visitedTypes, maxDepth);
}

// Generate a single value based on field type
function generateSingleFieldValue(field, parentType, depth, visitedTypes, maxDepth) {
    // Handle enum types
    if (field.resolvedType && field.resolvedType instanceof protobuf.Enum) {
        const enumValues = Object.keys(field.resolvedType.values);
        return enumValues[0] || 0;
    }
    
    // Handle nested message types
    if (field.resolvedType && field.resolvedType instanceof protobuf.Type) {
        const typeKey = field.resolvedType.fullName || field.resolvedType.name;
        
        // Check for circular reference
        if (visitedTypes.has(typeKey)) {
            return {}; // Return empty object for circular refs
        }
        
        // Add to visited set for this branch
        const newVisited = new Set(visitedTypes);
        newVisited.add(typeKey);
        
        return generateSampleData(field.resolvedType, depth + 1, newVisited, maxDepth);
    }
    
    // Handle primitive types
    switch (field.type) {
        case 'string':
            return `sample_${field.name}`;
        case 'int32':
        case 'uint32':
        case 'sint32':
        case 'fixed32':
        case 'sfixed32':
            return 123;
        case 'int64':
        case 'uint64':
        case 'sint64':
        case 'fixed64':
        case 'sfixed64':
            return 1234567890;
        case 'float':
        case 'double':
            return 123.45;
        case 'bool':
            return true;
        case 'bytes':
            return 'c2FtcGxl'; // base64 encoded "sample"
        default:
            return null;
    }
}

// Utility: Read file as text
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('File reading failed'));
        reader.readAsText(file);
    });
}

// Utility: Read file as array buffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('File reading failed'));
        reader.readAsArrayBuffer(file);
    });
}

// Utility: Convert buffer to hex string
function bufferToHex(buffer) {
    return Array.from(buffer)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ')
        .toUpperCase();
}

// Utility: Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showStatus('Copied to clipboard!', 'success');
        setTimeout(() => {
            elements.schemaStatus.textContent = '';
            elements.schemaStatus.className = 'status-message';
        }, 2000);
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
}

// UI helpers
function showError(message) {
    elements.errorDisplay.textContent = `⚠️ ${message}`;
    elements.errorDisplay.style.display = 'block';
}

function hideError() {
    elements.errorDisplay.style.display = 'none';
}

function showStatus(message, type) {
    elements.schemaStatus.textContent = type === 'success' ? `✅ ${message}` : `❌ ${message}`;
    elements.schemaStatus.className = `status-message ${type}`;
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
