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
  onAuthStateChanged,
  createUserWithEmailAndPassword
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
  try {
    const snapshot = await Promise.race([
      getDocs(collection(db, "reservations")),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout Firebase")), 5000)
      )
    ]);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("❌ Error getReservations:", error);
    return [];
  }
}

export async function getReservationsByUser(userId) {
  try {
    const snapshot = await getDocs(collection(db, "reservations"));
    return snapshot.docs
      .filter(doc => doc.data().userId === userId)
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
  } catch (error) {
    console.error("❌ Error getReservationsByUser:", error);
    return [];
  }
}

export async function createReservation(data) {
  try {
    const docRef = await addDoc(collection(db, "reservations"), {
      ...data,
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("❌ Error createReservation:", error);
    throw error;
  }
}

export async function updateReservation(id, data) {
  try {
    await updateDoc(doc(db, "reservations", id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("❌ Error updateReservation:", error);
    throw error;
  }
}

export async function deleteReservation(id) {
  try {
    await deleteDoc(doc(db, "reservations", id));
  } catch (error) {
    console.error("❌ Error deleteReservation:", error);
    throw error;
  }
}

export async function confirmReservation(id) {
  try {
    await updateDoc(doc(db, "reservations", id), {
      status: 'confirmed',
      confirmedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("❌ Error confirmReservation:", error);
    throw error;
  }
}

export async function cancelReservation(id, reason = '') {
  try {
    await updateDoc(doc(db, "reservations", id), {
      status: 'cancelled',
      cancelledAt: serverTimestamp(),
      cancellationReason: reason,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("❌ Error cancelReservation:", error);
    throw error;
  }
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

export async function register(email, password, name) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Guardar datos adicionales del usuario en Firestore
    const userId = userCredential.user.uid;
    await addDoc(collection(db, "users"), {
      uid: userId,
      email: email,
      name: name,
      role: "user", // Por defecto, nuevos usuarios son "user"
      createdAt: serverTimestamp()
    });

    return {
      id: userId,
      email: email,
      name: name,
      role: "user"
    };
  } catch (error) {
    console.error("❌ Register error:", error);
    throw error;
  }
}

export async function logout() {
  await signOut(auth);
}

// 🔥 ADMIN EMAILS - Actualiza esta lista según tus admins
const ADMIN_EMAILS = ["admin@gmail.com", "diego@admin.com"];

// 🔥 GET CURRENT USER WITH ROLE
export async function getCurrentUser() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // Buscar el usuario en Firestore
          const snapshot = await getDocs(collection(db, "users"));
          const userDoc = snapshot.docs.find(doc => doc.data().uid === authUser.uid);
          
          if (userDoc) {
            resolve({
              id: authUser.uid,
              email: authUser.email,
              name: userDoc.data().name,
              role: userDoc.data().role || 'user'
            });
          } else {
            // Si no existe en Firestore, crear un registro básico
            const isAdmin = ADMIN_EMAILS.includes(authUser.email);
            resolve({
              id: authUser.uid,
              email: authUser.email,
              name: authUser.displayName || authUser.email.split('@')[0],
              role: isAdmin ? "admin" : "user"
            });
          }
        } catch (error) {
          console.error("Error getting user from Firestore:", error);
          const isAdmin = ADMIN_EMAILS.includes(authUser.email);
          resolve({
            id: authUser.uid,
            email: authUser.email,
            name: authUser.displayName || authUser.email.split('@')[0],
            role: isAdmin ? "admin" : "user"
          });
        }
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