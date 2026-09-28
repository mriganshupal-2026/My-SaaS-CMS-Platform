import fs from 'fs';
import path from 'path';
import type { DatabaseSchema } from './db';
import { getDb, saveDb, reloadDbFromDisk } from './db';

const CANONICAL_LIVE_URL = (
  process.env.LIVE_SITE_URL ||
  'https://viral-agency-cinematic-social-influencer-agency.ai.studio'
).replace(/\/+$/, '');

const ADMIN_IDENTIFIER = process.env.CMS_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.CMS_ADMIN_PASSWORD || 'viralmuse2026!';

interface LiveSyncStatus {
  canonicalUrl: string;
  isLiveInstance: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastMessage: string;
  autoSyncEnabled: boolean;
}

const syncStatus: LiveSyncStatus = {
  canonicalUrl: CANONICAL_LIVE_URL,
  isLiveInstance: false,
  lastSyncAt: null,
  lastSyncStatus: 'idle',
  lastMessage: 'Not synced yet',
  autoSyncEnabled: true,
};

let syncIntervalTimer: NodeJS.Timeout | null = null;
let isCurrentlySyncing = false;

/**
 * Checks if current environment is the production live site
 */
export function isProductionLiveInstance(): boolean {
  const currentAppUrl = (process.env.APP_URL || '').toLowerCase();
  const currentHost = (process.env.HOSTNAME || '').toLowerCase();
  return (
    currentAppUrl.includes('viral-agency-cinematic-social-influencer-agency.ai.studio') ||
    currentHost.includes('viral-agency-cinematic')
  );
}

syncStatus.isLiveInstance = isProductionLiveInstance();

/**
 * Get current sync status
 */
export function getLiveSyncStatus(): LiveSyncStatus {
  return { ...syncStatus };
}

/**
 * Pull latest CMS data from the live canonical site into local database
 */
export async function pullFromLiveSite(force = false): Promise<{
  success: boolean;
  updated: boolean;
  message: string;
}> {
  if (isProductionLiveInstance() && !force) {
    return {
      success: true,
      updated: false,
      message: 'Running on live instance; pull skipped.',
    };
  }

  if (isCurrentlySyncing) {
    return {
      success: false,
      updated: false,
      message: 'Sync already in progress.',
    };
  }

  isCurrentlySyncing = true;
  syncStatus.lastSyncStatus = 'syncing';
  syncStatus.lastMessage = 'Fetching data from live site...';

  try {
    const timeout = 6000;
    const fetchWithTimeout = async (url: string, opts: RequestInit = {}) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, { ...opts, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    // 1. Try authenticated login to live site for full database access
    let liveToken = '';
    try {
      const loginRes = await fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/cms/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: ADMIN_IDENTIFIER, password: ADMIN_PASSWORD }),
      });
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        liveToken = loginData.token || '';
      }
    } catch (err: any) {
      console.warn('[LiveSync] Auth to live site failed, falling back to public endpoints:', err.message);
    }

    const currentDb = getDb();
    let hasChanges = false;

    if (liveToken) {
      // Authenticated pull: pages, articles, media, navigation, settings, inquiries, activity
      const headers = { Authorization: `Bearer ${liveToken}` };

      const [pagesRes, articlesRes, mediaRes, navRes, settingsRes, inqRes, actRes] = await Promise.all([
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/cms/pages`, { headers }).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/cms/articles`, { headers }).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/cms/media`, { headers }).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/cms/navigation`, { headers }).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/cms/settings`, { headers }).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/cms/inquiries`, { headers }).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/cms/activity`, { headers }).then((r) => r.json()).catch(() => null),
      ]);

      if (pagesRes?.pages && Array.isArray(pagesRes.pages) && pagesRes.pages.length > 0) {
        // Check if pages are different
        if (JSON.stringify(currentDb.pages) !== JSON.stringify(pagesRes.pages)) {
          currentDb.pages = pagesRes.pages;
          hasChanges = true;
        }
      }

      if (articlesRes?.articles && Array.isArray(articlesRes.articles) && articlesRes.articles.length > 0) {
        if (JSON.stringify(currentDb.articles) !== JSON.stringify(articlesRes.articles)) {
          currentDb.articles = articlesRes.articles;
          hasChanges = true;
        }
      }

      if (mediaRes?.media && Array.isArray(mediaRes.media) && mediaRes.media.length > 0) {
        if (JSON.stringify(currentDb.media) !== JSON.stringify(mediaRes.media)) {
          currentDb.media = mediaRes.media;
          hasChanges = true;
        }
      }

      if (navRes?.navigation && Array.isArray(navRes.navigation) && navRes.navigation.length > 0) {
        if (JSON.stringify(currentDb.navigation) !== JSON.stringify(navRes.navigation)) {
          currentDb.navigation = navRes.navigation;
          hasChanges = true;
        }
      }

      if (settingsRes?.settings && typeof settingsRes.settings === 'object') {
        if (JSON.stringify(currentDb.settings) !== JSON.stringify(settingsRes.settings)) {
          currentDb.settings = settingsRes.settings;
          hasChanges = true;
        }
      }

      if (inqRes?.inquiries && Array.isArray(inqRes.inquiries)) {
        currentDb.inquiries = inqRes.inquiries;
      }

      if (actRes?.logs && Array.isArray(actRes.logs)) {
        currentDb.activityLogs = actRes.logs;
      }
    } else {
      // Fallback: Public Endpoints
      const [hpRes, artsRes, navRes, settRes] = await Promise.all([
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/public/homepage`).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/public/articles`).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/public/navigation`).then((r) => r.json()).catch(() => null),
        fetchWithTimeout(`${CANONICAL_LIVE_URL}/api/public/settings`).then((r) => r.json()).catch(() => null),
      ]);

      if (hpRes?.page) {
        const hpIdx = currentDb.pages.findIndex((p) => p.isHomepage || p.slug === 'home');
        if (hpIdx >= 0) {
          if (JSON.stringify(currentDb.pages[hpIdx]) !== JSON.stringify(hpRes.page)) {
            currentDb.pages[hpIdx] = hpRes.page;
            hasChanges = true;
          }
        } else {
          currentDb.pages.unshift(hpRes.page);
          hasChanges = true;
        }
      }

      if (artsRes?.articles && Array.isArray(artsRes.articles) && artsRes.articles.length > 0) {
        if (JSON.stringify(currentDb.articles) !== JSON.stringify(artsRes.articles)) {
          currentDb.articles = artsRes.articles;
          hasChanges = true;
        }
      }

      if (navRes?.navigation && Array.isArray(navRes.navigation)) {
        if (JSON.stringify(currentDb.navigation) !== JSON.stringify(navRes.navigation)) {
          currentDb.navigation = navRes.navigation;
          hasChanges = true;
        }
      }

      if (settRes?.settings) {
        if (JSON.stringify(currentDb.settings) !== JSON.stringify(settRes.settings)) {
          currentDb.settings = settRes.settings;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      saveDb(currentDb);
      console.log('[LiveSync] Pulled latest CMS updates from live site into local preview database!');
    }

    syncStatus.lastSyncAt = new Date().toISOString();
    syncStatus.lastSyncStatus = 'success';
    syncStatus.lastMessage = hasChanges
      ? 'Successfully pulled latest live CMS updates!'
      : 'Local database is already in sync with live site.';

    return {
      success: true,
      updated: hasChanges,
      message: syncStatus.lastMessage,
    };
  } catch (err: any) {
    console.warn('[LiveSync Error]:', err.message);
    syncStatus.lastSyncStatus = 'error';
    syncStatus.lastMessage = `Sync failed: ${err.message}`;
    return {
      success: false,
      updated: false,
      message: err.message || 'Sync failed',
    };
  } finally {
    isCurrentlySyncing = false;
  }
}

/**
 * Push local database state to the live site via CMS API
 */
export async function pushToLiveSite(): Promise<{
  success: boolean;
  message: string;
}> {
  if (isProductionLiveInstance()) {
    return { success: true, message: 'Already running on live instance.' };
  }

  try {
    // 1. Authenticate with live site
    const loginRes = await fetch(`${CANONICAL_LIVE_URL}/api/cms/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: ADMIN_IDENTIFIER, password: ADMIN_PASSWORD }),
    });

    if (!loginRes.ok) {
      throw new Error(`Failed to authenticate with live site (status ${loginRes.status})`);
    }

    const { token } = await loginRes.json();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const db = getDb();

    // 2. Push pages
    for (const page of db.pages) {
      try {
        const updateRes = await fetch(`${CANONICAL_LIVE_URL}/api/cms/pages/${encodeURIComponent(page.id)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(page),
        });
        if (!updateRes.ok) {
          // If page not found, create it
          await fetch(`${CANONICAL_LIVE_URL}/api/cms/pages`, {
            method: 'POST',
            headers,
            body: JSON.stringify(page),
          });
        }
      } catch (err) {
        console.warn(`[LiveSync] Failed to push page ${page.id}:`, err);
      }
    }

    // 3. Push articles
    for (const article of db.articles) {
      try {
        const updateRes = await fetch(`${CANONICAL_LIVE_URL}/api/cms/articles/${encodeURIComponent(article.id)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(article),
        });
        if (!updateRes.ok) {
          await fetch(`${CANONICAL_LIVE_URL}/api/cms/articles`, {
            method: 'POST',
            headers,
            body: JSON.stringify(article),
          });
        }
      } catch (err) {
        console.warn(`[LiveSync] Failed to push article ${article.id}:`, err);
      }
    }

    // 4. Push settings & navigation
    if (db.settings) {
      await fetch(`${CANONICAL_LIVE_URL}/api/cms/settings`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ settings: db.settings }),
      }).catch(() => {});
    }

    if (db.navigation && db.navigation.length > 0) {
      await fetch(`${CANONICAL_LIVE_URL}/api/cms/navigation`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ items: db.navigation }),
      }).catch(() => {});
    }

    syncStatus.lastSyncAt = new Date().toISOString();
    syncStatus.lastSyncStatus = 'success';
    syncStatus.lastMessage = 'Successfully pushed all CMS content to live site!';

    return {
      success: true,
      message: 'Successfully pushed all CMS content to live site!',
    };
  } catch (err: any) {
    console.error('[LiveSync Push Error]:', err);
    return {
      success: false,
      message: err.message || 'Push to live site failed',
    };
  }
}

/**
 * Initialize automatic background sync
 */
export function startLiveSyncBackgroundJob(): void {
  if (isProductionLiveInstance()) {
    console.log('[LiveSync] Live production environment detected; background sync job disabled.');
    return;
  }

  // Initial pull on boot (staggered by 1 second to let server establish listeners)
  setTimeout(() => {
    pullFromLiveSite().catch((err) => {
      console.warn('[LiveSync Initial Boot Pull Notice]:', err.message);
    });
  }, 1000);

  // Periodic pull every 30 seconds to catch live CMS edits
  if (!syncIntervalTimer) {
    syncIntervalTimer = setInterval(() => {
      pullFromLiveSite().catch(() => {});
    }, 30000);
  }
}
