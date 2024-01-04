## Server Setup:

**Current Stack**:
Microservice Oriented Architecture
    - A microservice for the web client, the mobile client (and it's API), and the backend API (and the database)
Connections only need to be made between the proxy API and the clients (Users can't access the logic backend API)
Allows each service to be scaled appropriately
    - If there are more requests the mobile proxy can be scaled, etc.

Frontend: Astro, Svelte (interactivity), Vercel (adapter)
Backend: ExpressJS, NodeJS, Prisma
Database: PostgresQL, AWS S3 (Images), bcrypt (hashing)
Testing: Jest (Unit), Cypress (End to End)
Prodcution: Kubernetes, Consul
Mobile: ReactNative, ExpressJS (Proxy Server)

**After Prototype**:
Backend API -> Either Bun, Hono, Prisma or Gin, GORM 
    - Improved runtime for larger request loads
Postgres -> Postgres and Redis (Caching Requests)
    - Only if workloads become too much

Necessary Installations to Run:
1. NodeJS (Runtime)
    - Run `npm i` for each package.json (in client, in server)
2. Postgres Database (connected to the Prisma client)
    - In a `.env` file that holds a variable `DATABASE_URL`
    - In the format of `postgresql://username:password@url:port/dbname?schema=public`
3. Set up `.env` files
    - In both Client and Server
    - Client: API_URL
    - Server: DATABASE_URL, JWT_SECRET, AWS_ACCESS, AWS_SECRET, AWS_REGION, AWS_BUCKET_NAME
4. `npm start` to start the client server, `nodemon index.ts` to start the backend server
    - The server is technically in the client
    - The client interacts with the server separately (REST API)

## TODO:
1. Integrate Listings into Users Profiles (and a primitive search bar)
1. Finish up Password, Username changes, and Token changes (removing the token off the user if invalid)
2. Messaging (some sorta websocket)
2. Nodemailer within Client that sends a request to the API to store a link to reset password
    - astro call, leads to api call, leads to database code being stored for link, leads to email being sent with link, leads to new link that can reset password
4. Implement localstorage for each form so users don't lose progress on reload
5. Check to see if image authentication has any safer methods (or if it even needs safer methods)
    - Also have token authentication in there
6. Check if spaces can be added to form info to mess with database (if trims are needed)
7. Include Cypress and Jest (testing)
8. Include botting protection for registration and logging in
8. Listing Buying (Stripe)

## Making Edits:
1. Client:
    - New Components are added to the `components` directory
    - Astro has file-based routing, so any files added to `pages` will create a new route
2. Server:
    - The server acts as the REST API of the website
    - New groups of routes are added to `routes` and mentioned/added to the main router in `startup/routes.ts`
3. Database:
    - Any changes to the database schema are made in `schema.prisma`
    - Migrated with `npx prisma migrate` and pushed with `npx prisma db push`
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