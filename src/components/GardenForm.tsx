import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { ProjectData } from "../context/ProjectContext";
import { v4 as uuidv4 } from "uuid"; // Add this line

export default function GardenForm() {
  const { data, setData, addDesignOption } = useProject(); // ← Replace local state
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setData((prev: ProjectData) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setData((prev: ProjectData) => ({ ...prev, photo: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDesignOption({ 
      id: uuidv4(), 
      image2d: "/example-2d.jpeg",
      image3d: "/example-3d.jpeg" 
    });
    navigate("/preview");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-200">
      <h1 className="text-2xl font-bold text-center mb-6">תיאור השטח</h1>
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        <div>
          <label className="block text-sm font-medium">גודל השטח (במטרים רבועים)</label>
          <input
            type="text"
            name="size"
            value={data.size}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">מיקום כללי (עיר/אזור)</label>
          <input
            type="text"
            name="location"
            value={data.location}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">שימוש מיועד</label>
          <input
            type="text"
            name="purpose"
            value={data.purpose}
            onChange={handleChange}
            placeholder="לדוגמה: אזור ישיבה, גינת ירק, משחק לילדים..."
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">תיאור חופשי</label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">העלאת תמונה (אופציונלי)</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-2" />
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
        >
          המשך
        </button>
      </form>
    </div>
  );
}
