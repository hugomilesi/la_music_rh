react-dom.development.js:29895 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
AuthContext.tsx:260 🔍 AuthContext: useEffect triggered - initialized: false session: false user: false profile: false
AuthContext.tsx:278 🔍 AuthContext: Setting up auth listener
AuthContext.tsx:334 🔍 AuthContext: On protected route, checking existing session
AuthContext.tsx:283 🔍 AuthContext: Auth state change event: SIGNED_IN session: true
AuthContext.tsx:299 🔍 AuthContext: SIGNED_IN event triggered for user: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:260 🔍 AuthContext: useEffect triggered - initialized: true session: true user: true profile: false
AuthContext.tsx:264 🔍 AuthContext: Already initialized, skipping
AuthContext.tsx:337 🔍 AuthContext: Existing session check result: true
AuthContext.tsx:342 🔍 AuthContext: Found existing session for user: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:305 🔍 AuthContext: Calling fetchProfile for SIGNED_IN user: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:124 🔍 AuthContext: fetchProfile called for userId: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:129 🔍 AuthContext: Attempting to fetch profile with normal client...
AuthContext.tsx:344 🔍 AuthContext: Calling fetchProfile for existing session user: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:124 🔍 AuthContext: fetchProfile called for userId: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:129 🔍 AuthContext: Attempting to fetch profile with normal client...
AuthContext.tsx:138 🔍 AuthContext: Normal client result - data: true error: null
AuthContext.tsx:153 ✅ AuthContext: Profile fetched successfully: Object
AuthContext.tsx:154 🔍 AuthContext: Setting profile state...
AuthContext.tsx:157 🔍 AuthContext: Storing in sessionStorage...
AuthContext.tsx:161 🔍 AuthContext: Dispatching profile-loaded event...
AuthContext.tsx:167 ✅ AuthContext: fetchProfile completed successfully
RealtimeClient.ts:259  WebSocket connection to 'wss://jrphwjkgepmgdgiqebyr.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycGh3amtnZXBtZ2RnaXFlYnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzE0NDAsImV4cCI6MjA3MzgwNzQ0MH0.KPahOWtolr8wSQc81D0dl23t3lNvS6RpSt_eQFa2SRs&eventsPerSecond=10&vsn=1.0.0' failed: WebSocket is closed before the connection is established.
disconnect @ RealtimeClient.ts:259
removeChannel @ RealtimeClient.ts:288
AuthContext.tsx:138 🔍 AuthContext: Normal client result - data: true error: null
AuthContext.tsx:153 ✅ AuthContext: Profile fetched successfully: Object
AuthContext.tsx:154 🔍 AuthContext: Setting profile state...
AuthContext.tsx:157 🔍 AuthContext: Storing in sessionStorage...
AuthContext.tsx:161 🔍 AuthContext: Dispatching profile-loaded event...
AuthContext.tsx:167 ✅ AuthContext: fetchProfile completed successfully
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 4cc60747-3272-41e6-9096-be7695800f5f
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 2c59ad7e-6152-479b-a402-d8ccd95d6bfd
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 0d1e7a60-1d5e-4ff5-b6e9-0fcf4c470ae4
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 702b3047-aec1-4e96-8fe0-b44e9a014dc9
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
benefitDocumentService.ts:112 🔍 Found files: 0
benefitDocumentService.ts:187 ✅ Documents processed: 0
benefitDocumentService.ts:112 🔍 Found files: 0
benefitDocumentService.ts:187 ✅ Documents processed: 0
benefitDocumentService.ts:112 🔍 Found files: 0
benefitDocumentService.ts:187 ✅ Documents processed: 0
benefitDocumentService.ts:112 🔍 Found files: 1
benefitDocumentService.ts:187 ✅ Documents processed: 1
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:148 === DEBUG: Dados recebidos no createScheduleEvent ===
scheduleService.ts:149 eventData: {
  "title": "aaaaa",
  "employeeId": "94c2f521-fc2a-4aa6-87d9-99f16fb43798",
  "unit": "campo-grande",
  "date": "2025-10-07",
  "startTime": "11:45",
  "endTime": "14:45",
  "type": "reminder",
  "description": "aaa",
  "location": "Barra",
  "emailAlert": false,
  "whatsappAlert": false
}
scheduleService.ts:155 === DEBUG: Timestamps calculados ===
scheduleService.ts:156 startDateTime: 2025-10-07T14:45:00.000Z
scheduleService.ts:157 endDateTime: 2025-10-07T17:45:00.000Z
scheduleService.ts:171 === DEBUG: Dados que serão inseridos ===
scheduleService.ts:172 insertData: {
  "title": "aaaaa",
  "user_id": "94c2f521-fc2a-4aa6-87d9-99f16fb43798",
  "unit": "campo-grande",
  "start_date": "2025-10-07T14:45:00.000Z",
  "end_date": "2025-10-07T17:45:00.000Z",
  "event_type": "reminder",
  "description": "aaa",
  "location": "Barra",
  "status": "scheduled"
}
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
scheduleService.ts:30 Object
EventDetailsModal.tsx:201  Uncaught ReferenceError: FileText is not defined
    at EventDetailsModal (EventDetailsModal.tsx:201:20)
    at renderWithHooks (react-dom.development.js:15486:18)
    at updateFunctionComponent (react-dom.development.js:19617:20)
    at beginWork (react-dom.development.js:21640:16)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at beginWork$1 (react-dom.development.js:27490:7)
    at performUnitOfWork (react-dom.development.js:26596:12)
    at workLoopSync (react-dom.development.js:26505:5)
EventDetailsModal.tsx:201  Uncaught ReferenceError: FileText is not defined
    at EventDetailsModal (EventDetailsModal.tsx:201:20)
    at renderWithHooks (react-dom.development.js:15486:18)
    at updateFunctionComponent (react-dom.development.js:19617:20)
    at beginWork (react-dom.development.js:21640:16)
    at HTMLUnknownElement.callCallback2 (react-dom.development.js:4164:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:4213:16)
    at invokeGuardedCallback (react-dom.development.js:4277:31)
    at beginWork$1 (react-dom.development.js:27490:7)
    at performUnitOfWork (react-dom.development.js:26596:12)
    at workLoopSync (react-dom.development.js:26505:5)
errorHandler.ts:67  The above error occurred in the <EventDetailsModal> component:

    at EventDetailsModal (http://localhost:8080/src/components/schedule/EventDetailsModal.tsx:17:30)
    at div
    at Provider (http://localhost:8080/node_modules/.vite/deps/chunk-H4NVOOIT.js?v=fafdb7ad:38:15)
    at TooltipProvider (http://localhost:8080/node_modules/.vite/deps/@radix-ui_react-tooltip.js?v=fafdb7ad:63:5)
    at SchedulePage (http://localhost:8080/src/pages/SchedulePage.tsx?t=1759847990313:35:43)
    at div
    at MotionDOMComponent (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=fafdb7ad:5337:40)
    at PresenceChild (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=fafdb7ad:4312:24)
    at AnimatePresence (http://localhost:8080/node_modules/.vite/deps/framer-motion.js?v=fafdb7ad:4391:26)
    at PageTransition (http://localhost:8080/src/components/layout/PageTransition.tsx:36:27)
    at div
    at main
    at div
    at div
    at MainLayout (http://localhost:8080/src/components/layout/MainLayout.tsx:17:30)
    at WhatsAppProvider (http://localhost:8080/src/contexts/WhatsAppContext.tsx:86:36)
    at NotificationProvider (http://localhost:8080/src/contexts/NotificationContext.tsx:59:40)
    at ErrorBoundary (http://localhost:8080/src/components/common/ErrorBoundary.tsx:152:5)
    at IncidentsProvider (http://localhost:8080/src/contexts/IncidentsContext.tsx:16:37)
    at NPSProvider (http://localhost:8080/src/contexts/NPSContext.tsx:25:31)
    at ScheduleProvider (http://localhost:8080/src/contexts/ScheduleContext.tsx?t=1759847990313:16:36)
    at BenefitsProvider (http://localhost:8080/src/contexts/BenefitsContext.tsx:15:36)
    at EvaluationProvider (http://localhost:8080/src/contexts/EvaluationContext.tsx:15:38)
    at VacationProvider (http://localhost:8080/src/contexts/VacationContext.tsx:15:36)
    at DocumentProvider (http://localhost:8080/src/contexts/DocumentContext.tsx:26:36)
    at ColaboradorProvider (http://localhost:8080/src/contexts/ColaboradorContext.tsx:16:39)
    at EmployeeProvider (http://localhost:8080/src/contexts/EmployeeContext.tsx:15:36)
    at UnitProvider (http://localhost:8080/src/contexts/UnitContext.tsx:14:32)
    at http://localhost:8080/src/components/auth/ProtectedPageRoute.tsx:22:74
    at ProtectedRoute (http://localhost:8080/src/components/auth/ProtectedRoute.tsx:14:34)
    at ProtectedPageWrapper (http://localhost:8080/src/App.tsx?t=1759847990313:99:33)
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=fafdb7ad:4069:5)
    at Routes (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=fafdb7ad:4508:5)
    at AuthProvider (http://localhost:8080/src/contexts/AuthContext.tsx:55:32)
    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=fafdb7ad:4069:5)
    at Routes (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=fafdb7ad:4508:5)
    at Router (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=fafdb7ad:4451:15)
    at BrowserRouter (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=fafdb7ad:5196:5)
    at App (http://localhost:8080/src/App.tsx?t=1759847990313:287:5)

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
console.error @ errorHandler.ts:67
