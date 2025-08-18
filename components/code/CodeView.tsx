
import React, { useState, useEffect, useCallback } from 'react';
import type { ApiKeys, GitHubContent, Command, Agent } from '../../types';
import * as githubService from '../../services/githubService';
import { FileExplorer } from './FileExplorer';
import { MonacoEditor } from './MonacoEditor';
import { LoadingIcon } from './icons';

interface CodeViewProps {
  apiKeys: ApiKeys;
  addXtermCommand: (command: Omit<Command, 'missionId'>) => void;
  supervisorAgent: Agent;
}

const SupervisorCard: React.FC<{ agent: Agent }> = ({ agent }) => (
    <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></div>
        <div className="text-sm">
            <p className="font-bold text-accent-300">Supervisor: {agent.name}</p>
            <p className="text-xs text-neutral-400">Status: Monitoring Code Operations</p>
        </div>
    </div>
);


export const CodeView: React.FC<CodeViewProps> = ({ apiKeys, addXtermCommand, supervisorAgent }) => {
  const [contents, setContents] = useState<GitHubContent[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedFile, setSelectedFile] = useState<GitHubContent | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileSha, setFileSha] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logToXterm = useCallback((type: Command['type'], text: string) => {
    addXtermCommand({ type, text });
  }, [addXtermCommand]);

  const loadContents = useCallback(async (path: string) => {
    setIsLoading(true);
    setError(null);
    try {
      logToXterm('github', `Fetching contents for path: '${path || "./"}'`);
      const data = await githubService.getRepoContents(apiKeys, path);
      setContents(data);
      logToXterm('github', `Success: Loaded ${data.length} items.`);
    } catch (e: any) {
      setError(e.message);
      logToXterm('error', `GitHub Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [apiKeys, logToXterm]);

  useEffect(() => {
    if (apiKeys.githubToken && apiKeys.githubRepo) {
      loadContents(currentPath);
    }
  }, [apiKeys, currentPath, loadContents]);

  const handleFileSelect = async (file: GitHubContent) => {
    setIsLoading(true);
    setError(null);
    setSelectedFile(file);
    setFileContent(null);
    try {
      logToXterm('github', `Fetching content for: ${file.path}`);
      const { content, sha } = await githubService.getFileContent(apiKeys, file.path);
      setFileContent(content);
      setFileSha(sha);
      logToXterm('github', `Success: Loaded file ${file.path}.`);
    } catch (e: any) {
      setError(e.message);
      logToXterm('error', `GitHub Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setSelectedFile(null);
    setFileContent(null);
    setCurrentPath(path);
  };

  const handleSaveFile = async (newContent: string, commitMessage: string) => {
    if (!selectedFile) return;
    setIsLoading(true);
    try {
      logToXterm('github', `Saving file: ${selectedFile.path}`);
      await githubService.createOrUpdateFile(apiKeys, selectedFile.path, newContent, commitMessage, fileSha);
      setFileContent(newContent);
      logToXterm('system', `Successfully committed: "${commitMessage}"`);
      await loadContents(currentPath); // Refresh to get new SHA
      // Re-fetch file content to get the new sha for subsequent saves
      const { sha } = await githubService.getFileContent(apiKeys, selectedFile.path);
      setFileSha(sha);
    } catch (e: any) {
      setError(e.message);
      logToXterm('error', `GitHub Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (type: 'file' | 'dir', name: string) => {
      const newPath = currentPath ? `${currentPath}/${name}` : name;
      setIsLoading(true);
      try {
        const content = type === 'dir' ? '' : '/* New file created by A2A Dashboard */';
        const finalPath = type === 'dir' ? `${newPath}/.gitkeep` : newPath;
        logToXterm('github', `Creating ${type}: ${finalPath}`);
        await githubService.createOrUpdateFile(apiKeys, finalPath, content, `feat: create ${type} ${name}`);
        logToXterm('system', `Successfully created ${type}: ${name}`);
        await loadContents(currentPath);
      } catch (e: any) {
        logToXterm('error', `GitHub Error: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
  };

  const handleDelete = async (item: GitHubContent) => {
      if (!confirm(`Are you sure you want to delete '${item.name}'? This cannot be undone.`)) return;
      setIsLoading(true);
      try {
        logToXterm('github', `Deleting: ${item.path}`);
        await githubService.deleteFile(apiKeys, item.path, `chore: delete ${item.type} ${item.name}`, item.sha);
        logToXterm('system', `Successfully deleted ${item.path}`);
        if(selectedFile?.path === item.path) {
            setSelectedFile(null);
            setFileContent(null);
        }
        await loadContents(currentPath);
      } catch (e: any) {
        logToXterm('error', `GitHub Error: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
  };

  if (!apiKeys.githubToken || !apiKeys.githubRepo) {
    return (
      <div className="text-center p-8 bg-neutral-800/50 rounded-lg">
        <h3 className="text-xl font-bold text-secondary-400">GitHub Integration Not Configured</h3>
        <p className="text-neutral-300 mt-2">Please set your GitHub Personal Access Token and Repository in the 'API Keys' menu to use this feature.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[75vh]">
        {isLoading && (
            <div className="absolute inset-0 bg-neutral-950/50 flex items-center justify-center z-50">
                <LoadingIcon className="w-12 h-12 text-primary-500" />
            </div>
        )}
      <div className="md:w-1/3 flex flex-col gap-4">
        {supervisorAgent && <SupervisorCard agent={supervisorAgent} />}
        <FileExplorer
          contents={contents}
          currentPath={currentPath}
          onFileSelect={handleFileSelect}
          onNavigate={handleNavigate}
          onCreate={handleCreate}
          onDelete={handleDelete}
          selectedFilePath={selectedFile?.path || null}
        />
      </div>
      <div className="md:w-2/3">
        <MonacoEditor
          file={selectedFile}
          content={fileContent}
          onSave={handleSaveFile}
        />
      </div>
    </div>
  );
};
