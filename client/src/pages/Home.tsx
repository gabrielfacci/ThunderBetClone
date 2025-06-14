import { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, Share, Heart, Flame, Trophy, Star, Dice6, Diamond, Wallet, RefreshCw, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const gamesPerPage = 12;
  
  // Drag/swipe functionality for categories
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  


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

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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



  // Filter games
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const endIndex = startIndex + gamesPerPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

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
        <div className="container mx-auto px-4 py-3 pt-[5px] pb-[5px] pl-[12px] pr-[12px] text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative flex items-center gap-2 transition-all duration-700 ease-out group hover:scale-110 cursor-pointer">
                <div className="relative transition-all duration-700 w-16 h-16 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)] filter brightness-110 group-hover:drop-shadow-[0_0_35px_rgba(255,215,0,0.8)]">
                  <img 
                    src={thunderbetLogo} 
                    alt="ThunderBet" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2 pt-[0px] pb-[0px] mt-[0px] mb-[0px] pl-[5px] pr-[5px]">
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
        <div className="mb-3">
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
        <div className="mb-3">
          {(() => {
            // Extract numeric value from amount string (e.g., "R$ 225,00" -> 225)
            const amountValue = parseFloat(winners[currentWinner].amount.replace(/[^\d,]/g, '').replace(',', '.'));
            const isHighValue = amountValue > 200;
            
            return (
              <div className={`relative overflow-hidden mx-2 ${
                isHighValue 
                  ? 'bg-gradient-to-r from-yellow-500/20 via-orange-500/15 to-red-500/20 border-yellow-400/40' 
                  : 'bg-gradient-to-r from-gray-500/20 via-gray-600/15 to-gray-700/20 border-gray-400/40'
              } border backdrop-blur-sm rounded-xl p-2.5 sm:p-3 hover:scale-105 group transition-all duration-300 touch-manipulation`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
                {isHighValue && (
                  <div className="absolute top-1 right-2 opacity-60">
                    <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-300 animate-pulse" />
                  </div>
                )}
                <div className="relative flex items-center space-x-2 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {winners[currentWinner].avatar}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-xs sm:text-sm font-medium truncate">{winners[currentWinner].name}</span>
                      <span className={`text-xs sm:text-sm font-bold flex-shrink-0 ${
                        isHighValue ? 'text-yellow-300' : 'text-green-300'
                      }`}>{winners[currentWinner].amount}</span>
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-300 truncate">
                      {winners[currentWinner].game}
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                </div>
              </div>
            );
          })()}
        </div>
        
        {/* Main Content Section */}
        <div className="pb-[87px]">
          <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl mx-2 p-3 sm:p-4 border border-gray-700/30 space-y-4 sm:space-y-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border-gray-600/30 text-white placeholder-gray-400 pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-xl backdrop-blur-sm text-sm sm:text-base touch-manipulation"
                placeholder="Buscar jogos por nome ou provedor"
              />
            </div>

            {/* Categories */}
            <div 
              ref={categoriesRef}
              className="flex space-x-2 sm:space-x-3 overflow-x-auto pb-2 custom-scrollbar select-none cursor-grab smooth-scroll drag-container -mx-1"
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
                      return <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500" />;
                    case 'trophy':
                      return <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500" />;
                    case 'star':
                      return <Star className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />;
                    case 'dice-6':
                      return <Dice6 className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />;
                    case 'diamond':
                      return <Diamond className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500" />;
                    default:
                      return <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-orange-500" />;
                  }
                };

                return (
                  <button
                    key={category.id}
                    className={`flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 px-2.5 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors flex-shrink-0 min-w-[65px] sm:min-w-[80px] touch-manipulation active:scale-95 ${
                      selectedCategory === category.id 
                        ? 'bg-gray-800/60 border border-gray-600/50' 
                        : 'bg-transparent'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {getIcon(category.icon)}
                    <span className="text-[10px] sm:text-xs text-white whitespace-nowrap">{t(category.name)}</span>
                  </button>
                );
              })}
            </div>

            {/* Games Counter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                <span className="font-medium text-white text-sm sm:text-base">{filteredGames.length} jogos</span>
              </div>
              <button className="text-gray-400 text-xs sm:text-sm touch-manipulation">Game Lobby →</button>
            </div>

            {/* Games Grid */}
            <div id="games-section">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {currentGames.map((game) => (
                  <div 
                    key={game.id}
                    className="relative bg-gray-900/50 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 touch-manipulation cursor-pointer"
                    onClick={() => handleGameClick(game)}
                  >
                    <div className="relative h-28 sm:h-32 overflow-hidden rounded-t-xl">
                      <img 
                        alt={game.name}
                        loading="lazy"
                        decoding="async"
                        src={game.imageUrl}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('placeholder')) {
                            target.src = `/game-images/placeholder.svg`;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <button className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                        <Heart className="h-4 w-4 text-white" />
                      </button>
                      <div className="absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-[#00000078] text-[#ffffff] text-center">
                        {game.provider}
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 bg-gray-900/80">
                      <h3 className="text-white text-xs sm:text-sm font-medium truncate">{game.name}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 sm:mt-6 px-1 sm:px-2">
                  {/* Mobile-first responsive pagination */}
                  <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    {/* Page info */}
                    <div className="flex items-center justify-center sm:justify-start space-x-1.5 sm:space-x-2">
                      <span className="text-gray-400 text-xs sm:text-sm">
                        Página {currentPage} de {totalPages}
                      </span>
                      <span className="text-gray-500 text-[10px] sm:text-xs hidden sm:inline">
                        ({filteredGames.length} jogos)
                      </span>
                    </div>
                    
                    {/* Navigation controls */}
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center w-7 h-7 sm:w-10 sm:h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation active:scale-95"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-5 sm:h-5" />
                      </button>
                      
                      {/* Page Numbers - responsive display */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                          let pageNum;
                          const maxPages = isMobile ? 3 : 5;
                          
                          if (totalPages <= maxPages) {
                            pageNum = i + 1;
                          } else if (currentPage <= Math.floor(maxPages / 2) + 1) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - Math.floor(maxPages / 2)) {
                            pageNum = totalPages - maxPages + 1 + i;
                          } else {
                            pageNum = currentPage - Math.floor(maxPages / 2) + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                                currentPage === pageNum
                                  ? 'bg-purple-600 text-white border border-purple-500'
                                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:text-white hover:bg-gray-700/50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Mobile game count */}
                  <div className="flex justify-center mt-2 sm:hidden">
                    <span className="text-gray-500 text-xs">
                      {filteredGames.length} {t('games')}
                    </span>
                  </div>
                </div>
              )}
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