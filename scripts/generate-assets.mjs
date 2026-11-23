// Generate the social preview and PNG icons from the typographic identity.
// Uses the sharp development dependency; run after npm ci.
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
const icon = await readFile('public/favicon.svg');
await sharp(icon).resize(32, 32).png().toFile('public/favicon-32.png');
await sharp(icon).resize(180, 180).png().toFile('public/apple-touch-icon.png');
const preview = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#f5f7fb"/><rect width="18" height="630" fill="#1e3a8a"/>
<rect x="90" y="88" width="60" height="60" rx="8" fill="#1e3a8a"/><text x="120" y="132" text-anchor="middle" fill="white" font-family="Georgia,serif" font-size="44" font-weight="bold">A</text>
<text x="172" y="126" fill="#0f172a" font-family="Arial,sans-serif" font-size="26" font-weight="bold" letter-spacing="4">UEMK ASIA</text>
<text x="90" y="300" fill="#0f172a" font-family="Georgia,serif" font-size="65" font-weight="bold">Building a community for</text><text x="90" y="380" fill="#0f172a" font-family="Georgia,serif" font-size="65" font-weight="bold">safer and more aligned AI.</text>
<text x="90" y="515" fill="#475569" font-family="Arial,sans-serif" font-size="26">Alignment &amp; Safety Initiative for AI · UEM Kolkata</text></svg>`;
await sharp(Buffer.from(preview)).png().toFile('public/og-image.png');
