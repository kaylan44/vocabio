// Date labels for the messaging UI (French locale).

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** "14:32" today, "Hier" yesterday, "12/03" otherwise — conversation list style. */
export function formatConversationDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (isSameDay(date, now)) return formatTime(iso);

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Hier';

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

/** Day separator label in the chat: "Aujourd'hui", "Hier", "lundi 12 mars". */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (isSameDay(date, now)) return "Aujourd'hui";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Hier';

  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function isDifferentDay(a: string, b: string): boolean {
  return !isSameDay(new Date(a), new Date(b));
}
