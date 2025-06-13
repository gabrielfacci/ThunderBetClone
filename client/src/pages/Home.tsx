import { useState, useEffect } from 'react';
import { Search, Zap, RotateCcw, Share, Heart, Flame, Trophy, Star, Dice6, Diamond } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/contexts/AppContext';
import { games, winners, categories, GameData, WinnerData } from '@/lib/gameData';
import { GameLoadingModal } from '@/components/modals/GameLoadingModal';
import { InsufficientBalanceModal } from '@/components/modals/InsufficientBalanceModal';
import { DepositModal } from '@/components/modals/DepositModal';
import banner1 from '@assets/banner1_1749828043247.png';
import banner2 from '@assets/banner2_1749828043246.png';
import banner3 from '@assets/csev1741231448021443_1749828043248.webp';
import thunderbetLogo from '@assets/thunderbet-logo_1749830832840.png';

export function Home() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentWinner, setCurrentWinner] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [showGameLoading, setShowGameLoading] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [showDepositFromGame, setShowDepositFromGame] = useState(false);

  // Cycle through winners every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWinner(prev => (prev + 1) % winners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through banners every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatBalance = (balance: number) => {
    return `R$ ${(balance / 100).toFixed(2).replace('.', ',')}`;
  };

  const handleGameClick = (game: GameData) => {
    setSelectedGame(game);
    setShowGameLoading(true);
  };

  const handleLoadingComplete = () => {
    setShowGameLoading(false);
    setShowInsufficientBalance(true);
  };

  const handleDepositFromGame = () => {
    setShowInsufficientBalance(false);
    setShowDepositFromGame(true);
  };

  const handleCloseInsufficientBalance = () => {
    setShowInsufficientBalance(false);
    setSelectedGame(null);
  };

  const handleCloseDeposit = () => {
    setShowDepositFromGame(false);
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <img 
            src={thunderbetLogo} 
            alt="ThunderBet" 
            className="w-8 h-8 object-contain"
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="bg-green-600/20 px-2 py-1 rounded-md flex items-center space-x-1 border border-green-600/30">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm font-medium">
              {formatBalance(user?.balance || 0)}
            </span>
          </div>
          <RotateCcw className="w-4 h-4 text-gray-300" />
          <Share className="w-4 h-4 text-gray-300" />
        </div>
      </header>

      {/* Banner Carousel Section */}
      <div className="px-4 py-2">
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            <div className="min-w-full relative">
              <img 
                src={banner1}
                alt="Banner 1"
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
            
            <div className="min-w-full relative">
              <img 
                src={banner2}
                alt="Banner 2"
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
            
            <div className="min-w-full relative">
              <img 
                src={banner3}
                alt="Banner 3"
                className="w-full h-auto object-cover rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Recent Winner Feed */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-teal-500/20 border-green-400/40 border backdrop-blur-sm rounded-xl p-3 hover:scale-105 group transition-all duration-300 mb-4">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
          <div className="absolute top-1 right-2 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-yellow-300 animate-pulse">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.064a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
          </div>
          <div className="relative flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {winners[currentWinner].avatar}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">{winners[currentWinner].name}</span>
                <span className="text-green-400 text-sm font-bold">{winners[currentWinner].amount}</span>
              </div>
              <div className="text-xs text-gray-400">
                {winners[currentWinner].game}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 pl-10 h-12 rounded-xl"
            placeholder={t('Search games by name or provider')}
          />
        </div>
      </div>

      {/* Game Categories */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => {
              const getIcon = (iconName: string) => {
                switch (iconName) {
                  case 'flame':
                    return <Flame className="h-6 w-6 text-orange-500" />;
                  case 'trophy':
                    return <Trophy className="h-6 w-6 text-yellow-500" />;
                  case 'star':
                    return <Star className="h-6 w-6 text-blue-500" />;
                  case 'dice-6':
                    return <Dice6 className="h-6 w-6 text-green-500" />;
                  case 'diamond':
                    return <Diamond className="h-6 w-6 text-purple-500" />;
                  default:
                    return <Flame className="h-6 w-6 text-orange-500" />;
                }
              };

              return (
                <button
                  key={category.id}
                  className={`flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                    selectedCategory === category.id
                      ? 'bg-green-600/30 border border-green-500/50'
                      : 'bg-gray-800/40 hover:bg-gray-700/50'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {getIcon(category.icon)}
                  <span className="text-xs text-white whitespace-nowrap">{t(category.name)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Games Counter */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-white">{filteredGames.length} {t('games')}</span>
          </div>
          <button className="text-purple-400 text-sm font-medium">{t('Game Lobby →')}</button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {filteredGames.map((game) => (
            <div 
              key={game.id}
              className="bg-gray-800/40 rounded-xl overflow-hidden relative cursor-pointer transition-all duration-200 hover:scale-105"
              onClick={() => handleGameClick(game)}
            >
              <div className="relative">
                <img 
                  src={game.imageUrl} 
                  alt={game.name}
                  className="w-full h-28 object-cover" 
                />
                <button className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                  <Heart className="w-3 h-3 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <h3 className="font-bold text-white text-sm">{game.name}</h3>
                  <p className="text-xs text-gray-300">{game.provider}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <GameLoadingModal
        isOpen={showGameLoading}
        onClose={() => setShowGameLoading(false)}
        game={selectedGame}
        onLoadingComplete={handleLoadingComplete}
      />
      
      <InsufficientBalanceModal
        isOpen={showInsufficientBalance}
        onClose={handleCloseInsufficientBalance}
        game={selectedGame}
        onDeposit={handleDepositFromGame}
      />

      <DepositModal
        isOpen={showDepositFromGame}
        onClose={handleCloseDeposit}
      />
    </div>
  );
}
