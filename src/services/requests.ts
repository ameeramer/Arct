import { addDoc, collection, getDocs, query, where, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

const joinRequestsCollection = collection(db, 'joinRequests');

export async function sendJoinRequest(fromUserId: string, toUserId: string, projectId: string, quoteId: string, message: string) {
  const newRequest = {
    fromUserId,
    toUserId,
    projectId,
    quoteId,
    message,
    status: 'pending',
    createdAt: Timestamp.now(),
  };
  await addDoc(joinRequestsCollection, newRequest);
}

export async function getJoinRequestsForUser(userId: string) {
  const q = query(joinRequestsCollection, where('toUserId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getJoinRequestsByUserForProject(userId: string, projectId: string) {
  const q = query(joinRequestsCollection, where('fromUserId', '==', userId), where('projectId', '==', projectId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateJoinRequestStatus(requestId: string, status: 'accepted' | 'rejected') {
  const requestRef = doc(db, 'joinRequests', requestId);
  await updateDoc(requestRef, { status });
}
