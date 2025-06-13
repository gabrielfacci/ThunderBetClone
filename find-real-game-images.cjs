const https = require('https');
const fs = require('fs');

function testImageUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.pragmaticplay.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
      }
    }, (res) => {
      resolve(res.statusCode === 200 && res.headers['content-type']?.includes('image'));
    });
    
    request.on('error', () => resolve(false));
    request.setTimeout(10000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function findRealGameImages() {
  const games = [
    { name: 'Sweet Bonanza', id: 'vs20fruitsw' },
    { name: 'Gates of Olympus', id: 'vs20gateso' },
    { name: 'The Dog House', id: 'vs20doghouse' },
    { name: 'Big Bass Bonanza', id: 'vs10bbbonanza' },
    { name: 'Wild West Gold', id: 'vs40wildwest' },
    { name: 'Buffalo King', id: 'vs4096buffalo' },
    { name: 'Sugar Rush', id: 'vs20sugarray' },
    { name: 'Great Rhino', id: 'vs20rhino' },
    { name: 'Fruit Party', id: 'vs20fruitparty' },
    { name: 'Wolf Gold', id: 'vs25wolfgold' },
    { name: 'Madame Destiny', id: 'vs10madame' },
    { name: 'Mustang Gold', id: 'vs25mustang' },
    { name: 'Fire Strike', id: 'vs15firestrike' },
    { name: 'John Hunter', id: 'vs25john' },
    { name: 'Aztec Bonanza', id: 'vs20aztecbonus' },
    { name: 'Bonanza Gold', id: 'vs20bonzgold' },
    { name: 'Hot Safari', id: 'vs25safari' },
    { name: 'Pirate Gold', id: 'vs40pirate' },
    { name: 'Gems Bonanza', id: 'vs20gembo' },
    { name: 'Jungle Gorilla', id: 'vs20gorilla' }
  ];

  // Known working CDN patterns for slot game images
  const cdnPatterns = [
    'https://www.pragmaticplay.com/wp-content/uploads/2019/05/{id}.png',
    'https://www.pragmaticplay.com/wp-content/uploads/2020/05/{id}.png',
    'https://www.pragmaticplay.com/wp-content/uploads/2021/05/{id}.png',
    'https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/{id}.png',
    'https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/{id}.jpg',
    'https://static.pragmaticplay.net/content/games/{id}/icon.png',
    'https://www.casinoguru.com/uploads/game_images/pragmatic-play/{name}.jpg',
    'https://www.askgamblers.com/casino-games/images/pragmatic-play/{name}.jpg',
    'https://cdn.casinolytics.com/game_images/pragmatic-play/{name}.jpg',
    'https://images.casinobonusca.com/game/{name}.jpg',
    'https://cdn.softgamings.com/uploads/game_images/pragmatic-play/{name}.jpg'
  ];

  const validGames = [];

  for (const game of games) {
    console.log(`Testing images for: ${game.name}`);
    let foundWorking = false;

    for (const pattern of cdnPatterns) {
      const nameSlug = game.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const url = pattern.replace('{id}', game.id).replace('{name}', nameSlug);
      
      console.log(`  Testing: ${url}`);
      const isWorking = await testImageUrl(url);
      
      if (isWorking) {
        validGames.push({
          id: validGames.length + 1,
          name: game.name,
          provider: 'Pragmatic Play',
          category: 'pragmatic',
          imageUrl: url
        });
        console.log(`  ✓ Found working image: ${url}`);
        foundWorking = true;
        break;
      }
    }

    if (!foundWorking) {
      console.log(`  ✗ No working image found for ${game.name}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return validGames;
}

// Test a few known working image URLs first
async function testKnownUrls() {
  const testUrls = [
    'https://www.askgamblers.com/gambling-news/uploads/2021/02/gates-of-olympus-thumb.jpg',
    'https://www.casinoguru.com/uploads/game_images/pragmatic-play/sweet-bonanza.jpg',
    'https://cdn.casinolytics.com/game_images/pragmatic-play/wolf-gold.jpg'
  ];

  console.log('Testing known working URLs...');
  for (const url of testUrls) {
    const works = await testImageUrl(url);
    console.log(`${works ? '✓' : '✗'} ${url}`);
  }
}

async function main() {
  await testKnownUrls();
  console.log('\nFinding real game images...');
  
  const games = await findRealGameImages();
  
  console.log(`\nFound ${games.length} games with working images:`);
  games.forEach(game => {
    console.log(`${game.name}: ${game.imageUrl}`);
  });

  if (games.length > 0) {
    fs.writeFileSync('real-game-images.json', JSON.stringify(games, null, 2));
    console.log('\nSaved working images to real-game-images.json');
  } else {
    console.log('\nNo working images found. CDNs might be blocking requests or images moved.');
  }
}

main().catch(console.error);