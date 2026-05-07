import React from 'react'
import Navbar from './components/Navbar'
import Emptystate from './components/Emptystate'
import Landingpage from './pages/Landingpage'
import { BrowserRouter,Routes,Route } from 'react-router'
import Allproject from './pages/Allproject'
import CreateProject from './pages/CreateProject'

function App() {
  

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landingpage />} />  
      <Route path="/Allproject" element={<Allproject />} />  
      <Route path="/CreateProject" element={<CreateProject />} />
    </Routes>
    </BrowserRouter>


    

    
  );
}

export default App