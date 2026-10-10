import React, { createContext, useContext, useState, useEffect } from 'react';

const UIVersionContext = createContext();

export const UIVersionProvider = ({ children }) => {
  const [uiVersion, setUiVersion] = useState('classic');

  useEffect(() => {
    const savedVersion = localStorage.getItem('ui-version');
    if (savedVersion === 'classic' || savedVersion === 'modern') {
      setUiVersion(savedVersion);
    }
  }, []);

  const toggleUiVersion = () => {
    setUiVersion((prev) => {
      const newVersion = prev === 'classic' ? 'modern' : 'classic';
      localStorage.setItem('ui-version', newVersion);
      return newVersion;
    });
  };

  return (
    <UIVersionContext.Provider value={{ uiVersion, toggleUiVersion }}>
      {children}
    </UIVersionContext.Provider>
  );
};

export const useUIVersion = () => useContext(UIVersionContext);
