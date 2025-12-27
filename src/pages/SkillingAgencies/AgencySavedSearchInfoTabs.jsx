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
import { convertDaysToPhase } from "../../components/SkillAvailer/helperFunction/conversion";

const AgencySavedSearchInfoTabs = () => {
  // store imports
  const contentLabel = useContentLabel();

  //stores
  const { selectedCourse, myCoursesListLoading } = useSelector(
    (state) => state.agencySavedSearch
  );

  console.log(selectedCourse);
  

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
      </div>

      <div className="tab-content bg-white tabs_Ui" id="nav-tabContent">
        <div
          className="tab-pane show active bg-white"
          id="nav-skill"
          aria-labelledby="nav-SkillsList-Tab"
          tabIndex="0"
        >
          {!selectedCourse?.id || myCoursesListLoading ? (
            <>
              <div
                className=" d-flex justify-content-center align-items-center p-2"
                style={{ width: "100%", height: "100%" }}
              >
                {contentLabel(
                  "SelectARecordToViewData",
                  "nf Select a Record to view data"
                )}
              </div>
            </>
          ) : (
            <div className="p-2">
              <table class="opportunity-tables table-hover table-responsive table-bordered  align-self-center font-5 w-100 mt-2">
                <thead>
                  <tr>
                    {/* <th className="p-1" scope="col" style={{ width: "5%" }}>
                      #
                    </th> */}
                    <th className="p-1" scope="col" style={{ width: "70%" }}>
                      {contentLabel(
                        "PrerequsiteSkills",
                        "nf Prerequsite Skills"
                      )}
                    </th>
                    <th className="p-1" scope="col" style={{ width: "70%" }}>
                      {contentLabel(
                        "Experience",
                        "nf Experience"
                      )}
                    </th>
                    {/* <th className='p-1' scope="col" style={{ width: '20%' }}>{contentLabel('Mandatory', 'nf Mandatory')}</th> */}
                  </tr>
                </thead>
                <tbody className=" divide-y ml-5  ">
                  {selectedCourse?.preRequisiteSkillsList?.map(
                    (skill, index) => {
                      if (skill.skill) {
                        return (
                          <tr key={index}>
                            {/* <th className="p-1" scope="col">
                              {index + 1}
                            </th> */}
                            <td className="p-1" scope="col">
                              {skill.skillId}
                            </td>
                            <td className="p-1" scope="col">
                            {
                              (skill.yoeMin && skill.yoeMax && skill.yoePhase) ?
                              <>
                                                      {convertDaysToPhase(skill.yoeMin, skill.yoePhase)} -{" "}
                                                      {convertDaysToPhase(skill.yoeMax, skill.yoePhase)}{" "}
                                                      {skill.yoePhase}
                              </>
                              :
                              '-'
                            }

                            </td>
                            {/* <td className='p-1' scope="col"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.isMandatory === 'Yes' ? true : false} /></td> */}
                          </tr>
                        );
                      }
                    }
                  )}
                </tbody>
              </table>

{
  !!selectedCourse?.attainableSkillsList?.length &&
  <>

              <table class="opportunity-tables table-hover table-responsive table-bordered  align-self-center font-5 w-100 mt-3">
                <thead>
                  <tr>
                    {/* <th className="p-1" scope="col" style={{ width: "5%" }}>
                      #
                    </th> */}
                    <th className="p-1" scope="col" style={{ width: "70%" }}>
                      {contentLabel(
                        "SkillsAttainable",
                        "nf Skills Attainable"
                      )}
                    </th>

                    {/* <th className='p-1' scope="col" style={{ width: '20%' }}>{contentLabel('Mandatory', 'nf Mandatory')}</th> */}
                  </tr>
                </thead>
                <tbody className=" divide-y ml-5  ">
                  {selectedCourse?.attainableSkillsList?.map(
                    (skill, index) => {
                      if (skill.skillId) {
                        return (
                          <tr key={index}>
                            {/* <th className="p-1" scope="col">
                              {index + 1}
                            </th> */}
                            <td className="p-1" scope="col">
                              {skill.skill}
                            </td>
                            {/* <td className='p-1' scope="col"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.isMandatory === 'Yes' ? true : false} /></td> */}
                          </tr>
                        );
                      }
                    }
                  )}
                </tbody>
              </table>
  </>
}
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
          {!selectedCourse?.id || myCoursesListLoading ? (
            <>
              <div
                className=" d-flex justify-content-center align-items-center p-2"
                style={{ width: "100%", height: "100%" }}
              >
                {contentLabel(
                  "SelectARecordToViewData",
                  "nf Select a Record to view data"
                )}
              </div>
            </>
          ) : (
            <div className="p-2">
              <div>
                <label htmlFor="" className="fw-bold">
                  {contentLabel("Tittle", "nf Tittle")}
                </label>
                <p>{selectedCourse?.courseName || '-'}</p>
              </div>

              <div>
                <label htmlFor="" className="fw-bold">
                  {contentLabel("Description", "nf Description")}
                </label>
                <p>{selectedCourse?.courseDescription || '-'}</p>
              </div>

              <div>
                <label htmlFor="" className="fw-bold">
                  {contentLabel("Location", "nf Location")}
                </label>
                <p>{selectedCourse?.location || '-'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgencySavedSearchInfoTabs;
