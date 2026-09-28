import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { apiRouter, generateSitemapXml, generateRobotsTxt } from './src/server/api';
import { getDb } from './src/server/db';
import { startLiveSyncBackgroundJob } from './src/server/liveSync';

async function createServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  // Initialize DB on boot and start background live sync
  getDb();
  startLiveSyncBackgroundJob();

  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure public uploads directory exists
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Mount static asset directory
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  // Mount API router
  app.use('/api', apiRouter);

  // Root level dynamic SEO endpoints (Sitemap & Robots.txt)
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(generateSitemapXml(req));
  });

  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(generateRobotsTxt(req));
  });

  // Vite middleware in dev or static files in production
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ViralMuse Server] Running at http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('[ViralMuse Server] Startup failed:', err);
  process.exit(1);
});
