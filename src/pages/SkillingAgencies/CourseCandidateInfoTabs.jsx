import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
// import JdApplicationGrid from './JDRelatedComponents/GRIDS/JdApplicationGrid';
import '../../components/SkillAvailer/CSS/JdInfoTabsSection.scss';
// import OpporShortlistGrid from './JDRelatedComponents/GRIDS/OpporShortlistGrid';
// import OpporScreeningGrid from './JDRelatedComponents/GRIDS/OpporScreeningGrid';
// import OpporSelectedGrid from './JDRelatedComponents/GRIDS/OpporSelectedGrid';
// import OpporRejectedGrid from './JDRelatedComponents/GRIDS/OpporRejectedGrid';
import useContentLabel from '../../hooks/useContentLabel';
import CourseApplicationGrid from './components/candidate management/CourseApplicationGrid';
import CourseShortlistGrid from './components/candidate management/CourseShortlistGrid';
import CourseScreeningGrid from './components/candidate management/CourseScreeningGrid';
import CourseSelectedGrid from './components/candidate management/CourseSelectedGrid';
import CourseRejectedGrid from './components/candidate management/CourseRejectedGrid';

import { fetchCourse } from '../../api/SkillSeeker/course detail/fetchCourseDetail';
import { setSelectedCourseWithData } from '../../reducer/skilling agency/search/AgencySavedSearchSlice';
import { setSelectedCourse } from '../../reducer/skilling agency/course data/courseDataSlice';




const CourseCandidateInfoTabs = ({ handleSwitchPane }) => {
    /* CONTENT LABELS */
    const contentLabel = useContentLabel();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { search } = useLocation(); // Get search params from the URL
    const queryParams = new URLSearchParams(search); // Parse the query params

    const myCourses = useSelector((state) => state.myCourses)
    const savedSearch = useSelector(state => state.agencySavedSearch);
    const [toolbarShow, setToolbarShow] = useState(false);
    const [isSavedSearch, setIsSavedSearch] = useState(false);

    useEffect(()=>{
        const fetchData = async()=>{
            if(queryParams.get("id") ){
                const course = await fetchCourse(queryParams.get("id"))
                const data = {...course?.data , preRequisiteSkillsList:course?.data?.preRequest,attainableSkillsList:course?.data?.attaiable ,courseQuestions:course?.data?.courseQuestions }
                if(queryParams.get("Type") === 'Search'){
                    dispatch(setSelectedCourseWithData(data))
                }
                else{
                    dispatch(setSelectedCourse(data))
                }               
            }
        }
        fetchData()
    },[])


    useMemo(() => {
        const showActionParam = queryParams.get("Type") === 'Search'; // Ensure comparison is correct
        // Update state based on the URL params
        if (showActionParam) {
            setIsSavedSearch(true);
        }
    }, [search]); // Dependency on search to update when the URL changes

     return (
            <div className='font-5'>
                <div className='bg-white campaign_tabs_Ui' >
                    <div className=' bg-white'>
                        <CourseApplicationGrid
                        handleSwitchPane={handleSwitchPane} toolbarStatus={toolbarShow} SelectedOp={isSavedSearch ? savedSearch : myCourses}
                        />
                    </div>
                </div>
            </div>
        );


    return (
        <div className='font-5' >


            <div className='tab-content bg-white campaign_tabs_Ui' id='nav-tabContent'>

                {/* <CandidateInfoTabsTitle /> */}

                <div className='tab-pane active bg-white active' id='nav-application' aria-labelledby='nav-Application-tab' tabIndex='0'>
                    {myCourses?.selectedCourse?.id || savedSearch?.selectedCourse?.id ? (
                        <>
                            
                            <CourseApplicationGrid handleSwitchPane={handleSwitchPane} toolbarStatus={toolbarShow} SelectedOp={isSavedSearch ? savedSearch : myCourses} />

                        </>
                    ) : (
                        <div className='d-flex justify-content-center align-items-center  placeholder-text' style={{ width: '100%', height: '100%' }}>
                            {contentLabel('SelectACourseToViewData', 'nf Select a course to view data')}
                        </div>
                    )}
                </div>

                <div className='tab-pane bg-white' id='nav-shortListed' aria-labelledby='nav-ShortListed-tab' tabIndex='1'>
                    {myCourses?.selectedCourse?.id || savedSearch?.selectedCourse?.id ? (
                        <CourseShortlistGrid handleSwitchPane={handleSwitchPane} SelectedOp={isSavedSearch ? savedSearch : myCourses} />
                    ) : (
                        <div className='d-flex justify-content-center align-items-center  placeholder-text' style={{ width: '100%', height: '100%' }}>
                            {contentLabel('SelectACourseToViewData', 'nf Select a course to view data')}
                        </div>
                    )}
                </div>
                <div className='tab-pane bg-white' aria-labelledby='nav-Screening-tab' id='nav-screening' tabIndex='2'>
                    {myCourses?.selectedCourse?.id || savedSearch?.selectedCourse?.id ? (
                        <CourseScreeningGrid handleSwitchPane={handleSwitchPane} SelectedOp={isSavedSearch ? savedSearch : myCourses} />
                    ) : (
                        <div className='d-flex justify-content-center align-items-center  placeholder-text' style={{ width: '100%', height: '100%' }}>
                            {contentLabel('SelectACourseToViewData', 'nf Select a course to view data')}
                        </div>
                    )}
                </div>
                <div className='tab-pane bg-white' aria-labelledby='nav-Selected-tab' id='nav-selected' tabIndex='3'>
                    {myCourses?.selectedCourse?.id || savedSearch?.selectedCourse?.id ? (
                        <CourseSelectedGrid handleSwitchPane={handleSwitchPane} SelectedOp={isSavedSearch ? savedSearch : myCourses} />
                    ) : (
                        <div className='d-flex justify-content-center align-items-center  placeholder-text' style={{ width: '100%', height: '100%' }}>
                            {contentLabel('SelectACourseToViewData', 'nf Select a course to view data')}
                        </div>
                    )}
                </div>
                <div className='tab-pane bg-white' aria-labelledby='nav-Rejected-tab' id='nav-rejected' tabIndex='4'>
                    {myCourses?.selectedCourse?.id || savedSearch?.selectedCourse?.id ? (
                        <CourseRejectedGrid handleSwitchPane={handleSwitchPane} SelectedOp={isSavedSearch ? savedSearch : myCourses} />
                    ) : (
                        <div className='d-flex justify-content-center align-items-center  placeholder-text' style={{ width: '100%', height: '100%' }}>
                            {contentLabel('SelectACourseToViewData', 'nf Select a course to view data')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseCandidateInfoTabs;
