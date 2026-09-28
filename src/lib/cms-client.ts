import type {
  User,
  UserRole,
  UserPermissions,
  Page,
  Article,
  MediaItem,
  NavigationItem,
  SiteSettings,
  ProjectInquiry,
  RedirectRule,
  ActivityLog,
} from '../types/cms';

const TOKEN_KEY = 'viralmuse_cms_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (_) {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (_) {}
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    if (isJson) {
      try {
        const data = await res.json();
        if (data.error) errorMsg = data.error;
      } catch (_) {}
    } else {
      const text = await res.text();
      if (text && text.length < 200) errorMsg = text;
    }
    throw new Error(errorMsg);
  }

  if (!isJson) {
    const text = await res.text();
    // If unexpected HTML returned (e.g. rewrite misconfiguration)
    if (text.trim().startsWith('<')) {
      throw new Error('API server returned HTML instead of JSON. Check serverless configuration.');
    }
    return text as unknown as T;
  }

  return res.json();
}

// -------------------------------------------------------------
// Public Client API
// -------------------------------------------------------------

export const publicApi = {
  async getHomepage(): Promise<Page> {
    const data = await fetchJson<{ page: Page }>(`/api/public/homepage?t=${Date.now()}`);
    return data.page;
  },

  async getPageBySlug(slug: string): Promise<Page> {
    const data = await fetchJson<{ page: Page }>(`/api/public/pages/${encodeURIComponent(slug)}?t=${Date.now()}`);
    return data.page;
  },

  async getArticles(): Promise<Article[]> {
    const data = await fetchJson<{ articles: Article[] }>(`/api/public/articles?t=${Date.now()}`);
    return data.articles;
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const data = await fetchJson<{ article: Article }>(
      `/api/public/articles/${encodeURIComponent(slug)}?t=${Date.now()}`
    );
    return data.article;
  },

  async getNavigation(): Promise<NavigationItem[]> {
    const data = await fetchJson<{ navigation: NavigationItem[] }>(`/api/public/navigation?t=${Date.now()}`);
    return data.navigation;
  },

  async getSettings(): Promise<SiteSettings> {
    const data = await fetchJson<{ settings: SiteSettings }>(`/api/public/settings?t=${Date.now()}`);
    return data.settings;
  },

  async sendInquiry(inquiry: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    service?: string;
    budget?: string;
    message: string;
  }): Promise<{ success: boolean; inquiry: ProjectInquiry }> {
    return fetchJson('/api/public/inquiries', {
      method: 'POST',
      body: JSON.stringify(inquiry),
    });
  },

  async pullSyncFromLive(): Promise<{ success: boolean; updated: boolean; message: string }> {
    return fetchJson('/api/public/sync-pull', { method: 'POST' });
  },

  async getSyncStatus(): Promise<{
    status: {
      canonicalUrl: string;
      isLiveInstance: boolean;
      lastSyncAt: string | null;
      lastSyncStatus: string;
      lastMessage: string;
    };
  }> {
    return fetchJson(`/api/public/sync-status?t=${Date.now()}`);
  },
};

// -------------------------------------------------------------
// CMS Admin Client API
// -------------------------------------------------------------

export const cmsAuthApi = {
  async login(identifier: string, password: string): Promise<{ success: boolean; user: User; token: string }> {
    const data = await fetchJson<{ success: boolean; user: User; token: string }>('/api/cms/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });

    if (data.token) {
      setStoredToken(data.token);
    }

    return data;
  },

  async logout(): Promise<void> {
    try {
      await fetchJson('/api/cms/auth/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
  },

  async getMe(): Promise<User> {
    const data = await fetchJson<{ user: User }>('/api/cms/auth/me');
    return data.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await fetchJson('/api/cms/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  async forgotPassword(emailOrUsername: string): Promise<{ success: boolean; message: string; resetUrl?: string; username?: string }> {
    return fetchJson('/api/cms/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/cms/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },
};

export const cmsPagesApi = {
  async getAll(status?: string): Promise<Page[]> {
    const url = status ? `/api/cms/pages?status=${encodeURIComponent(status)}` : '/api/cms/pages';
    const data = await fetchJson<{ pages: Page[] }>(url);
    return data.pages;
  },

  async getById(id: string): Promise<Page> {
    const data = await fetchJson<{ page: Page }>(`/api/cms/pages/${encodeURIComponent(id)}`);
    return data.page;
  },

  async create(page: Partial<Page>): Promise<Page> {
    const data = await fetchJson<{ page: Page }>('/api/cms/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
    return data.page;
  },

  async update(id: string, page: Partial<Page>): Promise<Page> {
    const data = await fetchJson<{ page: Page }>(`/api/cms/pages/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(page),
    });
    return data.page;
  },

  async duplicate(id: string): Promise<Page> {
    const data = await fetchJson<{ page: Page }>(
      `/api/cms/pages/${encodeURIComponent(id)}/duplicate`,
      { method: 'POST' }
    );
    return data.page;
  },

  async delete(id: string): Promise<void> {
    await fetchJson(`/api/cms/pages/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const cmsArticlesApi = {
  async getAll(status?: string): Promise<Article[]> {
    const url = status ? `/api/cms/articles?status=${encodeURIComponent(status)}` : '/api/cms/articles';
    const data = await fetchJson<{ articles: Article[] }>(url);
    return data.articles;
  },

  async getById(id: string): Promise<Article> {
    const data = await fetchJson<{ article: Article }>(`/api/cms/articles/${encodeURIComponent(id)}`);
    return data.article;
  },

  async create(article: Partial<Article>): Promise<Article> {
    const data = await fetchJson<{ article: Article }>('/api/cms/articles', {
      method: 'POST',
      body: JSON.stringify(article),
    });
    return data.article;
  },

  async update(id: string, article: Partial<Article>): Promise<Article> {
    const data = await fetchJson<{ article: Article }>(
      `/api/cms/articles/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(article),
      }
    );
    return data.article;
  },

  async delete(id: string): Promise<void> {
    await fetchJson(`/api/cms/articles/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const cmsMediaApi = {
  async getAll(): Promise<MediaItem[]> {
    const data = await fetchJson<{ media: MediaItem[] }>('/api/cms/media');
    return data.media;
  },

  async upload(file: File, altText?: string, caption?: string): Promise<MediaItem> {
    const token = getStoredToken();
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    if (caption) formData.append('caption', caption);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/cms/media/upload', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData,
    });

    if (!res.ok) {
      let errorMsg = `Upload failed with status ${res.status}`;
      try {
        const data = await res.json();
        if (data.error) errorMsg = data.error;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    const data = await res.json();
    return data.media;
  },

  async update(id: string, meta: { altText?: string; caption?: string }): Promise<MediaItem> {
    const data = await fetchJson<{ media: MediaItem }>(
      `/api/cms/media/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(meta),
      }
    );
    return data.media;
  },

  async delete(id: string): Promise<void> {
    await fetchJson(`/api/cms/media/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export const cmsNavigationApi = {
  async get(): Promise<NavigationItem[]> {
    const data = await fetchJson<{ navigation: NavigationItem[] }>('/api/cms/navigation');
    return data.navigation;
  },

  async update(items: NavigationItem[]): Promise<NavigationItem[]> {
    const data = await fetchJson<{ navigation: NavigationItem[] }>('/api/cms/navigation', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
    return data.navigation;
  },
};

export const cmsSettingsApi = {
  async get(): Promise<SiteSettings> {
    const data = await fetchJson<{ settings: SiteSettings }>(`/api/cms/settings?t=${Date.now()}`);
    return data.settings;
  },

  async update(settings: SiteSettings): Promise<SiteSettings> {
    const data = await fetchJson<{ settings: SiteSettings }>('/api/cms/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return data.settings;
  },
};

export const cmsUsersApi = {
  async getAll(): Promise<User[]> {
    const data = await fetchJson<{ users: User[] }>('/api/cms/users');
    return data.users;
  },

  async create(user: {
    username: string;
    email: string;
    password?: string;
    role: UserRole;
    isActive: boolean;
    permissions?: UserPermissions;
  }): Promise<{ user: User; emailNotification?: any }> {
    return fetchJson('/api/cms/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async update(
    id: string,
    updates: {
      username?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      isActive?: boolean;
      permissions?: UserPermissions;
    }
  ): Promise<User> {
    const data = await fetchJson<{ user: User }>(`/api/cms/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data.user;
  },

  async delete(id: string): Promise<void> {
    await fetchJson(`/api/cms/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

export const cmsStatsApi = {
  async get(): Promise<{
    stats: {
      totalPages: number;
      publishedPages: number;
      draftPages: number;
      totalArticles: number;
      publishedArticles: number;
      totalMedia: number;
      newInquiries: number;
    };
    recentActivity: ActivityLog[];
  }> {
    return fetchJson('/api/cms/stats');
  },
};

export const cmsInquiriesApi = {
  async getAll(): Promise<ProjectInquiry[]> {
    const data = await fetchJson<{ inquiries: ProjectInquiry[] }>('/api/cms/inquiries');
    return data.inquiries;
  },

  async updateStatus(id: string, status: ProjectInquiry['status']): Promise<void> {
    await fetchJson(`/api/cms/inquiries/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export const cmsRedirectsApi = {
  async get(): Promise<RedirectRule[]> {
    const data = await fetchJson<{ redirects: RedirectRule[] }>('/api/cms/redirects');
    return data.redirects;
  },

  async update(redirects: RedirectRule[]): Promise<RedirectRule[]> {
    const data = await fetchJson<{ redirects: RedirectRule[] }>('/api/cms/redirects', {
      method: 'PUT',
      body: JSON.stringify({ redirects }),
    });
    return data.redirects;
  },
};

export const cmsActivityApi = {
  async getLogs(limit = 100): Promise<ActivityLog[]> {
    const data = await fetchJson<{ logs: ActivityLog[] }>(`/api/cms/activity?limit=${limit}`);
    return data.logs;
  },
};

export const cmsLiveSyncApi = {
  async getStatus(): Promise<{
    status: {
      canonicalUrl: string;
      isLiveInstance: boolean;
      lastSyncAt: string | null;
      lastSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
      lastMessage: string;
      autoSyncEnabled: boolean;
    };
  }> {
    return fetchJson(`/api/cms/sync/status?t=${Date.now()}`);
  },

  async pullFromLive(): Promise<{ success: boolean; updated: boolean; message: string }> {
    return fetchJson('/api/cms/sync/live-pull', { method: 'POST' });
  },

  async pushToLive(): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/cms/sync/live-push', { method: 'POST' });
  },
};
