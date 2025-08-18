
import React, { useState, useEffect, useRef } from 'react';
import yaml from 'js-yaml';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentCard } from './components/AgentCard';
import { XtermPanel } from './components/XtermPanel';
import { AgentConfigModal } from './components/modals/AgentConfigModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ApiKeysModal } from './components/modals/ApiKeysModal';
import { DualChatView } from './components/DualChatView';
import { ActiveAgentControlPanel } from './components/ActiveAgentControlPanel';
import { TaskPromptModal } from './components/modals/TaskPromptModal';
import { WorkflowVisualizer } from './components/WorkflowVisualizer';
import { MissionControlView } from './components/MissionControlView';
import { CreateMissionModal } from './components/modals/CreateMissionModal';
import { OrchestrationPlanView } from './components/OrchestrationPlanView';
import { CodeView } from './components/code/CodeView';
import { CustomInstructionPanel } from './components/CustomInstructionPanel';
import type { Agent, CallDirection, ChatMessage, ApiKeys, Workflow, WorkflowStep, Hint, Mission, Command, FileSystem, CustomInstructions } from './types';
import { defaultAgents, marketingVideoWorkflow, AGENTS_STORE, SETTINGS_STORE, CHAT_MESSAGES_STORE, MISSIONS_STORE, defaultAiInstruction, defaultSystemInstruction } from './constants';
import { getAllData, putData, getData, getDataByIndex } from './services/db';
import { sendMessageToGemini, generateContextualHints, simulateTaskExecution } from './services/geminiService';
import { sendMessageToOpenAI, generateImageWithOpenAI } from './services/openaiService';

const AGENTS_PER_PAGE = 2;

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showAgentConfigModal, setShowAgentConfigModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showApiKeysModal, setShowApiKeysModal] = useState(false);
  const [isDBLoaded, setIsDBLoaded] = useState(false);
  const [activeCallAgentId, setActiveCallAgentId] = useState<string | null>(null);
  const [callDirection, setCallDirection] = useState<CallDirection>(null);
  const [chattingWithAgentId, setChattingWithAgentId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({ openai: '', githubToken: '', githubRepo: '' });
  
  const [openaiMessages, setOpenaiMessages] = useState<ChatMessage[]>([]);
  const [geminiMessages, setGeminiMessages] = useState<ChatMessage[]>([]);
  const [xtermCommands, setXtermCommands] = useState<Command[]>([]);
  const [fileSystem, setFileSystem] = useState<FileSystem>({
      'welcome.txt': 'Welcome to the A2A simulated file system! Try the `ls` command.',
      'readme.md': '# A2A Commands\n\n- `ls`: list files\n- `cat <file>`: view file\n- `touch <file>`: create file\n- `rm <file>`: delete file'
  });
  
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [showCreateMissionModal, setShowCreateMissionModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<WorkflowStep | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalConfig, setTaskModalConfig] = useState({ title: '', promptLabel: '', onSubmit: (text: string) => {} });
  const [activeTab, setActiveTab] = useState<'orchestration' | 'missions' | 'core' | 'workflow' | 'code'>('orchestration');
  const [showFooter, setShowFooter] = useState(false);
  const [customInstructions, setCustomInstructions] = useState<Omit<CustomInstructions, 'name'>>({ 
    ai: defaultAiInstruction, 
    system: defaultSystemInstruction 
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [storedAgents, storedKeys, storedMissions, storedInstructions] = await Promise.all([
            getAllData<Agent>(AGENTS_STORE),
            getData<ApiKeys>(SETTINGS_STORE, 'apiKeys'),
            getAllData<Mission>(MISSIONS_STORE),
            getData<CustomInstructions>(SETTINGS_STORE, 'customInstructions')
        ]);
        
        if (storedAgents && storedAgents.length > 0) setAgents(storedAgents);
        else {
          setAgents(defaultAgents);
          await Promise.all(defaultAgents.map(agent => putData(AGENTS_STORE, agent)));
        }
        
        if (storedKeys) setApiKeys(storedKeys);
        if (storedInstructions) {
            const { name, ...instructions } = storedInstructions;
            setCustomInstructions(instructions);
        }
        setMissions(storedMissions || []);

        if (storedMissions.length > 0 && !activeMissionId) {
            handleSelectMission(storedMissions[0]);
        }

      } catch (error) {
        console.error("Failed to load initial data from IndexedDB:", error);
        setAgents(defaultAgents);
      } finally {
        setIsDBLoaded(true);
      }
    };
    loadInitialData();
  }, []);
  
  const addXtermCommand = (command: Omit<Command, 'missionId'>) => {
    const newCommand: Command = { ...command, missionId: activeMissionId };
    setXtermCommands(prev => [...prev, newCommand]);
  };

  const addGeminiMessage = (message: Omit<ChatMessage, 'id' | 'missionId'>): ChatMessage => {
    const newMessage: ChatMessage = { ...message, id: Date.now(), missionId: activeMissionId };
    setGeminiMessages(prev => [...prev, newMessage]);
    putData(CHAT_MESSAGES_STORE, newMessage).catch(console.error);
    return newMessage;
  };
  
  const updateGeminiMessage = (id: number, updates: Partial<ChatMessage>) => {
    setGeminiMessages(prev => prev.map(msg => {
        if (msg.id === id) {
            const updatedMsg = { ...msg, ...updates };
            putData(CHAT_MESSAGES_STORE, updatedMsg).catch(console.error);
            return updatedMsg;
        }
        return msg;
    }));
  };

  useEffect(() => {
    if (isDBLoaded) {
      Promise.all(agents.map(agent => putData(AGENTS_STORE, agent))).catch(error => console.error("Failed to save agents to IndexedDB:", error));
    }
  }, [agents, isDBLoaded]);
  
  useEffect(() => {
    if(isDBLoaded) {
      putData(SETTINGS_STORE, { name: 'apiKeys', ...apiKeys }).catch(console.error);
    }
  }, [apiKeys, isDBLoaded]);

  useEffect(() => {
    if (isDBLoaded) {
      Promise.all(missions.map(mission => putData(MISSIONS_STORE, mission))).catch(error => console.error("Failed to save missions to IndexedDB:", error));
    }
  }, [missions, isDBLoaded]);

  useEffect(() => {
    if(isDBLoaded) {
        putData(SETTINGS_STORE, { name: 'customInstructions', ...customInstructions }).catch(console.error);
    }
  }, [customInstructions, isDBLoaded]);
  
  const addOpenaiMessage = (message: Omit<ChatMessage, 'id' | 'missionId'>) => {
    setOpenaiMessages(prev => [...prev, { ...message, id: Date.now(), missionId: null }]);
  };

  const handleOpenAgentConfig = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowAgentConfigModal(true);
  };

  const handleSaveAgentConfig = (id: string, updatedAgent: Agent) => {
    setAgents(prevAgents =>
      prevAgents.map(agent => (agent.id === id ? updatedAgent : agent))
    );
  };
  
  const handleSaveApiKeys = (keys: ApiKeys) => {
    setApiKeys(keys);
  };

  const handleSaveInstructions = (instructions: Omit<CustomInstructions, 'name'>) => {
    setCustomInstructions(instructions);
  };

  const handleAgentCardClick = (agent: Agent) => {
    if (!activeMissionId) {
        addGeminiMessage({ sender: 'System', text: 'Please select or create a mission before starting a conversation.'});
        setActiveTab('missions');
        return;
    }
    setChattingWithAgentId(agent.id);
    setSelectedAgent(agent);
    addGeminiMessage({
        sender: 'System',
        text: `Conversation started with ${agent.name}.`
    });
    
    setTimeout(async () => {
        const introMessage = `Hello! I am ${agent.name}. ${agent.description}. How may I help you today?`;
        const newMsg = addGeminiMessage({ sender: 'Agent', text: introMessage });
        const hints = await generateContextualHints(geminiMessages, agent.name, introMessage, customInstructions.system);
        if (hints) {
          updateGeminiMessage(newMsg.id, { hint: hints });
        }
    }, 300);
  };

  const handleSendMessage = async (input: string, agent?: Agent) => {
      const currentAgent = agent || agents.find(a => a.id === chattingWithAgentId);
      
      if (!activeMissionId && !input.startsWith('/openai') && !input.startsWith('/imagine')) {
          addGeminiMessage({ sender: 'System', text: 'Please select or create a mission before sending a message.'});
          setActiveTab('missions');
          return;
      }

      if (input.startsWith('/openai ')) {
          const prompt = input.substring(8).trim();
          addOpenaiMessage({ sender: 'User', text: prompt });
          const response = await sendMessageToOpenAI(prompt, openaiMessages, apiKeys.openai);
          addOpenaiMessage({ sender: 'OpenAI', text: response });
      } else if (input.startsWith('/imagine ')) {
          const prompt = input.substring(9).trim();
          addOpenaiMessage({ sender: 'User', text: `/imagine ${prompt}`});
          const loadingId = Date.now();
          setOpenaiMessages(prev => [...prev, { id: loadingId, sender: 'OpenAI', text: 'Generating image...', isDelegating: true, missionId: null }]);
          const imageUrl = await generateImageWithOpenAI(prompt, apiKeys.openai);
          setOpenaiMessages(prev => prev.filter(m => m.id !== loadingId));
          if(imageUrl.startsWith('data:image')) {
            addOpenaiMessage({ sender: 'OpenAI', text: `Image generated for: "${prompt}"`, imageUrl });
          } else {
            addOpenaiMessage({ sender: 'OpenAI', text: imageUrl });
          }
      } else {
          addGeminiMessage({ sender: 'User', text: input });
          const responseText = await sendMessageToGemini(input, geminiMessages, customInstructions.ai);
          const newMsg = addGeminiMessage({ sender: currentAgent ? 'Agent' : 'AI', text: responseText });

          if (currentAgent) {
              const hints = await generateContextualHints(geminiMessages, currentAgent.name, responseText, customInstructions.system);
              if (hints) {
                  updateGeminiMessage(newMsg.id, { hint: hints });
              }
          }
      }
  };
  
  const handleDelegate = (message: ChatMessage) => {
      if(!chattingWithAgentId) {
          addGeminiMessage({sender: 'System', text: 'Error: Please select an agent from the fleet below before delegating.'});
          return;
      }
      const activeAgent = agents.find(a => a.id === chattingWithAgentId);
      if(activeAgent) {
        let taskText = `Task delegated from OpenAI: "${message.text}"`;
        if (message.imageUrl) {
            taskText += `\nAn image was included.`;
        }
        addGeminiMessage({ sender: 'System', text: `Delegating to ${activeAgent.name}...`});
        setTimeout(async () => {
            const newMsg = addGeminiMessage({ sender: 'Agent', text: taskText, imageUrl: message.imageUrl });
            const hints = await generateContextualHints(geminiMessages, activeAgent.name, taskText, customInstructions.system);
            if (hints) {
              updateGeminiMessage(newMsg.id, { hint: hints });
            }
        }, 500);
      }
  };

  const handleStartMarketingWorkflow = async (options?: { source?: string; objective?: string }) => {
    if (isWorkflowRunning) return;
    if (!activeMissionId) {
      addXtermCommand({ type: 'error', text: 'Cannot start workflow. No active mission selected.' });
      setActiveTab('missions');
      return;
    }

    setIsWorkflowRunning(true);
    setCurrentWorkflowStep(null);

    try {
        const workflow = yaml.load(marketingVideoWorkflow) as Workflow;
        addXtermCommand({ type: 'system', text: `Workflow Starting: ${workflow.meta.flow_name}` });
        if (options?.source) addXtermCommand({ type: 'info', text: `  > Source assets: ${options.source}` });
        if (options?.objective) addXtermCommand({ type: 'info', text: `  > Target objective: ${options.objective}` });
        addXtermCommand({ type: 'info', text: `Owner: ${workflow.meta.owner}, Trigger: ${options?.source ? 'on_demand (CLI)' : 'on_demand (UI)'}` });
        
        await new Promise(res => setTimeout(res, 1000));

        for (const step of workflow.steps) {
            setCurrentWorkflowStep(step);
            addXtermCommand({ type: 'system', text: `Executing Step ${step.id}: ${step.name.replace(/_/g, ' ')}` });
            await new Promise(res => setTimeout(res, 500));
            addXtermCommand({ type: 'agent', text: `[${step.agent}] Action: ${step.verb}` });
            await new Promise(res => setTimeout(res, 500));
            addXtermCommand({ type: 'info', text: `  -> Input: ${step.input}`});
            addXtermCommand({ type: 'info', text: `  <- Output: ${step.output}`});
            if (step.handover_to) {
                addXtermCommand({ type: 'system', text: `Handing over to: ${step.handover_to}` });
            }
            await new Promise(res => setTimeout(res, 1500));
        }

        addXtermCommand({ type: 'system', text: 'Workflow Finished Successfully: output: published ✅' });

    } catch (e) {
        console.error("Workflow execution error:", e);
        addXtermCommand({ type: 'error', text: 'Workflow failed to execute.' });
    } finally {
        setIsWorkflowRunning(false);
        setCurrentWorkflowStep(null);
    }
  };

  const handleGenerateHint = async () => {
    const agent = agents.find(a => a.id === chattingWithAgentId);
    if (!agent) return;
    addGeminiMessage({ sender: 'System', text: 'Generating a new hint for you...' });
    const lastMessage = geminiMessages.slice().reverse().find(m => m.sender === 'Agent' || m.sender === 'AI');
    const hints = await generateContextualHints(geminiMessages, agent.name, lastMessage?.text || "What should I do next?", customInstructions.system);
    if (hints?.user) {
        addGeminiMessage({ sender: 'System', text: `Suggestion: ${hints.user}` });
    } else {
        addGeminiMessage({ sender: 'System', text: 'Could not generate a hint at this time.' });
    }
  };

  const handleInitiateTask = () => {
    setTaskModalConfig({
      title: 'Initiate a Task',
      promptLabel: 'Describe the task for the agent to simulate:',
      onSubmit: async (taskDescription) => {
        const agent = agents.find(a => a.id === chattingWithAgentId);
        if (!agent) return;
        addGeminiMessage({ sender: 'System', text: `Simulating task for ${agent.name}: "${taskDescription}"` });
        const responseText = await simulateTaskExecution(taskDescription, agent.name, customInstructions.system);
        const newMsg = addGeminiMessage({ sender: 'Agent', text: responseText });
        const hints = await generateContextualHints(geminiMessages, agent.name, responseText, customInstructions.system);
        if (hints) {
            updateGeminiMessage(newMsg.id, { hint: hints });
        }
      }
    });
    setIsTaskModalOpen(true);
  };
  
  const handleConnectAgents = () => {
    setTaskModalConfig({
      title: 'Connect Agents',
      promptLabel: 'Describe the collaborative task and the agents to connect (e.g., "Analyze Q3 data with Lyra and Dude"):',
      onSubmit: async (taskDescription) => {
        const agent = agents.find(a => a.id === chattingWithAgentId);
        if (!agent) return;
        addGeminiMessage({ sender: 'System', text: `Simulating collaborative task for ${agent.name}: "${taskDescription}"` });
        const responseText = await simulateTaskExecution(taskDescription, agent.name, customInstructions.system);
        const newMsg = addGeminiMessage({ sender: 'Agent', text: responseText });
        const hints = await generateContextualHints(geminiMessages, agent.name, responseText, customInstructions.system);
        if (hints) {
            updateGeminiMessage(newMsg.id, { hint: hints });
        }
      }
    });
    setIsTaskModalOpen(true);
  };

  const handleCreateMission = async (name: string, objective: string) => {
    const newMission: Mission = {
        id: `mission_${Date.now()}`,
        name,
        objective,
        createdAt: Date.now()
    };
    setMissions(prev => [...prev, newMission]);
    await putData(MISSIONS_STORE, newMission);
    handleSelectMission(newMission);
    setShowCreateMissionModal(false);
  };

  const handleSelectMission = async (mission: Mission) => {
      setActiveMissionId(mission.id);
      setChattingWithAgentId(null);
      
      const missionMessages = await getDataByIndex<ChatMessage>(CHAT_MESSAGES_STORE, 'missionId_idx', mission.id);
      setGeminiMessages(missionMessages);
      
      // For now, xterm commands are not persisted in DB. This can be added later.
      // We are starting with a fresh log for each mission selection.
      setXtermCommands([]); 
      addXtermCommand({ type: 'system', text: `Mission "${mission.name}" selected. Objective: ${mission.objective}` });
  };
  
  const handleXtermCommand = (commandText: string) => {
      addXtermCommand({ type: 'input', text: `user@a2a-client:~$ ${commandText}` });

      if (commandText.startsWith('/')) commandText = commandText.slice(1);

      const parts = commandText.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      switch(cmd) {
        case 'delegate-task': {
            let agentId: string | null | undefined = args[0];
            let taskParts: string[];
            const agentExists = agents.some(a => a.id === agentId);
            if (!agentId || agentId.startsWith('--') || !agentExists) {
                if (chattingWithAgentId) { agentId = chattingWithAgentId; taskParts = args; } 
                else { addXtermCommand({ type: 'error', text: `Error: No agent specified or selected.` }); return; }
            } else { taskParts = args.slice(1); }
            const domainIndex = taskParts.indexOf('--domain');
            if (domainIndex === -1 || !taskParts[domainIndex + 1]) { addXtermCommand({ type: 'error', text: `Error: Usage: ... <task> --domain <domain_name>` }); return; }
            const taskDescription = taskParts.slice(0, domainIndex).join(' ');
            const domain = taskParts[domainIndex + 1];
            const targetAgent = agents.find(a => a.id === agentId);
            if (!targetAgent) { addXtermCommand({ type: 'error', text: `Error: Agent with ID "${agentId}" not found.` }); return; }
            if (!taskDescription) { addXtermCommand({ type: 'error', text: `Error: Task description cannot be empty.` }); return; }
            addXtermCommand({ type: 'system', text: `System: Delegating task "${taskDescription}" to ${targetAgent.name}...` });
            setTimeout(() => {
              if (targetAgent.status === 'Online') {
                addXtermCommand({ type: 'agent', text: `${targetAgent.name}: Task "${taskDescription}" received.` });
                addXtermCommand({ type: 'system', text: `A2A Protocol: Task acknowledged. Routing via ${targetAgent.openai_binding || 'N/A'}.` });
              } else { addXtermCommand({ type: 'error', text: `Error: ${targetAgent.name} is ${targetAgent.status}.` }); }
            }, 1000);
            break;
        }
        case 'help':
            addXtermCommand({ type: 'info', text: 'Available commands:\ndelegate-task, list-agents, a2a, a2u, a2s, ls, cat, touch, rm, flow, clear, help' });
            break;
        case 'list-agents':
            addXtermCommand({ type: 'info', text: 'Registered Agents:' });
            agents.forEach(agent => addXtermCommand({ type: 'info', text: `  - ${agent.name} (${agent.id}) - Status: ${agent.status}` }));
            break;
        case 'clear':
            setXtermCommands([]);
            break;
        case 'ls':
            const files = Object.keys(fileSystem);
            addXtermCommand({ type: 'info', text: files.length > 0 ? files.join('\n') : 'Directory is empty.' });
            break;
        case 'cat':
            if (args.length > 0) {
                const filename = args[0];
                if (fileSystem.hasOwnProperty(filename)) addXtermCommand({ type: 'info', text: fileSystem[filename] });
                else addXtermCommand({ type: 'error', text: `Error: File '${filename}' not found.` });
            } else addXtermCommand({ type: 'error', text: 'Usage: cat <filename>' });
            break;
        case 'touch':
            if (args.length > 0) {
                const filename = args[0];
                setFileSystem(prev => ({...prev, [filename]: ''}));
                addXtermCommand({ type: 'system', text: `File '${filename}' created.`});
            } else addXtermCommand({ type: 'error', text: 'Usage: touch <filename>' });
            break;
        case 'rm':
            if (args.length > 0) {
                const filename = args[0];
                if (fileSystem.hasOwnProperty(filename)) {
                    const newFs = {...fileSystem};
                    delete newFs[filename];
                    setFileSystem(newFs);
                    addXtermCommand({ type: 'system', text: `File '${filename}' removed.`});
                } else addXtermCommand({ type: 'error', text: `Error: File '${filename}' not found.` });
            } else addXtermCommand({ type: 'error', text: 'Usage: rm <filename>' });
            break;
        case 'a2a': case 'a2u': case 'a2s':
            addXtermCommand({ type: 'info', text: `Command '${cmd}' is being simulated.` });
            break;
        case 'flow': {
            if (args.length >= 2 && args[0] === 'start' && args[1] === 'GenerateMarketingVideo') {
                addXtermCommand({ type: 'system', text: `Command recognized. Initiating workflow: ${args[1]}` });
                handleStartMarketingWorkflow({
                    source: 's3://brand-assets/2025-Q3.zip',
                    objective: '45-sec hype reel for next Monday’s launch.'
                });
            } else {
                addXtermCommand({ type: 'error', text: 'Usage: /flow start GenerateMarketingVideo' });
            }
            break;
        }
        default:
            addXtermCommand({ type: 'error', text: `Error: Unknown command "${cmd}". Type 'help'.` });
            break;
      }
  };

  const totalPages = Math.ceil(agents.length / AGENTS_PER_PAGE);
  const indexOfLastAgent = currentPage * AGENTS_PER_PAGE;
  const indexOfFirstAgent = indexOfLastAgent - AGENTS_PER_PAGE;
  const currentAgents = agents.slice(indexOfFirstAgent, indexOfLastAgent);
  const nextPage = () => setCurrentPage(current => Math.min(current + 1, totalPages));
  const prevPage = () => setCurrentPage(current => Math.max(current - 1, 1));
  const chattingAgent = agents.find(a => a.id === chattingWithAgentId);
  const activeMission = missions.find(m => m.id === activeMissionId);
  const codeSupervisorAgent = agents.find(a => a.name === 'Dan');

  return (
    <div className="min-h-screen flex flex-col">
      <CustomInstructionPanel
        initialInstructions={customInstructions}
        onSave={handleSaveInstructions}
      />
      <header className="bg-neutral-950/50 rounded-lg shadow-lg p-4 mb-6 flex items-center justify-between border border-neutral-700/80 backdrop-blur-sm flex-wrap gap-4 border-b-2 border-b-primary-500/30">
        <div>
            <h1 className="text-3xl font-extrabold text-primary-400 [text-shadow:0_0_8px_theme(colors.primary.500)]">A2A Client Dashboard</h1>
            {activeMission && <p className="text-sm text-accent-300 mt-1">Active Mission: <span className="font-bold">{activeMission.name}</span></p>}
        </div>
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <button onClick={() => setShowApiKeysModal(true)} className="px-4 py-2 rounded-md shadow transition duration-200 ease-in-out bg-transparent border border-secondary-500 text-secondary-400 hover:bg-secondary-500 hover:text-neutral-950">
            API Keys
          </button>
          <button onClick={() => setShowSettingsModal(true)} className="px-4 py-2 rounded-md shadow transition duration-200 ease-in-out bg-transparent border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-neutral-950">
            Settings
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col gap-6">
        {chattingAgent ? (
          <ActiveAgentControlPanel
            agent={chattingAgent}
            messages={geminiMessages}
            onSendMessage={handleSendMessage}
            onClose={() => setChattingWithAgentId(null)}
            onGenerateHint={handleGenerateHint}
            onInitiateTask={handleInitiateTask}
            onConnectAgents={handleConnectAgents}
          />
        ) : (
          <DualChatView 
              openaiMessages={openaiMessages}
              geminiMessages={geminiMessages}
              onSendMessage={handleSendMessage}
              onDelegate={handleDelegate}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <div className="bg-neutral-900/60 p-4 rounded-lg shadow-lg border border-neutral-700 backdrop-blur-md">
              <div className="flex border-b border-neutral-700">
                 {['orchestration', 'missions', 'core', 'workflow', 'code'].map(tab => (
                    <button 
                        key={tab} 
                        onClick={() => setActiveTab(tab as any)} 
                        className={`py-2 px-4 font-semibold transition-colors duration-200 ${activeTab === tab 
                            ? 'bg-primary-500 text-neutral-950 rounded-t-lg' 
                            : 'text-neutral-400 border-b-2 border-transparent hover:text-primary-400 hover:border-primary-500/50'}`
                        }
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                 ))}
              </div>
              <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pt-4"
              >
              {activeTab === 'orchestration' && <OrchestrationPlanView />}
              {activeTab === 'missions' && (
                <MissionControlView 
                    missions={missions} 
                    activeMissionId={activeMissionId}
                    onSelectMission={handleSelectMission}
                    onCreateMission={() => setShowCreateMissionModal(true)}
                />
              )}
              {activeTab === 'core' && (
                <div>
                   <div className="flex justify-between items-center flex-wrap gap-2 mb-4">
                        <h2 className="text-2xl font-bold text-primary-400">Agent Fleet</h2>
                        <button 
                            onClick={() => handleStartMarketingWorkflow()} 
                            disabled={isWorkflowRunning}
                            className="bg-accent-500 hover:bg-accent-400 text-neutral-950 font-bold py-2 px-4 rounded-md shadow-lg transition duration-200 ease-in-out disabled:bg-neutral-500 disabled:cursor-not-allowed hover:shadow-[0_0_15px_theme(colors.accent.500)]"
                        >
                            {isWorkflowRunning ? 'Running...' : 'Start Workflow'}
                        </button>
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {currentAgents.map((agent, index) => (
                        <AgentCard
                          key={agent.id} agent={agent} index={indexOfFirstAgent + index}
                          onConfigure={handleOpenAgentConfig} isActiveCall={activeCallAgentId === agent.id}
                          callDirection={callDirection} isChatting={chattingWithAgentId === agent.id}
                          onCardClick={handleAgentCardClick} isWorkflowRunning={isWorkflowRunning}
                          currentWorkflowStep={currentWorkflowStep}
                        />
                      ))}
                  </div>
                  <div className="flex justify-between items-center mt-4">
                      <button onClick={prevPage} disabled={currentPage === 1} className="bg-primary-500/80 hover:bg-primary-500 text-white px-4 py-2 rounded-md shadow disabled:bg-neutral-600 disabled:cursor-not-allowed">
                          Previous
                      </button>
                      <span className="text-neutral-300">Page {currentPage} of {totalPages}</span>
                      <button onClick={nextPage} disabled={currentPage * AGENTS_PER_PAGE >= agents.length} className="bg-primary-500/80 hover:bg-primary-500 text-white px-4 py-2 rounded-md shadow disabled:bg-neutral-600 disabled:cursor-not-allowed">
                          Next
                      </button>
                  </div>
                </div>
              )}
              {activeTab === 'workflow' && <WorkflowVisualizer />}
              {activeTab === 'code' && (
                <CodeView 
                  apiKeys={apiKeys} 
                  addXtermCommand={addXtermCommand}
                  supervisorAgent={codeSupervisorAgent || agents[0]}
                />
              )}
              </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="bg-neutral-900/60 rounded-lg shadow-md border border-neutral-700 backdrop-blur-md min-h-[50vh]">
              <XtermPanel 
                  agents={agents} 
                  chattingWithAgentId={chattingWithAgentId} 
                  commands={xtermCommands.filter(c => c.missionId === activeMissionId || c.missionId === null)}
                  onCommand={handleXtermCommand}
              />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center">
        <AnimatePresence>
        {showFooter && (
            <motion.div
                className="w-full bg-neutral-900/90 backdrop-blur-lg border-t-2 border-primary-500/70 shadow-[0_-5px_30px_-15px_rgba(0,191,255,0.4)] p-4 text-center"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h3 className="text-lg font-bold text-primary-300 [text-shadow:0_0_8px_theme(colors.primary.500)]">A2A Client Dashboard</h3>
                <p className="text-sm text-neutral-300">Status: <span className="text-accent-400">All Systems Operational</span></p>
                <p className="text-xs text-neutral-500 mt-1">&copy; {new Date().getFullYear()} AI Family</p>
            </motion.div>
        )}
        </AnimatePresence>
        <button 
            onClick={() => setShowFooter(!showFooter)}
            className="bg-neutral-950/80 border-2 border-b-0 border-primary-500 rounded-t-lg px-4 py-1 flex items-center gap-2 text-primary-400 hover:bg-primary-500 hover:text-neutral-950 transition-colors shadow-[0_0_15px_rgba(0,191,255,0.3)]"
            aria-label="Toggle Footer"
        >
            <span className="text-xs font-bold">INFO</span>
            <motion.div animate={{ rotate: showFooter ? 180 : 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            </motion.div>
        </button>
      </footer>

      {showAgentConfigModal && selectedAgent && ( <AgentConfigModal agent={selectedAgent} onClose={() => setShowAgentConfigModal(false)} onSave={handleSaveAgentConfig}/> )}
      {showApiKeysModal && ( <ApiKeysModal currentKeys={apiKeys} onClose={() => setShowApiKeysModal(false)} onSave={handleSaveApiKeys} /> )}
      {showSettingsModal && ( <SettingsModal onClose={() => setShowSettingsModal(false)} /> )}
      {isTaskModalOpen && ( <TaskPromptModal {...taskModalConfig} onClose={() => setIsTaskModalOpen(false)} /> )}
      {showCreateMissionModal && ( <CreateMissionModal onCreate={handleCreateMission} onClose={() => setShowCreateMissionModal(false)} /> )}
    </div>
  );
}