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
    elements.binaryFileInput.addEventListener('change', handleBinaryFileUpload);
    
    // Message type selection
    elements.messageTypeSelect.addEventListener('change', handleMessageTypeChange);
    
    // Action buttons
    elements.decodeBtn.addEventListener('click', handleDecode);
    elements.encodeBtn.addEventListener('click', handleEncode);
    
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
    
    if (files.length === 1) {
        elements.protoFileName.textContent = files[0].name;
    } else {
        elements.protoFileName.textContent = `${files.length} files selected`;
    }
    hideError();
    
    try {
        // Read all files
        const protoFiles = await Promise.all(
            files.map(async file => ({
                name: file.name,
                content: await readFileAsText(file)
            }))
        );
        
        await loadProtoSchemas(protoFiles);
        showStatus(`Schema loaded successfully! (${files.length} file${files.length > 1 ? 's' : ''})`, 'success');
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
        const uploadedFileNames = new Set(protoFiles.map(f => f.name));
        
        protoFiles.forEach(file => {
            const imports = extractImports(file.content);
            imports.forEach(imp => allImports.add(imp));
        });
        
        // Check for missing imports
        const missingImports = Array.from(allImports).filter(imp => {
            const fileName = imp.split('/').pop(); // Get filename from path
            return !uploadedFileNames.has(fileName) && !uploadedFileNames.has(imp);
        });
        
        if (missingImports.length > 0) {
            const fileList = missingImports.map(f => `  • ${f}`).join('\n');
            showError(`Missing imported proto files:\n${fileList}\n\nPlease upload these files together with your main proto file.`);
        }
        
        // Parse all files into the same root to resolve imports
        for (const file of protoFiles) {
            try {
                protobuf.parse(file.content, protoRoot, { keepCase: true, filename: file.name });
            } catch (error) {
                throw new Error(`Error parsing ${file.name}: ${error.message}`);
            }
        }
        
        // Resolve all types
        protoRoot.resolveAll();
        
        // Extract all message types
        const messageTypes = extractMessageTypes(protoRoot);
        
        if (messageTypes.length === 0) {
            throw new Error('No message types found in the .proto file(s)');
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
        
    } catch (error) {
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
        return;
    }
    
    try {
        currentMessageType = protoRoot.lookupType(messageTypeName);
        elements.encodeBtn.disabled = false;
        
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
