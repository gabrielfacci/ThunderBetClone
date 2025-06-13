import { useState, useEffect } from 'react';
import { Search, Zap, RotateCcw, Share, Heart, Flame } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/contexts/AppContext';
import { games, winners, categories, GameData, WinnerData } from '@/lib/gameData';
import { GameLoadingModal } from '@/components/modals/GameLoadingModal';
import { InsufficientBalanceModal } from '@/components/modals/InsufficientBalanceModal';
import { DepositModal } from '@/components/modals/DepositModal';

export function Home() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentWinner, setCurrentWinner] = useState(0);
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
      <header className="flex items-center justify-between p-4 bg-black/20">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <h1 className="text-lg font-bold">
            <span className="text-yellow-500">THUNDER</span>
            <span className="text-white">BET</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-green-600/20 px-3 py-1 rounded-lg flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm font-medium">
              {formatBalance(user?.balance || 0)}
            </span>
          </div>
          <RotateCcw className="w-4 h-4 text-gray-300" />
          <Share className="w-4 h-4 text-gray-300" />
        </div>
      </header>

      {/* Banner Section */}
      <div className="px-4 py-2">
        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-xl p-4 mb-3 relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
            alt="Gaming promotional banner" 
            className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-30" 
          />
          <div className="relative z-10">
            <div className="bg-white text-black px-3 py-1 rounded-md inline-block mb-2">
              <span className="font-bold text-lg">R$40.000</span>
              <span className="text-sm ml-1">{t('WITH MY GOD DIAMOND')}</span>
            </div>
          </div>
        </div>

        {/* Recent Winner Feed */}
        <div className="thunder-card rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {winners[currentWinner].avatar}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">{winners[currentWinner].name} </span>
              <span className="text-green-400 text-sm font-bold">{winners[currentWinner].amount}</span>
            </div>
            <div className="text-xs text-gray-400">
              {winners[currentWinner].game}
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
            className="thunder-card border-gray-700 text-white placeholder-gray-400 pl-10"
            placeholder={t('Search games by name or provider')}
          />
        </div>
      </div>

      {/* Game Categories */}
      <div className="px-4 mb-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="outline"
              size="sm"
              className={`flex items-center space-x-2 whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'thunder-button-primary border-yellow-500'
                  : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              <span>{t(category.name)}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Games Counter */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{filteredGames.length} {t('games')}</span>
          </div>
          <button className="text-gray-400 text-sm">{t('Game Lobby →')}</button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="px-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {filteredGames.map((game) => (
            <div 
              key={game.id}
              className="game-card"
              onClick={() => handleGameClick(game)}
            >
              <div className="relative">
                <img 
                  src={game.imageUrl} 
                  alt={game.name}
                  className="w-full h-32 object-cover" 
                />
                <button className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                  <Heart className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-white text-sm">{game.name}</h3>
                <p className="text-xs text-gray-400">{game.provider}</p>
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
