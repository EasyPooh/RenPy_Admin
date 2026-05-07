import React from 'react'
import { useNavigate } from 'react-router';
import CreateProjectHeader from '../components/CreateProjectHeader';
import CreateProjectForm from '../components/CreateProjectForm';
import Navbar from '../components/Navbar';

function CreateProject() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Navbar />
      <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* ส่วนหัว */}
        <CreateProjectHeader />
        
        {/* ส่วนฟอร์ม */}
        <CreateProjectForm />
      </div>
    </div>
    </div>
  )
}

export default CreateProject