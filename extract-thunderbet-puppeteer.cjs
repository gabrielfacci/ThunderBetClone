const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

async function validateImageUrl(url) {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

function extractGameNameFromUrl(url) {
  const filename = url.split('/').pop();
  const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
  
  // Convert different naming conventions to readable names
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
  if (lowerUrl.includes('yggdrasil')) return 'Yggdrasil';
  if (lowerUrl.includes('hacksaw')) return 'Hacksaw Gaming';
  
  return 'Unknown Provider';
}

async function extractThunderBetGames() {
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to ThunderBet...');
    await page.goto('https://www.thunderbet.fun', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('Waiting for page content to load...');
    
    // Wait for various possible game container selectors
    try {
      await page.waitForSelector('img', { timeout: 10000 });
    } catch (e) {
      console.log('Basic img selector timeout, continuing...');
    }

    // Try to wait for common game-related selectors
    const gameSelectors = [
      '.game-list',
      '.provider-list', 
      '.games-container',
      '.game-item',
      '.slot-game',
      '[class*="game"]',
      '[class*="slot"]',
      '[data-game]'
    ];

    for (const selector of gameSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`Found game container: ${selector}`);
        break;
      } catch (e) {
        // Continue to next selector
      }
    }

    console.log('Extracting all images from page...');
    
    const imageData = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const results = [];

      images.forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
        if (!src) return;

        // Check for game-related terms in URL
        const lowerSrc = src.toLowerCase();
        const isGameImage = 
          lowerSrc.includes('gameicon') ||
          lowerSrc.includes('pragmatic') ||
          lowerSrc.includes('evolution') ||
          lowerSrc.includes('relax') ||
          lowerSrc.includes('jili') ||
          lowerSrc.includes('game') ||
          lowerSrc.includes('slot') ||
          lowerSrc.includes('casino');

        if (isGameImage && !lowerSrc.includes('logo') && !lowerSrc.includes('banner')) {
          // Try to get game name from alt text, title, or surrounding elements
          let gameName = img.alt || img.title || '';
          
          // Look for game name in parent elements
          if (!gameName) {
            let parent = img.parentElement;
            let attempts = 0;
            while (parent && attempts < 3) {
              const titleElement = parent.querySelector('[title]') || 
                                 parent.querySelector('.game-name') ||
                                 parent.querySelector('.title') ||
                                 parent.querySelector('h1, h2, h3, h4, h5, h6');
              
              if (titleElement) {
                gameName = titleElement.textContent || titleElement.title || '';
                break;
              }
              parent = parent.parentElement;
              attempts++;
            }
          }

          results.push({
            src: src,
            alt: img.alt || '',
            title: img.title || '',
            gameName: gameName,
            className: img.className || '',
            parentClasses: img.parentElement?.className || ''
          });
        }
      });

      return results;
    });

    console.log(`Found ${imageData.length} potential game images`);

    const validatedGames = [];
    const seenUrls = new Set();

    for (const imgData of imageData) {
      if (seenUrls.has(imgData.src)) continue;
      seenUrls.add(imgData.src);

      console.log(`Validating: ${imgData.src.substring(0, 100)}...`);
      
      const isValid = await validateImageUrl(imgData.src);
      
      if (isValid) {
        const gameName = imgData.gameName || extractGameNameFromUrl(imgData.src);
        const provider = detectProviderFromUrl(imgData.src);
        
        if (gameName && gameName.length > 2) {
          validatedGames.push({
            name: gameName,
            provider: provider,
            image: imgData.src,
            alt: imgData.alt,
            title: imgData.title
          });
          
          console.log(`✓ ${gameName} (${provider})`);
        }
      } else {
        console.log(`✗ Invalid image URL`);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return validatedGames;

  } catch (error) {
    console.error('Error during extraction:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function main() {
  console.log('Starting ThunderBet game extraction with Puppeteer...');
  
  const games = await extractThunderBetGames();
  
  console.log(`\nExtracted ${games.length} valid games:`);
  games.forEach((game, index) => {
    console.log(`${index + 1}. ${game.name} (${game.provider})`);
  });

  if (games.length > 0) {
    // Save to JSON file
    fs.writeFileSync('thunderbet-extracted-games.json', JSON.stringify(games, null, 2));
    console.log('\nSaved extracted games to thunderbet-extracted-games.json');

    // Generate TypeScript code for direct import
    const tsCode = `// Auto-generated game data from ThunderBet extraction
export const extractedGames = ${JSON.stringify(games, null, 2)};

export interface ExtractedGame {
  name: string;
  provider: string;
  image: string;
  alt?: string;
  title?: string;
}`;

    fs.writeFileSync('extracted-thunderbet-games.ts', tsCode);
    console.log('Generated TypeScript file: extracted-thunderbet-games.ts');
  } else {
    console.log('\nNo valid games extracted. Site structure may have changed or images are not accessible.');
  }
}

main().catch(console.error);