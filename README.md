## Server Setup:

**Current Stack**:
Microservice Oriented Architecture
    - A microservice for the web client, both mobile clients, and the backend API
Connections only need to be made between the backend API and the clients 
    - No inter-client communication

Frontend: Astro, Svelte (interactivity), Vercel (adapter)
Backend: ExpressJS, NodeJS, Prisma
Testing: Storybook (Frontend), Jest (Unit), Cypress (End to End)
Database: PostgresQL (BLOBs for images), bcrypt (hashing)
Prodcution: Kubernetes, Consul
Mobile: Kotlin, Swift

Necessary Installations to Run:
1. NodeJS (Runtime)
    - Run `npm i` for each package.json (in client, in server)
2. Postgres Database (connected to the Prisma client)
    - In a `.env` file that holds a variable `DATABASE_URL`
    - In the format of `postgresql://username:password@url:port/dbname?schema=public`
3. `npm start` to start the client server, `nodemon index.ts` to start the backend server
    - The server is technically in the client
    - The client interacts with the server separately (REST API)

## TODO:
2. Nodemailer within Client that sends a request to the API to store a link to reset password
    - astro call, leads to api call, leads to database code being stored for link, leads to email being sent with link, leads to new link that can reset password
7. Include Storybook and Jest (testing)

## Making Edits:
1. Client:
    - New Components are added to the `components` directory
    - Astro has file-based routing, so any files added to `pages` will create a new route
2. Server:
    - The server acts as the REST API of the website
    - Routes can be added to `index.ts`, with the return type usually being a json or a login
3. Database:
    - Any changes to the database schema are made in `schema.prisma`
    - Migrated with `npx prisma migrate` and pushed with `npx prisma db push`
4. Mobile:
    - Yet to be developed