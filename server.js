require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Recommended Daily Allowances (for an average adult)
const RDA = {
  calories: 2000,
  protein: 50, // grams
  carbohydrates: 300, // grams
  fat: 65, // grams
  fiber: 25, // grams
  vitamin_c: 90, // mg
  vitamin_d: 20, // mcg
  calcium: 1000, // mg
  iron: 18, // mg
  potassium: 3500, // mg
  sodium: 2300, // mg (upper limit)
};

// Endpoint to analyze food intake
app.post('/api/analyze', async (req, res) => {
  try {
    const { foodDescription, previousIntake } = req.body;

    if (!foodDescription) {
      return res.status(400).json({ error: 'Food description is required' });
    }

    // Create the prompt for Claude
    const prompt = `You are a nutritionist AI assistant. A user has eaten the following food today:

${foodDescription}

${previousIntake ? `They have already consumed:\n${JSON.stringify(previousIntake, null, 2)}\n` : ''}

Please analyze this food and:
1. Extract the nutritional information (estimate if exact values aren't known)
2. Calculate the total nutrients consumed so far today
3. Compare against recommended daily allowances (RDA):
   - Calories: 2000 kcal
   - Protein: 50g
   - Carbohydrates: 300g
   - Fat: 65g
   - Fiber: 25g
   - Vitamin C: 90mg
   - Vitamin D: 20mcg
   - Calcium: 1000mg
   - Iron: 18mg
   - Potassium: 3500mg
   - Sodium: 2300mg (upper limit)

4. Identify which nutrients are still needed
5. Provide specific food recommendations to meet the remaining nutritional needs

Please respond in the following JSON format:
{
  "nutrients_consumed": {
    "calories": number,
    "protein": number,
    "carbohydrates": number,
    "fat": number,
    "fiber": number,
    "vitamin_c": number,
    "vitamin_d": number,
    "calcium": number,
    "iron": number,
    "potassium": number,
    "sodium": number
  },
  "nutrients_remaining": {
    "calories": number,
    "protein": number,
    "carbohydrates": number,
    "fat": number,
    "fiber": number,
    "vitamin_c": number,
    "vitamin_d": number,
    "calcium": number,
    "iron": number,
    "potassium": number,
    "sodium": number
  },
  "percentage_met": {
    "calories": number,
    "protein": number,
    "carbohydrates": number,
    "fat": number,
    "fiber": number,
    "vitamin_c": number,
    "vitamin_d": number,
    "calcium": number,
    "iron": number,
    "potassium": number,
    "sodium": number
  },
  "analysis": "Brief summary of the nutritional analysis",
  "recommendations": ["Array of specific food recommendations to meet remaining needs"]
}

IMPORTANT: Return ONLY valid JSON, no other text before or after.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Parse Claude's response
    const responseText = message.content[0].text;

    // Extract JSON from response (in case Claude adds any extra text)
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Claude response');
    }

    const nutritionData = JSON.parse(jsonMatch[0]);

    res.json(nutritionData);
  } catch (error) {
    console.error('Error analyzing food:', error);
    res.status(500).json({
      error: 'Failed to analyze food intake',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nutrition Tracker API is running' });
});

app.listen(PORT, () => {
  console.log(`Nutrition Tracker server running on http://localhost:${PORT}`);
});
