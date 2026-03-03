# seating arranger

## Abstract
This app helps generate random exam seating arrangements so students are mixed across rooms and benches instead of repeating the same seating pattern every time.

## Technologies used
- Frontend: React + Vite
- Database: Firebase Firestore

## Setup and run
1. Clone the repository.
2. Install dependencies:
```bash
npm install
```
3. Start the app:
```bash
npm run dev
```
4. Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

## Firebase setup
- Firestore is configured in [src/firebase/firebase.js](src/firebase/firebase.js).
- Update that file with your Firebase project config if you want to use your own Firebase project.

## Project output
Main pages:
- Rooms page: add/remove rooms.
![rooms image](/public/rooms_detils_img.png)
- Branches page: add branch details and roll numbers.
![branches image](/public/Branch_details_img.png)
- Seating arrange page: select rooms and branches, then generate seating.
![select branch and rooms image](/public/select_rooms_branches.png)
- Final seating output:
![after arranging](/public/final_seating_arrangement.png)
