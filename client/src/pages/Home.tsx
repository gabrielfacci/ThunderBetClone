import { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, Share, Heart, Flame, Trophy, Star, Dice6, Diamond, Wallet, RefreshCw, Sparkles } from 'lucide-react';
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
  
  // Drag/swipe functionality for categories
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Drag/swipe functionality for games
  const gamesRef = useRef<HTMLDivElement>(null);
  const [isDraggingGames, setIsDraggingGames] = useState(false);
  const [startXGames, setStartXGames] = useState(0);
  const [scrollLeftGames, setScrollLeftGames] = useState(0);

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate winners
  useEffect(() => {
    const rotateWinner = () => {
      setCurrentWinner((prev) => (prev + 1) % winners.length);
      // Random interval between 10-30 seconds
      const randomInterval = Math.floor(Math.random() * 20000) + 10000;
      setTimeout(rotateWinner, randomInterval);
    };
    
    // Initial random delay
    const initialDelay = Math.floor(Math.random() * 20000) + 10000;
    const timeout = setTimeout(rotateWinner, initialDelay);
    
    return () => clearTimeout(timeout);
  }, []);

  // Categories mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!categoriesRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - categoriesRef.current.offsetLeft);
    setScrollLeft(categoriesRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !categoriesRef.current) return;
    e.preventDefault();
    const x = e.pageX - categoriesRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesRef.current.scrollLeft = scrollLeft - walk;
  };

  // Categories touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!categoriesRef.current) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - categoriesRef.current.offsetLeft);
    setScrollLeft(categoriesRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !categoriesRef.current) return;
    const x = e.touches[0].pageX - categoriesRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Games mouse handlers
  const handleGamesMouseDown = (e: React.MouseEvent) => {
    if (!gamesRef.current) return;
    setIsDraggingGames(true);
    setStartXGames(e.pageX - gamesRef.current.offsetLeft);
    setScrollLeftGames(gamesRef.current.scrollLeft);
  };

  const handleGamesMouseLeave = () => {
    setIsDraggingGames(false);
  };

  const handleGamesMouseUp = () => {
    setIsDraggingGames(false);
  };

  const handleGamesMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingGames || !gamesRef.current) return;
    e.preventDefault();
    const x = e.pageX - gamesRef.current.offsetLeft;
    const walk = (x - startXGames) * 2;
    gamesRef.current.scrollLeft = scrollLeftGames - walk;
  };

  // Games touch handlers
  const handleGamesTouchStart = (e: React.TouchEvent) => {
    if (!gamesRef.current) return;
    setIsDraggingGames(true);
    setStartXGames(e.touches[0].pageX - gamesRef.current.offsetLeft);
    setScrollLeftGames(gamesRef.current.scrollLeft);
  };

  const handleGamesTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingGames || !gamesRef.current) return;
    const x = e.touches[0].pageX - gamesRef.current.offsetLeft;
    const walk = (x - startXGames) * 2;
    gamesRef.current.scrollLeft = scrollLeftGames - walk;
  };

  const handleGamesTouchEnd = () => {
    setIsDraggingGames(false);
  };

  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGameClick = (game: GameData) => {
    if ((user?.balance || 0) < 10) {
      setSelectedGame(game);
      setShowInsufficientBalance(true);
    } else {
      setSelectedGame(game);
      setShowGameLoading(true);
    }
  };

  const handleLoadingComplete = () => {
    setShowGameLoading(false);
    setSelectedGame(null);
    // Here you would typically navigate to the game
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

  const formatBalance = (balance: number) => {
    return `R$ ${balance.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-purple-500/20">
        <div className="px-4 py-3 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="relative flex items-center transition-all duration-700 ease-out group hover:scale-110 cursor-pointer">
              <img 
                src={thunderbetLogo} 
                alt="ThunderBet" 
                className="h-16 w-auto transition-all duration-700 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)] filter brightness-110 group-hover:drop-shadow-[0_0_35px_rgba(255,215,0,0.8)]"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <Wallet className="h-4 w-4 text-green-400" />
                <span className="text-green-400 font-medium">
                  {formatBalance(user?.balance || 0)}
                </span>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-6 w-6 text-green-400 hover:text-green-300 hover:bg-green-400/10">
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Share className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Content Container */}
      <div className="pt-20">
        {/* Banner Section */}
        <div className="px-4 mb-2 max-w-md mx-auto">
          <div className="relative overflow-hidden rounded-3xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              <div className="min-w-full">
                <img 
                  src={banner1}
                  alt="Banner 1"
                  className="w-full h-32 object-cover rounded-3xl"
                />
              </div>
              <div className="min-w-full">
                <img 
                  src={banner2}
                  alt="Banner 2"
                  className="w-full h-32 object-cover rounded-3xl"
                />
              </div>
              <div className="min-w-full">
                <img 
                  src={banner3}
                  alt="Banner 3"
                  className="w-full h-32 object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Winner Feed */}
        <div className="px-4 mb-4 max-w-md mx-auto">
          {(() => {
            // Extract numeric value from amount string (e.g., "R$ 225,00" -> 225)
            const amountValue = parseFloat(winners[currentWinner].amount.replace(/[^\d,]/g, '').replace(',', '.'));
            const isHighValue = amountValue > 200;
            
            return (
              <div className={`relative overflow-hidden ${
                isHighValue 
                  ? 'bg-gradient-to-r from-yellow-500/20 via-orange-500/15 to-red-500/20 border-yellow-400/40' 
                  : 'bg-gradient-to-r from-gray-500/20 via-gray-600/15 to-gray-700/20 border-gray-400/40'
              } border backdrop-blur-sm rounded-xl p-3 hover:scale-105 group transition-all duration-300`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
                {isHighValue && (
                  <div className="absolute top-1 right-2 opacity-60">
                    <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
                  </div>
                )}
                <div className="relative flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {winners[currentWinner].avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">{winners[currentWinner].name}</span>
                      <span className={`text-sm font-bold ${
                        isHighValue ? 'text-yellow-300' : 'text-green-300'
                      }`}>{winners[currentWinner].amount}</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      {winners[currentWinner].game}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            );
          })()}
        </div>
        
        {/* Main Content Section */}
        <div className="px-4 pb-24 max-w-md mx-auto">
          <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30 space-y-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border-gray-600/30 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl backdrop-blur-sm"
                placeholder="Buscar jogos por nome ou provedor"
              />
            </div>

            {/* Categories */}
            <div 
              ref={categoriesRef}
              className="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar select-none cursor-grab smooth-scroll drag-container"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {categories.map((category) => {
                const getIcon = (iconName: string) => {
                  switch (iconName) {
                    case 'flame':
                      return <Flame className="w-6 h-6 text-orange-500" />;
                    case 'trophy':
                      return <Trophy className="w-6 h-6 text-yellow-500" />;
                    case 'star':
                      return <Star className="w-6 h-6 text-blue-500" />;
                    case 'dice-6':
                      return <Dice6 className="w-6 h-6 text-green-500" />;
                    case 'diamond':
                      return <Diamond className="w-6 h-6 text-purple-500" />;
                    default:
                      return <Flame className="w-6 h-6 text-orange-500" />;
                  }
                };

                return (
                  <button
                    key={category.id}
                    className={`flex flex-col items-center justify-center space-y-1 px-4 py-3 rounded-xl transition-colors flex-shrink-0 min-w-[80px] ${
                      selectedCategory === category.id 
                        ? 'bg-gray-800/60 border border-gray-600/50' 
                        : 'bg-transparent'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {getIcon(category.icon)}
                    <span className="text-xs text-white whitespace-nowrap">{t(category.name)}</span>
                  </button>
                );
              })}
            </div>

            {/* Games Counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-white">{filteredGames.length} jogos</span>
              </div>
              <button className="text-gray-400 text-sm">Game Lobby →</button>
            </div>

            {/* Games Grid */}
            <div 
              ref={gamesRef}
              className="flex space-x-3 overflow-x-auto pb-2 custom-scrollbar select-none cursor-grab smooth-scroll drag-container"
              style={{ cursor: isDraggingGames ? 'grabbing' : 'grab' }}
              onMouseDown={handleGamesMouseDown}
              onMouseLeave={handleGamesMouseLeave}
              onMouseUp={handleGamesMouseUp}
              onMouseMove={handleGamesMouseMove}
              onTouchStart={handleGamesTouchStart}
              onTouchMove={handleGamesTouchMove}
              onTouchEnd={handleGamesTouchEnd}
            >
              {filteredGames.map((game) => (
                <div 
                  key={game.id}
                  className="bg-gray-800/40 rounded-xl overflow-hidden relative cursor-pointer flex-shrink-0 w-40"
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
                  <div className="p-2">
                    <h3 className="text-white text-xs font-medium truncate">{game.name}</h3>
                    <p className="text-gray-400 text-xs truncate">{game.provider}</p>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
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