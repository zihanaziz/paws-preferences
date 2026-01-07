# Paws & Preferences 🐾
A single-page web app that helps users discover what kind of cats they prefer — swipe right to **Like** and swipe left to **Dislike**, then view a summary of your favourites.

## Live Demo
- GitHub Pages: *(paste your link here)*

## Features
- Tinder-style swipe interactions:
  - Swipe right = **Like**
  - Swipe left = **Dislike**
- Button controls for Like/Dislike (desktop friendly)
- Summary screen after all cats are swiped:
  - Total liked count
  - Gallery of liked cats
- Cat images sourced from **Cataas** 

## Tech Stack
- **React 18**
- Vite
- CSS (custom styling)
- Data source: Cataas API

## How it works
1. Fetch a fixed number of cats from the Cataas API.
2. Preload images for a smoother experience.
3. Display a stack of cards and record user swipes (like/dislike).
4. Show a summary with the liked cats at the end.

## Getting Started (Local)
### Requirements
- Node.js (LTS recommended)

### Run locally
```bash
npm install
npm run dev
