/** Time controls offered before a game starts. Calculator is classical-only. */
export interface TimeControl {
  id: string;
  label: string;
  /** Base minutes per side; null = unlimited. */
  baseMinutes: number | null;
  /** Increment seconds per move. */
  incrementSeconds: number;
  /** Bucket used for the Calculator's classical-only restriction. */
  category: 'unlimited' | 'blitz' | 'rapid' | 'classical';
}

export const TIME_CONTROLS: TimeControl[] = [
  { id: 'unlimited', label: 'Unlimited', baseMinutes: null, incrementSeconds: 0, category: 'unlimited' },
  { id: '1+0',  label: '1 + 0',   baseMinutes: 1,  incrementSeconds: 0,  category: 'blitz' },
  { id: '3+0',  label: '3 + 0',   baseMinutes: 3,  incrementSeconds: 0,  category: 'blitz' },
  { id: '3+2',  label: '3 + 2',   baseMinutes: 3,  incrementSeconds: 2,  category: 'blitz' },
  { id: '5+0',  label: '5 + 0',   baseMinutes: 5,  incrementSeconds: 0,  category: 'blitz' },
  { id: '5+3',  label: '5 + 3',   baseMinutes: 5,  incrementSeconds: 3,  category: 'blitz' },
  { id: '10+0', label: '10 + 0',  baseMinutes: 10, incrementSeconds: 0,  category: 'rapid' },
  { id: '10+5', label: '10 + 5',  baseMinutes: 10, incrementSeconds: 5,  category: 'rapid' },
  { id: '15+10', label: '15 + 10', baseMinutes: 15, incrementSeconds: 10, category: 'rapid' },
  { id: '30+0', label: '30 + 0',  baseMinutes: 30, incrementSeconds: 0,  category: 'classical' },
  { id: '30+30', label: '30 + 30', baseMinutes: 30, incrementSeconds: 30, category: 'classical' },
];

/** The Calculator only accepts classical (or unlimited) time controls. */
export function isAllowedForClassicalOnly(tc: TimeControl): boolean {
  return tc.category === 'classical' || tc.category === 'unlimited';
}
