const fs = require('fs');

const files = ['src/pages/Dashboard.tsx', 'src/pages/Landing.tsx', 'src/pages/Auth.tsx'];
for (const file of files) {
  if (fs.existsSync(file)) {
    let raw = fs.readFileSync(file, 'utf8');
    
    if(file === 'src/pages/Landing.tsx') {
      raw = raw.replace(/text-white/g, 'REPLACE_ME_TEXT_WHITE');
      raw = raw.replace(/border-white\//g, 'border-foreground/');
      raw = raw.replace(/bg-white\//g, 'bg-foreground/');
      raw = raw.replace(/to-white/g, 'to-foreground');
      
      // Selectively revert or fix REPLACE_ME
      raw = raw.replace(/REPLACE_ME_TEXT_WHITE\/([0-9]+)/g, 'text-foreground/$1');
      raw = raw.replace(/bg-primary(.*?)REPLACE_ME_TEXT_WHITE/g, 'bg-primary$1text-primary-foreground');
      raw = raw.replace(/bg-black\/60(.*?)REPLACE_ME_TEXT_WHITE/g, 'bg-black/60$1text-white');
      raw = raw.replace(/REPLACE_ME_TEXT_WHITE/g, 'text-foreground');
    }
    
    if(file === 'src/pages/Dashboard.tsx') {
      raw = raw.replace(/text-white/g, 'REPLACE_ME_TEXT_WHITE');
      raw = raw.replace(/border-white\//g, 'border-foreground/');
      raw = raw.replace(/bg-white\//g, 'bg-foreground/');
      
      // Selectively revert or fix REPLACE_ME
      raw = raw.replace(/REPLACE_ME_TEXT_WHITE\/([0-9]+)/g, 'text-foreground/$1');
      raw = raw.replace(/bg-primary(.*?)REPLACE_ME_TEXT_WHITE/g, 'bg-primary$1text-primary-foreground');
      raw = raw.replace(/bg-black\/50(.*?)hover:bg-red-500 REPLACE_ME_TEXT_WHITE/g, 'bg-black/50$1hover:bg-red-500 text-white');
      raw = raw.replace(/bg-black\/50(.*?)REPLACE_ME_TEXT_WHITE/g, 'bg-black/50$1text-white');
      raw = raw.replace(/bg-black\/80(.*?)REPLACE_ME_TEXT_WHITE/g, 'bg-black/80$1text-white');
      raw = raw.replace(/bg-emerald-600(.*?)REPLACE_ME_TEXT_WHITE/g, 'bg-emerald-600$1text-white');
      raw = raw.replace(/REPLACE_ME_TEXT_WHITE/g, 'text-foreground');
    }
    
    if (file === 'src/pages/Auth.tsx') {
       raw = raw.replace(/text-white/g, 'text-foreground');
       raw = raw.replace(/bg-primary p-2 rounded-xl">\s*<Clapperboard className="w-6 h-6 text-foreground"/g, 'bg-primary p-2 rounded-xl">\n          <Clapperboard className="w-6 h-6 text-primary-foreground"');
    }

    fs.writeFileSync(file, raw);
    console.log("Processed " + file);
  }
}
