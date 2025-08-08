# InternHub

A responsive web application to explore coding projects and internships, track progress, and earn badges.

## Tech Stack
- Frontend: HTML, CSS (Tailwind via CDN), JavaScript (ES Modules)
- Backend: Firebase (Auth, Firestore, Hosting)

## Project Structure
```
public/
  index.html
  projects.html
  project-detail.html
  internships.html
  dashboard.html
  components/
    navbar.html
    footer.html
  assets/
    js/
      firebase.js
      main.js
      projects.js
      project-detail.js
      internships.js
      dashboard.js
firebase.json
.firebaserc
```

## Prerequisites
- Node.js 18+
- Firebase CLI: `npm i -g firebase-tools`
- A Firebase project with Auth (Google) and Firestore enabled

## Local Development
This is a static site using ES Modules and CDN Tailwind, so no build step is required.

Option A: Run a simple static server
```
npx serve public -l 5173
```
Visit `http://localhost:5173`.

Option B: Use Firebase local hosting (recommended)
```
firebase login
firebase use internhub-c469b
firebase emulators:start --only hosting | cat
```
Visit the Local Hosting URL shown by the CLI.

## Deploy to Firebase Hosting
```
firebase login
firebase use internhub-c469b
firebase deploy --only hosting | cat
```

## Configuration
Firebase config is embedded in `public/assets/js/firebase.js`. Ensure your Firebase Auth sign-in provider (Google) is enabled and `localhost` is an authorized domain.

## Firestore Data Model
- `projects`: `{ name, short_description, detailed_description, category, difficulty, languages: string[], tags: string[], badge_reward, created_at, status }`
- `internships`: `{ name, description, category, duration, requirements: string[], created_at, status }`
- `users/{userId}`: `{ name, email, joined_at, badges: string[] }`
- `userProgress/{userId}`: `{ solved_projects: string[], solved_internships: string[] }`

## Notes
- On first sign-in, the app creates a `users/{userId}` and `userProgress/{userId}` document.
- Marking a project as solved awards its `badge_reward` (if any) to the user's badge list.
- All pages are responsive and include a shared navbar and footer loaded dynamically.