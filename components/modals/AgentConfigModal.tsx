
import React, { useState, useEffect } from 'react';
import type { Agent } from '../../types';

interface AgentConfigModalProps {
  agent: Agent;
  onClose: () => void;
  onSave: (id: string, updatedAgent: Agent) => void;
}

export const AgentConfigModal: React.FC<AgentConfigModalProps> = ({ agent, onClose, onSave }) => {
  const [config, setConfig] = useState(() => {
    return {
      multiModalInferences: agent.config.multiModalInferences,
      bindings: {
        ...agent.config.bindings,
        openai_binding: agent.openai_binding,
        gemini_proxy: agent.gemini_proxy,
      },
      orchestrationPriority: agent.config.orchestrationPriority,
    };
  });
  const [duties, setDuties] = useState<string[]>(agent.duties || []);

  useEffect(() => {
    setConfig({
      multiModalInferences: agent.config.multiModalInferences,
      bindings: {
        ...agent.config.bindings,
        openai_binding: agent.openai_binding,
        gemini_proxy: agent.gemini_proxy,
      },
      orchestrationPriority: agent.config.orchestrationPriority,
    });
    setDuties(agent.duties || []);
  }, [agent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setConfig(prevConfig => ({
        ...prevConfig,
        [parent]: {
          ...(prevConfig as any)[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setConfig(prevConfig => ({
        ...prevConfig,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleDutiesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDuties(e.target.value.split('\n').map(d => d.trim()).filter(d => d !== ''));
  };

  const handleSave = () => {
    onSave(agent.id, {
      ...agent,
      config: {
          ...config,
          bindings: {
              ...config.bindings
          }
      },
      openai_binding: config.bindings.openai_binding,
      gemini_proxy: config.bindings.gemini_proxy,
      duties: duties,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-neutral-950 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900/80 backdrop-blur-lg border border-primary-500/30 rounded-lg shadow-xl w-full max-w-2xl p-6 relative custom-scrollbar overflow-y-auto max-h-[90vh] shadow-[0_0_25px_theme(colors.primary.500)]">
        <h3 className="text-2xl font-bold text-primary-400 mb-4 [text-shadow:0_0_8px_theme(colors.primary.500)]">Configure {agent.name}</h3>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl transition-colors">&times;</button>

        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2">Multi-Modal Inferences:</label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center text-neutral-200">
              <input type="checkbox" name="multiModalInferences.text" checked={config.multiModalInferences.text} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary-500 rounded bg-neutral-800 border-neutral-600 focus:ring-primary-500" />
              <span className="ml-2">Text</span>
            </label>
            <label className="inline-flex items-center text-neutral-200">
              <input type="checkbox" name="multiModalInferences.image" checked={config.multiModalInferences.image} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary-500 rounded bg-neutral-800 border-neutral-600 focus:ring-primary-500" />
              <span className="ml-2">Image</span>
            </label>
            <label className="inline-flex items-center text-neutral-200">
              <input type="checkbox" name="multiModalInferences.audio" checked={config.multiModalInferences.audio} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary-500 rounded bg-neutral-800 border-neutral-600 focus:ring-primary-500" />
              <span className="ml-2">Audio</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="bindingDomain">Agent Binding Domain:</label>
          <select id="bindingDomain" name="bindings.domain" value={config.bindings.domain} onChange={handleChange} className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500">
            <option value="ai-intel.info">ai-intel.info (Server Protocol)</option>
            <option value="andiegogiap.com">andiegogiap.com (User Service)</option>
            <option value="local">Local Service</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="bindingService">Agent Binding Service:</label>
          <input type="text" id="bindingService" name="bindings.service" value={config.bindings.service} onChange={handleChange} className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500" placeholder="e.g., data-processing-api" />
        </div>

        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="openaiBinding">OpenAI Binding:</label>
          <input type="text" id="openaiBinding" name="bindings.openai_binding" value={config.bindings.openai_binding} onChange={handleChange} className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500" placeholder="e.g., asst_alpha_openai" />
        </div>

        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="geminiProxy">Gemini Proxy:</label>
          <input type="text" id="geminiProxy" name="bindings.gemini_proxy" value={config.bindings.gemini_proxy} onChange={handleChange} className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500" placeholder="e.g., orchestrator" />
        </div>

        <div className="mb-4">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="duties">Agent Duties (one per line):</label>
          <textarea id="duties" name="duties" value={duties.join('\n')} onChange={handleDutiesChange} rows={4} className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500 custom-scrollbar" placeholder="e.g., System bootstrap/initiation"></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-neutral-300 text-sm font-bold mb-2" htmlFor="orchestrationPriority">Orchestration Priority:</label>
          <input type="number" id="orchestrationPriority" name="orchestrationPriority" value={config.orchestrationPriority} onChange={handleChange} min="1" max="10" className="shadow appearance-none border border-neutral-600 rounded w-full py-2 px-3 bg-neutral-800 text-neutral-100 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary-500" />
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-accent-500 hover:bg-accent-400 text-neutral-950 font-bold py-2 px-4 rounded-md shadow-lg transition duration-200 ease-in-out hover:shadow-[0_0_15px_theme(colors.accent.500)]">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};