// Export utilities for converted references

// ── Plain Text ────────────────────────────────────────────────────────────
export function exportAsTxt(refs, style) {
  const header = `References — ${style} Style\n${'='.repeat(50)}\n\n`
  const body = refs.map((r, i) => `${i + 1}. ${r.converted}`).join('\n\n')
  downloadText(header + body, `references_${style.toLowerCase()}.txt`, 'text/plain')
}

// ── BibTeX ────────────────────────────────────────────────────────────────
export function exportAsBibtex(refs) {
  const entries = refs.map((r, i) => {
    const key = buildBibtexKey(r)
    const type = mapTypeToBibtex(r.type)

    const fields = [
      r.authors && `  author    = {${r.authors}}`,
      r.year    && `  year      = {${r.year}}`,
      r.title   && `  title     = {${r.title}}`,
      r.source  && `  journal   = {${r.source}}`,
      r.doi     && `  doi       = {${r.doi}}`,
    ].filter(Boolean).join(',\n')

    return `@${type}{${key},\n${fields}\n}`
  }).join('\n\n')

  downloadText(entries, 'references.bib', 'text/plain')
}

function buildBibtexKey(ref) {
  const surname = (ref.authors || 'Unknown').split(',')[0].split(' ').pop().toLowerCase().replace(/[^a-z]/g, '')
  const year = ref.year || '0000'
  const titleWord = (ref.title || '').split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
  return `${surname}${year}${titleWord}`
}

function mapTypeToBibtex(type) {
  const map = {
    journal: 'article',
    book: 'book',
    conference: 'inproceedings',
    thesis: 'phdthesis',
    web: 'misc',
    report: 'techreport',
  }
  return map[type] || 'misc'
}

// ── DOCX ──────────────────────────────────────────────────────────────────
export async function exportAsDocx(refs, style) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')
  const { saveAs } = await import('file-saver')

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: 'References',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ text: `Style: ${style}`, spacing: { after: 300 } }),
        
        ...refs.map((r, i) =>
          new Paragraph({
            // Apply standard 0.5-inch hanging indent for academic styles
            indent: { hanging: 720, left: 720 }, 
            spacing: { after: 200 },
            children: [
              // Keep the numbering bold if you prefer, or remove 'bold: true'
              new TextRun({ text: `${i + 1}. `, bold: true }),
              
              // Spread the parsed markdown runs here
              ...parseMarkdownToTextRuns(r.converted, TextRun)
            ],
          })
        ),
      ]
    }]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `references_${style.toLowerCase()}.docx`)
}

// ── Helper ────────────────────────────────────────────────────────────────
function downloadText(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
// ── Helper: Parse Markdown to Word TextRuns ───────────────────────────────
function parseMarkdownToTextRuns(text, TextRun) {
  // Split the string by the markdown asterisk
  const parts = text.split('*');
  
  return parts.map((part, index) => {
    return new TextRun({
      text: part,
      // If the index is odd, it was inside asterisks, so make it italic
      italics: index % 2 !== 0 
    });
  });
}
