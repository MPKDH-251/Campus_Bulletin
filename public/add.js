import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABfGlmKaZSb-XHmb3ZgngglL1mWBuU7So",
  authDomain: "campus-bulletin-e5722.firebaseapp.com",
  projectId: "campus-bulletin-e5722",
  storageBucket: "campus-bulletin-e5722.appspot.com",
  messagingSenderId: "750792867620",
  appId: "1:750792867620:web:61181af4f93167e78dbdb1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let user = null;

onAuthStateChanged(auth, (u) => user = u);

document.getElementById("submitEvent").onclick = async () => {
  const title = document.getElementById("title").value;
  const desc = document.getElementById("desc").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const location = document.getElementById("location").value;
  const organiser = document.getElementById("organiser").value;

  if (!title || !date || !time || !location || !organiser) {
    return alert("Please fill all required fields.");
  }

  try {
    await addDoc(collection(db, "events"), {
      title,
      description: desc,
      date,
      time,
      location,
      organiser,
      createdBy: user.uid,
      creatorName: user.displayName,
      createdAt: serverTimestamp()
    });
    window.location.href = "success.html";
  } catch (err) {
    alert("Error adding event.");
    console.error(err);
  }
};
