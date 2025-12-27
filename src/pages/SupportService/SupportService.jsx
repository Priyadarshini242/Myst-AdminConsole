import React from "react";

import { Outlet, ScrollRestoration } from "react-router-dom";

import SupportServicesNavbar from "../../components/Supportservices/SupportServicesNavbar";

import SupportServicesRightSidebar from "../../components/Supportservices/SupportServicesRightSideBar";
import SupportServicesFooter from "../../components/Supportservices/SupportServicesFooter";
import SupportServicesLeftSideBar from "../../components/Supportservices/SupportServicesLeftSideBar";
import { useQuery } from "@tanstack/react-query";
import { ApiProvider } from "../../context/ApiProvider";




export default function SupportService() {



  return (
    <>
    <ApiProvider>
      <div class="container-fluid">
        <div class="row px-0 ">
          <div class="col-lg-12 bg-light px-0">
            <SupportServicesNavbar />
          </div>
        </div>

        <div class="row " style={{ height: "calc(-60px + 96vh)" }}>
          <div class="col-lg px-0" style={{ borderRight: "2px solid #d3d3d3" }}>
            <SupportServicesLeftSideBar />
          </div>

          <div
            class="col-lg-7 col-md-10 m-0 p-0"
            style={{ height: "calc(-60px + 96vh)", overflowY: "scroll" }}
            
          >
            
            <Outlet />
          </div>

          <div
            className="col-lg bg-white px-1 font-5 fixed-sidebar "
            style={{ borderLeft: "2px solid #d3d3d3" }}
          >
            <SupportServicesRightSidebar />
          </div>
        </div>

        <div class="row px-0">
          <div class="col-lg-12 bg-light px-0">
            <SupportServicesFooter />
          </div>
        </div>
      </div>
      </ApiProvider>
    </>
  );
}
