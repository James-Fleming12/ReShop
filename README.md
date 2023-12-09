## ReShop Server Setup:

Necessary Installations to Run:
1. NodeJS (Runtime)
    - Run `npm i` for each package.json (in client, in server)
2. PostgresQL (server setup)
    - Run the database.sql through the psql command line
3. `npm run dev` to start the client server, `nodemon index.ts` to start the server server
    - The server is technically in the client
    - The client interacts with the server separately (REST API)

## Edits:
1. Client:
    - New Components/Pages can be added anywhere as long as they are exported
    - New pages/urls are added to App.tsx
2. Server:
    - The server is there just to interact with the database and return information
    - Routes can be added to index.ts, with the return type usually being a json or a login
3. Database:
    - Any changes to the database must be applied to the psql server
    - Changes to the .sql file won't change anything unless applied