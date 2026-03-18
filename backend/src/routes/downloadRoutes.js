const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { downloadVideo, downloadVideoFile } = require("../controllers/downloadController"); // ✅ single import

// ✅ Rate limiter — prevents yt-dlp process spam
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: "Too many requests, please slow down" },
});

// ✅ Body size limit on POST prevents oversized payload attacks
router.post("/", limiter, express.json({ limit: '10kb' }), downloadVideo);
router.get("/file", limiter, downloadVideoFile);

module.exports = router;