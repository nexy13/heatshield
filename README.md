# HeatShield AI

> **SDG 13: Climate Action** — Protecting brick kiln workers from heat-related illness through real-time monitoring, AI-driven alerts, and emergency response.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 (Vite)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Automation**: n8n (workflow engine for alerts, reminders, reports)
- **Hosting**: Vercel (edge-deployed CDN)
- **VCS**: GitHub

## Getting Started

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd heatshield

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase and API keys

# 4. Run the dev server
npm run dev
```

## Database Setup

1. Go to your Supabase project → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Optionally run `supabase/seed.sql` for demo data

## User Roles

| Role | Description |
|---|---|
| **Worker** | Brick kiln laborer — view dashboard, SOS, hydration |
| **Supervisor** | On-site manager — monitor workers, manage alerts |
| **Admin** | Platform administrator — manage sites, users, compliance |
| **NGO Observer** | Read-only auditor — view compliance reports |

## n8n Workflows

Import the JSON files from `/n8n/` into your n8n instance:
- `hydration_reminder.json` — periodic hydration push
- `heat_alert.json` — weather threshold alerts
- `sos_emergency.json` — SOS notification chain
- `shift_summary.json` — end-of-shift reports
- `compliance_check.json` — daily compliance audit

## License

MIT
