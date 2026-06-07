import React from "react";
import Navbar from "./components/Navbar";
import Emptystate from "./components/Emptystate";
import Landingpage from "./pages/Landingpage";
import { Routes, Route } from "react-router";
import Allproject from "./pages/Allproject";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import ChapterManagement from "./pages/ChapterManagementPage";
import AssetPage from "./pages/AssetPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landingpage />} />
      <Route path="/Allproject" element={<Allproject />} />
      <Route path="/CreateProject" element={<CreateProject />} />
      <Route path="/EditProject/:id" element={<EditProject />} />
      <Route path="/Chapter_editor/:id" element={<ChapterManagement />} />
      <Route path="/Chapter_editor/:id/assets" element={<AssetPage />} />
    </Routes>
  );
}

export default App;
