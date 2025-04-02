import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import GardenForm from "./components/GardenForm";
import DesignPreview from "./pages/DesignPreview";
import { ProjectProvider } from "./context/ProjectContext";
import ProjectOverview from "./pages/ProjectOverview";
import ProfessionalSearch from "./pages/ProfessionalSearch";
import ProjectsList from "./pages/ProjectsList";

const App: React.FC = () => {
  return (
    <Router>
      <ProjectProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/form" element={<GardenForm />} />
          <Route path="/preview" element={<DesignPreview />} /> 
          <Route path="/project" element={<ProjectOverview />} />
          <Route path="/search" element={<ProfessionalSearch />} />
          <Route path="/projects" element={<ProjectsList />} />
        </Routes>
      </ProjectProvider>
    </Router>
  );
};

export default App;