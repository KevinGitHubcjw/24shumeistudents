import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTriviaQuestion = async (studentName: string, subject: string = "General Knowledge") => {
  if (!apiKey) {
    return {
      question: "API Key missing. Please ask the teacher a question!",
      answer: "N/A"
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, engaging, single-sentence trivia question for a high school student named ${studentName} about the subject: ${subject}. Also provide the answer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      question: `Gemini is taking a nap. ${studentName}, tell us a fun fact!`,
      answer: "N/A"
    };
  }
};