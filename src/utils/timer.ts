export function exerciseDeadline(now: number, durationMinutes: number) { return now + durationMinutes * 60_000; }
export function remainingSeconds(deadline: number, now: number) { return Math.max(0, Math.ceil((deadline - now) / 1000)); }
