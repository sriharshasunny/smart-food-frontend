import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Theme: 'light' | 'dark'
    const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');

    // FontSize: 'small' | 'medium' | 'large'
    const [fontSize, setFontSize] = useState(localStorage.getItem('app-font-size') || 'medium');

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old classes
        root.classList.remove('dark', 'text-sm', 'text-base', 'text-lg');

        // Apply Theme
        if (theme === 'dark') {
            root.classList.add('dark');
        }

        // Apply Font Size
        if (fontSize === 'small') root.classList.add('text-sm');
        if (fontSize === 'medium') root.classList.add('text-base');
        if (fontSize === 'large') root.classList.add('text-lg');

        // Persist
        localStorage.setItem('app-theme', theme);
        localStorage.setItem('app-font-size', fontSize);

    }, [theme, fontSize]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, fontSize, setFontSize }}>
            {children}
        </ThemeContext.Provider>
    );
};
