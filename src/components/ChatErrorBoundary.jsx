import React from 'react';

class ChatErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ChatWidget Crashed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render nothing or a minimal fallback so the app keeps working
            // Render a fallback UI so the user knows something broke
            return (
                <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center cursor-not-allowed" title="Chat Widget Crashed">
                    <span className="font-bold text-xl">!</span>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ChatErrorBoundary;
