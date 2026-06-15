// src/contexts/WorkspaceContext.js
import { createContext, useContext, useState } from "react";

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children, initialId }) => {
  const [activeChapterId, setActiveChapterId] = useState(initialId || null);

  return (
    <WorkspaceContext.Provider value={{ activeChapterId, setActiveChapterId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => useContext(WorkspaceContext);
