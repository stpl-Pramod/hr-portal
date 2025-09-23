/**
 * Centralized logging utility for HR Portal
 * Provides structured logging with different levels and payload tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  userId?: string
  sessionId?: string
  component?: string
  action?: string
  payload?: any
  metadata?: Record<string, any>
  timestamp?: string
}

export interface LogEntry {
  level: LogLevel
  message: string
  context: LogContext
  timestamp: string
  userAgent?: string
  url?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isClient = typeof window !== 'undefined'
  
  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private getContext(): Pick<LogEntry, 'userAgent' | 'url'> {
    if (!this.isClient) {
      return {}
    }
    
    return {
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext = {}
  ): LogEntry {
    return {
      level,
      message,
      context: {
        ...context,
        timestamp: context.timestamp || this.formatTimestamp()
      },
      timestamp: this.formatTimestamp(),
      ...this.getContext()
    }
  }

  private formatPayload(payload: any): any {
    if (!payload) return null

    // Sanitize sensitive data
    if (typeof payload === 'object') {
      const sanitized = { ...payload }
      
      // Remove sensitive fields
      const sensitiveFields = [
        'password', 'confirmPassword', 'currentPassword', 'newPassword',
        'token', 'apiKey', 'secret', 'key', 'authorization'
      ]
      
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]'
        }
      })

      // Truncate large strings
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
          sanitized[key] = sanitized[key].substring(0, 1000) + '...[TRUNCATED]'
        }
      })

      return sanitized
    }

    return payload
  }

  private output(entry: LogEntry): void {
    const formattedEntry = {
      ...entry,
      context: {
        ...entry.context,
        payload: this.formatPayload(entry.context.payload)
      }
    }

    // Console output with colors in development
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[36m', // cyan
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m'  // red
      }
      const reset = '\x1b[0m'
      const color = colors[entry.level] || ''
      
      console.log(
        `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
        formattedEntry.context
      )
    }

    // In production, you could send to external logging service
    // Example: send to Sentry, LogRocket, DataDog, etc.
    if (!this.isDevelopment) {
      // TODO: Send to external logging service
      console.log(JSON.stringify(formattedEntry))
    }
  }

  debug(message: string, context?: LogContext): void {
    this.output(this.createLogEntry('debug', message, context))
  }

  info(message: string, context?: LogContext): void {
    this.output(this.createLogEntry('info', message, context))
  }

  warn(message: string, context?: LogContext): void {
    this.output(this.createLogEntry('warn', message, context))
  }

  error(message: string, context?: LogContext): void {
    this.output(this.createLogEntry('error', message, context))
  }

  // Specific logging methods for common actions
  auth(action: string, payload?: any, userId?: string): void {
    this.info(`Auth: ${action}`, {
      component: 'Authentication',
      action,
      payload,
      userId
    })
  }

  database(action: string, table?: string, payload?: any, userId?: string): void {
    this.info(`Database: ${action}`, {
      component: 'Database',
      action,
      payload,
      userId,
      metadata: { table }
    })
  }

  form(action: string, formName: string, payload?: any, userId?: string): void {
    this.info(`Form: ${action}`, {
      component: 'Form',
      action,
      payload,
      userId,
      metadata: { formName }
    })
  }

  navigation(action: string, from?: string, to?: string, userId?: string): void {
    this.info(`Navigation: ${action}`, {
      component: 'Navigation',
      action,
      userId,
      metadata: { from, to }
    })
  }

  component(component: string, action: string, payload?: any, userId?: string): void {
    this.info(`Component: ${component} - ${action}`, {
      component,
      action,
      payload,
      userId
    })
  }

  api(method: string, endpoint: string, payload?: any, response?: any, userId?: string): void {
    this.info(`API: ${method} ${endpoint}`, {
      component: 'API',
      action: `${method} ${endpoint}`,
      payload,
      userId,
      metadata: { response }
    })
  }

  middleware(action: string, path: string, payload?: any): void {
    this.info(`Middleware: ${action}`, {
      component: 'Middleware',
      action,
      payload,
      metadata: { path }
    })
  }

  // Performance logging
  performance(action: string, duration: number, metadata?: Record<string, any>): void {
    this.info(`Performance: ${action} (${duration}ms)`, {
      component: 'Performance',
      action,
      metadata: { ...metadata, duration }
    })
  }

  // Error logging with stack trace
  exception(error: Error, context?: LogContext): void {
    this.error(`Exception: ${error.message}`, {
      ...context,
      component: context?.component || 'Exception',
      action: 'error_thrown',
      payload: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    })
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience functions for common use cases
export const logAuth = (action: string, payload?: any, userId?: string) => 
  logger.auth(action, payload, userId)

export const logDatabase = (action: string, table?: string, payload?: any, userId?: string) => 
  logger.database(action, table, payload, userId)

export const logForm = (action: string, formName: string, payload?: any, userId?: string) => 
  logger.form(action, formName, payload, userId)

export const logNavigation = (action: string, from?: string, to?: string, userId?: string) => 
  logger.navigation(action, from, to, userId)

export const logComponent = (component: string, action: string, payload?: any, userId?: string) => 
  logger.component(component, action, payload, userId)

export const logAPI = (method: string, endpoint: string, payload?: any, response?: any, userId?: string) => 
  logger.api(method, endpoint, payload, response, userId)

export const logMiddleware = (action: string, path: string, payload?: any) => 
  logger.middleware(action, path, payload)

export const logPerformance = (action: string, duration: number, metadata?: Record<string, any>) => 
  logger.performance(action, duration, metadata)

export const logException = (error: Error, context?: LogContext) => 
  logger.exception(error, context)

// Performance measurement utility
export const measurePerformance = async <T>(
  action: string,
  fn: () => Promise<T> | T,
  metadata?: Record<string, any>
): Promise<T> => {
  const start = performance.now()
  try {
    const result = await fn()
    const duration = performance.now() - start
    logPerformance(action, duration, metadata)
    return result
  } catch (error) {
    const duration = performance.now() - start
    logPerformance(`${action}_failed`, duration, { ...metadata, error: error instanceof Error ? error.message : error })
    throw error
  }
}

export default logger