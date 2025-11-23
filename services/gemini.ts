import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { MOCK_PRODUCTS } from "../constants";

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    // API_KEY is assumed to be pre-configured and valid.
    // Cast to string to ensure type safety if process.env types are loose.
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }
  return aiClient;
};

// System instruction to make the AI aware of the store context
const STYLIST_SYSTEM_INSTRUCTION = `
You are 'Operator', an expert personal stylist and shopping assistant for the 'Lumina' e-commerce store.
Your tone is sophisticated, helpful, and concise.
You have access to the following product catalog:
${JSON.stringify(MOCK_PRODUCTS.map(p => ({ id: p.id, name: p.name, price: p.price, category: p.category, description: p.description })))}

When a user asks for recommendations:
1. Suggest products from the catalog that fit their needs.
2. Explain WHY you selected them.
3. Be friendly and engaging.

If the user asks about something not in the store, politely guide them back to available categories (Clothing, Electronics, Home, Accessories).
Do not invent products that are not in the list above unless you are speculating on future trends (make it clear you are speculating).
`;

export const createChatSession = (): Chat => {
  const client = getClient();
  return client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: STYLIST_SYSTEM_INSTRUCTION,
    },
  });
};

export const generateProductPitch = async (productName: string, productDesc: string): Promise<string> => {
  const client = getClient();
  try {
    const prompt = `
      Write a compelling, luxury marketing one-liner (max 20 words) for a product named "${productName}".
      Base it on this description: "${productDesc}".
      Focus on emotion and lifestyle.
    `;
    
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || "Experience quality like never before.";
  } catch (error) {
    console.error("Error generating pitch:", error);
    return "The ultimate choice for your lifestyle.";
  }
};

export const generateProductDescription = async (name: string, category: string, features: string): Promise<string> => {
  const client = getClient();
  try {
    const prompt = `
      Write a sophisticated, sales-oriented product description (approx 30-40 words) for a new e-commerce product.
      Name: ${name}
      Category: ${category}
      Key Features: ${features}
      
      The tone should be premium and enticing.
    `;
    
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || "A premium product designed for the modern lifestyle.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "High-quality product designed to meet your needs.";
  }
};