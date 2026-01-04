
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, EmotionType } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeFacialExpression(base64Image: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the facial expression of the student in this image.
    1. Identify their emotional state from these categories: ${Object.values(EmotionType).join(", ")}.
    2. Provide a supportive, human-like study guidance message based on this emotion.
    3. Give a brief reasoning for your choice.
    
    Return the analysis as a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        // Use Type from @google/genai for responseSchema
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotion: { 
              type: Type.STRING, 
              enum: Object.values(EmotionType)
            },
            confidence: { type: Type.NUMBER },
            guidance: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["emotion", "confidence", "guidance", "reasoning"]
        }
      }
    });

    // Extract text from GenerateContentResponse using .text property (not a method)
    const result = JSON.parse(response.text || '{}');
    return {
      ...result,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
