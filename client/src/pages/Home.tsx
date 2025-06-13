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
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-purple-900 pb-32 lg:pb-0 pt-20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative flex items-center gap-2 transition-all duration-700 ease-out group hover:scale-110 cursor-pointer">
                <div className="relative transition-all duration-700 w-16 h-16 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)] filter brightness-110 group-hover:drop-shadow-[0_0_40px_rgba(255,215,0,0.8)] group-hover:brightness-125">
                  <div className="absolute inset-0 bg-gradient-radial from-yellow-400/40 via-orange-500/20 to-transparent rounded-full blur-xl -z-30 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-conic from-yellow-300/30 via-amber-400/20 to-orange-500/30 rounded-full blur-lg -z-20 animate-spin-slow"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/25 via-transparent to-amber-500/25 rounded-lg blur-md -z-10"></div>
                  <div className="relative w-full h-full">
                    <img 
                      src={thunderbetLogo} 
                      alt="ThunderBet" 
                      className="w-full h-full object-contain transition-all duration-700 group-hover:drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-600/20 px-3 py-2 rounded-lg flex items-center space-x-2 border border-green-600/30 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">
                  {formatBalance(user?.balance || 0)}
                </span>
              </div>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
                <RotateCcw className="w-4 h-4 text-gray-300" />
              </button>
              <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm">
                <Share className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 space-y-6">
        
        {/* Hero Banners */}
        <section className="relative">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-800/80 via-blue-800/80 to-indigo-900/80 backdrop-blur-lg border border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20"></div>
            <div className="relative">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentBanner * 100}%)` }}
              >
                <div className="min-w-full relative">
                  <img 
                    src={banner1}
                    alt="Banner 1"
                    className="w-full h-48 md:h-64 object-cover"
                  />
                </div>
                <div className="min-w-full relative">
                  <img 
                    src={banner2}
                    alt="Banner 2"
                    className="w-full h-48 md:h-64 object-cover"
                  />
                </div>
                <div className="min-w-full relative">
                  <img 
                    src={banner3}
                    alt="Banner 3"
                    className="w-full h-48 md:h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Winner Feed */}
        <section className="relative overflow-hidden bg-gradient-to-r from-green-500/20 via-emerald-500/15 to-teal-500/20 border-green-400/40 border backdrop-blur-sm rounded-xl p-3 hover:scale-105 group transition-all duration-300">
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
          <div className="absolute top-1 right-2 opacity-60">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-yellow-300 animate-pulse">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.064a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
          </div>
          <div className="relative flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-white">
                {winners[currentWinner].avatar}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm font-medium">{winners[currentWinner].name}</span>
                <span className="text-green-300 text-sm font-bold">{winners[currentWinner].amount}</span>
              </div>
              <div className="text-xs text-gray-300">
                ganhou em {winners[currentWinner].game}
              </div>
            </div>
            <div className="text-xs text-green-300 font-medium">
              🎉 AGORA
            </div>
          </div>
        </section>

        {/* Search */}
        <section>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border-purple-500/30 text-white placeholder-gray-400 pl-12 pr-4 py-4 text-lg rounded-2xl backdrop-blur-sm focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all"
              placeholder="Pesquisar jogos por nome ou provedor..."
            />
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => {
              const getIcon = (iconName: string) => {
                switch (iconName) {
                  case 'flame':
                    return <Flame className="h-6 w-6 text-orange-400" />;
                  case 'trophy':
                    return <Trophy className="h-6 w-6 text-yellow-400" />;
                  case 'star':
                    return <Star className="h-6 w-6 text-blue-400" />;
                  case 'dice-6':
                    return <Dice6 className="h-6 w-6 text-green-400" />;
                  case 'diamond':
                    return <Diamond className="h-6 w-6 text-purple-400" />;
                  default:
                    return <Flame className="h-6 w-6 text-orange-400" />;
                }
              };

              return (
                <button
                  key={category.id}
                  className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-2xl transition-all duration-300 flex-shrink-0 min-w-[100px] ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-br from-purple-600/40 to-blue-600/40 border border-purple-400/50 shadow-lg transform scale-105'
                      : 'bg-black/20 border border-white/10 hover:bg-black/30 hover:border-purple-400/30 backdrop-blur-sm'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className={`p-2 rounded-xl ${selectedCategory === category.id ? 'bg-white/10' : 'bg-transparent'}`}>
                    {getIcon(category.icon)}
                  </div>
                  <span className="text-xs text-white font-medium whitespace-nowrap">{t(category.name)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Games Header */}
        <section>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{filteredGames.length} Jogos</h2>
                <p className="text-sm text-gray-400">Escolha seu jogo favorito</p>
              </div>
            </div>
            <button className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors">
              Ver todos →
            </button>
          </div>
        </section>

        {/* Games Grid */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <div 
                key={game.id}
                className="group relative bg-black/20 rounded-2xl overflow-hidden border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer backdrop-blur-sm"
                onClick={() => handleGameClick(game)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={game.imageUrl} 
                    alt={game.name}
                    className="w-full h-32 lg:h-40 object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <button className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/50">
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-white text-sm mb-1 truncate">{game.name}</h3>
                  <p className="text-xs text-gray-400">{game.provider}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

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