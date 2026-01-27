import React, { useEffect, useState } from 'react';
import { API_URL } from '../config';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const verifyPayment = async () => {
            const orderId = searchParams.get('order_id'); // From URL (set in Backend createPayment)
            // Dodo might pass session_id or we use the order_id we passed
            const paymentId = searchParams.get('payment_id') || searchParams.get('session_id');

            console.log("Verifying Payment - Params:", { orderId, paymentId });

            if (!orderId) {
                setErrorMessage("Missing Order ID in URL");
                setStatus('error');
                return;
            }

            try {
                // Call Backend to Verify & Send Email
                const res = await fetch(`${API_URL}/api/orders/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId, paymentId })
                });

                if (res.ok) {
                    setStatus('success');
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                } else {
                    const errorData = await res.json();
                    console.error("Verification failed:", errorData);
                    const detailedError = errorData.message + (errorData.error ? `: ${errorData.error}` : "");
                    setErrorMessage(detailedError || "Verification failed");
                    setStatus('error');
                }
            } catch (error) {
                console.error("Network error:", error);
                setErrorMessage(error.message || "Network error");
                setStatus('error');
            }
        };

        verifyPayment();
    }, []);

    return (
        <div className="h-screen w-screen bg-white flex items-center justify-center relative overflow-hidden">
            {/* Background Blob */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-50 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 text-center p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 max-w-md w-full">

                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="mb-4"
                        >
                            <Loader2 className="w-12 h-12 text-orange-500" />
                        </motion.div>
                        <h2 className="text-xl font-bold text-gray-800">Verifying Payment...</h2>
                        <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your order.</p>
                    </div>
                )}

                {status === 'success' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-500 mb-6">
                            We've sent a confirmation email with details.
                            <br />Your order is ready for delivery in 10 to 15 min!
                        </p>

                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => navigate('/home')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Order More
                            </button>
                            <button
                                onClick={() => navigate('/orders')}
                                className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/30"
                            >
                                Track Order
                            </button>
                        </div>
                    </motion.div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                            <span className="text-2xl font-bold">!</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
                        <p className="text-gray-500 text-sm mt-2 mb-6">
                            {errorMessage || "We couldn't verify your payment automatically."}
                        </p>
                        <button
                            onClick={() => navigate('/home')}
                            className="px-6 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800"
                        >
                            Go Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
