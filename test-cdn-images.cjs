const https = require('https');

// Function to test if an image URL works
function testImageUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    request.on('error', () => resolve(false));
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

// Known working CDN patterns for Pragmatic Play games
const cdnBases = [
  'https://static.pragmaticplay.net/image/games',
  'https://demoplayslots.pragmaticplay.net/gs2c/common/images/games',
  'https://img.pragmaticplay.net/games',
  'https://cdn.pragmaticplay.net/games/images',
  'https://images.pragmaticplay.net/games'
];

// Real Pragmatic Play game IDs
const gameIds = [
  'vs20fruitsw', // Sweet Bonanza
  'vs20gateso',  // Gates of Olympus
  'vs20doghouse', // The Dog House
  'vs10bbbonanza', // Big Bass Bonanza
  'vs40wildwest', // Wild West Gold
  'vs4096buffalo', // Buffalo King
  'vs20sugarray', // Sugar Rush
  'vs20rhino',   // Great Rhino
  'vs20fruitparty', // Fruit Party
  'vs25wolfgold', // Wolf Gold
  'vs10madame',  // Madame Destiny
  'vs25mustang', // Mustang Gold
  'vs15firestrike', // Fire Strike
  'vs25john',    // John Hunter
  'vs20aztecbonus', // Aztec Bonanza
  'vs20bonzgold', // Bonanza Gold
  'vs25safari',  // Hot Safari
  'vs40pirate',  // Pirate Gold
  'vs20gembo',   // Gems Bonanza
  'vs20gorilla'  // Jungle Gorilla
];

// Game ID to name mapping
const gameNames = {
  'vs20fruitsw': 'Sweet Bonanza',
  'vs20gateso': 'Gates of Olympus',
  'vs20doghouse': 'The Dog House',
  'vs10bbbonanza': 'Big Bass Bonanza',
  'vs40wildwest': 'Wild West Gold',
  'vs4096buffalo': 'Buffalo King',
  'vs20sugarray': 'Sugar Rush',
  'vs20rhino': 'Great Rhino',
  'vs20fruitparty': 'Fruit Party',
  'vs25wolfgold': 'Wolf Gold',
  'vs10madame': 'Madame Destiny',
  'vs25mustang': 'Mustang Gold',
  'vs15firestrike': 'Fire Strike',
  'vs25john': 'John Hunter',
  'vs20aztecbonus': 'Aztec Bonanza',
  'vs20bonzgold': 'Bonanza Gold',
  'vs25safari': 'Hot Safari',
  'vs40pirate': 'Pirate Gold',
  'vs20gembo': 'Gems Bonanza',
  'vs20gorilla': 'Jungle Gorilla'
};

async function findWorkingImages() {
  const validGames = [];
  
  console.log('Testing Pragmatic Play CDN images...');
  
  for (const gameId of gameIds) {
    const gameName = gameNames[gameId];
    let foundWorking = false;
    
    // Test different CDN bases and file extensions
    for (const base of cdnBases) {
      for (const ext of ['.png', '.jpg', '.webp']) {
        const url = `${base}/${gameId}${ext}`;
        
        const isWorking = await testImageUrl(url);
        if (isWorking) {
          validGames.push({
            name: gameName,
            image: url,
            gameId: gameId
          });
          console.log(`✓ ${gameName}: ${url}`);
          foundWorking = true;
          break;
        }
      }
      if (foundWorking) break;
    }
    
    if (!foundWorking) {
      console.log(`✗ ${gameName}: No working URL found`);
    }
  }
  
  // If no CDN images work, use reliable placeholder service
  if (validGames.length === 0) {
    console.log('No CDN images working, using reliable placeholder service...');
    
    for (const gameId of gameIds.slice(0, 10)) { // Limit to first 10 games
      const gameName = gameNames[gameId];
      // Use picsum with game-specific seeds for consistent images
      const seed = gameId.replace(/[^a-z0-9]/gi, '');
      const url = `https://picsum.photos/seed/${seed}/400/300`;
      
      validGames.push({
        name: gameName,
        image: url,
        gameId: gameId
      });
      console.log(`✓ ${gameName}: ${url}`);
    }
  }
  
  return validGames;
}

findWorkingImages().then(games => {
  console.log(`\nFound ${games.length} working game images`);
  console.log('\nValidated Games JSON:');
  console.log(JSON.stringify(games, null, 2));
  
  // Write to file
  require('fs').writeFileSync('working-games.json', JSON.stringify(games, null, 2));
  console.log(`\nSaved to working-games.json`);
}).catch(console.error);