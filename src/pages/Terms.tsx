import { Link } from "react-router-dom";
import { FileText, ArrowLeft, Shield, Clapperboard } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ThemeToggle } from "@/src/components/ThemeToggle";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-background">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />
      </div>

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-2 rounded-xl">
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">MoodFlix</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:flex hover:bg-transparent hover:text-primary">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-12">
          <section className="space-y-6">
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Termos de Serviço & AI Act
            </h1>

            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-6">
              <p>Última atualização: Março de 2026</p>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">1. Aceitação dos Termos</h2>
                <p>Ao aceder e utilizar o MoodFlix ("Plataforma", "Nós", "Nosso"), o utilizador concorda em ficar vinculado aos presentes Termos e Serviços e a todas as leis aplicáveis em Portugal e na União Europeia.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">2. Transparência de Inteligência Artificial (AI Act)</h2>
                <p>Em conformidade com o Regulamento da Inteligência Artificial da União Europeia (AI Act), informamos que:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>O MoodFlix utiliza sistemas de Inteligência Artificial (modelos Google Gemini) para processar os estados de espírito descritos e gerar recomendações de filmes e séries.</li>
                  <li>As recomendações são <strong>geradas de forma automatizada</strong> e não envolvem intervenção humana direta na seleção.</li>
                  <li>A IA pode ocasionalmente gerar informações imprecisas, "alucinações" ou sugerir títulos que não correspondam perfeitamente ao solicitado. O utilizador deve usar o seu próprio critério.</li>
                  <li>O sistema não toma decisões que afetem os direitos fundamentais, saúde ou segurança dos utilizadores (considerado sistema de risco mínimo).</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">3. Contas de Utilizador e Dados</h2>
                <p>Para utilizar funcionalidades como o "Histórico", "Avaliações" e "Comentários", é necessário criar uma conta.</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>O utilizador é responsável por manter a confidencialidade das suas credenciais.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-6 pt-12 border-t border-border/50">
            <h1 className="text-3xl font-display font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Política de Privacidade (RGPD)
            </h1>

            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">1. Introdução</h2>
                <p>O MoodFlix respeita a tua privacidade e está em total conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD) da União Europeia. Esta Política explica como recolhemos, utilizamos e protegemos as tuas informações.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">2. Informações que Recolhemos</h2>
                <p>Recolhemos apenas os dados estritamente necessários para o funcionamento da plataforma:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li><strong>Dados de Autenticação:</strong> Nome, e-mail e foto de perfil (fornecidos pelo Google/Firebase Auth) para gerir a tua sessão.</li>
                  <li><strong>Dados de Utilização:</strong> Histórico de filmes visualizados, avaliações, comentários e preferências de "mood", guardados localmente (LocalStorage) ou na nossa base de dados segura.</li>
                  <li><strong>Inputs de IA:</strong> Os textos que escreves na barra de pesquisa ("moods") são enviados para a API do Google Gemini para processamento. Estes dados <strong>não são utilizados</strong> para treinar modelos de IA públicos.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">3. Cookies e Armazenamento Local</h2>
                <p>Utilizamos o LocalStorage do teu navegador para guardar preferências (como o tema claro/escuro e consentimento de cookies) e o teu histórico de recomendações. Não utilizamos cookies de rastreamento de terceiros para fins de marketing ou publicidade direcionada.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">4. Os Teus Direitos (RGPD)</h2>
                <p>Ao abrigo do RGPD, tens o direito de aceder, retificar, portar ou apagar os teus dados pessoais. Podes limpar o teu histórico diretamente na aplicação ou eliminar a tua conta contactando-nos.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
