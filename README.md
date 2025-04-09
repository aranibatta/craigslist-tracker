# Craigslist Tracker

A web application to help manage Craigslist apartment listings. Made by Claude and Ron, an experiment in AI and React.

## Setup

1. Clone this repository
2. Install dependencies:
   - Frontend: `npm install`
   - Backend: `cd server && npm install`
3. Set up environment variables:
   - Frontend: Create a `.env` file in the root directory with the following variables:
     ```
     REACT_APP_API_URL=http://localhost:3000
     ```
   - Backend: Create a `.env` file in the `server` directory with the following variables:
     ```
     ANTHROPIC_API_KEY=your_api_key_here
     ```
4. Start the development servers:
   - Frontend: `npm start`
   - Backend: `cd server && npm run dev`

## Features

- Add new listings
- Edit existing listings
- Delete listings
- Mark listings as applied
- View listing details

## TODO:
- Add search functionality
- Add sorting functionality
- Add filtering functionality

## License

MIT License

## Authors

- Claude
- Ron

## Acknowledgments

- [Craigslist](https://www.craigslist.org/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [Axios](https://github.com/axios/axios)
- [Cheerio](https://cheerio.js.org/)
- [Bun](https://bun.sh/)
- [Anthropic](https://www.anthropic.com/)

