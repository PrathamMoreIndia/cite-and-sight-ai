import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import styles from './ReferenceList.module.css'

const TYPE_COLORS = {
  journal: 'info',
  book: 'success',
  conference: 'warn',
  thesis: 'warn',
  web: 'default',
  report: 'default',
  other: 'default',
}

const CONFIDENCE_ICONS = {
  high: '✓',
  medium: '?',
  low: '✕',
}

export default function ReferenceList({ refs, isLoading, error, stats }) {
  const [copiedId, setCopiedId] = useState(null)
  const [filter, setFilter] = useState('all')

  function copyOne(ref) {
    navigator.clipboard.writeText(ref.converted).then(() => {
      setCopiedId(ref.id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!refs.length) return <EmptyState />

  const types = ['all', ...new Set(refs.map(r => r.type))]
  const filtered = filter === 'all' ? refs : refs.filter(r => r.type === filter)

  return (
    <div className={styles.wrapper}>
      {stats && <StatsBar stats={stats} />}

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {types.map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${filter === t ? styles.filterActive : ''}`}
              onClick={() => setFilter(t)}
            >
              {t === 'all' ? `All (${refs.length})` : `${t} (${refs.filter(r => r.type === t).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.list}>
        {filtered.map((ref, i) => (
          <div key={ref.id} className={styles.item}>
            <div className={styles.num}>{String(i + 1).padStart(2, '0')}</div>
            <div className={styles.content}>
              
              <div className={styles.text}>
                <ReactMarkdown>
                  {ref.converted}
                </ReactMarkdown>
              </div>

              <div className={styles.meta}>
                <span className={`${styles.tag} ${styles['tag_' + (TYPE_COLORS[ref.type] || 'default')]}`}>
                  {ref.type || 'article'}
                </span>
                {ref.authors && (
                  <span className={styles.author}>
                    {/* Replaced missing User icon */}
                    <span style={{ fontSize: '10px' }}>✎</span> 
                    {ref.authors}
                  </span>
                )}
                {ref.year && (
                  <span className={styles.year}>{ref.year}</span>
                )}
                {ref.confidence && (
                  <span className={`${styles.confidence} ${styles['conf_' + ref.confidence]}`} title={`Confidence: ${ref.confidence}`}>
                    {/* Replaced missing Confidence icons */}
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                      {CONFIDENCE_ICONS[ref.confidence]}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <button
              className={styles.copyBtn}
              onClick={() => copyOne(ref)}
              aria-label={`Copy reference ${i + 1}`}
              title="Copy citation"
            >
              {/* Replaced missing Copy/Check icons with native symbols */}
              <span style={{ fontSize: '14px' }}>
                {copiedId === ref.id ? '✓' : '⎘'}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsBar({ stats }) {
  return (
    <div className={styles.statsBar}>
      <span><strong>{stats.total}</strong> references</span>
      <span>·</span>
      <span>{stats.style} style</span>
      <span>·</span>
      <span>{stats.highConfidence} high-confidence</span>
      <span className={styles.statTime}>{stats.timestamp}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      {/* Replaced missing Books icon */}
      <span style={{ fontSize: '32px' }}>📚</span>
      <p>Upload a document or paste references, then click Format to see results here.</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className={styles.empty}>
      {/* Replaced missing Spinner icon */}
      <span style={{ fontSize: '32px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>↻</span>
      <p>AI is reading and reformatting your citations…</p>
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <div className={`${styles.empty} ${styles.emptyError}`}>
      {/* Replaced missing Error icon */}
      <span style={{ fontSize: '32px' }}>⚠</span>
      <p>{message || 'Something went wrong. Please try again.'}</p>
    </div>
  )
}