# WBA deployment: Supabase + Render + Vercel

The frontend in `WBA` calls this Laravel API. Production uses Supabase PostgreSQL;
local development can continue using SQLite. A new Supabase project starts empty.
The startup command applies migrations and creates one admin from Render secrets.
It does not seed sample inventory or copy your local accounts.

## 1. Create the database

1. Create a **Free** project in [Supabase](https://supabase.com/dashboard). Save its
   database password in your password manager.
2. In **Project Settings > Data API**, disable the Data API. Laravel accesses
   PostgreSQL directly and handles authorization; the frontend does not need a
   Supabase API key. Do this before creating application tables.
3. Click **Connect > Session pooler**. Copy the host, port, database and username.
   Use port **5432**, not the transaction pooler's port 6543. Session pooling
   supports prepared statements and IPv4 connections.

See [Supabase connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
and [Data API security](https://supabase.com/docs/guides/api/securing-your-api).

## 2. Deploy Laravel on Render

Push the deployment changes to GitHub, then create a **Web Service** in
[Render](https://dashboard.render.com) connected to this repository.

| Setting | Value |
| --- | --- |
| Branch | The branch containing these deployment files |
| Root directory | `Backend` |
| Runtime | Docker |
| Dockerfile path | `./Dockerfile` |
| Instance type | Free |
| Health check path | `/up` |

The Dockerfile uses PHP 8.4 with PostgreSQL support and FrankenPHP serving only
`public/`. Render builds it remotely; local Docker is optional. Keep the default
Docker command so the startup script can migrate and provision the admin.

Enter the variables from [`.env.render.example`](.env.render.example) in Render's
**Environment** settings. Replace the example URLs and database connection values.
Enter each password as a secret value, never in a committed file.

Generate **APP_KEY once** from your local `Backend` directory:

```sh
php artisan key:generate --show --no-interaction
```

Copy the complete `base64:...` result into Render's `APP_KEY`. Keep this key for
future deployments. Set `APP_ENV=production`, `APP_DEBUG=false` and
`DB_SSLMODE=require`. The database name is normally `postgres` and the session
pooler username is `postgres.<project-reference>`; copy the actual values from
Supabase. Do not set a conflicting `DB_URL`.

On this Windows setup, if `php` is not on your PATH, run this from `Backend`:

```powershell
& "$env:USERPROFILE/.config/herd/bin/php84/php.exe" artisan key:generate --show --no-interaction
```

For the first admin, set `WBA_ADMIN_NAME`, `WBA_ADMIN_EMAIL` and
`WBA_ADMIN_PASSWORD` in Render. The password must have **12–128 characters**.
On first startup, `wba:create-admin --from-env` creates the admin and hashes the
password. It does not replace credentials or reactivate an existing admin on
restarts. After your first successful login, remove these three bootstrap variables
from Render and redeploy. Additional accounts are created in **Manage Accounts**.

Render Free has no server shell, so this provisioning runs during startup. Logs
go to Render's log viewer. A migration or credential validation failure stops
startup; check the deployment logs rather than repeatedly retrying login.

## 3. Deploy the frontend on Vercel

Import the same repository into [Vercel](https://vercel.com/new):

| Setting | Value |
| --- | --- |
| Root directory | `WBA` |
| Framework | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api` |

Set the API variable before building. After Vercel assigns your frontend URL,
set Render's `FRONTEND_URL` to that exact origin, without a trailing slash or hash
path, and redeploy Render. Set `APP_URL` to the backend's HTTPS origin. Preview
deployments with other origins need an explicit entry in the comma-separated
`FRONTEND_URL`; do not use a wildcard. No database secrets belong in Vercel.

## 4. Verify and operate the demo

1. Open the backend's `/up` URL and confirm HTTP 200.
2. Sign in through the frontend's **Admin** role with your new account.
3. Create a product and a warehouse account, then verify receiving and dispatch.
4. Redeploy Render and confirm the product remains in Supabase.
5. Remove the first-admin bootstrap variables after login succeeds.

Render Free sleeps after 15 idle minutes, so the first request can take about a
minute. Supabase Free may pause after a week without database activity. Wake the
backend and check Supabase before a presentation. Local uploaded files are not
durable on Render Free; the current inventory data is stored in PostgreSQL.

`QUEUE_CONNECTION=sync` executes queued jobs during requests. The container runs
Laravel's scheduler alongside the web server for the existing daily expired-account
purge. Startup also purges overdue accounts to catch up after the free service has
slept. Scheduled tasks cannot run while Render is asleep; overdue accounts are
cleaned up when the service wakes. Expired accounts are denied recovery even before
physical deletion. A service that must run scheduled jobs while idle needs an
always-running paid service or an external scheduler.

Use Supabase database exports/backups before schema changes. To roll back code,
redeploy a previously working commit in Render and Vercel. Keep the same APP_KEY
and database. Do not run `migrate:fresh`, `db:wipe` or destructive rollback commands
against the deployed database.

## Support tickets: Gmail API

Help Center sends tickets to `vincentjamesguhiling@gmail.com` using Gmail's HTTPS
API. This works with Render Free, which blocks outbound SMTP ports. `MAIL_MAILER`
does not control support tickets. Requests require an active WBA account and are
limited to five per account per hour. Replies go to the requesting account's
email. Ticket contents live in the support mailbox; WBA does not maintain a ticket
status board or store the message body in its database or logs.

Configure the sender once:

1. Create/select a [Google Cloud project](https://console.cloud.google.com/) and
   enable Gmail API. Configure OAuth consent for the sender account; add that
   account as a test user if the app is in Testing.
2. Create an OAuth client of type **Web application**. For the setup below, add
   `https://developers.google.com/oauthplayground` as an authorized redirect URI.
3. Open [Google's OAuth Playground](https://developers.google.com/oauthplayground/).
   In its settings, select **Use your own OAuth credentials**, enter the client
   ID/secret, and keep Google endpoints and **Offline** access. Own credentials
   avoid the Playground's default 24-hour refresh-token revocation.
4. Authorize only `https://www.googleapis.com/auth/gmail.send` while signed in to
   the sending Gmail account. Exchange the authorization code for tokens.
   Save the **refresh token**, not the short-lived access token.
5. Set `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, and
   `GMAIL_SENDER_EMAIL` in Render secrets and your local `Backend/.env`. The sender
   must be the Gmail account that authorized the token. Restart/redeploy the
   backend after changing configuration. Keep all credentials out of Vercel,
   Git, screenshots, and support tickets.
6. Submit a ticket through Help Center and confirm it arrives in the support
   inbox. A successful response confirms Gmail accepted the message, not that a
   support person has read it. Missing credentials or provider failures display
   an error and leave the form available to copy or retry.

OAuth apps in **Testing** receive refresh tokens that expire after seven days for
this scope. Plan the appropriate production OAuth configuration before relying
on ongoing delivery. Revocation or a Gmail password change can also require
reauthorization. See [Google token expiration](https://developers.google.com/identity/protocols/oauth2#expiration)
and [Gmail scope guidance](https://developers.google.com/workspace/gmail/api/auth/scopes).
Apply your company's retention policy to the support mailbox.

## Compatibility checks

Run `php artisan test --compact` and the frontend's `npm run lint` and
`npm run build` before deploying. PostgreSQL tests must point to a **dedicated test
database**, never the Supabase deployment database: `RefreshDatabase` rebuilds its
tables. The PHPUnit environment defaults to SQLite; external `DB_CONNECTION`,
`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` and `DB_SSLMODE`
can select an isolated PostgreSQL test database.

---

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
