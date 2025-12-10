# Motzkin Store Web

A modern Next.js website with a basic layout structure including header, main content area, and footer.

## Features

- [X] Next.js 16 with App Router
- [X] TypeScript support
- [X] Tailwind CSS for styling
- [X] Responsive design
- [X] Dark mode support
- [X] Reusable layout components (Header, Footer, Layout)
- [X] Authentication system with session management
- [X] Protected routes with automatic redirect
- [X] Logout functionality with session invalidation

## Getting Started

### Quick Setup (Recommended)

Use the automated setup scripts to check dependencies, install packages, and start the server:

**Windows:**
```cmd
cd scripts
setup.bat
```

**Linux/macOS:**
```bash
cd scripts
chmod +x setup.sh  # First time only
./setup.sh
```

The setup scripts will:
- Check for Node.js and internet connectivity
- Detect or let you choose a package manager (npm/yarn/pnpm)
- Install dependencies if needed
- Verify port availability
- Start the development server

For more details, see [scripts/README.md](scripts/README.md)

### Manual Setup

If you prefer manual setup:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Authentication

Session-based auth using sessionStorage. Login at `/login` with any non-empty credentials. Logout button appears in the header when authenticated.

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable React components
└── contexts/         # React contexts (auth, etc.)
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

See [LICENSE](LICENSE) file for details.
