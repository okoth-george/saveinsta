const express = require("express");
const router = express.Router();
const { isAllowedUrl } = require('../services/downloaderService'); // ✅ shared, fixed version

router.get("/file", async (req, res) => {
  const url = req.query.url;
  const shouldDownload = req.query.download === "1" || req.query.download === "true";

  if (!url) {
    return res.status(400).json({ error: "Missing url query parameter" });
  }

  if (!isAllowedUrl(decodeURIComponent(url))) {
    return res.status(400).json({ error: "URL is not allowed" });
  }

  // ✅ Abort fetch after 30s
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(decodeURIComponent(url), {
      redirect: 'manual', // ✅ don't blindly follow redirects
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36",
      },
    });
    clearTimeout(timer);

    // ✅ Validate redirect destination before following
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location || !isAllowedUrl(location)) {
        return res.status(403).json({ error: 'Redirect to disallowed URL blocked' });
      }
      return res.redirect(302, location);
    }

    if (!response.ok) {
      return res.status(502).json({ error: "Failed to fetch remote media" });
    }

    // ✅ Only forward safe, explicit headers
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    if (contentType) res.setHeader("Content-Type", contentType);
    if (contentLength) res.setHeader("Content-Length", contentLength);

    if (shouldDownload) {
      const filename = req.query.filename || "instagram_media";
      // ✅ RFC 5987 encoding
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
    }

    // ✅ Handle stream errors
    response.body.pipe(res);
    response.body.on('error', (err) => {
      console.error('Proxy stream error:', err);
      if (!res.headersSent) res.status(502).json({ error: 'Stream interrupted' });
    });

  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'Upstream request timed out' });
    }
    console.error('Media proxy error:', err);
    res.status(500).json({ error: "Error proxying media" });
  }
});

module.exports = router;