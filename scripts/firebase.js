'use strict';

const firebaseConfig = {
  apiKey: "AIzaSyASpU_yaLnhI4-XggKT4ypnxsNXo1XJZcU",
  authDomain: "checklist-8e122.firebaseapp.com",
  projectId: "checklist-8e122",
  storageBucket: "checklist-8e122.firebasestorage.app",
  messagingSenderId: "529447531885",
  appId: "1:529447531885:web:b3999f87f3732d76871664",
  measurementId: "G-8ZLBVWGJJJ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
