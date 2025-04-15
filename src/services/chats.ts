import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export async function openOrCreateChat(
  userId1: string,
  userId2: string,
  initialMessage?: { senderId: string; text: string; createdAt: Timestamp }
): Promise<string> {
  const chatId = [userId1, userId2].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [userId1, userId2],
      createdAt: serverTimestamp(),
    });

    if (initialMessage) {
      const messagesRef = collection(chatRef, 'messages');
      await addDoc(messagesRef, {
        senderId: initialMessage.senderId,
        text: initialMessage.text,
        createdAt: initialMessage.createdAt,
      });
    }
  }

  return chatId;
}

export async function sendMessageInChat(chatId: string, senderId: string, text: string) {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
}