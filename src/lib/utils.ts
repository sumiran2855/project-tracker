import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentWeekBounds() {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(now);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
}

export function isDateInCurrentWeek(dateStr: string | undefined | null) {
  if (!dateStr || dateStr === 'No Due Date') return false;
  const itemDate = new Date(dateStr);
  if (isNaN(itemDate.getTime())) return false;
  const { monday, sunday } = getCurrentWeekBounds();
  return itemDate >= monday && itemDate <= sunday;
}

export function isOverdueActive(dateStr: string | undefined | null, status: string) {
  if (!dateStr || dateStr === 'No Due Date') return false;
  const itemDate = new Date(dateStr);
  if (isNaN(itemDate.getTime())) return false;
  
  const { monday } = getCurrentWeekBounds();
  const isPast = itemDate < monday;
  
  const isCompleted = ['Done', 'Resolved', 'Closed'].includes(status);
  return isPast && !isCompleted;
}

export function isItemInSprint(dateStr: string | undefined | null, status: string) {
  return isDateInCurrentWeek(dateStr) || isOverdueActive(dateStr, status);
}
