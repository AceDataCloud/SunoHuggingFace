# Privacy and credentials

This independent Suno app is provided by Ace Data Cloud. Hugging Face serves the
public static assets. With your explicit action, the browser sends your application
API token and chosen prompt or existing task ID to `https://api.acedata.cloud`.

The app has no runtime third-party JavaScript, server database, analytics, cookies,
local/session storage or shared publisher API credential. The token remains in the
password input and the in-flight request's browser memory; it is not included in
the URL or result. Clearing the token removes the input; close the tab on shared
computers. Browser extensions/password managers are outside the app's control.

Successful terminal audio URLs are loaded only when the user plays audio or opens
the returned link (`preload=none`). HTTPS media hosts see those requests. No raw
API response is printed; errors are controlled messages that preserve HTTP status.

Static Space variables and secrets are client-visible. **Never configure a shared
owner token as a Static Space variable/secret.** Users must supply their own token.
Duplicated public code is reviewable and should be checked before entering a key.

API use follows the current Ace account terms, permissions, price and balance.
Only process inputs you have permission to use. This page does not promise a
license to third-party music, model weights, trademarks or any output.

Support: dev@acedata.cloud or repository issues. Share task/trace IDs, never keys.
