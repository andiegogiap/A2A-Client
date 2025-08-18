
import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import { marketingVideoWorkflow } from '../constants';
import type { Workflow } from '../types';

export const WorkflowVisualizer: React.FC = () => {
    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const data = yaml.load(marketingVideoWorkflow) as Workflow;
            setWorkflow(data);
        } catch (e) {
            console.error("Error parsing workflow YAML:", e);
            setError("Failed to load and parse workflow data.");
        }
    }, []);

    if (error) {
        return (
          <div className="bg-red-900/70 rounded-lg shadow-lg p-4 mb-6 border border-red-700 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-red-200">Workflow Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
        );
    }

    if (!workflow) {
        return (
          <div className="bg-neutral-900/60 rounded-lg shadow-lg p-4 mb-6 border border-neutral-700 backdrop-blur-md">
            <h2 className="text-2xl font-bold text-primary-400 animate-pulse">Loading Workflow...</h2>
          </div>
        );
    }
    
    return (
        <div className="bg-neutral-900/60 rounded-lg shadow-lg p-6 border border-neutral-700 backdrop-blur-md">
            <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-primary-400 [text-shadow:0_0_8px_theme(colors.primary.500)]">Workflow: {workflow.meta.flow_name}</h2>
                    <p className="text-sm text-neutral-400 mt-1">Owner: {workflow.meta.owner}</p>
                    <p className="text-sm text-neutral-400 mt-1">Trigger: <span className="font-mono bg-neutral-700 px-2 py-1 rounded-full text-xs text-secondary-300">{workflow.schedule.trigger}</span></p>
                </div>
                <p className="text-right text-sm text-neutral-400 max-w-md">{workflow.meta.description}</p>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar pb-4">
                <div className="flex items-center space-x-2 p-2">
                    {workflow.steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="bg-neutral-900/70 backdrop-blur-sm border border-neutral-700 rounded-lg p-4 w-64 flex-shrink-0 hover:border-primary-500 transition-colors duration-300">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-secondary-400 font-bold uppercase">{step.name.replace(/_/g, ' ')}</p>
                                    <span className="text-xs font-mono bg-neutral-800 px-2 py-1 rounded-full text-neutral-300">ID: {step.id}</span>
                                </div>
                                <p className="text-lg font-semibold text-neutral-200 mt-1">{step.agent}</p>
                                <div className="mt-3 pt-2 border-t border-neutral-600 text-xs text-neutral-400 space-y-2">
                                   <p><span className="font-bold text-neutral-300">Input:</span> <span className="font-mono text-primary-400">{step.input}</span></p>
                                   <p><span className="font-bold text-neutral-300">Output:</span> <span className="font-mono text-primary-400">{step.output}</span></p>
                                   <p><span className="font-bold text-neutral-300">Verb:</span> <span className="font-mono bg-secondary-900/50 text-secondary-300 px-1 rounded">{step.verb}</span></p>
                                </div>
                            </div>
                            {index < workflow.steps.length - 1 && (
                                <div className="text-primary-500 text-2xl font-thin px-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};