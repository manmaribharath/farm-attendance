// IndexedDB layer for FarmTracker

export interface Worker {
  id?: number;
  name: string;
  dailyWage: number;
}

export type AttendanceType = "full" | "half" | "absent" | "extra";

export interface AttendanceRecord {
  id?: number;
  workerId: number;
  date: string; // YYYY-MM-DD
  type: AttendanceType;
  extraAmount?: number;
}

const DB_NAME = "FarmTracker";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("workers")) {
        db.createObjectStore("workers", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("attendance")) {
        const store = db.createObjectStore("attendance", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("workerDate", ["workerId", "date"], { unique: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function txStore(db: IDBDatabase, store: string, mode: IDBTransactionMode) {
  return db.transaction(store, mode).objectStore(store);
}

export async function getAllWorkers(): Promise<Worker[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, "workers", "readonly").getAll();
    req.onsuccess = () => resolve(req.result as Worker[]);
    req.onerror = () => reject(req.error);
  });
}

export async function addWorker(worker: Omit<Worker, "id">): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, "workers", "readwrite").add(worker);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function updateWorker(worker: Worker): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, "workers", "readwrite").put(worker);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteWorker(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, "workers", "readwrite").delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAttendanceForDate(
  date: string,
): Promise<AttendanceRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, "attendance", "readonly").getAll();
    req.onsuccess = () => {
      const all = req.result as AttendanceRecord[];
      resolve(all.filter((r) => r.date === date));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAttendanceForWorker(
  workerId: number,
): Promise<AttendanceRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = txStore(db, "attendance", "readonly").getAll();
    req.onsuccess = () => {
      const all = req.result as AttendanceRecord[];
      const records = all
        .filter((r) => r.workerId === workerId)
        .sort((a, b) => a.date.localeCompare(b.date));
      resolve(records);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function upsertAttendance(
  record: Omit<AttendanceRecord, "id">,
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("attendance", "readwrite");
    const store = tx.objectStore("attendance");
    const idx = store.index("workerDate");
    const getReq = idx.get([record.workerId, record.date]);
    getReq.onsuccess = () => {
      const existing = getReq.result as AttendanceRecord | undefined;
      const toSave: AttendanceRecord = existing
        ? { ...record, id: existing.id }
        : { ...record };
      const putReq = store.put(toSave);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
