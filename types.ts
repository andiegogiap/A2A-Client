
export interface AgentConfig {
  multiModalInferences: {
    text: boolean;
    image: boolean;
    audio: boolean;
  };
  bindings: {
    domain: string;
    service: string;
    openai_binding: string;
    gemini_proxy: string;
  };
  orchestrationPriority: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'Online' | 'Offline';
  openai_binding: string;
  gemini_proxy: string;
  duties: string[];
  config: AgentConfig;
}

export interface Hint {
  user: string;
  ai: string;
  system: string;
}

export interface ChatMessage {
  id: number;
  missionId: string | null;
  text: string;
  sender: 'User' | 'AI' | 'System' | 'Agent' | 'OpenAI';
  imageUrl?: string;
  isDelegating?: boolean;
  hint?: Hint;
}

export interface Command {
    type: 'input' | 'system' | 'agent' | 'ai' | 'error' | 'info' | 'github';
    text: string;
    missionId: string | null;
}

export interface Mission {
  id: string;
  name: string;
  objective: string;
  createdAt: number;
}


export type CallDirection = 'incoming' | 'outgoing' | null;

export interface ChatPanelRef {
  add: (message: Omit<ChatMessage, 'id' | 'missionId'>) => void;
}

export interface XtermPanelRef {
  add: (command: Omit<Command, 'missionId'>) => void;
}

export type FileSystem = Record<string, string>;

export interface ApiKeys {
    openai: string;
    githubToken: string;
    githubRepo: string; // Should be in "owner/repo" format
}

export interface CustomInstructions {
    name: 'customInstructions';
    ai: string;
    system: string;
}

export interface WorkflowStep {
  id: number;
  name: string;
  agent: string;
  verb: string;
  input: string;
  output: string;
  handover_to: string;
}

export interface Workflow {
  meta: {
    flow_name: string;
    description: string;
    owner: string;
  };
  agents: Record<string, { role: string; verbs: string[] }>;
  schedule: {
    trigger: string;
    fallback_cron: string;
  };
  steps: WorkflowStep[];
}

export interface GitHubContent {
    name: string;
    path: string;
    sha: string;
    size: number;
    type: 'file' | 'dir';
    download_url: string | null;
}