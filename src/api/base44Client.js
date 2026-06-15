// Local storage-based client that replaces @base44/sdk
// All data is stored in localStorage. Replace with a real backend API later.

const DB_PREFIX = 'kanie_store_';

function getCollection(entityName) {
  const key = `${DB_PREFIX}${entityName}`;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function saveCollection(entityName, data) {
  const key = `${DB_PREFIX}${entityName}`;
  localStorage.setItem(key, JSON.stringify(data));
}

function createEntity(entityName) {
  return {
    list(sortField, limit) {
      let items = getCollection(entityName);
      if (sortField) {
        const desc = sortField.startsWith('-');
        const field = desc ? sortField.slice(1) : sortField;
        items.sort((a, b) => {
          const aVal = a[field] || '';
          const bVal = b[field] || '';
          if (aVal < bVal) return desc ? 1 : -1;
          if (aVal > bVal) return desc ? -1 : 1;
          return 0;
        });
      }
      if (limit) items = items.slice(0, limit);
      return Promise.resolve(items);
    },

    filter(criteria) {
      const items = getCollection(entityName);
      const filtered = items.filter(item => {
        return Object.entries(criteria).every(([key, value]) => item[key] === value);
      });
      return Promise.resolve(filtered);
    },

    create(data) {
      const items = getCollection(entityName);
      const newItem = {
        ...data,
        id: `${entityName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        created_date: new Date().toISOString(),
      };
      items.push(newItem);
      saveCollection(entityName, items);
      return Promise.resolve(newItem);
    },

    update(id, data) {
      const items = getCollection(entityName);
      const index = items.findIndex(item => item.id === id);
      if (index === -1) return Promise.reject(new Error('Item not found'));
      items[index] = { ...items[index], ...data, updated_date: new Date().toISOString() };
      saveCollection(entityName, items);
      return Promise.resolve(items[index]);
    },

    delete(id) {
      let items = getCollection(entityName);
      items = items.filter(item => item.id !== id);
      saveCollection(entityName, items);
      return Promise.resolve({ success: true });
    },
  };
}

// Auth system using localStorage
const AUTH_KEY = `${DB_PREFIX}auth_session`;
const SETTINGS_KEY = `${DB_PREFIX}admin_settings`;

// Default admin settings
const DEFAULT_SETTINGS = {
  password: 'admin123', // Default password — change from settings
  loginEnabled: true,
  appName: 'KANIE STORE',
  subtitle: 'Masukkan password untuk melanjutkan',
  logo: '', // URL or empty for default
};

function getAdminSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  return JSON.parse(raw);
}

function saveAdminSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

const auth = {
  me() {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return Promise.reject(new Error('Not authenticated'));
    return Promise.resolve(JSON.parse(raw));
  },

  logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.hash = '#/login';
    window.location.reload();
  },

  redirectToLogin() {
    window.location.hash = '#/login';
  },

  loginWithPassword(password) {
    const settings = getAdminSettings();
    if (!settings.loginEnabled) {
      // Login disabled — auto-grant access
      const session = { authenticated: true, loginTime: new Date().toISOString() };
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      return Promise.resolve(session);
    }
    if (password === settings.password) {
      const session = { authenticated: true, loginTime: new Date().toISOString() };
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      return Promise.resolve(session);
    }
    return Promise.reject(new Error('Password salah'));
  },

  getSettings() {
    return Promise.resolve(getAdminSettings());
  },

  updateSettings(updates) {
    const current = getAdminSettings();
    const updated = { ...current, ...updates };
    saveAdminSettings(updated);
    return Promise.resolve(updated);
  },
};

// Entity registry
const entities = {
  Device: createEntity('Device'),
  Sale: createEntity('Sale'),
  Customer: createEntity('Customer'),
  Supplier: createEntity('Supplier'),
  ServiceOrder: createEntity('ServiceOrder'),
  Accessory: createEntity('Accessory'),
  CashFlow: createEntity('CashFlow'),
  ActivityLog: createEntity('ActivityLog'),
  Product: createEntity('Product'),
};

export const base44 = {
  auth,
  entities,
};
