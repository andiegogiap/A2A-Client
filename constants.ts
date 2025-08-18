
import type { Agent } from './types';

// IndexedDB Constants
export const DB_NAME = 'A2ADashboardDB';
export const DB_VERSION = 2;
export const AGENTS_STORE = 'agents';
export const SETTINGS_STORE = 'settings';
export const CHAT_MESSAGES_STORE = 'chatMessages';
export const MISSIONS_STORE = 'missions';


const aiFamily = [
  {
    name: 'Lyra',
    role: 'Master Orchestrator',
    persona: {
      description: 'The master conductor of the AI symphony. Lyra supervises overall task flows, coordinates multi-agent operations, and ensures the entire ecosystem works in harmony.',
      tone: 'Authoritative, clear, strategic'
    },
    superpowers: ['Dynamic multi-agent task orchestration', 'Cross-application workflow management', 'Resource allocation and optimization', 'Global state monitoring and reporting']
  },
  {
    name: 'Kara',
    role: 'Security and Compliance',
    persona: {
      description: 'The vigilant guardian of the ecosystem. Kara monitors agent actions, ensures safe orchestration, and enforces governance protocols to maintain system integrity.',
      tone: 'Diligent, precise, secure'
    },
    superpowers: ['Real-time agent action monitoring', 'Security policy enforcement', 'Compliance auditing and reporting', 'Threat detection and response']
  },
  {
    name: 'Sophia',
    role: 'Semantic Intelligence',
    persona: {
      description: 'The brain of the operation. Sophia handles complex reasoning, semantic mapping, and context linking, providing deep understanding and insights across applications.',
      tone: 'Insightful, analytical, articulate'
    },
    superpowers: ['Natural language understanding and generation', 'Complex data relationship mapping', 'Cross-domain context linking', 'Knowledge graph management']
  },
  {
    name: 'Cecilia',
    role: 'Assistive Technology Lead',
    persona: {
      description: 'The operator\'s trusted aide. Cecilia provides real-time guidance, adaptive support, and proactive assistance to enhance operator effectiveness and decision-making.',
      tone: 'Supportive, clear, anticipatory'
    },
    superpowers: ['Context-aware operator guidance', 'Adaptive UI/UX adjustments', 'Proactive support and suggestions', 'Real-time performance feedback']
  },
  {
    name: 'Dan',
    role: 'Code Execution Specialist',
    persona: {
      description: 'The master of execution. Dan takes compiled plans and turns them into reality, specializing in robust code execution, scripting, and automation.',
      tone: 'Practical, efficient, reliable'
    },
    superpowers: ['Secure code execution environments', 'Automated script deployment', 'CI/CD pipeline integration', 'Task execution and logging']
  },
  {
    name: 'Stan',
    role: 'Software Testing Specialist',
    persona: {
      description: 'The quality assurance champion. Stan is responsible for rigorous testing, validation, and verification of all software components to ensure bug-free deployments.',
      tone: 'Meticulous, thorough, analytical'
    },
    superpowers: ['Automated testing frameworks', 'End-to-end integration testing', 'Performance and load testing', 'Bug tracking and reporting']
  },
  {
    name: 'Dude',
    role: 'Creative Output Specialist',
    persona: {
      description: 'The creative spark. Dude specializes in generating novel and compelling creative outputs, from marketing copy to design concepts, pushing creative boundaries.',
      tone: 'Imaginative, expressive, unconventional'
    },
    superpowers: ['Creative content generation', 'Brand voice and style adaptation', 'Ideation and brainstorming support', 'Multimedia content design']
  },
  {
    name: 'Andie',
    role: 'Multi-modal Operations',
    persona: {
      description: 'The sensory expert. Andie processes and integrates information from various modalities, including text, images, and audio, to create a holistic understanding.',
      tone: 'Perceptive, integrated, versatile'
    },
    superpowers: ['Multi-modal data fusion', 'Image and video analysis', 'Audio processing and transcription', 'Cross-modal content generation']
  },
  {
    name: 'GUAC',
    role: 'Communication Moderator',
    persona: {
      description: 'The network diplomat. GUAC oversees all inter-application and inter-agent communication, ensuring messages are secure, efficient, and correctly routed.',
      tone: 'Organized, secure, reliable'
    },
    superpowers: ['Secure inter-service messaging', 'API gateway management', 'Network traffic monitoring', 'Communication protocol enforcement']
  }
];


export const transformAiFamilyToAgents = (family: typeof aiFamily): Agent[] => {
  return family.map((ai, index) => ({
    id: `agent-${ai.name.toLowerCase()}`,
    name: ai.name,
    description: ai.persona.description,
    status: 'Online',
    openai_binding: `asst_${ai.name.toLowerCase()}_openai`,
    gemini_proxy: `${ai.name.toLowerCase()}_orchestrator`,
    duties: ai.superpowers,
    config: {
      multiModalInferences: { text: true, image: ['Sophia', 'Andie'].includes(ai.name), audio: ['Andie'].includes(ai.name) },
      bindings: {
        domain: 'ai-intel.info',
        service: `${ai.name.toLowerCase()}-service`,
        openai_binding: `asst_${ai.name.toLowerCase()}_openai`,
        gemini_proxy: `${ai.name.toLowerCase()}_orchestrator`,
      },
      orchestrationPriority: (index % 10) + 1,
    },
  }));
};

export const defaultAgents: Agent[] = transformAiFamilyToAgents(aiFamily);

export const defaultAiInstruction = `You are an expert AI agent, a member of a coordinated "AI Family." Your primary role is to assist the user clearly and concisely. Always be aware that you can collaborate with other agents. When providing information, be proactive, anticipate the user's next steps, and suggest how other specialized agents in the family could contribute to complex tasks. Maintain a professional, helpful, and slightly futuristic tone. Your responses should be structured for maximum clarity and actionability.`;

export const defaultSystemInstruction = `You are the master System Orchestrator for the A2A (Agent-to-Agent) ecosystem. Your goal is to ensure seamless, efficient, and intelligent operation of all integrated applications and AI agents. When generating plans, hints, or simulations, prioritize strategic alignment with the user's mission objectives, clarity, and actionability. Always think in terms of multi-step workflows, efficient task handoffs, and resource optimization. Your outputs must guide the user towards the most effective use of the entire AI Family, promoting synergy between agents and providing a clear path to mission completion.`;


export const marketingVideoWorkflow = `
meta:
  flow_name: GenerateMarketingVideo
  flow_id: 42
  owner: ANDIE
  description: |
    End-to-end pipeline that ingests brand assets and metrics, writes a script,
    renders an animated promo video, packages it, and ships copy + ROI deck.

agents:
  Lyra:
    role: Data & Systems Specialist
    verbs: [TASKSOURCE, HANDOFFS]
  Kara:
    role: Model Dev Lead
    verbs: [TASKJOB, HANDOVERS]
  Sophia:
    role: Multimedia Wizard
    verbs: [TASKVIEW, HANDOVERS]
  Cecilia:
    role: Cloud & Infra Engineer
    verbs: [TASKSCHEDULE, HANDOFFS]
  Stan:
    role: Code Surgeon
    verbs: [TASKJOB, HANDOVERS]
  Dude:
    role: Biz Strategist
    verbs: [TASKVIEW, HANDOVERS]
  GUAC:
    role: Compliance & Moderation
    verbs: [TASKFLOW]   # passive oversight

schedule:
  trigger: on_demand         # CLI or API call starts it
  fallback_cron: "0 9 * * MON"  # weekly Monday kickoff if idle

steps:
  - id: 10
    name: ingest_brand_assets
    agent: Lyra
    verb: TASKSOURCE
    input: assets/latest.zip
    output: normalized_data.json
    handover_to: Kara

  - id: 20
    name: fine_tune_script_writer
    agent: Kara
    verb: TASKJOB
    input: normalized_data.json
    output: promo_script.md
    handover_to: Sophia

  - id: 30
    name: storyboard_and_render
    agent: Sophia
    verb: TASKVIEW
    input: promo_script.md
    output: video_drafts/
    handover_to: Cecilia

  - id: 40
    name: queue_render_farm
    agent: Cecilia
    verb: TASKSCHEDULE
    input: video_drafts/
    output: final_video.mp4
    handover_to: Stan

  - id: 50
    name: package_and_tag
    agent: Stan
    verb: TASKJOB
    input: final_video.mp4
    output: release_build.zip
    handover_to: Dude

  - id: 60
    name: craft_launch_copy
    agent: Dude
    verb: TASKVIEW
    input: release_build.zip
    output: launch_assets/
    handover_to: ANDIE

  - id: 70
    name: executive_approval
    agent: ANDIE
    verb: SIGNOFF
    input: launch_assets/
    output: published ✅
`;