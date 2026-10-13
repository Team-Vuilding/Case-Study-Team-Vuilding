Footer resources
================

Public routes: #/privacy, #/terms, #/help, and #/contact. React Router's
HashRouter preserves the existing static-hosting URL structure. Workspace
and login navigation continues through the existing application state.

All four pages are readable without signing in or waiting for the backend.
Styles reuse the light/dark CSS variables in src/index.css.

Contact Support is the only support submission screen. Public and workspace
Help Centers link to it; direct email links and the separate ticket form
have been removed. The form posts to /api/support/contact without requiring
sign-in. The endpoint validates contact details and consent, limits requests
to five per hour per IP, and uses the existing backend delivery service.
Success is shown only after delivery confirmation; failures retain the form.
Backend Gmail credentials must be configured for delivery.

The legal copy is starter product content. The service owner should verify
it against actual processing, retention, contracts, and applicable policies
before publication. It does not introduce analytics or billing functionality.

Validation: npm test, npm run lint, npm run build. Footer regressions use
MemoryRouter for direct-route rendering, including saved-session cases.
