export interface ThoughtCategory {
  type: 'actions' | 'decisions' | 'worries' | 'wins';
  items: string[];
}

export interface ThoughtSession {
  id: string;
  timestamp: string;
  transcript: string;
  categories: {
    actions: string[];
    decisions: string[];
    worries: string[];
    wins: string[];
  };
}

