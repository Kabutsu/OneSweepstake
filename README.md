# OneSweepstake

Multi-Tournament Football Sweepstakes Platform built with Next.js 14, Supabase, and Drizzle ORM.

## Features

- **Authentication**: Google OAuth and Magic Link sign-in
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: Supabase Realtime for live updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth (Google OAuth, Magic Link)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup

1. **Clone the repository**

```bash
git clone https://github.com/Kabutsu/OneSweepstake.git
cd OneSweepstake
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

- Create a new project at [supabase.com](https://supabase.com)
- Enable Google OAuth in Authentication > Providers
- Copy your project URL and anon key

4. **Configure environment variables**

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
POSTGRES_URL=postgresql://postgres:[your-password]@db.[your-project-ref].supabase.co:5432/postgres
```

5. **Run database migrations**

```bash
npm run db:push
```

This will create all required tables in your Supabase database:
- users
- tournaments
- sweepstakes
- participants
- team_assignments
- chat_messages
- match_cache

6. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

- **users**: User profiles and authentication info
- **tournaments**: Available tournaments (World Cup, Euros, etc.)
- **sweepstakes**: Individual sweepstake instances
- **participants**: Users participating in sweepstakes
- **team_assignments**: Teams assigned to participants
- **chat_messages**: Real-time chat per sweepstake
- **match_cache**: Cached match data from external API

## Development

### Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

### Project Structure

```
OneSweepstake/
├── app/                  # Next.js App Router pages
│   ├── auth/            # Authentication pages
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
├── db/                  # Database schema and config
│   ├── schema.ts        # Drizzle schema
│   └── index.ts         # Database client
├── lib/                 # Utility functions
│   └── supabase/        # Supabase client utilities
└── public/              # Static assets
```

## Authentication

The app supports two authentication methods:

1. **Google OAuth**: One-click sign-in with Google account
2. **Magic Link**: Passwordless email authentication

Both methods are implemented using Supabase Auth.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

## Support

For issues and questions, please open an issue on GitHub.
