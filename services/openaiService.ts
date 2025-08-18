
import type { ChatMessage } from "../types";

const OPENAI_API_URL = 'https://api.openai.com/v1';

export const sendMessageToOpenAI = async (prompt: string, history: ChatMessage[], apiKey: string): Promise<string> => {
    if (!apiKey) {
        return "OpenAI API key is not set. Please configure it in the API Keys menu.";
    }

    const messages = history
        .filter(msg => msg.sender === 'User' || msg.sender === 'OpenAI')
        .map(msg => ({
            role: msg.sender === 'User' ? 'user' : 'assistant',
            content: msg.text,
        }));
    
    messages.push({ role: 'user', content: prompt });

    try {
        const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "Sorry, I couldn't get a response.";
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        return `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};


export const generateImageWithOpenAI = async (prompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        return "OpenAI API key is not set. Please configure it in the API Keys menu.";
    }

    try {
        const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: 'b64_json'
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const b64Json = data.data[0]?.b64_json;

        if (b64Json) {
            return `data:image/png;base64,${b64Json}`;
        } else {
            return "Could not retrieve image data.";
        }
    } catch (error) {
        console.error("Error calling OpenAI Image API:", error);
        return `An error occurred while generating the image: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
};
