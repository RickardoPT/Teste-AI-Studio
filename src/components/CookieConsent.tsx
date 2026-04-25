import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("moodflix_consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("moodflix_consent", "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.6 }}
          className="fixed bottom-0 left-0 right-0 p-4 z-[100]"
        >
          <div className="max-w-5xl mx-auto bg-card/95 backdrop-blur-xl border border-border/50 p-5 md:p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-full shrink-0">
                <ShieldAlert className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="mb-1.5"><strong className="text-foreground font-semibold">Aviso Legal, Privacidade (RGPD) e IA (AI Act)</strong></p>
                <p>
                  Utilizamos cookies locais para melhorar a tua experiência. Esta plataforma utiliza <strong>Inteligência Artificial</strong> para gerar recomendações baseadas nos teus inputs. Ao continuar, concordas com os nossos <Link to="/terms" className="text-primary hover:underline font-medium">Termos de Serviço</Link> e confirmas estar ciente de que as sugestões são geradas de forma automatizada e podem conter imprecisões.
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0 w-full md:w-auto mt-2 md:mt-0">
              <Button onClick={accept} className="w-full md:w-auto rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                Compreendo e Aceito
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
