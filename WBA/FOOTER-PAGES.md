Footer resources
================

Public routes: #/privacy, #/terms, #/help, and #/contact. React Router's
HashRouter preserves the existing static-hosting URL structure. Workspace
and login navigation continues through the existing application state.

All four pages are readable without signing in or waiting for the backend.
Styles reuse the light/dark CSS variables in src/index.css.

Contact Support prepares a mailto draft addressed to the existing support
inbox. Users must send the draft in their email client; opening the draft
is not a delivery confirmation. Authenticated API support tickets remain
available in the workspace Help Center. No live-chat provider is configured.

The legal copy is starter product content. The service owner should verify
it against actual processing, retention, contracts, and applicable policies
before publication. It does not introduce analytics or billing functionality.

Validation: npm test, npm run lint, npm run build. Footer regressions use
MemoryRouter for direct-route rendering, including saved-session cases.
