
import React from 'react';
import type { Agent, CallDirection, WorkflowStep } from '../types';

interface AgentCardProps {
  agent: Agent;
  index: number;
  onConfigure: (agent: Agent) => void;
  isActiveCall: boolean;
  callDirection: CallDirection;
  isChatting: boolean;
  onCardClick: (agent: Agent) => void;
  isWorkflowRunning: boolean;
  currentWorkflowStep: WorkflowStep | null;
}

export const AgentCard: React.FC<AgentCardProps> = ({ 
    agent, 
    index, 
    onConfigure, 
    isActiveCall, 
    callDirection, 
    isChatting,
    onCardClick,
    isWorkflowRunning,
    currentWorkflowStep
}) => {
  const colors = [
    'border-primary-500/50',
    'border-secondary-500/50',
    'border-accent-500/50',
    'border-pink-500/50',
    'border-red-500/50',
  ];
  const borderColorClass = colors[index % colors.length];

  const isExecuting = isWorkflowRunning && currentWorkflowStep?.agent === agent.name;
  const isNextInQueue = isWorkflowRunning && currentWorkflowStep?.handover_to === agent.name;

  const activeCallClass = isActiveCall && !isWorkflowRunning ? 'animate-pulse-border border-primary-400' : '';
  const chattingClass = isChatting && !isWorkflowRunning ? 'ring-2 ring-primary-500 shadow-[0_0_20px_theme(colors.primary.500)]' : '';
  const executingClass = isExecuting ? 'border-pink-500 ring-2 ring-pink-500 shadow-[0_0_20px_theme(colors.pink.500)]' : '';
  const nextInQueueClass = isNextInQueue ? 'animate-pulse-border' : '';

  return (
    <div
      onClick={() => onCardClick(agent)}
      className={`p-4 rounded-lg shadow-md mb-4 border ${borderColorClass} ${activeCallClass} ${chattingClass} ${executingClass} ${nextInQueueClass} bg-neutral-900/60 backdrop-blur-md transition-all duration-300 ease-in-out cursor-pointer hover:border-primary-500 hover:shadow-[0_0_15px_var(--tw-shadow-color)] hover:shadow-primary-500/30`}
    >
      <h3 className="text-xl font-semibold text-neutral-100 mb-2 flex items-center justify-between">
        {agent.name}
        {isActiveCall && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${callDirection === 'incoming' ? 'bg-accent-500 text-neutral-950' : 'bg-red-500 text-white'} animate-flash`}>
            {callDirection === 'incoming' ? 'INCOMING' : 'OUTGOING'}
          </span>
        )}
      </h3>
      <p className="text-sm text-neutral-300 mb-2">{agent.description}</p>
      <div className="flex items-center justify-between text-sm text-neutral-400">
        <span>Status: <span className={`font-medium ${agent.status === 'Online' ? 'text-accent-400' : 'text-red-400'}`}>{agent.status}</span></span>
        <button
          onClick={(e) => {
              e.stopPropagation(); // Prevent the card's onClick from firing
              onConfigure(agent);
          }}
          className="bg-transparent border border-primary-500 text-primary-400 px-3 py-1 rounded-md text-sm transition duration-200 ease-in-out shadow-md hover:bg-primary-500 hover:text-neutral-950"
        >
          Configure
        </button>
      </div>

      {isExecuting && currentWorkflowStep ? (
        <div className="mt-4 pt-3 border-t-2 border-dashed border-pink-500 bg-neutral-900/50 p-3 rounded-lg">
          <h4 className="text-sm font-bold text-pink-400 animate-flash">EXECUTING TASK</h4>
          <p className="text-md font-semibold text-neutral-100 mt-1">{currentWorkflowStep.name.replace(/_/g, ' ')}</p>
          <div className="mt-2 text-xs text-neutral-400 space-y-1 font-mono">
              <p><span className="font-bold text-neutral-300">Verb:</span> <span className="bg-secondary-900/50 text-secondary-300 px-1 rounded">{currentWorkflowStep.verb}</span></p>
              <p><span className="font-bold text-neutral-300">Input:</span> <span className="text-primary-400">{currentWorkflowStep.input}</span></p>
              <p><span className="font-bold text-neutral-300">Output:</span> <span className="text-primary-400">{currentWorkflowStep.output}</span></p>
              {currentWorkflowStep.handover_to && (
                  <p className="mt-2"><span className="font-bold text-neutral-300">Next:</span> <span className="text-pink-400 font-semibold">{currentWorkflowStep.handover_to}</span></p>
              )}
          </div>
        </div>
      ) : agent.config && (
        <div className="mt-3 pt-3 border-t border-neutral-700 text-xs text-neutral-500 space-y-1">
          <p>Multi-modal: {Object.keys(agent.config.multiModalInferences).filter(key => agent.config.multiModalInferences[key as keyof typeof agent.config.multiModalInferences]).map(key => key.charAt(0).toUpperCase() + key.slice(1)).join(', ') || 'None'}</p>
          <p>Binding: {agent.config.bindings.service} @ {agent.config.bindings.domain}</p>
          <p>OpenAI: {agent.openai_binding || 'N/A'}</p>
          <p>Gemini Proxy: {agent.gemini_proxy || 'N/A'}</p>
          <p>Priority: {agent.config.orchestrationPriority}</p>
          {agent.duties && agent.duties.length > 0 && (
            <div className="mt-2">
              <p className="font-bold">Duties:</p>
              <ul className="list-disc list-inside ml-2">
                {agent.duties.map((duty, i) => <li key={i}>{duty}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};