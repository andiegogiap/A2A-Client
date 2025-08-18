
import React, { useState } from 'react';

interface TaskPromptModalProps {
  title: string;
  promptLabel: string;
  onClose: () => void;
  onSubmit: (inputText: string) => void;
}

export const TaskPromptModal: React.FC<TaskPromptModalProps> = ({ title, promptLabel, onClose, onSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900/80 backdrop-blur-lg border border-pink-500/30 rounded-lg shadow-xl w-full max-w-2xl p-6 relative shadow-[0_0_25px_theme(colors.pink.500)]">
        <h3 className="text-2xl font-bold text-pink-400 mb-4 [text-shadow:0_0_8px_theme(colors.pink.500)]">{title}</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl transition-colors">&times;</button>
        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="taskInput">{promptLabel}</label>
          <textarea
            id="taskInput"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-pink-500 h-24 custom-scrollbar"
            placeholder="Enter details here..."
          />
        </div>
        <div className="flex justify-end">
          <button onClick={handleSubmit} className="bg-accent-500 hover:bg-accent-400 text-neutral-950 font-bold py-2 px-4 rounded-md shadow-lg transition duration-200 ease-in-out hover:shadow-[0_0_15px_theme(colors.accent.500)]">
            Initiate
          </button>
        </div>
      </div>
    </div>
  );
};