import { Jimp } from 'jimp';

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

async function run() {
  const inputPath = 'C:/Users/tonyb/.gemini/antigravity/brain/39418102-5f89-4e6b-bbdf-aacf28cb447b/logo_two_bright_1782283532705.png';
  const image = await Jimp.read(inputPath);
  
  const buckets = {};
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    const a = image.bitmap.data[idx + 3];
    
    if (a < 200) return; // skip transparent/semi-transparent background
    
    const [h, s, l] = rgbToHsl(r, g, b);
    
    // Group by general hue ranges:
    // Red/Orange: 0-40
    // Yellow: 41-70
    // Green: 71-150
    // Cyan/Blue: 151-260
    // Purple/Pink: 261-340
    // Red: 341-360
    // Grey/White/Black: Saturation < 15 or Lightness > 90 or Lightness < 10
    
    let category = '';
    if (s < 15 || l > 92 || l < 8) {
      category = `Grayscale (L: ${Math.round(l/10)*10})`;
    } else {
      let hueGroup = '';
      if (h <= 20 || h > 340) hueGroup = 'Red';
      else if (h <= 45) hueGroup = 'Orange';
      else if (h <= 70) hueGroup = 'Yellow';
      else if (h <= 160) hueGroup = 'Green';
      else if (h <= 260) hueGroup = 'Blue/Cyan';
      else hueGroup = 'Purple/Magenta';
      
      category = `${hueGroup} (H: ${Math.round(h/10)*10}, S: ${Math.round(s/10)*10}, L: ${Math.round(l/10)*10})`;
    }
    
    buckets[category] = (buckets[category] || 0) + 1;
  });
  
  const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
  console.log('Top color categories:');
  sorted.slice(0, 20).forEach(([cat, count]) => {
    console.log(`- ${cat}: ${count} pixels`);
  });
}

run();
