## Server Setup:

**Current Stack**:
Frontend: Astro (New), React (Old)
Backend: ExpressJS, NodeJS
Cloud: AWS, Cognito, RDS (Postgres)

Necessary Installations to Run:
1. NodeJS (Runtime)
    - Run `npm i` for each package.json (in client, in server)
2. PostgresQL (database server setup)
    - Create a `.env` file that holds the URL to the database, in the format of 
    - `DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"`
3. `npm run dev` to start the client server, `nodemon index.ts` to start the backend server
    - The server is technically in the client
    - The client interacts with the server separately (REST API)

## TODO:
1. Transfer Frontend Client to AstroJS
2. Figure out Astro interaction with Express REST API
    - Decide if Express is the desired framework

## Making Edits:
1. Client:
    - New Components/Pages can be added anywhere as long as they are exported
    - New pages/urls are added to `App.tsx` with the react-router
2. Server:
    - The server acts as the REST API of the website
    - Routes can be added to `index.ts`, with the return type usually being a json or a login
3. Database:
    - Any changes to the database schema are made in `schema.prisma`