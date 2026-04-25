const fs = require('fs');

let dashboardContent = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Remove supabase import
dashboardContent = dashboardContent.replace(/import \{ supabase \} from "@\/src\/lib\/supabase";\n/g, '');

// Replace addToWatchlist supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';\s+if \(isSupabaseConfigured && user\) \{[\s\S]*?\} else \{\s+localStorage\.setItem\('moodflix_watchlist', JSON\.stringify\(newWatchlist\)\);\s+\}/,
  "localStorage.setItem('moodflix_watchlist', JSON.stringify(newWatchlist));"
);

// Replace handleRemoveFromWatchlist supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';\s+if \(isSupabaseConfigured && user\) \{[\s\S]*?\} else \{\s+localStorage\.setItem\('moodflix_watchlist', JSON\.stringify\(newWatchlist\)\);\s+\}/,
  "localStorage.setItem('moodflix_watchlist', JSON.stringify(newWatchlist));"
);

// Replace loadData supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';[\s\S]*?if \(isSupabaseConfigured\) \{[\s\S]*?\} else \{([\s\S]*?)\}/,
  `$1
        const savedRatings = localStorage.getItem('moodflix_ratings');
        if (savedRatings) setUserRatings(JSON.parse(savedRatings));
        
        const savedComments = localStorage.getItem('moodflix_comments');
        if (savedComments) setUserComments(JSON.parse(savedComments));`
);

// Replace saveSearchToHistory supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';\s+if \(isSupabaseConfigured && user\) \{[\s\S]*?\} else \{\s+localStorage\.setItem\('moodflix_search_history', JSON\.stringify\(updated\)\);\s+\}/,
  "localStorage.setItem('moodflix_search_history', JSON.stringify(updated));"
);

// Replace addToHistory supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';\s+if \(isSupabaseConfigured && user\) \{[\s\S]*?\} else \{\s+localStorage\.setItem\('moodflix_history', JSON\.stringify\(newHistory\)\);\s+\}/,
  "localStorage.setItem('moodflix_history', JSON.stringify(newHistory));"
);

// Replace handleDeleteHistory supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';\s+if \(isSupabaseConfigured && user\) \{[\s\S]*?\} else \{\s+localStorage\.setItem\('moodflix_history', JSON\.stringify\(newHistory\)\);\s+\}/,
  "localStorage.setItem('moodflix_history', JSON.stringify(newHistory));"
);

// Replace handleRate supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';\s+if \(isSupabaseConfigured && user\) \{[\s\S]*?\} else \{\s+localStorage\.setItem\('moodflix_ratings', JSON\.stringify\(newRatings\)\);\s+\}/,
  "localStorage.setItem('moodflix_ratings', JSON.stringify(newRatings));"
);

// Replace handleSaveComment supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';\s+if \(isSupabaseConfigured && user\) \{[\s\S]*?\} else \{\s+localStorage\.setItem\('moodflix_comments', JSON\.stringify\(newComments\)\);\s+\}/,
  "localStorage.setItem('moodflix_comments', JSON.stringify(newComments));"
);

// Replace handleDeleteComment supabase logic
dashboardContent = dashboardContent.replace(
  /const isSupabaseConfigured = !!import\.meta\.env\.VITE_SUPABASE_URL && !!import\.meta\.env\.VITE_SUPABASE_ANON_KEY && user\?\.email !== 'demo@moodflix\.com';\s+if \(isSupabaseConfigured && user\) \{[\s\S]*?\} else \{\s+localStorage\.setItem\('moodflix_comments', JSON\.stringify\(newComments\)\);\s+\}/,
  "localStorage.setItem('moodflix_comments', JSON.stringify(newComments));"
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashboardContent);
console.log("Supabase removed from Dashboard.tsx");
