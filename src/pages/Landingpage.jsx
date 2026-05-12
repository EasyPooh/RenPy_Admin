import React from "react";
import { useNavigate } from "react-router";

import Herosection from "../components/Herosection";
import Featuresection from "../components/Featuresection";
import LandingNavbar from "../components/Landingnavbar";

function Landingpage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <LandingNavbar />
      <Herosection />
      <Featuresection />
    </div>
  );
}

export default Landingpage;
