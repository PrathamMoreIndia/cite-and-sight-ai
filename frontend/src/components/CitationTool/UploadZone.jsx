import React, { useRef, useState } from 'react'
import styles from './UploadZone.module.css'

export default function UploadZone({ onFile, fileInfo, isParsing, parseError, onClear }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragging(true)
  }

  return (
    <div className={styles.wrapper}>
      {fileInfo ? (
        <div className={styles.fileCard}>
          {/* Replaced missing icon font with a native emoji */}
          <span style={{ fontSize: '24px', flexShrink: 0 }}>📄</span>
          
          <div className={styles.fileDetails}>
            <span className={styles.fileName}>{fileInfo.name}</span>
            <span className={styles.fileMeta}>
              {fileInfo.size}
              {fileInfo.pages && ` · ${fileInfo.pages} pages`}
              {fileInfo.foundRefsSection && ' · References section detected ✓'}
            </span>
          </div>
          
          {/* Replaced missing icon font with a native '✕' and stopped event bubbling */}
          <button 
            className={styles.clearBtn} 
            onClick={(e) => {
              e.stopPropagation(); // Prevents the upload menu from opening when you click remove
              onClear();
            }} 
            aria-label="Remove file"
            title="Remove document"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${isParsing ? styles.loading : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          aria-label="Upload document"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: 'none' }}
            onChange={e => e.target.files[0] && onFile(e.target.files[0])}
          />
          
          {isParsing ? (
            <>
              {/* Replaced missing loader icon with a simple spinner text */}
              <span style={{ fontSize: '24px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>↻</span>
              <p>Extracting text…</p>
            </>
          ) : (
            <>
              {/* Replaced missing cloud icon with native SVG */}
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p><strong>Drop PDF or DOCX</strong><br />or click to browse</p>
              <span className={styles.hint}>PDF · DOCX · TXT · max 10 MB</span>
            </>
          )}
        </div>
      )}

      {parseError && (
        <div className={styles.errorBanner}>
          <span style={{ flexShrink: 0 }}>⚠</span>
          {parseError}
        </div>
      )}
    </div>
  )
}