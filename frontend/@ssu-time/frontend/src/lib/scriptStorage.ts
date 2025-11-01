import { getScript as getScriptApi, saveScript, ScriptMap, PageScriptData, ScriptData } from './api';

export type { ScriptMap, PageScriptData, ScriptData };

const STORAGE_KEY = 'speakon.scripts';

function readAll(): Record<string, ScriptData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, ScriptData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/**
 * 대본 및 목표 시간 조회 (fileId 사용)
 * localStorage 우선, 없으면 API GET
 */
export async function getScripts(fileId: number): Promise<ScriptData> {
  const all = readAll();
  const localData = all[String(fileId)];

  // localStorage에 데이터가 있으면 그것을 사용
  if (localData) {
    return localData;
  }

  // localStorage에 없으면 API에서 가져오기
  try {
    const apiData = await getScriptApi(fileId);
    // API에서 가져온 데이터를 localStorage에 저장
    all[String(fileId)] = apiData;
    writeAll(all);
    return apiData;
  } catch (error) {
    console.warn('API 대본 조회 실패:', error);
    return { goalTime: 0, slides: {} };
  }
}

/**
 * 대본 저장 (fileId 사용)
 * localStorage + API 둘 다 저장
 */
export async function saveScripts(fileId: number, goalTime: number, slides: ScriptMap): Promise<void> {
  // localStorage 저장
  const all = readAll();
  all[String(fileId)] = { goalTime, slides };
  writeAll(all);

  // API 저장
  try {
    await saveScript(fileId, goalTime, slides);
  } catch (error) {
    console.error('API 대본 저장 실패 (localStorage에는 저장됨):', error);
  }
}

/**
 * 단일 슬라이드 대본 업데이트 (fileId 사용)
 * localStorage + API 둘 다 저장
 * @param allSlides - 현재 상태의 전체 슬라이드 데이터 (race condition 방지)
 */
export async function setScript(
  fileId: number,
  slideNumber: number,
  content: string,
  duration: number = 0,
  goalTime: number = 0,
  allSlides?: ScriptMap
): Promise<void> {
  let slides: ScriptMap;
  let finalGoalTime: number;

  if (allSlides) {
    // 전체 슬라이드 데이터가 제공된 경우, GET 없이 바로 사용 (race condition 방지)
    slides = { ...allSlides };
    slides[slideNumber] = { content, duration };
    finalGoalTime = goalTime;
  } else {
    // 하위 호환성: allSlides가 없으면 기존 방식 사용
    const scriptData = await getScripts(fileId);
    scriptData.slides[slideNumber] = { content, duration };
    slides = scriptData.slides;
    finalGoalTime = goalTime > 0 ? goalTime : scriptData.goalTime;
  }

  // localStorage 저장
  const all = readAll();
  all[String(fileId)] = { goalTime: finalGoalTime, slides };
  writeAll(all);

  // API 저장
  try {
    await saveScript(fileId, finalGoalTime, slides);
  } catch (error) {
    console.error('API 대본 저장 실패 (localStorage에는 저장됨):', error);
  }
}

/**
 * 단일 슬라이드 대본 조회 (fileId 사용)
 */
export async function getScript(fileId: number, slideNumber: number): Promise<PageScriptData> {
  const scriptData = await getScripts(fileId);
  return scriptData.slides[slideNumber] ?? { content: '', duration: 0 };
}

/**
 * 모든 스크립트 데이터 삭제
 */
export function clearAll(): void {
  localStorage.removeItem(STORAGE_KEY);
}


