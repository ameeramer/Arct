import React from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";

const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const { setData } = useProject();

  const project = {
    id: "example-project-1",
    size: "50",
    location: "נתניה",
    purpose: "פארק",
    description: "פארק ילדים",
    image: "../../example-2d-red-trees.jpeg",
    team: [
      { role: "אדריכל נוף", name: "דניאל כהן", avatar: "/avatars/daniel.jpg" }
    ],
  };

  const handleCardClick = () => {
    setData({
      size: project.size,
      location: project.location,
      purpose: project.purpose,
      description: project.description,
      photo: null,
      selectedDesignId: "1",
      designOptions: [{id: "1", image2d: "../../example-2d-red-trees.jpeg", image3d: "../../example-3d-red-trees.jpeg"}],
      team: project.team.map(member => ({
        role: member.role,
        assigned: true,
        memberId: member.name,
        image: member.avatar,
        name: member.name,
      })),
    });
    navigate("/project");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-right">
      <h1 className="text-2xl font-bold mb-6">הפרויקטים שלי</h1>
      <div
        className="border rounded-lg shadow hover:shadow-md transition cursor-pointer bg-white overflow-hidden"
        onClick={handleCardClick}
      >
        <img src={project.image} alt="תצוגת פרויקט" className="w-full h-52 object-cover" />
        <div className="p-4 space-y-1">
          <p className="text-xl font-bold">{project.description}</p>
          <p className="text-sm text-gray-600">
            מיקום: {project.location} | גודל: {project.size} מ״ר | שימוש: {project.purpose}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <img
              src={project.team[0].avatar}
              alt={project.team[0].name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm">{project.team[0].role}: {project.team[0].name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;
