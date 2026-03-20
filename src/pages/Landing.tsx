import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Film, Tv, Heart, PlayCircle, Search, Compass, Users, Star, ArrowRight, Clapperboard, User, Loader2 } from "lucide-react";

const POSTERS = [
  "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MvrIdlsR.jpg",
  "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8SPStarb.jpg",
  "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
  "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDemo = () => {
    login("demo@moodflix.com", "Demo User");
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
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">MoodFlix</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Como Funciona</a>
            <a href="#community" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
              Comunidade
              <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-1.5 py-0.5 rounded-sm">Soon</span>
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Entrar
            </Link>
            <Link to="/auth">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white px-6 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transition-all">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 lg:pt-48 lg:pb-56 overflow-hidden">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=2070&auto=format&fit=crop" 
              alt="Movie Night Popcorn" 
              className="w-full h-full object-cover opacity-70 brightness-110"
            />
            {/* Gradients to blend the image smoothly into the dark theme */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 hidden md:block" />
          </div>

          {/* Background Effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="max-w-5xl mx-auto flex flex-col items-center relative"
            >
              {/* Glassmorphism Panel behind text for better readability against the image */}
              <div className="absolute inset-0 bg-background/10 backdrop-blur-sm rounded-[3rem] -m-6 sm:-m-12 pointer-events-none border border-white/5 shadow-2xl" />
              
              <div className="relative z-10 flex flex-col items-center">
                <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent pointer-events-none" />
                  <Sparkles className="w-4 h-4 text-primary relative z-10 drop-shadow-[0_0_8px_rgba(225,29,72,0.8)]" />
                  <span className="text-sm font-medium text-white/90 drop-shadow-md relative z-10">Recomendações com IA (Gemini 2.5)</span>
                </motion.div>

                <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter mb-6 leading-[1.1] text-white drop-shadow-2xl">
                  O fim do scroll infinito. <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-white drop-shadow-none">
                    Encontra o filme perfeito.
                  </span>
                </motion.h1>

                <motion.p variants={fadeIn} className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl leading-relaxed drop-shadow-md font-light">
                  Não sabes o que ver? Diz-nos como te sentes. A MoodFlix usa Inteligência Artificial para te recomendar exatamente o que precisas de ver agora, com links diretos para as tuas plataformas de streaming.
                </motion.p>

                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:shadow-[0_0_40px_rgba(225,29,72,0.6)] hover:scale-105 transition-all duration-300 border border-primary/50">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Descobrir Agora
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" onClick={handleDemo} className="w-full sm:w-auto rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:text-white h-14 px-8 text-lg transition-all duration-300 backdrop-blur-md">
                    Experimentar Conta Demo
                  </Button>
                </motion.div>

                <motion.p variants={fadeIn} className="mt-8 text-sm text-white/60 flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-md" />
                  Integrado com <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" className="h-3 ml-1 opacity-80" /> para dados reais.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Infinite Marquee */}
        <section className="py-10 bg-background/50 overflow-hidden flex relative">
          <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-4 animate-marquee whitespace-nowrap w-max">
            {[...POSTERS, ...POSTERS, ...POSTERS].map((url, i) => (
              <div key={i} className="w-28 md:w-40 aspect-[2/3] rounded-xl overflow-hidden border border-white/5 flex-shrink-0">
                <img src={url} alt="Movie Poster" className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-300" />
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
                  <div className="absolute left-[35px] top-8 bottom-8 w-px bg-white/10 hidden md:block" />
                  
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
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-bold transition-all duration-500 flex-shrink-0 ${activeStep === i ? 'bg-primary text-white shadow-[0_0_30px_rgba(225,29,72,0.4)]' : 'bg-background border border-border text-muted-foreground'}`}>
                        {item.step}
                      </div>
                      <div className="pt-2">
                        <h4 className={`text-xl font-bold mb-2 transition-colors ${activeStep === i ? 'text-white' : 'text-foreground'}`}>{item.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full relative perspective-1000">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

                <motion.div
                  initial={{ opacity: 0, rotateY: 10, x: 20 }}
                  whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="relative z-10 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-lg mx-auto transform-gpu"
                >
                  {/* App Window Controls */}
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">MoodFlix AI Engine</div>
                  </div>

                  <div className="flex flex-col gap-6 min-h-[380px] relative">
                    {/* Step 0: User Prompt */}
                    <AnimatePresence>
                      <motion.div
                        key="prompt"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="self-end bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tr-sm shadow-lg w-[90%] flex gap-3 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1 relative z-10">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed relative z-10">
                          "Estou num dia de chuva, quero algo relaxante e visualmente incrível..." 🌧️
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Step 1: AI Processing / Result */}
                    <AnimatePresence>
                      {activeStep >= 1 && (
                        <motion.div
                          key="result"
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", bounce: 0.4 }}
                          className="self-start bg-card/90 backdrop-blur-xl border border-primary/30 p-4 rounded-2xl shadow-[0_15px_40px_rgba(225,29,72,0.2)] w-[95%] flex gap-4 items-center relative overflow-hidden group"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="w-24 h-36 bg-muted rounded-xl overflow-hidden flex-shrink-0 relative shadow-md border border-white/5">
                            <img src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=200&h=300&fit=crop" alt="Interstellar" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col relative z-10">
                            <div className="flex items-center gap-1.5 mb-2">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="text-xs font-bold text-yellow-500">8.6</span>
                              <span className="text-[10px] text-muted-foreground ml-1">• Sci-Fi</span>
                            </div>
                            <h4 className="font-display font-bold text-xl leading-tight mb-2 text-white">Interstellar</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">Uma jornada visualmente deslumbrante pelo espaço e pelo tempo.</p>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider w-fit border border-primary/30">
                              <Sparkles className="w-3 h-3" /> Match Perfeito
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Step 2: Streaming Action Mockup */}
                    <AnimatePresence>
                      {activeStep >= 2 && (
                        <motion.div
                          key="streaming"
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
                          className="self-end bg-black/60 backdrop-blur-md border border-white/10 p-3.5 rounded-2xl shadow-xl flex items-center gap-5 -mt-4 relative z-20 mr-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] text-white/50 font-medium mb-1.5 uppercase tracking-wider">Disponível em</span>
                            <div className="flex gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center text-[11px] font-bold text-white shadow-md">N</div>
                              <div className="w-8 h-8 rounded-lg bg-[#002BE7] flex items-center justify-center text-[9px] font-bold text-white shadow-md">MAX</div>
                            </div>
                          </div>
                          <div className="w-px h-10 bg-white/10" />
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] hover:scale-105 transition-transform cursor-pointer">
                            <PlayCircle className="w-6 h-6 ml-0.5" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Loading Indicator for Step 0 */}
                    <AnimatePresence>
                      {activeStep === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute bottom-4 left-4 flex items-center gap-2 text-primary/80 text-sm font-medium bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" /> A analisar o teu mood...
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
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
                  className="w-[300px] md:w-[400px] p-8 rounded-3xl bg-card/30 border border-border/50 relative flex-shrink-0 whitespace-normal"
                >
                  <div className="text-primary mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="inline-block w-4 h-4 fill-current mr-1" />)}
                  </div>
                  <p className="text-foreground/90 text-lg mb-8 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
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

        {/* Community Teaser */}
        <section id="community" className="py-24 bg-primary/5 relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />
          <div className="max-w-7xl mx-auto px-6 text-center">
            <Users className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Mais do que recomendações. <br/>Uma comunidade.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Estamos a construir um espaço onde podes partilhar listas, discutir teorias e ver o que os teus amigos andam a assistir. Junta-te agora e sê um dos primeiros a experimentar.
            </p>
            <Link to="/auth">
              <Button variant="outline" size="lg" className="rounded-full border-primary/50 hover:bg-primary hover:text-white transition-all">
                Criar Conta Gratuita <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl tracking-tight">MoodFlix</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            © {new Date().getFullYear()} MoodFlix. Powered by Gemini AI & <img src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg" alt="TMDB" className="h-3 ml-1" />
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacidade</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Termos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

