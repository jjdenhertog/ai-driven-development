## FEATURE:

- Next.js Research Dashboard with integrated AI Assistant component
- Research Dashboard as the primary interface with multi-source search capabilities
- AI Assistant component that can generate content based on research context
- Real-time streaming interface for AI responses
- Gmail API integration for draft creation, Brave API for web search

## EXAMPLES:

In the `examples/` folder, there are sample implementations to understand Next.js patterns and best practices for creating similar features.

- `examples/app/dashboard/` - use this as a template for creating dashboard layouts
- `examples/components/streaming/` - patterns for handling streaming AI responses
- `examples/app/actions/` - Server Actions for data fetching and mutations
- `examples/lib/api/` - API client patterns for external service integration

Don't copy any of these examples directly, they are for different features entirely. But use them as inspiration and for Next.js best practices.

## DOCUMENTATION:

- Next.js App Router: https://nextjs.org/docs/app
- Vercel AI SDK: https://sdk.vercel.ai/docs
- React Server Components: https://react.dev/reference/react/use-server
- SWR for data fetching: https://swr.vercel.app/
- Tailwind CSS: https://tailwindcss.com/docs

## OTHER CONSIDERATIONS:

- Include a `.env.local.example` with all required environment variables
- Create comprehensive README with:
  - Setup instructions including Gmail OAuth configuration
  - Brave API key acquisition steps
  - Project structure overview
  - Development workflow
  - Deployment guidelines
- Use Next.js built-in environment variable handling (no need for dotenv)
- Implement proper TypeScript types for all components and API responses
- Include loading skeletons and error boundaries for better UX
- Ensure all components are accessible (ARIA labels, keyboard navigation)
- Set up proper testing with Jest and React Testing Library
- Configure ESLint and Prettier for code consistency
- Use Server Components by default, Client Components only when needed
- Implement proper caching strategies for API responses
- Handle rate limiting for external APIs gracefully
