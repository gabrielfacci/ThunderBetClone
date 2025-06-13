const https = require('https');
const fs = require('fs');

function testImageUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.pragmaticplay.com/'
      },
      timeout: 10000
    }, (res) => {
      resolve(res.statusCode === 200 && res.headers['content-type']?.includes('image'));
    });
    
    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function findWorkingGameImages() {
  // Official Pragmatic Play games with their correct IDs and known CDN patterns
  const games = [
    { name: 'Sweet Bonanza', id: 'vs20fruitsw', slug: 'sweet-bonanza' },
    { name: 'Gates of Olympus', id: 'vs20gateso', slug: 'gates-of-olympus' },
    { name: 'The Dog House', id: 'vs20doghouse', slug: 'the-dog-house' },
    { name: 'Big Bass Bonanza', id: 'vs10bbbonanza', slug: 'big-bass-bonanza' },
    { name: 'Wild West Gold', id: 'vs40wildwest', slug: 'wild-west-gold' },
    { name: 'Buffalo King', id: 'vs4096buffalo', slug: 'buffalo-king' },
    { name: 'Sugar Rush', id: 'vs20sugarray', slug: 'sugar-rush' },
    { name: 'Great Rhino', id: 'vs20rhino', slug: 'great-rhino' },
    { name: 'Fruit Party', id: 'vs20fruitparty', slug: 'fruit-party' },
    { name: 'Wolf Gold', id: 'vs25wolfgold', slug: 'wolf-gold' },
    { name: 'Madame Destiny', id: 'vs10madame', slug: 'madame-destiny' },
    { name: 'Mustang Gold', id: 'vs25mustang', slug: 'mustang-gold' },
    { name: 'Fire Strike', id: 'vs15firestrike', slug: 'fire-strike' },
    { name: 'John Hunter', id: 'vs25john', slug: 'john-hunter' },
    { name: 'Aztec Bonanza', id: 'vs20aztecbonus', slug: 'aztec-bonanza' },
    { name: 'Bonanza Gold', id: 'vs20bonzgold', slug: 'bonanza-gold' },
    { name: 'Hot Safari', id: 'vs25safari', slug: 'hot-safari' },
    { name: 'Pirate Gold', id: 'vs40pirate', slug: 'pirate-gold' },
    { name: 'Gems Bonanza', id: 'vs20gembo', slug: 'gems-bonanza' },
    { name: 'Jungle Gorilla', id: 'vs20gorilla', slug: 'jungle-gorilla' }
  ];

  // Known working CDN patterns from licensed operators
  const cdnPatterns = [
    // Official game review sites
    'https://www.askgamblers.com/casino-games/images/pragmatic-play/{slug}.jpg',
    'https://www.askgamblers.com/casino-games/images/pragmatic-play/{slug}.png',
    
    // Casino operator CDNs
    'https://d2norla3tyc4mn.cloudfront.net/i/s1/{id}.png',
    'https://cdn.softswiss.net/i/s1/{id}.png',
    
    // Game catalog sites
    'https://static.casinobonusca.com/game_images/pragmatic-play/{slug}.jpg',
    'https://images.casinolytics.com/games/{slug}.jpg',
    
    // Pragmatic Play official demo assets
    'https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/{id}.png',
    'https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/{id}.jpg',
    
    // Alternative official sources
    'https://static.pragmaticplay.net/content/games/{id}/icon.png',
    'https://static.pragmaticplay.net/content/games/{id}/thumb.jpg'
  ];

  const workingGames = [];

  console.log('Testing authentic Pragmatic Play game images...');

  for (const game of games) {
    console.log(`\nTesting ${game.name}...`);
    let found = false;

    for (const pattern of cdnPatterns) {
      const url = pattern.replace('{id}', game.id).replace('{slug}', game.slug);
      
      console.log(`  Checking: ${url}`);
      const isWorking = await testImageUrl(url);
      
      if (isWorking) {
        workingGames.push({
          name: game.name,
          provider: 'Pragmatic Play',
          category: 'pragmatic',
          imageUrl: url,
          gameId: game.id
        });
        
        console.log(`  ✓ Working image found!`);
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`  ✗ No working image found for ${game.name}`);
    }

    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return workingGames;
}

async function main() {
  const workingImages = await findWorkingGameImages();
  
  console.log(`\n\nFound ${workingImages.length} working authentic game images:`);
  
  workingImages.forEach((game, index) => {
    console.log(`${index + 1}. ${game.name}`);
    console.log(`   URL: ${game.imageUrl}`);
  });

  if (workingImages.length > 0) {
    fs.writeFileSync('authentic-game-images.json', JSON.stringify(workingImages, null, 2));
    console.log('\nSaved authentic images to authentic-game-images.json');
    
    // Generate code for direct integration
    const jsCode = `// Authentic Pragmatic Play game images from verified sources
export const authenticGameImages = ${JSON.stringify(workingImages, null, 2)};`;
    
    fs.writeFileSync('authentic-images.js', jsCode);
    console.log('Generated authentic-images.js for integration');
  } else {
    console.log('\nNo working authentic images found. CDNs may have CORS restrictions.');
  }
}

main().catch(console.error);