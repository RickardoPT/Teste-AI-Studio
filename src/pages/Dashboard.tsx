import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { getRecommendations, MovieRecommendation } from "@/src/services/ai";
import { enrichWithTMDB } from "@/src/services/tmdb";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card";
import { Sparkles, Film, Tv, History, LogOut, Loader2, Check, Users, MessageSquare, ListPlus, UserPlus, Star, PlayCircle, Info, X, Calendar, MonitorPlay, User, Clapperboard, Filter, Trash2, Clock, CalendarDays, CheckCircle2, Search, Settings, ChevronDown, FileText, Shield, Bell, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const QUICK_MOODS = [
  { emoji: "☀️", label: "Feliz", prompt: "I'm feeling happy and want something uplifting, joyful, and fun." },
  { emoji: "🌧️", label: "Triste", prompt: "I'm feeling sad and need a good cry or something deeply comforting." },
  { emoji: "🗺️", label: "Aventureiro", prompt: "I'm feeling adventurous and want an epic journey, action, or exploration." },
  { emoji: "🛋️", label: "Relaxado", prompt: "I'm feeling relaxed and want something chill, aesthetic, and easy to watch." },
  { emoji: "🤯", label: "Mind-bending", prompt: "I want a mind-bending sci-fi or psychological thriller that makes me question reality." }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mood, setMood] = useState("");
  const [filterType, setFilterType] = useState<"all" | "movie" | "series">("all");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [history, setHistory] = useState<MovieRecommendation[]>([]);
  const [activeTab, setActiveTab] = useState<"discover" | "history" | "community">("discover");
  const [selectedMovie, setSelectedMovie] = useState<MovieRecommendation | null>(null);
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [userComments, setUserComments] = useState<Record<string, string>>({});
  const [commentInput, setCommentInput] = useState("");
  const [historySort, setHistorySort] = useState<"recent" | "rating-high" | "rating-low">("recent");
  const [historySearch, setHistorySearch] = useState("");
  const [historyTypeFilter, setHistoryTypeFilter] = useState<"all" | "movie" | "series">("all");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
    const savedHistory = localStorage.getItem('moodflix_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    const savedRatings = localStorage.getItem('moodflix_ratings');
    if (savedRatings) {
      setUserRatings(JSON.parse(savedRatings));
    }
    const savedComments = localStorage.getItem('moodflix_comments');
    if (savedComments) {
      setUserComments(JSON.parse(savedComments));
    }
  }, [user, navigate]);

  useEffect(() => {
    setHoverRating(0);
    if (selectedMovie) {
      setCommentInput(userComments[selectedMovie.title] || "");
    }
  }, [selectedMovie, userComments]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGetRecommendations = async (e?: React.FormEvent, predefinedMood?: string) => {
    if (e) e.preventDefault();
    const searchMood = predefinedMood || mood;
    if (!searchMood.trim()) return;

    setLoading(true);
    setRecommendations([]);
    try {
      const historyContext = history.slice(0, 15).map(h => ({
        title: h.title,
        rating: userRatings[h.title]
      }));
      const results = await getRecommendations(searchMood, historyContext, filterType);
      setRecommendations(results);
      
      // Fetch TMDB data individually for granular loading
      results.forEach(async (rec) => {
        const enriched = await enrichWithTMDB(rec);
        setRecommendations(prev => {
          // Only update if the recommendation is still in the list
          const index = prev.findIndex(p => p.title === rec.title);
          if (index !== -1) {
            const newRecs = [...prev];
            newRecs[index] = enriched;
            return newRecs;
          }
          return prev;
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (movie: MovieRecommendation) => {
    const existing = history.find(h => h.title === movie.title);
    const movieWithDate = { ...movie, addedAt: existing?.addedAt || new Date().toISOString() };
    const newHistory = [movieWithDate, ...history.filter(h => h.title !== movie.title)];
    setHistory(newHistory);
    localStorage.setItem('moodflix_history', JSON.stringify(newHistory));
    if (!existing) {
      toast.success(`${movie.title} adicionado ao histórico!`);
    }
  };

  const handleRemoveFromHistory = (e: React.MouseEvent, title: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h.title !== title);
    setHistory(newHistory);
    localStorage.setItem('moodflix_history', JSON.stringify(newHistory));
    toast.info(`${title} removido do histórico.`);
  };

  const handleRate = (title: string, rating: number) => {
    const newRatings = { ...userRatings, [title]: rating };
    setUserRatings(newRatings);
    localStorage.setItem('moodflix_ratings', JSON.stringify(newRatings));
    
    // Automatically add to history if rated and not already there
    if (!history.some(h => h.title === title) && selectedMovie) {
      addToHistory(selectedMovie);
    }
    toast.success(`Avaliaste ${title} com ${rating} estrelas!`);
  };

  const handleSaveComment = (title: string) => {
    if (!commentInput.trim()) return;
    const newComments = { ...userComments, [title]: commentInput };
    setUserComments(newComments);
    localStorage.setItem('moodflix_comments', JSON.stringify(newComments));
    
    if (!history.some(h => h.title === title) && selectedMovie) {
      addToHistory(selectedMovie);
    }

    toast.success("Comentário guardado com sucesso!");
  };

  const handleDeleteComment = (title: string) => {
    const newComments = { ...userComments };
    delete newComments[title];
    setUserComments(newComments);
    setCommentInput("");
    localStorage.setItem('moodflix_comments', JSON.stringify(newComments));
    toast.info("Comentário apagado.");
  };

  const sortedHistory = [...history]
    .filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(historySearch.toLowerCase());
      const matchesType = historyTypeFilter === "all" || movie.type === historyTypeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (historySort === "rating-high") {
        return (userRatings[b.title] || 0) - (userRatings[a.title] || 0);
      }
      if (historySort === "rating-low") {
        return (userRatings[a.title] || 0) - (userRatings[b.title] || 0);
      }
      return 0;
    });

  if (!user) return null;

  return (
    <div className="min-h-screen text-foreground flex flex-col relative">
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-[-1] bg-background">
        <img 
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-[0.07] mix-blend-luminosity" 
          alt="Cinematic Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/90 to-background" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg tracking-tight">MoodFlix</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab("discover")}
              className={`text-sm font-medium transition-colors hover:text-primary ${activeTab === "discover" ? "text-primary" : "text-muted-foreground"}`}
            >
              Descobrir
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`text-sm font-medium transition-colors hover:text-primary ${activeTab === "history" ? "text-primary" : "text-muted-foreground"}`}
            >
              Histórico
            </button>
            <button 
              onClick={() => setActiveTab("community")}
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1.5 ${activeTab === "community" ? "text-primary" : "text-muted-foreground"}`}
            >
              Comunidade
              <span className="px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">Novo</span>
            </button>
          </nav>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 hover:bg-muted/50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-border"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">
                {user.name}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-border/50 bg-muted/20">
                      <p className="font-medium text-sm truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          setIsSettingsOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Definições
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Terminar Sessão
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Mobile Tabs */}
        <div className="flex md:hidden mb-8 p-1 bg-muted/50 rounded-xl overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab("discover")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === "discover" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Descobrir
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === "history" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Histórico
          </button>
          <button 
            onClick={() => setActiveTab("community")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${activeTab === "community" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Comunidade
            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">Novo</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "discover" && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Search Section */}
              <section className="flex flex-col items-center text-center space-y-6 py-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
                  <Sparkles className="w-3 h-3" />
                  Powered by Gemini 3.0 Flash
                </div>
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
                  Como te sentes hoje?
                </h1>
                <p className="text-muted-foreground max-w-xl text-lg">
                  Descreve o teu mood ou escolhe uma das opções abaixo. Nós encontramos o filme ou série perfeito para este momento.
                </p>
                
                {/* Quick Moods */}
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {QUICK_MOODS.map((qm, idx) => {
                    const isActive = mood === qm.prompt;
                    return (
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        key={idx}
                        onClick={() => {
                          setMood(qm.prompt);
                          handleGetRecommendations(undefined, qm.prompt);
                        }}
                        className={`px-4 py-2 rounded-full border transition-all duration-300 text-sm font-medium flex items-center gap-2 shadow-sm ${
                          isActive 
                            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                            : "bg-card border-border/50 hover:border-primary/50 hover:bg-primary/10 text-foreground"
                        }`}
                      >
                        <span>{qm.emoji}</span>
                        {qm.label}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Filter Toggle */}
                <div className="flex justify-center gap-2 mt-6">
                  {(["all", "movie", "series"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${
                        filterType === type
                          ? "bg-secondary text-secondary-foreground border-secondary"
                          : "bg-transparent border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                      }`}
                    >
                      {type === "all" ? "Tudo" : type === "movie" ? "Filmes" : "Séries"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleGetRecommendations} className="w-full max-w-2xl relative mt-6">
                  <div className="relative flex items-center">
                    <Input
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="Ou escreve aqui: 'Quero um filme de ficção científica que me faça pensar...'"
                      className="h-14 pl-6 pr-32 rounded-full bg-card border-border/50 text-base shadow-sm focus-visible:ring-primary/50"
                      disabled={loading}
                    />
                    <Button 
                      type="submit" 
                      disabled={loading || !mood.trim()}
                      className="absolute right-2 h-10 rounded-full bg-primary hover:bg-primary/90 text-white px-6"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Recomendar"}
                    </Button>
                  </div>
                </form>
              </section>

              {/* Results Section */}
              {loading ? (
                <section className="space-y-6">
                  <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                    A procurar a combinação perfeita...
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="h-full flex flex-col md:flex-row bg-card/50 border-border/50 overflow-hidden">
                        <div className="w-full md:w-2/5 aspect-[2/3] md:aspect-auto bg-muted animate-pulse" />
                        <div className="flex flex-col flex-1 p-5 space-y-4">
                          <div className="space-y-2">
                            <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
                            <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded animate-pulse w-full" />
                            <div className="h-4 bg-muted rounded animate-pulse w-full" />
                            <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <div className="h-10 bg-muted rounded animate-pulse flex-1" />
                            <div className="h-10 bg-muted rounded animate-pulse flex-1" />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ) : recommendations.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    Combinações Perfeitas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, index) => (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                        whileHover={{ y: -12, scale: 1.03 }}
                        key={index}
                        className="h-full"
                      >
                        <Card className="h-full flex flex-col md:flex-row bg-card/50 border-border/50 hover:border-primary/60 transition-all duration-400 group hover:shadow-[0_15px_40px_rgba(249,115,22,0.25)] overflow-hidden relative">
                          {/* Hover Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          {/* Poster Section */}
                          <div className="w-full md:w-2/5 relative aspect-[2/3] md:aspect-auto bg-muted flex-shrink-0">
                            {rec.posterUrl ? (
                              <img 
                                src={rec.posterUrl} 
                                alt={rec.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted/50 animate-pulse">
                                <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                  <span className="text-xs text-muted-foreground font-medium">A carregar detalhes...</span>
                                </div>
                              </div>
                            )}
                            {/* Rating Badge */}
                            {rec.posterUrl === undefined ? (
                              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10 shadow-lg w-12 h-7 animate-pulse">
                                <div className="w-3.5 h-3.5 rounded-full bg-white/20" />
                                <div className="w-4 h-3 rounded bg-white/20" />
                              </div>
                            ) : rec.rating ? (
                              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md text-white px-2 py-1 rounded-md flex items-center gap-1 text-sm font-bold border border-white/10 shadow-lg">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                {rec.rating}
                              </div>
                            ) : null}
                          </div>

                          {/* Content Section */}
                          <div className="flex flex-col flex-1 p-5">
                            <div className="mb-4">
                              <h3 className="text-2xl font-display font-bold mb-1 group-hover:text-primary transition-colors leading-tight">{rec.title}</h3>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span>{rec.year}</span>
                                <span>•</span>
                                <span className="capitalize flex items-center gap-1">
                                  {rec.type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                                  {rec.type === 'movie' ? 'Filme' : 'Série'}
                                </span>
                                <span>•</span>
                                <span className="text-primary/90 font-medium">{rec.genre}</span>
                              </div>
                            </div>
                            
                            <div className="flex-1 space-y-4">
                              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">{rec.description}</p>
                              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
                                <span className="font-medium text-primary block mb-1">Porque combina com o teu mood:</span>
                                {rec.reason}
                              </div>
                            </div>

                            {/* Providers Section */}
                            {rec.posterUrl === undefined ? (
                              <div className="mt-4 pt-4 border-t border-border/50">
                                <span className="text-xs font-medium text-muted-foreground mb-2 block">Onde ver:</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-md bg-muted animate-pulse" />
                                  <div className="w-8 h-8 rounded-md bg-muted animate-pulse" />
                                </div>
                              </div>
                            ) : rec.providers && rec.providers.length > 0 ? (
                              <div className="mt-4 pt-4 border-t border-border/50">
                                <span className="text-xs font-medium text-muted-foreground mb-2 block">Onde ver:</span>
                                <div className="flex items-center gap-2">
                                  {rec.providers.map((p, i) => (
                                    <a 
                                      key={i} 
                                      href={p.link || "#"} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="transition-transform hover:scale-110"
                                      title={`Ver na ${p.name}`}
                                      onClick={(e) => {
                                        if (!p.link) e.preventDefault();
                                        e.stopPropagation();
                                      }}
                                    >
                                      <img 
                                        src={p.logoUrl} 
                                        alt={p.name} 
                                        className="w-8 h-8 rounded-md object-cover border border-border/50"
                                        referrerPolicy="no-referrer"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            <div className="mt-4 pt-4 flex flex-col sm:flex-row gap-3">
                              <Button 
                                variant="default" 
                                className="w-full sm:w-1/2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(249,115,22,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => setSelectedMovie(rec)}
                                disabled={rec.posterUrl === undefined}
                              >
                                <Info className="w-4 h-4 mr-2" /> Ver Detalhes
                              </Button>
                              <Button 
                                variant="outline" 
                                className="w-full sm:w-1/2 rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => addToHistory(rec)}
                                disabled={rec.posterUrl === undefined}
                              >
                                {history.some(h => h.title === rec.title) ? (
                                  <><Check className="w-4 h-4 mr-2" /> Adicionado</>
                                ) : (
                                  <><History className="w-4 h-4 mr-2" /> Visto</>
                                )}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 py-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-display font-bold">O Teu Histórico</h2>
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {sortedHistory.length} {sortedHistory.length === 1 ? 'Título' : 'Títulos'}
                  </span>
                </div>
                
                {history.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text"
                        placeholder="Pesquisar no histórico..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="w-full bg-card border border-border/50 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                        {(["all", "movie", "series"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setHistoryTypeFilter(type)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                              historyTypeFilter === type
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {type === "all" ? "Todos" : type === "movie" ? "Filmes" : "Séries"}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 bg-card border border-border/50 rounded-lg px-2 py-1">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <select 
                          className="bg-transparent text-sm focus:outline-none focus:ring-0 py-1"
                          value={historySort}
                          onChange={(e) => setHistorySort(e.target.value as any)}
                        >
                          <option value="recent">Mais Recentes</option>
                          <option value="rating-high">Melhor Avaliação</option>
                          <option value="rating-low">Pior Avaliação</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5">
                  <motion.div 
                    animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Film className="w-16 h-16 text-primary mb-4 opacity-80" />
                  </motion.div>
                  <h3 className="text-2xl font-display font-bold mb-2 text-foreground">O teu ecrã está vazio! 🍿</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    Ainda não guardaste nenhum filme ou série. Que tal descobrires a tua próxima maratona agora mesmo?
                  </p>
                  <Button 
                    className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg hover:shadow-primary/50 transition-all font-bold px-8 py-6 text-lg hover:scale-105"
                    onClick={() => setActiveTab("discover")}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Descobrir Magia
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedHistory.map((movie, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut", type: "spring", bounce: 0.4 }}
                      whileHover={{ y: -8, scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
                      className="h-full"
                    >
                      <Card className="h-full bg-card/30 border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(225,29,72,0.15)] overflow-hidden group relative">
                        {/* Remove Button */}
                        <button
                          onClick={(e) => handleRemoveFromHistory(e, movie.title)}
                          className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-lg hover:scale-110"
                          title="Remover do Histórico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {movie.posterUrl && (
                          <div className="w-full aspect-video relative bg-muted">
                            <img 
                              src={movie.posterUrl} 
                              alt={movie.title} 
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                          </div>
                        )}
                        <CardHeader className={`p-4 pb-2 ${movie.posterUrl ? '-mt-12 relative z-10' : ''}`}>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">{movie.title}</CardTitle>
                          <CardDescription className="text-xs flex flex-col gap-1.5 mt-1">
                            <div className="flex items-center gap-2">
                              <span>{movie.year}</span>
                              <span className="capitalize">{movie.type === 'movie' ? 'Filme' : 'Série'}</span>
                              {(movie.rating || userRatings[movie.title]) && (
                                <span className="flex items-center gap-1 text-yellow-500">
                                  <Star className="w-3 h-3 fill-current" /> {userRatings[movie.title] || movie.rating}
                                </span>
                              )}
                            </div>
                            {movie.addedAt && (
                              <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                                Adicionado a {new Date(movie.addedAt).toLocaleDateString('pt-PT')}
                              </span>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 flex-1 flex flex-col">
                          <span className="inline-block px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground mb-2 self-start">
                            {movie.genre}
                          </span>
                          
                          {userComments[movie.title] ? (
                            <div className="mb-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex-1 relative group">
                              <div className="flex items-center gap-1.5 mb-1">
                                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs font-semibold text-primary">A tua nota:</span>
                              </div>
                              <p className="text-xs text-foreground/80 italic line-clamp-3">"{userComments[movie.title]}"</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComment(movie.title);
                                }}
                                title="Apagar comentário"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1">
                              {movie.description}
                            </p>
                          )}
                          
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="w-full rounded-lg text-xs mt-auto"
                            onClick={() => setSelectedMovie(movie)}
                          >
                            <Info className="w-3 h-3 mr-2" /> Ver Detalhes
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "community" && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8 py-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
                <div>
                  <h2 className="text-3xl font-display font-bold mb-2">Comunidade</h2>
                  <p className="text-muted-foreground">Conecta-te com outros cinéfilos e partilha as tuas vibes.</p>
                </div>
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Em Desenvolvimento
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <Card className="bg-card/40 border-border/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Fóruns por Mood</CardTitle>
                    <CardDescription>Discute filmes e séries em salas categorizadas por géneros e emoções.</CardDescription>
                  </CardHeader>
                </Card>

                {/* Feature 2 */}
                <Card className="bg-card/40 border-border/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
                      <ListPlus className="w-6 h-6 text-secondary" />
                    </div>
                    <CardTitle>Listas Curadas</CardTitle>
                    <CardDescription>Cria e partilha as tuas próprias listas (ex: "Filmes para dias de chuva").</CardDescription>
                  </CardHeader>
                </Card>

                {/* Feature 3 */}
                <Card className="bg-card/40 border-border/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader>
                    <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                      <UserPlus className="w-6 h-6 text-accent" />
                    </div>
                    <CardTitle>Seguir Utilizadores</CardTitle>
                    <CardDescription>Acompanha o que os teus amigos estão a ver e descobre novas recomendações.</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Mock Feed Preview */}
              <div className="mt-12 opacity-50 pointer-events-none select-none">
                <h3 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" /> Feed Recente (Preview)
                </h3>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-2xl border border-border/50 bg-card/20 flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                      <div>
                        <p className="text-sm"><span className="font-medium text-foreground">User{i}</span> adicionou <strong>Interstellar</strong> à lista "Mind-blowing Sci-Fi"</p>
                        <p className="text-xs text-muted-foreground mt-1">Há 2 horas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Movie Details Modal */}
        <AnimatePresence>
          {selectedMovie && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedMovie(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-4xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
              >
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedMovie(null)} 
                  className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="overflow-y-auto hide-scrollbar">
                  {/* Backdrop */}
                  <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-[450px] bg-muted flex-shrink-0">
                    {selectedMovie.backdropUrl ? (
                      <img src={selectedMovie.backdropUrl} alt="Backdrop" className="w-full h-full object-cover" />
                    ) : selectedMovie.posterUrl ? (
                      <img src={selectedMovie.posterUrl} alt="Backdrop" className="w-full h-full object-cover blur-xl opacity-40" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/50">
                        <Clapperboard className="w-12 sm:w-20 h-12 sm:h-20 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-card/80 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative px-4 sm:px-8 md:px-10 pb-10 -mt-20 sm:-mt-32 md:-mt-40 lg:-mt-56 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                    {/* Poster */}
                    <div className="w-32 sm:w-40 md:w-56 lg:w-72 flex-shrink-0 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-muted z-10">
                      {selectedMovie.posterUrl ? (
                        <img src={selectedMovie.posterUrl} className="w-full h-auto object-cover" alt={selectedMovie.title} />
                      ) : (
                        <div className="w-full aspect-[2/3] flex items-center justify-center bg-muted/50">
                          <Film className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 pt-2 md:pt-10 lg:pt-16 z-10 flex flex-col items-center md:items-start text-center md:text-left w-full">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                        {selectedMovie.rating && (
                          <span className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1.5 rounded-full text-sm font-bold backdrop-blur-md" title="Média Global (TMDB)">
                            <Star className="w-4 h-4 fill-current" /> {selectedMovie.rating}
                            <span className="text-xs font-medium opacity-80 ml-1 hidden sm:inline-block">TMDB</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm font-medium text-foreground/90 backdrop-blur-md">
                          <Calendar className="w-4 h-4 text-muted-foreground" /> {selectedMovie.releaseDate ? new Date(selectedMovie.releaseDate).getFullYear() : selectedMovie.year}
                        </span>
                        {selectedMovie.runtime && (
                          <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm font-medium text-foreground/90 backdrop-blur-md">
                            <Clock className="w-4 h-4 text-muted-foreground" /> {selectedMovie.runtime} min
                          </span>
                        )}
                        <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm font-medium text-foreground/90 capitalize backdrop-blur-md">
                          {selectedMovie.type === 'movie' ? <Film className="w-4 h-4 text-muted-foreground" /> : <MonitorPlay className="w-4 h-4 text-muted-foreground" />}
                          {selectedMovie.type === 'movie' ? 'Filme' : 'Série'}
                        </span>
                        <span className="flex items-center gap-1 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full text-sm font-medium text-primary backdrop-blur-md">
                          {selectedMovie.tmdbGenres && selectedMovie.tmdbGenres.length > 0 ? selectedMovie.tmdbGenres.join(", ") : selectedMovie.genre}
                        </span>
                      </div>
                      
                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 md:mb-8 leading-[1.1] tracking-tight text-white drop-shadow-lg">{selectedMovie.title}</h2>

                      <div className="space-y-6 md:space-y-8 w-full">
                        {/* Director & Cast */}
                        {(selectedMovie.director || (selectedMovie.cast && selectedMovie.cast.length > 0)) && (
                          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm text-left w-full">
                            {selectedMovie.director && (
                              <div className="flex-1 min-w-[140px]">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Realizador / Criador</span>
                                <span className="text-sm font-medium flex items-center gap-2">
                                  <User className="w-4 h-4 text-primary" /> {selectedMovie.director}
                                </span>
                              </div>
                            )}
                            {selectedMovie.cast && selectedMovie.cast.length > 0 && (
                              <div className="flex-[2] min-w-[200px]">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold block mb-1">Elenco Principal</span>
                                <span className="text-sm font-medium flex items-center gap-2">
                                  <Users className="w-4 h-4 text-primary" /> {selectedMovie.cast.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-left w-full">
                          <h3 className="text-xl font-display font-semibold mb-3 text-foreground/90">Sinopse</h3>
                          <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">{selectedMovie.description}</p>
                        </div>

                        {selectedMovie.reason && (
                          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 relative overflow-hidden text-left w-full">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none" />
                            <div className="flex items-center gap-2 mb-2 sm:mb-3 relative z-10">
                              <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                              <h3 className="font-display font-semibold text-primary text-base sm:text-lg">Porque é perfeito para o teu mood</h3>
                            </div>
                            <p className="text-foreground/90 leading-relaxed relative z-10 text-sm sm:text-base">{selectedMovie.reason}</p>
                          </div>
                        )}

                        {selectedMovie.providers && selectedMovie.providers.length > 0 && (
                          <div className="text-left w-full">
                            <h3 className="text-lg sm:text-xl font-display font-semibold mb-3 sm:mb-4 text-foreground/90">Onde Assistir (Portugal)</h3>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                              {selectedMovie.providers.map(p => (
                                <a 
                                  key={p.name} 
                                  href={p.link || "#"} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 bg-card border border-border/50 rounded-2xl p-2 pr-4 sm:pr-5 hover:border-primary/50 hover:bg-primary/5 transition-all hover:-translate-y-1"
                                  onClick={(e) => {
                                    if (!p.link) e.preventDefault();
                                  }}
                                >
                                  <img src={p.logoUrl} alt={p.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-sm" />
                                  <span className="text-xs sm:text-sm font-medium">{p.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* User Rating & Comment Section */}
                        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-card border border-border/50 w-full">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="text-left">
                              <h3 className="font-display font-semibold text-foreground/90">A tua avaliação</h3>
                              <p className="text-sm text-muted-foreground">O que achaste deste título?</p>
                            </div>
                            <div className="flex gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                              {[1, 2, 3, 4, 5].map((star) => {
                                const currentRating = userRatings[selectedMovie.title] || 0;
                                const isActive = star <= (hoverRating || currentRating);
                                return (
                                  <button
                                    key={star}
                                    onClick={() => handleRate(selectedMovie.title, star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                  >
                                    <Star
                                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                        isActive
                                          ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                                          : "text-muted-foreground/30 hover:text-muted-foreground/50"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="w-full pt-4 border-t border-border/50">
                            {userComments[selectedMovie.title] ? (
                              <div className="bg-background/50 border border-border/50 rounded-xl p-4 relative group">
                                <p className="text-foreground/90 italic leading-relaxed text-sm pr-8">"{userComments[selectedMovie.title]}"</p>
                                <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/50">
                                  {userComments[selectedMovie.title].length}/500
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                  onClick={() => handleDeleteComment(selectedMovie.title)}
                                  title="Apagar comentário"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="relative">
                                  <textarea
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value.slice(0, 500))}
                                    placeholder="Escreve aqui o teu comentário ou review..."
                                    className="w-full bg-background/50 border border-border/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24 placeholder:text-muted-foreground/50 pb-8"
                                    maxLength={500}
                                  />
                                  <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                                    {commentInput.length}/500
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleSaveComment(selectedMovie.title)}
                                    disabled={!commentInput.trim()}
                                    className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6 transition-all shadow-md shadow-primary/20"
                                  >
                                    Guardar Comentário
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-6 sm:pt-8 border-t border-border/50 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                          <Button 
                            size="lg" 
                            className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] flex-1 h-14 text-lg transition-all"
                            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedMovie.title + ' trailer')}`, '_blank')}
                          >
                            <PlayCircle className="w-6 h-6 mr-2" /> Ver Trailer (YouTube)
                          </Button>
                          <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full border-border/50 hover:bg-white/5 hover:text-foreground flex-1 h-14 text-lg transition-all"
                            onClick={() => addToHistory(selectedMovie)}
                          >
                            {history.some(h => h.title === selectedMovie.title) ? (
                              <><Check className="w-5 h-5 mr-2 text-primary" /> Adicionado ao Histórico</>
                            ) : (
                              <><History className="w-5 h-5 mr-2" /> Marcar como Visto</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsSettingsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                  <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Definições
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(false)} className="rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-8">
                  {/* Perfil */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Perfil</h3>
                    <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                      <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </section>

                  {/* Preferências */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Preferências</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Notificações</span>
                        </div>
                        <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Moon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Tema Escuro</span>
                        </div>
                        <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Legal */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Legal & Suporte</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => {
                          setIsSettingsOpen(false);
                          setIsTermsOpen(true);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Termos e Serviços</span>
                        </div>
                      </button>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Política de Privacidade</span>
                        </div>
                      </button>
                    </div>
                  </section>

                  {/* Danger Zone */}
                  <section className="space-y-4 pt-4 border-t border-border/50">
                    <button 
                      onClick={() => {
                        toast.error("Ação não disponível na versão de demonstração.");
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Apagar Conta
                    </button>
                  </section>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Terms Modal */}
        <AnimatePresence>
          {isTermsOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsTermsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
                  <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Termos e Serviços
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsTermsOpen(false)} className="rounded-full hover:bg-muted">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="p-6 md:p-8 overflow-y-auto space-y-8 text-sm text-foreground/80 leading-relaxed">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">1. Aceitação dos Termos</h3>
                    <p>
                      Ao aceder e utilizar o MoodFlix ("Plataforma", "Nós", "Nosso"), o utilizador concorda em ficar vinculado aos presentes Termos e Serviços. Se não concordar com alguma parte destes termos, não deverá utilizar o nosso serviço. O MoodFlix é uma plataforma de recomendação de filmes e séries baseada em Inteligência Artificial.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">2. Descrição do Serviço e Uso de IA</h3>
                    <p>
                      O MoodFlix utiliza modelos avançados de Inteligência Artificial (incluindo, mas não limitado a, Google Gemini) para analisar o estado de espírito ("mood") do utilizador e sugerir conteúdo audiovisual relevante.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>As recomendações são geradas de forma algorítmica e não garantimos a precisão, adequação ou qualidade do conteúdo sugerido.</li>
                      <li>O utilizador compreende que a IA pode, ocasionalmente, gerar resultados inesperados ou imprecisos (alucinações).</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">3. Contas de Utilizador e Dados</h3>
                    <p>
                      Para utilizar funcionalidades como o "Histórico", "Avaliações" e "Comentários", é necessário criar uma conta.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>O utilizador é responsável por manter a confidencialidade das suas credenciais.</li>
                      <li>Os dados de histórico e avaliações são armazenados para personalizar futuras recomendações.</li>
                      <li>Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos ou apresentem comportamento abusivo.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">4. Propriedade Intelectual e Dados de Terceiros</h3>
                    <p>
                      O MoodFlix atua como um agregador e motor de recomendação. Não alojamos filmes nem séries.
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>TMDB:</strong> Os metadados de filmes e séries (títulos, sinopses, posters, elencos) são fornecidos pela API do The Movie Database (TMDB). O MoodFlix usa a API do TMDB mas não é endossado nem certificado pelo TMDB.</li>
                      <li><strong>YouTube:</strong> Os links para trailers redirecionam para o YouTube. O conteúdo dos trailers é propriedade dos respetivos estúdios e distribuidores.</li>
                      <li><strong>Plataformas de Streaming:</strong> Os logótipos e links para plataformas de streaming (Netflix, HBO, etc.) são propriedade das respetivas empresas.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">5. Monetização e Links de Afiliados</h3>
                    <p>
                      Embora o MoodFlix seja disponibilizado gratuitamente aos utilizadores, a plataforma pode gerar receita através de:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li><strong>Programas de Afiliados:</strong> Alguns links que redirecionam para plataformas de streaming ou lojas digitais (ex: Amazon Prime, Apple TV) podem conter códigos de afiliado. Se o utilizador subscrever ou alugar um filme através desses links, o MoodFlix poderá receber uma pequena comissão, sem qualquer custo adicional para o utilizador.</li>
                      <li><strong>Publicidade e Parcerias:</strong> Podemos exibir conteúdo patrocinado ou recomendações em destaque, que serão sempre devidamente identificadas como tal.</li>
                      <li><strong>Funcionalidades Premium:</strong> No futuro, poderão ser introduzidas funcionalidades exclusivas (ex: filtros avançados, listas ilimitadas) mediante subscrição paga, mantendo a experiência base gratuita.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">6. Limitação de Responsabilidade</h3>
                    <p>
                      O MoodFlix é fornecido "tal como está". Não nos responsabilizamos por:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Indisponibilidade temporária do serviço devido a manutenção ou falhas de APIs de terceiros (TMDB, Gemini).</li>
                      <li>Qualquer conteúdo ofensivo ou inadequado que possa ser sugerido pela IA ou estar presente nos filmes/séries recomendados.</li>
                      <li>Alterações nos catálogos das plataformas de streaming (um filme sugerido pode já não estar disponível na Netflix, por exemplo).</li>
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
                    Última atualização: Março de 2026. Para dúvidas, contacte suporte@moodflix.app
                  </div>
                </div>
                
                <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end">
                  <Button onClick={() => setIsTermsOpen(false)} className="rounded-full px-8">
                    Compreendi e Aceito
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

