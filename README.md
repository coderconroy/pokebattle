# PokéBattle QuickPlay - Simplified Online Pokémon Duels

## Overview
PokéBattle QuickPlay is an online Pokémon battle platform that combines elements of the Pokémon Trading Card Game (TCG) with 1v1 card duels. Designed to be accessible for both seasoned players and newcomers, it simplifies traditional gameplay, making matches quicker and more accessible. The platform allows users to register, personalize their profiles, build private card collections, and engage in strategic battles.

## Technologies
- **Frontend**: Vue.js
- **Backend**: Node.js, Express
- **API**: GraphQL
- **Database**: MongoDB

## Getting Started
1. **Clone the Repository**: `git clone https://github.com/coderconroy/ee547-final-project.git`
2. **Install Dependencies**:
   - Navigate to `/client` and `/server` directories and run `npm install` in each.
3. **Running the Application**:
   - Ensure a MongoDB instance is running on your system.
   - Start the backend server: `npm start` in the `/server` directory.
   - Start the Vue.js frontend: `npm run serve` in the `/client` directory.

## Folder Structure
- `/client`: Contains the Vue.js frontend application.
    - `/public`: Contains static assets for frontend.
    - `/src`: Contains primary source files for frontend.
- `/server`: Node.js and Express backend.
  - `/config`: Connection parameters for MongoDB
  - `/data`: JSON files with card data placed in this directory will be added to the database on server start.
  - `/src`: Contains primary source files for frontend.