import { Link } from "react-router-dom";
import { Film, Home, Clapperboard } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ThemeToggle } from "@/src/components/ThemeToggle";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
      </div>

      {/* Header with Theme Toggle */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-2 rounded-xl">
            <Clapperboard className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">MoodFlix</span>
        </Link>
      </div>
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8">
          <Film className="w-40 h-40 text-primary opacity-10 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl font-display font-black text-foreground drop-shadow-2xl">404</span>
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Cena Cortada!</h1>
        
        <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed">
          Parece que te perdeste no guião. A página que procuras não existe ou foi movida para os bastidores.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="rounded-full px-8 font-medium shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:shadow-[0_0_40px_rgba(225,29,72,0.5)] transition-all">
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
