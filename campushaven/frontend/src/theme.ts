export type Gender = 'boys' | 'girls';
export type Institution = 'hi-tech' | 'mirai';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  accentMuted: string;
  ink: string;
  paper: string;
  paperCard: string;
  gridLine: string;
  sketchBorder: string;
  sketchShadow: string;
  highlighter: string;
}

export const THEMES: Record<Gender, ThemeColors> = {
  boys: {
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#f59e0b',
    accentMuted: '#fbbf2433',
    ink: '#0f172a',
    paper: '#FAF8F5',
    paperCard: '#FFFDF9',
    gridLine: '#E7E2DA',
    sketchBorder: '#0f172a',
    sketchShadow: '#0f172a',
    highlighter: '#fde68a',
  },
  girls: {
    primary: '#4C0519',
    secondary: '#BE185D',
    accent: '#F43F5E',
    accentMuted: 'rgba(251, 113, 133, 0.2)',
    ink: '#4C0519',
    paper: '#FAF8F5',
    paperCard: 'rgba(255, 255, 255, 0.75)',
    gridLine: 'rgba(244, 63, 94, 0.08)',
    sketchBorder: 'rgba(244, 63, 94, 0.25)',
    sketchShadow: 'rgba(225, 29, 72, 0.1)',
    highlighter: '#FECDD3',
  },
};

export const applyTheme = (gender: Gender) => {
  const root = document.documentElement;
  const theme = THEMES[gender];

  root.style.setProperty('--primary', theme.primary);
  root.style.setProperty('--secondary', theme.secondary);
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--accent-muted', theme.accentMuted);
  root.style.setProperty('--ink', theme.ink);
  root.style.setProperty('--paper', theme.paper);
  root.style.setProperty('--paper-card', theme.paperCard);
  root.style.setProperty('--grid-line', theme.gridLine);
  root.style.setProperty('--sketch-border', theme.sketchBorder);
  root.style.setProperty('--sketch-shadow', theme.sketchShadow);
  root.style.setProperty('--highlighter', theme.highlighter);

  if (gender === 'girls') {
    document.body.classList.add('theme-girls');
    document.body.classList.remove('theme-boys');
  } else {
    document.body.classList.add('theme-boys');
    document.body.classList.remove('theme-girls');
  }
};
