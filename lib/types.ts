export type RoomType = 'classroom' | 'lab';

export interface Teacher {
  id: string;
  name: string;
  maxHours: number;        // hours per week, 0 = unlimited
  restricted: boolean;     // when false, every day/slot is available
  availability: string[];  // 'Day|Slot' keys that are available (used when restricted)
  prefSlots: string[];     // preferred slot labels (soft preference)
  notes: string;
}

export interface Module {
  id: string;
  name: string;
  teacherId: string;
  hoursPerWeek: number;    // sessions per week, for each assigned group
  groupIds: string[];
  roomType: RoomType;
}

export interface Group {
  id: string;
  name: string;
  size: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: RoomType;
}

export interface Settings {
  days: string[];
  slots: string[];
}

export interface Session {
  id: string;
  day: string;
  slot: string;
  teacherId: string;
  moduleId: string;
  groupId: string;
  roomId: string;
}

export interface DataSet {
  teachers: Teacher[];
  modules: Module[];
  groups: Group[];
  rooms: Room[];
  settings: Settings;
}

export type ConflictKind =
  | 'teacher_double'
  | 'room_double'
  | 'group_double'
  | 'room_capacity'
  | 'room_type'
  | 'teacher_unavailable'
  | 'missing_hours';

export interface Conflict {
  id: string;
  kind: ConflictKind;
  message: string;
  sessionIds: string[];
}

export const SLOT_HOURS = 1.5;

export const slotKey = (day: string, slot: string) => `${day}|${slot}`;

export const rid = (p: string) => p + '_' + Math.random().toString(36).slice(2, 9);

export const ALL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DEFAULT_SLOTS = ['08:00–09:30', '09:30–11:00', '11:00–12:30', '13:30–15:00', '15:00–16:30'];
