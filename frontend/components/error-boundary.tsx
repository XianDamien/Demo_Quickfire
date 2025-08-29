'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback

      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} reset={this.reset} />
      }

      return (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">出现错误</h3>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || '发生未知错误'}
          </p>
          <button
            onClick={this.reset}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
