
import React, { useState, useEffect, useRef } from 'react';
import type { Agent, Command, FileSystem } from '../types';

interface XtermPanelProps {
  agents: Agent[];
  chattingWithAgentId: string | null;
  commands: Command[];
  onCommand: (commandText: string) => void;
}

export const XtermPanel: React.FC<XtermPanelProps> = ({ agents, chattingWithAgentId, commands, onCommand }) => {
  const [input, setInput] = useState('');
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [commands]);

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      onCommand(input.trim());
      setInput('');
    }
  };
  
  const getCommandColor = (type: Command['type']) => {
    switch (type) {
      case 'input': return 'text-secondary-400';
      case 'system': return 'text-pink-400';
      case 'agent': return 'text-accent-400';
      case 'ai': return 'text-primary-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-neutral-300';
      case 'github': return 'text-purple-400';
      default: return 'text-neutral-200';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-700">
        <h2 className="text-2xl font-bold text-accent-400 [text-shadow:0_0_8px_theme(colors.accent.500)]">Xterm Control (Orchestration)</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto font-mono text-sm custom-scrollbar">
        <p className="text-accent-300 mb-1">Welcome to the Agent Orchestration Console.</p>
        <p className="text-neutral-400 mb-1">Type 'help' for available commands.</p>
        {commands.map((cmd, index) => (
          <p key={index} className={`${getCommandColor(cmd.type)} whitespace-pre-wrap`}>{cmd.text}</p>
        ))}
        <div ref={consoleEndRef} />
      </div>
      <div className="p-4 border-t border-neutral-700">
        <input type="text" className="w-full p-3 bg-neutral-900 text-accent-300 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono" placeholder="Enter command..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleCommand} />
      </div>
    </div>
  );
};