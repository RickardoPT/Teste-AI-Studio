export interface MovieRecommendation {
  title: string;
  year: number;
  genre: string;
  description: string;
  reason: string;
  type: "movie" | "series";
  director?: string;
  cast?: any[];
  posterUrl?: string;
  backdropUrl?: string;
  rating?: number;
  providers?: any[];
  addedAt?: string;
  runtime?: number;
  releaseDate?: string;
  tmdbGenres?: string[];
  castProfiles?: any[];
  trailerUrl?: string;
  similar?: any[];
}

export async function getRecommendations(
  mood: string,
  userHistory?: { title: string; rating?: number }[],
  filterType?: "all" | "movie" | "series",
  userPreferences?: { platforms: string[]; genres: string[] }
): Promise<MovieRecommendation[]> {
  try {
    const res = await fetch("/api/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, userHistory, filterType, userPreferences }),
    });

    if (!res.ok) {
      console.error("Recommendations API failed", await res.text());
      return [];
    }

    const parsed = (await res.json()) as MovieRecommendation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}
