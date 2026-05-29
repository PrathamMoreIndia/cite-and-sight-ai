import { useState, useRef } from 'react'
import styles from './DropZone.module.css'

export default function DropZone({ 
  file, 
  onFile, 
  onClear, 
  // Default values keep your Text Summarizer working perfectly!
  acceptedExtensions = ['.txt', '.pdf', '.docx'],
  maxSizeMB = 10,
  hintText = "Supports .txt, .pdf, .docx · Max 10 MB"
}) {
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  function validate(f) {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    const typeGroup = f.type.split('/')[0] + '/*' // e.g., "video/*" or "audio/*"

    // Check if the file matches an explicit extension OR a wildcard like "video/*"
    if (!acceptedExtensions.includes(ext) && !acceptedExtensions.includes(typeGroup)) {
      setError(`Unsupported format. Allowed: ${acceptedExtensions.join(', ')}`)
      return false
    }
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum ${maxSizeMB} MB.`)
      return false
    }
    setError('')
    return true
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && validate(f)) onFile(f)
  }

  function handleChange(e) {
    const f = e.target.files[0]
    if (f && validate(f)) onFile(f)
  }

  function handleClear(e) {
    e.stopPropagation()
    onClear()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.zone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedExtensions.join(',')}
          onChange={handleChange}
          className={styles.input}
        />

        {file ? (
          <div className={styles.fileInfo}>
            <span className={styles.fileIcon}>
              {/* Dynamic icon based on file type */}
              {file.type.startsWith('video/') ? '🎥' : 
               file.type.startsWith('audio/') ? '🎵' : 
               file.name.endsWith('.pdf') ? '📄' : '📝'}
            </span>
            <div className={styles.fileMeta}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>
                {file.size < 1024 * 1024
                  ? (file.size / 1024).toFixed(1) + ' KB'
                  : (file.size / (1024 * 1024)).toFixed(1) + ' MB'}
              </span>
            </div>
            <button className={styles.clearBtn} onClick={handleClear}>✕</button>
          </div>
        ) : (
          <div className={styles.placeholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <p className={styles.dropText}>Drop file here or <span>browse</span></p>
            <p className={styles.hint}>{hintText}</p>
          </div>
        )}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}