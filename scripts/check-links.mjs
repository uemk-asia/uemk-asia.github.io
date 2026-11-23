// Check every distinct external HTTPS link in the built HTML.
// Some services block automated requests; inspect reported failures manually.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? htmlFiles(join(dir, entry.name)) : entry.name.endsWith('.html') ? [join(dir, entry.name)] : []))).flat();
}
const urls = new Set();
for (const file of await htmlFiles('dist')) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/href="(https:\/\/[^"#]+)(?:#[^"]*)?"/g)) {
    const url = match[1].replaceAll('&amp;', '&');
    if (!url.startsWith('https://uemk-asia.github.io')) urls.add(url);
  }
}
let failures = 0;
for (const url of [...urls].sort()) {
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (response.status === 403 || response.status === 405) response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    if (!response.ok) { failures++; console.log(`${response.status} ${url}`); }
    else console.log(`OK ${url}`);
  } catch (error) { failures++; console.log(`ERROR ${url}: ${error.message}`); }
}
console.log(`Checked ${urls.size} external URLs; ${failures} need review.`);
if (failures) process.exitCode = 1;
