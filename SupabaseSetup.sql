-- Criação da tabela de Perfis de Utilizador (estendendo a auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  preferred_platforms TEXT[],
  preferred_genres TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de Privacidade para Perfis
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Criação da tabela de Histórico
CREATE TABLE public.movie_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  year TEXT,
  genre TEXT,
  type TEXT,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.movie_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own history" ON public.movie_history FOR ALL USING (auth.uid() = user_id);

-- Criação da tabela de Watchlist
CREATE TABLE public.movie_watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  year TEXT,
  genre TEXT,
  type TEXT,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, title)
);

ALTER TABLE public.movie_watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own watchlist" ON public.movie_watchlist FOR ALL USING (auth.uid() = user_id);

-- Criação da tabela de Avaliações (Ratings)
CREATE TABLE public.movie_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, title)
);

ALTER TABLE public.movie_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own ratings" ON public.movie_ratings FOR ALL USING (auth.uid() = user_id);

-- Criação da tabela de Comentários
CREATE TABLE public.movie_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, title)
);

ALTER TABLE public.movie_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own comments" ON public.movie_comments FOR ALL USING (auth.uid() = user_id);

-- Criação de um Trigger para criar automaticamente um perfil quando um utilizador se regista
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
