import { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, Share, Heart, Flame, Trophy, Star, Dice6, Diamond, Wallet, RefreshCw, Sparkles, ChevronLeft, ChevronRight, LogOut, DollarSign, Coins, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { games, winners, categories, GameData, WinnerData } from '@/lib/gameData';
import { GameLoadingModal } from '@/components/modals/GameLoadingModal';
import { InsufficientBalanceModal } from '@/components/modals/InsufficientBalanceModal';
import { DepositModal } from '@/components/modals/DepositModal';
import { LoginModal } from '@/components/modals/LoginModal';
import { RegisterModal } from '@/components/modals/RegisterModal';
import banner1 from '@assets/banner1_1749828043247.png';
import banner2 from '@assets/banner2_1749828043246.png';
import banner3 from '@assets/csev1741231448021443_1749828043248.webp';
import thunderbetLogo from '@assets/thunderbet-logo_1749830832840.png';

export function Home() {
  const { t } = useLanguage();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [currentWinner, setCurrentWinner] = useState(0);
  const [showGameLoading, setShowGameLoading] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [showDepositFromGame, setShowDepositFromGame] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [likedGames, setLikedGames] = useState<Set<string>>(new Set());
  const gamesPerPage = 12;

  // Função de logout
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Função para curtir/descurtir jogo
  const handleLikeGame = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation(); // Previne o clique no card
    
    setLikedGames(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(gameId)) {
        newLiked.delete(gameId);
      } else {
        newLiked.add(gameId);
      }
      
      // Salva no localStorage para persistir entre sessões
      localStorage.setItem('likedGames', JSON.stringify(Array.from(newLiked)));
      
      return newLiked;
    });
  };

  // Carrega jogos curtidos do localStorage
  useEffect(() => {
    const savedLikes = localStorage.getItem('likedGames');
    if (savedLikes) {
      try {
        const likedArray = JSON.parse(savedLikes);
        setLikedGames(new Set(likedArray));
      } catch (error) {
        console.error('Erro ao carregar jogos curtidos:', error);
      }
    }
  }, []);

  // Função para obter ícones relacionados a apostas/jogos/dinheiro
  const getWinnerIcon = (index: number) => {
    const icons = [
      <DollarSign className="h-3.5 w-3.5 text-green-400" />,
      <Trophy className="h-3.5 w-3.5 text-green-400" />,
      <Coins className="h-3.5 w-3.5 text-green-400" />,
      <Diamond className="h-3.5 w-3.5 text-green-400" />,
      <Dice6 className="h-3.5 w-3.5 text-green-400" />,
      <TrendingUp className="h-3.5 w-3.5 text-green-400" />,
      <Star className="h-3.5 w-3.5 text-green-400" />,
      <Flame className="h-3.5 w-3.5 text-green-400" />
    ];
    return icons[index % icons.length];
  };
  
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
    if (1000.00 < 10) { // Default balance for Supabase users
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-purple-500/20 safe-area-inset-top">
        <div className="px-3 sm:px-4 py-2 sm:py-3 max-w-md mx-auto bg-[#00000042]">
          <div className="flex items-center justify-between">
            <div className="relative flex items-center transition-all duration-700 ease-out group hover:scale-105 cursor-pointer touch-manipulation">
              <img 
                src={thunderbetLogo} 
                alt="ThunderBet" 
                className="h-14 sm:h-18 w-auto transition-all duration-700 drop-shadow-[0_0_25px_rgba(255,215,0,0.6)] filter brightness-110 group-hover:drop-shadow-[0_0_35px_rgba(255,215,0,0.8)]"
              />
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {user ? (
                // Usuário logado - mostrar saldo e botão refresh
                (<>
                  <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-800/60 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                    <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                    <span className="text-green-400 font-medium text-xs sm:text-sm">
                      {formatBalance(profile?.balance || 0)}
                    </span>
                    <button 
                      onClick={() => refreshProfile()}
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors touch-manipulation active:scale-95 h-5 w-5 sm:h-6 sm:w-6 text-green-400 hover:text-green-300 hover:bg-green-400/10"
                    >
                      <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </button>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg transition-colors touch-manipulation active:scale-95 text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </>)
              ) : (
                // Usuário não logado - mostrar botões de login/cadastro
                (<>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-gray-600 text-white hover:bg-gray-700/50 h-8 px-3 text-xs"
                    onClick={() => setShowLoginModal(true)}
                  >
{t('header.login')}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white h-8 px-3 text-xs font-semibold"
                    onClick={() => setShowRegisterModal(true)}
                  >
{t('header.register')}
                  </Button>
                </>)
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Content Container */}
      <div className="pt-16 sm:pt-20">
        {/* Banner Section */}
        <div className="px-4 max-w-md mx-auto pt-[0px] pb-[0px] mt-[20px] mb-[20px]">
          <div className="relative w-full group">
            <div className="relative w-full overflow-hidden rounded-xl">
              <div className={`transition-opacity duration-500 ease-in-out ${currentBanner === 0 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                <img 
                  alt="Banner Promocional 1" 
                  width="400" 
                  height="300" 
                  decoding="async" 
                  data-nimg="1" 
                  className="w-full h-auto object-contain rounded-xl" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw" 
                  src={banner1}
                />
              </div>
              <div className={`transition-opacity duration-500 ease-in-out ${currentBanner === 1 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                <img 
                  alt="Banner Promocional 2" 
                  width="400" 
                  height="300" 
                  decoding="async" 
                  data-nimg="1" 
                  className="w-full h-auto object-contain rounded-xl" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw" 
                  src={banner2}
                />
              </div>
              <div className={`transition-opacity duration-500 ease-in-out ${currentBanner === 2 ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                <img 
                  alt="Banner Promocional 3" 
                  width="400" 
                  height="300" 
                  decoding="async" 
                  data-nimg="1" 
                  className="w-full h-auto object-contain rounded-xl" 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw" 
                  src={banner3}
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
                  <div className="flex-shrink-0 w-7 h-7 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/20">
                    {getWinnerIcon(currentWinner)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium text-[12px] ml-[0px] mr-[0px]">{winners[currentWinner].name}</span>
                      <span className="font-bold text-green-300 text-[12px]">{winners[currentWinner].amount}</span>
                    </div>
                    <div className="text-xs text-gray-300 font-normal">
                      {winners[currentWinner].game === 'Lucky Wheel' ? 'Golden Temple' : winners[currentWinner].game}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-red-500 rounded-full ml-[0px] mr-[0px]"></div>
                </div>
              </div>
            );
          })()}
        </div>
        
        {/* Main Content Section */}
        <div className="pb-6">
          <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30 space-y-6 ml-[15px] mr-[15px] pl-[15px] pr-[15px] pt-[15px] pb-[15px]">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/20 border-gray-600/30 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-xl backdrop-blur-sm"
                placeholder={t('Search games by name or provider')}
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
                <span className="font-medium text-white">{filteredGames.length} {t('games')}</span>
              </div>
              <button className="text-gray-400 text-sm">{t('Game Lobby')} →</button>
            </div>

            {/* Games Grid */}
            <div id="games-section">
              <div className="grid grid-cols-2 gap-4">
                {currentGames.map((game) => (
                  <div 
                    key={game.id}
                    className="relative bg-gray-900/50 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105"
                    onClick={() => handleGameClick(game)}
                  >
                    <div className="relative h-32 overflow-hidden rounded-t-xl">
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
                      <button 
                        className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 hover:bg-black/70 transition-all duration-200 hover:scale-110 group"
                        onClick={(e) => handleLikeGame(e, game.id)}
                      >
                        <Heart 
                          className={`w-3 h-3 transition-all duration-200 ${
                            likedGames.has(game.id) 
                              ? 'text-red-500 fill-red-500 scale-110' 
                              : 'text-white group-hover:text-red-300'
                          }`} 
                        />
                      </button>
                      <div className="absolute bottom-2 left-2 text-xs font-bold px-2 py-1 rounded bg-[#00000078] text-[#ffffff] pt-[5px] pb-[5px] pl-[12px] pr-[12px] text-center">
                        {game.provider}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-900/80">
                      <h3 className="text-white text-sm font-medium truncate">{game.name}</h3>
                      <p className="text-gray-400 text-xs uppercase tracking-wide mt-1">{game.category}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 px-2">
                  {/* Mobile-first responsive pagination */}
                  <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                    {/* Page info */}
                    <div className="flex items-center justify-center sm:justify-start space-x-2">
                      <span className="text-gray-400 text-sm">
                        {t('Page')} {currentPage} {t('of')} {totalPages}
                      </span>
                      <span className="text-gray-500 text-xs hidden sm:inline">
                        ({filteredGames.length} {t('games')})
                      </span>
                    </div>
                    
                    {/* Navigation controls */}
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
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
      {/* Auth Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}