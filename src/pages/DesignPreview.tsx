import React from "react";
import DesignViewer from "../components/DesignViewer";
import AiChat from "../components/AiChat";

const DesignPreview: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-8 px-4 space-y-12">
      <DesignViewer />
      <AiChat />
    </div>
  );
};

export default DesignPreview;
