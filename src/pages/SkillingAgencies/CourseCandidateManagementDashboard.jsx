import React, { useRef, useEffect, useState, } from 'react';

import ToggleBtn from '../../components/Buttons/ToggleBtn';
import { icons } from '../../constants';
import { useSelector, useDispatch,shallowEqual } from 'react-redux';

import CourseCandidateInfoTabs from './CourseCandidateInfoTabs'
import CandidateInfoTabs from '../../components/SkillAvailer/CandidateInfoTabs';

import CandidateInfoTabsTitle from '../../components/SkillAvailer/CandidateInfoTabsTitle';
import {setQuestionFilter,setQuestionFilterView, emptySelectedCourseApplication } from '../../reducer/SkillingAgency/CandidateManagement/selectedCourseApplicationSlice';
import { Card, Row } from 'react-bootstrap';
import CourseCandidatePreviewPane from './components/candidate management/CourseCandidatePreviewPane';
import CourseCalendarScheduleMeeting from './components/candidate management/CourseCalendarScheduleMeeting';
import useContentLabel from '../../hooks/useContentLabel';
import useMediaQuery from '../../hooks/useMediaQuery';
import CourseQuestionFilterAccoridan from '../../components/SkillAvailer/Candidate Dashboard/CourseQuestionFilterAccoridan';
import CandidateViewToggleBtn from './../../components/SkillAvailer/Candidate Dashboard/CandidateViewToggleBtn';

import CandidatePreviewPane from '../../components/SkillAvailer/JDRelatedComponents/CandidatePreviewPane';
//import CourseCandidateGridArea from '../../components/SkillAvailer/Candidate Dashboard/CourseCandidateGridArea';
import CandidateStatusButtons from '../../components/SkillAvailer/Candidate Dashboard/CandidateStatusButtons';

const CourseCandidateManagementDashBoard = () => {
    const isSmallScreen = useMediaQuery("(max-width: 768px)");
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);
    const resizerRef = useRef(null);
    const contentLabel = useContentLabel();

    const selectedLanguage = useSelector(state => state.language);
    const content = useSelector(state => state.content);
    const selectedCourse = useSelector(state => state.myCourses.selectedCourse, shallowEqual);
    const selectedCourseApplication = useSelector(state => state.myCourses.selectedCourseApplication, shallowEqual);
    const calendarCourseData = useSelector(state => state.myCourses.calendarCourseData, shallowEqual);

    const [showQnFilter, setShowQnFilter] = useState(false);
    // const { viewMode } = useSelector((state) => state.JdViewConfig);
    const [show, setShow] = useState(false);
    const [toolbarShow, setToolbarShow] = useState(false);
    const [viewMode, setViewMode] = useState("single");
      const [qbsFilters, setQbsFilters] = useState([]);
    const [singleViewActiveScreen, setSingleViewActiveScreen] = useState("left");
    const [showFilters, setShowFilters] = useState(false);
    const {questionFilter,showQnsFilter} = useSelector(state => state.selectedCourseApplicationSlice);

     const handleToggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const qbsFilterSetter = (data) => {        
        setQbsFilters(data && data.length > 0 ? data : []);
    }

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
        setViewMode("split");
        setShow(false);
    };


    
  useEffect(() => {       
        dispatch(setQuestionFilter(qbsFilters && qbsFilters.length > 0 ? qbsFilters : []));
    }, [qbsFilters]);

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
      dispatch(setQuestionFilterView(false));
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

        if (newLeftWidth > 450 && newLeftWidth < window.innerWidth * 0.7 && newLeftWidth < 700) {
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

    const  isObjectEmpty=(obj)=> {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }
 
  const setter = (data) => {
  setShowQnFilter(data);
};
  

  
    return (<>       
     <div className="d-flex font-5">
      <div  className={`me-3  ${showQnsFilter ? 'd-block' : 'd-none'}`} style={{ width: '450px' }}>
       <CourseQuestionFilterAccoridan questionList={selectedCourse?.courseQuestions } setFinalFilter={qbsFilterSetter} filterAppliedInQuery={questionFilter} />
                  </div>
        <div className="d-flex flex-column w-100" >
        <CandidateStatusButtons
         showQnsFilter={showQnFilter}
                    showClose={viewMode === "single" && singleViewActiveScreen === "right"}
                    handleCloseRightMode={handleCloseRightMode}/>
        {/* <CandidateInfoTabsTitle
          showClose={
            viewMode === "single" && singleViewActiveScreen === "right"
          }
          showQnFilter={showQnFilter}
          handleCloseRightMode={handleCloseRightMode}
          setter={setter}
        /> */}
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
                className="card-s-tabs"
                style={{
                  width: viewMode === "single" ? "100%" : "40%",
                //  minWidth: "60vw",
                }}
              >
                <CourseCandidateInfoTabs
                  handleSwitchPane={singleModeJDOnClick}
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
                }}
              >
                {/* <div className='card nav header-nav d-flex justify-content-center' id='nav-tab'>
                                <div className='font-3 ms-2'>{jdStore?.selectedCourse && jdStore.selectedCourse.title}</div>
                            </div> */}
                <div
                  className="card-s-tabs campaign_tabs_Ui"
                  style={{ overflow: "auto", height: "70.5vh" }}
                >
                  {isObjectEmpty(selectedCourseApplication) ? (
                    <div
                      className="d-flex justify-content-center align-items-center  placeholder-text"
                      style={{ width: "100%", height: "70vh" }}
                    >
                      CLICK A CANDIDATE TO VIEW DATA
                    </div>
                  ) : (<>                 
                  {!isObjectEmpty(selectedCourseApplication) && isObjectEmpty(calendarCourseData) && (
                    <CourseCandidatePreviewPane row={selectedCourseApplication} />
                    )}</>)}
                </div>
              </div>
            </React.Fragment>
          ) : (
            <Row className="mt-3 mx-3"></Row>
          )}
        </div>
        </div>
      </div>
      </>
    );
};

export default CourseCandidateManagementDashBoard;
