
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const removeWatermarkWithGemini = async (
  base64Image: string,
  rect: { x: number; y: number; width: number; height: number; containerWidth: number; containerHeight: number }
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Calculate relative position for the prompt
  const horizontal = rect.x < rect.containerWidth / 3 ? 'left' : (rect.x > (rect.containerWidth * 2) / 3 ? 'right' : 'center');
  const vertical = rect.y < rect.containerHeight / 3 ? 'top' : (rect.y > (rect.containerHeight * 2) / 3 ? 'bottom' : 'middle');
  const location = `${vertical} ${horizontal}`;

  const prompt = `This image has an AI watermark or logo located in the ${location} area (around ${Math.round(rect.x)}, ${Math.round(rect.y)}). 
  Please remove only this identifier and fill the area perfectly to match the background texture and content. 
  Keep every other pixel of the image exactly the same. Do not regenerate the whole image, only heal the specified area.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: 'image/png',
            },
          },
          { text: prompt },
        ],
      },
    });

    let resultImageB64 = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        resultImageB64 = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!resultImageB64) {
      throw new Error("No image was returned by the AI.");
    }

    return resultImageB64;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
