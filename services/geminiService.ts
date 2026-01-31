
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Trade, MarketType, TradeSide } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTrades = async (trades: Trade[]): Promise<string> => {
  if (trades.length === 0) return "Add some trades to get AI-powered insights!";

  const tradeSummary = trades.map(t => ({
    side: t.side,
    instrument: t.instrument,
    pnl: t.pnl,
    account: t.accountType,
    type: t.marketType,
    notes: t.notes
  }));

  const prompt = `Analyze the following trading history. 
  Contrast the performance between different account types.
  
  Recent Trades: ${JSON.stringify(tradeSummary.slice(-20))}
  
  Provide a concise summary with sections for 'Comparative Insights', 'Psychological Patterns', and 'Actionable Fixes'. Use professional trading terminology.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite institutional performance manager specializing in retail trader data analysis. Be concise and direct.",
        temperature: 0.5,
      },
    });

    return response.text || "Could not generate analysis.";
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    if (error.message?.includes('429')) {
      return "Quota Exceeded: The AI is busy. Please wait 1-2 minutes and try 'Refresh Analysis' again.";
    }
    return "Error generating AI analysis. Please try again later.";
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read the following trading performance analysis in a professional, steady voice: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }, // Professional/Institutional tone
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Generation error:", error);
    return undefined;
  }
};

export const analyzeTradeImage = async (base64Image: string): Promise<Partial<Trade>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Extract EVERY individual trade execution visible in this screenshot. Look for tables, lists, or history logs. For each trade identified, extract the instrument, side (Long/Short), quantity, entry price, exit price, and total profit or loss. Format all dates strictly as YYYY-MM-DD.",
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              instrument: { type: Type.STRING },
              side: { type: Type.STRING, enum: ["Long", "Short"] },
              entryPrice: { type: Type.NUMBER },
              exitPrice: { type: Type.NUMBER },
              size: { type: Type.NUMBER },
              pnl: { type: Type.NUMBER },
              date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            },
            required: ["instrument", "pnl", "side", "date"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || "[]");
    if (!Array.isArray(results)) return [];

    return results.map(result => ({
      ...result,
      marketType: (result.instrument?.length > 5 || result.instrument?.includes('/')) ? MarketType.FOREX : MarketType.FUTURES
    }));
  } catch (error: any) {
    console.error("Image analysis error:", error);
    throw new Error(error.message?.includes('429') ? "AI Rate limit reached. Try again in 60s." : "Failed to read trade image.");
  }
};

export interface ChartAnalysisResult {
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  reasoning: string;
  keyLevels: string[];
}

export const analyzeDirectionBias = async (base64Image: string): Promise<ChartAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Act as a professional technical analyst. Analyze this chart. Determine the bias (Bullish, Bearish, or Neutral). Identify key levels and reasoning. Confidence score 1-10.",
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bias: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            keyLevels: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["bias", "confidence", "reasoning", "keyLevels"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Chart bias analysis error:", error);
    throw new Error(error.message?.includes('429') ? "AI Rate limit reached. Please wait a minute." : "Failed to analyze chart bias.");
  }
};
