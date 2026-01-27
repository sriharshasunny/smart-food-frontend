import React from 'react';
import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComingSoon = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                <Construction className="w-10 h-10 text-primary-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Coming Soon</h1>
            <p className="text-gray-500 mb-8 max-w-md">
                We are working hard to bring you this feature. Stay tuned for updates!
            </p>
            <Link
                to="/home"
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all"
            >
                Back to Home
            </Link>
        </div>
    );
};

export default ComingSoon;
