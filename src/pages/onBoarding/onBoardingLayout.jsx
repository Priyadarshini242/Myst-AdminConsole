import React, { useContext, useEffect, useRef } from "react";
import useWindowSize from "../../hooks/useWindowSize";
import { ConfigContext } from "../../context/ConfigContext";
import useOutsideClick from "../../hooks/useOutsideClick";
import NavBar from "../../layouts/AdminLayout/NavBar";
import OnBoardingNavBar from "./onBoardingNavBar";
import { useSelector } from "react-redux";
import LogoLoader from "../../components/LogoLoader";
import * as actionType from "../../store/actions";

const OnBoardingLayout = ({ children }) => {
  const ref = useRef();

  let mainClass = ["pcoded-wrapper"];

  const { isLoading } = useSelector((state) => state.isApiLoading);

  return (
    <React.Fragment>
      {isLoading && <LogoLoader isLoayout={true} />}
      <main className={`${isLoading ? "pe-none opacity-75" : ""}`}>
        {/* <NavBar /> */}
        <OnBoardingNavBar />
        <div className="pcoded-main-container" ref={ref}>
          <div
            className={mainClass.join(" ")}
            style={{ position: "relative", top: "-27px" }}
          >
            <div className="pcoded-content p-0">
              {/* <div className="pcoded-inner-content p-0">{children}</div> */}
            </div>
          </div>
        </div>
      </main>
    </React.Fragment>
  );
};

export default OnBoardingLayout;
