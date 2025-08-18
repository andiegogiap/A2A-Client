
import React, { useState } from 'react';

interface CreateMissionModalProps {
  onClose: () => void;
  onCreate: (name: string, objective: string) => void;
}

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');

  const handleSubmit = () => {
    if (name.trim() && objective.trim()) {
      onCreate(name, objective);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900/80 backdrop-blur-lg border border-accent-500/30 rounded-lg shadow-xl w-full max-w-2xl p-6 relative shadow-[0_0_25px_theme(colors.accent.500)]">
        <h3 className="text-2xl font-bold text-accent-400 mb-4 [text-shadow:0_0_8px_theme(colors.accent.500)]">Create New Mission</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl transition-colors">&times;</button>
        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="missionName">Mission Name</label>
          <input
            id="missionName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-accent-500"
            placeholder="e.g., Q3 Marketing Video Campaign"
          />
        </div>
        <div className="mb-6">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="missionObjective">Mission Objective</label>
          <textarea
            id="missionObjective"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-accent-500 h-24 custom-scrollbar"
            placeholder="Describe the overall goal of this mission..."
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !objective.trim()}
            className="bg-accent-500 hover:bg-accent-400 text-neutral-950 font-bold py-2 px-4 rounded-md shadow-lg transition duration-200 ease-in-out disabled:bg-neutral-600 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-[0_0_15px_theme(colors.accent.500)]"
          >
            Create Mission
          </button>
        </div>
      </div>
    </div>
  );
};