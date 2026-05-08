import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });
  }

  const { mood, userHistory = [], filterType = "all", userPreferences } = req.body || {};

  if (!mood || typeof mood !== "string") {
    return res.status(400).json({ error: "Field 'mood' is required" });
  }

  const ai = new GoogleGenAI({ apiKey });

  let historyContext = "";
  if (Array.isArray(userHistory) && userHistory.length > 0) {
    const historyStr = userHistory
      .map((h) => `${h.title} (Rated: ${h.rating || "Unrated"})`)
      .join(", ");
    historyContext = `\n\nTake into account the user's viewing history and ratings to personalize the recommendations and avoid suggesting titles they have already watched. User's recent history: ${historyStr}.`;
  }

  let filterContext = "movies or series";
  if (filterType === "movie") filterContext = "movies only";
  if (filterType === "series") filterContext = "series only";

  let preferencesContext = "";
  if (userPreferences) {
    if (Array.isArray(userPreferences.platforms) && userPreferences.platforms.length > 0) {
      preferencesContext += `\n\nIMPORTANT: The user ONLY has access to the following streaming platforms: ${userPreferences.platforms.join(", ")}. Please prioritize titles available on these platforms.`;
    }
    if (Array.isArray(userPreferences.genres) && userPreferences.genres.length > 0) {
      preferencesContext += `\n\nThe user's favorite genres are: ${userPreferences.genres.join(", ")}. Keep this in mind, but prioritize the current mood.`;
    }
  }

  const prompt = `Based on the user's current mood: "${mood}", recommend 5 ${filterContext} that perfectly match this vibe.
Provide a mix of well-known and hidden gems. Include the main director (or creator for series) and a list of up to 3 main cast members.${historyContext}${preferencesContext}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              year: { type: Type.INTEGER },
              genre: { type: Type.STRING },
              description: { type: Type.STRING },
              reason: { type: Type.STRING },
              type: { type: Type.STRING },
              director: { type: Type.STRING },
              cast: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "year", "genre", "description", "reason", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return res.status(200).json([]);

    return res.status(200).json(JSON.parse(text));
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ error: "Failed to generate recommendations" });
  }
}
