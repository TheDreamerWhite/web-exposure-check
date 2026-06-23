# Web Exposure Check

Web Exposure Check is a lightweight Next.js app for reviewing basic public
website exposure signals. It checks a domain for HTTPS behavior, TLS certificate
health, email authentication records, and common browser security headers, then
returns a simple score, risk level, and suggested fixes.

This is a first-pass visibility tool. It is not a vulnerability scanner,
penetration test, or replacement for a professional security assessment.

## Features

- Public website scan dashboard at `/scan`
- Score display, risk explanation, check cards, and suggested fixes
- Local browser scan history with copy report and JSON export
- Checks for SSL/TLS, HTTPS redirect, SPF, DMARC, HSTS, CSP, and frame protection
- JSON API at `/api/scan`
- Static public pages for features, about, privacy, and terms
- Responsive layout for desktop and mobile

## Local Setup

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell, if script execution policy blocks `npm`, use the command
shim instead:

```bash
npm.cmd run dev
```

Create a production build:

```bash
npm run build
```

On Windows PowerShell, this equivalent command avoids `npm.ps1` execution-policy
blocks:

```bash
npm.cmd run build
```

Run the production server after building:

```bash
npm run start
```

## Deployment

Vercel can deploy this project from a connected GitHub repository. Before a
future deployment, verify the project locally with:

```bash
npm.cmd run build
```

Use `npm.cmd` on Windows if PowerShell blocks `npm.ps1`. The app uses Next.js
App Router routes, including the serverless-compatible scan handler at
`app/api/scan/route.ts`.

Deploy only code you are authorized to publish, and use the scanner only for
domains you own or are explicitly authorized to assess.

## API Usage

Endpoint:

```text
POST /api/scan
Content-Type: application/json
```

Request body:

```json
{
  "domain": "example.com"
}
```

Successful response:

```json
{
  "domain": "example.com",
  "score": 80,
  "riskLevel": "Low Risk",
  "checks": {
    "ssl": "OK",
    "httpsRedirect": "OK",
    "spf": "Missing",
    "dmarc": "OK",
    "hsts": "OK",
    "csp": "Missing",
    "xFrameOptions": "OK"
  }
}
```

Invalid requests return JSON errors:

```json
{
  "error": "Please enter a valid public domain, such as example.com."
}
```

## Limitations

- Checks are limited to public DNS, TLS, redirect, and HTTP header signals.
- Results can be affected by DNS propagation, CDN behavior, redirects, bot
  blocking, and temporary network failures.
- A healthy score does not prove that a website is secure.
- A poor score does not prove active compromise.
- The tool does not authenticate, crawl private pages, run exploit payloads, or
  inspect application source code.

## Ethical Disclaimer

Use this project only on domains you own, administer, or have explicit
permission to test. Do not use it for harassment, unauthorized reconnaissance,
abuse of third-party services, or attempts to bypass controls.

For production security decisions, validate findings with qualified security
professionals and the owners of the systems being reviewed.
