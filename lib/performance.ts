import React from 'react'

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private observers: Map<string, PerformanceObserver> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Monitor Core Web Vitals
  observeWebVitals() {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lcpEntry = entries[entries.length - 1]
      console.log('LCP:', lcpEntry.startTime)
    })

    // First Input Delay
    this.observeMetric('first-input', (entries) => {
      const fidEntry = entries[0]
      console.log('FID:', fidEntry.processingStart - fidEntry.startTime)
    })

    // Cumulative Layout Shift
    this.observeMetric('layout-shift', (entries) => {
      const clsValue = entries.reduce((sum, entry) => {
        if (!entry.hadRecentInput) {
          return sum + entry.value
        }
        return sum
      }, 0)
      console.log('CLS:', clsValue)
    })
  }

  private observeMetric(type: string, callback: (entries: any[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries())
      })
      observer.observe({ type, buffered: true })
      this.observers.set(type, observer)
    } catch (error) {
      console.warn(`Performance observer for ${type} not supported`)
    }
  }

  // Monitor component render time
  measureRender(componentName: string, renderFn: () => void) {
    const startTime = performance.now()
    renderFn()
    const endTime = performance.now()
    console.log(`${componentName} render time:`, endTime - startTime, 'ms')
  }

  // Monitor API call performance
  measureApiCall = async <T>(
    name: string, 
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now()
    try {
      const result = await apiCall()
      const endTime = performance.now()
      console.log(`API ${name}:`, endTime - startTime, 'ms')
      return result
    } catch (error) {
      const endTime = performance.now()
      console.log(`API ${name} (failed):`, endTime - startTime, 'ms')
      throw error
    }
  }

  // Memory usage monitoring
  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      }
    }
    return null
  }

  // Network information
  getNetworkInfo() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      }
    }
    return null
  }

  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()
  
  React.useEffect(() => {
    monitor.observeWebVitals()
    return () => monitor.disconnect()
  }, [monitor])

  return {
    measureRender: monitor.measureRender,
    measureApiCall: monitor.measureApiCall,
    getMemoryUsage: monitor.getMemoryUsage,
    getNetworkInfo: monitor.getNetworkInfo
  }
}

// Simple performance timing utility
export function measureComponentRender(componentName: string) {
  if (process.env.NODE_ENV !== 'development') return { start: () => {}, end: () => {} }
  
  let startTime: number
  
  return {
    start: () => {
      startTime = performance.now()
    },
    end: () => {
      const endTime = performance.now()
      console.log(`${componentName} render:`, endTime - startTime, 'ms')
    }
  }
}