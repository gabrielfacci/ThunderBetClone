const fs = require('fs');

// Read all attached HTML files for Relax Gaming games
const files = [
  'attached_assets/Pasted--div-class-grid-grid-cols-2-md-grid-cols-3-lg-grid-cols-4-gap-4-div-class-group-relative-bg-gray-1749845984057_1749845984059.txt',
  'attached_assets/Pasted--div-class-grid-grid-cols-2-md-grid-cols-3-lg-grid-cols-4-gap-4-div-class-group-relative-bg-gray-1749845994468_1749845994468.txt'
];

function extractRelaxGamesFromHTML(htmlContent) {
  const games = [];
  
  // Regex to find game cards with image URLs and names for Relax Gaming games
  const gamePattern = /<div class="group relative bg-gray-900\/50[^>]*>.*?<img alt="([^"]+)"[^>]*src="[^"]*url=([^&]+)[^"]*"[^>]*>.*?<h3[^>]*>([^<]+)<\/h3>.*?<p[^>]*>([^<]+)<\/p>.*?<\/div>/gs;
  
  let match;
  while ((match = gamePattern.exec(htmlContent)) !== null) {
    const altText = match[1];
    const imageUrl = decodeURIComponent(match[2]);
    const gameName = match[3].trim();
    const category = match[4].trim();
    
    // Only include Relax Gaming games
    if (htmlContent.includes('Relax') && imageUrl.includes('oss.cloudoss.org')) {
      games.push({
        name: gameName || altText,
        provider: 'Relax Gaming',
        category: 'relax',
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
    
    // Only include Relax Gaming games and avoid duplicates
    if (htmlContent.includes('Relax') && imageUrl.includes('oss.cloudoss.org')) {
      const existing = games.find(g => g.name === (gameName || altText));
      if (!existing) {
        games.push({
          name: gameName || altText,
          provider: 'Relax Gaming',
          category: 'relax',
          imageUrl: imageUrl
        });
      }
    }
  }
  
  return games;
}

function main() {
  let allGames = [];
  
  console.log('Extracting Relax Gaming games from HTML files...');
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const games = extractRelaxGamesFromHTML(content);
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
  
  console.log(`\nFound ${uniqueGames.length} unique Relax Gaming games:`);
  uniqueGames.forEach((game, index) => {
    console.log(`${index + 1}. ${game.name}`);
    console.log(`   Image: ${game.imageUrl}`);
  });
  
  // Generate TypeScript code for gameData.ts
  let tsCode = 'Relax Gaming Games:\n';
  
  uniqueGames.forEach((game, index) => {
    tsCode += `  {\n`;
    tsCode += `    id: '${73 + index}',\n`;
    tsCode += `    name: '${game.name}',\n`;
    tsCode += `    provider: '${game.provider}',\n`;
    tsCode += `    category: '${game.category}',\n`;
    tsCode += `    imageUrl: '${game.imageUrl}'\n`;
    tsCode += `  }${index < uniqueGames.length - 1 ? ',' : ''}\n`;
  });
  
  // Save extracted games
  fs.writeFileSync('extracted-relax-games.json', JSON.stringify(uniqueGames, null, 2));
  fs.writeFileSync('relax-games-code.ts', tsCode);
  
  console.log('\nSaved extracted Relax Gaming games to:');
  console.log('- extracted-relax-games.json');
  console.log('- relax-games-code.ts');
  
  return uniqueGames;
}

main();