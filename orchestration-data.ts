
interface SubSection {
    title: string;
    content?: string[];
    list?: string[];
}

interface Section {
    title: string;
    content?: string[];
    list?: string[];
    subSections?: SubSection[];
}

export interface PlanData {
    title: string;
    sections: Section[];
}

export const planData: PlanData = {
    title: 'AI Family Multi-App Orchestration with Gemini CLI + OpenAI',
    sections: [
        {
            title: 'Overview',
            content: [
                'We are requesting Gemini Studio to draft a comprehensive orchestration and API integration plan for the AI Family ecosystem, enabling seamless coordination, task handoffs, and feedback loops across 15 applications currently in proactive development.',
                'This orchestration platform is designed to:',
            ],
            list: [
                'Serve as the service layer between applications',
                'Leverage Gemini CLI and OpenAI GPT for background intelligence',
                'Provide adaptive, AI-driven orchestration to support the Operator',
                'Automate CI/CD pipelines for cross-application software development and deployment',
                'Enable multi-agent collaboration under a unified orchestration framework',
            ]
        },
        {
            title: 'AI Family Summary and Roles',
            content: [
                'LYRA: Master Orchestrator – Supervises overall task flows and coordinates multi-agent operations.',
                'KARA: Security and Compliance – Monitors agent actions, ensures safe orchestration and governance.',
                'SOPHIA: Semantic Intelligence – Handles complex reasoning, semantic mapping, and context linking.',
                'CECILIA: Assistive Technology Lead – Provides real-time guidance, adaptive support, and operator aid.',
                'GUAC: Communication Moderator – Oversees inter-application messaging and network security.',
                'ANDIE / DAN / STAN / DUDE: Specialized agents for code execution, testing, creative output, and multi-modal operations.',
                'Together, these agents use AI technology to maintain service orientation, ensuring the Operator is supported with intelligent, context-aware orchestration throughout the development and deployment lifecycle.',
            ]
        },
        {
            title: 'Objective',
            content: ['To enable Gemini Studio to:'],
            list: [
                'Integrate with all AI Family applications (CUA, Image Maker, SoundNodeLab, Gemini Studio SPA, WebETA, Container Manager, Audio/Voice modules, and others).',
                'Provide API instructions for each application to allow direct orchestration (not limited to Gemini/OpenAI API calls).',
                'Establish orchestration handoffs and feedback loops between applications and agents.',
                'Support CI/CD automation across the ecosystem for software builds, deployments, and version synchronization.',
                'Enable logical interoperability where applications exchange context and outputs in a standardized format.',
            ]
        },
        {
            title: 'Execution Deliverables',
            subSections: [
                {
                    title: 'Unified Orchestration Specification',
                    list: [
                        'YAML/JSON templates for defining multi-app workflows.',
                        'Agent and Operator routing rules for task delegation.',
                        'Context persistence and state synchronization guidelines.',
                    ]
                },
                {
                    title: 'API Documentation and Instructions',
                    list: [
                        'Endpoints for each application: Task submission (POST), Data retrieval (GET), Orchestration triggers and event hooks',
                        'Internal service layer connectors for direct inter-app communication.',
                        'Authentication and access control for secure orchestration.',
                    ]
                },
                {
                    title: 'Feedback Loop Architecture',
                    list: [
                        'Mechanism for each application to: Report progress, logs, and errors, Return results to the orchestrator, Allow dynamic task reassignment',
                        'Aggregated feedback dashboard for the Operator.',
                    ]
                },
                {
                    title: 'CI/CD Orchestration Flow',
                    list: [
                        'Scripts and APIs to automate builds, tests, and deployments between applications.',
                        'Rollback and version control strategy.',
                        'Cross-app synchronization for consistent software delivery.',
                    ]
                },
                {
                    title: 'Implementation Guide',
                    list: [
                        'GitHub Organization and repository structure.',
                        'Multi-container orchestration templates.',
                        'Operator instructions for initiating and managing task flows.',
                    ]
                }
            ]
        },
        {
            title: 'Next-Phase Dual-LLM Adaptation',
            content: ['To future-proof the ecosystem:'],
            list: [
                'Introduce context synchronization between Gemini and OpenAI for memory and decision-sharing.',
                'Enhance Gemini CLI with commands for multi-agent orchestration and CI/CD triggers.',
                'Implement parallel execution of tasks across multiple applications with coordinated aggregation.',
                'Build a real-time Operator Control Center for monitoring and manual overrides.',
                'Expand AI-as-a-Service deployment with role-based access and multi-tenant support.',
            ]
        },
        {
            title: 'Execution Path',
            list: [
                'Gemini Studio to map all applications, draft API instructions, and deliver orchestration specs.',
                'AI Family roles to be aligned within orchestration flows for maximum operator support.',
                'GitHub repositories to be prepared for orchestrator service, application APIs, and CI/CD pipelines.',
                'Feedback-driven deployment to evolve orchestration iteratively with Gemini and OpenAI intelligence.',
            ]
        }
    ]
};
