import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import SummarizerPage from './components/SummarizerPage'
import MeetingNotes from './components/MeetingNotes'

// NEW: Import your combined Citation Page
import CitationPage from './components/CitationPage' 

export default function App() {
  return (
    <div>
      {/* The NavBar stays on screen no matter what page you are on */}
      <NavBar /> 

      {/* The Routes decide what loads below the NavBar */}
      <main>
        <Routes>
          {/* URL: localhost:5173/ */}
          <Route path="/" element={<SummarizerPage />} />
          
          {/* URL: localhost:5173/meetings */}
          <Route path="/meetings" element={<MeetingNotes />} />

          {/* NEW URL: localhost:5173/citations */}
          <Route path="/citations" element={<CitationPage />} />
        </Routes>
      </main>
    </div>
  )
}