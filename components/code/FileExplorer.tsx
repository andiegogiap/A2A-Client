
import React, { useState } from 'react';
import type { GitHubContent } from '../../types';
import { FileIcon, FolderIcon, ChevronRightIcon, ChevronDownIcon, AddIcon, DeleteIcon } from './icons';

interface FileExplorerProps {
  contents: GitHubContent[];
  currentPath: string;
  onFileSelect: (file: GitHubContent) => void;
  onNavigate: (path: string) => void;
  onCreate: (type: 'file' | 'dir', name: string) => void;
  onDelete: (item: GitHubContent) => void;
  selectedFilePath: string | null;
}

const Breadcrumbs: React.FC<{ path: string; onNavigate: (path: string) => void }> = ({ path, onNavigate }) => {
  const parts = path.split('/').filter(Boolean);
  return (
    <div className="flex items-center text-sm text-neutral-400 mb-2 p-2 bg-neutral-800/50 rounded-md">
      <button onClick={() => onNavigate('')} className="hover:text-primary-400">root</button>
      {parts.map((part, index) => {
        const currentPath = parts.slice(0, index + 1).join('/');
        return (
          <React.Fragment key={currentPath}>
            <span className="mx-1">/</span>
            <button onClick={() => onNavigate(currentPath)} className="hover:text-primary-400">{part}</button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ contents, currentPath, onFileSelect, onNavigate, onCreate, onDelete, selectedFilePath }) => {
  const [isCreating, setIsCreating] = useState<'file' | 'dir' | null>(null);
  const [newName, setNewName] = useState('');

  const handleCreateClick = (type: 'file' | 'dir') => {
    setIsCreating(type);
  };
  
  const handleCreateConfirm = () => {
    if (newName.trim()) {
      onCreate(isCreating!, newName.trim());
      setIsCreating(null);
      setNewName('');
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCreateConfirm();
    if (e.key === 'Escape') {
      setIsCreating(null);
      setNewName('');
    }
  };

  return (
    <div className="bg-neutral-900/60 p-4 rounded-lg shadow-lg border border-neutral-700 backdrop-blur-md h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-primary-400">File Explorer</h3>
        <div className="flex gap-2">
            <button onClick={() => handleCreateClick('file')} title="New File" className="text-neutral-400 hover:text-accent-400"><AddIcon/></button>
            <button onClick={() => handleCreateClick('dir')} title="New Folder" className="text-neutral-400 hover:text-accent-400"><FolderIcon className="w-5 h-5"/></button>
        </div>
      </div>
      <Breadcrumbs path={currentPath} onNavigate={onNavigate} />
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <ul>
          {isCreating && (
            <li className="p-2 flex items-center gap-2">
              {isCreating === 'dir' ? <FolderIcon/> : <FileIcon/>}
              <input 
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyUp={handleKeyUp}
                autoFocus
                className="bg-neutral-700 text-white p-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-accent-500"
                placeholder={`Enter ${isCreating} name...`}
              />
            </li>
          )}
          {contents.map(item => (
            <li key={item.sha} className="group">
              <div
                onClick={() => (item.type === 'dir' ? onNavigate(item.path) : onFileSelect(item))}
                className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${selectedFilePath === item.path ? 'bg-primary-500/20' : 'hover:bg-neutral-800/70'}`}
              >
                {item.type === 'dir' ? <FolderIcon className="text-secondary-400" /> : <FileIcon className="text-primary-400" />}
                <span className="flex-grow truncate">{item.name}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                  className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-pink-500 transition-opacity"
                  title={`Delete ${item.name}`}
                >
                    <DeleteIcon/>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
