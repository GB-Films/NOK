import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence } from "firebase/auth";

export function createNokAuth(app) {
  // Only Firebase's session persists. Browsers that block storage can still sign in.
  return initializeAuth(app, {
    persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence]
  });
}
