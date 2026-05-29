from google import genai
from google.genai import types

API_KEY = "YOUR_API_KEY_HERE"

client = genai.Client(
    api_key=API_KEY
)

def generate_summary(transcript):

    prompt = f"""
You are an expert executive assistant. Analyze the following meeting transcript and generate clean, structured meeting notes.

Please extract and format the information strictly into the following sections:

1. Executive Summary
Provide a concise 2-3 sentence overview of the meeting's main purpose and final outcome.

2. Key Discussion Points
Use bullet points to detail the most important topics, arguments, or updates shared during the meeting. 

3. Decisions Made
List any final decisions agreed upon by the participants. If no explicit decisions were made, state "No formal decisions recorded."

4. Action Items
Provide a checklist of tasks assigned during the meeting. If a specific person was assigned a task, include their name. 
Format as: "- [ ] Task description (Assignee)"

Constraints:
- Do not invent, hallucinate, or assume any information that is not explicitly stated in the transcript.
- Keep the tone professional and objective.

Transcript:
---
{transcript}
---
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.4,
            max_output_tokens=2048
        )
    )

    return response.text
