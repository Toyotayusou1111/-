import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwp0AEXFx9KcPn7ZC90BkK_ATZo",
  authDomain: "lift-log-cloud.firebaseapp.com",
  projectId: "lift-log-cloud",
  storageBucket: "lift-log-cloud.appspot.com",
  messagingSenderId: "148009173979",
  appId: "1:148009173979:web:fbb65f7b839f924e6cb3e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, serverTimestamp };
