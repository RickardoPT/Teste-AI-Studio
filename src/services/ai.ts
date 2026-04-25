import { GoogleGenAI, Type } from "@google/genai";
import { enrichWithTMDB, TMDBProvider } from "./tmdb";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  providers?: TMDBProvider[];
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
  userHistory?: {title: string, rating?: number}[], 
  filterType?: "all" | "movie" | "series",
  userPreferences?: { platforms: string[], genres: string[] }
): Promise<MovieRecommendation[]> {
  let historyContext = "";
  if (userHistory && userHistory.length > 0) {
    const historyStr = userHistory.map(h => `${h.title} (Rated: ${h.rating || 'Unrated'})`).join(', ');
    historyContext = `\n\nTake into account the user's viewing history and ratings to personalize the recommendations and avoid suggesting titles they have already watched. User's recent history: ${historyStr}.`;
  }

  let filterContext = "movies or series";
  if (filterType === "movie") filterContext = "movies only";
  if (filterType === "series") filterContext = "series only";

  let preferencesContext = "";
  if (userPreferences) {
    if (userPreferences.platforms.length > 0) {
      preferencesContext += `\n\nIMPORTANT: The user ONLY has access to the following streaming platforms: ${userPreferences.platforms.join(', ')}. Please prioritize titles available on these platforms.`;
    }
    if (userPreferences.genres.length > 0) {
      preferencesContext += `\n\nThe user's favorite genres are: ${userPreferences.genres.join(', ')}. Keep this in mind, but prioritize the current mood.`;
    }
  }

  const prompt = `Based on the user's current mood: "${mood}", recommend 5 ${filterContext} that perfectly match this vibe. 
  Provide a mix of well-known and hidden gems. Include the main director (or creator for series) and a list of up to 3 main cast members.${historyContext}${preferencesContext}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Title of the movie or series" },
              year: { type: Type.INTEGER, description: "Release year" },
              genre: { type: Type.STRING, description: "Main genre" },
              description: { type: Type.STRING, description: "Short description of the plot" },
              reason: { type: Type.STRING, description: "Why this perfectly matches the user's mood" },
              type: { type: Type.STRING, description: "Either 'movie' or 'series'" },
              director: { type: Type.STRING, description: "Director or Creator" },
              cast: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Up to 3 main actors" 
              },
            },
            required: ["title", "year", "genre", "description", "reason", "type"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text) as MovieRecommendation[];
    return parsed;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
}

