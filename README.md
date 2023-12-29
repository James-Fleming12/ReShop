## Server Setup:

**Current Stack**:
Microservice Oriented Architecture
    - A microservice for the web client, both mobile clients, and the backend API
Connections only need to be made between the backend API and the clients 
    - No inter-client communication

Frontend: Astro (New), React (Old), SCSS
Backend: ExpressJS, NodeJS, Prisma
Testing: Storybook (Frontend), Jest (Backend)
Server:
    - Cloud: AWS, Cognito, S3 Bucket, RDS (Postgres, maybe ElastiCache), SST (management)
    - NYU: PostgresQL (BLOBs images, PostGIS), SuperTokens (or another authentication service)
Prodcution: Kubernetes, Consul?
Mobile: Kotlin, Swift

Necessary Installations to Run:
1. NodeJS (Runtime)
    - Run `npm i` for each package.json (in client, in server)
3. `npm start` to start the client server, `nodemon index.ts` to start the backend server
    - The server is technically in the client
    - The client interacts with the server separately (REST API)

## TODO:
1. Figure out Astro interaction with Express REST API
2. Include Storybook and Jest (testing)

## Making Edits:
1. Client:
    - New Components/Pages can be added anywhere as long as they are exported
    - New pages/urls are added to `App.tsx` with the react-router
2. Server:
    - The server acts as the REST API of the website
    - Routes can be added to `index.ts`, with the return type usually being a json or a login
3. Database:
    - Any changes to the database schema are made in `schema.prisma`

## AWS Connections:
1. RDS
    - Endpoint: database-1.cbgaoumoqwlt.us-east-2.rds.amazonaws.com
    - Port: 5432