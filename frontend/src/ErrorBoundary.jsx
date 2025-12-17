import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 flex items-center justify-center p-10 font-sans">
                    <div className="bg-white  shadow-xl p-8 max-w-4xl w-full border border-red-200">
                        <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong.</h1>
                        <p className="text-gray-700 mb-6 text-lg">The application encountered a critical error and could not render.</p>

                        <div className="bg-gray-100 p-4  overflow-auto max-h-96 border border-gray-300">
                            <h3 className="font-bold text-gray-800 mb-2 font-mono text-lg">Error: {this.state.error && this.state.error.toString()}</h3>
                            <details className="whitespace-pre-wrap text-sm font-mono text-gray-600">
                                <summary className="cursor-pointer text-green-600 hover:text-blue-800 mb-2">View Component Stack</summary>
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </details>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-green-600 text-white px-4 py-2  font-semibold hover:bg-green-700 shadow-lg transition-all"
                            >
                                Reload Application
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
