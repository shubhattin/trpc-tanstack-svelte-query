## 0.1.2 (Unreleased)

### Bug Fixes
- **client**: fix silent mutation hangs caused by Svelte 5 reactive proxy wrappers and duplicate module resolution. The untyped tRPC client is now reliably resolved via \`Symbol.for('trpc_untypedClient')\`.

## 0.1.1

- Initial Release
