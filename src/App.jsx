import React from "react";
import Navbar from "./components/Navbar";
import Emptystate from "./components/Emptystate";
import Landingpage from "./pages/Landingpage";
import { Routes, Route, Navigate } from "react-router-dom";
import Allproject from "./pages/Allproject";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import ChapterManagement from "./pages/ChapterManagementPage";
import AssetPage from "./pages/AssetPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { supabase } from "./lib/supabaseClient";
import { useState, useEffect } from "react";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const handleGlobalBeforeUnload = (e) => {
      if (window.globalIsDataChanged === true) {
        e.preventDefault();
        e.returnValue = "คุณยังไม่ได้บันทึกข้อมูลล่าสุด";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleGlobalBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleGlobalBeforeUnload);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      loading && setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-slate-500 text-sm">กำลังตรวจสอบสถานะระบบ...</p>
      </div>
    );
  }
  console.log("1. Session ใน App.jsx:", session);

  return (
    <Routes>
      {/* 🌐 หน้าสาธารณะ (Public Route) */}
      <Route path="/" element={<Landingpage session={session} />} />

      {/* 🔐 หน้าที่ต้องล็อกอินเท่านั้น (Protected Routes) ถ้าไม่มีเซสชันจะถูกเตะไปหน้า Login ทั้งหมด */}
      <Route
        path="/Allproject"
        element={
          session ? (
            <Allproject session={session} />
          ) : (
            <Navigate to="/LoginPage" replace />
          )
        }
      />
      <Route
        path="/CreateProject"
        element={
          session ? <CreateProject /> : <Navigate to="/LoginPage" replace />
        }
      />
      <Route
        path="/EditProject/:id"
        element={
          session ? <EditProject /> : <Navigate to="/LoginPage" replace />
        }
      />
      <Route
        path="/Chapter_editor/:id"
        element={
          session ? <ChapterManagement /> : <Navigate to="/LoginPage" replace />
        }
      />
      <Route
        path="/Chapter_editor/:id/assets"
        element={session ? <AssetPage /> : <Navigate to="/LoginPage" replace />}
      />

      {/* 🔓 หน้าสำหรับคนยังไม่ได้ล็อกอิน (หากล็อกอินแล้วแอบมากดจะเด้งเข้าหน้า Allproject ทันที) */}
      <Route
        path="/LoginPage"
        element={
          !session ? <LoginPage /> : <Navigate to="/Allproject" replace />
        }
      />
      <Route
        path="/RegisterPage"
        element={
          !session ? <RegisterPage /> : <Navigate to="/Allproject" replace />
        }
      />
    </Routes>
  );
}

export default App;
