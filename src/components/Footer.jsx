import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold text-white mb-4">SmartFood</h3>
                        <p className="text-gray-400 max-w-sm">
                            AI-powered food delivery platform connecting you with the best restaurants and personalized recommendations.
                        </p>
                        <div className="mt-6 flex gap-2">
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">Student Project</span>
                            <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">AI Demo</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Restaurants</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Get Help</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Technology</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                                React & Tailwind
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                AI Recommender
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Smart Chatbot
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                    <p>© 2024 SmartFood Delivery Project. Created for Academic Demonstration.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
