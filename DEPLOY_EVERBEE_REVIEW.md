# EverBee Review Portal: real HTTPS URL and reviewer credentials

**Important:** A local URL such as `http://127.0.0.1:4177` is NOT accessible by EverBee reviewers and cannot be used as a Production URL. Hosting is required. No real HTTPS URL is bundled or claimed here.

## Reviewer sign-in

The hosted demo presents an actual login form. Credentials are controlled with runtime environment variables (not in source control):

- `REVIEW_USERNAME`: a reviewer-only username you choose, such as `everbee_reviewer`
- `REVIEW_PASSWORD`: a unique, random password of at least 12 characters
- `REVIEW_BIND_HOST`: `0.0.0.0` (required for Render and other remote hosting)
- `PORT`: injected by hosting provider

Use a password manager to generate a long random password. Do not reuse an EverBee, Etsy, Google, HaloSpark or other account password. No EverBee API credentials are needed and none should be entered into this demo. Login is independent from EverBee API authentication.

The server *refuses to bind publicly* if the reviewer username/password are absent. Cookie is HTTP-only, SameSite=Lax, signed, and Secure for public hosting. Login has request size and brute-force controls. Sessions expire after eight hours and invalidate on server restart.

## Deploy to Render (suggested; other Node hosts work)

1. Place this **isolated demo only** in a dedicated private GitHub repository. Do not upload the working HaloSpark source or secrets.
2. Sign into https://dashboard.render.com/ and choose **New > Web Service**. Connect the dedicated repo.
3. Choose Node. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. In **Environment**, add `REVIEW_BIND_HOST=0.0.0.0`, `REVIEW_USERNAME` and `REVIEW_PASSWORD` with your own values. Do not check these values into Git.
5. Select a suitable service plan and deploy. Free instances may sleep after inactivity; this can delay a review.
6. Render supplies a real URL similar in form to `https://<generated-name>.onrender.com`. **Copy the actual generated HTTPS URL after deployment** into the EverBee **Production URL** field. Do not submit example URLs.
7. Verify from a private/incognito browser window, ideally on another network: login page opens, wrong password is rejected, correct password enters the demo, M01 works, M04 demo works.
8. Enter the exact `REVIEW_USERNAME` and `REVIEW_PASSWORD` into the *Login Credentials* fields on EverBee Developer Portal's **App Demo** tab. These credentials are for reviewer access to the deployed demo.
9. Upload the video to a reviewer-accessible hosting provider, set access to unlisted if using YouTube, and paste that real playable link into EverBee's **Demo Video** field.
10. Under **Review & Submit**, submit only when all links and logins have been personally checked.

**Truthful reviewer note:** This site is an isolated, synthetic MOCK proof-of-concept for the intended EverBee Research API integration. It DOES NOT make live calls to EverBee. Production app and live API authorization remain pending. Ask EverBee whether mock demonstration suffices or whether test/installation access is required to demonstrate real authenticated calls.

## Quick local authenticated test (PowerShell)

Open PowerShell inside this directory and run:

```powershell
$env:REVIEW_USERNAME='everbee_reviewer'
$secure=Read-Host 'Choose a unique reviewer password (min 12 characters)' -AsSecureString
$env:REVIEW_PASSWORD=[System.Net.NetworkCredential]::new('', $secure).Password
node server.mjs
```

This local URL is only for testing. Do NOT submit `localhost` or `127.0.0.1` as Production URL.

## Hosting cost and access warning

Render provides managed HTTPS on its assigned domain. Free web services may become idle and take time to wake up, so a paid always-on service or a hosted service without sleep can improve reviewer reliability. No service is deployed by this ZIP.
