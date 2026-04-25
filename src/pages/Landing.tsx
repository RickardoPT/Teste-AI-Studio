import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Film, Tv, Heart, PlayCircle, Search, Compass, Users, Star, ArrowRight, Clapperboard, User, Loader2, X, FileText, Shield, ChevronDown, MessageSquare, CheckCircle2, Github, Twitter, Instagram, Send, Zap, Database, Cpu, Globe, Lock } from "lucide-react";
import { ThemeToggle } from "@/src/components/ThemeToggle";
import { toast } from "sonner";
import { getTrendingPosters } from "@/src/services/tmdb";

const FAQS = [
  { q: "Como funciona a recomendação por IA?", a: "A nossa IA analisa a tua descrição de 'mood' e cruza com uma vasta base de dados cinematográfica para encontrar a correspondência perfeita." },
  { q: "O MoodFlix é gratuito?", a: "Sim! As funcionalidades principais de recomendação e histórico são totalmente gratuitas." },
  { q: "Posso ver os filmes diretamente no MoodFlix?", a: "Não. O MoodFlix é um motor de descoberta. Fornecemos os links diretos para as plataformas de streaming (Netflix, Max, etc.) onde o filme está disponível." },
  { q: "Como é que o histórico melhora as recomendações?", a: "A IA aprende com os filmes que guardas e avalias, ajustando as futuras sugestões aos teus gostos pessoais." }
];

const POSTERS = [
  "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg", // Oppenheimer
  "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg", // Barbie
  "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", // Dune
  "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg", // The Batman
  "https://image.tmdb.org/t/p/w500/udDclJoHjfpt8PnFJUzZksm1mac.jpg", // Joker
  "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1R70q1O80OteJG.jpg", // Spider-Man
  "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg", // Avengers Endgame
  "https://image.tmdb.org/t/p/w500/t6HIqrHeCPJsyX1yIGVGq0cb7ed.jpg", // Avatar 2
];

const TESTIMONIALS = [
  { name: "Sofia Costa", role: "Cinéfila", text: "Nunca mais perdi 30 minutos a escolher o que ver. A MoodFlix acerta sempre na vibe que procuro!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { name: "Miguel Silva", role: "Fã de Sci-Fi", text: "A integração com o TMDB é perfeita. Sei logo se o filme está na Netflix ou na Max. Recomendo a 100%.", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop" },
  { name: "Ana Rita", role: "Utilizadora Diária", text: "O meu histórico de filmes nunca esteve tão organizado. Adoro poder avaliar e deixar as minhas próprias notas.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { name: "Carlos Mendes", role: "Crítico de Sofá", text: "A melhor descoberta do ano. A IA entende exatamente o que quero ver, mesmo quando eu próprio não sei!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { name: "Beatriz Santos", role: "Estudante de Cinema", text: "A forma como sugere filmes baseados na cinematografia e no mood é impressionante. 5 estrelas!", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" }
];

const FeatureCard: React.FC<{ feature: any, index: number }> = ({ feature, index }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className="relative p-8 rounded-3xl bg-background border border-border/50 hover:border-primary/30 transition-colors group overflow-hidden"
    >
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition duration-300 z-0"
        style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(225,29,72,0.1), transparent 40%)` }}
      />
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
          {feature.icon}
        </div>
        <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
        <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [demoInput, setDemoInput] = useState("");
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [demoResults, setDemoResults] = useState<any[] | null>(null);
  const [posters, setPosters] = useState<string[]>(POSTERS);

  useEffect(() => {
    async function fetchPosters() {
      const trending = await getTrendingPosters();
      if (trending && trending.length >= 8) {
        setPosters(trending);
      }
    }
    fetchPosters();
  }, []);

  const handleMiniDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoInput.trim()) return;
    setIsDemoLoading(true);
    setDemoResults(null);
    setTimeout(() => {
      setIsDemoLoading(false);
      setDemoResults([
        { title: "Inside Out", year: "2015", poster: "https://image.tmdb.org/t/p/w500/lRHE0vzf3oYJrhcgHXj8rFdZCW9.jpg", match: "98%" },
        { title: "Amélie", year: "2001", poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", match: "95%" },
        { title: "The Secret Life of Walter Mitty", year: "2013", poster: "https://image.tmdb.org/t/p/w500/z10sA2vB6d0N08S11D1X9X0e0x6.jpg", match: "92%" }
      ]);
    }, 1500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDemo = async () => {
    await login("demo@moodflix.com", "Demo User");
    navigate("/dashboard");
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-foreground selection:bg-primary/30 font-sans overflow-x-hidden bg-background">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Clapperboard className="w-6 h-6 text-foreground" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight transition-all duration-200 hover:scale-105 active:scale-95 active:text-primary cursor-pointer hover:drop-shadow-md inline-block">MoodFlix</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Como Funciona</a>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link to="/auth">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Modern Abstract Background */}
          <div className="absolute inset-0 z-0 bg-background bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat">
            <div className="absolute inset-0 bg-background/60" /> {/* Mild overlay to ensure text readability */}
            <div className="absolute top-0 left-1/4 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-70 mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[800px] h-[600px] bg-accent/20 rounded-full blur-[120px] opacity-70 mix-blend-screen pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background pointer-events-none" />
          </div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center relative"
            >
              {/* Left Column: Text */}
              <div className="relative z-10 flex flex-col items-start text-left">
                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 mb-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent pointer-events-none" />
                  <Sparkles className="w-4 h-4 text-primary relative z-10 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
                  <span className="text-sm font-medium text-foreground/90 drop-shadow-md relative z-10">Recomendações com IA (Gemini 2.5)</span>
                </motion.div>

                <motion.h1 variants={fadeIn} className="text-5xl md:text-6xl lg:text-[5.5rem] font-display font-bold tracking-tighter mb-6 leading-[1.05] text-foreground">
                  O fim do scroll infinito. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-foreground">
                    Encontra o filme perfeito.
                  </span>
                </motion.h1>

                <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed font-light">
                  Não sabes o que ver? Diz-nos como te sentes. A MoodFlix usa Inteligência Artificial para te recomendar exatamente o que precisas de ver agora, com links diretos para as tuas plataformas de streaming.
                </motion.p>

                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-start mb-8">
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-lg shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.6)] hover:scale-105 transition-all duration-300 border border-primary/50">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Descobrir Agora
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" onClick={handleDemo} className="w-full sm:w-auto rounded-full bg-foreground/5 border-foreground/10 hover:bg-foreground/10 hover:text-foreground h-14 px-8 text-lg transition-all duration-300 backdrop-blur-md">
                    Experimentar Demo
                  </Button>
                </motion.div>

                <motion.p variants={fadeIn} className="text-sm text-muted-foreground flex items-center justify-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 opacity-80" />
                  Integrado com <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" loading="lazy" className="h-3 ml-1 opacity-60 grayscale hover:grayscale-0 transition-all" /> para dados reais.
                </motion.p>
              </div>

              {/* Right Column: Video */}
              <motion.div
                initial={{ opacity: 0, x: 40, rotateY: -10 }}
                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="w-full relative perspective-1000 mt-12 lg:mt-0"
                style={{ perspective: "1000px" }}
              >
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-gradient-to-tr from-primary/40 to-accent/40 rounded-full blur-[100px] pointer-events-none z-0" />
                
                <div 
                  className="relative z-10 bg-card/80 backdrop-blur-2xl border border-foreground/10 rounded-2xl p-2 shadow-[0_20px_60px_-15px_rgba(225,29,72,0.3)] transform-gpu overflow-hidden group hover:-translate-y-2 hover:shadow-[0_30px_70px_-15px_rgba(225,29,72,0.4)] transition-all duration-500"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* App Window Controls (Browser Mockup) */}
                  <div className="flex items-center justify-between mb-2 px-3 pt-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                      <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                      <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-foreground/5 border border-foreground/5 rounded-md px-12 py-1 text-[10px] font-mono text-foreground/30 flex items-center gap-2">
                        <Shield className="w-3 h-3 opacity-50" /> moodflix.app
                      </div>
                    </div>
                    <div className="w-12"></div> {/* Spacer to balance the dots */}
                  </div>

                  {/* Video Container */}
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-foreground/5 shadow-inner">
                    <video 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 scale-[1.02]"
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                    >
                      <source src="/demoflix.mp4" type="video/mp4" />
                      O teu browser não suporta vídeos HTML5.
                    </video>
                    
                    {/* Overlay gradient for better blending */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Floating Badges */}
                    <motion.div 
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-foreground/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xl"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">Análise IA</span>
                    </motion.div>
                    
                    <motion.div 
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-6 left-4 bg-black/60 backdrop-blur-md border border-foreground/10 rounded-full px-3 py-1.5 flex items-center gap-2 shadow-xl"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-medium text-white/90 uppercase tracking-wider">Match: 98%</span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats & Powered By */}
        <section className="py-12 border-y border-border/40 bg-muted/10 relative z-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center divide-x divide-border/50">
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">+10.000</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Filmes Analisados</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">98%</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Taxa de Match</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">&lt; 2s</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tempo de Resposta</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm text-muted-foreground mb-3">Powered by</span>
                <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                  <Cpu className="w-6 h-6" title="Google Gemini AI" />
                  <Database className="w-6 h-6" title="TMDB API" />
                  <Globe className="w-6 h-6" title="React & Web Technologies" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Infinite Marquee */}
        <section className="py-10 bg-background/50 overflow-hidden flex relative">
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-4 animate-marquee whitespace-nowrap w-max">
            {[...posters, ...posters, ...posters].map((url, i) => (
              <div key={i} className="w-28 md:w-40 aspect-[2/3] rounded-xl overflow-hidden border border-foreground/5 flex-shrink-0">
                <img src={url} alt="Movie Poster" loading="lazy" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </section>

        {/* Value Proposition / Features */}
        <section id="features" className="py-24 bg-card/30 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Tudo o que precisas num só lugar</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Uma plataforma desenhada para cinéfilos que valorizam o seu tempo. Sem algoritmos viciados, apenas o que tu queres ver.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Search className="w-8 h-8 text-primary" />,
                  title: "Pesquisa por Emoção",
                  desc: "Escreve 'Quero chorar' ou 'Preciso de rir muito'. A nossa IA entende o contexto e sugere obras que evocam exatamente esse sentimento."
                },
                {
                  icon: <Tv className="w-8 h-8 text-accent" />,
                  title: "Onde Assistir",
                  desc: "Graças à integração com o TMDB, mostramos-te imediatamente se o filme está na Netflix, Prime Video, Max ou Disney+ em Portugal."
                },
                {
                  icon: <Heart className="w-8 h-8 text-secondary" />,
                  title: "O Teu Diário de Filmes",
                  desc: "Guarda o teu histórico, avalia o que viste e constrói a tua biblioteca pessoal. Nunca mais te esqueças daquele filme incrível."
                }
              ].map((feature, i) => (
                <FeatureCard key={i} feature={feature} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-12">
                  Três passos para a tua próxima <span className="text-primary">maratona</span>.
                </h2>
                
                <div className="relative space-y-8 pl-4 md:pl-0">
                  {/* Vertical Connecting Line */}
                  <div className="absolute left-[35px] top-8 bottom-8 w-px bg-foreground/10 hidden md:block" />
                  
                  {/* Animated Progress Line */}
                  <div 
                    className="absolute left-[35px] top-8 w-px bg-primary hidden md:block transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(225,29,72,0.8)]" 
                    style={{ height: `${(activeStep / 2) * 100}%`, maxHeight: 'calc(100% - 4rem)' }} 
                  />
                  
                  {[
                    { step: "01", title: "Diz-nos o teu Mood", desc: "Usa os botões rápidos ou descreve exatamente o que te apetece ver." },
                    { step: "02", title: "Recebe Recomendações", desc: "A IA analisa milhares de filmes e séries para encontrar o match perfeito." },
                    { step: "03", title: "Prepara as Pipocas", desc: "Vê em que plataforma de streaming está disponível e começa a assistir." }
                  ].map((item, i) => (
                    <div 
                      key={i}
                      onClick={() => setActiveStep(i)}
                      className={`flex gap-6 relative z-10 cursor-pointer transition-all duration-500 ${activeStep === i ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-bold transition-all duration-500 flex-shrink-0 ${activeStep === i ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(225,29,72,0.4)]' : 'bg-background border border-border text-muted-foreground'}`}>
                        {item.step}
                      </div>
                      <div className="pt-2">
                        <h4 className={`text-xl font-bold mb-2 transition-colors ${activeStep === i ? 'text-foreground' : 'text-foreground'}`}>{item.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full relative">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 grid grid-cols-2 gap-4">
                  {posters.slice(0, 4).map((url, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className={`rounded-xl overflow-hidden border border-foreground/10 shadow-xl ${i % 2 === 0 ? 'translate-y-8' : ''}`}
                    >
                      <img src={url} alt="Movie Poster" className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Mini-Demo */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Experimenta a Magia Agora</h2>
            <p className="text-muted-foreground text-lg mb-10">Escreve como te sentes e vê a nossa IA em ação em tempo real.</p>
            
            <div className="bg-card/40 backdrop-blur-xl border border-foreground/10 rounded-3xl p-6 md:p-10 shadow-2xl">
              <form onSubmit={handleMiniDemoSubmit} className="relative flex items-center max-w-2xl mx-auto mb-8">
                <Input 
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Ex: Tive um dia péssimo, preciso de rir até chorar..." 
                  className="h-16 pl-6 pr-32 rounded-full bg-background/80 border-foreground/20 text-lg focus-visible:ring-primary/50 shadow-inner"
                />
                <Button 
                  type="submit" 
                  disabled={isDemoLoading || !demoInput.trim()}
                  className="absolute right-2 top-2 bottom-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-md"
                >
                  {isDemoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  {isDemoLoading ? "" : "Procurar"}
                </Button>
              </form>

              <AnimatePresence mode="wait">
                {demoResults && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8"
                  >
                    {demoResults.map((movie, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-foreground/10 bg-background/50">
                        <div className="aspect-[2/3] w-full relative overflow-hidden">
                          {/* Blurred Poster */}
                          <img src={movie.poster} alt="Filme Mistério" className="w-full h-full object-cover blur-xl scale-110 opacity-40" />
                          
                          <div className="absolute top-3 right-3 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-md shadow-lg z-10">
                            {movie.match} Match
                          </div>
                          
                          {/* Lock Overlay */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-background/20">
                            <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center mb-3 border border-foreground/10 shadow-xl">
                              <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="font-bold text-foreground text-lg leading-tight mb-1">Filme Encontrado</h4>
                            <p className="text-xs text-foreground/70 mb-4">Combinação perfeita com o teu mood.</p>
                            <Link to="/auth">
                              <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                                Revelar Filme
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
          
          <div className="max-w-7xl mx-auto px-6 mb-16">
            <div className="text-center">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">O que dizem os cinéfilos</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Junta-te a milhares de utilizadores que já transformaram a sua forma de escolher o que ver.</p>
            </div>
          </div>

          {/* Testimonials Marquee */}
          <div className="relative flex overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            <div className="flex gap-6 animate-marquee w-max px-6">
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                <div 
                  key={i}
                  className="w-[300px] md:w-[400px] p-8 rounded-3xl bg-foreground/5 hover:bg-foreground/10 transition-colors border border-foreground/10 relative flex-shrink-0 whitespace-normal shadow-lg"
                >
                  <div className="text-primary mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="inline-block w-4 h-4 fill-current mr-1" />)}
                  </div>
                  <p className="text-foreground/90 text-lg mb-8 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} loading="lazy" className="w-12 h-12 rounded-full object-cover border border-foreground/10" />
                    <div>
                      <h4 className="font-bold">{t.name}</h4>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / Free Forever */}
        <section id="pricing" className="py-24 bg-background relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Simples. Transparente. <span className="text-primary">Gratuito.</span></h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Acreditamos que descobrir bons filmes não deve ter um custo. O MoodFlix é gratuito para todos os cinéfilos.</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="bg-card/40 backdrop-blur-xl border border-primary/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(225,29,72,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-xl tracking-wider uppercase">
                  Plano Atual
                </div>
                
                <h3 className="text-2xl font-display font-bold mb-2">Plano Base</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-5xl font-bold text-foreground">0€</span>
                  <span className="text-muted-foreground">/ para sempre</span>
                </div>
                
                <p className="text-muted-foreground mb-8 text-sm">Tudo o que precisas para encontrar o teu próximo filme favorito, sem custos escondidos.</p>
                
                <ul className="space-y-4 mb-8">
                  {[
                    "Recomendações ilimitadas com IA",
                    "Histórico de filmes guardado",
                    "Links diretos para plataformas de streaming",
                    "Avaliações e diário pessoal",
                    "Sem anúncios intrusivos"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/auth" className="block w-full">
                  <Button className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 shadow-md">
                    Criar Conta Gratuita
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-card/30 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Perguntas Frequentes</h2>
              <p className="text-muted-foreground text-lg">Tudo o que precisas de saber sobre o MoodFlix.</p>
            </div>
            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div key={i} className="border border-border/50 rounded-2xl bg-background overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-semibold text-lg">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-border/50 mt-2">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback Section */}
        <section id="feedback" className="py-24 relative overflow-hidden bg-background">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="bg-card/40 backdrop-blur-xl border border-foreground/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="text-left">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-foreground">O que achas do MoodFlix?</h2>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    A tua opinião é fundamental para construirmos a melhor plataforma de recomendações. Tens uma ideia genial ou encontraste um bug? Diz-nos!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Lemos todas as mensagens com atenção.
                  </div>
                </div>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Obrigado pelo teu feedback! A nossa equipa vai analisar com carinho.");
                  (e.target as HTMLFormElement).reset();
                }} className="space-y-5 relative z-10 bg-background/50 p-6 sm:p-8 rounded-2xl border border-border/50 shadow-inner">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="name" className="text-sm font-medium text-foreground/80 pl-1">Nome</label>
                      <Input id="name" placeholder="O teu nome" className="bg-background/50 border-border/50 focus-visible:ring-primary/50 rounded-xl h-11" />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label htmlFor="email" className="text-sm font-medium text-foreground/80 pl-1">Email <span className="text-muted-foreground text-xs">(Opcional)</span></label>
                      <Input id="email" type="email" placeholder="Para te podermos responder" className="bg-background/50 border-border/50 focus-visible:ring-primary/50 rounded-xl h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="feedback" className="text-sm font-medium text-foreground/80 pl-1">A tua mensagem</label>
                    <textarea 
                      id="feedback" 
                      required
                      placeholder="Adoro a plataforma, mas gostava que tivesse..." 
                      className="w-full bg-background/50 border border-border/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-32 text-foreground placeholder:text-muted-foreground transition-all"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:shadow-[0_0_30px_rgba(225,29,72,0.5)] transition-all font-medium text-base">
                    Enviar Feedback
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Expanded Footer */}
      <footer className="bg-card/30 border-t border-border/40 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-background z-0" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Clapperboard className="w-6 h-6 text-primary" />
                <span className="font-display font-bold text-2xl tracking-tight">MoodFlix</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm leading-relaxed">
                O teu motor de descoberta cinematográfica alimentado por Inteligência Artificial. Encontra o filme perfeito para o teu mood em segundos.
              </p>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscrito com sucesso!"); (e.target as HTMLFormElement).reset(); }} className="flex gap-2 max-w-sm">
                <Input type="email" placeholder="O teu email..." required className="bg-background/50 border-border/50 rounded-xl" />
                <Button type="submit" size="icon" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2">Recebe o top 5 filmes da semana.</p>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Produto</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Funcionalidades</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">Como Funciona</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#feedback" className="hover:text-primary transition-colors">Contactos</a></li>
                <li><button onClick={() => setIsPrivacyOpen(true)} className="hover:text-primary transition-colors">Privacidade</button></li>
                <li><button onClick={() => setIsTermsOpen(true)} className="hover:text-primary transition-colors">Termos de Serviço</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              © {new Date().getFullYear()} MoodFlix. Powered by Gemini AI & <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" loading="lazy" className="h-3 ml-1" />
            </div>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>

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

      {/* Privacy Modal */}
      <AnimatePresence>
        {isPrivacyOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsPrivacyOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Política de Privacidade
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsPrivacyOpen(false)} className="rounded-full hover:bg-muted">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto space-y-8 text-sm text-foreground/80 leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">1. Introdução</h3>
                  <p>
                    A sua privacidade é importante para nós. Esta Política de Privacidade explica como o MoodFlix recolhe, utiliza e protege as suas informações quando utiliza a nossa plataforma. Ao utilizar o MoodFlix, concorda com as práticas descritas nesta política.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">2. Informações que Recolhemos</h3>
                  <p>
                    Recolhemos informações para fornecer melhores serviços a todos os nossos utilizadores:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Informações de Conta:</strong> Nome e endereço de e-mail fornecidos durante o registo ou login social (Google).</li>
                    <li><strong>Dados de Utilização:</strong> Histórico de filmes visualizados, avaliações, comentários e preferências de "mood".</li>
                    <li><strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador, dispositivo e dados de cookies para melhorar a performance e segurança.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">3. Como Utilizamos as Informações</h3>
                  <p>
                    Utilizamos os dados recolhidos para:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Personalizar as recomendações de filmes através da nossa Inteligência Artificial.</li>
                    <li>Manter o seu histórico e biblioteca pessoal sincronizados entre dispositivos.</li>
                    <li>Melhorar a interface e funcionalidades da plataforma com base no feedback anónimo.</li>
                    <li>Comunicar atualizações importantes ou responder a pedidos de suporte.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">4. Partilha de Dados</h3>
                  <p>
                    O MoodFlix não vende os seus dados pessoais a terceiros. Partilhamos informações apenas nas seguintes circunstâncias:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Processadores de Dados:</strong> Serviços como o Google Gemini (IA) ou Firebase (Base de Dados) processam dados sob rigorosas medidas de segurança.</li>
                    <li><strong>Conformidade Legal:</strong> Quando exigido por lei ou para proteger os direitos e segurança da plataforma e utilizadores.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">5. Cookies e Tecnologias Semelhantes</h3>
                  <p>
                    Utilizamos cookies para manter a sua sessão ativa e lembrar as suas preferências. Pode configurar o seu navegador para recusar cookies, mas algumas funcionalidades da plataforma poderão não funcionar corretamente.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">6. Segurança e Retenção</h3>
                  <p>
                    Implementamos medidas de segurança técnicas e organizacionais para proteger os seus dados. Mantemos as suas informações enquanto a sua conta estiver ativa ou conforme necessário para lhe fornecer os serviços. Pode solicitar a eliminação da sua conta e dados a qualquer momento nas definições do perfil.
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground">
                  Última atualização: Março de 2026. Para questões sobre privacidade, contacte privacidade@moodflix.app
                </div>
              </div>
              
              <div className="p-6 border-t border-border/50 bg-muted/10 flex justify-end">
                <Button onClick={() => setIsPrivacyOpen(false)} className="rounded-full px-8">
                  Fechar
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

