// Simple IndexedDB-based file store for persisting uploaded files by id

type StoredRecord = {
  id: string
  blob: Blob
  name: string
  type: string
  size: number
  lastModified: number
}

const DB_NAME = 'speakon-db'
const STORE_NAME = 'files'
const DB_VERSION = 1

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveFileBlob(id: string, file: File): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const record: StoredRecord = {
      id,
      blob: file,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    }
    store.put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getFileBlob(id: string): Promise<File | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(id)
    req.onsuccess = () => {
      const rec = req.result as StoredRecord | undefined
      if (!rec) return resolve(null)
      const file = new File([rec.blob], rec.name, { type: rec.type, lastModified: rec.lastModified })
      resolve(file)
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deleteFileBlob(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}


