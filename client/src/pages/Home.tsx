import { useState, useEffect } from 'react';
import { Search, RotateCcw, Share, Heart, Flame, Trophy, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext } from '@/contexts/AppContext';
import { games, winners, categories, GameData, WinnerData } from '@/lib/gameData';
import { GameLoadingModal } from '@/components/modals/GameLoadingModal';
import { InsufficientBalanceModal } from '@/components/modals/InsufficientBalanceModal';
import { DepositModal } from '@/components/modals/DepositModal';
import banner1 from '@assets/banner1_1749828043247.png';
import banner2 from '@assets/banner2_1749828043246.png';
import banner3 from '@assets/csev1741231448021443_1749828043248.webp';

export function Home() {
  const { t } = useTranslation();
  const { user } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentWinner, setCurrentWinner] = useState(0);
  const [showGameLoading, setShowGameLoading] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [showDepositFromGame, setShowDepositFromGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate winners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWinner((prev) => (prev + 1) % winners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatBalance = (balance: number) => {
    return user?.accountMode === 'national' 
      ? `R$ ${balance.toFixed(2).replace('.', ',')}`
      : `$ ${balance.toFixed(2)}`;
  };

  const handleGameClick = (game: GameData) => {
    setSelectedGame(game);
    if ((user?.balance || 0) < 10) {
      setShowInsufficientBalance(true);
    } else {
      setShowGameLoading(true);
    }
  };

  const handleLoadingComplete = () => {
    setShowGameLoading(false);
    setSelectedGame(null);
  };

  const handleCloseInsufficientBalance = () => {
    setShowInsufficientBalance(false);
    setSelectedGame(null);
  };

  const handleDepositFromGame = () => {
    setShowInsufficientBalance(false);
    setShowDepositFromGame(true);
  };

  const handleCloseDeposit = () => {
    setShowDepositFromGame(false);
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pt-12">
        <div className="flex items-center space-x-2">
          <div className="text-yellow-500 font-bold text-xl">
            THUNDER
          </div>
          <div className="text-white font-bold text-xl">
            BET
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-green-600/20 px-3 py-1 rounded-lg flex items-center space-x-2 border border-green-600/30">
            <span className="text-green-400 text-sm">💰</span>
            <span className="text-green-400 text-sm font-medium">
              {formatBalance(user?.balance || 0)}
            </span>
          </div>
          <button className="p-2">
            <RotateCcw className="w-4 h-4 text-gray-300" />
          </button>
          <button className="p-2">
            <Share className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </header>

      {/* Banner Section */}
      <div className="px-4 mb-4">
        <div className="relative overflow-hidden rounded-xl">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            <div className="min-w-full">
              <img 
                src={banner1}
                alt="Banner 1"
                className="w-full h-32 object-cover rounded-xl"
              />
            </div>
            <div className="min-w-full">
              <img 
                src={banner2}
                alt="Banner 2"
                className="w-full h-32 object-cover rounded-xl"
              />
            </div>
            <div className="min-w-full">
              <img 
                src={banner3}
                alt="Banner 3"
                className="w-full h-32 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Winner Feed */}
      <div className="px-4 mb-4">
        <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-teal-500/20 border border-green-400/40 rounded-xl p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {winners[currentWinner].avatar}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">{winners[currentWinner].name}</span>
                <span className="text-green-300 text-sm font-bold">{winners[currentWinner].amount}</span>
              </div>
              <div className="text-xs text-gray-300">
                {winners[currentWinner].game}
              </div>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border-gray-600/30 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl backdrop-blur-sm"
            placeholder="Buscar jogos por nome ou provedor"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-6">
        <div className="flex space-x-3">
          <button
            className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-xl transition-colors ${
              selectedCategory === 'all'
                ? 'bg-orange-500/20 border border-orange-500/50'
                : 'bg-gray-800/40'
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            <Flame className="w-6 h-6 text-orange-500" />
            <span className="text-xs text-white">Todos</span>
          </button>
          
          <button
            className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-xl transition-colors ${
              selectedCategory === 'pragmatic'
                ? 'bg-yellow-500/20 border border-yellow-500/50'
                : 'bg-gray-800/40'
            }`}
            onClick={() => setSelectedCategory('pragmatic')}
          >
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="text-xs text-white">Pragmatic Play</span>
          </button>
          
          <button
            className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-xl transition-colors ${
              selectedCategory === 'evolution'
                ? 'bg-blue-500/20 border border-blue-500/50'
                : 'bg-gray-800/40'
            }`}
            onClick={() => setSelectedCategory('evolution')}
          >
            <Star className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-white">Evolution</span>
          </button>
        </div>
      </div>

      {/* Games Counter */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-white">{filteredGames.length} jogos</span>
          </div>
          <button className="text-gray-400 text-sm">Game Lobby →</button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="px-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {filteredGames.slice(0, 4).map((game) => (
            <div 
              key={game.id}
              className="bg-gray-800/40 rounded-xl overflow-hidden relative cursor-pointer"
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