## Server Setup:

**Current Stack**:
Microservice Oriented Architecture
    - A microservice for the web client, the mobile client (and it's API), the backend API (and the database), and the websocket server
    - Four are open ports (mobile client, the mobile API, web client, websocket) with two being private (backend API, database)
Connections only need to be made between the proxy API and the clients (Users can't access the logic backend API)
Allows each service to be scaled appropriately
    - If there are more requests the mobile proxy can be scaled, etc.

Frontend: Svelte, SvelteKit, Vite, SCSS
Backend: ExpressJS, NodeJS, Prisma, Algolia (AI Search)
WebSocket: SocketIO, ExpressJS, NodeJS, Prisma
Database: PostgresQL, AWS S3 (Images)
Testing: Jest (Unit), Cypress (End to End)
Prodcution: Kubernetes, Consul
Mobile: Expo, ReactNative, ExpressJS (Proxy Server)

**After Prototype**:
Frontend -> Check if Astro is set to support SPAs yet
Backend API -> Either Bun, Hono, Prisma or Gin, GORM
    - Improved runtime for larger request loads
Postgres -> Postgres and Redis (Caching Requests)
    - Only if workloads become too much

Necessary Installations to Run:
1. NodeJS (Runtime)
    - Run `npm i` for each package.json (in client, server, and socket)
2. Postgres Database (connected to the Prisma client)
    - In a `.env` file that holds a variable `DATABASE_URL`
    - In the format of `postgresql://username:password@url:port/dbname?schema=public`
3. Set up `.env` files
    - In both Client and Server
    - Client: API_URL
    - Server: DATABASE_URL, JWT_SECRET, WS_SECRET, AWS_ACCESS, AWS_SECRET, AWS_REGION, AWS_BUCKET_NAME
    - Socket: DATABASE_URL, JWT_SECRET, WS_SECRET (same as Server)
4. `npm run dev` to start the client server, `nodemon index.ts` to start the backend server, `nodemon index.ts` to start the socket server
    - The client comes with its own proxy server (to interact with the backend server)
5. `npx expo start` in mobile client, `nodemon index.ts` in mobile proxy
    - App can be viewed through the "Expo Go" App

## TODO:
1. Implement use:enchance on every form (no reloads)
1. Finish up Password, Username changes, and Token changes (removing the token off the user if invalid)
1. Messaging
    - Figure out sorting messenger list by most recent message (either updating list each time or sorting by last message time when queried)
2. Set limits for usernames and passwords (no spaces in usernames, capital in pass, etc.)
2. Check if JWT-Token or Username is succeptable to XSS (document.cookie)
2. Test Search Engine pages feature
2. Nodemailer within Client that sends a request to the API to store a link to reset password
    - astro call, leads to api call, leads to database code being stored for link, leads to email being sent with link, leads to new link that can reset password
3. Figure out the proper way to get rid of the cookies (logging out)
4. Implement localstorage for each form so users don't lose progress on reload
5. Check to see if image authentication has any safer methods (or if it even needs safer methods)
    - Also have token authentication in there
5. Implement use:enchance into forms to make them faster and more responsive
6. Check if spaces can be added to form info to mess with database (if trims are needed)
7. Include Cypress and Jest (testing)
8. Include botting protection for registration and logging in
8. Put protections in place in case of AWS or Database crashes (most importantly on delete/complete operations)
8. Listing Buying (Stripe)
8. Check if including AWS URLs in data sent is dangerous (for when listing are queried)

## Making Edits:
1. Client:
    - New Components are added to the `lib` directory
    - SvelteKit uses Directory based routing, so any new routes need their own folder
2. Server:
    - The server acts as the REST API of the website
    - New groups of routes are added to `routes` and mentioned/added to the main router in `startup/routes.ts`
3. Database:
    - Any changes to the database schema are made in `schema.prisma`
    - Migrated with `npx prisma migrate` and pushed with `npx prisma db push` (`npx prisma db pull` can be used in the websocket to update schema)
4. Mobile:
    - Yet to be developed

## Testing:
1. Cypress (End to End, contained in Client):
    - `npx cypress open` will open up the interface
    - `npx cypress run` will run all test cases (defined in `cypress/e2e`)
2. Jest (Unit, contained in Server):
    - `npm jest` will run all test cases (defined in `tests`)

## Precautions before Production:
1. Clear the AWS S3 Bucket (of everything except for `defaultpfp`)
    - Since the database often had to reset during development, the bucket might have unused images (a little dangerous)