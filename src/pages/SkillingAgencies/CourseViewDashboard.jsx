import React, { useRef, useEffect, useState } from 'react';
import ToggleBtn from '../../components/Buttons/ToggleBtn';
import { icons } from '../../constants';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useContentLabel from '../../hooks/useContentLabel';
import CourseInfoTabs from './CourseInfoTabs';
import CreateCourse from './components/CreateCourse';
import GridViewForUserCourses from './components/GridViewForUserCourses';
import { fetchUserAttachment } from '../../reducer/attachments/getUserAttachmentSlice';
import { fetchCourseApplicationList } from '../../api/SkillingAgency/fetchCourseApplicationList';
import { fetchByUserId } from '../../api/GET api/getApi';


const CourseViewDashboard = () => {
    const {
        language: selectedLanguage,
        content,
        getUserAttachment: { userAttachmentData },
    } = useSelector((state) => state);
    const [viewMode, setViewMode] = useState("single");
    const {selectedCourse} = useSelector((state) => state.myCourses)
    /* CONTENT LABEL */
    const contentLabel = useContentLabel();
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);
    const resizerRef = useRef(null);
    const navigate = useNavigate();
    const jdStore = useSelector(state => state.JdDataSlice);
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
        document.querySelector('.seeker-rs-content').style.width = '0%';
        document.querySelector('.seeker-rs-content').style.display = 'none';
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
        document.querySelector('.seeker-rs-content').style.width = '60%';
        document.querySelector('.seeker-rs-content').style.display = 'block';
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
        document.querySelector('.seeker-rs-content').style.width = '0%';
        document.querySelector('.seeker-rs-content').style.display = 'none';
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
        document.querySelector('.seeker-rs-content').style.width = '100%';
        document.querySelector('.seeker-rs-content').style.display = 'block';
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
            document.querySelector('.seeker-rs-content').style.width = `calc(100% - ${newLeftWidth}px)`;
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


    //FETCH DATA
    useEffect(() => {
        dispatch(fetchUserAttachment());
    }, []);

    // useEffect(() => {
    //     dispatch(fetchCourseApplicationList({
    //         start: '',
    //         size: 10,
    //         sortOrder: '',
    //         sortField: '',
    //         filter: ''
    //     }))

    //     // dispatch(fetchByUserId('Course Response'))
    // },[])

    return (
      <div className="d-flex font-5">
        <div>
          <ToggleBtn
            labels={labels}
            onSelectLeft={handleChangeViewToSingle}
            onSelectRight={handleChangeViewToSplit}
            left={"92%"}
            top={"4.5vh"}
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
                className="card-s-tabs "
                style={{
                  width: viewMode === "single" ? "100%" : "40%",
                //  minWidth: "60vw",
                }}
              >
                {/* <JdListGrid setOnClick={singleModeJDOnClick} handleShowForPlusBtn={handleShowForm} /> */}
                <GridViewForUserCourses
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
                className="seeker-rs-content ms-2"
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
                      {selectedCourse?.courseName}
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
                  className="card"
                  style={{ marginBottom: "auto", overflow: "auto" }}
                >
                  <CourseInfoTabs />
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div className=" w-100">
              {/* <CreateOpportunityFORM show={true} handleClose={handleClose} /> */}
              <CreateCourse handleCloseView={handleClose} />
            </div>
          )}
        </div>
      </div>
    );
};

export default CourseViewDashboard;
