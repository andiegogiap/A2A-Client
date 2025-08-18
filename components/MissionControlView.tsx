
import React from 'react';
import type { Mission } from '../types';

interface MissionControlViewProps {
  missions: Mission[];
  activeMissionId: string | null;
  onSelectMission: (mission: Mission) => void;
  onCreateMission: () => void;
}

export const MissionControlView: React.FC<MissionControlViewProps> = ({ missions, activeMissionId, onSelectMission, onCreateMission }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary-400">Mission Control</h2>
        <button
          onClick={onCreateMission}
          className="bg-accent-500 hover:bg-accent-400 text-neutral-950 font-bold py-2 px-4 rounded-md shadow-lg transition duration-200 ease-in-out hover:shadow-[0_0_15px_theme(colors.accent.500)]"
        >
          Create New Mission
        </button>
      </div>
      <div className="space-y-4">
        {missions.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">No missions found. Create one to get started.</p>
        ) : (
            missions.map(mission => (
                <div
                  key={mission.id}
                  onClick={() => onSelectMission(mission)}
                  className={`p-4 rounded-lg shadow-md border cursor-pointer transition-all duration-200 ${
                    activeMissionId === mission.id
                      ? 'bg-primary-500/20 border-primary-500 ring-2 ring-primary-500 shadow-[0_0_15px_theme(colors.primary.500)]'
                      : 'bg-neutral-900/60 backdrop-blur-md border-neutral-700 hover:border-primary-600'
                  }`}
                >
                  <h3 className="text-xl font-semibold text-neutral-100">{mission.name}</h3>
                  <p className="text-sm text-neutral-300 mt-1">{mission.objective}</p>
                  <p className="text-xs text-neutral-500 mt-2">Created: {new Date(mission.createdAt).toLocaleString()}</p>
                </div>
            ))
        )}
      </div>
    </div>
  );
};