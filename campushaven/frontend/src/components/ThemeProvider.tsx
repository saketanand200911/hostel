import React, { createContext, useContext, useState, useEffect } from 'react';
import { Gender, Institution, applyTheme, THEMES } from '../theme';

interface ThemeContextType {
  gender: Gender;
  setGender: (gender: Gender) => void;
  institution: Institution;
  setInstitution: (inst: Institution) => void;
  theme: typeof THEMES.boys;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gender, setGenderState] = useState<Gender>(() => {
    const saved = localStorage.getItem('campushaven_gender');
    return (saved === 'girls' || saved === 'boys') ? saved : 'boys';
  });

  const [institution, setInstitutionState] = useState<Institution>(() => {
    const saved = localStorage.getItem('campushaven_institution');
    return (saved === 'mirai' || saved === 'hi-tech') ? saved : 'hi-tech';
  });

  const setGender = (newGender: Gender) => {
    setGenderState(newGender);
    localStorage.setItem('campushaven_gender', newGender);
  };

  const setInstitution = (newInst: Institution) => {
    setInstitutionState(newInst);
    localStorage.setItem('campushaven_institution', newInst);
  };

  useEffect(() => {
    applyTheme(gender);
  }, [gender]);

  return (
    <ThemeContext.Provider
      value={{
        gender,
        setGender,
        institution,
        setInstitution,
        theme: THEMES[gender],
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

