
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomInstructionPanelProps {
  initialInstructions: { ai: string; system: string };
  onSave: (instructions: { ai: string; system: string }) => void;
}

const PanelToggleButton: React.FC<{ onClick: () => void, isOpen: boolean }> = ({ onClick, isOpen }) => (
    <motion.button
        onClick={onClick}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-[60] bg-neutral-900/80 backdrop-blur-md text-primary-400 p-3 rounded-l-lg border-l border-t border-b border-primary-500/50 shadow-lg hover:bg-primary-500 hover:text-neutral-950 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle custom instructions panel"
        animate={{ x: isOpen ? -512 : 0 }} // 32rem is 512px
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    </motion.button>
);


export const CustomInstructionPanel: React.FC<CustomInstructionPanelProps> = ({ initialInstructions, onSave }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [aiInstruction, setAiInstruction] = useState(initialInstructions.ai);
    const [systemInstruction, setSystemInstruction] = useState(initialInstructions.system);
    
    useEffect(() => {
        setAiInstruction(initialInstructions.ai);
        setSystemInstruction(initialInstructions.system);
    }, [initialInstructions, isOpen]); // Reset on open if initial props change

    const handleSave = () => {
        onSave({ ai: aiInstruction, system: systemInstruction });
        setIsOpen(false);
    };

    const handleClose = () => {
        setIsOpen(false);
    }

    return (
        <>
            <PanelToggleButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen} />
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleClose}
                        />
                        <motion.div
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-neutral-900/80 backdrop-blur-lg border-l-2 border-primary-500/50 shadow-2xl z-50 flex flex-col p-6"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ ease: "easeInOut", duration: 0.3 }}
                        >
                            <h2 className="text-2xl font-bold text-primary-400 [text-shadow:0_0_8px_theme(colors.primary.500)] mb-4">Custom Instructions</h2>
                            <div className="flex-grow flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                                <div>
                                    <label htmlFor="ai-instruction" className="block text-secondary-300 text-lg font-semibold mb-2">AI Supervisor Instruction</label>
                                    <p className="text-sm text-neutral-400 mb-2">Guides the personality and direct responses of individual AI agents during chats.</p>
                                    <textarea
                                        id="ai-instruction"
                                        rows={10}
                                        value={aiInstruction}
                                        onChange={(e) => setAiInstruction(e.target.value)}
                                        className="w-full p-3 bg-neutral-950 text-neutral-200 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 font-mono text-sm custom-scrollbar"
                                        placeholder="Define how the AI agents should behave..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="system-instruction" className="block text-accent-300 text-lg font-semibold mb-2">System Orchestrator Instruction</label>
                                    <p className="text-sm text-neutral-400 mb-2">Sets the high-level strategy for the orchestration engine, influencing hints, simulations, and workflows.</p>
                                    <textarea
                                        id="system-instruction"
                                        rows={10}
                                        value={systemInstruction}
                                        onChange={(e) => setSystemInstruction(e.target.value)}
                                        className="w-full p-3 bg-neutral-950 text-neutral-200 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono text-sm custom-scrollbar"
                                        placeholder="Define the overarching strategy for the system..."
                                    />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-neutral-700 flex justify-end gap-4">
                               <button onClick={handleClose} className="px-4 py-2 rounded-md shadow transition duration-200 ease-in-out bg-transparent border border-neutral-500 text-neutral-300 hover:bg-neutral-700">
                                    Cancel
                               </button>
                               <button onClick={handleSave} className="bg-accent-500 hover:bg-accent-400 text-neutral-950 font-bold py-2 px-4 rounded-md shadow-lg transition duration-200 ease-in-out hover:shadow-[0_0_15px_theme(colors.accent.500)]">
                                    Apply Instructions
                               </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
