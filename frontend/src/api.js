import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
})

export async function summarizeText(text, compression = 0.35, numBeams = 4) {
  const { data } = await api.post('/summarize/text', {
    text,
    compression,
    num_beams: numBeams,
  })
  return data
}

export async function summarizeFile(file, compression = 0.35, numBeams = 4) {
  const form = new FormData()
  form.append('file', file)
  form.append('compression', compression)
  form.append('num_beams', numBeams)

  const { data } = await api.post('/summarize/file', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export default api