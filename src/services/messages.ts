import { db } from './firebase';
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';

const messagesRef = collection(db, 'messages');
const joinRequestsRef = collection(db, 'joinRequests');

// Send a regular message
export async function sendMessage(fromUserId: string, toUserId: string, text: string) {
  const newMessage = {
    fromUserId,
    toUserId,
    text,
    read: false,
    type: 'message',
    createdAt: Timestamp.now(),
  };
  await addDoc(messagesRef, newMessage);
}

// Mark message as read
export async function markMessageAsRead(messageId: string) {
  const ref = doc(db, 'messages', messageId);
  await updateDoc(ref, { read: true });
}

// Fetch unified inbox for user
export async function getUnifiedInboxForUser(userId: string) {
  const inbox: any[] = [];

  // Get unread messages
  const msgQuery = query(
    messagesRef,
    where('toUserId', '==', userId),
    where('read', '==', false)
  );
  const msgSnap = await getDocs(msgQuery);
  msgSnap.forEach((docSnap) => {
    inbox.push({ id: docSnap.id, type: 'message', ...docSnap.data() });
  });

  // Get unread join requests
  const joinQuery = query(
    joinRequestsRef,
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  );
  const joinSnap = await getDocs(joinQuery);
  joinSnap.forEach((docSnap) => {
    inbox.push({ id: docSnap.id, type: 'joinRequest', ...docSnap.data() });
  });

  // Sort by createdAt descending
  return inbox.sort(
    (a, b) => b.createdAt?.seconds - a.createdAt?.seconds
  );
}
