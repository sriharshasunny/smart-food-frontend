import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-100 rounded-full -translate-x-1/2 translate-y-1/2 opacity-50" />

                <div className="relative z-10">
                    <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={40} className="text-orange-500" />
                    </div>

                    <h1 className="text-6xl font-black text-gray-900 mb-2">404</h1>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Oops! The page you are looking for doesn't exist. It might have been moved or deleted.
                    </p>

                    <Link
                        to="/home"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 font-medium">
                Smart Food Delivery
            </p>
        </div>
    );
};

export default NotFound;
