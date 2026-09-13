# Pokemon Desktop Online (website)

Static site (no build step): plain HTML/CSS/JS + the Firebase modular SDK
loaded from CDN. Lives in its own GitHub repo, deployed via GitHub Pages.

## Pages

- `index.html` - landing page.
- `play.html` - Game 1: no-login streak quiz, sharing, leaderboard submission.
- `leaderboard.html` - global top streaks.
- `account.html` - email/password login, link a Device ID, view synced stats
  and Pokedex.

## 1. Configure Firebase

1. Create/deploy the backend first: see
   `../firebase/README.md` in this workspace (new dedicated Firebase project,
   Firestore + Auth + the `syncStats` Cloud Function).
2. In the Firebase console: Project settings -> General -> Your apps -> Add
   app -> Web. Copy the config object.
3. Paste those values into `js/firebase-config.js`.

## 2. Create the GitHub repo and push

```powershell
cd "PokemonDesktop Online\web"
git init
git add .
git commit -m "Initial Pokemon Desktop Online site"
git branch -M main
git remote add origin https://github.com/<your-org-or-user>/pokemon-desktop-online.git
git push -u origin main
```

## 3. Enable GitHub Pages

1. Repo -> Settings -> Pages -> Source: "Deploy from a branch" -> `main` /
   `/ (root)`.
2. Repo -> Settings -> Pages -> Custom domain: `pokemon.barbaproductions.com`
   (the `CNAME` file in this folder already contains that value).
3. At your DNS provider for `barbaproductions.com`, add:
   ```
   CNAME   pokemon   <your-org-or-user>.github.io.
   ```
4. Wait for DNS to propagate, then enable "Enforce HTTPS" on the Pages
   settings once GitHub shows the certificate as issued.

## Notes

- This repo is public by design (GitHub Pages on a free personal account
  requires a public repo). No secrets live here - the Firebase web config is
  meant to be public; access control is enforced by Firestore security rules
  (see `../firebase/firestore.rules`).
- The Game 1 leaderboard trusts client-submitted scores (no server-side
  validation) - see the security note in `../firebase/firestore.rules`.
