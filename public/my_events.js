import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc // Import deleteDoc for deleting events
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Firebase config
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

const myEventList = document.getElementById("myEventList");

// Modal Elements
const confirmationModal = document.getElementById("confirmationModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let docIdToDelete = null; // Store the document ID for the event to delete

function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
}
onAuthStateChanged(auth, (user) => {
  if (user) {
    const q = query(
      collection(db, "events"),
      where("createdBy", "==", user.uid)
    );

    onSnapshot(q, (snapshot) => {
      myEventList.innerHTML = "";

      if (snapshot.empty) {
        myEventList.innerHTML = "<p>No events scheduled by you.</p>";
        return;
      }

      snapshot.forEach(docSnap => {
        const e = docSnap.data();
        const docId = docSnap.id;

        const eventCard = document.createElement("div");
        eventCard.className = "event-card";
        eventCard.innerHTML = `
          <div class="event-display" id="view-${docId}">
            <strong>${e.title}</strong><br>
            ${e.description || ""}<br>
            Organising Body: <em>${e.organiser || "N/A"}</em><br>
            🕒 ${e.time} | 📍 ${e.location} | 📅 ${formatDateDMY(e.date)}<br>
            <button class="edit-btn" data-id="${docId}">Edit</button>
            <button class="delete-btn" data-id="${docId}">Delete</button> <!-- Add Delete Button -->
            <div class="status-message" id="status-${docId}"></div>
          </div>

          <form class="edit-form" id="form-${docId}" data-id="${docId}" style="display: none;">
            <label>Title:</label><br>
            <input type="text" name="title" value="${e.title}" required><br>
            <label>Organising Body:</label><br>
            <input type="text" name="organiser" value="${e.organiser || ""}" required><br>
            <label>Description:</label><br>
            <textarea name="description">${e.description || ""}</textarea><br>
            <label>Date:</label><br>
            <input type="date" name="date" value="${formatDateDMY(e.date)}" required><br>
            <label>Time:</label><br>
            <input type="time" name="time" value="${e.time}" required><br>
            <label>Location:</label><br>
            <input type="text" name="location" value="${e.location}" required><br>
            <button type="submit">Save</button>
            <button type="button" class="cancel-btn" data-id="${docId}">Cancel</button>
          </form>
        `;

        myEventList.appendChild(eventCard);
      });

      // Add event listeners to toggle edit mode
      document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-id");
          document.getElementById(`view-${id}`).style.display = "none";
          document.getElementById(`form-${id}`).style.display = "block";
        });
      });

      // Add cancel button functionality
      document.querySelectorAll(".cancel-btn").forEach(button => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-id");
          document.getElementById(`form-${id}`).style.display = "none";
          document.getElementById(`view-${id}`).style.display = "block";
        });
      });

      // Add submit functionality for editing events
      document.querySelectorAll(".edit-form").forEach(form => {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const docId = form.getAttribute("data-id");
          const formData = new FormData(form);
          const updatedEvent = {
            title: formData.get("title"),
            organiser: formData.get("organiser"),
            description: formData.get("description"),
            date: formData.get("date"),
            time: formData.get("time"),
            location: formData.get("location")
          };

          const status = document.getElementById(`status-${docId}`);

          try {
            await updateDoc(doc(db, "events", docId), updatedEvent);
            status.textContent = "✅ Event updated!";
            status.style.color = "green";
            form.style.display = "none";
            document.getElementById(`view-${docId}`).style.display = "block";
          } catch (err) {
            status.textContent = "❌ Failed to update event.";
            status.style.color = "red";
          }

          setTimeout(() => (status.textContent = ""), 3000);
        });
      });

      // Add event listener for Delete button
      document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
          const docId = button.getAttribute("data-id");
          docIdToDelete = docId; // Store the doc ID to delete

          // Show the confirmation modal
          confirmationModal.style.display = "flex";
        });
      });

      // Handle Confirm Delete
      confirmDeleteBtn.addEventListener("click", async () => {
        const status = document.getElementById(`status-${docIdToDelete}`);
        try {
          // Delete event from Firestore
          await deleteDoc(doc(db, "events", docIdToDelete));
          status.textContent = "❌ Event deleted!";
          status.style.color = "red";

          // Remove event from the DOM
          document.getElementById(`view-${docIdToDelete}`).parentElement.remove();
        } catch (err) {
          status.textContent = "❌ Failed to delete event.";
          status.style.color = "red";
        }
        // Hide the confirmation modal
        confirmationModal.style.display = "none";
        setTimeout(() => (status.textContent = ""), 3000);
      });

      // Handle Cancel Delete
      cancelDeleteBtn.addEventListener("click", () => {
        confirmationModal.style.display = "none"; // Hide the modal
      });
    });
  } else {
    myEventList.innerHTML = "<p>Please sign in to view your events.</p>";
  }
});

/*import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Firebase config
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

const myEventList = document.getElementById("myEventList");

onAuthStateChanged(auth, (user) => {
  if (user) {
    const q = query(
      collection(db, "events"),
      where("createdBy", "==", user.uid)
    );

    onSnapshot(q, (snapshot) => {
      myEventList.innerHTML = "";

      if (snapshot.empty) {
        myEventList.innerHTML = "<p>No events scheduled by you.</p>";
        return;
      }

      snapshot.forEach(docSnap => {
        const e = docSnap.data();
        const docId = docSnap.id;

        const eventCard = document.createElement("div");
        eventCard.className = "event-card";
        eventCard.innerHTML = `
          <div class="event-display" id="view-${docId}">
            <strong>${e.title}</strong><br>
            ${e.description || ""}<br>
            Organising Body: <em>${e.organiser || "N/A"}</em><br>
            🕒 ${e.time} | 📍 ${e.location} | 📅 ${e.date}<br>
            <button class="edit-btn" data-id="${docId}">Edit</button>
            <div class="status-message" id="status-${docId}"></div>
          </div>

          <form class="edit-form" id="form-${docId}" data-id="${docId}" style="display: none;">
            <label>Title:</label><br>
            <input type="text" name="title" value="${e.title}" required><br>
            <label>Organising Body:</label><br>
            <input type="text" name="organiser" value="${e.organiser || ""}" required><br>
            <label>Description:</label><br>
            <textarea name="description">${e.description || ""}</textarea><br>
            <label>Date:</label><br>
            <input type="date" name="date" value="${e.date}" required><br>
            <label>Time:</label><br>
            <input type="time" name="time" value="${e.time}" required><br>
            <label>Location:</label><br>
            <input type="text" name="location" value="${e.location}" required><br>
            <button type="submit">Save</button>
            <button type="button" class="cancel-btn" data-id="${docId}">Cancel</button>
          </form>
        `;

        myEventList.appendChild(eventCard);
      });

      // Add event listeners to toggle edit mode
      document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-id");
          document.getElementById(`view-${id}`).style.display = "none";
          document.getElementById(`form-${id}`).style.display = "block";
        });
      });

      // Add cancel button functionality
      document.querySelectorAll(".cancel-btn").forEach(button => {
        button.addEventListener("click", () => {
          const id = button.getAttribute("data-id");
          document.getElementById(`form-${id}`).style.display = "none";
          document.getElementById(`view-${id}`).style.display = "block";
        });
      });

      // Add submit functionality
      document.querySelectorAll(".edit-form").forEach(form => {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const docId = form.getAttribute("data-id");
          const formData = new FormData(form);
          const updatedEvent = {
            title: formData.get("title"),
            organiser: formData.get("organiser"),
            description: formData.get("description"),
            date: formData.get("date"),
            time: formData.get("time"),
            location: formData.get("location")
          };

          const status = document.getElementById(`status-${docId}`);

          try {
            await updateDoc(doc(db, "events", docId), updatedEvent);
            status.textContent = "✅ Event updated!";
            status.style.color = "green";
            form.style.display = "none";
            document.getElementById(`view-${docId}`).style.display = "block";
          } catch (err) {
            status.textContent = "❌ Failed to update event.";
            status.style.color = "red";
          }

          setTimeout(() => (status.textContent = ""), 3000);
        });
      });
    });
  } else {
    myEventList.innerHTML = "<p>Please sign in to view your events.</p>";
  }
});
*/


// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
// import {
//   getAuth,
//   onAuthStateChanged
// } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   onSnapshot,
//   doc,
//   updateDoc
// } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore";
