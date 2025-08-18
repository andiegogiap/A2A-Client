
import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import type { GitHubContent } from '../../types';
import { LoadingIcon, SaveIcon } from './icons';

(self as any).MonacoEnvironment = {
	getWorker: function (moduleId: any, label: string) {
		if (label === 'json') {
			return new Worker('https://esm.sh/monaco-editor@0.49.0/esm/vs/language/json/json.worker.js', { type: 'module' });
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return new Worker('https://esm.sh/monaco-editor@0.49.0/esm/vs/language/css/css.worker.js', { type: 'module' });
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return new Worker('https://esm.sh/monaco-editor@0.49.0/esm/vs/language/html/html.worker.js', { type: 'module' });
		}
		if (label === 'typescript' || label === 'javascript') {
			return new Worker('https://esm.sh/monaco-editor@0.49.0/esm/vs/language/typescript/ts.worker.js', { type: 'module' });
		}
		return new Worker('https://esm.sh/monaco-editor@0.49.0/esm/vs/editor/editor.worker.js', { type: 'module' });
	}
};


interface MonacoEditorProps {
    file: GitHubContent | null;
    content: string | null;
    onSave: (content: string, commitMessage: string) => void;
}

const getLanguageFromExtension = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'css':
            return 'css';
        case 'html':
            return 'html';
        case 'json':
            return 'json';
        case 'md':
            return 'markdown';
        case 'yaml':
        case 'yml':
            return 'yaml';
        default:
            return 'plaintext';
    }
};

export const MonacoEditor: React.FC<MonacoEditorProps> = ({ file, content, onSave }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const monacoInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [commitMessage, setCommitMessage] = useState('');

    useEffect(() => {
        if (editorRef.current && !monacoInstance.current) {
            monacoInstance.current = monaco.editor.create(editorRef.current, {
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: false },
                readOnly: true,
                fontSize: 14,
            });
        }

        return () => {
            if (monacoInstance.current) {
                monacoInstance.current.dispose();
                monacoInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (monacoInstance.current && file && content !== null) {
            const language = getLanguageFromExtension(file.name);
            const model = monaco.editor.createModel(content, language);
            monacoInstance.current.setModel(model);
            monacoInstance.current.updateOptions({ readOnly: false });
            setCommitMessage(`docs: update ${file.name}`);
        } else if (monacoInstance.current) {
            monacoInstance.current.setModel(null);
            monacoInstance.current.updateOptions({ readOnly: true });
        }
    }, [file, content]);

    const handleSave = () => {
        if(monacoInstance.current && commitMessage.trim()){
            const editorContent = monacoInstance.current.getValue();
            onSave(editorContent, commitMessage.trim());
        }
    }

    return (
        <div className="h-full w-full bg-neutral-900 rounded-lg shadow-lg border border-neutral-700 backdrop-blur-md flex flex-col">
            <div className="flex justify-between items-center p-2 border-b border-neutral-700">
                <span className="text-sm font-medium text-neutral-300 ml-2">{file?.path || "No file selected"}</span>
                {file && content !== null && (
                    <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={commitMessage}
                          onChange={(e) => setCommitMessage(e.target.value)}
                          placeholder="Commit message..."
                          className="bg-neutral-800 border border-neutral-600 text-sm p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-1 bg-accent-600 hover:bg-accent-500 text-white text-sm font-bold py-1 px-3 rounded-md transition-colors"
                            title="Commit Changes"
                        >
                           <SaveIcon /> Commit
                        </button>
                    </div>
                )}
            </div>
            <div ref={editorRef} className="flex-grow">
                {!file && (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                        Select a file to begin editing.
                    </div>
                )}
                 {file && content === null && (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                        <LoadingIcon className="w-8 h-8"/>
                    </div>
                 )}
            </div>
        </div>
    );
};
