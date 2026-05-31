// src/components/SceneList/SceneSidebar.jsx
import React from "react";
import SceneSearchBar from "./SceneSearchBar";
import SceneItem from "./SceneItem";

const SceneSidebar = ({
  scenes,
  activeSceneId,
  draggingId,
  onSelectScene,
  onAddScene,
  onSearchChange,
  searchQuery,
  onSceneNameChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  return (
    <div className="flex flex-col h-full w-full">
      <SceneSearchBar
        onAddScene={onAddScene}
        onSearchChange={onSearchChange}
        searchQuery={searchQuery}
      />
      <div className="flex-1 overflow-y-auto mt-4 space-y-2.5 pr-0.5">
        {scenes.map((scene, index) => (
          <SceneItem
            key={scene.id}
            id={scene.id}
            index={index}
            name={scene.name}
            status={scene.status}
            tags={scene.tags}
            isActive={scene.id === activeSceneId}
            isDragging={scene.id === draggingId} // ตรวจสอบสถานะการลากทึบ
            onClick={() => onSelectScene(scene.id)}
            onNameChange={onSceneNameChange}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
    </div>
  );
};

export default SceneSidebar;
