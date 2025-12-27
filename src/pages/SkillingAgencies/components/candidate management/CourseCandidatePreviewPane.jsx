import React, { useCallback, useEffect, useMemo, useState,useRef } from "react";
import {useDispatch, useSelector } from "react-redux";
import PrimaryBtn from "../../../../components/Buttons/PrimaryBtn";

import SkillProfileView from "../../../../components/SkillAvailer/SkillProfileView";
import DetailedProfileViewSeeker from "../../../../components/SkillAvailer/DetailedProfileViewSeeker";

import JdAppBasicDetails from "../../../../components/SkillAvailer/JDRelatedComponents/JdApplication Components/JdAppBasicDetails";
import ValidationByItemIdAPI from "../../../../api/SkillSeeker/ValidationByItemIdAPI";
import { FetchDetailedDataByUsedId } from "../../../../api/fetchAllData/FetchDetailedDataByUsedId";
import SkillPRofileOfUserAndUserSkill from "../../../../api/SkillSeeker/SkillPRofileOfUserAndUserSkill";
// import { setCourseCandidateAcquiredSkills, setCourseCandidateAppliedSkills, setCourseCandidateDetailedProfileData } from '../../../../reducer/SkillingAgency/CandidateManagement/selectedCourseApplicationSlice';

import SeekerTimelineReport from '../../../../components/SkillAvailer/Seeker Comman Templates/Seeker TimeLine Template/SeekerTimelineReport';
import CandidateInfo from "../../../../components/SkillAvailer/JDRelatedComponents/CandidateInfo";
import { formatExperience } from "../../../../components/SkillOwner/HelperFunction/FormatExperience";
import useContentLabel from "../../../../hooks/useContentLabel";
import icons from '../../../../constants/icons';
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import SkillProfilePdfGenerator from "../../../../Reports/Generators-Downloaders/SkillProfilePdfGenerator";
import DetailedProfilePdfGenerator from "../../../../Reports/Generators-Downloaders/DetailedProfilePdfGenerator";
import SnapshotProfilePdfGenerator from "../../../../Reports/Generators-Downloaders/SnapshotProfilePdfGenerator";

import CourseCandidateBasicDetails from "./CourseCandidateBasicDetails";
import {
  setCourseCandidateAcquiredSkills,
  setCourseCandidateAppliedSkills,
  setCourseCandidateDetailedProfileData,
  setCourseCandidateValidationData,
  setSelectedCourseApplication,
} from "../../../../reducer/skilling agency/course data/courseDataSlice";
import CourseCandidateSkillProfile from "./CourseCandidateSkillProfile";
import { DownloadAttachment } from "../../../../api/Attachment  API/DownloadAttachmentApi";
import { getAllValidationByUserID } from "../../../../api/validations/validationApi";
import { useLocation } from "react-router-dom";
import { setHideSectionForPdf } from "../../../../reducer/detailed profile/userDetailedProfilSlice";
import SmallLoader from "../../../../components/SkillAvailer/SmallLoader";

const CourseCandidatePreviewPane = ({ row }) => {
  const { pathname } = useLocation();
  const contentLabel = useContentLabel();
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const myCourses = useSelector((state) => state.myCourses);
  const { hideSectionForPdf } = useSelector((state) => state.userDetailedProfileData);

  const dispatch = useDispatch();
  const [skillProfileLoader, setSkillProfileLoader] = useState(false);
  const [appliedSkillData, setAppliedSkillData] = useState([]);
  const [acquiredSkillData, setAcquiredSkillData] = useState([]);
  const [detailProfileLoader, setDetailProfileLoader] = useState(false);
  const [detailProfileShow, setDetailProfileShow] = useState(false);
  const [skillProfileShow, setSkillProfileShow] = useState(false);
  const [summaryView, setSummaryView] = useState(true);

  const [snapShotProfileShow, setSnapShotProfileShow] = useState(false);
  const [timelineViewShow, setTimelineViewShow] = useState(false);
  const [AcqAppDataLoaded, setAcqAppDataLoaded] = useState(false);

  const dropdownRef = useRef(null);
  
    const [skillsLoading, setSkillsLoading] = useState(false);
    const [apiLoading, setApiLoading] = useState(true);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(false);
    const [reportType, setReportType] = useState(null);
      const [showDropdown, setShowDropdown] = useState(false);

  console.log("Preview Course",myCourses?.selectedCourseApplication);
   console.log("row",row);

  // useEffect(()=>{
  //    dispatch(setSelectedCourseApplication({}))
  // },[pathname])

  useEffect(() => {
    reset();
  }, [myCourses?.selectedCourseApplication?.mystProfile]);

  useEffect(() => {
    reset();
  }, [myCourses?.selectedCourse]);

  const reset = () => {
    setAcqAppDataLoaded(false);
    setSkillProfileLoader(false);
    setDetailProfileLoader(false);
    setDetailProfileShow(false);
    setSkillProfileShow(false);
    setSnapShotProfileShow(false);
    setTimelineViewShow(false);
    setAppliedSkillData([]);
    setAcquiredSkillData([]);
    setSummaryView(true);
  };

  const handleSkillProfileClick = async (userDetail) => {
    console.log("handle Skill Profile",!row.validationDatas,row,'Rolw skill',(!row.skillacq || !row.skillapp))
    if (!row.validationDatas) {
        const validationData = await validationApiCaller(userDetail.mystProfile);
        dispatch(
        setCourseCandidateValidationData({
          userId: userDetail?.mystProfile,
          data: validationData,
        })
      );
    }
    if (!row.skillacq || !row.skillapp) {
      const fetchData = async () => {
        
        try {
          setAcqAppDataLoaded(true);
          // Reset acquired and applied skill data arrays
          setAcquiredSkillData([]);
          setAppliedSkillData([]);

          // Call your API function here
          await apilooper();
        } catch (error) {
          console.error("Error fetching skills: grid", error);
        } finally {
          // Handle loading state if needed
          setSkillProfileLoader(false);
        }
      };

      if (
        (!row?.skillacq || row.skillacq.length === 0) &&
        (!row?.skillapp || row.skillapp.length === 0)
      ) {
        console.log("fetch data is called grid ");
        setSkillProfileLoader(true);
        fetchData();
      }
    }
  };

  const handleDetailedProfileClick = async (userDetail) => {
    if (!userDetail.validationDatas) {
      const validationData = await validationApiCaller(userDetail?.mystProfile);

      dispatch(
        setCourseCandidateValidationData({
          userId: userDetail?.mystProfile,
          data: validationData,
        })
      );
    }
    if (!userDetail.detailedProfileData) {
      try {
        console.log("Setting loader to true");
        setDetailProfileLoader(true);
        const res = await FetchDetailedDataByUsedId(userDetail?.mystProfile);

        dispatch(setCourseCandidateDetailedProfileData(res));
        // console.log(
        //   "all details of detailed Profile ",
        //   userDetail?.detailedProfileData
        // );
      } catch (error) {
        // Handle errors appropriately
        console.error("Error fetching skills:", error);
      } finally {
        setDetailProfileLoader(false);
      }
    }
  };

  useEffect(() => {
    if (acquiredSkillData.length > 0) {
      dispatch(
        setCourseCandidateAcquiredSkills({
          userId: row.mystProfile,
          acquiredSkillData: acquiredSkillData,
        })
      );
    }
    if (appliedSkillData.length > 0) {
      dispatch(
        setCourseCandidateAppliedSkills({
          userId: row.mystProfile,
          appliedSkillData: appliedSkillData,
        })
      );
    }
  }, [acquiredSkillData, appliedSkillData]);

 const SkillProfileAPICaller = async (skill) => {
    try {
      const data = await SkillPRofileOfUserAndUserSkill(row.mystProfile, skill);
      // console.log("sACqval  SkillProfileAPICaller", skill, " ", data);


      return data;
    } catch (error) {
      console.error("Error fetching Applied or val data:", error);
      return null;
    }
  };

  // const validationApiCaller = async (skillID) => {
  //     console.log("sACqval ", skillID);
  //     try {
  //         const skillValidation = await ValidationByItemIdAPI(skillID);

  //         console.log("sACqval ", skillValidation);
  //         return skillValidation;
  //     }
  //     catch (error) {
  //         console.log("error in validation api sACqval ", error);

  //     }

  // }

   const validationApiCaller = async (userId) => {
      // console.log("sACqval ", userId);
      try {
        const validationData = await getAllValidationByUserID(userId);
        // console.log("validationData ", validationData);
        return validationData.data;
      } catch (error) {
        console.log("error in validation api sACqval ", error);
      }
    };

  const apilooper = async () => {
    const promises = (Array.isArray(row?.matchingSkills) ? row.matchingSkills : []).map(async (skills) => {
      try {
        const skillProfileData = await SkillProfileAPICaller(
          skills?.skillOccupation,
          row
        );
        const apidataAcquired = skillProfileData?.skillsAcquired;
        const apidataApplied = skillProfileData?.skillsApplied;
        if (apidataAcquired && apidataAcquired.length > 0) {
          // console.log("logging in acq....", apidataAcquired);

          setAcquiredSkillData((prev) => [...prev, ...apidataAcquired]);
        }
        if (apidataApplied && apidataApplied.length > 0) {
          // console.log("logging in app....", apidataApplied);

          setAppliedSkillData((prev) => [...prev, ...apidataApplied]);
        }
      } catch (error) {
        console.error("Error processing skills:", error);
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
  };

  const filteredSkillData = (row) => {
    try {

      if (row?.userSkills?.length) {
        const sortedSkills = [...row?.userSkills] || [];
        sortedSkills.sort((a, b) => {
          if (a.userRank === undefined || b.userRank === undefined) {
            console.warn("Invalid userRank detected during sort.");
            return 0; // Keep elements in their original order if undefined
          }
          return a.userRank - b.userRank;
        });
        return sortedSkills.map((data, index) => ({
          ...data,
          userRank:
            data.userRank && !isNaN(Number(data.userRank)) && Number(data.userRank) <= 5
              ? data.userRank
              : " ",

          skill: data.skill ? data.skill : "",
          skillAppliedExp: (data?.skillAppliedExp && data?.skillAppliedExp !== '0')
            ?
            formatExperience(
              contentLabel,
              data?.fromDate,
              data?.skillAppliedExp
            )
            : "",
          skillAcquiredExp: (data?.skillAcquiredExp && data?.skillAcquiredExp !== '0')
            ? formatExperience(
              contentLabel,
              data?.fromDate,
              data?.skillAcquiredExp
            )
            : "",
        }));
      }
    } catch (error) {
      console.log("error ", error)
      return [];
    }
  };
 const handleDownload = useCallback(() => {

    try {
      let fileName = fileNameContructor(row);
      if (reportError) {
        showErrorToast(contentLabel("SomethingWentWrong", "nf Something went Wrong"));
        return;
      }
      else if (reportLoading) {
        showSuccessToast(contentLabel("Loading", "nf loading"))
        return;
      }
      else if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName + "Snapshot Report.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      showErrorToast(contentLabel("SomethingWentWrong", "nf Something went Wrong"));
    }
  }, [downloadUrl, reportLoading, reportError]);

      useEffect(() => {
        if (!reportType || reportLoading || reportError || !downloadUrl) return;
        console.log("generating report!!!")
        const link = document.createElement("a");
        link.href = downloadUrl;
        let fileName = fileNameContructor(row);
    
    
    
        if (skillProfileShow) {
          fileName= fileName + "MyST Report ";
        } else if (detailProfileShow) {
          fileName = fileName + "MySkillsTree Report ";
        } else if (snapShotProfileShow) {
         fileName = fileName + "Snapshot Report ";
        }
        if(hideSectionForPdf.summary === true){
          fileName = fileName+"DV"
        }
        else if(hideSectionForPdf.detailed===true){
          fileName= fileName+"SV"
        }
        link.download = fileName+ ".pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    
        setDownloadUrl(null);
        setReportType(null); // reset
      }, [downloadUrl, reportType, reportLoading, reportError]);

 const fileNameContructor = (row) => {
    let fileName = "";
    if ((row?.fn === "Yes" || row?.mlnShowHide === "Yes")) {
      fileName = "Confidential ";
    } else {
      if (row.firstName || row?.firstName?.trim().length > 0) {
        fileName = row.firstName + " ";
      }
      if (row.lastName || row?.lastName?.trim().length > 0) {
        fileName = fileName + row.lastName.slice(0, 1) + " ";
      }
    }

    return fileName;
  }

  const handleSkillReportSelection = (reportName, type) => {

    setShowDropdown(false);
    setDownloadUrl(null);
    setReportType(type); // Set which report is selected


    if (type === "summary") {
      dispatch(setHideSectionForPdf({ summary: false, detailed: true }));
    } else {
      dispatch(setHideSectionForPdf({ summary: true, detailed: false }));
    }
  };


  return (
    <div className="d-flex flex-column preview-pane">
      <div
     className="d-flex p-2 gap-2 "
        style={{ height: "auto",  borderBottom: "solid #7c7c7c 1px" }}
      >
       <CandidateInfo userdetails={row} userId={row.mystProfile} />
        {/* UserInfo card */}
        <div
          className="d-flex flex-column p-0  mx-1"
          style={{ marginRight: "auto", width: "100%", minWidth: "50%" }}
        >
         {/* name and button */}
          <div className="d-flex gap-2 line-1">
            <span className="fw-bold mt-0 font-3">
              {row?.fn !== "Yes" && row?.mlnShowHide !== "Yes"
                ? row?.firstName + " " + row?.lastName
                : row?.fn !== "Yes" && row?.mlnShowHide === "No"
                  ? row?.lastName
                  : row?.fn === "No" && row?.mlnShowHide !== "Yes"
                    ? row?.firstName
                    : (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Confidential"
                      ) || {}
                    ).mvalue || "nf CONFIDENTIAL"
              }

            </span>
             {/* buttons */}
            <div
              className="d-flex flex-wrap gap-1"
              style={{ marginLeft: "auto" }}
            >
              <PrimaryBtn
                statusTab={summaryView}
                label={
                  (
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Summary"
                    ) || {}
                  ).mvalue || "nf Summary"
                }
                onClick={() => {
                  setSummaryView(true);
                  setSkillProfileShow(false);
                  setDetailProfileShow(false);
                  setTimelineViewShow(false);
                  setSnapShotProfileShow(false);;
                }}
                backgroundColor="#F7FFDD"
                color="var(--primary-color)"
                font={"400"}
              />

               <PrimaryBtn
                              statusTab={skillProfileShow}
                              label={(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "MySkillProfile"
                                ) || {}
                              ).mvalue || "nf My SkillProfile"}
                              onClick={() => {
                                setSummaryView(false);
                                setSkillProfileShow(true);
                                setDetailProfileShow(false);
                                setTimelineViewShow(false);
                                handleSkillProfileClick(row);
                                setSnapShotProfileShow(false);
                              }}
                              backgroundColor="#F7FFDD"
                              color="var(--primary-color)"
                              font={"400"}
                            />
              <PrimaryBtn
                statusTab={detailProfileShow}
                label={
                  (
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "MySkillsTreeProfile"
                    ) || {}
                  ).mvalue || "nf MySkillsTreeProfile"
                }
                onClick={() => {
                  setSummaryView(false);
                  setSkillProfileShow(false);
                  setDetailProfileShow(true);
                  setTimelineViewShow(false);
                  setSnapShotProfileShow(false);
                  handleDetailedProfileClick(row);
                }}
                backgroundColor="#F7FFDD"
                color="var(--primary-color)"
                font={"400"}
              />
               <PrimaryBtn
                              statusTab={snapShotProfileShow}
                              label={
                                (
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "MystSnapshot"
                                  ) || {}
                                ).mvalue || "nf MystSnapshot"
                              }
                              onClick={() => {
                                setSummaryView(false);
                                setSkillProfileShow(false);
                                setSnapShotProfileShow(true);
                                setDetailProfileShow(false);
                                handleDetailedProfileClick(row);
                                setTimelineViewShow(false);
                              }}
                              backgroundColor="#F7FFDD"
                              color="var(--primary-color)"
                              font={"400"}
                            />
              
                            <PrimaryBtn
                              statusTab={timelineViewShow}
                              label={
                                (
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "Timeline"
                                  ) || {}
                                ).mvalue || "nf Timeline"
                              }
                              onClick={() => {
                                setSummaryView(false);
                                setSkillProfileShow(false);
                                setDetailProfileShow(false);
                                setSnapShotProfileShow(false);
                                setTimelineViewShow(true);
                                handleDetailedProfileClick(row);
                              }}
                              backgroundColor="#F7FFDD"
                              color="var(--primary-color)"
                              font={"400"}
                            />
              
            </div>
          </div>
          {/* email and phone */}
          <div className="d-flex  line-2">
            <div className="d-flex flex-column">
              <div className="flex-wrap " style={{ height: "100%" }}>
                {row?.memailShowHide !== "Yes" && row?.email &&
                  <label>
                    {row?.email}
                  </label>
                }
                {row?.memailShowHide !== "Yes" &&
                  row?.mnShowHide !== "Yes" && (
                    <span>,</span>
                  )}
                {row?.mnShowHide !== "Yes" && row.mobileNumber && (
                  <label>
                    {row.mobileNumber}
                  </label>

                )}
              </div>
              <div className="" style={{ height: "100%" }}>
                <span className="">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Status"
                    ) || {}
                  ).mvalue || "nf Status"}
                </span>{" "}
                : {row.status}
              </div>

            </div>


            <div className="move-right-end  mt-auto d-flex  justify-content-end align-items-end"  >
              {/* Resume pill and video resume -  vresume */}
              <div className=" d-flex flex-wrap justify-content-end ">
                {/*  resume */}
                {
                  (() => {
                    const resumeAttachment = row.attachments?.find(item => item.linkedApplicationName && item.linkedApplicationName === "Resume");
                    return resumeAttachment ? (
                      <div
                        key="Resume"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: "var(--primary-color)",
                          color: 'white',
                          borderRadius: '20px',
                          padding: '2px 6px',
                          margin: "4px",
                          marginLeft: "0px"
                        }}
                      >
                        <a
                          href={DownloadAttachment(
                            resumeAttachment?.userId,
                            resumeAttachment?.fileName,
                            resumeAttachment?.fileId
                          )}
                          download={resumeAttachment?.fileName}
                          style={{
                            color: '#ffff',

                          }}
                        >
                          <span style={{ marginRight: '10px', whiteSpace: 'nowrap' }}>
                            {contentLabel("Resume", "nfResume")}
                          </span>
                          <icons.HiOutlineDocumentDownload />
                        </a>
                      </div>
                    ) : null;
                  })()
                }

                {/*video resume -  vresume */}
                {
                  (() => {
                    const vResumeAttachment = row.attachments?.find(item => item.linkedApplicationName && item.linkedApplicationName === "vResume");
                    return vResumeAttachment ? (
                      <div
                        key="vResume"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: "var(--primary-color)",
                          color: 'white',
                          borderRadius: '20px',
                          padding: '2px 6px',
                          margin: "4px",
                          marginLeft: "0px"
                        }}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => {
                            if (vResumeAttachment.fileType === "youtube.com") {
                              window.open(vResumeAttachment.fileTitle, "_blank");
                            }
                          }}
                        >
                          <span style={{ marginRight: '10px', whiteSpace: 'nowrap' }}>
                            {contentLabel("VideoResume", "nf VideoResume")}
                          </span>
                          <icons.MdOpenInNew />
                        </div>
                      </div>
                    ) : null;
                  })()
                }

              </div>

              {/*  report download button */}
              {!summaryView && (skillProfileShow || detailProfileShow || snapShotProfileShow) &&
                <div className=" d-flex align-items-end ">
                  {(skillProfileShow && (reportLoading || skillsLoading)) ||
                    (detailProfileShow && (reportLoading || detailProfileLoader)) ?
                    <SmallLoader className={"d-flex justify-content-center align-items-end pb-2"} bg={"0px"} height={"1.5rem"} width={"1.6rem"} color="var(--primary-color)" />
                    : snapShotProfileShow ?
                      <icons.HiOutlineDocumentDownload
                        className="text-primary-color"
                        style={{ width: "30px", height: "30px", cursor: "pointer" }}
                        onClick={handleDownload}
                      />
                      :
                      <div style={{ position: "relative", display: "inline-block", }} ref={dropdownRef}>
                        <icons.HiOutlineDocumentDownload
                          className={`text-primary-color `}
                          style={{ width: "30px", height: "30px", cursor: "pointer" }}
                          onClick={() => setShowDropdown(prev => !prev)}
                        />

                        {showDropdown && (
                          <div
                            className="show download-report-dropdown"
                            style={{
                              position: "absolute",
                              top: "100%", // 👈 This places it just below the icon
                              right: 0,
                              zIndex: 9999,
                              marginTop: "5px", // optional gap between icon and dropdown
                              width: "max-content", // 👈 Auto width based on content
                              minWidth: "160px",     // 👈 Optional: prevent it from being too narrow
                              whiteSpace: "nowrap",  // 👈 Prevent line breaks
                            }}
                          >
                            <div className="d-flex flex-column w-100">
                              <button
                                style={{ borderRadius: "4px" }}
                                className="w-100 custom-dropdown-btn"
                                onClick={() => {
                                  if (skillProfileShow) {

                                    handleSkillReportSelection("skillProfile", "summary");
                                  } else if (detailProfileShow) {
                                    handleSkillReportSelection("detailProfile", "summary");
                                  } else if (snapShotProfileShow) {
                                    handleSkillReportSelection("snapshotProfile", "summary");
                                  }
                                  setShowDropdown(false);
                                }}
                              >
                                {contentLabel("SummaryReport", "nf Summary Report")}
                              </button>
                              <button
                                style={{ borderRadius: "4px" }}
                                className="w-100 custom-dropdown-btn"
                                onClick={() => {
                                  if (skillProfileShow) {

                                    handleSkillReportSelection("skillProfile", "detailed");
                                  } else if (detailProfileShow) {
                                    handleSkillReportSelection("detailProfile", "detailed");
                                  } else if (snapShotProfileShow) {
                                    handleSkillReportSelection("snapshotProfile", "detailed");
                                  }
                                  setShowDropdown(false);
                                }}
                              >
                                {contentLabel("DetailedReport", "nf Detailed Report")}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <div className="p-1"
        style={{
          backgroundColor: "#fff",
          overflowX: "hidden",
          height: "100%",
        }}
      >
        {summaryView ? (
          <CourseCandidateBasicDetails row={row} /> //skilling agency component
        ) : skillProfileShow ? (
          <CourseCandidateSkillProfile
            skillProfileView={skillProfileShow}
            userDetail={row} //skilling agency component
            skillPofileLoader={skillProfileLoader}
            listView={true}
          />
        ) : detailProfileShow ? (
          <DetailedProfileViewSeeker
            detailProfileView={detailProfileShow}
            userDetail={row} //skill seeker component
            detailProfileLoader={detailProfileLoader}
          />)
          : snapShotProfileShow ? (<DetailedProfileViewSeeker
                      hideWorkDetail={true}
                      isSnapshot={true}
                      skillData={filteredSkillData(row) || []}
                      hideSkills={false}
                      hideViewModeSwitch={true}
                      detailProfileView={snapShotProfileShow}
                      userDetail={row}
                      detailProfileLoader={detailProfileLoader}
                    />)
            : (
          <>

            <div className="text-center fw-bold my-2"
              style={{
                fontSize: "22px",
                color: "#212529",
              }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Timeline"
                ) || {}
              ).mvalue || "nf Timeline"}
            </div>
             {
                          detailProfileLoader ? (
                            <SmallLoader
                              bg={"120px"}
                              height={"3rem"}
                              width={"3rem"}
                              color={"black"}
                            />
                          ) :
                            (
            <SeekerTimelineReport
                                  employmentHistory={{ data: row?.detailedProfileData?.employments || [] }}
                                  projectHistory={{ data: row?.detailedProfileData?.worksProjects || [] }}
                                  educationHistory={{ data: row?.detailedProfileData?.education || [] }}
                                  certificationHistory={{ data: row?.detailedProfileData?.certifications || [] }}
                                  trainingHistory={{ data: row?.detailedProfileData?.trainings || [] }}
                                  skillingsHistory={{ data: row?.detailedProfileData?.skillings || [] }}
                                  conferenceHistory={{ data: row?.detailedProfileData?.conferences || [] }}
        />  
                )
            }
            
          </>
        )
        }
  </div>

          {/* skill profile pdf generator */}
        
              {skillProfileShow && reportType &&
                  <SkillProfilePdfGenerator
                    viewType={!hideSectionForPdf.summary ? "summary" : "detail"}
                    setDownloadUrl={setDownloadUrl}
                    resumeSkills={row.matchingSkills}
                    SkillsAcquired={row.skillacq}
                    SkillsApplied={row.skillapp}
                    TopSkill={row.userSkills}
                    userValidationData={row.validationDatas}
                    setReportError={setReportError}
                    setReportLoading={setReportLoading}
                    userDetail={row}
                    userId={row.mystProfile}
                  />}
                {/* skill profile pdf generator */}
          
                 {detailProfileShow && reportType &&
                  <DetailedProfilePdfGenerator
                    hideSections={hideSectionForPdf}
                    setDownloadUrl={setDownloadUrl}
                    setReportError={setReportError}
                    setReportLoading={setReportLoading}
                    userValidationData={row.validationDatas}
                    userDetails={row}
                    // setIsPdfReady={setIsPdfReady}
                    detailData={row.detailedProfileData}
                    userId={row.mystProfile}
                  />}
                {snapShotProfileShow &&
                  <SnapshotProfilePdfGenerator
                    skillData={row?.userSkills || []}
                    setDownloadUrl={setDownloadUrl}
                    setReportError={setReportError}
                    setReportLoading={setReportLoading}
                    userValidationData={row.validationDatas}
                    userDetails={row}
                    // setIsPdfReady={setIsPdfReady}
                    detailData={row.detailedProfileData}
                    userId={row.mystProfile}
                  />
                } 
            
                              
        
    
    </div>
  );
};

export default CourseCandidatePreviewPane;
