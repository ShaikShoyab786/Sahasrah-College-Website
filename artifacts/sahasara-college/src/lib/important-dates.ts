import type { KnowledgeHubExamUpdatesImportantDatesMilestone as Milestone } from '@workspace/api-client-react';

export const EXAMS = ['JEE', 'NEET', 'Intermediate', 'EAMCET', 'Other Exams'] as const;

/** India-local calendar day, formatted without constructing a UTC midnight Date. */
export function indiaToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export type DateStatus = 'completed' | 'ongoing' | 'upcoming' | 'postponed' | 'cancelled' | 'date pending';

/** Lexical comparison is safe for ISO date-only values; no timezone conversion occurs. */
export function getMilestoneDateStatus(
  milestone: Pick<Milestone, 'startDate' | 'endDate' | 'eventStatusOverride'>,
  today: string = indiaToday(),
): DateStatus {
  if (milestone.eventStatusOverride === 'postponed' || milestone.eventStatusOverride === 'cancelled') return milestone.eventStatusOverride;
  if (!milestone.startDate) return 'date pending';
  const end = milestone.endDate || milestone.startDate;
  if (today > end) return 'completed';
  if (today < milestone.startDate) return 'upcoming';
  return 'ongoing';
}

export function formatMilestoneDate(date: string | null): string {
  if (!date) return 'Date to be announced';
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatMilestoneRange(start: string | null, end: string | null): string {
  if (!start) return 'Date to be announced';
  return end && end !== start ? `${formatMilestoneDate(start)} – ${formatMilestoneDate(end)}` : formatMilestoneDate(start);
}

export function sortMilestones(items: Milestone[]): Milestone[] {
  return [...items].sort((a, b) => (a.startDate ?? '9999-12-31').localeCompare(b.startDate ?? '9999-12-31') || a.displayOrder - b.displayOrder);
}