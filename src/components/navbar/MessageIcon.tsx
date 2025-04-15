import { useEffect, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'; // changed icon
import { getUnifiedInboxForUser } from '../../services/messages';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function MessageIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInbox = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const inbox = await getUnifiedInboxForUser(user.uid);
      setUnreadCount(inbox.length);
    };

    fetchInbox(); // initial call

    const intervalId = setInterval(fetchInbox, 10000); // every 10 seconds

    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer"
      onClick={() => navigate('/messages')}
    >
      <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-700" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
