# Validation and coordinator browser queue

2026-10-18 implementation checks use Node's built-in tests with synthetic data.
No browser, GUI service, real credential or paid API request was used. A passing
test does not establish HF publication, ordinary installation, audio or billing.

Commands: `npm test`, `npm run check`, `python3 scripts/package_space.py`.

## Free browser checks for the coordinator

After an authorized source release and HF publication (not done here), open the
exact new HF Space URL and record version/date:

1. Search Spaces for `suno`, confirm title/publisher, open it and inspect the token
   password field, existing-task form and collapsed generation panel.
2. With **no token**, submit the lookup form: local error, no HTTP call. Do not
   use a random token to call the service.
3. Inspect application/storage: no cookies/local/session storage or embedded owner
   token; no third-party script/analytics; no network API call on initial load.
4. Screenshot the empty app, password field and expanded generation consent (all
   fields empty or redacted). This is UI acceptance, not generation acceptance.
5. Check **Duplicate this Space** on an existing account without confirming any
   paid hardware or agreement. Verify Static SDK and required files.

Only if separately authorized, read a known successful old Suno task using its
same ID. A real paid new generation is out of this check's scope.
