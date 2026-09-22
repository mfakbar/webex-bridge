# Webex Bridge

A small, privacy-friendly HTTPS bridge for opening Webex links from Outlook and other clients that do not reliably preserve custom protocol links.

## Use it

Published URL: `https://mfakbar.github.io/webex-bridge/`

```text
https://mfakbar.github.io/webex-bridge/?space=SPACE_ID
https://mfakbar.github.io/webex-bridge/?space=SPACE_ID&message=MESSAGE_ID
https://mfakbar.github.io/webex-bridge/?email=person@example.com
https://mfakbar.github.io/webex-bridge/?meeting=https%3A%2F%2Fcompany.webex.com%2Fmeet%2Fperson
```

Opening one of these HTTPS links attempts to launch the Webex desktop app. If the browser does not hand off to the app, it continues to the corresponding Webex web destination. The home page also includes a link generator for testing and composing Outlook-safe links.

## Safety and privacy

- No analytics, cookies, network APIs, or third-party assets.
- A responsive Webex-inspired light/dark interface follows the operating-system theme.
- A strict Content Security Policy prevents injected scripts and unexpected connections.
- Only one destination type is accepted per request.
- IDs use a conservative allowlist; meeting URLs must use HTTPS on `webex.com` or one of its subdomains.
- The meeting URL is preserved as the browser fallback rather than rewritten.

## Compatibility notes

Cisco documents `webexteams://im?space=…` and `webexteams://im?email=…`. Message targeting and `webexteams://meet?url=…` are best-effort client compatibility extensions; the web fallback covers clients that do not support them. Browser security policies mean a page cannot prove that a protocol handler succeeded, so the bridge cancels fallback when the page becomes hidden or loses focus and otherwise displays explicit app/web buttons.

## Local test

Requires Node.js 18 or newer:

```sh
npm test
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deployment

The included GitHub Actions workflow tests every push to `main` and deploys the repository root through GitHub Pages. In repository settings, select **GitHub Actions** as the Pages source.

## Sources

- [Cisco: Add links for meetings or spaces with the webexteams protocol](https://help.webex.com/article/n5yzg8y/)

## License

MIT
