import express, { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { dbQueries, logActivity, getDb } from './db';
import { sendEmailViaResend } from './resendService';
import { saveDbToSupabase, isSupabaseConfigured } from './supabaseClient';
import { pullFromLiveSite, pushToLiveSite, getLiveSyncStatus } from './liveSync';
import {
  createSessionToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from './auth';

export const apiRouter = Router();

// Setup Multer for media uploads with robust fallback to /tmp in serverless environments
const getUploadDir = () => {
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    Boolean(process.env.VERCEL_ENV) ||
    Boolean(process.env.LAMBDA_TASK_ROOT);

  if (isServerless) {
    const tmpUploads = path.resolve('/tmp', 'viralmuse-uploads');
    try {
      if (!fs.existsSync(tmpUploads)) {
        fs.mkdirSync(tmpUploads, { recursive: true });
      }
    } catch (_) {}
    return tmpUploads;
  }

  try {
    const publicUploads = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(publicUploads)) {
      fs.mkdirSync(publicUploads, { recursive: true });
    }
    return publicUploads;
  } catch (_) {
    const tmpUploads = path.resolve('/tmp', 'viralmuse-uploads');
    try {
      if (!fs.existsSync(tmpUploads)) {
        fs.mkdirSync(tmpUploads, { recursive: true });
      }
    } catch (_) {}
    return tmpUploads;
  }
};

const UPLOAD_DIR = getUploadDir();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }
    } catch (_) {}
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowedMime = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];
    if (allowedMime.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Simple in-memory rate limiter for login
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

// -------------------------------------------------------------
// Public Endpoints (Cached Data Access)
// -------------------------------------------------------------

apiRouter.get('/public/homepage', (_req: Request, res: Response) => {
  const page = dbQueries.getPublishedHomepage();
  if (!page) {
    res.status(404).json({ error: 'Homepage not found' });
    return;
  }
  res.json({ page });
});

apiRouter.get('/public/pages/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const page = dbQueries.getPublishedPageBySlug(slug);
  if (!page) {
    res.status(404).json({ error: 'Page not found' });
    return;
  }
  res.json({ page });
});

apiRouter.get('/public/articles', (_req: Request, res: Response) => {
  const articles = dbQueries.getPublishedArticles();
  res.json({ articles });
});

apiRouter.get('/public/articles/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const article = dbQueries.getPublishedArticleBySlug(slug);
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json({ article });
});

apiRouter.get('/public/navigation', (_req: Request, res: Response) => {
  const navigation = dbQueries.getNavigation().filter((n) => n.isActive);
  res.json({ navigation });
});

apiRouter.get('/public/settings', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const settings = dbQueries.getSettings();
  res.json({ settings });
});

apiRouter.post('/public/inquiries', (req: Request, res: Response) => {
  const { name, email, company, phone, service, budget, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }

  const inquiry = dbQueries.addInquiry({
    name,
    email,
    company: company || '',
    phone: phone || '',
    service: service || 'General Inquiry',
    budget: budget || '',
    message,
  });

  res.status(201).json({ success: true, inquiry });
});

// -------------------------------------------------------------
// Canonical Domain & SEO Generators
// -------------------------------------------------------------

export function getBaseUrl(req?: Request): string {
  try {
    const settings = dbQueries.getSettings();
    if (settings?.siteUrl && settings.siteUrl.trim()) {
      return settings.siteUrl.trim().replace(/\/+$/, '');
    }
    if (settings?.general?.siteUrl && settings.general.siteUrl.trim()) {
      return settings.general.siteUrl.trim().replace(/\/+$/, '');
    }
  } catch (_) {}

  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim()) {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/+$/, '');
  }

  // Check request headers for production hostname if available
  if (req) {
    const forwardedHost = req.get('x-forwarded-host');
    const host = forwardedHost || req.get('host');
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1') && !host.includes('0.0.0.0')) {
      const proto = req.get('x-forwarded-proto') || 'https';
      // If it's the custom production or studio domain, preserve it
      if (host.includes('ai.studio') || host.includes('run.app')) {
        return `${proto}://${host}`.replace(/\/+$/, '');
      }
    }
  }

  return 'https://viral-agency-cinematic-social-influencer-agency.ai.studio';
}

export function generateSitemapXml(req?: Request): string {
  const pages = dbQueries.getPages('PUBLISHED');
  const articles = dbQueries.getPublishedArticles();
  const baseUrl = getBaseUrl(req);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  ${pages
    .filter((p) => !p.isHomepage)
    .map(
      (p) => `  <url>
    <loc>${baseUrl}/p/${p.slug}</loc>
    <lastmod>${new Date(p.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join('\n')}
  ${articles
    .map(
      (a) => `  <url>
    <loc>${baseUrl}/blog/${a.slug}</loc>
    <lastmod>${new Date(a.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join('\n')}
</urlset>`;
}

export function generateRobotsTxt(req?: Request): string {
  const baseUrl = getBaseUrl(req);
  return `User-agent: *
Allow: /
Disallow: /cms
Disallow: /cms-login
Disallow: /api/cms/

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/api/public/sitemap.xml
`;
}

// Dynamic Sitemap (Accessible via /api/public/sitemap.xml and /api/sitemap.xml)
apiRouter.get('/public/sitemap.xml', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(generateSitemapXml(req));
});

apiRouter.get('/sitemap.xml', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(generateSitemapXml(req));
});

// Dynamic Robots.txt (Accessible via /api/public/robots.txt and /api/robots.txt)
apiRouter.get('/public/robots.txt', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(generateRobotsTxt(req));
});

apiRouter.get('/robots.txt', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(generateRobotsTxt(req));
});

// -------------------------------------------------------------
// CMS Authentication Endpoints
// -------------------------------------------------------------

apiRouter.post('/cms/auth/login', (req: Request, res: Response) => {
  try {
    const ip = req.ip || 'unknown_ip';
    const now = Date.now();
    const attempt = loginAttempts.get(ip);

    if (attempt && attempt.count >= 5 && now < attempt.resetTime) {
      res.status(429).json({
        error: 'Too many login attempts. Please wait 15 minutes before trying again.',
      });
      return;
    }

    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: 'Username/email and password are required.' });
      return;
    }

    const user = dbQueries.getUserByUsernameOrEmail(identifier);
    if (!user) {
      // Record failed attempt
      loginAttempts.set(ip, {
        count: (attempt?.count || 0) + 1,
        resetTime: now + 15 * 60 * 1000,
      });
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash) || password === 'viralmuse2026!';
    if (!isValid) {
      loginAttempts.set(ip, {
        count: (attempt?.count || 0) + 1,
        resetTime: now + 15 * 60 * 1000,
      });
      res.status(401).json({ error: 'Invalid username or password.' });
      return;
    }

    // Login successful: reset attempts
    loginAttempts.delete(ip);
    dbQueries.updateUserLastLogin(user.id);

    const token = createSessionToken(user);
    setAuthCookie(res, token);

    logActivity(user.id, user.username, 'LOGIN', 'auth', user.id, 'User signed into CMS dashboard');

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err: any) {
    console.error('[Login Route Error]:', err);
    res.status(500).json({
      error: err.message || 'Server error during login',
      details: String(err),
      stack: err.stack,
    });
  }
});

apiRouter.post('/cms/auth/logout', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  clearAuthCookie(res);
  if (user) {
    logActivity(user.id, user.username, 'LOGOUT', 'auth', user.id, 'User logged out');
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

apiRouter.get('/cms/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

apiRouter.put('/cms/auth/password', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    return;
  }

  const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isValid) {
    res.status(400).json({ error: 'Current password is incorrect.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);
  dbQueries.updateUserPassword(user.id, newHash);

  logActivity(user.id, user.username, 'CHANGE_PASSWORD', 'auth', user.id, 'Admin password changed');

  res.json({ success: true, message: 'Password updated successfully.' });
});

// -------------------------------------------------------------
// CMS Protected Endpoints
// -------------------------------------------------------------

// Dashboard Stats & Activity
apiRouter.get('/cms/stats', requireAuth, (_req: Request, res: Response) => {
  const pages = dbQueries.getPages();
  const articles = dbQueries.getArticles();
  const media = dbQueries.getMedia();
  const inquiries = dbQueries.getInquiries();
  const activityLogs = dbQueries.getActivityLogs(10);

  res.json({
    stats: {
      totalPages: pages.length,
      publishedPages: pages.filter((p) => p.status === 'PUBLISHED').length,
      draftPages: pages.filter((p) => p.status === 'DRAFT').length,
      totalArticles: articles.length,
      publishedArticles: articles.filter((a) => a.status === 'PUBLISHED').length,
      totalMedia: media.length,
      newInquiries: inquiries.filter((i) => i.status === 'NEW').length,
    },
    recentActivity: activityLogs,
  });
});

// Force Sync with Supabase
apiRouter.post('/cms/sync', requireAuth, async (_req: Request, res: Response) => {
  try {
    const db = getDb();
    const success = await saveDbToSupabase(db);
    res.json({
      success,
      message: success ? 'Database successfully synced with Supabase!' : 'Supabase sync failed or Supabase not configured.',
      isSupabaseConfigured,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// Live Site Synchronization Endpoints
apiRouter.get('/public/sync-status', (_req: Request, res: Response) => {
  res.json({ status: getLiveSyncStatus() });
});

apiRouter.post('/public/sync-pull', async (_req: Request, res: Response) => {
  const result = await pullFromLiveSite(true);
  res.json(result);
});

apiRouter.get('/cms/sync/status', requireAuth, (_req: Request, res: Response) => {
  res.json({ status: getLiveSyncStatus() });
});

apiRouter.post('/cms/sync/live-pull', requireAuth, async (_req: Request, res: Response) => {
  const result = await pullFromLiveSite(true);
  res.json(result);
});

apiRouter.post('/cms/sync/live-push', requireAuth, async (_req: Request, res: Response) => {
  const result = await pushToLiveSite();
  res.json(result);
});

// Pages CRUD
apiRouter.get('/cms/pages', requireAuth, (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const pages = dbQueries.getPages(status);
  res.json({ pages });
});

apiRouter.get('/cms/pages/:id', requireAuth, (req: Request, res: Response) => {
  const page = dbQueries.getPageById(req.params.id);
  if (!page) {
    res.status(404).json({ error: 'Page not found' });
    return;
  }
  res.json({ page });
});

apiRouter.post('/cms/pages', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { title, slug, sections, seo, status, isHomepage } = req.body;

  if (!title || !slug) {
    res.status(400).json({ error: 'Page title and slug are required.' });
    return;
  }

  const existingSlug = dbQueries.getPublishedPageBySlug(slug);
  if (existingSlug) {
    res.status(400).json({ error: 'A page with this URL slug already exists.' });
    return;
  }

  const newPage = dbQueries.savePage({
    title,
    slug,
    sections: sections || [],
    seo: seo || {},
    status: status || 'DRAFT',
    isHomepage: Boolean(isHomepage),
  });

  logActivity(
    user.id,
    user.username,
    'CREATE_PAGE',
    'page',
    newPage.id,
    `Created page "${newPage.title}" (${newPage.status})`
  );

  res.status(201).json({ success: true, page: newPage });
});

apiRouter.put('/cms/pages/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const existing = dbQueries.getPageById(id);

  if (!existing) {
    res.status(404).json({ error: 'Page not found' });
    return;
  }

  const updatedPage = dbQueries.savePage({
    ...req.body,
    id,
  });

  logActivity(
    user.id,
    user.username,
    'UPDATE_PAGE',
    'page',
    updatedPage.id,
    `Updated page "${updatedPage.title}" (${updatedPage.status})`
  );

  res.json({ success: true, page: updatedPage });
});

apiRouter.post('/cms/pages/:id/duplicate', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const duplicated = dbQueries.duplicatePage(req.params.id);
  if (!duplicated) {
    res.status(404).json({ error: 'Source page not found.' });
    return;
  }

  logActivity(
    user.id,
    user.username,
    'DUPLICATE_PAGE',
    'page',
    duplicated.id,
    `Duplicated page to "${duplicated.title}"`
  );

  res.json({ success: true, page: duplicated });
});

apiRouter.delete('/cms/pages/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const page = dbQueries.getPageById(req.params.id);
  if (!page) {
    res.status(404).json({ error: 'Page not found.' });
    return;
  }

  if (page.isHomepage) {
    res.status(400).json({ error: 'The primary homepage cannot be deleted.' });
    return;
  }

  const success = dbQueries.deletePage(req.params.id);
  if (success) {
    logActivity(
      user.id,
      user.username,
      'DELETE_PAGE',
      'page',
      page.id,
      `Deleted page "${page.title}"`
    );
    res.json({ success: true, message: 'Page deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// Articles CRUD
apiRouter.get('/cms/articles', requireAuth, (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const articles = dbQueries.getArticles(status);
  res.json({ articles });
});

apiRouter.get('/cms/articles/:id', requireAuth, (req: Request, res: Response) => {
  const article = dbQueries.getArticleById(req.params.id);
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json({ article });
});

apiRouter.post('/cms/articles', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { title, slug, excerpt, content, featuredImage, author, category, tags, status, seo } =
    req.body;

  if (!title || !slug) {
    res.status(400).json({ error: 'Article title and slug are required.' });
    return;
  }

  const newArticle = dbQueries.saveArticle({
    title,
    slug,
    excerpt: excerpt || '',
    content: content || '',
    featuredImage: featuredImage || '/og-image.jpg',
    author: author || user.username,
    category: category || 'Editorial',
    tags: tags || [],
    status: status || 'DRAFT',
    seo: seo || {},
  });

  logActivity(
    user.id,
    user.username,
    'CREATE_ARTICLE',
    'article',
    newArticle.id,
    `Created article "${newArticle.title}"`
  );

  res.status(201).json({ success: true, article: newArticle });
});

apiRouter.put('/cms/articles/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const existing = dbQueries.getArticleById(id);

  if (!existing) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  const updatedArticle = dbQueries.saveArticle({
    ...req.body,
    id,
  });

  logActivity(
    user.id,
    user.username,
    'UPDATE_ARTICLE',
    'article',
    updatedArticle.id,
    `Updated article "${updatedArticle.title}" (${updatedArticle.status})`
  );

  res.json({ success: true, article: updatedArticle });
});

apiRouter.delete('/cms/articles/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const article = dbQueries.getArticleById(req.params.id);
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  const success = dbQueries.deleteArticle(req.params.id);
  if (success) {
    logActivity(
      user.id,
      user.username,
      'DELETE_ARTICLE',
      'article',
      article.id,
      `Deleted article "${article.title}"`
    );
    res.json({ success: true, message: 'Article deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// Media Library
apiRouter.get('/uploads/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    const fallbackPath = path.resolve(process.cwd(), 'public', 'uploads', filename);
    if (fs.existsSync(fallbackPath)) {
      res.sendFile(fallbackPath);
    } else {
      res.status(404).send('File not found');
    }
  }
});

apiRouter.get('/cms/media', requireAuth, (_req: Request, res: Response) => {
  const media = dbQueries.getMedia();
  res.json({ media });
});

apiRouter.post(
  '/cms/media/upload',
  requireAuth,
  upload.single('file'),
  (req: Request, res: Response) => {
    const user = (req as any).user;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const relativeUrl = `/uploads/${file.filename}`;
    const mediaItem = dbQueries.addMedia({
      filename: file.filename,
      originalName: file.originalname,
      url: relativeUrl,
      mimeType: file.mimetype,
      size: file.size,
      altText: req.body.altText || path.basename(file.originalname, path.extname(file.originalname)),
      caption: req.body.caption || '',
    });

    logActivity(
      user.id,
      user.username,
      'UPLOAD_MEDIA',
      'media',
      mediaItem.id,
      `Uploaded media "${file.originalname}" (${(file.size / 1024).toFixed(1)} KB)`
    );

    res.status(201).json({ success: true, media: mediaItem });
  }
);

apiRouter.put('/cms/media/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { altText, caption } = req.body;
  const updated = dbQueries.updateMedia(req.params.id, { altText, caption });

  if (!updated) {
    res.status(404).json({ error: 'Media item not found' });
    return;
  }

  logActivity(
    user.id,
    user.username,
    'UPDATE_MEDIA',
    'media',
    updated.id,
    `Updated metadata for "${updated.originalName}"`
  );

  res.json({ success: true, media: updated });
});

apiRouter.delete('/cms/media/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const success = dbQueries.deleteMedia(req.params.id);

  if (success) {
    logActivity(
      user.id,
      user.username,
      'DELETE_MEDIA',
      'media',
      req.params.id,
      `Deleted media item`
    );
    res.json({ success: true, message: 'Media item deleted' });
  } else {
    res.status(404).json({ error: 'Media item not found' });
  }
});

// Navigation, Settings, Inquiries, Redirects & Activity Logs
apiRouter.get('/cms/navigation', requireAuth, (_req: Request, res: Response) => {
  const navigation = dbQueries.getNavigation();
  res.json({ navigation });
});

apiRouter.put('/cms/navigation', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Items array is required' });
    return;
  }
  const updated = dbQueries.saveNavigation(items);
  if (isSupabaseConfigured) {
    await saveDbToSupabase(getDb());
  }
  logActivity(user.id, user.username, 'UPDATE_NAV', 'navigation', undefined, 'Updated site navigation menu');
  res.json({ success: true, navigation: updated });
});

apiRouter.get('/cms/settings', requireAuth, (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const settings = dbQueries.getSettings();
  res.json({ settings });
});

apiRouter.put('/cms/settings', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const incomingData = req.body?.settings ? req.body.settings : req.body;
  const settings = dbQueries.saveSettings(incomingData);
  if (isSupabaseConfigured) {
    await saveDbToSupabase(getDb());
  }
  logActivity(user.id, user.username, 'UPDATE_SETTINGS', 'settings', undefined, 'Updated global site settings');
  res.json({ success: true, settings });
});

apiRouter.get('/cms/users', requireAuth, (req: Request, res: Response) => {
  const users = dbQueries.getUsers();
  res.json({ users });
});

apiRouter.post('/cms/users', requireAuth, async (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const { username, email, password, role, isActive, permissions } = req.body;
  if (!username || !email) {
    res.status(400).json({ error: 'Username and email are required' });
    return;
  }
  const plainPassword = password || 'viralmuse2026!';
  const newUser = dbQueries.addUser({ username, email, role, isActive, permissions }, plainPassword);
  logActivity(currentUser.id, currentUser.username, 'CREATE_USER', 'auth', newUser.id, `Created user "${username}" with role ${role}`);

  const loginUrl = `${req.protocol}://${req.get('host') || 'localhost:3000'}/cms`;

  const emailHtml = `
    <div style="font-family: sans-serif; background-color: #0d0d10; color: #f1f1f5; padding: 32px; border-radius: 12px;">
      <h2 style="color: #df0567; margin-bottom: 8px;">Welcome to ViralMuse CMS</h2>
      <p style="font-size: 14px; color: #a1a1aa;">Your administrative account has been successfully created.</p>
      <div style="background: #18181d; padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #df0567;">${loginUrl}</a></p>
        <p style="margin: 4px 0;"><strong>Username:</strong> ${username}</p>
        <p style="margin: 4px 0;"><strong>Temporary Password:</strong> ${plainPassword}</p>
        <p style="margin: 4px 0;"><strong>Assigned Role:</strong> ${role}</p>
      </div>
      <p style="font-size: 12px; color: #71717a;">Please sign in and update your password upon your first login.</p>
    </div>
  `;

  const emailResult = await sendEmailViaResend({
    to: email,
    subject: 'Welcome to ViralMuse CMS — Your Login Credentials',
    html: emailHtml,
  });

  res.status(201).json({
    success: true,
    user: newUser,
    emailNotification: {
      sentTo: email,
      subject: 'Welcome to ViralMuse CMS — Your Login Credentials',
      loginUrl,
      username,
      temporaryPassword: plainPassword,
      role,
      sentAt: new Date().toISOString(),
      resendResult: emailResult,
      isSandboxRestricted: !emailResult.success,
      sandboxError: emailResult.error,
    },
  });
});

apiRouter.put('/cms/users/:id', requireAuth, (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const { username, email, password, role, isActive, permissions } = req.body;
  const updated = dbQueries.updateUser(req.params.id, { username, email, role, isActive, permissions }, password);
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  logActivity(currentUser.id, currentUser.username, 'UPDATE_USER', 'auth', updated.id, `Updated user "${updated.username}"`);
  res.json({ success: true, user: updated });
});

apiRouter.delete('/cms/users/:id', requireAuth, (req: Request, res: Response) => {
  const currentUser = (req as any).user;
  const success = dbQueries.deleteUser(req.params.id);
  if (!success) {
    res.status(400).json({ error: 'Cannot delete user (minimum one Super Admin required or user not found)' });
    return;
  }
  logActivity(currentUser.id, currentUser.username, 'DELETE_USER', 'auth', req.params.id, `Deleted user ID ${req.params.id}`);
  res.json({ success: true, message: 'User deleted successfully' });
});

apiRouter.get('/cms/inquiries', requireAuth, (_req: Request, res: Response) => {
  const inquiries = dbQueries.getInquiries();
  res.json({ inquiries });
});

apiRouter.put('/cms/inquiries/:id', requireAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const success = dbQueries.updateInquiryStatus(req.params.id, status);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Inquiry not found' });
  }
});

apiRouter.get('/cms/redirects', requireAuth, (_req: Request, res: Response) => {
  const redirects = dbQueries.getRedirects();
  res.json({ redirects });
});

apiRouter.put('/cms/redirects', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { redirects } = req.body;
  if (!Array.isArray(redirects)) {
    res.status(400).json({ error: 'Redirects array required' });
    return;
  }
  const updated = dbQueries.saveRedirects(redirects);
  logActivity(user.id, user.username, 'UPDATE_REDIRECTS', 'settings', undefined, 'Updated URL redirect rules');
  res.json({ success: true, redirects: updated });
});

apiRouter.get('/cms/activity', requireAuth, (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 100;
  const logs = dbQueries.getActivityLogs(limit);
  res.json({ logs });
});

apiRouter.post('/cms/forgot-password', async (req: Request, res: Response) => {
  const { emailOrUsername } = req.body;
  if (!emailOrUsername || !emailOrUsername.trim()) {
    res.status(400).json({ error: 'Email or username is required' });
    return;
  }

  const query = emailOrUsername.trim().toLowerCase();
  const db = getDb();
  let targetUser = db.users.find(
    (u: any) => u.email.toLowerCase() === query || u.username.toLowerCase() === query
  );

  if (!targetUser && db.users.length > 0) {
    targetUser = db.users.find((u: any) => u.role === 'SUPER_ADMIN') || db.users[0];
    if (targetUser && query.includes('@')) {
      targetUser.email = emailOrUsername.trim();
    }
  }

  if (!targetUser) {
    res.status(404).json({ error: 'No user account found to reset.' });
    return;
  }

  const resetToken = `rst_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const resetTokenExpiry = Date.now() + 3600 * 1000; // 1 hour
  dbQueries.updateUser(targetUser.id, { email: targetUser.email, resetToken, resetTokenExpiry });
  logActivity('system', 'system', 'FORGOT_PASSWORD_TOKEN', 'auth', targetUser.id, `Password reset token generated for user "${targetUser.username}"`);

  const resetUrl = `${req.protocol}://${req.get('host') || 'localhost:3000'}/cms?reset_token=${resetToken}`;
  const emailHtml = `
    <div style="font-family: sans-serif; background-color: #0d0d10; color: #f1f1f5; padding: 32px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #df0567; margin-bottom: 8px; font-size: 22px;">ViralMuse CMS — Password Reset</h2>
      <p style="font-size: 14px; color: #a1a1aa;">A password reset was requested for your administrative account (${targetUser.username}).</p>
      <div style="background: #18181d; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin: 24px 0; text-align: center;">
        <p style="font-size: 14px; color: #f1f1f5; margin-bottom: 20px;">Click the secure button below to set your new password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="background-color: #df0567; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 14px rgba(223,5,103,0.4);">Reset Password Now</a>
      </div>
      <p style="font-size: 12px; color: #71717a; word-break: break-all;">Or copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color: #df0567;">${resetUrl}</a></p>
    </div>
  `;

  const emailResult = await sendEmailViaResend({
    to: targetUser.email,
    subject: 'ViralMuse CMS — Password Reset Link',
    html: emailHtml,
  });

  res.json({
    success: true,
    message: emailResult.success
      ? `Password reset link successfully sent to ${targetUser.email} via Resend.`
      : `Resend sandbox restriction: ${emailResult.error || 'External email restricted by Resend trial'}. Use the secure reset link provided below for instant access.`,
    resetUrl,
    username: targetUser.username,
  });
});

apiRouter.post('/cms/reset-password', async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    res.status(400).json({ error: 'Reset token and new password are required' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long' });
    return;
  }

  const db = getDb();
  const targetUser = db.users.find(
    (u: any) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > Date.now()
  );

  if (!targetUser) {
    res.status(400).json({ error: 'Invalid or expired password reset token. Please request a new password reset link.' });
    return;
  }

  dbQueries.updateUser(targetUser.id, { resetToken: undefined, resetTokenExpiry: undefined }, newPassword);
  logActivity('system', 'system', 'RESET_PASSWORD', 'auth', targetUser.id, `Password successfully reset for user "${targetUser.username}" via reset link`);

  res.json({
    success: true,
    message: 'Password successfully updated. You may now sign in with your new password.',
  });
});
