import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Type, LogOut, ChevronRight, User, Bell, Shield } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme, fontSize, setFontSize } = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Settings</h1>

            {/* Appearance Section */}
            <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-500 mb-4 px-2 uppercase tracking-wider text-xs">Appearance</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

                    {/* Dark Mode Toggle */}
                    <div className="p-4 sm:p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                {theme === 'dark' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Dark Mode</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Reduce eye strain at night</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`w-14 h-8 rounded-full transition-colors duration-300 relative ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-200'}`}
                        >
                            <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* Font Size Selector */}
                    <div className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                                <Type className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Text Size</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Adjust readability</p>
                            </div>
                        </div>
                        <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                            {['small', 'medium', 'large'].map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setFontSize(size)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${fontSize === size ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Account Section */}
            <section className="mb-8">
                <h2 className="text-lg font-bold text-gray-500 mb-4 px-2 uppercase tracking-wider text-xs">Account</h2>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <button className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                <User className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Edit Profile</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Name, Email, Address</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>

                    <button className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Log Out</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</p>
                            </div>
                        </div>
                        <div onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg text-sm hover:bg-red-100 cursor-pointer">
                            Log Out
                        </div>
                    </button>
                </div>
            </section>

            {/* General Info */}
            <div className="text-center mt-12 mb-8">
                <p className="text-xs text-gray-400 dark:text-gray-600 font-medium">SmartFood v1.2.0 • Made with ❤️ by AI</p>
            </div>
        </div>
    );
};

export default Settings;
