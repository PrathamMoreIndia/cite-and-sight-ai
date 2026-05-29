import { useState, useCallback } from 'react'
import { buildConversionPrompt } from '../utils/citationStyles'

// All states the conversion can be in
export const STATUS = {
  IDLE: 'idle',
  EXTRACTING: 'extracting',  // parsing document
  CONVERTING: 'converting',  // calling Gemini API
  DONE: 'done',
  ERROR: 'error',
}

export function useConversion() {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [progress, setProgress] = useState(0) // 0–100
  const [refs, setRefs] = useState([])
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  const convert = useCallback(async (text, targetStyle, options = {}) => {
    if (!text.trim()) return

    setStatus(STATUS.CONVERTING)
    setProgress(10)
    setError(null)
    setRefs([])

    const prompt = buildConversionPrompt(text, targetStyle, options)

    try {
      setProgress(30)

      // IMPORTANT: Ensure you are securely passing your API key. 
      // Using Vite (import.meta.env) or Create React App (process.env) as an example.
      const apiKey = import.meta.env.VITE_REACT_APP_GEMINI_API_KEY; 

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            // Forcing JSON output directly from the model
            responseMimeType: "application/json",
          }
        })
      })

      setProgress(70)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `API error ${response.status}`)
      }

      // Extract text from the Gemini response structure
      const raw = data.candidates[0]?.content?.parts[0]?.text || '[]'

      setProgress(90)

      // Parse the JSON (cleaner now thanks to responseMimeType)
      const parsed = JSON.parse(raw)

      // Sort if requested
      const final = options.sortAlpha
        ? [...parsed].sort((a, b) => a.converted.localeCompare(b.converted))
        : parsed

      setRefs(final)
      setStats({
        total: final.length,
        byType: countByType(final),
        highConfidence: final.filter(r => r.confidence === 'high').length,
        style: targetStyle,
        timestamp: new Date().toLocaleTimeString()
      })

      setProgress(100)
      setStatus(STATUS.DONE)

    } catch (err) {
      console.error('Conversion error:', err)
      setError(err.message || 'Unknown error')
      setStatus(STATUS.ERROR)
      setProgress(0)
    }
  }, [])

  const reset = useCallback(() => {
    setStatus(STATUS.IDLE)
    setProgress(0)
    setRefs([])
    setError(null)
    setStats(null)
  }, [])

  return { status, progress, refs, error, stats, convert, reset }
}

function countByType(refs) {
  return refs.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {})
}