const fs = require('fs');
const multer = require('multer');
const {
  getVideoInfo,
  downloadVideoFile,
  isAllowedUrl,
  cleanInstagramUrl,
} = require('../services/downloaderService');

const upload = multer({
  dest: '/tmp/user-cookies/',
  limits: { fileSize: 500 * 1024 },
});

// POST /api/download
const downloadVideo = [

  // ✅ Multer middleware with clean error handling
  (req, res, next) => {
    upload.single('cookies')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'Cookies file is too large. Maximum size is 500KB.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            error: 'Unexpected file field. Only "cookies" is accepted.'
          });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      next();
    });
  },

  async (req, res) => {
    const uploadedCookiePath = req.file?.path || null;

    // ✅ Single cleanup helper — used everywhere, safe to call multiple times
    const cleanupCookie = () => {
      if (uploadedCookiePath) {
        try { fs.unlinkSync(uploadedCookiePath); } catch {}
      }
    };

    // ✅ Validate uploaded cookies file is a real Netscape format
    if (uploadedCookiePath) {
      try {
        const firstLine = fs.readFileSync(uploadedCookiePath, 'utf8').split('\n')[0];
        if (!firstLine.includes('Netscape HTTP Cookie File') && !firstLine.startsWith('#')) {
          cleanupCookie(); // ✅ use helper consistently
          return res.status(400).json({
            error: 'Invalid cookies file. Please export a valid Netscape cookies.txt from your browser.'
          });
        }
      } catch {
        cleanupCookie();
        return res.status(400).json({ error: 'Could not read uploaded cookies file.' });
      }
    }

    try {
      const { url } = req.body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid url' });
      }
      if (!isAllowedUrl(url)) {
        return res.status(400).json({ error: 'URL is not an allowed Instagram URL' });
      }

      const cleanedUrl = cleanInstagramUrl(url);
      const cookiePath = uploadedCookiePath || process.env.INSTAGRAM_COOKIE_FILE;
      const data = await getVideoInfo(cleanedUrl, cookiePath);

      const encodedOriginal = encodeURIComponent(cleanedUrl);
      const filename = encodeURIComponent(data.filename || 'instagram_media');

      res.json({
        ...data,
        totalItems: data.totalItems || 1,
        downloadUrl: `/api/download/file?url=${encodedOriginal}&filename=${filename}`,
        previewUrl: data.playable_url
          ? `/api/media/file?url=${encodeURIComponent(data.playable_url)}`
          : null,
      });

    } catch (error) {
      console.error('downloadVideo error:', error.message);
      if (error.message.includes('not an allowed')) return res.status(400).json({ error: error.message });
      if (error.message.includes('private') || error.message.includes('unavailable')) return res.status(403).json({ error: error.message });
      if (error.message.includes('rate limit') || error.message.includes('429')) return res.status(429).json({ error: error.message });
      if (error.message.includes('cookies')) return res.status(401).json({ error: error.message });
      if (error.message.includes('No downloadable video')) return res.status(422).json({ error: error.message });
      res.status(500).json({ error: error.message || 'Download failed' });

    } finally {
      cleanupCookie(); // ✅ only once — handles all cases
    }
  }
];

// GET /api/download/file
const downloadVideoFileHandler = async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) return res.status(400).json({ error: 'Missing url' });

    const decodedUrl = decodeURIComponent(rawUrl);
    if (!isAllowedUrl(decodedUrl)) {
      return res.status(400).json({ error: 'Invalid or disallowed URL' });
    }

    const cleanedUrl = cleanInstagramUrl(decodedUrl);
    const cookiePath = process.env.INSTAGRAM_COOKIE_FILE;
    const { filePath, filename } = await downloadVideoFile(cleanedUrl, cookiePath);

    try {
      const stats = fs.statSync(filePath);
      res.setHeader('Content-Length', stats.size);
    } catch {}

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    const stream = fs.createReadStream(filePath);
    const cleanup = () => {
      try { fs.unlinkSync(filePath); } catch (e) {
        console.warn('Failed to delete temp file:', filePath, e.message);
      }
    };

    stream.pipe(res);
    stream.on('end', cleanup);
    stream.on('error', (err) => {
      cleanup();
      console.error('Stream error:', err.message);
      if (!res.headersSent) res.status(502).json({ error: 'Stream failed' });
    });

  } catch (error) {
    console.error('downloadVideoFileHandler error:', error.message);
    if (error.message.includes('private') || error.message.includes('unavailable')) return res.status(403).json({ error: error.message });
    if (error.message.includes('rate limit') || error.message.includes('429')) return res.status(429).json({ error: error.message });
    if (error.message.includes('cookies')) return res.status(401).json({ error: error.message });
    if (error.message.includes('too small')) return res.status(502).json({ error: error.message });
    res.status(500).json({ error: error.message || 'Download failed' });
  }
};

module.exports = { downloadVideo, downloadVideoFile: downloadVideoFileHandler };