
import React, { useState, useEffect, useRef } from 'react';
import type { Agent, ChatMessage } from '../types';

interface HintDisplayProps {
    hint: ChatMessage['hint'];
}

const HintDisplay: React.FC<HintDisplayProps> = ({ hint }) => {
    if (!hint) return null;

    return (
        <div className="mt-2 ml-4 border-l-2 border-neutral-700 pl-4 py-2 space-y-3 text-sm">
            <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-primary-300"><strong className="text-primary-200 font-semibold">User Suggestion:</strong> {hint.user}</p>
                <p className="text-accent-300"><strong className="text-accent-200 font-semibold">AI Hint:</strong> {hint.ai}</p>
                <p className="text-pink-300"><strong className="text-pink-200 font-semibold">System Recommendation:</strong> {hint.system}</p>
            </div>
        </div>
    );
};

interface ActiveAgentControlPanelProps {
    agent: Agent;
    messages: ChatMessage[];
    onSendMessage: (input: string, agent: Agent) => Promise<void>;
    onClose: () => void;
    onGenerateHint: () => void;
    onInitiateTask: () => void;
    onConnectAgents: () => void;
}

export const ActiveAgentControlPanel: React.FC<ActiveAgentControlPanelProps> = ({
    agent,
    messages,
    onSendMessage,
    onClose,
    onGenerateHint,
    onInitiateTask,
    onConnectAgents
}) => {
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (input.trim() && !isSending) {
            setIsSending(true);
            const currentInput = input;
            setInput('');
            await onSendMessage(currentInput, agent);
            setIsSending(false);
        }
    };

    const getMessageClasses = (sender: ChatMessage['sender']) => {
        switch (sender) {
            case 'User': return 'bg-primary-500/80 text-white ml-auto';
            case 'AI':
            case 'Agent': return 'bg-neutral-800 text-neutral-200 mr-auto';
            case 'System': return 'bg-secondary-800/80 text-secondary-200 mr-auto text-sm italic';
            default: return 'bg-neutral-800 text-neutral-200 mr-auto';
        }
    };
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-[80vh] bg-neutral-900/60 rounded-lg shadow-md border border-neutral-700 backdrop-blur-md">
            {/* Header */}
            <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary-400 [text-shadow:0_0_8px_theme(colors.primary.500)]">Active Control: {agent.name}</h2>
                <button onClick={onClose} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-md shadow transition duration-200 ease-in-out">
                    Back to Dual View
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex overflow-hidden">
                {/* Chat Area */}
                <div className="flex-grow flex flex-col">
                    <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className="mb-4">
                                <div className={`px-4 py-2 rounded-lg max-w-[90%] ${getMessageClasses(msg.sender)}`}>
                                    <p className="font-semibold mb-1">{msg.sender}:</p>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                {(msg.sender === 'AI' || msg.sender === 'Agent') && <HintDisplay hint={msg.hint} />}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-neutral-700">
                        <textarea
                            className="w-full p-3 border border-neutral-700 bg-neutral-800 text-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 custom-scrollbar"
                            placeholder={`Message ${agent.name}...`}
                            rows={3}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            disabled={isSending}
                        />
                         <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={onGenerateHint} className="bg-transparent border border-secondary-500 text-secondary-400 hover:bg-secondary-500 hover:text-neutral-950 px-4 py-2 rounded-md shadow-md transition duration-200 ease-in-out text-sm">
                                    Generate Hint
                                </button>
                                <button onClick={onInitiateTask} className="bg-transparent border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-neutral-950 px-4 py-2 rounded-md shadow-md transition duration-200 ease-in-out text-sm">
                                    Initiate Task
                                </button>
                                <button onClick={onConnectAgents} className="bg-transparent border border-accent-500 text-accent-400 hover:bg-accent-500 hover:text-neutral-950 px-4 py-2 rounded-md shadow-md transition duration-200 ease-in-out text-sm">
                                    Connect Agents
                                </button>
                            </div>
                            <button onClick={handleSend} className="bg-primary-500 hover:bg-primary-400 text-neutral-950 font-bold px-6 py-2 rounded-lg transition duration-200 ease-in-out shadow-lg hover:shadow-[0_0_15px_theme(colors.primary.500)]" disabled={isSending}>
                                {isSending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};