import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';

import Chatbot from './Chatbot';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="w-full max-w-[1920px] mx-auto bg-white shadow-2xl min-h-screen flex flex-col relative">
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <main className="flex-grow">
                    {children}
                </main>
                <Chatbot />
                <Footer />
            </div>
        </div>
    );
};

export default Layout;
