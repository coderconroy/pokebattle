# PokéBattle QuickPlay - Simplified Online Pokémon Duels

## Overview
PokéBattle QuickPlay is an online Pokémon battle platform that combines elements of the Pokémon Trading Card Game (TCG) with 1v1 card duels. Designed to be accessible for both seasoned players and newcomers, it simplifies traditional gameplay, making matches quicker and more accessible. The platform allows users to register, personalize their profiles, build private card collections, and engage in strategic battles.

## Technologies
- **Frontend**: Vue.js
- **Backend**: Node.js, Express
- **API**: GraphQL
- **Database**: PostgreSQL
- **External APIs**: Pokémon TCG Database API for card information

## Getting Started
1. **Clone the Repository**: `git clone https://github.com/coderconroy/ee547-final-project.git`
2. **Install Dependencies**:
   - Navigate to `/client` and `/server` directories and run `npm install` in each.
3. **Environment Setup**:
   - Set up environment variables as needed for database connections and API keys.
4. **Running the Application**:
   - Start the backend server: `npm start` in the `/server` directory.
   - Start the Vue.js frontend: `npm run serve` in the `/client` directory.

## Folder Structure
- `/client`: Contains the Vue.js frontend application.
- `/server`: Node.js and Express backend.
  - `/graphql`: GraphQL schema and resolvers.
  - `/models`: PostgreSQL database models.
  - `/controllers`: Business logic of the application.
- `/docs`: Project documentation and resources.