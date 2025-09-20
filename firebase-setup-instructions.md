# Firebase Setup Instructions

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "smart-talent-allocator"
4. Enable Google Analytics (optional)
5. Create project

## 2. Enable Authentication
1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Enable "Google" provider
   - Add your domain to authorized domains
   - Configure OAuth consent screen if needed

## 3. Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add rules later)
4. Select your preferred location

## 4. Set up Firestore Security Rules
1. Go to "Firestore Database" > "Rules"
2. Copy the content from `firestore-rules.txt` and paste it
3. Click "Publish"

## 5. Create Firestore Indexes
1. Go to "Firestore Database" > "Indexes"
2. Click "Add index" for each index in `firebase-indexes.json`:

### Index 1: Managers by Email
- Collection ID: `managers`
- Fields: `email` (Ascending)
- Query scope: Collection

### Index 2: Employees by Email  
- Collection ID: `employees`
- Fields: `email` (Ascending)
- Query scope: Collection

### Index 3: Managers by UID
- Collection ID: `managers` 
- Fields: `uid` (Ascending)
- Query scope: Collection

### Index 4: Employees by UID
- Collection ID: `employees`
- Fields: `uid` (Ascending) 
- Query scope: Collection

## 6. Get Configuration Keys
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon to add web app
4. Register app with nickname
5. Copy the config object values to your `.env` file:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 7. Configure OAuth (for Google Sign-in)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to "APIs & Services" > "Credentials"
4. Configure OAuth consent screen
5. Add authorized domains (localhost:5173 for development)

## 8. Test the Setup
1. Try signing up with email/password
2. Try signing in with Google
3. Check Firestore to see if user documents are created
4. Verify authentication works correctly

## Notes
- The rules allow users to read/write their own profiles
- Managers can read employee profiles for team management
- Employees can read manager profiles for reporting structure
- Indexes optimize queries for email and UID lookups