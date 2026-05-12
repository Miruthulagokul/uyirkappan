const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

router.post('/triage', async (req, res) => {
  try {
    const emergencies = req.body.emergencies;
    
    if (!emergencies || emergencies.length === 0) {
      return res.status(400).json({ error: 'No emergencies provided for triage' });
    }

    // Only proceed if API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert emergency medical dispatcher. I am providing you a list of pending emergency ambulance requests.
Your task is to analyze these emergencies and create a priority queue.
Sort them from highest medical severity (most life-threatening) to lowest severity.

Here are the emergencies:
${JSON.stringify(emergencies, null, 2)}

Return a JSON array of objects. Each object should have:
- "id": the emergency id
- "patientName": the patient's name
- "severityLevel": "CRITICAL", "HIGH", "MEDIUM", or "LOW"
- "reasoning": A 1-2 sentence medical explanation of why this priority was assigned.

CRITICAL INSTRUCTION: Return ONLY the raw JSON array. Do not include markdown blocks like \`\`\`json or any other text.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature for consistent medical triage
      }
    });

    const aiText = response.text.trim().replace(/^```json/g, '').replace(/```$/g, '');
    
    let priorityQueue;
    try {
      priorityQueue = JSON.parse(aiText);
    } catch (parseError) {
      console.error("AI response wasn't valid JSON:", aiText);
      return res.status(500).json({ error: 'AI failed to return valid JSON' });
    }

    res.json({ queue: priorityQueue });
  } catch (error) {
    console.error('AI Triage Error:', error);
    res.status(500).json({ error: 'Failed to process AI Triage' });
  }
});

module.exports = router;
