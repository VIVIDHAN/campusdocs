import { GoogleGenerativeAI } from "@google/generative-ai";

// 🚨 PASTE YOUR KEY RIGHT HERE INSIDE THE QUOTES 🚨
const apiKey = "AIzaSyAcw4sjTmPcEGUwmIrrZQHyFbWd9wJA1EE"; 

export const generateDocument = async (docData) => {
  if (apiKey === "YOUR_API_KEY_HERE") {
    return "⚠️ Error: You forgot to paste your actual Gemini API Key in the geminiService.js file!";
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using the fast flash model for instant generation
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Your Master Prompt Logic
  const prompt = `
    You are an intelligent academic assistant that generates formal documents for students.
    Generate a formal, polite ${docData.docType} for a college student in India.
    
    Student Name: ${docData.name}
    Reason/Details: ${docData.reason}
    
    Rules:
    1. Use formal tone.
    2. Include proper headings, salutations (Respected Sir/Madam), and closing lines.
    3. Output ONLY clean, readable text. No bolding (**), no asterisks, no unnecessary explanations.
    4. Make it ready to copy and paste.
  `;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ Error generating document. Please check your API key or try again.";
  }
};