const https = require('https');
const http = require('http');

// Function to make HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ data, statusCode: res.statusCode }));
    }).on('error', reject);
  });
}

// Function to validate image URL
async function validateImageUrl(url) {
  try {
    const response = await makeRequest(url);
    return response.statusCode === 200;
  } catch (error) {
    return false;
  }
}

// Function to extract game name from image filename
function extractGameName(filename) {
  // Remove file extension and convert camelCase to readable name
  const name = filename.replace(/\.(jpg|png|webp)$/i, '');
  
  // Convert camelCase to space-separated words
  return name.replace(/([A-Z])/g, ' $1').trim();
}

async function extractGameImages() {
  try {
    console.log('Fetching ThunderBet page...');
    const { data: html } = await makeRequest('https://www.thunderbet.fun');
    
    // Look for various patterns that might contain game images
    const imagePatterns = [
      /src="([^"]*gameicon[^"]*(?:\.jpg|\.png|\.webp))"/gi,
      /data-src="([^"]*gameicon[^"]*(?:\.jpg|\.png|\.webp))"/gi,
      /"([^"]*images\/gameicon[^"]*(?:\.jpg|\.png|\.webp))"/gi,
      /"(https:\/\/[^"]*gameicon[^"]*(?:\.jpg|\.png|\.webp))"/gi
    ];
    
    const foundUrls = new Set();
    
    // Try different patterns
    for (const pattern of imagePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1];
        if (!url.includes('RT_')) {
          // Ensure full URL
          const fullUrl = url.startsWith('http') ? url : `https://www.thunderbet.fun${url.startsWith('/') ? '' : '/'}${url}`;
          foundUrls.add(fullUrl);
        }
      }
    }

    // If no gameicon images found, try common game image patterns
    if (foundUrls.size === 0) {
      console.log('No gameicon images found, trying alternative patterns...');
      
      // Look for common game providers and image patterns
      const altPatterns = [
        /"(https:\/\/[^"]*\/(?:SweetBonanza|GatesOfOlympus|BigBassBonanza|WildWestGold|BuffaloKing)[^"]*(?:\.jpg|\.png|\.webp))"/gi,
        /src="([^"]*pragmatic[^"]*(?:\.jpg|\.png|\.webp))"/gi,
        /data-lazy-src="([^"]*games?[^"]*(?:\.jpg|\.png|\.webp))"/gi
      ];
      
      for (const pattern of altPatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          foundUrls.add(match[1]);
        }
      }
    }

    console.log(`Found ${foundUrls.size} potential game image URLs`);
    
    if (foundUrls.size === 0) {
      // Use working CDN URLs for popular Pragmatic Play games
      const workingGames = [
        { name: "Sweet Bonanza", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs20fruitsw.png" },
        { name: "Gates of Olympus", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs20gateso.png" },
        { name: "The Dog House", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs20doghouse.png" },
        { name: "Big Bass Bonanza", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs10bbbonanza.png" },
        { name: "Wild West Gold", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs40wildwest.png" },
        { name: "Buffalo King", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs4096buffalo.png" },
        { name: "Sugar Rush", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs20sugarray.png" },
        { name: "Great Rhino", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs20rhino.png" },
        { name: "Fruit Party", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs20fruitparty.png" },
        { name: "Wolf Gold", image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/vs25wolfgold.png" }
      ];
      
      console.log('Validating working game images...');
      const validatedGames = [];
      
      for (const game of workingGames) {
        const isValid = await validateImageUrl(game.image);
        if (isValid) {
          validatedGames.push(game);
          console.log(`✓ ${game.name} - Image validated`);
        } else {
          console.log(`✗ ${game.name} - Image failed`);
        }
      }
      
      return validatedGames;
    }

    // Validate found URLs
    const validatedGames = [];
    const urls = Array.from(foundUrls);
    
    for (const url of urls) {
      console.log(`Validating: ${url}`);
      const isValid = await validateImageUrl(url);
      
      if (isValid) {
        const filename = url.split('/').pop();
        const gameName = extractGameName(filename);
        validatedGames.push({
          name: gameName,
          image: url
        });
        console.log(`✓ ${gameName}`);
      } else {
        console.log(`✗ Failed: ${url}`);
      }
    }
    
    return validatedGames;
    
  } catch (error) {
    console.error('Error extracting game images:', error);
    return [];
  }
}

// Run the extraction
extractGameImages().then(games => {
  console.log('\nValidated Games JSON:');
  console.log(JSON.stringify(games, null, 2));
  
  // Write to file
  require('fs').writeFileSync('validated-games.json', JSON.stringify(games, null, 2));
  console.log(`\nSaved ${games.length} validated games to validated-games.json`);
}).catch(console.error);