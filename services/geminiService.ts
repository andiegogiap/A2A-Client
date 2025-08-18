
import { GoogleGenAI, Type } from "@google/genai";
import type { ChatMessage, Hint } from "../types";

// The API key MUST be obtained exclusively from the environment variable.
// The build system is responsible for making this variable available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const sendMessageToGemini = async (prompt: string, history: ChatMessage[], aiInstruction?: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    // The history should only contain user and model roles for the API
    const chatHistory = history
      .filter(msg => msg.sender === 'User' || msg.sender === 'AI' || msg.sender === 'Agent')
      .map(msg => ({
        role: msg.sender === 'User' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    // Start a chat with the model, providing the existing history
    const chat = ai.chats.create({
        model: model,
        history: chatHistory,
        config: {
            systemInstruction: aiInstruction,
        }
    });

    // Send the new user message
    const response = await chat.sendMessage({message: prompt});

    // Return the model's response text
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Provide a more user-friendly error message
        return `AI: An error occurred while fetching the response. Please check your API key and network connection. Details: ${error.message}`;
    }
    return "AI: An unknown error occurred while fetching the response.";
  }
};

export const generateImageWithGemini = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            // When no image is generated, it's often due to safety filters.
            // The GenerateImagesResponse type does not include detailed safety feedback.
            return `AI: Sorry, I couldn't generate an image. This may be due to the prompt being rejected for safety reasons.`;
        }

    } catch (error) {
        console.error("Error calling Gemini Image API:", error);
        if (error instanceof Error) {
            return `AI: An error occurred while generating the image. Details: ${error.message}`;
        }
        return "AI: An unknown error occurred while generating the image.";
    }
};

const hintSchema = {
  type: Type.OBJECT,
  properties: {
    user: { type: Type.STRING, description: 'A concise, actionable phrase for the user to type next. Must be a direct command or question.' },
    ai: { type: Type.STRING, description: 'A detailed, contextual explanation from the AI agent\'s perspective that elaborates on the last response.' },
    system: { type: Type.STRING, description: 'A comprehensive, strategic recommendation for a broader workflow or orchestration from the CUA Engine.' },
  },
  required: ['user', 'ai', 'system'],
};


export const generateContextualHints = async (history: ChatMessage[], agentName: string, lastResponse: string, systemInstruction?: string): Promise<Hint | null> => {
  try {
    const model = 'gemini-2.5-flash';

    const historyText = history.map(m => `${m.sender}: ${m.text}`).join('\n');
    const prompt = `Based on the following conversation history with Agent ${agentName} and its last response, generate contextual hints.\n\nConversation:\n${historyText}\n\nLast AI Response:\n${lastResponse}`;
    
    const baseInstruction = "You are the CUA (USER, AI, SYSTEM) Engine. You provide three contextual hints to guide the user's next interaction. The hints must be in a non-enumerated prose format. Respond ONLY with the JSON object based on the schema.";
    const finalSystemInstruction = systemInstruction ? `${systemInstruction}\n\n${baseInstruction}` : baseInstruction;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: finalSystemInstruction,
            responseMimeType: 'application/json',
            responseSchema: hintSchema,
        }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as Hint;

  } catch (error) {
    console.error("Error generating contextual hints:", error);
    return null;
  }
};


export const simulateTaskExecution = async (taskPrompt: string, agentName: string, systemInstruction?: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        const baseInstruction = `You are the A2A system orchestrator. The user wants to simulate a task. As agent ${agentName}, describe in detail the steps you would take to accomplish the following task, including collaborations with other agents (like Lyra for data, Sophia for visuals, etc.), the tools you would use, and the expected outcome. Format the response as a narrative of the execution process. Do not ask clarifying questions; provide a plausible, detailed simulation.`;
        const finalSystemInstruction = systemInstruction ? `${systemInstruction}\n\n${baseInstruction}` : baseInstruction;

        const response = await ai.models.generateContent({
            model: model,
            contents: taskPrompt,
            config: {
                systemInstruction: finalSystemInstruction,
            },
        });

        return response.text;

    } catch (error) {
        console.error("Error simulating task execution:", error);
        if (error instanceof Error) {
            return `AI: An error occurred during the simulation. Details: ${error.message}`;
        }
        return "AI: An unknown error occurred during the simulation.";
    }
}
