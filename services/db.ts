
import { DB_NAME, DB_VERSION, AGENTS_STORE, CHAT_MESSAGES_STORE, SETTINGS_STORE, MISSIONS_STORE } from '../constants';

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (event.oldVersion < 1) {
          if (!dbInstance.objectStoreNames.contains(AGENTS_STORE)) {
            dbInstance.createObjectStore(AGENTS_STORE, { keyPath: 'id' });
          }
          if (!dbInstance.objectStoreNames.contains(SETTINGS_STORE)) {
            dbInstance.createObjectStore(SETTINGS_STORE, { keyPath: 'name' });
          }
          if (!dbInstance.objectStoreNames.contains(CHAT_MESSAGES_STORE)) {
            const chatStore = dbInstance.createObjectStore(CHAT_MESSAGES_STORE, { keyPath: 'id', autoIncrement: true });
            chatStore.createIndex('missionId_idx', 'missionId', { unique: false });
          }
      }
      if (event.oldVersion < 2) {
          if (!dbInstance.objectStoreNames.contains(MISSIONS_STORE)) {
            dbInstance.createObjectStore(MISSIONS_STORE, { keyPath: 'id' });
          }
          const transaction = (event.target as IDBOpenDBRequest).transaction;
          if (transaction) {
            const chatStore = transaction.objectStore(CHAT_MESSAGES_STORE);
            if (!chatStore.indexNames.contains('missionId_idx')) {
                chatStore.createIndex('missionId_idx', 'missionId', { unique: false });
            }
          }
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const getData = async <T,>(storeName: string, key: IDBValidKey): Promise<T | undefined> => {
  const dbInstance = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result as T);
    };

    request.onerror = (event) => {
      console.error(`Error getting data from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const getAllData = async <T,>(storeName: string): Promise<T[]> => {
  const dbInstance = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = (event) => {
      console.error(`Error getting all data from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const getDataByIndex = async <T,>(storeName: string, indexName: string, query: IDBValidKey): Promise<T[]> => {
  const dbInstance = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(query);

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = (event) => {
      console.error(`Error getting data by index from ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const putData = async (storeName: string, data: any): Promise<IDBValidKey> => {
  const dbInstance = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = dbInstance.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error(`Error putting data into ${storeName}:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
};

export const clearStore = async (storeName: string): Promise<void> => {
    const dbInstance = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = dbInstance.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error(`Error clearing store ${storeName}:`, (event.target as IDBRequest).error);
            reject((event.target as IDBRequest).error);
        };
    });
};
