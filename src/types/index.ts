export interface Game {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  url: string;
  githubUrl?: string;
  status: 'published' | 'early-access' | 'coming-soon';
  tech: string[];
  features: string[];
  color: string;
  gradient: string;
  publishedDate?: string;
}

export interface GameCardProps {
  game: Game;
  onClick: () => void;
}

export interface GameIframeProps {
  game: Game;
  onBack: () => void;
}

export interface Score {
  id: string;
  gameId: string;
  playerName: string;
  score: number;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  nickname: string;
  avatar?: string;
}
