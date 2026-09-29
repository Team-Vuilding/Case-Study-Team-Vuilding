# React + Vite

## Project scope

Before changing product pages, navigation, or role permissions, read the shared [WBA System Scope and Access Model](../docs/PROJECT_SCOPE.md). It is the collaboration reference for the required modules and RBAC boundaries.

## TypeSafe Jev catalog review

The Admin **Add Product** form offers a Jev review of product identity, shelf-life tracking, and bin location. The review is a semantic warning only; the Admin confirms flagged details before adding. A changed form needs a fresh review. Existing role checks remain in the action handler.

Create `WBA/.env.local` with `TYPESAFE_API_KEY=your_key`, then run `npm run dev`. The key stays on the Vite server and is never sent to the browser. If the service or key is unavailable, the form reports the error and permits an explicit manual confirmation. The current app is a front-end prototype; this middleware runs with Vite dev/preview, so a production deployment needs a server-side endpoint for the same review flow.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
