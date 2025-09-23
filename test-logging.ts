import { 
  logAuth, 
  logDatabase, 
  logForm, 
  logNavigation, 
  logComponent, 
  logException,
  measurePerformance 
} from './lib/logger'

// Example usage and testing of the comprehensive logging system

console.log('=== Testing HR Portal Logging System ===\n')

// 1. Authentication logging examples
console.log('1. Authentication Events:')
logAuth("user_login_attempt", { email: "test@example.com" })
logAuth("user_login_success", { email: "test@example.com", userId: "user-123" }, "user-123")
logAuth("password_reset_requested", { email: "test@example.com" })

// 2. Database operation logging examples  
console.log('\n2. Database Operations:')
logDatabase("select", "users", { query: "SELECT * FROM users WHERE active = true" }, "user-123")
logDatabase("insert", "leave_requests", { 
  employee_id: "user-123", 
  leave_type: "vacation", 
  start_date: "2024-01-15",
  end_date: "2024-01-20"
}, "user-123")
logDatabase("update", "profiles", { field: "last_login", value: new Date().toISOString() }, "user-123")

// 3. Form submission logging examples
console.log('\n3. Form Interactions:')
logForm("leave_request_submitted", "LeaveRequestForm", {
  leave_type: "sick",
  start_date: "2024-01-15",
  reason: "Medical appointment"
}, "user-123")
logForm("profile_updated", "ProfileEditForm", {
  first_name: "John",
  last_name: "Doe",
  department: "Engineering"
}, "user-123")

// 4. Navigation logging examples
console.log('\n4. Navigation Events:')
logNavigation("page_navigation", "/dashboard", "/profile", "user-123")
logNavigation("redirect_after_login", "/auth/login", "/dashboard", "user-123")
logNavigation("external_link_clicked", "/dashboard", "https://company-policies.com")

// 5. Component interaction logging examples
console.log('\n5. Component Interactions:')
logComponent("DashboardSidebar", "menu_item_clicked", { menuItem: "Leave Requests" }, "user-123")
logComponent("HeaderComponent", "logout_clicked", { sessionDuration: "2h 30m" }, "user-123")
logComponent("LeaveRequestTable", "row_selected", { requestId: "req-456" }, "user-123")

// 6. Exception logging examples
console.log('\n6. Exception Handling:')
try {
  throw new Error("Simulated database connection error")
} catch (error) {
  logException(error as Error, {
    component: "DatabaseService",
    action: "fetch_user_profile",
    payload: { userId: "user-123" },
    userId: "user-123"
  })
}

// 7. Performance measurement example
console.log('\n7. Performance Measurement:')
measurePerformance(
  "simulate_complex_operation",
  async () => {
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 100))
    return { result: "success", recordsProcessed: 150 }
  },
  { operation: "bulk_data_sync", table: "employee_records" }
).then(result => {
  console.log('Operation completed:', result)
})

console.log('\n=== Logging Test Complete ===')
console.log('Check the console output above to see the structured logs.')
console.log('Each log entry includes:')
console.log('- Timestamp')
console.log('- Log level (INFO, ERROR, etc.)')
console.log('- Component context')
console.log('- Action performed')
console.log('- Relevant payload data')
console.log('- User ID (when applicable)')