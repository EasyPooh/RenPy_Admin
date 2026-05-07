import React from 'react'
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar'
import Emptystate from '../components/Emptystate'

function Allproject() {
    const nav = useNavigate()
  return (
    <div>
       <Navbar />
      <Emptystate />
    </div>
  )
}

export default Allproject