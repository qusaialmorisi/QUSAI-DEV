export type Language = 'en' | 'ar';

export type SectionId =
  | 'home'
  | 'about'
  | 'projects'
  | 'ai-assistant'
  | 'contact'
  | 'not-found';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  modelLabel?: string;
  error?: string;
  createdAt: string;
}

export type ProjectCategory = 'all' | 'networking' | 'systems' | 'web';

export interface ProjectItem {
  id: string;
  category: Exclude<ProjectCategory, 'all'>;
  image: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  summary: Record<Language, string>;
  stack: string[];
  projectUrl: string | null;
}

export type SkillIconId =
  | 'flutter'
  | 'dart'
  | 'python'
  | 'javascript'
  | 'react'
  | 'php'
  | 'laravel'
  | 'mysql'
  | 'firebase'
  | 'networking';

export interface SkillItem {
  id: SkillIconId;
  name: string;
  category: Record<Language, string>;
  summary: Record<Language, string>;
}
