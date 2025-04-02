import React from "react";

interface Post {
  image: string;
  caption: string;
}

interface Professional {
  id: string;
  name: string;
  expertise: string;
  profileImage: string;
  bio: string;
  posts: Post[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  professional: Professional | null;
}

const ProfessionalProfileModal: React.FC<Props> = ({ open, onClose, professional }) => {
  if (!open || !professional) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-gray-600 hover:text-black"
        >
          ✕
        </button>
        <div className="flex items-center mb-4">
          <img
            src={professional.profileImage}
            alt={professional.name}
            className="w-20 h-20 rounded-full object-cover ml-4"
          />
          <div className="text-right">
            <h2 className="text-xl font-bold">{professional.name}</h2>
            <p className="text-sm text-gray-500">{professional.expertise}</p>
          </div>
        </div>
        <p className="text-gray-700 mb-6 text-right">{professional.bio}</p>
        <div className="max-h-[60vh] overflow-y-auto space-y-6">
          {professional.posts.map((post, i) => (
            <div key={i} className="text-right">
              <img
                src={post.image}
                alt={post.caption}
                className="w-full aspect-[4/5] object-cover rounded mb-2"
              />
              <p className="text-sm text-gray-700">{post.caption}</p>
              <div className="mt-2 text-sm text-gray-500">💬 אין תגובות עדיין</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfileModal;
