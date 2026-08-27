// frontend/src/components/common/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const isDevelopment = process.env.NODE_ENV === 'development';
            
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4">😅</div>
                            <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
                            <p className="text-gray-500 mt-2">Please try refreshing the page.</p>
                            
                            {/* 👇 Show detailed error in development */}
                            {isDevelopment && this.state.error && (
                                <div className="mt-4 p-4 bg-red-50 rounded-xl text-left">
                                    <p className="text-sm font-bold text-red-700">Error Details:</p>
                                    <p className="text-sm text-red-600 mt-1">{this.state.error.toString()}</p>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="text-sm text-gray-500 cursor-pointer">Stack Trace</summary>
                                            <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-60">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}
                            
                            <div className="flex justify-center gap-4 mt-6">
                                <button
                                    onClick={this.handleReset}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
                                >
                                    Refresh Page
                                </button>
                                {isDevelopment && (
                                    <button
                                        onClick={() => {
                                            this.setState({ hasError: false, error: null, errorInfo: null });
                                        }}
                                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition"
                                    >
                                        Dismiss
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;