const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testGeminiAPI() {
    const prompt = "Give me a joke about a cat eats pasta";

    try {
        console.log('Sending request to Google Gemini API with prompt:', prompt);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();
        console.log('Google Gemini API response:', text);
    } catch (error) {
        console.error("Error generating content:", error.message);
    }
}

testGeminiAPI();
