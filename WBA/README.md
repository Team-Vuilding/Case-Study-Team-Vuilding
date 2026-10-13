# React + Vite

## Project scope

Before changing product pages, navigation, or role permissions, read the shared [WBA System Scope and Access Model](../docs/PROJECT_SCOPE.md). It is the collaboration reference for the required modules and RBAC boundaries.

## Backend connection

The workspace uses the Laravel API in ../Backend and its SQLite database. Run php artisan migrate and php artisan wba:create-admin from that directory, then start it with php artisan serve. Start the frontend with npm run dev; Vite proxies /api to http://127.0.0.1:8000.

For separate production hosts, set VITE_API_BASE_URL=https://your-api-domain/api in the frontend build environment and FRONTEND_URL=https://your-frontend-domain in Laravel. The free deployment uses Supabase PostgreSQL with Laravel on Render; follow the [deployment guide](../Backend/README.md). SQLite remains available locally and requires persistent storage if hosted. API sessions expire after 12 hours, and credentials are verified by the server. Operational data is never seeded with sample inventory.

## Help Center

General help is a standalone public page at `#/help`, linked from the home page's
navigation and footer. It covers WBA's purpose, account access, inventory terms,
and general support without requiring a working backend session.

Inside a signed-in workspace, `#/help-center` shows only the assigned role's task
guides: Admin management and oversight, Warehouse stock operations, Purchasing
supplier orders, or Sales product enquiries. Users can open general help and
return to their own guides. Both help pages link to the public Contact Support
form at `#/contact`.

Contact Support sends directly from the browser through Web3Forms' free plan.
Set `VITE_WEB3FORMS_ACCESS_KEY` to your form access key in `WBA/.env.local` and
restart Vite. For production, add the same variable in Vercel's frontend build
environment before deploying. The key identifies the recipient configured in
Web3Forms and is intentionally available to the browser. Gmail OAuth settings
are not needed for this form. Existing Laravel support endpoints retain their
Gmail integration for API clients.

The form shares only the supplied name, reply email, category, subject, message,
and a reference with Web3Forms. Contact details are self-reported. It does not
send a workspace token or account role. A success notice means Web3Forms accepted
the submission; it does not confirm inbox delivery or a support reply. Failed or
uncertain submissions keep the form values and are not retried automatically.
The free plan allows 250 submissions per month; its spam controls and quotas
apply. Manage submission retention in Web3Forms.

## ngrok

Set `NGROK_HOST=your-tunnel.ngrok-free.dev` in `WBA/.env.local` using your exact tunnel hostname, then restart `npm run dev`. Keep `VITE_API_BASE_URL=/api` and run `ngrok http http://localhost:5173`. The tunnel serves the frontend and proxies API requests to Laravel on port 8000. If your tunnel hostname changes, update `NGROK_HOST` and restart Vite.
