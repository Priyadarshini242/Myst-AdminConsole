import React, { useRef, useEffect, useState } from 'react';

import ToggleBtn from '../../components/Buttons/ToggleBtn';
import { icons } from '../../constants';
import { useSelector, useDispatch } from 'react-redux';
import CandidatePreviewPane from '../../components/SkillAvailer/JDRelatedComponents/CandidatePreviewPane';
import { emptySelectedApplication } from '../../reducer/SkillSeeker/JdData/JdDataSlice';
import { Button, Card, Row } from 'react-bootstrap';
import useContentLabel from '../../hooks/useContentLabel';
import useMediaQuery from '../../hooks/useMediaQuery';
import CandidateStatusButtons from '../../components/SkillAvailer/Candidate Dashboard/CandidateStatusButtons';
import CandidateGridArea from '../../components/SkillAvailer/Candidate Dashboard/CandidateGridArea';
import { setQuestionFilter, setQuestionFilterView } from '../../reducer/SkillSeeker/Candidate Management/JDResponsesSlice';
import QuestionFilterAccordian from '../../components/SkillAvailer/Candidate Dashboard/QuestionFilterAccoridan';
import CandidateViewToggleBtn from './../../components/SkillAvailer/Candidate Dashboard/CandidateViewToggleBtn';
//this is currently used in opportunity candidate management - new candidadate management dashboard
const CandidateManagementDashboardSG = () => {
    const isSmallScreen = useMediaQuery("(max-width: 768px)");
    const dispatch = useDispatch();
    const sidebarRef = useRef(null);
    const resizerRef = useRef(null);
    const contentLabel = useContentLabel();
    const selectedLanguage = useSelector(state => state.language);
    const content = useSelector(state => state.content);
    const jdStore = useSelector(state => state.JdDataSlice);
    const { showQnsFilter } = useSelector(state => state.JDResponsesSlice);
    // const { viewMode } = useSelector((state) => state.JdViewConfig);
    const [show, setShow] = useState(false);
    const [showQnFilter, setShowQnFilter] = useState(false);
    const [qbsFilters, setQbsFilters] = useState([]);
    const [viewMode, setViewMode] = useState("single");
    const [singleViewActiveScreen, setSingleViewActiveScreen] = useState("left");
    const [showFilters, setShowFilters] = useState(false);
    const { questionFilter } = useSelector(state => state.JDResponsesSlice);

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
    // console.log(jdStore.SelectedApplication);

    //when apply filters button is clicked 
    useEffect(() => {
        // console.log("qbsFilters ", qbsFilters)
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
        // dispatch(setViewMode("split"));
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
    function isObjectEmpty(obj) {
        return Object.keys(obj).length === 0 && obj.constructor === Object;
    }
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

    useEffect(() => {
        dispatch(emptySelectedApplication());
        // console.log("jdStore----   ", jdStore.SelectedJd.Questions)
    }, [jdStore.SelectedJd]);

    const setter = (data) => {
        setShowQnFilter(data);
    }
    return (
        <div className="d-flex font-5">
            {/* Question based filter (QBS filter) sidebar - Exclusive for Candidate management  */}

            <div
                // className={` p-3 ${showFilters ? 'd-block' : 'd-none'}`}
                className={`me-3  ${showQnsFilter ? 'd-block' : 'd-none'}`}
                style={{ width: '450px' }}
            >
                <QuestionFilterAccordian questionList={jdStore?.SelectedJd?.Questions ? jdStore?.SelectedJd?.Questions : []} setFinalFilter={qbsFilterSetter} filterAppliedInQuery={questionFilter} />
            </div>


            <div className="d-flex flex-column w-100" >


                <CandidateStatusButtons
                    showQnsFilter={showQnsFilter}
                    showClose={viewMode === "single" && singleViewActiveScreen === "right"}
                    handleCloseRightMode={handleCloseRightMode}
                />
                {
                    !isSmallScreen &&
                    <div>
                        <CandidateViewToggleBtn
                            labels={labels}
                            onSelectLeft={handleChangeViewToSingle}
                            onSelectRight={handleChangeViewToSplit}
                            left={"93.2%"}
                            top={"4.7%"}
                        />
                    </div>
                }
                {/* <Button onClick={handleShow}>Show Modal</Button> */}
                {/* <QuestionFilterAccordian jdStore={jdStore} setFinalFilter={qbsFilterSetter} /> */}
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
                                {/* <JdListGrid /> */}
                                {/* <JdApplicationGrid /> */}
                                {/* <CandidateInfoTabs handleSwitchPane={singleModeJDOnClick} /> */}
                                <CandidateGridArea handleSwitchPane={singleModeJDOnClick} />
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
                                className="seeker-rs-content "
                                style={{
                                    width: viewMode === "single" ? "0%" : "60%",
                                    height: "100%",
                                    // marginLeft: "auto",
                                    marginLeft: viewMode === "single" ? "0" : '.8rem'
                                }}
                            >
                                {/* <div className='card nav header-nav d-flex justify-content-center' id='nav-tab'>
                <div className='font-3 ms-2'>{jdStore?.SelectedJd && jdStore.SelectedJd.title}</div>
            </div> */}
                                <div
                                    className="card-s-tabs campaign_tabs_Ui"
                                    style={{ overflow: "auto", height: "70.5vh" }}
                                >
                                    {isObjectEmpty(jdStore.SelectedApplication) ? (
                                        <div
                                            className="d-flex justify-content-center align-items-center  placeholder-text"
                                            style={{ width: "100%", height: "70vh" }}
                                        >
                                            {contentLabel(
                                                "ClickCandidateToViewData",
                                                "nf ClickCandidateToViewData"
                                            )}
                                        </div>
                                    ) : (
                                        <CandidatePreviewPane row={jdStore.SelectedApplication} />
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    ) : (
                        <Row className="mt-3 mx-3"></Row>
                    )}
                </div>
            </div>
        </div >
    );
};

export default CandidateManagementDashboardSG;
