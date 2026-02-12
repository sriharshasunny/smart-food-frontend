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
            return null;
        }

        return this.props.children;
    }
}

export default ChatErrorBoundary;
