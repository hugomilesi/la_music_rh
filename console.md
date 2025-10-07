chunk-3IHV7RO6.js?v=fafdb7ad:21551 Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
AuthContext.tsx:260 🔍 AuthContext: useEffect triggered - initialized: false session: false user: false profile: false
AuthContext.tsx:278 🔍 AuthContext: Setting up auth listener
AuthContext.tsx:334 🔍 AuthContext: On protected route, checking existing session
AuthContext.tsx:283 🔍 AuthContext: Auth state change event: SIGNED_IN session: true
AuthContext.tsx:299 🔍 AuthContext: SIGNED_IN event triggered for user: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:260 🔍 AuthContext: useEffect triggered - initialized: true session: true user: true profile: false
AuthContext.tsx:264 🔍 AuthContext: Already initialized, skipping
AuthContext.tsx:305 🔍 AuthContext: Calling fetchProfile for SIGNED_IN user: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:124 🔍 AuthContext: fetchProfile called for userId: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:129 🔍 AuthContext: Attempting to fetch profile with normal client...
beneficios:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
AuthContext.tsx:337 🔍 AuthContext: Existing session check result: true
AuthContext.tsx:342 🔍 AuthContext: Found existing session for user: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:344 🔍 AuthContext: Calling fetchProfile for existing session user: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:124 🔍 AuthContext: fetchProfile called for userId: 7a304320-570b-4bb8-be4b-29197ab15d2c
AuthContext.tsx:129 🔍 AuthContext: Attempting to fetch profile with normal client...
AuthContext.tsx:138 🔍 AuthContext: Normal client result - data: true error: null
AuthContext.tsx:153 ✅ AuthContext: Profile fetched successfully: {id: 'c9022a31-b2dd-40db-8bf6-0240621d023a', auth_user_id: '7a304320-570b-4bb8-be4b-29197ab15d2c', username: 'admin', email: 'admin@gmail.com', is_active: true, …}
AuthContext.tsx:154 🔍 AuthContext: Setting profile state...
AuthContext.tsx:157 🔍 AuthContext: Storing in sessionStorage...
AuthContext.tsx:161 🔍 AuthContext: Dispatching profile-loaded event...
AuthContext.tsx:167 ✅ AuthContext: fetchProfile completed successfully
incidentService.ts:615 WebSocket connection to 'wss://jrphwjkgepmgdgiqebyr.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycGh3amtnZXBtZ2RnaXFlYnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzE0NDAsImV4cCI6MjA3MzgwNzQ0MH0.KPahOWtolr8wSQc81D0dl23t3lNvS6RpSt_eQFa2SRs&eventsPerSecond=10&vsn=1.0.0' failed: WebSocket is closed before the connection is established.
disconnect @ @supabase_supabase-js.js?v=fafdb7ad:2646
removeChannel @ @supabase_supabase-js.js?v=fafdb7ad:2668
await in removeChannel
removeChannel @ @supabase_supabase-js.js?v=fafdb7ad:7317
(anonymous) @ incidentService.ts:615
forceCleanupChannels @ incidentService.ts:610
(anonymous) @ incidentService.ts:589
setTimeout
forceCleanup @ incidentService.ts:588
initializeSubscription @ IncidentsContext.tsx:86
(anonymous) @ IncidentsContext.tsx:120
commitHookEffectListMount @ chunk-3IHV7RO6.js?v=fafdb7ad:16915
commitPassiveMountOnFiber @ chunk-3IHV7RO6.js?v=fafdb7ad:18156
commitPassiveMountEffects_complete @ chunk-3IHV7RO6.js?v=fafdb7ad:18129
commitPassiveMountEffects_begin @ chunk-3IHV7RO6.js?v=fafdb7ad:18119
commitPassiveMountEffects @ chunk-3IHV7RO6.js?v=fafdb7ad:18109
flushPassiveEffectsImpl @ chunk-3IHV7RO6.js?v=fafdb7ad:19490
flushPassiveEffects @ chunk-3IHV7RO6.js?v=fafdb7ad:19447
performSyncWorkOnRoot @ chunk-3IHV7RO6.js?v=fafdb7ad:18868
flushSyncCallbacks @ chunk-3IHV7RO6.js?v=fafdb7ad:9119
commitRootImpl @ chunk-3IHV7RO6.js?v=fafdb7ad:19432
commitRoot @ chunk-3IHV7RO6.js?v=fafdb7ad:19277
finishConcurrentRender @ chunk-3IHV7RO6.js?v=fafdb7ad:18805
performConcurrentWorkOnRoot @ chunk-3IHV7RO6.js?v=fafdb7ad:18718
workLoop @ chunk-3IHV7RO6.js?v=fafdb7ad:197
flushWork @ chunk-3IHV7RO6.js?v=fafdb7ad:176
performWorkUntilDeadline @ chunk-3IHV7RO6.js?v=fafdb7ad:384
AuthContext.tsx:138 🔍 AuthContext: Normal client result - data: true error: null
AuthContext.tsx:153 ✅ AuthContext: Profile fetched successfully: {id: 'c9022a31-b2dd-40db-8bf6-0240621d023a', auth_user_id: '7a304320-570b-4bb8-be4b-29197ab15d2c', username: 'admin', email: 'admin@gmail.com', is_active: true, …}
AuthContext.tsx:154 🔍 AuthContext: Setting profile state...
AuthContext.tsx:157 🔍 AuthContext: Storing in sessionStorage...
AuthContext.tsx:161 🔍 AuthContext: Dispatching profile-loaded event...
AuthContext.tsx:167 ✅ AuthContext: fetchProfile completed successfully
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 4cc60747-3272-41e6-9096-be7695800f5f
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 2c59ad7e-6152-479b-a402-d8ccd95d6bfd
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 0d1e7a60-1d5e-4ff5-b6e9-0fcf4c470ae4
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 702b3047-aec1-4e96-8fe0-b44e9a014dc9
scheduleService.ts:30 {id: '4005b20a-70ba-4f36-a07e-18a80adfb204', title: 'evento novo', is_evaluation: false, is_removable_disabled: false, start_date: '2025-10-07T12:58:00+00:00', …}
scheduleService.ts:30 {id: '04d14ffb-f3a9-4d0f-9112-686f90a9b91e', title: 'teste', is_evaluation: false, is_removable_disabled: false, start_date: '2025-10-07T11:01:00+00:00', …}
scheduleService.ts:30 {id: 'eval_9b2dfd95-64ef-47db-8489-ef7e48290809', title: 'Coffee Connection', is_evaluation: true, is_removable_disabled: true, start_date: '2025-10-07T00:00:00+00:00', …}
scheduleService.ts:30 {id: 'eval_7dbf2c67-2ba8-440d-9c8a-df8572d10917', title: 'Coffee Connection', is_evaluation: true, is_removable_disabled: true, start_date: '2025-10-07T00:00:00+00:00', …}
scheduleService.ts:30 {id: 'eval_125c7a55-f2b6-472f-b9aa-ed5f39b7108c', title: 'Auto Avaliação', is_evaluation: true, is_removable_disabled: true, start_date: '2025-10-07T00:00:00+00:00', …}
scheduleService.ts:30 {id: 'eval_a2a9f55e-07cc-4d66-9959-0f2e065d199d', title: 'Auto Avaliação', is_evaluation: true, is_removable_disabled: true, start_date: '2025-10-06T00:00:00+00:00', …}
incidentService.ts:615 WebSocket connection to 'wss://jrphwjkgepmgdgiqebyr.supabase.co/realtime/v1/websocket?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpycGh3amtnZXBtZ2RnaXFlYnlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMzE0NDAsImV4cCI6MjA3MzgwNzQ0MH0.KPahOWtolr8wSQc81D0dl23t3lNvS6RpSt_eQFa2SRs&eventsPerSecond=10&vsn=1.0.0' failed: WebSocket is closed before the connection is established.
disconnect @ @supabase_supabase-js.js?v=fafdb7ad:2646
removeChannel @ @supabase_supabase-js.js?v=fafdb7ad:2668
await in removeChannel
removeChannel @ @supabase_supabase-js.js?v=fafdb7ad:7317
(anonymous) @ incidentService.ts:615
forceCleanupChannels @ incidentService.ts:610
subscribeToIncidents @ incidentService.ts:443
initializeSubscription @ IncidentsContext.tsx:103
await in initializeSubscription
(anonymous) @ IncidentsContext.tsx:120
commitHookEffectListMount @ chunk-3IHV7RO6.js?v=fafdb7ad:16915
commitPassiveMountOnFiber @ chunk-3IHV7RO6.js?v=fafdb7ad:18156
commitPassiveMountEffects_complete @ chunk-3IHV7RO6.js?v=fafdb7ad:18129
commitPassiveMountEffects_begin @ chunk-3IHV7RO6.js?v=fafdb7ad:18119
commitPassiveMountEffects @ chunk-3IHV7RO6.js?v=fafdb7ad:18109
flushPassiveEffectsImpl @ chunk-3IHV7RO6.js?v=fafdb7ad:19490
flushPassiveEffects @ chunk-3IHV7RO6.js?v=fafdb7ad:19447
performSyncWorkOnRoot @ chunk-3IHV7RO6.js?v=fafdb7ad:18868
flushSyncCallbacks @ chunk-3IHV7RO6.js?v=fafdb7ad:9119
commitRootImpl @ chunk-3IHV7RO6.js?v=fafdb7ad:19432
commitRoot @ chunk-3IHV7RO6.js?v=fafdb7ad:19277
finishConcurrentRender @ chunk-3IHV7RO6.js?v=fafdb7ad:18805
performConcurrentWorkOnRoot @ chunk-3IHV7RO6.js?v=fafdb7ad:18718
workLoop @ chunk-3IHV7RO6.js?v=fafdb7ad:197
flushWork @ chunk-3IHV7RO6.js?v=fafdb7ad:176
performWorkUntilDeadline @ chunk-3IHV7RO6.js?v=fafdb7ad:384
benefitDocumentService.ts:112 🔍 Found files: 1
benefitDocumentService.ts:187 ✅ Documents processed: 1
benefitDocumentService.ts:112 🔍 Found files: 0
benefitDocumentService.ts:187 ✅ Documents processed: 0
benefitDocumentService.ts:112 🔍 Found files: 0
benefitDocumentService.ts:187 ✅ Documents processed: 0
benefitDocumentService.ts:112 🔍 Found files: 0
benefitDocumentService.ts:187 ✅ Documents processed: 0
BenefitDetailsModal.tsx:69 Loading documents for benefit: 4cc60747-3272-41e6-9096-be7695800f5f
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 4cc60747-3272-41e6-9096-be7695800f5f
benefitDocumentService.ts:92 🔍 Getting documents for benefit: 4cc60747-3272-41e6-9096-be7695800f5f
chunk-W3M3RKNN.js?v=fafdb7ad:340 Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
(anonymous) @ chunk-W3M3RKNN.js?v=fafdb7ad:340
commitHookEffectListMount @ chunk-3IHV7RO6.js?v=fafdb7ad:16915
commitPassiveMountOnFiber @ chunk-3IHV7RO6.js?v=fafdb7ad:18156
commitPassiveMountEffects_complete @ chunk-3IHV7RO6.js?v=fafdb7ad:18129
commitPassiveMountEffects_begin @ chunk-3IHV7RO6.js?v=fafdb7ad:18119
commitPassiveMountEffects @ chunk-3IHV7RO6.js?v=fafdb7ad:18109
flushPassiveEffectsImpl @ chunk-3IHV7RO6.js?v=fafdb7ad:19490
flushPassiveEffects @ chunk-3IHV7RO6.js?v=fafdb7ad:19447
commitRootImpl @ chunk-3IHV7RO6.js?v=fafdb7ad:19416
commitRoot @ chunk-3IHV7RO6.js?v=fafdb7ad:19277
performSyncWorkOnRoot @ chunk-3IHV7RO6.js?v=fafdb7ad:18895
flushSyncCallbacks @ chunk-3IHV7RO6.js?v=fafdb7ad:9119
(anonymous) @ chunk-3IHV7RO6.js?v=fafdb7ad:18627
benefitDocumentService.ts:112 🔍 Found files: 1
benefitDocumentService.ts:187 ✅ Documents processed: 1
BenefitDetailsModal.tsx:73 Found documents: [{…}]
benefitDocumentService.ts:112 🔍 Found files: 1
benefitDocumentService.ts:187 ✅ Documents processed: 1
benefitDocumentService.ts:234 🗑️ Deletando documento: 1759841193330
benefitDocumentService.ts:240 🔍 Buscando arquivo no storage...
errorHandler.ts:67 ❌ Arquivo não encontrado no storage para ID: 1759841193330
console.error @ errorHandler.ts:67
deleteDocument @ benefitDocumentService.ts:261
await in deleteDocument
removeDocument @ EditBenefitDialog.tsx:125
onClick @ EditBenefitDialog.tsx:338
callCallback2 @ chunk-3IHV7RO6.js?v=fafdb7ad:3674
invokeGuardedCallbackDev @ chunk-3IHV7RO6.js?v=fafdb7ad:3699
invokeGuardedCallback @ chunk-3IHV7RO6.js?v=fafdb7ad:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-3IHV7RO6.js?v=fafdb7ad:3736
executeDispatch @ chunk-3IHV7RO6.js?v=fafdb7ad:7014
processDispatchQueueItemsInOrder @ chunk-3IHV7RO6.js?v=fafdb7ad:7034
processDispatchQueue @ chunk-3IHV7RO6.js?v=fafdb7ad:7043
dispatchEventsForPlugins @ chunk-3IHV7RO6.js?v=fafdb7ad:7051
(anonymous) @ chunk-3IHV7RO6.js?v=fafdb7ad:7174
batchedUpdates$1 @ chunk-3IHV7RO6.js?v=fafdb7ad:18913
batchedUpdates @ chunk-3IHV7RO6.js?v=fafdb7ad:3579
dispatchEventForPluginEventSystem @ chunk-3IHV7RO6.js?v=fafdb7ad:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-3IHV7RO6.js?v=fafdb7ad:5478
dispatchEvent @ chunk-3IHV7RO6.js?v=fafdb7ad:5472
dispatchDiscreteEvent @ chunk-3IHV7RO6.js?v=fafdb7ad:5449
errorHandler.ts:67 ❌ Erro geral ao deletar documento: Error: Documento não encontrado
    at Object.deleteDocument (benefitDocumentService.ts:262:17)
    at async removeDocument (EditBenefitDialog.tsx:125:9)
console.error @ errorHandler.ts:67
deleteDocument @ benefitDocumentService.ts:283
await in deleteDocument
removeDocument @ EditBenefitDialog.tsx:125
onClick @ EditBenefitDialog.tsx:338
callCallback2 @ chunk-3IHV7RO6.js?v=fafdb7ad:3674
invokeGuardedCallbackDev @ chunk-3IHV7RO6.js?v=fafdb7ad:3699
invokeGuardedCallback @ chunk-3IHV7RO6.js?v=fafdb7ad:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-3IHV7RO6.js?v=fafdb7ad:3736
executeDispatch @ chunk-3IHV7RO6.js?v=fafdb7ad:7014
processDispatchQueueItemsInOrder @ chunk-3IHV7RO6.js?v=fafdb7ad:7034
processDispatchQueue @ chunk-3IHV7RO6.js?v=fafdb7ad:7043
dispatchEventsForPlugins @ chunk-3IHV7RO6.js?v=fafdb7ad:7051
(anonymous) @ chunk-3IHV7RO6.js?v=fafdb7ad:7174
batchedUpdates$1 @ chunk-3IHV7RO6.js?v=fafdb7ad:18913
batchedUpdates @ chunk-3IHV7RO6.js?v=fafdb7ad:3579
dispatchEventForPluginEventSystem @ chunk-3IHV7RO6.js?v=fafdb7ad:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-3IHV7RO6.js?v=fafdb7ad:5478
dispatchEvent @ chunk-3IHV7RO6.js?v=fafdb7ad:5472
dispatchDiscreteEvent @ chunk-3IHV7RO6.js?v=fafdb7ad:5449
errorHandler.ts:67 Erro ao remover documento: Error: Documento não encontrado
    at Object.deleteDocument (benefitDocumentService.ts:262:17)
    at async removeDocument (EditBenefitDialog.tsx:125:9)
console.error @ errorHandler.ts:67
removeDocument @ EditBenefitDialog.tsx:139
await in removeDocument
onClick @ EditBenefitDialog.tsx:338
callCallback2 @ chunk-3IHV7RO6.js?v=fafdb7ad:3674
invokeGuardedCallbackDev @ chunk-3IHV7RO6.js?v=fafdb7ad:3699
invokeGuardedCallback @ chunk-3IHV7RO6.js?v=fafdb7ad:3733
invokeGuardedCallbackAndCatchFirstError @ chunk-3IHV7RO6.js?v=fafdb7ad:3736
executeDispatch @ chunk-3IHV7RO6.js?v=fafdb7ad:7014
processDispatchQueueItemsInOrder @ chunk-3IHV7RO6.js?v=fafdb7ad:7034
processDispatchQueue @ chunk-3IHV7RO6.js?v=fafdb7ad:7043
dispatchEventsForPlugins @ chunk-3IHV7RO6.js?v=fafdb7ad:7051
(anonymous) @ chunk-3IHV7RO6.js?v=fafdb7ad:7174
batchedUpdates$1 @ chunk-3IHV7RO6.js?v=fafdb7ad:18913
batchedUpdates @ chunk-3IHV7RO6.js?v=fafdb7ad:3579
dispatchEventForPluginEventSystem @ chunk-3IHV7RO6.js?v=fafdb7ad:7173
dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay @ chunk-3IHV7RO6.js?v=fafdb7ad:5478
dispatchEvent @ chunk-3IHV7RO6.js?v=fafdb7ad:5472
dispatchDiscreteEvent @ chunk-3IHV7RO6.js?v=fafdb7ad:5449
beneficios:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
beneficios:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
