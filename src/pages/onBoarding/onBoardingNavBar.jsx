import { useMediaQuery } from "@mui/material";
import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import LazyLoadingImageComponent from "../../components/Lazy Loading Images/LazyLoadingImageComponent";
import SessionPopup from "../../components/SessionTimeOut/SessionPopup";
import { images } from "../../constants";
import { ConfigContext } from "../../context/ConfigContext";
import OnBoardingNavRight from "../../layouts/AdminLayout/NavBar/NavRight/onBoardingNav";
import * as actionType from "../../store/actions";
import LanguageConfirm from "../../components/LanguageConfirm/LanguageConfirm";

const OnBoardingNavBar = () => {
  const [moreToggle, setMoreToggle] = useState(false);
  const isSmallScreen = useMediaQuery("(max-width: 992px)");
  const configContext = useContext(ConfigContext);
  const { collapseMenu, layout } = configContext.state;
  const { dispatch } = configContext;

  let headerClass = [
    "navbar",
    "pcoded-header",
    "navbar-expand-lg",
    "header-white",
    "headerpos-fixed",
    "d-print-none",
  ];
  if (layout === "vertical") {
    headerClass = [...headerClass, "headerpos-fixed"];
  }

  let toggleClass = ["mobile-menu"];
  if (collapseMenu) {
    toggleClass = [...toggleClass, "on"];
  }

  const direction = useSelector((state) => state.direction);

  // If the direction is RTL, change the icon based on the collapseMenu state
  if (direction === "rtl") {
    if (!collapseMenu) {
      toggleClass = [...toggleClass, "mobile-menu-width-icon-off"];
    } else {
      toggleClass = [...toggleClass, "mobile-menu-width-icon-on"];
    }
  }

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  let moreClass = ["mob-toggler"];
  let collapseClass = ["collapse navbar-collapse"];
  if (moreToggle) {
    moreClass = [...moreClass, "on"];
    collapseClass = [...collapseClass, "d-block"];
  }

  // Determine the logo and its size based on the menu state
  // const logoSrc = collapseMenu ? images.logo : direction === 'rtl' ? images.logoFullRtl : images.logoFull;
  const logoSrc = images.SBJFullLogo;
  // const logoWidth = collapseMenu ? 40 : 160;
  const logoWidth =  160;

  // Apply dynamic styles based on the icon
  const iconStyles = collapseMenu
    ? { width: "110px", important: true }
    : { width: "270px", important: true }; // Apply width only if collapseMenu is true

  let navBar = (
    <React.Fragment>
      {isSmallScreen ? (
        <React.Fragment>
          <div className="m-header">
            <Link to="#" className="b-brand">
              <LazyLoadingImageComponent
                id="main-logo"
                src={images.SBJFullLogo}
                alt=""
                className="logo"
                style={{ width: "100px" }}
              />
            </Link>
            <Link
              to="#"
              className={moreClass.join(" ")}
              onClick={() => setMoreToggle(!moreToggle)}
            >
              <i className="feather icon-more-vertical" />
            </Link>
          </div>
          <div
            style={{ justifyContent: "end" }}
            className={collapseClass.join(" ")}
          >
            <OnBoardingNavRight />
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="m-header" style={iconStyles}>
           
            <Link to="#" className="b-brand">
              <LazyLoadingImageComponent
                id="main-logo"
                src={logoSrc}
                alt="Logo"
                className="logo"
                width={logoWidth}
              />
            </Link>
          </div>
          <div
            style={{ justifyContent: "end" }}
            className={collapseClass.join(" ")}
          >
            <OnBoardingNavRight />
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <LanguageConfirm/>
      <SessionPopup />
      <header className={headerClass.join(" ")} style={{ zIndex: 1009 }}>
        {navBar}
      </header>
    </React.Fragment>
  );
};

export default OnBoardingNavBar;
