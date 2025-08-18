
import React, { useState } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [userCoordination, setUserCoordination] = useState('manual');
  const [aiCoordination, setAiCoordination] = useState('adaptive');
  const [systemCoordination, setSystemCoordination] = useState('automated');

  const handleSave = () => {
    console.log('Settings Saved:', { userCoordination, aiCoordination, systemCoordination });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900/80 backdrop-blur-lg border border-secondary-500/30 rounded-lg shadow-xl w-full max-w-2xl p-6 relative shadow-[0_0_25px_theme(colors.secondary.500)]">
        <h3 className="text-2xl font-bold text-secondary-400 mb-4 [text-shadow:0_0_8px_theme(colors.secondary.500)]">Coordination Nuance Settings</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl transition-colors">&times;</button>
        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="userCoordination">USER Coordination:</label>
          <select id="userCoordination" value={userCoordination} onChange={(e) => setUserCoordination(e.target.value)} className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary-500">
            <option value="manual">Manual Oversight</option>
            <option value="guided">Guided Interaction</option>
            <option value="autonomous-review">Autonomous with Review</option>
          </select>
          <p className="text-xs text-neutral-500 mt-1">Defines how user input influences agent tasks.</p>
        </div>
        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="aiCoordination">AI Coordination:</label>
          <select id="aiCoordination" value={aiCoordination} onChange={(e) => setAiCoordination(e.target.value)} className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary-500">
            <option value="adaptive">Adaptive Learning</option>
            <option value="rule-based">Rule-Based Execution</option>
            <option value="hybrid">Hybrid Approach</option>
          </select>
          <p className="text-xs text-neutral-500 mt-1">Configures AI's role in task prioritization and execution.</p>
        </div>
        <div className="mb-6">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="systemCoordination">SYSTEM Coordination:</label>
          <select id="systemCoordination" value={systemCoordination} onChange={(e) => setSystemCoordination(e.target.value)} className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary-500">
            <option value="automated">Automated Resource Allocation</option>
            <option value="load-balanced">Load Balanced Distribution</option>
            <option value="failover">Failover Redundancy</option>
          </select>
          <p className="text-xs text-neutral-500 mt-1">Manages system resources and agent deployment.</p>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-accent-500 hover:bg-accent-400 text-neutral-950 font-bold py-2 px-4 rounded-md shadow-lg transition duration-200 ease-in-out hover:shadow-[0_0_15px_theme(colors.accent.500)]">
            Save Nuance Settings
          </button>
        </div>
      </div>
    </div>
  );
};