const { execFile } = require('child_process');
const { randomBytes } = require('crypto');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ALLOWED_HOSTS = [
  "www.instagram.com",
  "instagram.com",
  "cdninstagram.com",
  "scontent.cdninstagram.com",
  "fbcdn.net",
  "fna.fbcdn.net",
];

function isAllowedUrl(value) {
  try {
    const { hostname, protocol } = new URL(value);
    // ✅ Strict protocol check — blocks javascript:, file:, httpsevil.com etc
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    // ✅ Dot-prefix check — blocks evilinstagram.com matching instagram.com
    return ALLOWED_HOSTS.some(allowed =>
      hostname === allowed || hostname.endsWith('.' + allowed)
    );
  } catch {
    return false;
  }
}

function cleanInstagramUrl(url) {
  try {
    const parsed = new URL(url);
    // ✅ Only keep pathname — strips all tracking params
    return `https://www.instagram.com${parsed.pathname}`;
  } catch {
    return url;
  }
}

function sanitizeFilename(name) {
  return name
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200); // ✅ prevents OS filename length errors
}

function parseError(stderr) {
  if (!stderr) return null;
  if (stderr.includes('No video formats found'))
    return 'No video found. This may be a photo post or mixed carousel.';
  if (stderr.includes('Login required'))
    return 'Instagram requires login. Your cookies are missing or expired.';
  if (stderr.includes('429'))
    return 'Instagram is rate limiting your server. Wait a few minutes and try again.';
  if (stderr.includes('Private video') || stderr.includes('This content is not available'))
    return 'This post is private or unavailable.';
  if (stderr.includes('cookies'))
    return 'Cookie error. Try re-exporting your Instagram cookies.';
  return null;
}

// ✅ Centralised cookie resolution — used by both functions
function resolveCookiePath(cookiePath) {
  const resolved = cookiePath || process.env.INSTAGRAM_COOKIE_FILE || null;
  if (resolved && fs.existsSync(resolved)) return resolved;
  if (resolved) console.warn(`[auth] Cookie file not found: ${resolved}`);
  return null;
}

// ✅ cookiePath parameter added
function getVideoInfo(url, cookiePath = null) {
  return new Promise((resolve, reject) => {
    if (!isAllowedUrl(url)) {
      return reject(new Error('URL is not an allowed Instagram URL'));
    }

    const cleanUrl = cleanInstagramUrl(url);
    const resolvedCookiePath = resolveCookiePath(cookiePath); // ✅ fixed typo + centralised

    const args = [
      '-j',
      '--yes-playlist',
      '--ignore-errors',
    ];

    // ✅ Only add cookies arg if file actually exists
    if (resolvedCookiePath) {
      args.push('--cookies', resolvedCookiePath);
    }

    args.push(cleanUrl);

    execFile('yt-dlp', args, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error && !stdout) {
        const friendly = parseError(stderr);
        return reject(new Error(friendly || error.message));
      }

      if (!stdout || stdout.trim().length === 0) {
        return reject(new Error('yt-dlp returned no output'));
      }

      // ✅ Playlist returns one JSON object per line — parse each separately
      const items = stdout
        .trim()
        .split('\n')
        .map(line => {
          try { return JSON.parse(line); } catch { return null; }
        })
        .filter(Boolean)
        .filter(item => Array.isArray(item.formats) && item.formats.length > 0);

      if (items.length === 0) {
        return reject(new Error('No downloadable video found in this post'));
      }

      const data = items[0];
      const ext = data.ext || 'mp4';
      const filename = sanitizeFilename(`${data.title || 'instagram'}.${ext}`);

      resolve({
        title: data.title,
        thumbnail: data.thumbnail,
        url: data.url,
        filename,
        totalItems: items.length,
        formats: data.formats.map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          resolution: f.format_note || f.format,
          filesize: f.filesize || f.filesize_approx,
          url: f.url,
        })),
        playable_url: data.formats
          .filter(f => f.url && f.ext?.toLowerCase() === 'mp4')
          .sort((a, b) => (b.filesize || 0) - (a.filesize || 0))
          .map(f => f.url)
          .concat(data.url || [])
          .find(u => !!u) || null,
      });
    });
  });
}

// ✅ cookiePath parameter added
function downloadVideoFile(url, cookiePath = null) {
  return new Promise((resolve, reject) => {
    if (!isAllowedUrl(url)) {
      return reject(new Error('URL is not an allowed Instagram URL'));
    }

    const cleanUrl = cleanInstagramUrl(url);
    const resolvedCookiePath = resolveCookiePath(cookiePath); // ✅ centralised + safe

    // ✅ Unique prefix so we can find the file after download
    const uid = randomBytes(6).toString('hex');
    const tmpDir = os.tmpdir();
    const tmpPrefix = `saveinsta_${uid}`;
    const tmpPath = path.join(tmpDir, `${tmpPrefix}.%(ext)s`);

    const args = [
      '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '--yes-playlist',
      '--ignore-errors',
      '--no-part',
      '--no-continue',
      '-o', tmpPath,
    ];

    // ✅ Only add cookies if file exists
    if (resolvedCookiePath) {
      args.push('--cookies', resolvedCookiePath);
    }

    args.push(cleanUrl);

    execFile('yt-dlp', args, { timeout: 5 * 60 * 1000 }, (error, stdout, stderr) => {
      console.log('=== yt-dlp EXIT ===', error ? 'ERROR' : 'OK');
      console.log('=== STDOUT ===\n', stdout);
      console.log('=== STDERR ===\n', stderr);

      if (error && !stdout) {
        // ✅ Clean up partial files on failure
        try {
          fs.readdirSync(tmpDir)
            .filter(f => f.startsWith(tmpPrefix))
            .forEach(f => fs.unlinkSync(path.join(tmpDir, f)));
        } catch {}

        const friendly = parseError(stderr);
        return reject(new Error(friendly || error.message));
      }

      // ✅ Find file by scanning temp dir — more reliable than regex parsing
      let resolvedPath = null;
      try {
        const files = fs.readdirSync(tmpDir)
          .filter(f => f.startsWith(tmpPrefix))
          .map(f => path.join(tmpDir, f));

        if (files.length > 0) {
          // Pick largest file — that's the merged video, not a leftover fragment
          resolvedPath = files.sort((a, b) =>
            fs.statSync(b).size - fs.statSync(a).size
          )[0];
        }
      } catch (e) {
        console.error('Error scanning temp dir:', e.message);
      }

      // ✅ Fallback to stdout parsing if file scan found nothing
      if (!resolvedPath) {
        const mergeMatch = stdout.match(/\[Merger\] Merging formats into "(.+)"/);
        const destMatch = stdout.match(/\[download\] Destination: (.+)/);
        resolvedPath = mergeMatch?.[1]?.trim() ?? destMatch?.[1]?.trim() ?? null;
      }

      if (!resolvedPath) {
        console.error('Could not find output file.\nSTDOUT:', stdout, '\nSTDERR:', stderr);
        return reject(new Error('Could not determine output filename from yt-dlp'));
      }

      // ✅ Reject suspiciously small files — likely an error page not a video
      try {
        const stats = fs.statSync(resolvedPath);
        if (stats.size < 10000) {
          fs.unlinkSync(resolvedPath);
          return reject(new Error(
            `Downloaded file too small (${stats.size} bytes) — likely expired cookies`
          ));
        }
      } catch {
        return reject(new Error(`Output file not found at: ${resolvedPath}`));
      }

      resolve({
        filePath: resolvedPath,
        filename: path.basename(resolvedPath),
      });
    });
  });
}

module.exports = {
  getVideoInfo,
  downloadVideoFile,
  isAllowedUrl,
  cleanInstagramUrl,
};