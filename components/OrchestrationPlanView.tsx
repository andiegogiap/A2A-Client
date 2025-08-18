
import React from 'react';
import { planData } from '../orchestration-data';

const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start py-1">
        <svg className="h-5 w-5 text-primary-400 mr-3 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>{children}</span>
    </li>
);

export const OrchestrationPlanView: React.FC = () => {
    return (
        <div className="custom-scrollbar overflow-y-auto max-h-[70vh] p-1">
            <h2 className="text-3xl font-extrabold text-primary-400 mb-6 pb-4 border-b-2 border-neutral-700 [text-shadow:0_0_10px_theme(colors.primary.500)]">{planData.title}</h2>
            {planData.sections.map((section, index) => (
                <div key={index} className="bg-neutral-900/40 rounded-lg p-6 mb-6 border border-neutral-700 shadow-lg">
                    <h3 className="text-2xl font-bold text-secondary-300 mb-4">{section.title}</h3>
                    {section.content?.map((p, i) => <p key={i} className="mb-3 text-neutral-300 leading-relaxed">{p}</p>)}
                    {section.list && (
                        <ul className="space-y-3 mt-4 text-neutral-300">
                            {section.list.map((item, i) => <ListItem key={i}>{item}</ListItem>)}
                        </ul>
                    )}
                    {section.subSections?.map((sub, i) => (
                        <div key={i} className="mt-6 pl-4 border-l-2 border-neutral-600/70">
                             <h4 className="text-xl font-semibold text-accent-300 mb-3">{sub.title}</h4>
                             {sub.content?.map((p, j) => <p key={j} className="mb-2 text-neutral-400">{p}</p>)}
                             {sub.list && (
                                <ul className="space-y-2 mt-3 text-neutral-400">
                                    {sub.list.map((item, k) => <li key={k} className="flex items-start"><span className="text-neutral-500 mr-3">–</span><span>{item}</span></li>)}
                                </ul>
                             )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};