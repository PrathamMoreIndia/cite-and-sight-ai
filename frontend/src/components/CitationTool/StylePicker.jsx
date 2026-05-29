import React from 'react'
import { CITATION_STYLES } from '../../utils/citationStyles'
import styles from './StylePicker.module.css'

export default function StylePicker({ selected, onChange }) {
  const active = CITATION_STYLES.find(s => s.id === selected)

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {CITATION_STYLES.map(style => (
          <button
            key={style.id}
            className={`${styles.btn} ${selected === style.id ? styles.active : ''}`}
            onClick={() => onChange(style.id)}
            title={style.field}
          >
            <span className={styles.name}>{style.label}</span>
            <span className={styles.desc}>{style.desc}</span>
          </button>
        ))}
      </div>

      {active && (
        <div className={styles.preview}>
          <div className={styles.previewRow}>
            <span className={styles.previewLabel}>Bibliography</span>
            <span className={styles.field}>{active.field}</span>
          </div>
          <p className={styles.previewText}>{active.preview}</p>
          <div className={styles.inTextRow}>
            <span className={styles.previewLabel}>In-text</span>
            <code className={styles.inText}>{active.inTextExample}</code>
          </div>
        </div>
      )}
    </div>
  )
}
