import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { submitQuote } from "../services/quotes";
import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

const possibleTags = [
  "Surveyor",
  "Gardener",
  "Irrigation Designer",
  "Cladding Installer",
  "Landscape Architect",
  "Interior Designer",
  "Contractor",
];

export default function SubmitQuotePage() {
  const { projectId } = useParams();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRanges, setPriceRanges] = useState<{ [tag: string]: string }>({});
  const [submittedTags, setSubmittedTags] = useState<{ label: string; priceRange: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    async function fetchSubmittedTags() {
      if (!projectId) return;
      const q = query(collection(db, "quotes"), where("projectId", "==", projectId));
      const snapshot = await getDocs(q);
      const tags = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          label: data.tag,
          priceRange: data.priceRange,
        };
      });
      setSubmittedTags(tags);
    }
    fetchSubmittedTags();
  }, [projectId]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePriceChange = (tag: string, value: string) => {
    setPriceRanges((prev) => ({ ...prev, [tag]: value }));
  };

  const handleDeleteQuote = async (tag: string) => {
    if (!projectId) return;
    const q = query(collection(db, "quotes"), where("projectId", "==", projectId), where("tag", "==", tag));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(doc(db, "quotes", snapshot.docs[0].id));
    }
    setSubmittedTags(prev => prev.filter(t => t.label !== tag));
    setPriceRanges(prev => {
      const updated = { ...prev };
      delete updated[tag];
      return updated;
    });
    setDeleted(true);
    setTimeout(() => setDeleted(false), 2500);
  };

  const handleSubmit = async () => {
    if (!projectId) return;
    const allTags = [...new Set([...selectedTags, ...submittedTags.map(t => t.label)])];
    const updatedTags = allTags.filter(tag => {
      const submittedTag = submittedTags.find(t => t.label === tag);
      return (
        !submittedTag || (priceRanges[tag] !== undefined && priceRanges[tag] !== submittedTag.priceRange)
      );
    });

    if (updatedTags.length === 0) {
      setError(true);
      setTimeout(() => setError(false), 2500);
      return;
    }

    for (const tag of updatedTags) {
      await submitQuote({
        projectId,
        tag,
        priceRange: priceRanges[tag] || "",
        createdAt: new Date(),
      });
    }

    setSubmittedTags(prev => {
      const others = prev.filter(t => !updatedTags.includes(t.label));
      const updated = updatedTags.map(tag => ({
        label: tag,
        priceRange: priceRanges[tag] || ""
      }));
      return [...others, ...updated];
    });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
    setError(false);
  };

  return (
    <div className="px-6 pt-6 pb-28 min-h-screen py-6 bg-neutral-50">
      <h1 className="text-2xl font-bold text-center">Submit for quote</h1>
      <p className="text-center text-gray-500 mb-4">
        Project: <span className="font-medium">Tropical Garden</span>
      </p>

      {deleted && (
        <div className="flex flex-col items-center mt-4 mb-4 p-4 border rounded-lg bg-white shadow">
          <p className="text-base font-medium text-green-600">Deleted Successfully</p>
          <div className="text-2xl mt-1">🗑️</div>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center mt-10 p-6 border rounded-lg bg-white shadow">
          <p className="text-xl font-semibold text-red-600">
            You haven’t added any new professions to submit to
          </p>
          <div className="text-4xl mt-2">❌</div>
        </div>
      )}

      {submitted && (
        <div className="flex flex-col items-center mt-4 mb-6 p-6 border rounded-lg bg-white shadow">
          <p className="text-xl font-semibold text-green-600">Submitted Successfully</p>
          <div className="text-4xl mt-2">✅</div>
        </div>
      )}

      <input
        type="text"
        placeholder="Search for tags"
        className="w-full mb-4 p-2 rounded border"
      />
      <div className="flex flex-wrap gap-2 mb-6">
        {possibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 rounded-full border ${
              selectedTags.includes(tag)
                ? "bg-green-200"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {tag}
            {submittedTags.some(t => t.label === tag) && (
              <span className="text-green-600 ml-2">✅</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border rounded-lg bg-white shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Price range</h2>
        {[...new Set([...selectedTags, ...submittedTags.map(t => t.label)])].map((tag) => {
          const submittedTag = submittedTags.find(t => t.label === tag);
          const currentPrice = priceRanges[tag] || submittedTag?.priceRange || "";
          const isSameAsSubmitted = submittedTag && submittedTag.priceRange === currentPrice;
          return (
            <div key={tag} className="flex items-center gap-2 mb-3">
              <button
                onClick={() => handleDeleteQuote(tag)}
                className="text-red-500 font-bold text-lg px-2"
                title="Delete quote"
              >
                ×
              </button>
              <span className="min-w-[130px] text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">
                {tag}
              </span>
              <input
                type="text"
                placeholder="$..."
                value={currentPrice}
                onChange={(e) => handlePriceChange(tag, e.target.value)}
                className="flex-1 p-2 border rounded bg-white"
              />
              {isSameAsSubmitted && <span className="text-green-600 text-lg">✅</span>}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-black text-white py-3 rounded text-lg font-semibold"
      >
        Submit for quote
      </button>
    </div>
  );
}
