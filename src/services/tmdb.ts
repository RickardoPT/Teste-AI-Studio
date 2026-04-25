export interface TMDBProvider {
  name: string;
  logoUrl: string;
  link?: string;
}

export async function getTrendingPosters(): Promise<string[]> {
  // @ts-ignore - Vite env
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';

  if (!TMDB_API_KEY) {
    return [
      "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
      "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
      "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
      "https://image.tmdb.org/t/p/w500/udDclJoHjfpt8PnFJUzZksm1mac.jpg",
      "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1R70q1O80OteJG.jpg",
      "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      "https://image.tmdb.org/t/p/w500/t6HIqrHeCPJsyX1yIGVGq0cb7ed.jpg",
    ];
  }

  try {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=pt-PT`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results
        .slice(0, 10)
        .filter((m: any) => m.poster_path)
        .map((m: any) => `https://image.tmdb.org/t/p/w500${m.poster_path}`);
    }
  } catch (e) {
    console.error("Error fetching trending posters", e);
  }

  // Fallback
  return [
    "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    "https://image.tmdb.org/t/p/w500/udDclJoHjfpt8PnFJUzZksm1mac.jpg",
    "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1R70q1O80OteJG.jpg",
    "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    "https://image.tmdb.org/t/p/w500/t6HIqrHeCPJsyX1yIGVGq0cb7ed.jpg",
  ];
}

export async function getTrendingMovies(): Promise<any[]> {
  // @ts-ignore - Vite env
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';

  const fallback = [
    { title: "Dune: Parte Dois", year: "2024", genre: "Sci-Fi", poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjc91p.jpg" },
    { title: "Pobres Criaturas", year: "2023", genre: "Comédia/Drama", poster: "https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg" },
    { title: "Oppenheimer", year: "2023", genre: "Drama/História", poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
    { title: "Vidas Passadas", year: "2023", genre: "Romance", poster: "https://image.tmdb.org/t/p/w500/k38vXw2yZ6o53qFjX9P0uA2i22.jpg" }
  ];

  if (!TMDB_API_KEY) {
    return fallback;
  }

  try {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&language=pt-PT`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results
        .slice(0, 4)
        .filter((m: any) => m.poster_path)
        .map((m: any) => ({
          title: m.title || m.name,
          year: (m.release_date || m.first_air_date || "").substring(0, 4),
          genre: m.vote_average ? `★ ${m.vote_average.toFixed(1)}` : "Trending",
          poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`
        }));
    }
  } catch (e) {
    console.error("Error fetching trending movies", e);
  }

  return fallback;
}

export async function enrichWithTMDB(movie: any) {
  // @ts-ignore - Vite env
  const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = 'https://api.themoviedb.org/3';

  if (!TMDB_API_KEY) {
    // Fallback if no API key is provided
    return {
      ...movie,
      posterUrl: `https://placehold.co/500x750/18181b/0ea5e9?text=${encodeURIComponent(movie.title)}`,
      rating: (Math.random() * 2 + 7).toFixed(1), // Fake rating between 7.0 and 9.0
      providers: []
    };
  }

  try {
    const type = movie.type === 'series' ? 'tv' : 'movie';
    
    // 1. Search for the movie/series to get the TMDB ID
    const searchRes = await fetch(
      `${BASE_URL}/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movie.title)}&language=pt-PT`
    );
    const searchData = await searchRes.json();
    const result = searchData.results?.[0];

    if (!result) return movie;

    const id = result.id;
    const posterUrl = result.poster_path 
      ? `https://image.tmdb.org/t/p/w500${result.poster_path}` 
      : `https://placehold.co/500x750/18181b/0ea5e9?text=${encodeURIComponent(movie.title)}`;
    const backdropUrl = result.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${result.backdrop_path}`
      : undefined;
    const rating = result.vote_average ? Number(result.vote_average.toFixed(1)) : undefined;

    // 2. Get Full Details and Credits
    const detailsRes = await fetch(`${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=pt-PT&append_to_response=credits,watch/providers,videos,similar`);
    const detailsData = await detailsRes.json();

    const runtime = type === 'movie' ? detailsData.runtime : (detailsData.episode_run_time?.[0] || null);
    const releaseDate = type === 'movie' ? detailsData.release_date : detailsData.first_air_date;
    const genres = detailsData.genres?.map((g: any) => g.name) || [];
    
    // Get cast with profile pictures
    const castProfiles = detailsData.credits?.cast?.slice(0, 6).map((c: any) => ({
      name: c.name,
      character: c.character,
      profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null
    })) || [];
    
    const director = detailsData.credits?.crew?.find((c: any) => c.job === 'Director')?.name;

    // Get Trailer (prefer PT, fallback to US/any)
    const videos = detailsData.videos?.results || [];
    const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube' && v.iso_639_1 === 'pt') 
                 || videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
                 || videos.find((v: any) => v.site === 'YouTube');
    const trailerUrl = trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;

    // Get Similar Movies
    const similar = detailsData.similar?.results?.slice(0, 4).map((s: any) => ({
      id: s.id,
      title: s.title || s.name,
      posterUrl: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
      rating: s.vote_average ? Number(s.vote_average.toFixed(1)) : null,
      year: (s.release_date || s.first_air_date || "").substring(0, 4)
    })) || [];

    // 3. Get Watch Providers (Where to watch)
    const ptProvidersData = detailsData['watch/providers']?.results?.PT;
    const usProvidersData = detailsData['watch/providers']?.results?.US;
    
    const ptProviders = ptProvidersData?.flatrate || usProvidersData?.flatrate || [];
    const providerLink = ptProvidersData?.link || usProvidersData?.link || `https://www.themoviedb.org/${type}/${id}/watch`;

    const providers = ptProviders.slice(0, 3).map((p: any) => ({
      name: p.provider_name,
      logoUrl: `https://image.tmdb.org/t/p/w200${p.logo_path}`,
      link: providerLink
    }));

    return { 
      ...movie, 
      posterUrl, 
      backdropUrl, 
      rating, 
      providers,
      runtime,
      releaseDate,
      tmdbGenres: genres,
      castProfiles,
      director,
      trailerUrl,
      similar
    };
  } catch (e) {
    console.error("TMDB Error", e);
    return {
      ...movie,
      posterUrl: `https://placehold.co/500x750/18181b/0ea5e9?text=${encodeURIComponent(movie.title)}`
    };
  }
}
