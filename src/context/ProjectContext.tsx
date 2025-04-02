import React, { createContext, useContext, useState, ReactNode } from "react";

interface DesignOption {
  id: string;
  image2d: string;
  image3d: string;
}

interface TeamRole {
  role: string;
  assigned: boolean;
  memberId?: string;
  name?: string;
  image?: string;
}

interface ProjectData {
  size: string;
  location: string;
  purpose: string;
  description: string;
  photo: File | null;
  selectedDesignId: string | null;
  designOptions: DesignOption[];
  team: TeamRole[];
}

interface ProjectContextType {
  data: ProjectData;
  setData: (data: ProjectData) => void;
  addDesignOption: (option: DesignOption) => void;
}

const defaultData: ProjectData = {
  size: "",
  location: "",
  purpose: "",
  description: "",
  photo: null,
  selectedDesignId: null,
  designOptions: [],
  team: [],
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<ProjectData>(defaultData);

  const addDesignOption = (option: DesignOption) => {
    setData((prev) => ({
      ...prev,
      designOptions: [...prev.designOptions, option],
    }));
  };

  return (
    <ProjectContext.Provider value={{ data, setData, addDesignOption }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
export default ProjectContext;