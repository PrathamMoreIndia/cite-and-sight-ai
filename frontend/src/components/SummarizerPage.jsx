import { useState } from 'react'
import DropZone from './DropZone'
import Settings from './Settings'
import SummaryResult from './SummaryResult'
import { summarizeText } from '../api' // We only need summarizeText now!
import styles from '../App.module.css'

// NEW: Import your existing document parser hook
import { useDocumentParser } from '../hooks/useDocumentParser' 

export default function App() {

  const [tab, setTab] = useState('upload')
  const [pasteText, setPasteText] = useState('')
  const [compression, setCompression] = useState(35)
  const [numBeams, setNumBeams] = useState(4)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // NEW: Initialize the parser
  const parser = useDocumentParser()

  const pasteWordCount = pasteText.trim()
    ? pasteText.trim().split(/\s+/).length
    : 0

  // Check if we have extracted text OR pasted text
  const canSubmit =
    !loading &&
    (tab === 'upload'
      ? !!parser.extractedText
      : pasteWordCount >= 30)

  // =========================================
  // HANDLE SUMMARIZER SUBMIT
  // =========================================

  async function handleSubmit() {
    setError('')
    setResult(null)
    setLoading(true)

    try {
      // Send the text (either extracted from the file, or pasted)
      // This ensures that if the user manually edits the extracted text, 
      // the backend summarizes their edited version!
      const textToSummarize = tab === 'upload' ? parser.extractedText : pasteText.trim()

      const data = await summarizeText(
        textToSummarize,
        compression / 100, 
        numBeams
      )

      setResult(data)

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Could not connect to API. Make sure the backend is running on port 8000.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================
  // RESET
  // =========================================

  function handleReset() {
    parser.clearFile() // Clear the parser state
    setPasteText('')
    setResult(null)
    setError('')
    setCompression(35)
    setNumBeams(4)
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <header className={styles.header}>
          <h1 className={styles.title}>Text Summarizer</h1>
          <p className={styles.subtitle}>
            Abstractive summarization — rephrases and compresses while preserving meaning
          </p>
        </header>

        <section className={styles.card}>
          <div className={styles.tabRow}>
            {['upload', 'paste'].map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => {
                  setTab(t)
                  setResult(null)
                  setError('')
                }}
              >
                {t === 'upload' ? '↑ Upload file' : '✎ Paste text'}
              </button>
            ))}
          </div>

          {tab === 'upload' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <DropZone
                file={parser.file}
                onFile={(f) => {
                  parser.parseFile(f) // Automatically reads the file!
                  setResult(null)
                  setError('')
                }}
                onClear={() => {
                  parser.clearFile()
                  setResult(null)
                }}
              />

              {/* Show a loading spinner while PDF/DOCX is being parsed */}
              {parser.isParsing && (
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                  <span className={styles.spinner} style={{ display: 'inline-block', marginRight: '8px', verticalAlign: 'middle' }} />
                  Extracting text from document...
                </p>
              )}

              {/* Error displaying if the file type is rejected */}
              {parser.parseError && (
                 <p style={{ color: 'var(--danger)', fontSize: '13px' }}>⚠ {parser.parseError}</p>
              )}

              {/* Reveal the text box instantly once the file is read! */}
              {parser.extractedText && !parser.isParsing && (
                <div className={styles.pasteWrapper}>
                  <p className={styles.cardLabel} style={{ marginBottom: '8px' }}>
                    Extracted Text (You can edit before summarizing)
                  </p>
                  <textarea
                    className={styles.textarea}
                    rows={8}
                    value={parser.extractedText}
                    onChange={(e) => parser.setExtractedText(e.target.value)}
                  />
                  <div className={styles.pasteFooter}>
                    <span className={styles.wordCount}>
                      {parser.extractedText.trim().split(/\s+/).length} words ready
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.pasteWrapper}>
              <textarea
                className={styles.textarea}
                rows={8}
                placeholder="Paste your document or paragraph here (minimum 30 words)..."
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value)
                  setResult(null)
                  setError('')
                }}
              />
              <div className={styles.pasteFooter}>
                <span className={`${styles.wordCount} ${pasteWordCount < 30 && pasteText ? styles.wordCountWarn : ''}`}>
                  {pasteWordCount} words {pasteWordCount < 30 && pasteText ? ' (minimum 30)' : ''}
                </span>
              </div>
            </div>
          )}
        </section>

        <section className={styles.card}>
          <p className={styles.cardLabel}>Settings</p>
          <Settings
            compression={compression}
            setCompression={setCompression}
            numBeams={numBeams}
            setNumBeams={setNumBeams}
          />
        </section>

        <div className={styles.actionRow}>
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <><span className={styles.spinner} /> Summarizing…</>
            ) : (
              '✦ Summarize'
            )}
          </button>

          {(result || error || parser.file || pasteText) && (
            <button className={styles.btnGhost} onClick={handleReset}>
              Reset
            </button>
          )}
        </div>

        {loading && (
          <p className={styles.loadingHint}>
            This may take 5–30 seconds depending on document length…
          </p>
        )}

        {error && (
          <div className={styles.errorBox}>
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        {result && <SummaryResult result={result} />}

      </div>
    </div>
  )
}