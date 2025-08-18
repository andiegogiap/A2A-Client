
import React, { useState } from 'react';
import type { ApiKeys } from '../../types';

interface ApiKeysModalProps {
  currentKeys: ApiKeys;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ currentKeys, onClose, onSave }) => {
  const [openaiKey, setOpenaiKey] = useState(currentKeys.openai);
  const [githubToken, setGithubToken] = useState(currentKeys.githubToken);
  const [githubRepo, setGithubRepo] = useState(currentKeys.githubRepo);

  const handleSave = () => {
    onSave({ openai: openaiKey, githubToken, githubRepo });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900/80 backdrop-blur-lg border border-secondary-500/30 rounded-lg shadow-xl w-full max-w-2xl p-6 relative shadow-[0_0_25px_theme(colors.secondary.500)]">
        <h3 className="text-2xl font-bold text-secondary-400 mb-4 [text-shadow:0_0_8px_theme(colors.secondary.500)]">API Key Configuration</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl transition-colors">&times;</button>
        
        <div className="mb-4">
            <p className="text-neutral-400 mb-4">The Gemini API key is managed via environment variables for security. You can configure other service API keys below.</p>
        </div>

        <div className="mb-6">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="openaiApiKey">OpenAI API Key:</label>
          <input
            type="password"
            id="openaiApiKey"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary-500"
            placeholder="Enter your OpenAI API Key"
          />
          <p className="text-xs text-neutral-500 mt-1">This key is stored locally in your browser and is used for the left chat panel.</p>
        </div>

        <div className="mb-6">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="githubToken">GitHub Personal Access Token:</label>
          <input
            type="password"
            id="githubToken"
            value={githubToken}
            onChange={(e) => setGithubToken(e.target.value)}
            className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary-500"
            placeholder="Enter your GitHub PAT"
          />
           <p className="text-xs text-neutral-500 mt-1">Required for the Code tab. Store a token with 'repo' scope.</p>
        </div>

         <div className="mb-6">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="githubRepo">GitHub Repository:</label>
          <input
            type="text"
            id="githubRepo"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary-500"
            placeholder="owner/repository-name"
          />
           <p className="text-xs text-neutral-500 mt-1">The full repository name to browse in the Code tab.</p>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-accent-500 hover:bg-accent-400 text-neutral-950 font-bold py-2 px-4 rounded-md shadow-lg transition duration-200 ease-in-out hover:shadow-[0_0_15px_theme(colors.accent.500)]">
            Save API Keys
          </button>
        </div>
      </div>
    </div>
  );
};