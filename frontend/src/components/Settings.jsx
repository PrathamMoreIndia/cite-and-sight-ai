// Inside components/Settings.jsx
import styles from './Settings.module.css'

export default function Settings({ compression, setCompression, numBeams, setNumBeams }) {
  return (
    <div className={styles.grid}>
      <div className={styles.group}>
        <div className={styles.labelRow}>
          <label htmlFor="compression">Compression ratio</label>
          <span className={styles.value}>{compression}%</span>
        </div>
        <input
          id="compression"
          type="range" min="10" max="80" step="5"
          value={compression}
          // Just pass the raw integer straight to state
          onChange={(e) => setCompression(Number(e.target.value))}
          className={styles.slider}
        />
        <p className={styles.hint}>
          {/* Note: Update these hints to check against the integer now! */}
          {compression <= 25 ? 'Very aggressive — very short output'
            : compression <= 45 ? 'Balanced — recommended'
            : 'Light — output close to original length'}
        </p>
      </div>

      <div className={styles.group}>
        <div className={styles.labelRow}>
          <label htmlFor="beams">Beam search width</label>
          <span className={styles.value}>{numBeams}</span>
        </div>
        <input
          id="beams"
          type="range" min="1" max="8" step="1"
          value={numBeams}
          onChange={(e) => setNumBeams(Number(e.target.value))}
          className={styles.slider}
        />
        <p className={styles.hint}>
          {numBeams <= 2 ? 'Fast — lower quality'
            : numBeams <= 4 ? 'Balanced — good quality'
            : 'Slow — highest quality'}
        </p>
      </div>
    </div>
  )
}