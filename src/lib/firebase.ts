import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2CsKnnnWGFZUX4rnUEQk_Z5LP8Wez6zI",
  authDomain: "moujyatra.firebaseapp.com",
  projectId: "moujyatra",
  storageBucket: "moujyatra.firebasestorage.app",
  messagingSenderId: "904315439256",
  appId: "1:904315439256:web:dad8bf99dacc06c42ee8ed",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
