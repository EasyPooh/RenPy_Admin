// src/pages/SceneManagementPage.jsx
import React, { useState, useEffect } from "react";

import MainLayout from "../components/SceneList/MainLayout";
import SceneNavbar from "../components/SceneList/SceneNavbar";
import SceneSidebar from "../components/SceneList/SceneSidebar";
import WorkspaceContainer from "../components/WorkspaceContainer/WorkspaceContainer";
import Navbar from "../components/Navbar";
import TopNavbar from "../components/SceneList/TopNavbar";

const SceneManagementPage = () => {
  const [scenes, setScenes] = useState([
    {
      id: 1,
      name: "เริ่มเกม (Start)",
      labelName: "start",
      status: "draft",
      tags: ["จุดเริ่มต้น"],
    },
    {
      id: 2,
      name: "ฉากใหม่ที่ 2",
      labelName: "ch2",
      status: "draft",
      tags: [],
    },
    {
      id: 3,
      name: "ฉากใหม่ที่ 3",
      labelName: "ch3",
      status: "draft",
      tags: [],
    },
  ]);

  const [activeSceneId, setActiveSceneId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  // 🌟 1. เพิ่ม State บัฟเฟอร์สำหรับจำค่าสลับบนฟอร์มชั่วคราวก่อนกดเซฟ
  const [tempStatus, setTempStatus] = useState("draft");

  const currentActiveScene = scenes.find((scene) => scene.id === activeSceneId);

  // 🌟 2. ดึงสถานะตั้งต้นมาลงฟอร์มชั่วคราว ทุกครั้งที่ผู้ใช้สลับเปลี่ยนคลิกเลือกฉากฝั่งซ้าย
  useEffect(() => {
    if (currentActiveScene) {
      setTempStatus(currentActiveScene.status);
    }
  }, [activeSceneId, scenes]);

  // 🌟 3. ฟังก์ชันเซฟใหญ่ (เมื่อกดปุ่ม Save ใน Navbar)
  const handleSaveSceneChanges = () => {
    if (!activeSceneId) return;

    setScenes((prevScenes) =>
      prevScenes.map((scene) => {
        if (scene.id === activeSceneId) {
          return {
            ...scene,
            status: tempStatus, // นำค่าที่เลือกค้างไว้มาบันทึกจริงลงฝั่งซ้ายตัว Scene List
          };
        }
        return scene;
      }),
    );

    // TODO: จุดนี้สามารถใส่ฟังก์ชันเขียนคำสั่งอัปเดตลงฐานข้อมูล Supabase ต่อไปได้เลยครับ!
    console.log(
      `บันทึกฉาก ID: ${activeSceneId} สู่สถานะ: ${tempStatus} สำเร็จ`,
    );
  };

  const handleDragStart = (e, index, id) => {
    setDraggedIndex(index);
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === 0 || targetIndex === 0 || draggedIndex === null) {
      handleDragEnd();
      return;
    }
    const updatedScenes = [...scenes];
    const draggedItem = updatedScenes[draggedIndex];
    updatedScenes.splice(draggedIndex, 1);
    updatedScenes.splice(targetIndex, 0, draggedItem);
    setScenes(updatedScenes);
    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggingId(null);
  };

  const convertToRenPyLabel = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const handleUpdateSceneName = (id, newName) => {
    setScenes((prevScenes) =>
      prevScenes.map((scene) => {
        if (scene.id === id) {
          const rawLabel = convertToRenPyLabel(newName);
          return {
            ...scene,
            name: newName,
            labelName: rawLabel.length > 0 ? rawLabel : `ch${id}`,
          };
        }
        return scene;
      }),
    );
  };

  const handleAddScene = () => {
    const nextId =
      scenes.length > 0 ? Math.max(...scenes.map((s) => s.id)) + 1 : 1;
    const newScene = {
      id: nextId,
      name: `ฉากใหม่ที่ ${nextId}`,
      labelName: `ch${nextId}`,
      status: "draft",
      tags: [],
    }; // Default ตอนสร้างฉากใหม่คือ draft
    setScenes([...scenes, newScene]);
    setActiveSceneId(nextId);
  };

  const filteredScenes = scenes.filter(
    (scene) =>
      scene.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scene.id.toString().includes(searchQuery),
  );

  return (
    <MainLayout>
      <Navbar />
      <TopNavbar title="Scene Management" />
      {/* 🌟 ส่ง State ชั่วคราว และฟังก์ชันจัดการเซฟไปที่ Navbar */}
      <SceneNavbar
        currentScene={currentActiveScene}
        tempStatus={tempStatus}
        onStatusChange={setTempStatus}
        onSave={handleSaveSceneChanges}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col h-full shrink-0 p-4">
          <div className="pb-1 flex items-center space-x-2 text-gray-500 font-semibold text-sm select-none mb-3">
            <span>📁</span>
            <span className="tracking-wider">SCENE LIST</span>
          </div>

          <SceneSidebar
            scenes={filteredScenes}
            activeSceneId={activeSceneId}
            draggingId={draggingId}
            onSelectScene={setActiveSceneId}
            onAddScene={handleAddScene}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
            onSceneNameChange={handleUpdateSceneName}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        </div>

        <WorkspaceContainer currentScene={currentActiveScene}>
          <div className="border border-dashed border-purple-200 bg-purple-50/10 rounded-xl h-full flex flex-col items-center justify-center text-gray-400 text-xs py-20">
            <p className="font-semibold text-purple-950 mb-1">
              {currentActiveScene
                ? `กำลังทำงาน: ฉาก "${currentActiveScene.name}"`
                : "กรุณาเลือกฉาก"}
            </p>
            <p className="text-gray-400">
              เมื่อสลับค่าสถานะด้านบน แล้วกด Save
              แถบรายชื่อฉากฝั่งซ้ายจะปรับสีเปลี่ยนสลักตามทันทีครับ
            </p>
          </div>
        </WorkspaceContainer>
      </div>
    </MainLayout>
  );
};

export default SceneManagementPage;
