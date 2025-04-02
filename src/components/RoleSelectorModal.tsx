import React from "react";

interface RoleSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (role: string) => void;
}

const roles = [
  "אדריכל נוף",
  "מודד",
  "מעצב פנים",
  "קבלן ביצוע",
  "יועץ השקיה",
];

const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-right">
          בחר תפקיד להוספה
        </h2>
        <ul className="space-y-3 text-right">
          {roles.map((role, index) => (
            <li
              key={index}
              className="cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => {
                onSelect(role);
                onClose();
              }}
            >
              {role}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded"
        >
          ביטול
        </button>
      </div>
    </div>
  );
};

export default RoleSelectorModal;
