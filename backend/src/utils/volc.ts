import axios from 'axios';

const API_KEY = process.env.VOLC_API_KEY || '';
const MODEL_NAME = process.env.VOLC_MODEL || '';  

if (!API_KEY || !MODEL_NAME) {
  console.warn('VolcEngine API key or Model name is missing');
}

export async function callVolcAI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('VolcEngine API key is not configured');
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        model: MODEL_NAME,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        timeout: 180000, // Increase timeout to 180s
      }
    );

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      console.error('VolcEngine response format error:', response.data);
      throw new Error('Invalid response from VolcEngine');
    }
  } catch (error: any) {
    console.error('Call VolcEngine API failed:', error.response?.data || error.message);
    throw new Error(`AI Service Error: ${error.message}`);
  }
}
