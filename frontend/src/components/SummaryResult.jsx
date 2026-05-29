import { useState } from 'react'
import styles from './SummaryResult.module.css'

export default function SummaryResult({ result }) {
  const [copied, setCopied] = useState(false)
  const { summary, original_word_count, summary_word_count, compression_achieved, chunks_processed } = result
  const reduction = Math.round((1 - compression_achieved) * 100)

  function handleCopy() {
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'summary.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.statsRow}>
        {[
          { label: 'Original', value: original_word_count.toLocaleString(), unit: 'words' },
          { label: 'Summary', value: summary_word_count.toLocaleString(), unit: 'words' },
          { label: 'Reduced by', value: reduction + '%', unit: 'shorter', highlight: true },
          { label: 'Chunks', value: chunks_processed, unit: 'processed' },
        ].map((s) => (
          <div key={s.label} className={`${styles.stat} ${s.highlight ? styles.highlight : ''}`}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statUnit}>{s.unit}</span>
          </div>
        ))}
      </div>

      <div className={styles.outputCard}>
        <div className={styles.outputHeader}>
          <span className={styles.outputLabel}>Generated Summary</span>
          <div className={styles.actions}>
            <button className={styles.btn} onClick={handleCopy}>
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            <button className={styles.btn} onClick={handleDownload}>
              ↓ Download
            </button>
          </div>
        </div>
        <p className={styles.summaryText}>{summary}</p>
      </div>
    </div>
  )
}