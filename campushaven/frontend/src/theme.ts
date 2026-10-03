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
    primary: '#4A2638',
    secondary: '#6B4054',
    accent: '#4A2638',
    accentMuted: '#E8C9D2',
    ink: '#3A2931',
    paper: '#FCF8F5',
    paperCard: '#FFFDFB',
    gridLine: '#E8D9D9',
    sketchBorder: '#E8D9D9',
    sketchShadow: 'rgba(74, 38, 56, 0.12)',
    highlighter: '#E8C9D2',
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
