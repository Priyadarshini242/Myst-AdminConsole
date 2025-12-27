import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useContentLabel from '../../../../hooks/useContentLabel';
import icons from './../../../../constants/icons';
import ToggleBtn from '../../../../components/Buttons/ToggleBtn';
import SavedSearchGrid from './SavedSearchGrid';
import JdInfoTabsSection from '../../../../components/SkillAvailer/JdInfoTabsSection';
import SavedSearchInfoTabs from '../../../../components/SkillAvailer/SeekerSearchComponents/Saved Search Components/SavedSearchInfoTabs';



const SavedSearchDashBoard = () => {
    const [viewMode, setViewMode] = useState("single");
    /* CONTENT LABEL */
    const contentLabel = useContentLabel();
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);
    const resizerRef = useRef(null);
    const navigate = useNavigate();
    const selectedLanguage = useSelector(state => state.language);
    const content = useSelector(state => state.content);
    const SavedSearch = useSelector(state => state.SavedSearchSlice);
    // const { searchQuery, metaData, dataList, SelectedJd } = SavedSearch;
    // const { viewMode } = useSelector((state) => state.JdViewConfig);

    const [show, setShow] = useState(false);
    const [singleViewActiveScreen, setSingleViewActiveScreen] = useState("left");

    const handleShowForm = () => {
        setViewMode("form");
    };

    const labels = {
        left: {
            title: "Single",
            value: "team",
            isIcon: true,
            icon: <icons.RxEnterFullScreen />
        },
        right: {
            title: "Split",
            value: "low",
            isIcon: true,
            icon: <icons.LuSplitSquareHorizontal />
        }
    };

    const handleClose = () => {
        // dispatch(setViewMode("split"));
        setViewMode("single");
        setShow(false);
    };

    const handleShow = () => setShow(true);

    const handleChangeViewToSingle = () => {
        // dispatch(setViewMode("single"));
        setViewMode("single");
        setSingleViewActiveScreen("left");
        if (sidebarRef.current) {
            sidebarRef.current.style.width = '100%';
            sidebarRef.current.style.display = 'block';
        }
        if (resizerRef.current) {
            resizerRef.current.style.display = 'none';
        }
        document.querySelector('.savedSearch-rs-content').style.width = '0%';
        document.querySelector('.savedSearch-rs-content').style.display = 'none';
    };

    const handleChangeViewToSplit = () => {
        // dispatch(setViewMode("split"));
        setViewMode("split");
        if (sidebarRef.current) {
            sidebarRef.current.style.width = '40%';
            sidebarRef.current.style.display = 'block';
        }
        if (resizerRef.current) {
            resizerRef.current.style.display = 'block';
            resizerRef.current.style.width = '5px';
        }
        document.querySelector('.savedSearch-rs-content').style.width = '60%';
        document.querySelector('.savedSearch-rs-content').style.display = 'block';
    };
    const handleChangeModeToLeft = () => {

        setSingleViewActiveScreen("left");
        if (sidebarRef.current) {
            sidebarRef.current.style.width = '100%';
            sidebarRef.current.style.display = 'block';
        }
        if (resizerRef.current) {
            resizerRef.current.style.display = 'none';
        }
        document.querySelector('.savedSearch-rs-content').style.width = '0%';
        document.querySelector('.savedSearch-rs-content').style.display = 'none';
    };
    const handleChangeModeToRight = () => {

        setSingleViewActiveScreen("right");
        if (sidebarRef.current) {
            sidebarRef.current.style.width = '0%';
            sidebarRef.current.style.display = 'none';
        }
        if (resizerRef.current) {
            resizerRef.current.style.display = 'none';
        }
        document.querySelector('.savedSearch-rs-content').style.width = '100%';
        document.querySelector('.savedSearch-rs-content').style.display = 'block';
    };
    const handleMouseDown = (e) => {
        e.preventDefault();
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        const sidebar = sidebarRef.current;
        if (!sidebar) return;

        const dx = e.clientX - sidebar.getBoundingClientRect().left;
        const newLeftWidth = dx;

        if (newLeftWidth > 350 && newLeftWidth < window.innerWidth * 0.7 && newLeftWidth < 610) {
            sidebar.style.width = `${newLeftWidth}px`;
            document.querySelector('.savedSearch-rs-content').style.width = `calc(100% - ${newLeftWidth}px)`;
        }
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
        const resizer = resizerRef.current;
        if (viewMode === 'split' && resizer) {
            resizer.addEventListener('mousedown', handleMouseDown);
        }
        return () => {
            if (resizer) {
                resizer.removeEventListener('mousedown', handleMouseDown);
            }
        };
    }, [viewMode]); // Add viewMode as a dependency


    const singleModeJDOnClick = () => {
        if (viewMode === 'single') {

            handleChangeModeToRight();
        }
    }

    const handleCloseRightMode = () => {
        handleChangeModeToLeft();
    }

    return (
      <div className="d-flex font-5">
        <div>
          <ToggleBtn
            labels={labels}
            onSelectLeft={handleChangeViewToSingle}
            onSelectRight={handleChangeViewToSplit}
            left={"92%"}
            top={"4.5%"}
          />
        </div>
        <div
          className="d-flex me-0 w-100"
          style={{ maxHeight: "75%", minHeight: "75%" }}
        >
          {viewMode !== "form" ? (
            <React.Fragment>
              {/* <SidebarSeeker sidebarHeight={"100vh"} menuItems={MenuItems} /> */}
              <div
                ref={sidebarRef}
                className="card-s-tabs"
                style={{
                  width: viewMode === "single" ? "100%" : "40%",
                //  minWidth: "60vw",
                }}
              >
                <SavedSearchGrid
                  setOnClick={singleModeJDOnClick}
                  handleShowForPlusBtn={handleShowForm}
                />
              </div>
              {viewMode === "split" && (
                <div
                  ref={resizerRef}
                  className="resizer"
                  style={{
                    width: "5px",
                    cursor: "ew-resize",
                    backgroundColor: "#ddd",
                  }}
                ></div>
              )}
              <div
                className="savedSearch-rs-content ms-2"
                style={{
                  width: viewMode === "single" ? "0%" : "60%",
                  height: "100%",
                  marginLeft: "auto",
                  display:
                    singleViewActiveScreen === "left" && viewMode === "single"
                      ? "none"
                      : "block",
                }}
              >
                <div
                  className="card nav header-nav d-flex justify-content-center px-1"
                  id="nav-tab"
                >
                  <div className="d-flex gap-2 align-items-center  ">
                    <div className="font-3 ms-2">
                      {SavedSearch?.SelectedJd && SavedSearch.SelectedJd.title}
                    </div>
                    {viewMode === "single" && (
                      <icons.IoClose
                        style={{ marginLeft: "auto" }}
                        size={30}
                        onClick={() => {
                          handleCloseRightMode();
                        }}
                      />
                    )}
                  </div>
                </div>

                <div
                  className="card-s-tabs"
                  style={{ marginBottom: "auto", overflow: "auto" }}
                >
                  <SavedSearchInfoTabs />
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div className=" card">
              {/* <CreateOpportunity show={true} handleClose={handleClose} /> */}
            </div>
          )}
        </div>
      </div>
    );
};

export default SavedSearchDashBoard;
