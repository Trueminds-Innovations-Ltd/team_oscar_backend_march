const fs = require('fs');
const path = require('path');

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    if (ext === '.pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        
        if (data.text && data.text.trim()) {
          return data.text;
        }
        return null;
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr.message);
        return null;
      }
    }
    
    if (ext === '.docx') {
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ path: filePath });
        
        if (result.value && result.value.trim()) {
          return result.value;
        }
        
        const buffer = fs.readFileSync(filePath);
        const bufferResult = await mammoth.extractRawText({ buffer: buffer });
        return bufferResult.value || null;
      } catch (mamErr) {
        console.error('Mammoth error:', mamErr.message);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting text:', error.message);
    return null;
  }
}

module.exports = { extractTextFromFile };