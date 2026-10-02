# React + Vite

## Project scope

Before changing product pages, navigation, or role permissions, read the shared [WBA System Scope and Access Model](../docs/PROJECT_SCOPE.md). It is the collaboration reference for the required modules and RBAC boundaries.

## Backend connection

The workspace uses the Laravel API in ../Backend and its SQLite database. Run php artisan migrate and php artisan wba:create-admin from that directory, then start it with php artisan serve. Start the frontend with npm run dev; Vite proxies /api to http://127.0.0.1:8000.

For separate production hosts, set VITE_API_BASE_URL=https://your-api-domain/api in the frontend build environment and FRONTEND_URL=https://your-frontend-domain in Laravel. Keep Laravel’s SQLite database on persistent storage. API sessions expire after 12 hours, and credentials are verified by the server. Operational data is never seeded with sample inventory.
