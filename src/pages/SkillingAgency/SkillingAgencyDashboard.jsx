import React from 'react'
import Navbar from '../../components/Navbar'
import SkillingAgencyNavbar from '../../components/SkillingAgency/DashboardComponents/SkillingAgencyNavbar'
import { Outlet } from 'react-router-dom'
import Footer from '../../components/Footer'
import RightSideBar from '../../components/RightSideBar'
import SkillingAgencyRightSidebar from '../../components/SkillingAgency/DashboardComponents/SkillingAgencyRightSidebar'
import SkillingAgencyLeftSidebar from '../../components/SkillingAgency/DashboardComponents/SkillingAgencyLeftSidebar'
import SkillingAgencyFooter from '../../components/SkillingAgency/DashboardComponents/SkillingAgencyFooter'

const SkillingAgencyDashboard = () => {
  return (
    <div class="container-fluid">

      <div class="row px-0 "  >
        <div class="col-lg-12 bg-light px-0">
          <SkillingAgencyNavbar />
        </div>
      </div>


      <div class="row " style={{height:'calc(-60px + 96vh)' }}   >

        <div class="col-lg px-0" style={{borderRight:'2px solid #d3d3d3'}}>
         <SkillingAgencyLeftSidebar/>
        </div>
        

        <div class="col-lg-7 col-md-10 m-0 p-0" style={{height:'calc(-60px + 96vh)', overflowY:'scroll' }}>
          <Outlet />
        </div>

        <div className="col-lg bg-white px-1 font-5 fixed-sidebar " style={{borderLeft:'2px solid #d3d3d3'}}>
          <SkillingAgencyRightSidebar />
        </div>
      </div>

 

      <div class="row px-0">
        <div class="col-lg-12 bg-light px-0">
          <SkillingAgencyFooter/>
        </div>
      </div>
      
    </div>
  )
}

export default SkillingAgencyDashboard
