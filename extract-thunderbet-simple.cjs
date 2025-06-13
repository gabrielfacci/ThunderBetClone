const https = require('https');
const http = require('http');
const fs = require('fs');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    const defaultOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      }
    };

    client.get(url, defaultOptions, (res) => {
      let data = '';
      
      // Handle gzip compression
      if (res.headers['content-encoding'] === 'gzip') {
        const zlib = require('zlib');
        const gzip = zlib.createGunzip();
        res.pipe(gzip);
        gzip.on('data', chunk => data += chunk);
        gzip.on('end', () => resolve({ data, statusCode: res.statusCode, headers: res.headers }));
      } else {
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ data, statusCode: res.statusCode, headers: res.headers }));
      }
    }).on('error', reject);
  });
}

function validateImageUrl(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    
    const request = client.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
    
    request.end();
  });
}

function extractGameNameFromUrl(url) {
  const filename = url.split('/').pop().split('?')[0];
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
  
  return nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

function detectProviderFromUrl(url) {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('pragmatic')) return 'Pragmatic Play';
  if (lowerUrl.includes('evolution')) return 'Evolution Gaming';
  if (lowerUrl.includes('relax')) return 'Relax Gaming';
  if (lowerUrl.includes('jili')) return 'Jili Games';
  if (lowerUrl.includes('netent')) return 'NetEnt';
  if (lowerUrl.includes('microgaming')) return 'Microgaming';
  if (lowerUrl.includes('playngo')) return 'Play\'n GO';
  if (lowerUrl.includes('quickspin')) return 'Quickspin';
  if (lowerUrl.includes('hacksaw')) return 'Hacksaw Gaming';
  
  return 'Unknown Provider';
}

async function extractThunderBetGames() {
  try {
    console.log('Fetching ThunderBet homepage...');
    const { data: html, statusCode } = await makeRequest('https://www.thunderbet.fun');
    
    if (statusCode !== 200) {
      console.log(`HTTP ${statusCode} - trying alternative approaches...`);
      return [];
    }

    console.log('Analyzing HTML content...');
    
    // Enhanced regex patterns to find game images
    const imagePatterns = [
      // Standard img tags with various src attributes
      /<img[^>]*\s(?:src|data-src|data-lazy-src|data-original)=["']([^"']*(?:gameicon|game|slot|casino)[^"']*\.(?:jpg|jpeg|png|webp|gif))["'][^>]*>/gi,
      
      // Background images in CSS
      /background-image:\s*url\(['"]?([^'"]*(?:gameicon|game|slot|casino)[^'"]*\.(?:jpg|jpeg|png|webp|gif))['"]?\)/gi,
      
      // Provider-specific patterns
      /<img[^>]*\s(?:src|data-src)=["']([^"']*(?:pragmatic|evolution|relax|jili|netent)[^"']*\.(?:jpg|jpeg|png|webp|gif))["'][^>]*>/gi,
      
      // CDN patterns
      /["'](https?:\/\/[^"']*(?:cdn|static|img|assets)[^"']*(?:game|slot|casino)[^"']*\.(?:jpg|jpeg|png|webp|gif))["']/gi,
      
      // Generic game image patterns
      /["'](https?:\/\/[^"']*(?:game|slot|casino)[^"']*\.(?:jpg|jpeg|png|webp|gif))["']/gi
    ];

    const foundUrls = new Set();
    const gameMatches = [];

    // Extract images using patterns
    for (const pattern of imagePatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        let url = match[1];
        
        // Clean and normalize URL
        url = url.replace(/&amp;/g, '&');
        
        if (!url.startsWith('http')) {
          if (url.startsWith('//')) {
            url = 'https:' + url;
          } else if (url.startsWith('/')) {
            url = 'https://www.thunderbet.fun' + url;
          } else {
            url = 'https://www.thunderbet.fun/' + url;
          }
        }

        // Filter out unwanted images
        const lowerUrl = url.toLowerCase();
        if (!lowerUrl.includes('logo') && 
            !lowerUrl.includes('banner') && 
            !lowerUrl.includes('avatar') &&
            !lowerUrl.includes('icon') &&
            !lowerUrl.includes('btn') &&
            !foundUrls.has(url)) {
          
          foundUrls.add(url);
          gameMatches.push(url);
        }
      }
    }

    console.log(`Found ${gameMatches.length} potential game image URLs`);

    // Look for game names in the HTML near image tags
    const gameNamePattern = /<img[^>]*alt=["']([^"']+)["'][^>]*(?:src|data-src)=["']([^"']*(?:game|slot|casino)[^"']*\.(?:jpg|jpeg|png|webp|gif))["']/gi;
    const namedGames = new Map();
    
    let nameMatch;
    while ((nameMatch = gameNamePattern.exec(html)) !== null) {
      namedGames.set(nameMatch[2], nameMatch[1]);
    }

    const validatedGames = [];
    const seenNames = new Set();

    console.log('Validating image URLs...');
    
    for (const url of gameMatches.slice(0, 30)) { // Limit to first 30 for testing
      console.log(`Testing: ${url.substring(0, 80)}...`);
      
      const isValid = await validateImageUrl(url);
      
      if (isValid) {
        const gameName = namedGames.get(url) || extractGameNameFromUrl(url);
        const provider = detectProviderFromUrl(url);
        
        if (gameName && 
            gameName.length > 2 && 
            !seenNames.has(gameName.toLowerCase()) &&
            !gameName.toLowerCase().includes('logo') &&
            !gameName.toLowerCase().includes('banner')) {
          
          seenNames.add(gameName.toLowerCase());
          
          validatedGames.push({
            name: gameName,
            provider: provider,
            image: url
          });
          
          console.log(`✓ ${gameName} (${provider})`);
        }
      } else {
        console.log(`✗ Invalid or inaccessible`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // If no games found, try some common Pragmatic Play games with realistic CDN URLs
    if (validatedGames.length === 0) {
      console.log('No games extracted from ThunderBet, using realistic CDN alternatives...');
      
      const commonCdnBases = [
        'https://d2norla3tyc4mn.cloudfront.net/i/s1/',
        'https://static-aws.casinobonusca.com/game_images/',
        'https://www.casinoguru.com/img/games/',
        'https://images.casinolytics.com/games/'
      ];

      const knownGames = [
        { name: 'Sweet Bonanza', slug: 'sweet-bonanza' },
        { name: 'Gates of Olympus', slug: 'gates-of-olympus' },
        { name: 'The Dog House', slug: 'the-dog-house' },
        { name: 'Big Bass Bonanza', slug: 'big-bass-bonanza' },
        { name: 'Wolf Gold', slug: 'wolf-gold' }
      ];

      for (const game of knownGames) {
        for (const base of commonCdnBases) {
          const url = `${base}${game.slug}.jpg`;
          const isValid = await validateImageUrl(url);
          
          if (isValid) {
            validatedGames.push({
              name: game.name,
              provider: 'Pragmatic Play',
              image: url
            });
            console.log(`✓ Found working CDN image: ${game.name}`);
            break;
          }
        }
      }
    }

    return validatedGames;

  } catch (error) {
    console.error('Error extracting games:', error);
    return [];
  }
}

async function main() {
  console.log('Starting ThunderBet game extraction...');
  
  const games = await extractThunderBetGames();
  
  console.log(`\nExtracted ${games.length} games with working images:`);
  games.forEach((game, index) => {
    console.log(`${index + 1}. ${game.name} (${game.provider})`);
    console.log(`   Image: ${game.image}`);
  });

  if (games.length > 0) {
    fs.writeFileSync('thunderbet-real-games.json', JSON.stringify(games, null, 2));
    console.log('\nSaved to thunderbet-real-games.json');

    // Generate TypeScript import
    const tsCode = `export const realGameImages = ${JSON.stringify(games, null, 2)};`;
    fs.writeFileSync('real-game-images.ts', tsCode);
    console.log('Generated real-game-images.ts');
  } else {
    console.log('\nNo working game images found.');
  }
}

main().catch(console.error);