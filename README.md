# What'd You Eat? - Nutrition Tracker

A web application that uses Claude AI to analyze your daily food intake in plain language and determine which nutrients you still need in your diet.

## Features

- Type what you ate in plain, natural language
- AI-powered nutritional analysis using Claude
- Track nutrients consumed vs. recommended daily allowances
- Visual progress bars for each nutrient
- Personalized food recommendations to meet remaining nutritional needs
- Persistent storage of daily intake (resets automatically each day)
- Clean, responsive user interface

## Tracked Nutrients

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Vitamin C
- Vitamin D
- Calcium
- Iron
- Potassium
- Sodium

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- An Anthropic API key (get one at https://console.anthropic.com/)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whatd-you-eat
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your Anthropic API key to the `.env` file:
```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3000
```

## Usage

1. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Type what you ate in plain language, for example:
   - "For breakfast I had 2 scrambled eggs, toast with butter, and orange juice"
   - "Lunch was a chicken Caesar salad and a glass of water"
   - "I ate a banana and some almonds as a snack"

4. Click "Analyze My Nutrition" to get your nutritional breakdown

5. Review your:
   - Nutrients consumed
   - Remaining nutritional needs
   - Progress toward daily goals
   - Food recommendations

## How It Works

1. User enters food description in natural language
2. Frontend sends the description to the backend API
3. Backend constructs a prompt for Claude with:
   - The food description
   - Previous intake data (if any)
   - Recommended Daily Allowances (RDA)
4. Claude analyzes the food and returns:
   - Estimated nutritional content
   - Total nutrients consumed
   - Remaining nutritional needs
   - Personalized food recommendations
5. Frontend displays the results with visual progress indicators

## Technologies Used

- **Backend**: Node.js, Express
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Storage**: LocalStorage for daily persistence

## API Endpoints

### POST /api/analyze
Analyzes food intake and returns nutritional information.

**Request Body:**
```json
{
  "foodDescription": "string",
  "previousIntake": {
    "nutrients_consumed": {...}
  }
}
```

**Response:**
```json
{
  "nutrients_consumed": {...},
  "nutrients_remaining": {...},
  "percentage_met": {...},
  "analysis": "string",
  "recommendations": ["string"]
}
```

### GET /api/health
Health check endpoint.

## Notes

- Nutritional values are estimates based on Claude's knowledge
- RDA values are based on general guidelines for an average adult
- Data is stored locally and resets automatically each day
- This tool is for informational purposes and should not replace professional nutritional advice

## Future Enhancements

Potential improvements:
- User profiles with customizable RDA values
- Multi-day tracking and trends
- Meal planning suggestions
- Export data to CSV/PDF
- Barcode scanning for packaged foods
- Integration with fitness trackers
- Dietary restriction filters (vegan, gluten-free, etc.)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
