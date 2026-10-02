# SchedulAI — University Timetable MVP

A Next.js/Vercel-ready MVP for university scheduling staff.

## Current MVP
- English / French interface
- Excel/CSV upload
- Demo dataset
- Student timetable view
- Teacher timetable view
- Conflict counter and deterministic schedule checks foundation
- Excel export
- Print / Save as PDF
- Responsive dashboard

## Run locally
```bash
npm install
npm run dev
```

## Deploy to Vercel
Import this folder/repository into Vercel. Vercel will detect Next.js automatically.

## Next build phase
1. Define the exact university Excel schema.
2. Add real constraint solving: teacher, group, room, capacity, availability, hours.
3. Add AI assistant for natural-language scheduling requests.
4. Add persistent university/departments data.
5. Add authentication and role-based access.
