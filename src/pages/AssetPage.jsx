// src/pages/AssetPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabaseClient";
import AssetHeader from "../components/Asset/AssetHeader";
import AssetStatCards from "../components/Asset/AssetStatCards";
import AssetFilterTabs from "../components/Asset/AssetFilterTabs";
import AssetEmptyState from "../components/Asset/AssetEmptyState";
import AssetListView from "../components/Asset/AssetListView";
import AssetModal from "../components/Asset/AssetModal";

const AssetPage = () => {
  const { id } = useParams(); // project_id
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("upload");
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [assetsList, setAssetsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลจาก Supabase
  const fetchProjectAssets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssetsList(data || []);
    } catch (err) {
      console.error("Error fetching assets:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectAssets();
    }
  }, [id]);

  const handleOpenUpload = () => {
    setModalMode("upload");
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (assetItem) => {
    setModalMode("edit");
    setSelectedAsset(assetItem);
    setIsModalOpen(true);
  };

  const assetCounts = useMemo(() => {
    const currentAssets = assetsList || [];
    return {
      background: currentAssets.filter((a) => a.file_type === "background")
        .length,
      sprite: currentAssets.filter((a) => a.file_type === "sprite").length,
      music: currentAssets.filter((a) => a.file_type === "music").length,
      sound_effect: currentAssets.filter((a) => a.file_type === "sound_effect")
        .length, // เปลี่ยนจาก sound เป็น soundEffect
    };
  }, [assetsList]);

  // ตัวกรองสิทธิ์แสดงผลและการค้นหาข้อมูลค้นหา
  const filteredAssets = useMemo(() => {
    return (assetsList || []).filter((asset) => {
      const matchesTab = activeTab === "all" || asset.file_type === activeTab;
      const matchesSearch = asset.name
        ? asset.name.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesTab && matchesSearch;
    });
  }, [assetsList, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ส่วนหัวหน้าเว็บและช่องค้นหา */}
        <AssetHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleOpenUpload={handleOpenUpload}
        />

        {/* ส่วนแสดงข้อมูลสถิติ */}
        <div className="mt-6">
          <AssetStatCards counts={assetCounts} />
        </div>

        {/* ส่วนแถบแท็บตัวเลือกประเภทสินค้า */}
        <div className="mt-8 border-b border-gray-200">
          <AssetFilterTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* ส่วนแสดงผลรายการสินทรัพย์ทั้งหมด */}
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              กำลังโหลดข้อมูล...
            </div>
          ) : filteredAssets.length > 0 ? (
            <AssetListView
              assets={filteredAssets}
              onOpenEdit={handleOpenEdit}
              onRefresh={fetchProjectAssets}
              projectId={id}
            />
          ) : (
            <AssetEmptyState onUploadClick={handleOpenUpload} />
          )}
        </div>
      </div>

      {/* กล่องอัปโหลด/แก้ไขไฟล์ */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={fetchProjectAssets}
        mode={modalMode}
        selectedAsset={selectedAsset}
        projectId={id}
      />
    </div>
  );
};

export default AssetPage;
