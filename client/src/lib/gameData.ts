export interface GameData {
  id: string;
  name: string;
  provider: string;
  category: string;
  imageUrl: string;
}

export const games: GameData[] = [
  {
    id: '1',
    name: 'Mega Test',
    provider: 'Evolution',
    category: 'evolution',
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '2',
    name: 'Mega 5',
    provider: 'Evolution',
    category: 'evolution',
    imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '3',
    name: 'Bigger Bass Splash',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '4',
    name: 'Golden Temple',
    provider: 'Relax Gaming',
    category: 'relax',
    imageUrl: 'https://images.unsplash.com/photo-1551847973-4bb54b368b8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '5',
    name: 'Dragon Fortune',
    provider: 'Jili',
    category: 'jili',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '6',
    name: 'Lucky Wheel',
    provider: 'Evolution',
    category: 'evolution',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  }
];

export interface WinnerData {
  name: string;
  amount: string;
  game: string;
  avatar: string;
}

export const winners: WinnerData[] = [
  { name: 'Larissa Barb...', amount: '+ R$ 26,00', game: 'Treasure Bowl', avatar: 'L' },
  { name: 'João Silva...', amount: '+ R$ 150,50', game: 'Dragon Fortune', avatar: 'J' },
  { name: 'Maria Costa...', amount: '+ R$ 89,20', game: 'Lucky Wheel', avatar: 'M' },
  { name: 'Pedro Alves...', amount: '+ R$ 312,00', game: 'Golden Temple', avatar: 'P' },
  { name: 'Ana Santos...', amount: '+ R$ 75,80', game: 'Mega Test', avatar: 'A' }
];

export const categories = [
  { id: 'all', name: 'All', icon: 'flame' },
  { id: 'pragmatic', name: 'Pragmatic Play', icon: 'trophy' },
  { id: 'evolution', name: 'Evolution', icon: 'star' },
  { id: 'relax', name: 'Relax Gaming', icon: 'dice-6' },
  { id: 'jili', name: 'Jili', icon: 'diamond' }
];
