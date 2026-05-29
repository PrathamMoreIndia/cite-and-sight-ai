import { useState, useRef, useEffect } from 'react';
import styles from './MeetingNotes.module.css';

// IMPORT YOUR DROPZONE COMPONENT
import DropZone from './DropZone';

export default function MeetingNotes() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setFile(null);
    setLoading(false);
    setProgress(0);
    setResult(null);
    setError('');
  };

  const downloadText = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const increment = prev < 50 ? 5 : prev < 80 ? 2 : 0.5;
        return prev + increment;
      });
    }, 600);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process video. Check backend logs.');
      }

      const data = await response.json();
      
      if (intervalRef.current) clearInterval(intervalRef.current);
      setProgress(100);
      
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 500);

    } catch (err) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setLoading(false);
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className={styles.container}>
      
      {/* ===================================== */}
      {/* UPLOAD SECTION */}
      {/* ===================================== */}
      {!loading && !result && (
        <div className={styles.uploadCard}>
          <h2 className={styles.uploadTitle}>AI Meeting Notes</h2>
          <p className={styles.uploadSubtitle}>
            Upload a meeting recording to generate a full transcript and executive summary.
          </p>

          <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <DropZone
              file={file}
              onFile={(f) => {
                setFile(f);
                setError('');
                setResult(null);
                setProgress(0);
              }}
              onClear={() => {
                setFile(null);
                setError('');
                setResult(null);
                setProgress(0);
              }}
              // FIX: These are the lines that were missing! 
              // This overrides the default document settings specifically for the video page.
              acceptedExtensions={['video/*', 'audio/*', '.mp4', '.mov', '.mp3', '.webm']}
              maxSizeMB={500}
              hintText="Supports MP4, MOV, MP3, WebM · Max 500 MB"
            />
          </div>

          <div className={styles.actionRow}>
            {file && (
              <button 
                onClick={handleSubmit}
                style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                ✦ Generate Notes
              </button>
            )}
          </div>

          {error && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>⚠ {error}</p>}
        </div>
      )}

      {/* ===================================== */}
      {/* LOADING STATE & PROGRESS BAR */}
      {/* ===================================== */}
      {loading && (
        <div className={styles.uploadCard}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Transcribing and summarizing video...</p>
            
            <div className={styles.progressContainer}>
              <div className={styles.progressTrack}>
                <div 
                  className={styles.progressFill} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className={styles.progressText}>{Math.round(progress)}% Complete</span>
            </div>

            <button 
              onClick={handleReset}
              style={{ marginTop: '2rem', padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border-hover)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
            >
              Cancel Process
            </button>
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* RESULTS DISPLAY */}
      {/* ===================================== */}
      {result && !loading && (
        <>
          <div className={styles.actionRow} style={{ justifyContent: 'flex-end', marginTop: 0 }}>
            <button 
              onClick={handleReset}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '0.5rem 1.25rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-primary)' }}
            >
              ↻ Reset Page
            </button>
          </div>

          <div className={styles.resultsGrid}>
            <div className={styles.resultCard}>
              <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Executive Summary</span>
                <button 
                  onClick={() => downloadText(result.summary, 'Meeting_Summary.txt')}
                  style={{ background: 'transparent', border: '1px solid var(--border-hover)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}
                >
                  ↓ Download
                </button>
              </div>
              <div className={styles.cardBody}>
                {result.summary}
              </div>
            </div>

            <div className={styles.resultCard}>
              <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Full Transcript</span>
                <button 
                  onClick={() => downloadText(result.transcript, 'Meeting_Transcript.txt')}
                  style={{ background: 'transparent', border: '1px solid var(--border-hover)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}
                >
                  ↓ Download
                </button>
              </div>
              <div className={styles.cardBody} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {result.transcript}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}