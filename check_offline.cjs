const fs = require('fs');

const html = fs.readFileSync('public/standalone.html', 'utf8');

// Search for any URLs
const urlRegex = /https?:\/\/[^\s"'`<>)]+/gi;
const urls = html.match(urlRegex) || [];
console.log('Total URLs found:', urls.length);
const unique = [...new Set(urls)];
console.log('Unique URLs:');
unique.forEach(u => console.log('  -', u));

// Search for any network calls
const netRegex = /\b(?:fetch|XMLHttpRequest|WebSocket|Worker|navigator\.serviceWorker)\b/g;
const netMatches = html.match(netRegex) || [];
console.log('Network API references:', netMatches);

// Search for any external script or link tags
const tagRegex = /<(?:script|link|img|iframe|source)[^>]*>/gi;
const tags = html.match(tagRegex) || [];
console.log('\nAll resource tags:');
tags.forEach(t => {
  if (t.includes('src=') || t.includes('href=')) {
    console.log('  ', t.slice(0, 100));
  }
});
