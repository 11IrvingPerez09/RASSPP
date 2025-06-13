try {
  var firebaseConfig = {
    apiKey: "AIzaSyDgpiwLo8E9Y7ctZu-PqEh8uaL6hEZXdLU",
    authDomain: "rassp-703df.firebaseapp.com",
    databaseURL: "https://rassp-703df-default-rtdb.firebaseio.com",
    projectId: "rassp-703df",
    storageBucket: "rassp-703df.firebasestorage.app",
    messagingSenderId: "951228414980",
    appId: "1:951228414980:web:a3a85933eb132b1748c951"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}
