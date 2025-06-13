export interface GameData {
  id: string;
  name: string;
  provider: string;
  category: string;
  imageUrl: string;
}

export const games: GameData[] = [
  // Pragmatic Play Games - Authentic images from official Pragmatic Play CDN
  {
    id: '1',
    name: 'Sweet Bonanza',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2019/05/vs20fruitsw.png'
  },
  {
    id: '2',
    name: 'Gates of Olympus',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2021/02/vs20gateso.png'
  },
  {
    id: '3',
    name: 'The Dog House',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2019/05/vs20doghouse.png'
  },
  {
    id: '4',
    name: 'Big Bass Bonanza',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2020/12/vs10bbbonanza.png'
  },
  {
    id: '5',
    name: 'Wild West Gold',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2019/11/vs40wildwest.png'
  },
  {
    id: '6',
    name: 'Buffalo King',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2019/11/vs4096buffalo.png'
  },
  {
    id: '7',
    name: 'Sugar Rush',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2021/06/vs20sugarray.png'
  },
  {
    id: '8',
    name: 'Great Rhino',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2018/10/vs20rhino.png'
  },
  {
    id: '9',
    name: 'Fruit Party',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2020/05/vs20fruitparty.png'
  },
  {
    id: '10',
    name: 'Wolf Gold',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2017/05/vs25wolfgold.png'
  },
  {
    id: '11',
    name: 'Madame Destiny',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2018/09/vs10madame.png'
  },
  {
    id: '12',
    name: 'Mustang Gold',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2019/01/vs25mustang.png'
  },
  {
    id: '13',
    name: 'Fire Strike',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2018/11/vs15firestrike.png'
  },
  {
    id: '14',
    name: 'John Hunter',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2018/11/vs25john.png'
  },
  {
    id: '15',
    name: 'Aztec Bonanza',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2019/08/vs20aztecbonus.png'
  },
  {
    id: '16',
    name: 'Bonanza Gold',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2020/08/vs20bonzgold.png'
  },
  {
    id: '17',
    name: 'Hot Safari',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2018/08/vs25safari.png'
  },
  {
    id: '18',
    name: 'Pirate Gold',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2019/02/vs40pirate.png'
  },
  {
    id: '19',
    name: 'Gems Bonanza',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2020/12/vs20gembo.png'
  },
  {
    id: '20',
    name: 'Jungle Gorilla',
    provider: 'Pragmatic Play',
    category: 'pragmatic',
    imageUrl: 'https://www.pragmaticplay.com/wp-content/uploads/2019/12/vs20gorilla.png'
  },
  // Evolution Gaming Games
  {
    id: '36',
    name: 'Lightning Roulette',
    provider: 'Evolution Gaming',
    category: 'evolution',
    imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '37',
    name: 'Mega Ball',
    provider: 'Evolution Gaming',
    category: 'evolution',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '38',
    name: 'Mega Test',
    provider: 'Evolution',
    category: 'evolution',
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '39',
    name: 'Lucky Wheel',
    provider: 'Evolution',
    category: 'evolution',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  // Relax Gaming Games
  {
    id: '40',
    name: 'Money Train 2',
    provider: 'Relax Gaming',
    category: 'relax',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '41',
    name: 'Temple Tumble',
    provider: 'Relax Gaming',
    category: 'relax',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '42',
    name: 'Golden Temple',
    provider: 'Relax Gaming',
    category: 'relax',
    imageUrl: 'https://images.unsplash.com/photo-1551847973-4bb54b368b8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  // Jili Games
  {
    id: '43',
    name: 'Wild Ace',
    provider: 'Jili',
    category: 'jili',
    imageUrl: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '44',
    name: 'Dragon Fortune',
    provider: 'Jili',
    category: 'jili',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300'
  },
  {
    id: '45',
    name: 'Fishing God',
    provider: 'Jili',
    category: 'jili',
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
  { name: 'Ana Santos...', amount: '+ R$ 75,80', game: 'Mega Test', avatar: 'A' },
  { name: 'Gabriel Nas...', amount: '+ R$ 225,00', game: 'Sweet Bonanza', avatar: 'G' },
  { name: 'Carlos Pereira...', amount: '+ R$ 45,30', game: 'Buffalo King', avatar: 'C' },
  { name: 'Fernanda Lima...', amount: '+ R$ 180,90', game: 'Wild West Gold', avatar: 'F' },
  { name: 'Roberto Dias...', amount: '+ R$ 67,40', game: 'Gates of Olympus', avatar: 'R' },
  { name: 'Camila Souza...', amount: '+ R$ 295,60', game: 'Big Bass Bonanza', avatar: 'C' },
  { name: 'Bruno Torres...', amount: '+ R$ 132,15', game: 'Money Train 2', avatar: 'B' },
  { name: 'Juliana Moraes...', amount: '+ R$ 58,75', game: 'Book of Dead', avatar: 'J' },
  { name: 'Ricardo Nunes...', amount: '+ R$ 247,80', game: 'Reactoonz', avatar: 'R' },
  { name: 'Patricia Ramos...', amount: '+ R$ 91,25', game: 'Starburst', avatar: 'P' },
  { name: 'Thiago Mendes...', amount: '+ R$ 176,40', game: 'Gonzo Quest', avatar: 'T' },
  { name: 'Vanessa Campos...', amount: '+ R$ 214,70', game: 'Bonanza Gold', avatar: 'V' },
  { name: 'Eduardo Castro...', amount: '+ R$ 38,95', game: 'Fire Joker', avatar: 'E' },
  { name: 'Luciana Reis...', amount: '+ R$ 163,30', game: 'Dead or Alive', avatar: 'L' },
  { name: 'André Oliveira...', amount: '+ R$ 82,60', game: 'Jammin Jars', avatar: 'A' },
  { name: 'Isabella Martins...', amount: '+ R$ 319,45', game: 'The Dog House', avatar: 'I' },
  { name: 'Henrique Barbosa...', amount: '+ R$ 127,85', game: 'Sugar Rush', avatar: 'H' },
  { name: 'Rafaela Santos...', amount: '+ R$ 73,20', game: 'Fruit Party', avatar: 'R' },
  { name: 'Diego Fernandes...', amount: '+ R$ 198,50', game: 'Crash X', avatar: 'D' },
  { name: 'Beatriz Lopes...', amount: '+ R$ 254,90', game: 'Zeus vs Hades', avatar: 'B' },
  { name: 'Marcelo Gomes...', amount: '+ R$ 106,70', game: 'Aztec Bonanza', avatar: 'M' }
];

export const categories = [
  { id: 'all', name: 'All', icon: 'flame' },
  { id: 'pragmatic', name: 'Pragmatic Play', icon: 'trophy' },
  { id: 'evolution', name: 'Evolution', icon: 'star' },
  { id: 'relax', name: 'Relax Gaming', icon: 'dice-6' },
  { id: 'jili', name: 'Jili', icon: 'diamond' }
];
