import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';

import Chatbot from './Chatbot';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar (Fixed/Sticky on Desktop, Absolute on Mobile) */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-h-screen relative w-full transition-all duration-300">
                {/* Navbar */}
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Page Content */}
                <main className="flex-grow p-4 md:p-6 lg:p-8">
                    {children}
                </main>
                <Chatbot />
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
