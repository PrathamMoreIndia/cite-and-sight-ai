import { useState, useCallback } from 'react'
import { extractTextFromFile, extractReferencesSection, validateFile } from '../utils/documentParser'

export function useDocumentParser() {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)

  const parseFile = useCallback(async (uploadedFile) => {
    setParseError(null)

    const validation = validateFile(uploadedFile)
    if (!validation.valid) {
      setParseError(validation.error)
      return
    }

    setFile(uploadedFile)
    setIsParsing(true)

    try {
      const result = await extractTextFromFile(uploadedFile)
      const refsSection = extractReferencesSection(result.text)

      setExtractedText(refsSection)
      setFileInfo({
        name: uploadedFile.name,
        size: (uploadedFile.size / 1024).toFixed(1) + ' KB',
        pages: result.pageCount || null,
        fullTextLength: result.text.length,
        refsSectionLength: refsSection.length,
        foundRefsSection: refsSection.length < result.text.length * 0.95
      })
    } catch (err) {
      console.error('Parse error:', err)
      setParseError(err.message)
    } finally {
      setIsParsing(false)
    }
  }, [])

  const clearFile = useCallback(() => {
    setFile(null)
    setExtractedText('')
    setFileInfo(null)
    setParseError(null)
  }, [])

  return {
    file,
    extractedText,
    setExtractedText,
    isParsing,
    parseError,
    fileInfo,
    parseFile,
    clearFile
  }
}
