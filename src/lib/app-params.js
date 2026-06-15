// App params — no longer depends on base44
// Kept for backward compatibility if any code references it
export const appParams = {
  appId: 'kanie-store-local',
  token: null,
  fromUrl: typeof window !== 'undefined' ? window.location.href : '',
  functionsVersion: 'local',
  appBaseUrl: typeof window !== 'undefined' ? window.location.origin : '',
};
