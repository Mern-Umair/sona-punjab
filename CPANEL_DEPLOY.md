# Deploy to HostingRam cPanel (highflyerpigeons.com)

## What’s in the zip

`highflyerpigeons-cpanel.zip` is the **backend** Node app with:

| Path | Serves |
|------|--------|
| `/` | Public website (dhunni build) |
| `/admin` | Admin panel |
| `/api/*` | API |

## cPanel setup

1. Upload `highflyerpigeons-cpanel.zip` and extract into your Node app folder (e.g. `nodejs/highflyerpigeons` or home directory app root).
2. **Setup Node.js App** in cPanel:
   - **Node version:** 18+ (or 20)
   - **Application root:** folder where `app.js` and `package.json` live
   - **Application URL:** `highflyerpigeons.com` (root `/`)
   - **Application startup file:** `app.js`
3. Open the app’s terminal / Run NPM Install (`npm install`).
4. Confirm `.env` has production values (`MONGO_URI`, `JWT_*`, `AWS_*`, `NODE_ENV=production`).
5. **Restart** the Node.js app.

## URLs

- Website: https://highflyerpigeons.com  
- Admin: https://highflyerpigeons.com/admin  
- API: https://highflyerpigeons.com/api  

## Rebuild zip locally

```powershell
cd sona-punjab
powershell -ExecutionPolicy Bypass -File scripts\build-cpanel.ps1
```
