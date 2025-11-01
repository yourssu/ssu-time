export type StoredFileMeta = {
  id: string;
  name: string;
  size: number;
  pageCount?: number;
  uploadedAt: number; // epoch ms
};

const STORAGE_KEY = 'speakon.files';

function readAll(): StoredFileMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(files: StoredFileMeta[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

function generateId(): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `file_${Date.now()}_${randomPart}`;
}

export function listFiles(): StoredFileMeta[] {
  const files = readAll();
  // 과거 버전에서 중복 저장된 항목을 이름+크기로 Dedup
  const map = new Map<string, StoredFileMeta>();
  for (const f of files) {
    const key = `${f.name}__${f.size}`;
    const existing = map.get(key);
    if (!existing || (existing && f.uploadedAt > existing.uploadedAt)) {
      map.set(key, f);
    }
  }
  return Array.from(map.values()).sort((a, b) => b.uploadedAt - a.uploadedAt);
}

export function addFile(meta: Omit<StoredFileMeta, 'id' | 'uploadedAt'> & Partial<Pick<StoredFileMeta, 'uploadedAt'>>): StoredFileMeta {
  const files = readAll();
  const newItem: StoredFileMeta = {
    id: generateId(),
    uploadedAt: meta.uploadedAt ?? Date.now(),
    name: meta.name,
    size: meta.size,
    pageCount: meta.pageCount,
  };
  files.push(newItem);
  writeAll(files);
  return newItem;
}

export function removeFile(id: string) {
  const files = readAll();
  const next = files.filter(f => f.id !== id);
  writeAll(next);
}

export function clearAll() {
  writeAll([]);
}

// 동일 파일명+크기가 이미 존재하면 갱신, 없으면 추가
export function upsertFile(meta: { name: string; size: number; pageCount?: number; idHint?: string }): StoredFileMeta {
  const files = readAll();
  const idx = files.findIndex(f => f.name === meta.name && f.size === meta.size);
  if (idx >= 0) {
    const updated: StoredFileMeta = {
      ...files[idx],
      pageCount: meta.pageCount ?? files[idx].pageCount,
      uploadedAt: Date.now(),
    };
    files[idx] = updated;
    writeAll(files);
    return updated;
  }
  const created: StoredFileMeta = {
    id: meta.idHint ?? generateId(),
    name: meta.name,
    size: meta.size,
    pageCount: meta.pageCount,
    uploadedAt: Date.now(),
  };
  files.push(created);
  writeAll(files);
  return created;
}


