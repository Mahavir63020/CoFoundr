# FoundryLink

FoundryLink is a platform that connects founders with talented individuals looking to join early-stage projects. It provides a streamlined way for founders to post their projects and for potential team members to discover and apply to opportunities.

## Features

- 🔐 Google Authentication
- 📝 Project Creation with Multi-step Form
- 🔍 Project Discovery with Filters
- 📋 Application Management
- 🔔 Real-time Notifications
- 📱 Responsive Design

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Firebase (Authentication & Firestore)
- Vite (Development Server)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/foundrylink.git
cd foundrylink
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Google Sign-in)
   - Create a Firestore database
   - Get your Firebase configuration

4. Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
foundrylink/
├── index.html              # Single-page application entry point
├── styles/
│   └── main.css           # Main stylesheet
├── scripts/
│   ├── auth.js            # Authentication handling
│   ├── firestore.js       # Database operations
│   ├── ui.js              # UI interactions
│   ├── router.js          # Page routing and navigation
│   ├── createProject.js   # Project creation form handling
│   ├── applications.js    # Applications management
│   └── firebase-config.js # Firebase configuration
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies
└── README.md             # Project documentation
```

## Application Architecture

FoundryLink is built as a single-page application (SPA) with the following key components:

- **Router**: Handles client-side routing and page transitions
- **Authentication**: Manages user authentication state and Google Sign-in
- **Database**: Handles all Firestore operations for projects and applications
- **UI Components**: Manages the user interface and interactions
- **Form Handling**: Processes project creation and application submissions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Firebase](https://firebase.google.com/) for backend services
- [Vite](https://vitejs.dev/) for the development server
- [Inter](https://rsms.me/inter/) for the font 