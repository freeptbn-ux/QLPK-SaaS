'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface Settings {
  clinic_name: string;
  clinic_address?: string;
  clinic_phone?: string;
  consultation_fee?: string;
  [key: string]: string | undefined;
}

interface SettingsContextType {
  settings: Settings;
  clinic_name: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ 
  children, 
  initialSettings 
}: { 
  children: ReactNode; 
  initialSettings: Record<string, string>;
}) {
  const settings: Settings = {
    clinic_name: initialSettings.clinic_name || 'QLPK SaaS',
    ...initialSettings,
  };

  return (
    <SettingsContext.Provider value={{ settings, clinic_name: settings.clinic_name }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
