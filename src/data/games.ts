import { Game } from '@/types';

export const games: Game[] = [
  {
    id: 'marooned',
    name: 'Marooned',
    description: 'Island Survivor teaser — wash up with nothing, loot wrecks, manage hunger and thirst, and share the island with other players (no PvP). A multiplayer Early Access web build.',
    shortDescription: 'Early Access island survivor with a shared-island multiplayer experience',
    thumbnail: '/game-assets/marooned.png',
    url: 'https://marooned-island-e8bc6f06ff39.herokuapp.com/',
    status: 'early-access',
    tech: ['Three.js', 'Vue', 'TypeScript', 'Firebase'],
    features: ['Early Access', 'Multiplayer', 'Shared Island', 'Survival'],
    color: 'from-teal-500 to-amber-500',
    gradient: 'bg-gradient-to-br from-teal-500 to-amber-500',
    publishedDate: '2026-10-07'
  },
  {
    id: 'crossy-road',
    name: 'Crossy Road',
    description: 'Jump, dodge, and survive in this endless runner inspired by the classic Crossy Road. Navigate through obstacles, collect coins, and see how far you can go. Features beautiful 2.5D graphics and addictive gameplay.',
    shortDescription: 'Endless runner with obstacles and coins',
    thumbnail: '/game-assets/crossy-road.png',
    url: 'https://crossy-road-adeb791dac1a.herokuapp.com/',
    githubUrl: 'https://github.com/smarlify/crossy-road-game',
    status: 'published',
    tech: ['React Three Fiber', 'Zustand', 'TypeScript'],
    features: ['Endless Gameplay', 'Obstacle Avoidance', 'Corn Collection', 'High Scores'],
    color: 'from-blue-500 to-cyan-600',
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    publishedDate: '2024-06-01'
  },
  {
    id: 'traffic-run',
    name: 'Traffic Run',
    description: 'Experience the thrill of high-speed racing in this 2.5D racing game. Navigate through busy traffic, avoid collisions, and reach the finish line as fast as possible. Built with Three.js for stunning 3D graphics and smooth gameplay.',
    shortDescription: 'High-speed 2.5D racing through busy traffic',
    thumbnail: '/game-assets/traffic-run.png',
    url: 'https://traffic-run-50a7914ff3f5.herokuapp.com/',
    githubUrl: 'https://github.com/smarlify/traffic-run-game',
    status: 'published',
    tech: ['Three.js', 'TypeScript', 'WebGL'],
    features: ['Obstacle Avoidance', 'Multiple Levels', 'High Scores'],
    color: 'from-pink-500 to-rose-600',
    gradient: 'bg-gradient-to-br from-pink-500 to-rose-600',
    publishedDate: '2024-07-01'
  },
  {
    id: 'crazy-vacuum-3d',
    name: 'Crazy Vacuum 3D',
    description: 'Coming soon! Experience the ultimate 3D vacuum cleaning adventure. Navigate through challenging levels, collect debris, and master the art of cleaning in this innovative 3D adventure game.',
    shortDescription: '3D vacuum cleaning adventure',
    thumbnail: '/game-assets/crazy-vacuum.png',
    url: '#',
    status: 'coming-soon',
    tech: ['Unity 3D', 'C#'],
    features: ['3D Graphics', 'Realistic Physics'],
    color: 'from-yellow-500 to-orange-600',
    gradient: 'bg-gradient-to-br from-yellow-500 to-orange-600'
  }
];

export const getGameById = (id: string): Game | undefined => {
  return games.find(game => game.id === id);
};

export const getPublishedGames = (): Game[] => {
  return games.filter(game => game.status === 'published');
};

export const getComingSoonGames = (): Game[] => {
  return games.filter(game => game.status === 'coming-soon');
};
