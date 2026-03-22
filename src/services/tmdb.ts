export interface TMDBProvider {
  name: string;
  logoUrl: string;
  link?: string;
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
    const detailsRes = await fetch(`${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=pt-PT&append_to_response=credits,watch/providers`);
    const detailsData = await detailsRes.json();

    const runtime = type === 'movie' ? detailsData.runtime : (detailsData.episode_run_time?.[0] || null);
    const releaseDate = type === 'movie' ? detailsData.release_date : detailsData.first_air_date;
    const genres = detailsData.genres?.map((g: any) => g.name) || [];
    const cast = detailsData.credits?.cast?.slice(0, 4).map((c: any) => c.name) || [];
    const director = detailsData.credits?.crew?.find((c: any) => c.job === 'Director')?.name;

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
      cast,
      director
    };
  } catch (e) {
    console.error("TMDB Error", e);
    return {
      ...movie,
      posterUrl: `https://placehold.co/500x750/18181b/0ea5e9?text=${encodeURIComponent(movie.title)}`
    };
  }
}
