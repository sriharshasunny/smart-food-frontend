import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Sidebar from './Sidebar';



const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="h-screen overflow-hidden flex bg-gray-50">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content Wrapper - scrollable, navbar is sticky inside */}
            <div className="flex-1 flex flex-col min-h-screen overflow-y-auto w-full transition-all duration-300">
                {/* Navbar sticks to the top of this scrollable container */}
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Page Content */}
                <main className="flex-grow p-4 md:p-6 lg:p-8">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
};

export default Layout;
