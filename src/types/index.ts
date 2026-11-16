export type Language = 'en' | 'ar';

export type SectionId =
  | 'home'
  | 'ai-lab'
  | 'terminal'
  | 'playground'
  | 'dev-tools'
  | 'network-lab'
  | 'experiments'
  | 'challenges'
  | 'knowledge'
  | 'projects'
  | 'about'
  | 'contact'
  | 'not-found';

export type AiMode = 'ask' | 'explain' | 'debug' | 'architecture';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  mode: AiMode;
  modelLabel?: string;
  error?: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  title: string;
  mode: AiMode;
  updatedAt: string;
  messages: AiChatMessage[];
}

export type ProjectCategory = 'all' | 'networking' | 'systems' | 'web';

export interface ProjectChallenge {
  challenge: Record<Language, string>;
  solution: Record<Language, string>;
}

export interface ProjectItem {
  id: string;
  category: Exclude<ProjectCategory, 'all'>;
  image: string;
  statusLabel: Record<Language, string>;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  summary: Record<Language, string>;
  features: Record<Language, string[]>;
  architecture: Record<Language, string[]>;
  challenges: ProjectChallenge[];
  capabilities: Record<Language, string[]>;
  stack: string[];
  demoUrl: string | null;
  sourceUrl: string | null;
}

export type KnowledgeCategory =
  | 'all'
  | 'networking'
  | 'python'
  | 'flutter'
  | 'react'
  | 'php'
  | 'programming';

export interface KnowledgeArticle {
  id: string;
  category: Exclude<KnowledgeCategory, 'all'>;
  level: Record<Language, string>;
  title: Record<Language, string>;
  summary: Record<Language, string>;
  sections: {
    heading: Record<Language, string>;
    body: Record<Language, string>;
  }[];
  codeLabel: Record<Language, string>;
  codeLang: string;
  code: string;
}

export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProgrammingChallengeLang = 'python' | 'javascript' | 'html-css';
export type ChallengeKind = 'programming' | 'networking';

export interface ChallengeTestCaseResult {
  id: string;
  label: string;
  passed: boolean;
  inputDisplay: string;
  expectedDisplay: string;
  actualDisplay: string;
  error?: string;
}

export interface ChallengeEvaluationResult {
  passedAll: boolean;
  tests: ChallengeTestCaseResult[];
  runtimeError?: string;
}

