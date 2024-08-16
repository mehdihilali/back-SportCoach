const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Predefined list of healthy food and nutrition images
const predefinedImages = [
    "https://images.unsplash.com/photo-1556386734-4227a180d19e?q=80&w=1905&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1568158918251-8eb4601f0c5f?q=80&w=1886&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1570197571499-166b36435e9f?q=80&w=1906&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1910&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIwfHx8ZW58MHx8fHx8",
    "https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIwfHx8ZW58MHx8fHx8",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D",
    "https://images.unsplash.com/photo-1571342579397-fe16329793bf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjd8fGhlYWx0eSUyMGZvb2RzfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1602881917760-7379db593981?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5fHx8ZW58MHx8fHx8",
];

function getRandomImage() {
    const randomIndex = Math.floor(Math.random() * predefinedImages.length);
    return predefinedImages[randomIndex];
}

async function generateRecommendation(diagnostic) {
    const prompt = `Based on the following data: ${JSON.stringify(diagnostic.responses)}, generate a detailed nutrition program.
                    The response should be a JSON object with the following fields: {imageUrl, Title, Description should be detailed and be a string formatted, HowToAchieveTheGoals, timeNeededToAchieveGoals}.
                    Ensure the nutrition program is detailed and specific to the goals mentioned. The "HowToAchieveTheGoals" field should be a string formatted as:
                    "1. [Goal Name]:\\n- [Action 1]\\n- [Action 2]\\n...\\n- [Action N] , actions should be detailed"
                    The "timeNeededToAchieveGoals" field should be a string and more detailed.`;

    try {
        console.log('Sending request to Google Gemini API with prompt:', prompt);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        console.log('Google Gemini API response:', text);

        // Extract JSON string from text response
        let recommendation;
        try {
            const jsonString = text.match(/```json([\s\S]*?)```/)[1].trim();
            recommendation = JSON.parse(jsonString);
        } catch (e) {
            console.error('Failed to extract and parse JSON from response text:', e);
            recommendation = { recommendationText: text };
        }

        // Ensure fields are strings
        if (typeof recommendation.HowToAchieveTheGoals !== 'string') {
            recommendation.HowToAchieveTheGoals = JSON.stringify(recommendation.HowToAchieveTheGoals);
        }
        if (typeof recommendation.timeNeededToAchieveGoals !== 'string') {
            recommendation.timeNeededToAchieveGoals = String(recommendation.timeNeededToAchieveGoals);
        }

        // Assign a random image URL from the predefined list
        recommendation.imageUrl = getRandomImage();

        return recommendation;
    } catch (error) {
        console.error("Error generating recommendation:", error.message);
        throw new Error('Failed to generate recommendation');
    }
}

module.exports = generateRecommendation;