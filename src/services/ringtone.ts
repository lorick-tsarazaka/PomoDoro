import { ref } from 'vue';

export type RingtoneKind = 'app' | 'local';

export interface RingtoneSource {
  id: string;
  name: string;
  url: string;
  kind: RingtoneKind;
  createdAt?: string;
}

interface StoredRingtoneState {
  selectedRingtoneId: string;
  localRingtones: RingtoneSource[];
}

const STORAGE_KEY = 'pomodoro.ringtones.v1';
const DEFAULT_RINGTONE_ID = 'app-alarm-beep';
const DEFAULT_RINGTONES: RingtoneSource[] = [
  {
    id: 'app-faah',
    name: 'Faah',
    url: '/sound/alarm/Fahhhhh.mp3',
    kind: 'app',
  },
  {
    id: 'app-alarm-clock-1',
    name: 'Alarm Clock 1',
    url: '/sound/alarm/Alarm-clock-1.mp3',
    kind: 'app',
  },
  {
    id: 'app-alarm-clock-2',
    name: 'Alarm Clock 2',
    url: '/sound/alarm/Alarm-clock-2.mp3',
    kind: 'app',
  },
  {
    id: 'app-alarm-beep',
    name: 'Alarm Beep',
    url: '/sound/alarm/Alarm-beep.mp3',
    kind: 'app',
  },
];

export const appRingtones = ref<RingtoneSource[]>(DEFAULT_RINGTONES);
export const localRingtones = ref<RingtoneSource[]>([]);
export const selectedRingtoneId = ref<string>(DEFAULT_RINGTONE_ID);
export const previewRingtoneId = ref<string | null>(null);

let previewAudio: HTMLAudioElement | null = null;
let alarmAudio: HTMLAudioElement | null = null;
let alarmRingtoneId: string | null = null;

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(String(reader.result ?? ''));
    };
    reader.onerror = () => {
      reject(reader.error ?? new Error('Unable to read file'));
    };
    reader.readAsDataURL(file);
  });
}

function persistState(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const state: StoredRingtoneState = {
    selectedRingtoneId: selectedRingtoneId.value,
    localRingtones: localRingtones.value,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getFallbackRingtoneId(): string {
  const defaultSource = appRingtones.value.find((ringtone) => ringtone.id === DEFAULT_RINGTONE_ID);
  return defaultSource?.id ?? appRingtones.value[0]?.id ?? DEFAULT_RINGTONES[0].id;
}

function getAllRingtones(): RingtoneSource[] {
  return [...appRingtones.value, ...localRingtones.value];
}

export function getRingtoneById(ringtoneId: string): RingtoneSource | undefined {
  return getAllRingtones().find((ringtone) => ringtone.id === ringtoneId);
}

function stopAudio(audio: HTMLAudioElement | null): void {
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
  audio.src = '';
}

export function loadRingtoneLibrary(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      selectedRingtoneId.value = getFallbackRingtoneId();
      localRingtones.value = [];
      return;
    }

    const parsed = JSON.parse(raw) as Partial<StoredRingtoneState>;
    localRingtones.value = Array.isArray(parsed.localRingtones)
      ? parsed.localRingtones
          .filter((ringtone) => Boolean(ringtone?.id && ringtone?.name && ringtone?.url))
          .map((ringtone) => ({
            id: String(ringtone.id),
            name: String(ringtone.name),
            url: String(ringtone.url),
            kind: 'local',
            createdAt: ringtone.createdAt,
          }))
      : [];

    const selected = String(parsed.selectedRingtoneId ?? '');
    selectedRingtoneId.value = getRingtoneById(selected) ? selected : getFallbackRingtoneId();
  } catch {
    localRingtones.value = [];
    selectedRingtoneId.value = getFallbackRingtoneId();
  }
}

export function setSelectedRingtone(ringtoneId: string): void {
  if (!getRingtoneById(ringtoneId)) {
    return;
  }

  selectedRingtoneId.value = ringtoneId;
  persistState();
}

export async function playPreviewRingtone(ringtoneId: string): Promise<void> {
  const ringtone = getRingtoneById(ringtoneId);
  if (!ringtone) {
    return;
  }

  stopPreviewRingtone();

  const audio = new Audio(ringtone.url);
  audio.preload = 'auto';
  audio.loop = false;
  previewAudio = audio;
  previewRingtoneId.value = ringtoneId;

  audio.addEventListener(
    'ended',
    () => {
      if (previewRingtoneId.value === ringtoneId) {
        stopPreviewRingtone();
      }
    },
    { once: true }
  );

  try {
    await audio.play();
  } catch {
    stopPreviewRingtone();
  }
}

export function stopPreviewRingtone(): void {
  stopAudio(previewAudio);
  previewAudio = null;
  previewRingtoneId.value = null;
}

export async function startAlarmRingtoneLoop(): Promise<void> {
  const ringtoneId = selectedRingtoneId.value;
  const ringtone = getRingtoneById(ringtoneId) ?? getRingtoneById(getFallbackRingtoneId());
  if (!ringtone) {
    return;
  }

  if (alarmAudio && alarmRingtoneId === ringtone.id) {
    return;
  }

  stopAlarmRingtone();

  const audio = new Audio(ringtone.url);
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 1;
  alarmAudio = audio;
  alarmRingtoneId = ringtone.id;

  try {
    await audio.play();
  } catch {
    stopAlarmRingtone();
  }
}

export function stopAlarmRingtone(): void {
  stopAudio(alarmAudio);
  alarmAudio = null;
  alarmRingtoneId = null;
}

export async function addLocalRingtones(files: File[]): Promise<{ added: number; rejected: number }> {
  const acceptedFiles = files.filter((file) => isAudioFile(file));
  const rejected = files.length - acceptedFiles.length;

  if (acceptedFiles.length === 0) {
    return { added: 0, rejected };
  }

  const imported = await Promise.all(
    acceptedFiles.map(async (file) => ({
      id: generateId('local-sound'),
      name: file.name,
      url: await readAsDataUrl(file),
      kind: 'local' as const,
      createdAt: new Date().toISOString(),
    }))
  );

  localRingtones.value = [...imported, ...localRingtones.value];
  persistState();

  if (!getRingtoneById(selectedRingtoneId.value)) {
    selectedRingtoneId.value = imported[0]?.id ?? getFallbackRingtoneId();
    persistState();
  }

  return { added: imported.length, rejected };
}

export function deleteLocalRingtones(ringtoneIds: string[]): void {
  const idSet = new Set(ringtoneIds);
  const removedCurrentPreview = Boolean(previewRingtoneId.value && idSet.has(previewRingtoneId.value));
  const removedCurrentAlarm = Boolean(alarmRingtoneId && idSet.has(alarmRingtoneId));

  localRingtones.value = localRingtones.value.filter((ringtone) => !idSet.has(ringtone.id));

  if (removedCurrentPreview) {
    stopPreviewRingtone();
  }

  if (removedCurrentAlarm) {
    stopAlarmRingtone();
  }

  if (!getRingtoneById(selectedRingtoneId.value)) {
    selectedRingtoneId.value = getFallbackRingtoneId();
  }

  persistState();
}

export function getRingtoneGroups(): { app: RingtoneSource[]; local: RingtoneSource[] } {
  return {
    app: appRingtones.value,
    local: localRingtones.value,
  };
}

export function getSelectedRingtoneName(): string {
  return getRingtoneById(selectedRingtoneId.value)?.name ?? 'Alarm Beep';
}
