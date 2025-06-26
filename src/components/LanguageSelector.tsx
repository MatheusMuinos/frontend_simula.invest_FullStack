import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor="language">Idioma: </label>
      <select id="language" value={language} onChange={handleChange}>
        <option value="pt">Português</option>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
};
