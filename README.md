# Melody Mapper

This is a Next.js application for managing music students, their progress, and schedules. It uses Firebase for authentication and data storage.

## Firebase Setup

To run this application, you need to connect it to a Firebase project. If you don't have one, you can create one for free.

### Step 1: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and follow the on-screen instructions to create a new project.

### Step 2: Get Your Firebase Config

1.  In your new Firebase project, click the **</>** icon to add a web app.
2.  Give your app a nickname and click **Register app**.
3.  Firebase will provide you with a `firebaseConfig` object. It will look like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "jqxw...",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "1234567890",
      appId: "1:1234..."
    };
    ```

### Step 3: Add Config to Your Project

1.  In the root directory of this project, you'll find a file named `.env.local`.
2.  Copy the values from your `firebaseConfig` object into this file. The file is already set up with the correct variable names.

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    # ...and so on for all the keys.
    ```

### Step 4: Enable Authentication

1.  In the Firebase Console, go to the **Authentication** section.
2.  Click the **Sign-in method** tab.
3.  Click on **Email/Password** and enable it.

### Step 5: Set up Firestore Database

1.  In the Firebase Console, go to the **Firestore Database** section.
2.  Click **Create database**.
3.  Choose to start in **Production mode**.
4.  Select a location for your database.
5.  Go to the **Rules** tab in Firestore.
6.  Copy the contents of the `firestore.rules` file from this project and paste them into the rules editor in the console.
7.  Click **Publish**.

### Version : as of 8/3/25 - 1.2

##### For users outside of "teachers" and or "students" (recruiters, aplha/beta testers) create a teacher profile to explore the application and its features or Email me: trevor.b@aiomnihardware.org for a student demo or questions.

## Copyright © 2025 Trevor Matthias Bercich. All rights reserved.

This software and its source code are the intellectual property of Trevor Matthias Bercich and are protected under United States copyright law and international treaties.

Unauthorized copying, distribution, modification, or use of this code, in whole or in part, is strictly prohibited without prior written consent from the author.

This software is provided for evaluation purposes only and may not be used in commercial applications or derivative works without a licensing agreement.

Contact: [Trevor.b@aiomnihardware.org]

