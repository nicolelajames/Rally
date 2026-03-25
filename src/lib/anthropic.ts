const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

interface ExtractedItem {
  type: 'action_required' | 'event' | 'upcoming'
  title: string
  description: string
  due_at: string | null
  event_at: string | null
  location: string | null
  badge_type: 'urgent' | 'warning' | 'info' | null
  badge_label: string | null
  priority: number
}

interface ParseResult {
  summary: string
  items: ExtractedItem[]
}

export async function parseDocumentImage(
  base64Image: string,
  mimeType: string
): Promise<ParseResult> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `You are an AI assistant that extracts structured information from school documents, permission slips, newsletters, and activity notices.

Analyze this document and return ONLY valid JSON with this structure:
{
  "summary": "One sentence plain-English summary of what this document is",
  "items": [
    {
      "type": "action_required | event | upcoming",
      "title": "Short title (max 8 words)",
      "description": "One sentence description",
      "due_at": "ISO 8601 date string or null",
      "event_at": "ISO 8601 date string or null",
      "location": "Location string or null",
      "badge_type": "urgent | warning | info | null",
      "badge_label": "Short badge text or null",
      "priority": 0
    }
  ]
}

Rules:
- Extract ALL dates, deadlines, events, and action items you can find
- For action_required items (permission slips, payments, signups), set priority 8-10
- For events, set priority 3-6
- If you see "due", "return by", "deadline", "RSVP by" — that's action_required
- Today's date context: ${new Date().toISOString().split('T')[0]}
- Return ONLY the JSON object, no markdown, no explanation`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error: ${response.status} — ${err}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await response.json()
  const text: string = data.content[0].text

  // Strip any accidental markdown fences
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
