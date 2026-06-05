// src/pages/SceneManagementPage.jsx
import React, { useState, useEffect } from "react";

import MainLayout from "../components/SceneList/MainLayout";
import SceneNavbar from "../components/SceneList/SceneNavbar";
import SceneSidebar from "../components/SceneList/SceneSidebar";
import WorkspaceContainer from "../components/WorkspaceContainer/WorkspaceContainer";
import Navbar from "../components/Navbar";
import TopNavbar from "../components/SceneList/TopNavbar";
import WorkspaceToolbar from "../components/WorkspaceContainer/WorkspaceToolbar";
import DialogueSection from "../components/WorkspaceContainer/DialogueSection";
import TextareaField from "../components/TextareaField";
import StartSection from "../components/WorkspaceContainer/StartSection";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const SceneManagementPage = () => {
  const { id } = useParams();
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
  // 1. สร้าง State สำหรับเก็บรายการ Block ทั้งหมด (เริ่มต้นเป็นอาเรย์ว่าง)
  const [blocks, setBlocks] = useState([]);
  
  // 2. ฟังก์ชัน Logic สำหรับเพิ่ม Block ใหม่
  const handleAddBlock = (type) => {
    console.log("ถั่วต้ม! ปุ่มกดทำงานส่งประเภทมาคือ:", type);
    let newBlock = {
      id: Date.now(),
      type: type || "default",
      character: "",
      expression: "normal",
      text: "",
      content: `บล็อกใหม่ที่ #${blocks.length + 1}`,
      createdAt: new Date().toLocaleTimeString(),
    };

    setBlocks((prevBlocks) => [...prevBlocks, newBlock]);
  };

  // 3. ฟังก์ชันสำหรับอัปเดต Block properties
  const handleUpdateBlock = (blockId, field, value) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            [field]: value,
          };
        }
        return block;
      })
    );
  };

  return (
    /* [จุดแก้ที่ 1] บังคับครอบด้วยกล่อง flex-col สูงเต็มหน้าจอ h-screen 
    และห้ามเลื่อนหน้าจอรวม overflow-hidden เพื่อให้สัดส่วนตกลงมาใต้ Navbar พอดี
  */
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      {/* ส่วนของแผงเมนูด้านบนทั้งหมด (รวมกลุ่มอยู่ด้วยกันไม่ให้ไปดันหรือเบียดใคร) */}
      <div className="flex-none bg-white">
        <Navbar />
        <TopNavbar title="Scene Management" id={id} />
        {/* 🌟 ส่ง State ชั่วคราว และฟังก์ชันจัดการเซฟไปที่ Navbar */}
        <SceneNavbar
          currentScene={currentActiveScene}
          tempStatus={tempStatus}
          onStatusChange={setTempStatus}
          onSave={handleSaveSceneChanges}
        />
      </div>

      {/* [จุดแก้ที่ 2] พื้นที่ทำงานด้านล่างทั้งหมดใต้ Navbar ลงมา 
      กินพื้นที่ความสูงที่เหลือ (flex-1) และเรียงซ้ายไปขวา (flex flex-row) 
    */}
      <div className="flex flex-1 overflow-hidden w-full">
        {/* ฝั่งซ้าย: เมนูรายชื่อฉาก (SCENE LIST) ล็อกความสูงพอดีจอฝั่งซ้าย */}
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col h-full shrink-0 p-4 overflow-y-auto">
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

        {/* [จุดแก้ที่ 3] ฝั่งขวา: ส่งสเตทและฟังก์ชันจัดการบล็อกเข้าไปในคอมโพเนนต์ Workspace ตัวหลักตัวเดียว 
        ไม่ต้องมีแท็กซ้ำซ้อน และไม่ต้องมีกล่อง absolute bottom มาเบียดบังด้านล่าง
      */}
        <WorkspaceContainer
          currentScene={currentActiveScene}
          blocks={blocks}
          onAddBlock={handleAddBlock}
          onUpdateBlock={handleUpdateBlock}
        />
      </div>
    </div>
  );
};

export default SceneManagementPage;
