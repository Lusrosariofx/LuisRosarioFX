
import { GoogleGenAI, Type } from "@google/genai";
import { Trade, MarketType, TradeSide } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' });

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
  I track both "Personal Capital" and "Sim Funded" accounts. 
  Contrast the performance between these two account types.
  
  Recent Trades: ${JSON.stringify(tradeSummary.slice(-15))}
  
  Provide a concise summary with sections for 'Comparative Insights', 'Psychological Patterns', and 'Actionable Fixes'. Use professional trading terminology.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite institutional performance manager specializing in retail trader data analysis.",
        temperature: 0.7,
      },
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Error generating AI analysis.";
  }
};

export const analyzeTradeImage = async (base64Image: string): Promise<Partial<Trade>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: "Extract all trade details from this screenshot. Identify the instrument (e.g. NQ, ES, EURUSD), side (Long/Short), quantity/size, entry price, exit price, and total profit or loss. Format the date strictly as YYYY-MM-DD. If multiple trades are visible, extract the most prominent or summarized one.",
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
    });

    const result = JSON.parse(response.text || "{}");
    return {
      ...result,
      marketType: (result.instrument?.length > 5 || result.instrument?.includes('/')) ? MarketType.FOREX : MarketType.FUTURES
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    throw new Error("Failed to read trade from image. Please ensure the date and profit/loss are clearly visible.");
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
      model: 'gemini-3-pro-preview',
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: "Act as a professional senior technical analyst. Analyze this chart screenshot (likely from TradingView). Determine the 'Direction for the Day' (Bullish, Bearish, or Neutral). Identify key support/resistance levels, trend structures, and price action signals. Provide a concise professional reasoning and a confidence score from 1-10.",
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bias: { type: Type.STRING, enum: ["Bullish", "Bearish", "Neutral"] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            keyLevels: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Important price levels to watch"
            },
          },
          required: ["bias", "confidence", "reasoning", "keyLevels"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Chart bias analysis error:", error);
    throw new Error("Failed to analyze chart bias. Please ensure the chart candles and levels are visible.");
  }
};
