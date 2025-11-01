// API service for backend integration
import env from '../env';

const API_BASE_URL = env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get access token from localStorage
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

// Helper to get refresh token from localStorage
function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

// Helper to save tokens to localStorage
function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

// Helper to check if token is expired (simple JWT decode)
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true; // If can't decode, assume expired
  }
}

// Common fetch wrapper with authentication
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const initialToken = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (initialToken) {
    headers['Authorization'] = `Bearer ${initialToken}`;
  }

  const doFetch = async (): Promise<Response> =>
    await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

  let response = await doFetch();

  // If unauthorized, attempt one-time refresh and retry
  if (!response.ok && response.status === 401) {
    try {
      await refreshAccessToken();
      const refreshed = getAccessToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${refreshed}`;
      } else {
        delete headers['Authorization'];
      }
      response = await doFetch();
    } catch {
      // refresh 실패 시 그대로 에러 처리
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    // 409 Conflict - 파일이 아직 처리 중인 경우
    if (response.status === 409) {
      throw new Error(errorData.message || '파일이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }

    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response;
}

// API Types
export interface FileInfoResponse {
  id: number;
  originalName: string;
  storedName: string;
  contentType: string;
  size: number;
  path: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  errorMessage?: string;
  updatedAt: string; // ISO 8601 datetime string
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleUserInfo {
  email: string;
  identifier: string;
}

export interface NaverUserInfo {
  email: string;
  identifier: string;
}

export interface ApiResponse<T> {
  result: T;
  message?: string;
}

// Auth API
/**
 * 회원가입 - 새로운 사용자를 생성하고 JWT 토큰을 발급받습니다
 */
export async function register(): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`회원가입 실패: ${response.status}`);
  }

  const data: ApiResponse<TokenResponse> = await response.json();

  // 토큰을 localStorage에 저장
  saveTokens(data.result.accessToken, data.result.refreshToken);

  return data.result;
}

/**
 * 토큰 갱신 - refresh token을 사용하여 새로운 access token을 발급받습니다
 */
export async function refreshAccessToken(): Promise<TokenResponse> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('Refresh token이 없습니다.');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refreshToken,
    }),
  });

  if (!response.ok) {
    // Refresh token도 만료된 경우, 재회원가입 필요
    return await register();
  }

  const data: ApiResponse<TokenResponse> = await response.json();

  // 새로운 토큰을 localStorage에 저장
  saveTokens(data.result.accessToken, data.result.refreshToken);

  return data.result;
}

/**
 * Google 사용자 정보 조회
 */
export async function getGoogleUserInfo(): Promise<GoogleUserInfo | null> {
  const response = await fetchWithAuth('/auth/google/me');
  const data: ApiResponse<GoogleUserInfo | null> = await response.json();
  return data.result;
}

/**
 * Naver 사용자 정보 조회
 */
export async function getNaverUserInfo(): Promise<NaverUserInfo | null> {
  const response = await fetchWithAuth('/auth/naver/me');
  const data: ApiResponse<NaverUserInfo | null> = await response.json();
  return data.result;
}

/**
 * 토큰 확인 및 자동 갱신
 * 토큰이 없으면 자동으로 회원가입을 수행하고,
 * 토큰이 만료되었으면 자동으로 갱신합니다
 */
async function ensureAuthenticated(): Promise<void> {
  const token = getAccessToken();

  if (!token) {
    await register();
    return;
  }

  // 토큰 만료 확인
  if (isTokenExpired(token)) {
    try {
      await refreshAccessToken();
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      throw error;
    }
  }
}

// File Upload API
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileInfoResponse> {
  // 토큰이 없으면 자동 회원가입
  await ensureAuthenticated();

  const token = getAccessToken();

  if (!token) {
    throw new Error('인증에 실패했습니다.');
  }

  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    // Success handler
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: ApiResponse<FileInfoResponse> = JSON.parse(xhr.responseText);
          resolve(response.result);
        } catch (error) {
          reject(new Error('응답 파싱 실패'));
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(errorData.message || `업로드 실패: ${xhr.status}`));
        } catch {
          reject(new Error(`업로드 실패: ${xhr.status}`));
        }
      }
    });

    // Error handler
    xhr.addEventListener('error', () => {
      reject(new Error('네트워크 오류가 발생했습니다.'));
    });

    // Abort handler
    xhr.addEventListener('abort', () => {
      reject(new Error('업로드가 취소되었습니다.'));
    });

    // Send request
    xhr.open('POST', `${API_BASE_URL}/files/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}

// Get file upload status
export async function getFileStatus(fileId: number): Promise<FileInfoResponse> {
  const response = await fetchWithAuth(`/files/${fileId}/status`);
  const data: ApiResponse<FileInfoResponse> = await response.json();
  return data.result;
}

// List my files
export async function listMyFiles(): Promise<FileInfoResponse[]> {
  const response = await fetchWithAuth('/files');
  const data: ApiResponse<FileInfoResponse[]> = await response.json();
  return data.result;
}

// Poll file status until completed or failed
export async function pollFileStatus(
  fileId: number,
  options: {
    interval?: number;
    maxAttempts?: number;
    onStatusChange?: (status: FileInfoResponse['status']) => void;
  } = {}
): Promise<FileInfoResponse> {
  const { interval = 2000, maxAttempts = 30, onStatusChange } = options;

  let attempts = 0;

  while (attempts < maxAttempts) {
    const fileInfo = await getFileStatus(fileId);

    if (onStatusChange) {
      onStatusChange(fileInfo.status);
    }

    if (fileInfo.status === 'COMPLETED') {
      return fileInfo;
    }

    if (fileInfo.status === 'FAILED') {
      throw new Error(fileInfo.errorMessage || '파일 처리 실패');
    }

    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, interval));
    attempts++;
  }

  throw new Error('파일 처리 시간 초과');
}

// Rename file
export async function renameFile(fileId: number, newName: string): Promise<void> {
  await ensureAuthenticated();

  await fetchWithAuth(`/files/${fileId}/name`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: newName }),
  });
}

// Delete file
export async function deleteFile(fileId: number): Promise<void> {
  await ensureAuthenticated();

  const response = await fetchWithAuth(`/files/${fileId}`, {
    method: 'DELETE',
  });

  await response.json();
}

// Update current page
export async function updateCurrentPage(fileId: number, currentPage: number): Promise<void> {
  await ensureAuthenticated();

  await fetchWithAuth(`/files/${fileId}/current-page`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPage }),
  });
}

// Get file content (for rendering)
export async function getFileContent(fileId: number): Promise<Blob> {
  await ensureAuthenticated();

  const response = await fetchWithAuth(`/files/${fileId}/content`);
  return await response.blob();
}

// Script API
export interface PageScriptData {
  duration: number; // 초
  content: string;
}

export type ScriptMap = Record<number, PageScriptData>;

export interface ScriptData {
  goalTime: number; // 초
  slides: ScriptMap;
}

/**
 * 대본 저장
 */
export async function saveScript(fileId: number, goalTime: number, slides: ScriptMap): Promise<void> {
  await ensureAuthenticated();

  await fetchWithAuth(`/files/${fileId}/script`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ goalTime, slides }),
  });
}

/**
 * 대본 조회
 */
export async function getScript(fileId: number, scriptName?: string): Promise<ScriptData> {
  await ensureAuthenticated();

  const url = scriptName
    ? `/files/${fileId}/script?scriptName=${encodeURIComponent(scriptName)}`
    : `/files/${fileId}/script`;

  const response = await fetchWithAuth(url);
  const data: ApiResponse<ScriptData> = await response.json();
  return data.result;
}

/**
 * Transcript Page 타입 정의
 */
export interface TranscriptPage {
  id?: number;
  fileId: number;
  pageNumber: number;
  content: string;
}

/**
 * AI 대본 자동 생성 (동기)
 * 대본 생성이 완료될 때까지 대기한 후 결과를 반환합니다.
 */
export async function generateScript(fileId: number): Promise<TranscriptPage[]> {
  await ensureAuthenticated();

  const response = await fetchWithAuth(`/files/${fileId}/script/generate`, {
    method: 'POST',
  });
  const data: ApiResponse<TranscriptPage[]> = await response.json();
  return data.result;
}

/**
 * 대본 목록 조회
 * 파일의 대본 파일명 목록을 최신순으로 조회합니다.
 */
export async function listScripts(fileId: number): Promise<string[]> {
  await ensureAuthenticated();

  const response = await fetchWithAuth(`/files/${fileId}/scripts`);
  const data: ApiResponse<string[]> = await response.json();
  return data.result;
}

/**
 * 단일 페이지 재생성 요청 타입
 */
export interface RegeneratePageScriptRequest {
  pageNumber: number;
  existingScript?: string;
}

/**
 * 단일 페이지 스크립트 재생성
 * Gemini AI를 사용하여 특정 페이지의 발표 스크립트를 재생성합니다.
 */
export async function regeneratePageScript(
  fileId: number,
  pageNumber: number,
  existingScript?: string
): Promise<TranscriptPage> {
  await ensureAuthenticated();

  const response = await fetchWithAuth(`/files/${fileId}/script/regenerate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pageNumber, existingScript }),
  });
  const data: ApiResponse<TranscriptPage> = await response.json();
  return data.result;
}

/**
 * 예상 질문 타입 정의
 */
export interface ExpectedQuestion {
  question: string;
  category: string;
}

export interface ExpectedQuestionsResponse {
  questions: ExpectedQuestion[];
}

/**
 * AI 예상 질문 생성
 * PDF 파일과 대본을 기반으로 예상 질문을 생성합니다.
 */
export async function generateExpectedQuestions(
  fileId: number,
  goalTime: number,
  slides: ScriptMap
): Promise<ExpectedQuestionsResponse> {
  await ensureAuthenticated();

  const response = await fetchWithAuth(`/files/${fileId}/questions/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ goalTime, slides }),
  });
  const data: ApiResponse<ExpectedQuestionsResponse> = await response.json();
  return data.result;
}

// Public (unauthenticated) APIs
/**
 * 공개 파일 콘텐츠(PDF) 조회 - 인증 없이 접근 가능
 */
export async function getPublicFileContent(storedName: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/files/public/${encodeURIComponent(storedName)}/content`, {
    method: 'GET',
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `파일 콘텐츠 조회 실패: ${response.status}`);
  }
  return await response.blob();
}

/**
 * 공개 현재 페이지 조회 - 인증 없이 접근 가능
 */
export async function getPublicCurrentPage(storedName: string): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/files/public/${encodeURIComponent(storedName)}/current-page`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(errorText || `현재 페이지 조회 실패: ${response.status}`);
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => (null as any));
    // ApiResponse<number> | { currentPage: number } | number
    if (data == null) throw new Error('현재 페이지 응답 파싱 실패');
    if (typeof data === 'number') return data;
    if ('result' in data && typeof data.result === 'number') return data.result as number;
    if ('currentPage' in data && typeof data.currentPage === 'number') return data.currentPage as number;
    throw new Error('현재 페이지 응답 형식이 올바르지 않습니다');
  }
  // 숫자만 반환되는 경우 텍스트 파싱
  const text = (await response.text()).trim();
  const num = Number(text);
  if (!Number.isFinite(num)) throw new Error('현재 페이지 응답 파싱 실패');
  return num;
}
