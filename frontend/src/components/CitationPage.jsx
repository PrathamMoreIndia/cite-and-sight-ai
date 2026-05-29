import React, { useState } from 'react'

// 1. Tool Components
import UploadZone from './CitationTool/UploadZone'
import StylePicker from './CitationTool/StylePicker'
import ReferenceList from './CitationTool/ReferenceList'

// 2. The Real AI Hooks & Utils
import { useDocumentParser } from '../hooks/useDocumentParser'
import { useConversion, STATUS } from '../hooks/useConversion'
import { exportAsTxt, exportAsBibtex, exportAsDocx } from '../utils/exportUtils'

// 3. Reuse your global app styles
import styles from '../App.module.css'

export default function CitationPage() {
  const [tab, setTab] = useState('upload')
  const [manualText, setManualText] = useState('')
  const [targetStyle, setTargetStyle] = useState('APA')
  
  // NEW: Brought back the options state!
  const [options, setOptions] = useState({ sortAlpha: false, preserveDoi: true })

  // Initialize your custom hooks
  const parser = useDocumentParser()
  const conversion = useConversion()

  // Determine what text we are sending to the AI
  const inputText = tab === 'upload' ? parser.extractedText : manualText
  
  const isConverting = conversion.status === STATUS.CONVERTING
  const isDone = conversion.status === STATUS.DONE
  const hasInput = inputText && inputText.trim().length > 0

  const pasteWordCount = manualText.trim() ? manualText.trim().split(/\s+/).length : 0

  const handleConvert = async () => {
    if (!hasInput) return;
    // NEW: Pass the dynamic options from the checkboxes into the converter
    await conversion.convert(inputText, targetStyle, options)
  }

  const handleReset = () => {
    parser.clearFile()
    setManualText('')
    conversion.reset()
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ===================================== */}
        {/* HEADER */}
        {/* ===================================== */}
        <header className={styles.header}>
          <h1 className={styles.title}>Citation Formatter</h1>
          <p className={styles.subtitle}>
            Extract and format bibliographic references from any document automatically using AI.
          </p>
        </header>

        {/* ===================================== */}
        {/* INPUT TABS */}
        {/* ===================================== */}
        <section className={styles.card}>
          <div className={styles.tabRow}>
            {['upload', 'paste'].map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'upload' ? '↑ Upload document' : '✎ Paste references'}
              </button>
            ))}
          </div>

          {tab === 'upload' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <UploadZone
                onFile={parser.parseFile}
                fileInfo={parser.fileInfo}
                isParsing={parser.isParsing}
                parseError={parser.parseError}
                onClear={parser.clearFile}
              />
              
              {parser.extractedText && (
                <div className={styles.pasteWrapper}>
                  <p className={styles.cardLabel} style={{ marginBottom: '8px' }}>
                    Extracted Document Text (You can edit this)
                  </p>
                  <textarea
                    className={styles.textarea}
                    rows={8}
                    value={parser.extractedText}
                    onChange={(e) => parser.setExtractedText(e.target.value)}
                  />
                  <div className={styles.pasteFooter}>
                    <span className={styles.wordCount}>
                      {parser.extractedText.trim().split(/\s+/).length} words ready to format
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
                placeholder="Paste your raw bibliography or references list here..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              />
              <div className={styles.pasteFooter}>
                <span className={styles.wordCount}>{pasteWordCount} words</span>
              </div>
            </div>
          )}
        </section>

        {/* ===================================== */}
        {/* STYLE PICKER & OPTIONS */}
        {/* ===================================== */}
        <section className={styles.card}>
          <p className={styles.cardLabel}>Target Citation Style</p>
          <StylePicker selected={targetStyle} onChange={setTargetStyle} />

          {/* NEW: Settings Row for Checkboxes */}
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            marginTop: '1.25rem', 
            paddingTop: '1.25rem', 
            borderTop: '0.5px solid var(--border)' 
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={options.sortAlpha}
                onChange={e => setOptions(o => ({ ...o, sortAlpha: e.target.checked }))}
                style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              Sort references alphabetically
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={options.preserveDoi}
                onChange={e => setOptions(o => ({ ...o, preserveDoi: e.target.checked }))}
                style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              Preserve DOI links
            </label>
          </div>
        </section>

        {/* ===================================== */}
        {/* ACTION BUTTONS */}
        {/* ===================================== */}
        <div className={styles.actionRow}>
          <button
            className={styles.btnPrimary}
            onClick={handleConvert}
            disabled={!hasInput || isConverting}
          >
            {isConverting ? (
              <>
                <span className={styles.spinner} /> Formatting…
              </>
            ) : (
              '✦ Format Citations'
            )}
          </button>

          {(hasInput || isDone || conversion.error) && (
            <button className={styles.btnGhost} onClick={handleReset}>
              Reset
            </button>
          )}

          {/* Export Buttons */}
          {isDone && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button className={styles.btnGhost} onClick={() => exportAsTxt(conversion.refs, targetStyle)}>TXT</button>
              <button className={styles.btnGhost} onClick={() => exportAsDocx(conversion.refs, targetStyle)}>DOCX</button>
              <button className={styles.btnGhost} onClick={() => exportAsBibtex(conversion.refs)}>BibTeX</button>
            </div>
          )}
        </div>

        {/* ===================================== */}
        {/* ERRORS */}
        {/* ===================================== */}
        {conversion.error && (
          <div className={styles.errorBox}>
            <span style={{ flexShrink: 0 }}>⚠</span>
            <span>{conversion.error}</span>
          </div>
        )}

        {/* ===================================== */}
        {/* RESULTS */}
        {/* ===================================== */}
        {(isConverting || isDone) && (
          <section className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <ReferenceList
              refs={conversion.refs}
              isLoading={isConverting}
              error={conversion.error}
              stats={conversion.stats}
            />
          </section>
        )}

      </div>
    </div>
  )
}