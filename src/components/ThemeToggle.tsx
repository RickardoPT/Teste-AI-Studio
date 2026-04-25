import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/src/hooks/useTheme";
import { Button } from "@/src/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full hover:bg-muted transition-colors"
      title={theme === "light" ? "Mudar para Modo Escuro" : "Mudar para Modo Claro"}
    >
      {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </Button>
  );
}
