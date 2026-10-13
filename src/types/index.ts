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
  /** When true, show in the featured hero (may also appear in the grid). */
  featured?: boolean;
  /**
   * When false, soft-hide: keep the entry in data, but omit from the UI grid,
   * featured selection, sitemap, and public SEO. Defaults to true.
   */
  listed?: boolean;
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
