
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { CopyButton } from './CopyButton';

interface MessageDisplayProps {
  messages: ChatMessage[];
  title: string;
  onDelegate?: (message: ChatMessage) => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ messages, title, onDelegate }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getMessageClasses = (sender: ChatMessage['sender']) => {
        switch (sender) {
            case 'User': return 'bg-primary-500/80 text-white ml-auto';
            case 'AI': return 'bg-neutral-800 text-neutral-200 mr-auto';
            case 'System': return 'bg-secondary-800/80 text-secondary-200 mr-auto text-sm italic';
            case 'Agent': return 'bg-accent-800/80 text-accent-100 mr-auto text-sm';
            case 'OpenAI': return 'bg-neutral-800 text-neutral-200 mr-auto';
            default: return 'bg-neutral-800 text-neutral-200 mr-auto';
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    return (
        <div className="flex flex-col h-full bg-neutral-900/50">
            <h2 className="text-xl font-bold text-center py-2 border-b border-neutral-700 text-primary-400">{title}</h2>
            <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className="mb-4 flex items-start">
                        <div className={`relative group px-4 py-2 rounded-lg max-w-[90%] ${getMessageClasses(msg.sender)}`}>
                            <CopyButton textToCopy={msg.text} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"/>
                            <p className="font-semibold mb-1">{msg.sender}:</p>
                            {msg.imageUrl ? (
                                <div>
                                    <p className="whitespace-pre-wrap mb-2">{msg.text}</p>
                                    <img src={msg.imageUrl} alt={msg.text} className="rounded-lg max-w-full h-auto mt-2" />
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            )}
                            {msg.sender === 'OpenAI' && onDelegate && msg.text && (
                                <button
                                    onClick={() => onDelegate(msg)}
                                    className="mt-2 bg-secondary-500 hover:bg-secondary-400 text-neutral-950 px-3 py-1 text-xs rounded-md shadow"
                                >
                                    Delegate to Agent
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

interface DualChatViewProps {
  openaiMessages: ChatMessage[];
  geminiMessages: ChatMessage[];
  onSendMessage: (prompt: string) => Promise<void>;
  onDelegate: (message: ChatMessage) => void;
}

export const DualChatView: React.FC<DualChatViewProps> = ({ openaiMessages, geminiMessages, onSendMessage, onDelegate }) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (input.trim() && !isSending) {
      setIsSending(true);
      const currentInput = input;
      setInput('');
      await onSendMessage(currentInput);
      setIsSending(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 rounded-lg shadow-lg border border-neutral-700 backdrop-blur-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-neutral-700 overflow-hidden rounded-lg">
            <MessageDisplay messages={openaiMessages} title="OpenAI (GPT-4o)" onDelegate={onDelegate} />
            <MessageDisplay messages={geminiMessages} title="Gemini (Flash)" />
        </div>
        <div className="p-4 border-t border-neutral-700">
            <textarea
                className="w-full p-3 border border-neutral-700 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 custom-scrollbar"
                placeholder="Message Gemini, or use /imagine or /openai to use the other model..."
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                disabled={isSending}
            />
            <div className="mt-2 flex justify-end">
                <button
                    onClick={handleSend}
                    className="bg-primary-500 hover:bg-primary-400 text-neutral-950 font-bold px-6 py-2 rounded-lg transition duration-200 ease-in-out shadow-lg hover:shadow-[0_0_15px_theme(colors.primary.500)]"
                    disabled={isSending || !input.trim()}
                >
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
    </div>
  );
};