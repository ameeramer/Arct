import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/storage';
import { createUserProfile } from '../services/users';
import { auth } from '../services/firebase';

export default function CompleteSignupPage() {
  const [name, setName] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name || !file || roles.length === 0 || !auth.currentUser) {
      setError('Please fill all fields and upload a profile image.');
      return;
    }

    const imageUrl = await uploadImage(file, `avatars/${auth.currentUser.uid}`);
    await createUserProfile({
      id: auth.currentUser.uid,
      name,
      avatar: imageUrl,
      roles,
      projects: []
    });

    navigate('/');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>

      <label className="block mb-2 font-medium">Your Name</label>
      <input
        type="text"
        className="w-full border px-4 py-2 rounded mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="block mb-2 font-medium">Your Roles</label>
      <div className="w-full border px-4 py-2 rounded mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {roles.map((r, idx) => (
            <span
              key={idx}
              className="bg-gray-200 text-sm px-3 py-1 rounded-full flex items-center gap-2"
            >
              {r}
              <button
                onClick={() => setRoles(roles.filter(role => role !== r))}
                className="text-red-500 font-bold"
                title="Remove role"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          className="w-full"
          placeholder="Type and press Enter..."
          value={roleInput}
          onChange={(e) => setRoleInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && roleInput.trim()) {
              e.preventDefault();
              if (!roles.includes(roleInput.trim())) {
                setRoles([...roles, roleInput.trim()]);
              }
              setRoleInput('');
            }
          }}
        />
      </div>

      <label className="block mb-2 font-medium">Profile Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full bg-black text-white py-2 rounded"
      >
        Continue
      </button>
    </div>
  );
}
