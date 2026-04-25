import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Clapperboard, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/src/components/ThemeToggle";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (email && password) {
      setIsLoading(true);
      const { error: authError } = await login(email, password, isLogin ? email.split('@')[0] : name, !isLogin);
      setIsLoading(false);
      
      if (authError) {
        setError(authError);
      } else {
        navigate("/dashboard");
      }
    }
  };

  const handleDemo = async () => {
    setIsLoading(true);
    await login("demo@moodflix.com", "demo1234", "Demo User", false);
    setIsLoading(false);
    navigate("/dashboard");
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ["Muito Fraca", "Fraca", "Média", "Forte", "Muito Forte"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500"];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 bg-background">
        <img 
          src="https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-50" 
          alt="Cinematic Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
      </div>

      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 z-10 hover:opacity-80 transition-opacity">
        <div className="bg-primary p-2 rounded-xl">
          <Clapperboard className="w-6 h-6 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-2xl tracking-tight">MoodFlix</span>
      </Link>

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md z-10"
      >
        <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Criar uma conta"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Introduz o teu email para entrares na tua conta" 
                : "Introduz os teus dados para começares no MoodFlix"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Input 
                    placeholder="O teu Nome" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="bg-background/50"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Input 
                  type="email" 
                  placeholder="nome@exemplo.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2 relative">
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {!isLogin && password.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4].map((level) => (
                        <div 
                          key={level} 
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                            strength >= level ? strengthColors[strength] : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      Força: <span className="font-medium text-foreground">{strengthLabels[strength]}</span>
                    </p>
                    <div className="space-y-2 mt-3 bg-background/50 p-3 rounded-xl border border-border/50">
                      <div className={`flex items-center gap-2 text-xs transition-colors ${password.length >= 8 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {password.length >= 8 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>Pelo menos 8 caracteres</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${/[A-Z]/.test(password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {/[A-Z]/.test(password) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>Pelo menos 1 letra maiúscula</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${/[0-9]/.test(password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {/[0-9]/.test(password) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>Pelo menos 1 número</span>
                      </div>
                      <div className={`flex items-center gap-2 text-xs transition-colors ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>Pelo menos 1 símbolo (ex: !@#$%)</span>
                      </div>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end mt-1">
                    <button type="button" className="text-xs text-primary hover:underline">
                      Esqueceu a sua password?
                    </button>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 text-center">
                  {error}
                </div>
              )}

              <Button disabled={isLoading} type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90 text-foreground mt-2">
                {isLoading ? "Aguarde..." : (isLogin ? "Entrar" : "Registar")}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDemo}
              className="w-full rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
            >
              Entrar com Conta Demo
            </Button>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "Não tens uma conta? " : "Já tens uma conta? "}
              </span>
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setPassword("");
                }}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? "Registar" : "Entrar"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
