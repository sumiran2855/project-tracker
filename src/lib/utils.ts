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

export function getDefaultViewRoute(defaultView?: string): string {
  if (!defaultView) return '/dashboard';
  const val = defaultView.trim().toLowerCase();
  if (val.includes('task')) return '/tasks';
  if (val.includes('project')) return '/projects';
  return '/dashboard';
}

export function formatCommentTime(timeStr: string): string {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  if (isNaN(date.getTime())) {
    // Return legacy format as-is
    return timeStr;
  }
  
  const now = new Date();
  const dDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dNow.getTime() - dDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  const timeFormatted = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  
  if (diffDays === 0) {
    return `${timeFormatted}, Today`;
  } else if (diffDays === 1) {
    return `${timeFormatted}, Yesterday`;
  } else {
    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    return `${timeFormatted}, ${dateFormatted}`;
  }
}

export function getCommentTimestamp(comment: any): number {
  if (!comment) return 0;
  
  if (comment.time) {
    const parsed = Date.parse(comment.time);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  if (comment.id) {
    const match = comment.id.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
  }
  
  return 0;
}
