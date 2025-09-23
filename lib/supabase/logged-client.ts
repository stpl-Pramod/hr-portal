/**
 * Enhanced Supabase client with automatic logging for all database operations
 */

import { createBrowserClient } from '@supabase/ssr'
import { logDatabase, logException, measurePerformance } from '../logger'

// Type definitions for logging
interface QueryContext {
  table?: string
  operation: string
  filters?: any
  data?: any
  userId?: string
}

/**
 * Creates a Supabase client with enhanced logging capabilities
 */
export function createLoggedClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey.includes('replace-with-your-actual-key')) {
    throw new Error('Missing Supabase configuration')
  }

  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // Get current user for logging context
  const getCurrentUserId = async (): Promise<string | undefined> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user?.id
    } catch {
      return undefined
    }
  }

  // Wrapper for database operations with logging
  const loggedQuery = (originalQuery: any, context: QueryContext) => {
    const userId = context.userId

    // Proxy the query builder to log operations
    return new Proxy(originalQuery, {
      get(target, prop) {
        const originalMethod = target[prop]
        
        if (typeof originalMethod !== 'function') {
          return originalMethod
        }

        // Log specific operations
        if (['select', 'insert', 'update', 'delete', 'upsert'].includes(String(prop))) {
          return function(...args: any[]) {
            const operation = String(prop)
            logDatabase(`${operation}_start`, context.table, {
              operation,
              args: args.length > 0 ? args[0] : undefined,
              table: context.table,
              userId: context.userId
            }, userId)

            const result = originalMethod.apply(target, args)
            
            // If this returns a promise-like object, wrap the execution
            if (result && typeof result.then === 'function') {
              return measurePerformance(
                `database_${operation}_${context.table}`,
                () => result.then((data: any) => {
                  logDatabase(`${operation}_success`, context.table, {
                    operation,
                    resultCount: Array.isArray(data?.data) ? data.data.length : data?.data ? 1 : 0,
                    error: data?.error?.message
                  }, userId)
                  return data
                }).catch((error: any) => {
                  logDatabase(`${operation}_error`, context.table, {
                    operation,
                    error: error.message
                  }, userId)
                  logException(error, {
                    component: 'Database',
                    action: `${operation}_${context.table}`,
                    userId
                  })
                  throw error
                })
              )
            }

            return result
          }
        }

        // Log filter operations
        if (['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'contains'].includes(String(prop))) {
          return function(...args: any[]) {
            logDatabase(`filter_${String(prop)}`, context.table, {
              filter: String(prop),
              column: args[0],
              value: args[1]
            }, userId)
            return originalMethod.apply(target, args)
          }
        }

        // Log ordering and limiting
        if (['order', 'limit', 'range'].includes(String(prop))) {
          return function(...args: any[]) {
            logDatabase(`query_${String(prop)}`, context.table, {
              operation: String(prop),
              params: args
            }, userId)
            return originalMethod.apply(target, args)
          }
        }

        return originalMethod.bind(target)
      }
    })
  }

  // Create enhanced client with logging
  const enhancedClient = {
    ...supabase,
    
    from: (table: string) => {
      getCurrentUserId().then(userId => {
        logDatabase('table_access', table, { operation: 'from' }, userId)
      })
      
      const query = supabase.from(table)
      return loggedQuery(query, { table, operation: 'query' })
    },

    auth: {
      ...supabase.auth,
      
      signInWithPassword: async (credentials: any) => {
        logDatabase('auth_signin_attempt', 'auth.users', {
          operation: 'signInWithPassword',
          email: credentials.email
        })
        
        return measurePerformance(
          'auth_signin',
          () => supabase.auth.signInWithPassword(credentials).then(result => {
            if (result.error) {
              logDatabase('auth_signin_failed', 'auth.users', {
                operation: 'signInWithPassword',
                error: result.error.message,
                email: credentials.email
              })
            } else {
              logDatabase('auth_signin_success', 'auth.users', {
                operation: 'signInWithPassword',
                userId: result.data.user?.id,
                email: credentials.email
              }, result.data.user?.id)
            }
            return result
          })
        )
      },

      signUp: async (credentials: any) => {
        logDatabase('auth_signup_attempt', 'auth.users', {
          operation: 'signUp',
          email: credentials.email,
          userData: credentials.options?.data
        })
        
        return measurePerformance(
          'auth_signup',
          () => supabase.auth.signUp(credentials).then(result => {
            if (result.error) {
              logDatabase('auth_signup_failed', 'auth.users', {
                operation: 'signUp',
                error: result.error.message,
                email: credentials.email
              })
            } else {
              logDatabase('auth_signup_success', 'auth.users', {
                operation: 'signUp',
                userId: result.data.user?.id,
                email: credentials.email,
                emailConfirmed: !!result.data.user?.email_confirmed_at
              }, result.data.user?.id)
            }
            return result
          })
        )
      },

      signOut: async () => {
        const userId = await getCurrentUserId()
        logDatabase('auth_signout_attempt', 'auth.users', {
          operation: 'signOut'
        }, userId)
        
        return supabase.auth.signOut().then(result => {
          if (result.error) {
            logDatabase('auth_signout_failed', 'auth.users', {
              operation: 'signOut',
              error: result.error.message
            }, userId)
          } else {
            logDatabase('auth_signout_success', 'auth.users', {
              operation: 'signOut'
            }, userId)
          }
          return result
        })
      },

      verifyOtp: async (params: any) => {
        logDatabase('auth_verify_otp_attempt', 'auth.users', {
          operation: 'verifyOtp',
          email: params.email,
          type: params.type
        })
        
        return supabase.auth.verifyOtp(params).then(result => {
          if (result.error) {
            logDatabase('auth_verify_otp_failed', 'auth.users', {
              operation: 'verifyOtp',
              error: result.error.message,
              email: params.email
            })
          } else {
            logDatabase('auth_verify_otp_success', 'auth.users', {
              operation: 'verifyOtp',
              userId: result.data.user?.id,
              email: params.email
            }, result.data.user?.id)
          }
          return result
        })
      },

      updateUser: async (attributes: any) => {
        const userId = await getCurrentUserId()
        logDatabase('auth_update_user_attempt', 'auth.users', {
          operation: 'updateUser',
          attributes: Object.keys(attributes)
        }, userId)
        
        return supabase.auth.updateUser(attributes).then(result => {
          if (result.error) {
            logDatabase('auth_update_user_failed', 'auth.users', {
              operation: 'updateUser',
              error: result.error.message
            }, userId)
          } else {
            logDatabase('auth_update_user_success', 'auth.users', {
              operation: 'updateUser',
              userId: result.data.user?.id
            }, result.data.user?.id)
          }
          return result
        })
      },

      resend: async (params: any) => {
        logDatabase('auth_resend_attempt', 'auth.users', {
          operation: 'resend',
          type: params.type,
          email: params.email
        })
        
        return supabase.auth.resend(params).then(result => {
          if (result.error) {
            logDatabase('auth_resend_failed', 'auth.users', {
              operation: 'resend',
              error: result.error.message,
              email: params.email
            })
          } else {
            logDatabase('auth_resend_success', 'auth.users', {
              operation: 'resend',
              email: params.email
            })
          }
          return result
        })
      }
    }
  }

  return enhancedClient
}

export default createLoggedClient