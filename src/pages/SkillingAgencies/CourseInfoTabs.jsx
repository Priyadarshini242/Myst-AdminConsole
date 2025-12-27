import React, { useEffect, useState } from "react";
// import '../../SkillAvailer/Css/JdInfoTabsSection.css'
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CourseDetails from "./components/course details/CourseDetails";
import PrerequsiteSkills from "./components/course details/PrerequsiteSkills";
import SkillsAttainable from "./components/course details/SkillsAttainable";
import SecondaryBtnLoader from "../../components/Buttons/SecondaryBtnLoader";
import { setMyReqSkills } from "../../reducer/SkillSeeker/SkillBasedSearch/MyRequirementSkillSlice";
import { emptySkillSearchResult } from "../../reducer/SkillSeeker/SkillBasedSearch/SkillBasedResultSlice";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import {
  setMyRefinedLocations,
  setMyRefinedSkills,
} from "../../reducer/SkillSeeker/SkillBasedSearch/RefMyRequirementsSkillSlice";
import { BASE_URL } from "../../config/Properties";
import EditSkills from "./components/EditSkills";
import { icons } from "../../constants";
import useContentLabel from "../../hooks/useContentLabel";
import LazyLoadingImageComponent from "../../components/Lazy Loading Images/LazyLoadingImageComponent";
import skills from "../../img/skills.png";
import "../../components/SkillAvailer/CSS/JdInfoTabsSection.scss";
import CourseDetailsData from "./components/course details/CourseDetailsData";
import { sessionEncrypt } from "../../config/encrypt/encryptData";

const CourseInfoTabs = () => {
  // store imports
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const contentLabel = useContentLabel();

  //stores

  const { selectedCourse } = useSelector((state) => state.myCourses);
  const {
    preRequisiteSkillsList: prerequsiteSkills,
    attainableSkillsList: skillsAttainable,
  } = selectedCourse;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  //my requiremnet
  const MyRequirement = useSelector((state) => state.MyRequirement);

  const [skillsEdit, setSkillsEdit] = useState(false);

  const [dispatchComplete, setDispatchComplete] = useState(false);

  const updateSkillFilter = () => {
    const updatedSkillFilterRef = MyRequirement?.skillsInMyReq?.map(
      (skill) => ({
        ...skill,

        value: skill.skillOccupation,
        label: skill.skillOccupation,
        // Add other properties as needed
      })
    );
    const updatedLocationFilterRef = MyRequirement?.MyRequirement?.map(
      (location) => ({
        value: location.value,
        label: location.value,
        show: true,
        // Add other properties as needed
      })
    );

    dispatch(setMyRefinedLocations(updatedLocationFilterRef || []));
    dispatch(setMyRefinedSkills(updatedSkillFilterRef));

    sessionStorage.setItem(
      "SelectedJdInnitialRequirment",
      sessionEncrypt(
        JSON.stringify({
          skillsInRefined: updatedSkillFilterRef,
          locationsInRefined: updatedLocationFilterRef || [],
        })
      )
    );
  };

  const handleJdSearch = () => {
    console.log(prerequsiteSkills);

    dispatch(
      setMyReqSkills(
        prerequsiteSkills
          ?.filter((skill) => skill.skill)
          .map((data) => ({
            ...data,
            experienceReq: false,
            // minExp: convertDaysToPhase(data.yoeMin, data.yoePhase),
            // maxExp: convertDaysToPhase(data.yoeMax, data.yoePhase),
            // range: data.yoePhase,
            minExp: 0,
            maxExp: 0,
            range: "year",
            required: false,
            validated: false,
            TopSkill: false,
            edit: false,
            show: true,
            label: data.skill,
            value: data.skill,
            skillOccupation: data.skill,
            skillsAttainable:skillsAttainable
          }))
      )
    );

    // dispatch(emptySkillSearchResult());

    setDispatchComplete(true);
  };

  useEffect(() => {
    if (dispatchComplete) {
      updateSkillFilter();
      setDispatchComplete(false); // Reset the state to avoid repeated calls
      // navigate(`/skilling-agency/skillsearch?userCompaniesId=${123456}&jId=${jdStore?.SelectedJd?.id}`);
      navigate(`/skilling-agency/Skill-Search/Access-Database`);
    }
  }, [dispatchComplete]);

  return (
    <div className="font-5">
      <div
        className="nav jd-nav-tabs d-flex justify-content-between"
        id="nav-tab"
      >
        <div>
          <button
            className="jd-nav-link"
            id="nav-JdDetail-Tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-home"
            type="button"
            role="tab"
            aria-controls="nav-home"
            aria-selected="false"
          >
            <icons.CgDetailsMore size={20} className="jd-nav-link-icon" />
            {contentLabel("Details", "nf Details")}
          </button>
          <button
            className="jd-nav-link active"
            id="nav-SkillsList-Tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-skill"
            type="button"
            role="tab"
            aria-controls="nav-skill"
            aria-selected="true"
          >
            <LazyLoadingImageComponent
              src={skills}
              width="15"
              height="15"
              alt="skills icon"
              className="jd-nav-link-icon"
            />{" "}
            {contentLabel("MySkills", "nf Skills")}
          </button>
        </div>

        {selectedCourse?.id && (
          <div className="d-flex justify-content-end align-items-center gap-2  me-2">
            <SecondaryBtnLoader
              label={"Search Candidate"}
              onClick={handleJdSearch}
            />
          </div>
        )}

        {/* <div className='d-flex justify-content-end align-items-center gap-2  me-2'>
                    <SecondaryBtnLoader label={'Search Candidate'} onClick={handleJdSearch} />
                    <SecondaryBtnLoader statusTab={true} onClick={() => setSkillsEdit(true)} label={(content[selectedLanguage]?.find((item) => item.elementLabel === "Edit") || {}).mvalue || "nf Edit"} />
                </div> */}
        {/* <div className='d-flex justify-content-end align-items-center gap-2  me-2'>
                    <button className='btn btn-primary'  onClick={handleJdSearch} >
                    {(content[selectedLanguage]?.find((item) => item.elementLabel === "SearchCandidate") || {}).mvalue || "nf SearchCandidate"}
                    </button>
                    <button className='btn btn-primary' onClick={() => setSkillsEdit(true)}>
                    {(content[selectedLanguage]?.find((item) => item.elementLabel === "Edit") || {}).mvalue || "nf Edit"}
                    </button>
                </div> */}
      </div>

      <div className="tab-content bg-white tabs_Ui" id="nav-tabContent">
        <div
          className="tab-pane show active bg-white"
          id="nav-skill"
          aria-labelledby="nav-SkillsList-Tab"
          tabIndex="0"
        >
          {!selectedCourse?.id ? (
            <>
              <div
                className=" d-flex justify-content-center align-items-center p-2"
                style={{ width: "100%", height: "100%" }}
              >
                {contentLabel(
                  "SelectACourseToViewData",
                  "nf Select a course to view data"
                )}
              </div>
            </>
          ) : (
            <div className="p-2">
              <div>               
                <SkillsAttainable />
              </div>
              <PrerequsiteSkills />
            </div>
          )}
        </div>

        <div
          className="tab-pane bg-white"
          id="nav-home"
          style={{ overflowX: "hidden" }}
          aria-labelledby="nav-JdDetail-Tab"
          tabIndex="1"
        >
          <CourseDetailsData />
        </div>
      </div>
    </div>
  );
};

export default CourseInfoTabs;
