export const getPDFFromDB = async (): Promise<ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pdf-imposer-db", 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pdfs")) {
        db.createObjectStore("pdfs");
      }
    };
    request.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pdfs")) {
        resolve(null);
        return;
      }
      const transaction = db.transaction(["pdfs"], "readonly");
      const store = transaction.objectStore("pdfs");
      const getRequest = store.get("currentPdf");
      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };
  });
};

export const savePDFToDB = async (buffer: ArrayBuffer | null): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("pdf-imposer-db", 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pdfs")) {
        db.createObjectStore("pdfs");
      }
    };
    request.onsuccess = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("pdfs")) {
        // If not present, we can't write/delete. Since we want to save, let's just resolve if no buffer, else reject or reopen with version change.
        // But onupgradeneeded should have created it.
      }
      const transaction = db.transaction(["pdfs"], "readwrite");
      const store = transaction.objectStore("pdfs");
      if (buffer) {
        store.put(buffer, "currentPdf");
      } else {
        store.delete("currentPdf");
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
};
