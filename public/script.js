import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
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
const provider = new GoogleAuthProvider();

const googleBtn = document.getElementById("googleSignInBtn");
const logoutBtn = document.getElementById("logoutBtn");
const navButtons = document.getElementById("navButtons");
const eventList = document.getElementById("eventList");

let user = null;

onAuthStateChanged(auth, (u) => {
  user = u;
  if (user) {
    googleBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    navButtons.style.display = "block";
    showEvents();
  } else {
    googleBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    navButtons.style.display = "none";
  }
});
const messageDiv = document.getElementById("message");
googleBtn.onclick = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      showMessage("Signed in as: " + result.user.displayName);
    })
    .catch((error) => showMessage("Error: " + error.message, true));
};

function showMessage(msg, isError = false) {
  messageDiv.textContent = msg;
  messageDiv.style.display = "block";
  messageDiv.style.background = isError ? "#ffe6e6" : "#e6f7ff";
  messageDiv.style.color = isError ? "#b60000" : "#0077b6";
  setTimeout(() => {
    messageDiv.style.display = "none";
  }, 3500);
}
logoutBtn.onclick = () => signOut(auth);

// Show Today's Events
function showEvents() {
  const today = new Date().toISOString().split("T")[0];
  const q = query(collection(db, "events"), orderBy("date"));

function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
}

  onSnapshot(q, (snapshot) => {
    eventList.innerHTML = "";
    snapshot.forEach(doc => {
      const e = doc.data();
      if (e.date === today) {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
        <strong>${e.title}</strong><br>
        <em>${e.organiser || "N/A"}</em><br>
        <span class="event-description">${e.description || ""}</span>
        <span class="event-details">
          🕒 ${e.time} | 📍 ${e.location} | 📅 ${formatDateDMY(e.date)}
        </span>
      `;
        eventList.appendChild(card);
      }
    });
  });
}



/*import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// 🔧 Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyABfGlmKaZSb-XHmb3ZgngglL1mWBuU7So",
  authDomain: "campus-bulletin-e5722.firebaseapp.com",
  projectId: "campus-bulletin-e5722",
  storageBucket: "campus-bulletin-e5722.firebasestorage.app",
  messagingSenderId: "750792867620",
  appId: "1:750792867620:web:61181af4f93167e78dbdb1"
};

// 🔌 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 🔗 UI Elements
const googleBtn = document.getElementById("googleSignInBtn");
const logoutBtn = document.getElementById("logoutBtn");
const submitEvent = document.getElementById("submitEvent");
const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");

let user = null;

// 👤 Auth State Change
onAuthStateChanged(auth, (u) => {
  user = u;
  if (user) {
    googleBtn.style.display = "none";
    logoutBtn.style.display = "block";
    eventForm.style.display = "block";
  } else {
    googleBtn.style.display = "block";
    logoutBtn.style.display = "none";
    eventForm.style.display = "none";
  }
});

// 🔐 Google Sign-In
googleBtn.onclick = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      alert("Signed in as: " + result.user.displayName);
    })
    .catch((error) => {
      alert("Google sign-in error: " + error.message);
    });
};

// 🔓 Logout
logoutBtn.onclick = () => signOut(auth);

// ➕ Add Event
submitEvent.onclick = async (event) => {
  event.preventDefault(); // Prevents form reload on submit

  const title = document.getElementById("title").value;
  const desc = document.getElementById("desc").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const location = document.getElementById("location").value;

  // Ensure that required fields are filled
  if (!title || !date || !time || !location) {
    return alert("Please fill all required fields.");
  }

  // Log form data for debugging
  console.log({ title, desc, date, time, location });

  try {
    // Add event to Firestore
    await addDoc(collection(db, "events"), {
      title,
      description: desc,
      date,
      time,
      location,
      createdBy: user.displayName || user.email,
      createdAt: serverTimestamp()
    });

    // Clear the form after submission
    document.getElementById("title").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("location").value = "";

    alert('Event added successfully!');
  } catch (error) {
    console.error("Error adding event: ", error);
    alert('Error adding event. Please try again later.');
  }
};

// 📅 Show Today’s Events
function showEvents() {
  const today = new Date().toISOString().split("T")[0];
  const q = query(collection(db, "events"), orderBy("date"));

  onSnapshot(q, (snapshot) => {
    eventList.innerHTML = "";
    snapshot.forEach(doc => {
      const e = doc.data();
      if (e.date === today) {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
          <strong>${e.title}</strong><br>
          ${e.description || ""}<br>
          🕒 ${e.time} | 📍 ${e.location}
        `;
        eventList.appendChild(card);
      }
    });
  });
}

showEvents();
===================
*/

/*import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// 🔧 Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyABfGlmKaZSb-XHmb3ZgngglL1mWBuU7So",
  authDomain: "campus-bulletin-e5722.firebaseapp.com",
  projectId: "campus-bulletin-e5722",
  storageBucket: "campus-bulletin-e5722.firebasestorage.app",
  messagingSenderId: "750792867620",
  appId: "1:750792867620:web:61181af4f93167e78dbdb1"
};

// 🔌 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 🔗 UI Elements
const googleBtn = document.getElementById("googleSignInBtn");
const logoutBtn = document.getElementById("logoutBtn");
const submitEvent = document.getElementById("submitEvent");
const eventForm = document.getElementById("eventForm");
const eventList = document.getElementById("eventList");

let user = null;

// 👤 Auth State Change
onAuthStateChanged(auth, (u) => {
  user = u;
  if (user) {
    googleBtn.style.display = "none";
    logoutBtn.style.display = "block";
    eventForm.style.display = "block";
  } else {
    googleBtn.style.display = "block";
    logoutBtn.style.display = "none";
    eventForm.style.display = "none";
  }
});

// 🔐 Google Sign-In
googleBtn.onclick = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      alert("Signed in as: " + result.user.displayName);
    })
    .catch((error) => {
      alert("Google sign-in error: " + error.message);
    });
};

// 🔓 Logout
logoutBtn.onclick = () => signOut(auth);

// ➕ Add Event
submitEvent.onclick = async () => {
  const title = document.getElementById("title").value;
  const desc = document.getElementById("desc").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const location = document.getElementById("location").value;

  if (!title || !date || !time || !location) {
    return alert("Please fill all required fields.");
  }

  await addDoc(collection(db, "events"), {
    title,
    description: desc,
    date,
    time,
    location,
    createdBy: user.displayName || user.email,
    createdAt: serverTimestamp()
  });

  document.getElementById("title").value = "";
  document.getElementById("desc").value = "";
  document.getElementById("date").value = "";
  document.getElementById("time").value = "";
  document.getElementById("location").value = "";
};

// 📅 Show Today’s Events
function showEvents() {
  const today = new Date().toISOString().split("T")[0];
  const q = query(collection(db, "events"), orderBy("date"));

  onSnapshot(q, (snapshot) => {
    eventList.innerHTML = "";
    snapshot.forEach(doc => {
      const e = doc.data();
      if (e.date === today) {
        const card = document.createElement("div");
        card.className = "event-card";
        card.innerHTML = `
          <strong>${e.title}</strong><br>
          ${e.description || ""}<br>
          🕒 ${e.time} | 📍 ${e.location}
        `;
        eventList.appendChild(card);
      }
    });
  });
}

showEvents();

*/

// import { initializeApp } from "firebase/app";
// // Your Firebase Config (replace with your actual config)
// const firebaseConfig = {
//   apiKey: "AIzaSyABfGlmKaZSb-XHmb3ZgngglL1mWBuU7So",
//   authDomain: "campus-bulletin-e5722.firebaseapp.com",
//   projectId: "campus-bulletin-e5722",
//   storageBucket: "campus-bulletin-e5722.firebasestorage.app",
//   messagingSenderId: "750792867620",
//   appId: "1:750792867620:web:61181af4f93167e78dbdb1"
// };

// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();

// // Get references to UI elements
// const loginBtn = document.getElementById("loginBtn");
// const signupBtn = document.getElementById("signupBtn");
// const logoutBtn = document.getElementById("logoutBtn");
// const eventForm = document.getElementById("eventForm");
// const submitEvent = document.getElementById("submitEvent");
// const eventList = document.getElementById("eventList");

// const emailInput = document.getElementById("email");
// const passwordInput = document.getElementById("password");

// let user = null;

// // Sign Up with email/password
// signupBtn.onclick = () => {
//   const email = emailInput.value;
//   const password = passwordInput.value;
//   if (!email || !password) return alert("Please enter email and password");
  
//   auth.createUserWithEmailAndPassword(email, password)
//     .then(() => {
//       alert("Signed up successfully! You can now login.");
//       emailInput.value = "";
//       passwordInput.value = "";
//     })
//     .catch(err => alert(err.message));
// };

// // 🔐 Login with email/password
// loginBtn.onclick = () => {
//   const email = emailInput.value;
//   const password = passwordInput.value;
//   if (!email || !password) return alert("Please enter email and password");

//   auth.signInWithEmailAndPassword(email, password)
//     .catch(err => alert(err.message));
// };

// // Logout
// logoutBtn.onclick = () => auth.signOut();

// // 👤 Auth State Listener
// auth.onAuthStateChanged((u) => {
//   user = u;
//   if (user) {
//     loginBtn.style.display = "none";
//     signupBtn.style.display = "none";
//     logoutBtn.style.display = "block";
//     eventForm.style.display = "block";

//     // Optionally hide email/password inputs when logged in
//     emailInput.style.display = "none";
//     passwordInput.style.display = "none";
//   } else {
//     loginBtn.style.display = "block";
//     signupBtn.style.display = "block";
//     logoutBtn.style.display = "none";
//     eventForm.style.display = "none";

//     emailInput.style.display = "block";
//     passwordInput.style.display = "block";
//   }
// });

// // ➕ Add Event (same as before)
// submitEvent.onclick = async () => {
//   const title = document.getElementById("title").value;
//   const desc = document.getElementById("desc").value;
//   const date = document.getElementById("date").value;
//   const time = document.getElementById("time").value;
//   const location = document.getElementById("location").value;

//   if (!title || !date || !time || !location) return alert("Fill all required fields!");

//   await db.collection("events").add({
//     title,
//     description: desc,
//     date,
//     time,
//     location,
//     createdBy: user.email,
//     createdAt: firebase.firestore.FieldValue.serverTimestamp()
//   });

//   document.getElementById("title").value = "";
//   document.getElementById("desc").value = "";
//   document.getElementById("date").value = "";
//   document.getElementById("time").value = "";
//   document.getElementById("location").value = "";
// };

// // 📅 Show Today’s Events (same as before)
// function showEvents() {
//   const today = new Date().toISOString().split("T")[0];

//   db.collection("events")
//     .orderBy("date")
//     .onSnapshot(snapshot => {
//       eventList.innerHTML = "";

//       snapshot.docs.forEach(doc => {
//         const e = doc.data();
//         if (e.date === today) {
//           const card = document.createElement("div");
//           card.className = "event-card";
//           card.innerHTML = `
//             <strong>${e.title}</strong><br>
//             ${e.description}<br>
//             🕒 ${e.time} | 📍 ${e.location}
//           `;
//           eventList.appendChild(card);
//         }
//       });
//     });
// }

// showEvents();


// // 🔥 Your Firebase Config (replace with your actual config)
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// firebase.initializeApp(firebaseConfig);
// const auth = firebase.auth();
// const db = firebase.firestore();

// const loginBtn = document.getElementById("loginBtn");
// const logoutBtn = document.getElementById("logoutBtn");
// const eventForm = document.getElementById("eventForm");
// const submitEvent = document.getElementById("submitEvent");
// const eventList = document.getElementById("eventList");

// let user = null;

// // 🔐 Handle Login
// loginBtn.onclick = () => {
//   const provider = new firebase.auth.GoogleAuthProvider();
//   auth.signInWithPopup(provider);
// };

// logoutBtn.onclick = () => auth.signOut();

// // 👤 Auth State Listener
// auth.onAuthStateChanged((u) => {
//   user = u;
//   if (user) {
//     loginBtn.style.display = "none";
//     logoutBtn.style.display = "block";
//     eventForm.style.display = "block";
//   } else {
//     loginBtn.style.display = "block";
//     logoutBtn.style.display = "none";
//     eventForm.style.display = "none";
//   }
// });

// // ➕ Add Event
// submitEvent.onclick = async () => {
//   const title = document.getElementById("title").value;
//   const desc = document.getElementById("desc").value;
//   const date = document.getElementById("date").value;
//   const time = document.getElementById("time").value;
//   const location = document.getElementById("location").value;

//   if (!title || !date || !time || !location) return alert("Fill all required fields!");

//   await db.collection("events").add({
//     title,
//     description: desc,
//     date,
//     time,
//     location,
//     createdBy: user.email,
//     createdAt: firebase.firestore.FieldValue.serverTimestamp()
//   });

//   document.getElementById("title").value = "";
//   document.getElementById("desc").value = "";
//   document.getElementById("date").value = "";
//   document.getElementById("time").value = "";
//   document.getElementById("location").value = "";
// };

// // 📅 Show Today’s Events
// function showEvents() {
//   const today = new Date().toISOString().split("T")[0];

//   db.collection("events")
//     .orderBy("date")
//     .onSnapshot(snapshot => {
//       eventList.innerHTML = "";

//       snapshot.docs.forEach(doc => {
//         const e = doc.data();
//         if (e.date === today) {
//           const card = document.createElement("div");
//           card.className = "event-card";
//           card.innerHTML = `
//             <strong>${e.title}</strong><br>
//             ${e.description}<br>
//             🕒 ${e.time} | 📍 ${e.location}
//           `;
//           eventList.appendChild(card);
//         }
//       });
//     });
// }

// showEvents();
