// ═══════════════════════════════════════════════════════════════
// 🔥 FIREBASE SERVICE COMPLETO
// ═══════════════════════════════════════════════════════════════

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { db, auth } from "./firebaseConfig";

// ═══ RESOURCES ═════════════════════════════════════════════════

export async function getResources() {
  try {
    const snapshot = await Promise.race([
      getDocs(collection(db, "resources")),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout Firebase")), 5000)
      )
    ]);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("❌ Error getResources:", error);
    return [];
  }
}

export async function createResource(data) {
  const docRef = await addDoc(collection(db, "resources"), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateResource(id, data) {
  await updateDoc(doc(db, "resources", id), data);
}

export async function deleteResource(id) {
  await deleteDoc(doc(db, "resources", id));
}

// ═══ RESERVATIONS ══════════════════════════════════════════════

export async function getReservations() {
  const snapshot = await getDocs(collection(db, "reservations"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createReservation(data) {
  const docRef = await addDoc(collection(db, "reservations"), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateReservation(id, data) {
  await updateDoc(doc(db, "reservations", id), data);
}

export async function deleteReservation(id) {
  await deleteDoc(doc(db, "reservations", id));
}

// ═══ LOANS ═════════════════════════════════════════════════════

export async function getLoans() {
  const snapshot = await getDocs(collection(db, "loans"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createLoan(data) {
  const docRef = await addDoc(collection(db, "loans"), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateLoan(id, data) {
  await updateDoc(doc(db, "loans", id), data);
}

export async function deleteLoan(id) {
  await deleteDoc(doc(db, "loans", id));
}

// ═══ USERS ═════════════════════════════════════════════════════

export async function getUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function createUser(data) {
  const docRef = await addDoc(collection(db, "users"), {
    ...data,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateUser(id, data) {
  await updateDoc(doc(db, "users", id), data);
}

// ═══ AUTH ══════════════════════════════════════════════════════

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    return {
      id: userCredential.user.uid,
      email: userCredential.user.email
    };
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}

// 🔥 AQUÍ DEFINES QUIÉN ES ADMIN
export async function getCurrentUser() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve({
          id: user.uid,
          email: user.email,
          role: user.email === "admin@gmail.com" ? "admin" : "user"
        });
      } else {
        resolve(null);
      }
    });
  });
}

// ═══ STATS ═════════════════════════════════════════════════════

export async function getStats() {
  const resources = await getResources();
  const loans = await getLoans();

  return {
    totalResources: resources.length,
    available: resources.filter(r => r.status === "available").length,
    loaned: resources.filter(r => r.status === "loaned").length,
    reserved: resources.filter(r => r.status === "reserved").length,
    maintenance: resources.filter(r => r.status === "maintenance").length,
    totalLoansMonth: loans.length,
    punctualityRate: 100,
    delaysMonth: 0,
    incidentsMonth: 0,
  };
}