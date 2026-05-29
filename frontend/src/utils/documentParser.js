// Document parsing utilities for PDF and DOCX files

// ── PDF Parsing (pdf.js) ──────────────────────────────────────────────────
export async function extractTextFromPDF(file) {
  // Dynamically import pdfjs to avoid SSR issues
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker — use CDN for simplicity; swap to local for production
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise

  let fullText = ''
  const totalPages = pdf.numPages

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return {
    text: fullText.trim(),
    pageCount: totalPages,
    fileName: file.name
  }
}

// ── DOCX Parsing (mammoth) ────────────────────────────────────────────────
export async function extractTextFromDOCX(file) {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()

  const result = await mammoth.extractRawText({ arrayBuffer })

  return {
    text: result.value.trim(),
    messages: result.messages, // warnings from mammoth
    fileName: file.name
  }
}

// ── Dispatcher ────────────────────────────────────────────────────────────
export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'pdf') {
    return extractTextFromPDF(file)
  } else if (ext === 'docx' || ext === 'doc') {
    return extractTextFromDOCX(file)
  } else if (ext === 'txt') {
    const text = await file.text()
    return { text: text.trim(), fileName: file.name }
  } else {
    throw new Error(`Unsupported file type: .${ext}. Please upload PDF, DOCX, or TXT.`)
  }
}

// ── Reference Section Detector ────────────────────────────────────────────
// Tries to isolate just the references/bibliography section
export function extractReferencesSection(fullText) {
  const sectionHeaders = [
    /^references?\s*$/im,
    /^bibliography\s*$/im,
    /^works cited\s*$/im,
    /^literature cited\s*$/im,
    /^citations?\s*$/im,
  ]

  for (const pattern of sectionHeaders) {
    const match = fullText.search(pattern)
    if (match !== -1) {
      // Return from the header onward
      return fullText.slice(match).trim()
    }
  }

  // No clear section found — return full text and let Claude figure it out
  return fullText
}

// ── Validation ────────────────────────────────────────────────────────────
export function validateFile(file) {
  const MAX_SIZE_MB = 10
  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  const ALLOWED_EXTS = ['pdf', 'docx', 'doc', 'txt']

  const ext = file.name.split('.').pop().toLowerCase()
  const sizeMB = file.size / (1024 * 1024)

  if (!ALLOWED_EXTS.includes(ext)) {
    return { valid: false, error: `File type .${ext} is not supported. Upload PDF, DOCX, or TXT.` }
  }

  if (sizeMB > MAX_SIZE_MB) {
    return { valid: false, error: `File too large (${sizeMB.toFixed(1)} MB). Maximum is ${MAX_SIZE_MB} MB.` }
  }

  return { valid: true }
}
