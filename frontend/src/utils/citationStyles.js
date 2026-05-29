// Citation style definitions
// Each style has: id, label, description, edition, preview example, and formatting rules note

export const CITATION_STYLES = [
  {
    id: 'APA',
    label: 'APA',
    desc: '',
    field: 'Psychology / Social Sciences',
    preview: 'Sarker, I. (2022). AI-Based Modeling: Techniques, Applications and Research Issues Towards Automation, Intelligent and Smart Systems. Sn Computer Science, 3. https://doi.org/10.1007/s42979-022-01043-x.',
    inTextExample: '(Sarker, 2022)',
    rules: 'CRITICAL OVERRIDE: DO NOT apply standard APA formatting. You MUST use this custom format: Element 1: Author or full corporate name. CRITICAL: NEVER include bracketed acronyms in the author field (e.g., strip out [DEST] or similar). Element 2: (Year). Element 3: ALL titles MUST be in Title Case in PLAIN TEXT (NO markdown asterisks). Element 4: Journal names/volumes MUST be in PLAIN TEXT. However, for reports/books, you MUST STRICTLY USE MARKDOWN ASTERISKS to italicize ONLY the publisher name (e.g., *Publisher Name*). Element 5: DOI/URL MUST strictly be formatted as a full HTTPS link (e.g., https://doi.org/...) and placed at the very end.'
  },
  {
    id: 'MLA',
    label: 'MLA',
    desc: '',
    field: 'Humanities / Literature',
    preview: 'Sarker, Iqbal H. "AI-Based Modeling: Techniques, Applications and Research Issues Towards Automation, Intelligent and Smart Systems." Sn Computer Science, vol. 3, 2022. https://doi.org/10.1007/s42979-022-01043-x.',
    inTextExample: '(Sarker 45)',
    rules: 'CRITICAL OVERRIDE: You MUST strictly enforce this custom format and ignore any default citation behaviors. Element 1 (Author): Last name, First name OR full corporate name. CRITICAL: NEVER include bracketed acronyms (strip out [DEST]). Element 2 (Title): Title Case. IF it is an article, wrap it in "double quotes". IF it is a standalone report/book, leave it in PLAIN TEXT (NO quotes, NO asterisks). Element 3 (Container/Publisher): IF it is a journal name, leave it in PLAIN TEXT. IF it is a report/book publisher, you MUST STRICTLY USE MARKDOWN ASTERISKS to italicize the publisher name (e.g., *Publisher Name*). CRITICAL PUNCTUATION: Separate the Author, Title, and Container elements with periods. Element 4 (Date): The year MUST go near the end, immediately after the publisher or journal volume, separated by a comma. Element 5 (URL/DOI): You MUST strictly format DOIs as full HTTPS links (e.g., https://doi.org/...) and place them at the very end.'
  },
  {
    id: 'IEEE',
    label: 'IEEE',
    desc: '',
    field: 'Engineering / CS',
    preview: 'R. V. Chandran, "A Graph Neural Network Framework for Governance, Risk, and Compliance Classification and Unified Grc Scoring to Strengthen Enterprise-Level Decision Making," *2025 IEEE 5th International Conference on ICT in Business Industry & Government (ICTBIG)*, Indore, Madhya Pradesh, India, 2025, pp. 1-6, doi: 10.1109/ICTBIG68706.2025.11323587.',
    inTextExample: 'Chandran',
    rules: 'CRITICAL OVERRIDE: DO NOT apply standard IEEE bracketed numbering (remove [1]). Element 1 (Author): Format strictly as Initials followed by surname (e.g., "R. V. Chandran"). Separate multiple authors with commas and use "and" before the final author. End author section with a comma. Element 2 (Paper Title): Use Title Case, wrap strictly in "double quotes", and place the comma inside the closing quotation mark. Element 3 (Conference/Journal Container): STRICTLY USE MARKDOWN ASTERISKS to italicize the complete conference or journal name. CRITICAL: If the official conference title begins with a year (e.g., *2025 IEEE 5th International Conference...*), DO NOT remove, relocate, or strip the year because it is part of the official conference title metadata. Element 4 (Location and Publication Metadata): After the italicized container, write the conference location strictly in the format "City, State/Region, Country". Immediately after the location, retain the publication year even if the same year already appears inside the conference title. This second year is mandatory IEEE bibliographic metadata and must NOT be removed as duplication. After the year, include page numbers strictly formatted as "pp. X-Y". Separate all metadata fields with commas. Element 5 (DOI): Format strictly using lowercase "doi:" followed by the DOI number at the very end. Final Mandatory Structure: Author → "Paper Title" → *Conference Name* → Location → Year → pp. X-Y → doi. End the complete reference with a single period.'
 },
  
  {
    id: 'Harvard',
    label: 'Harvard',
    desc: '',
    field: 'General Academic',
    preview: 'Sarker, I. (2022). AI-Based Modeling: Techniques, Applications and Research Issues Towards Automation, Intelligent and Smart Systems. *Sn Computer Science*, 3. https://doi.org/10.1007/s42979-022-01043-x.',
    inTextExample: '(Sarker, 2022)',
    rules: 'CRITICAL OVERRIDE: DO NOT apply standard Harvard formatting. You MUST strictly use this custom format. Element 1 (Author): Last name, Initial OR full corporate name. CRITICAL: NEVER include bracketed acronyms (strip out [DEST]). MUST end with a period. Element 2 (Date): (Year), followed by a period. Element 3 (Title): Title Case. MUST be in PLAIN TEXT (NO markdown asterisks, NO quotes). Element 4 (Container/Publisher): For journals, STRICTLY USE MARKDOWN ASTERISKS to italicize the journal name (*Journal Name*), followed by a comma and plain-text volume. For reports/books, DO NOT include the publisher city (e.g., remove "Canberra:"). STRICTLY USE MARKDOWN ASTERISKS to italicize ONLY the publisher name (*Publisher Name*). Element 5 (DOI): You MUST strictly format DOIs as full HTTPS links (e.g., https://doi.org/...) instead of the standard "doi:" prefix. End with a period.'
  }
]

// Build the prompt for an LLM to extract + convert citations
export function buildConversionPrompt(text, targetStyle, options = {}) {
  const style = CITATION_STYLES.find(s => s.id === targetStyle);
  
  return `You are a precision-driven academic citation formatting engine. Your task is to process raw text, extract all bibliographic references, and strictly reformat them into ${targetStyle} (${style.desc}) style.

CRITICAL RULES FOR ${targetStyle.toUpperCase()}: 
${style.rules}
(Do not deviate from these specific style rules. Pay close attention to punctuation and capitalization formats like sentence-case vs. title-case).

CRITICAL FORMATTING INSTRUCTION:
If a style rule requires italics, you MUST use standard markdown asterisks to represent those italics in your JSON string output (e.g., "*Journal of Science*, *4*(2)"). Do not ignore the italics rules.

PROCESSING OPTIONS:
- Sort alphabetically: ${options.sortAlpha ? "YES (Sort the final JSON array by the first author's surname)" : "NO (Preserve original appearance order)"}
- Enforce DOI Links: YES. You MUST extract DOIs and convert them entirely into standard clickable HTTPS URLs (e.g., output "https://doi.org/10.xxx/xxx" rather than just "doi:10.xxx" or "10.xxx").
- Missing Data: Do NOT hallucinate or invent missing dates, authors, or titles. If a core field is missing, format what is available based on the style rules and simply omit the missing piece smoothly. ABSOLUTELY DO NOT use placeholders like "[?]".

OUTPUT FORMAT:
Return ONLY a valid, raw JSON array. ABSOLUTELY NO MARKDOWN CODE BLOCKS (do NOT use \`\`\`json). Do not include any conversational text, greetings, or explanations. Use this exact schema:
[
  {
    "id": 1, 
    "original": "The exact original reference text string",
    "converted": "The fully formatted ${targetStyle} citation including markdown italics and https://doi.org/ links where required. Omit any missing data gracefully without inserting [?].",
    "authors": "Extracted author(s) (e.g., First Author et al.)",
    "year": "Extracted year (or empty string if missing)",
    "title": "Extracted title",
    "source": "Journal, publisher, or website name",
    "type": "journal | book | conference | thesis | web | report | other",
    "hasDoi": true,
    "confidence": "high | medium | low"
  }
]

INPUT TEXT TO PROCESS:
---
${text}
---`;
}

// Build prompt for in-text citation conversion
export function buildInTextPrompt(bodyText, convertedRefs, fromStyle, toStyle) {
  const targetStyleDef = CITATION_STYLES.find(s => s.id === toStyle);

  return `You are a strict text-processing engine. Your ONLY task is to locate in-text citations formatted in ${fromStyle} style and convert them to ${toStyle} style.

TARGET IN-TEXT STYLE (${toStyle}):
Example format: ${targetStyleDef.inTextExample}

REFERENCE MAPPING DATABASE:
Use the following extracted references to correctly map and format the new in-text citations:
${JSON.stringify(convertedRefs.map(r => ({ id: r.id, authors: r.authors, year: r.year })), null, 2)}

CRITICAL CONSTRAINTS:
1. DO NOT edit, summarize, or alter any surrounding body text. Preserve all original phrasing, paragraph structures, line breaks, and non-citation punctuation exactly as provided.
2. ONLY modify the citation markers themselves to match the ${toStyle} example format provided above.
3. Ensure punctuation around the citation (periods, commas) correctly aligns with ${toStyle} conventions (e.g., moving a period inside or outside of parentheses/brackets).

OUTPUT FORMAT:
Return ONLY a valid, raw JSON object. ABSOLUTELY NO MARKDOWN CODE BLOCKS (do NOT use \`\`\`json). Do not include any explanatory text. Use this exact schema:
{
  "updatedText": "The complete original body text with ONLY the citations updated."
}

INPUT BODY TEXT:
---
${bodyText}
---`;
}