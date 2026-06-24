import { createContext, useContext, useState, type ReactNode } from 'react';

interface YearContextType {
  selectedYear: number | null;
  setSelectedYear: (year: number) => void;
  clearYear: () => void;
}

const YearContext = createContext<YearContextType | null>(null);

export function YearProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYearState] = useState<number | null>(() => {
    const stored = localStorage.getItem('jd_year');
    return stored ? Number(stored) : null;
  });

  const setSelectedYear = (year: number) => {
    localStorage.setItem('jd_year', String(year));
    setSelectedYearState(year);
  };

  const clearYear = () => {
    localStorage.removeItem('jd_year');
    setSelectedYearState(null);
  };

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, clearYear }}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const ctx = useContext(YearContext);
  if (!ctx) throw new Error('useYear must be used inside YearProvider');
  return ctx;
}
