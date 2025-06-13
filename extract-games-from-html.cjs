const fs = require('fs');

// Read all attached HTML files
const files = [
  'attached_assets/Pasted--div-class-bg-gray-900-30-rounded-lg-p-4-div-class-relative-mb-4-div-class-relative-svg-xml-1749845105857_1749845105858.txt',
  'attached_assets/Pasted--div-class-grid-grid-cols-2-md-grid-cols-3-lg-grid-cols-4-gap-4-div-class-group-relative-bg-gray-1749845120104_1749845120105.txt',
  'attached_assets/Pasted--div-class-grid-grid-cols-2-md-grid-cols-3-lg-grid-cols-4-gap-4-div-class-group-relative-bg-gray-1749845140346_1749845140347.txt',
  'attached_assets/Pasted--div-class-grid-grid-cols-2-md-grid-cols-3-lg-grid-cols-4-gap-4-div-class-group-relative-bg-gray-1749845153032_1749845153035.txt'
];

function extractGamesFromHTML(htmlContent) {
  const games = [];
  
  // Regex to find game cards with image URLs and names
  const gamePattern = /<div class="group relative bg-gray-900\/50[^>]*>.*?<img alt="([^"]+)"[^>]*src="[^"]*url=([^&]+)[^"]*"[^>]*>.*?<h3[^>]*>([^<]+)<\/h3>.*?<p[^>]*>([^<]+)<\/p>.*?<\/div>/gs;
  
  let match;
  while ((match = gamePattern.exec(htmlContent)) !== null) {
    const altText = match[1];
    const imageUrl = decodeURIComponent(match[2]);
    const gameName = match[3].trim();
    const category = match[4].trim();
    
    // Only include Pragmatic Play games
    if (htmlContent.includes('PragmaticPlay') && imageUrl.includes('oss.cloudoss.org')) {
      games.push({
        name: gameName || altText,
        provider: 'Pragmatic Play',
        category: 'pragmatic',
        imageUrl: imageUrl
      });
    }
  }
  
  // Alternative regex for different HTML structures
  const altGamePattern = /alt="([^"]+)"[^>]*srcset="[^"]*url=([^&]+)[^"]*"[^>]*>.*?<h3[^>]*>([^<]+)<\/h3>/gs;
  
  while ((match = altGamePattern.exec(htmlContent)) !== null) {
    const altText = match[1];
    const imageUrl = decodeURIComponent(match[2]);
    const gameName = match[3].trim();
    
    // Only include Pragmatic Play games and avoid duplicates
    if (htmlContent.includes('PragmaticPlay') && imageUrl.includes('oss.cloudoss.org')) {
      const existing = games.find(g => g.name === (gameName || altText));
      if (!existing) {
        games.push({
          name: gameName || altText,
          provider: 'Pragmatic Play',
          category: 'pragmatic',
          imageUrl: imageUrl
        });
      }
    }
  }
  
  return games;
}

function main() {
  let allGames = [];
  
  console.log('Extracting games from HTML files...');
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const games = extractGamesFromHTML(content);
      allGames = allGames.concat(games);
      console.log(`Extracted ${games.length} games from ${file}`);
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }
  
  // Remove duplicates based on name
  const uniqueGames = allGames.filter((game, index, self) => 
    index === self.findIndex(g => g.name === game.name)
  );
  
  console.log(`\nFound ${uniqueGames.length} unique Pragmatic Play games:`);
  uniqueGames.forEach((game, index) => {
    console.log(`${index + 1}. ${game.name}`);
    console.log(`   Image: ${game.imageUrl}`);
  });
  
  // Generate TypeScript code for gameData.ts
  let tsCode = 'export const games: GameData[] = [\n';
  
  uniqueGames.forEach((game, index) => {
    tsCode += `  {\n`;
    tsCode += `    id: '${index + 1}',\n`;
    tsCode += `    name: '${game.name}',\n`;
    tsCode += `    provider: '${game.provider}',\n`;
    tsCode += `    category: '${game.category}',\n`;
    tsCode += `    imageUrl: '${game.imageUrl}'\n`;
    tsCode += `  }${index < uniqueGames.length - 1 ? ',' : ''}\n`;
  });
  
  tsCode += '];\n';
  
  // Save extracted games
  fs.writeFileSync('extracted-pragmatic-games.json', JSON.stringify(uniqueGames, null, 2));
  fs.writeFileSync('pragmatic-games-code.ts', tsCode);
  
  console.log('\nSaved extracted games to:');
  console.log('- extracted-pragmatic-games.json');
  console.log('- pragmatic-games-code.ts');
  
  return uniqueGames;
}

main();