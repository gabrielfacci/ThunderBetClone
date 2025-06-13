const https = require('https');
const fs = require('fs');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ data, statusCode: res.statusCode }));
    }).on('error', reject);
  });
}

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

function extractGameName(text) {
  // Clean and format game names
  return text.replace(/[^\w\s]/g, '').trim();
}

async function extractThunderBetGames() {
  try {
    console.log('Fetching ThunderBet homepage...');
    const { data: html } = await makeRequest('https://www.thunderbet.fun');
    
    const foundGames = new Map();
    
    // Patterns to find game images and names
    const patterns = [
      // Image URLs with various formats
      /(?:src|data-src|data-lazy-src)=["']([^"']*(?:gameicon|game|slot)[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
      /(?:src|data-src|data-lazy-src)=["']([^"']*\/games\/[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
      /(?:src|data-src|data-lazy-src)=["']([^"']*\/images\/[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
      
      // Background images
      /background-image:\s*url\(['"]?([^'"]*(?:gameicon|game|slot)[^'"]*\.(?:jpg|jpeg|png|webp))['"]?\)/gi,
      
      // CDN URLs
      /["'](https?:\/\/[^"']*(?:cdn|static|img)[^"']*(?:gameicon|game|slot)[^"']*\.(?:jpg|jpeg|png|webp))["']/gi,
    ];
    
    // Extract image URLs
    const imageUrls = new Set();
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let url = match[1];
        if (!url.startsWith('http')) {
          url = url.startsWith('/') ? `https://www.thunderbet.fun${url}` : `https://www.thunderbet.fun/${url}`;
        }
        if (!url.includes('RT_') && !url.includes('logo') && !url.includes('banner')) {
          imageUrls.add(url);
        }
      }
    }
    
    console.log(`Found ${imageUrls.size} potential game image URLs`);
    
    // Extract game data from various HTML structures
    const gamePatterns = [
      // Look for game containers with titles and images
      /<div[^>]*class="[^"]*game[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>[\s\S]*?(?:title|alt)="([^"]*)"[\s\S]*?<\/div>/gi,
      /<img[^>]*(?:title|alt)="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi,
      /<[^>]*data-game[^>]*="([^"]*)"[^>]*>[\s\S]*?<img[^>]*src="([^"]*)"[^>]*>/gi,
    ];
    
    for (const pattern of gamePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const [, nameOrUrl, urlOrName] = match;
        
        // Determine which is name and which is URL
        let gameName, imageUrl;
        if (nameOrUrl.includes('http') || nameOrUrl.includes('.jpg') || nameOrUrl.includes('.png')) {
          imageUrl = nameOrUrl;
          gameName = urlOrName;
        } else {
          gameName = nameOrUrl;
          imageUrl = urlOrName;
        }
        
        if (gameName && imageUrl) {
          const cleanName = extractGameName(gameName);
          if (cleanName.length > 2) {
            foundGames.set(cleanName, imageUrl.startsWith('http') ? imageUrl : `https://www.thunderbet.fun${imageUrl}`);
          }
        }
      }
    }
    
    // Pragmatic Play games we're looking for
    const pragmaticGames = [
      'Sweet Bonanza', 'Gates of Olympus', 'The Dog House', 'Big Bass Bonanza',
      'Wild West Gold', 'Buffalo King', 'Sugar Rush', 'Great Rhino',
      'Fruit Party', 'Wolf Gold', 'Madame Destiny', 'Mustang Gold',
      'Fire Strike', 'John Hunter', 'Aztec Bonanza', 'Bonanza Gold',
      'Hot Safari', 'Pirate Gold', 'Gems Bonanza', 'Jungle Gorilla'
    ];
    
    const validatedGames = [];
    
    // Test URLs from imageUrls set
    console.log('Testing image URLs...');
    for (const url of Array.from(imageUrls).slice(0, 20)) {
      console.log(`Testing: ${url.substring(0, 80)}...`);
      const isValid = await testImageUrl(url);
      if (isValid) {
        // Try to extract game name from URL
        const filename = url.split('/').pop().split('.')[0];
        const gameName = filename.replace(/[-_]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
        
        validatedGames.push({
          name: gameName,
          provider: 'Unknown',
          category: 'slots',
          imageUrl: url
        });
        
        console.log(`✓ Added: ${gameName}`);
        if (validatedGames.length >= 20) break;
      }
    }
    
    // If no images found, use common game image CDNs
    if (validatedGames.length === 0) {
      console.log('No valid images found from ThunderBet, trying alternative CDNs...');
      
      const cdnBases = [
        'https://cdn.softswiss.net/i/s1/',
        'https://static.casinolytics.com/uploads/game_images/pragmatic-play/',
        'https://files.slack-edge.com/games/pragmatic/',
        'https://www.casinoguru.com/uploads/game_images/pragmatic-play/'
      ];
      
      for (let i = 0; i < pragmaticGames.length && i < 10; i++) {
        const game = pragmaticGames[i];
        const slug = game.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        for (const base of cdnBases) {
          const url = `${base}${slug}.jpg`;
          const isValid = await testImageUrl(url);
          if (isValid) {
            validatedGames.push({
              name: game,
              provider: 'Pragmatic Play',
              category: 'pragmatic',
              imageUrl: url
            });
            console.log(`✓ Found CDN image for: ${game}`);
            break;
          }
        }
      }
    }
    
    // Final fallback with working placeholder service
    if (validatedGames.length === 0) {
      console.log('Using reliable placeholder service for game images...');
      
      pragmaticGames.slice(0, 20).forEach((game, index) => {
        const seed = game.toLowerCase().replace(/\s+/g, '');
        validatedGames.push({
          name: game,
          provider: 'Pragmatic Play',
          category: 'pragmatic',
          imageUrl: `https://picsum.photos/seed/${seed}/400/300`
        });
      });
    }
    
    return validatedGames;
    
  } catch (error) {
    console.error('Error extracting games:', error);
    return [];
  }
}

// Run extraction
extractThunderBetGames().then(games => {
  console.log(`\nExtracted ${games.length} games:`);
  games.forEach(game => {
    console.log(`- ${game.name} (${game.provider})`);
  });
  
  // Save to JSON file
  fs.writeFileSync('thunderbet-games.json', JSON.stringify(games, null, 2));
  console.log(`\nSaved to thunderbet-games.json`);
  
  // Generate TypeScript format for direct use
  const tsCode = `export const extractedGames = ${JSON.stringify(games, null, 2)};`;
  fs.writeFileSync('extracted-games.ts', tsCode);
  console.log('Generated extracted-games.ts for TypeScript import');
  
}).catch(console.error);