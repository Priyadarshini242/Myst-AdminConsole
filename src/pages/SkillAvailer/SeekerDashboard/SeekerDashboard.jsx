import React, { useEffect, useMemo, useRef, useState } from "react";
import useContentLabel from "./../../../hooks/useContentLabel";
import {
  sessionDecrypt,
  sessionEncrypt,
} from "../../../config/encrypt/encryptData";
import { fetchJobSearch } from "../../../api/SkillSeeker/job detail/fetchJobDetail";
import { Pagination, Skeleton } from "@mui/material";
import JobDetail from "../../../views/dashboard/JobDetail";
import formatCreatedTime from "./../../../views/dashboard/formatCreatedTime";
import FetchJdlistDashboard from "../../../api/SkillSeeker/FetchJdlistDashboard";
import {
  paginationSizeCalculator,
  paginationStartCalcualtor,
} from "../../../components/helperFunctions/GridHelperFunction";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import useMediaQuery from "../../../hooks/useMediaQuery";
import { useDispatch } from "react-redux";
import { setDashboardSelectedJd } from "../../../reducer/SkillSeeker/JdData/JdDataSlice";
import getJdSkillAndQns from "../../../api/Jd Category, Jd Exp, External sites/getJdSkillAndQn";
import { useSelector } from "react-redux";
import { fetchUserAttachment } from "../../../reducer/attachments/getUserAttachmentSlice";
import ad1 from "../../../Images/ad1.png"
import skyscraper from "../../../assets/images/ADVERTISEMENT/skyscraper.jpg";
import { getCookie } from "../../../config/cookieService";
import AdSection from "../../../components/advertisement/AdSection";

const SeekerDashboard = () => {
  /* STORE IMPORTS */
  const {
    getUserAttachment: { userAttachmentData, loading,status },
  } = useSelector((state) => state);
  const contentLabel = useContentLabel();
  const dispatch = useDispatch();
  const [size, setSize] = useState(10);
  const [jobs, setDataList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetchingdata, setIsFetchingdata] = useState(false);
  const [page, setPage] = useState(1);
  const homeLanguage = getCookie("HLang");
  const [filterKey, setFilterKey] = useState("ALL");
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
    const isSmallScreen2 = useMediaQuery("(max-width: 992px)");
    const location = useLocation()

  useEffect(() => {
    // console.log("isSmallScreen", jobs);
    // console.log(userAttachmentData);
    
  }, [jobs]);


     const jobListRef = useRef(null);
  const [jobHeight, setJobHeight] = useState("auto");

    useEffect(() => {
      // Function to update the job height
      const updateJobHeight = () => {
        if (jobListRef.current) {
          setJobHeight(jobListRef.current.offsetHeight);
        }
      };

      // 1. Set up ResizeObserver for the job list element
      let observer;
      if (jobListRef && jobListRef.current) {
        observer = new ResizeObserver(updateJobHeight);
        observer.observe(jobListRef.current);
      }

      // 2. Set up event listener for window resize
      window.addEventListener('resize', updateJobHeight);

      // 3. Cleanup function to remove both listeners
      return () => {
        if (observer) {
          observer.disconnect();
        }
        window.removeEventListener('resize', updateJobHeight);
      };
    }, [jobs]); // Dependency on 'jobs' is kept

  console.log(jobHeight);

  //FETCH DATA
    useEffect(() => {

      if(status==='idle' ){
        dispatch(fetchUserAttachment());
      }
        
    }, [status]);


  function enrichJobDataWithAttachments(attachments, jobs) {
    // Create a mapping of linked IDs from attachments for quick lookup

    const attachmentMap =attachments ? attachments.reduce((map, attachment) => {
      if (!map[attachment.linkedId]) {
        map[attachment.linkedId] = [];
      }
      map[attachment.linkedId].push({
        fileName: attachment.fileName,
        fileId: attachment.fileId,
      });
      return map;
    }, {}) : [] ;
  
    // Add fileName and fileId to jobs where linkedId matches job id
    const enrichedJobs = jobs.map((job) => {
      const matchingAttachments = attachmentMap[job.userCompaniesId] || [];
      return {
        ...job,
        // attachments: matchingAttachments,
        fileName : matchingAttachments[0]?.fileName || '',
        fileId : matchingAttachments[0]?.fileId || ''
      };
    });
  
    return enrichedJobs;
  }

  useMemo(() => {
    const fetchData = async () => {
      setIsFetchingdata(true);
      // const body = {
      //   // externalSite: "bluecollar",
      //   language: homeLanguage,
      //   mstatus: "PUBLISH",
      //     start: (page - 1) * size,
      //     size: size,
      //     // sortField: 'createdTime',
      //     // sortDate: 'desc',
      //     // authToken: token,

      // };
      const body = {
        language: homeLanguage,
        mstatus: "PUBLISH",
        // externalSite: "bluecollar",
        start: (page - 1) * size,
        size: size,
      };
      try {
        const jdData = await FetchJdlistDashboard({
          start: (page - 1) * size,
          size: size,
          sortField: "createdTime",
          sortOrder: "desc",
          status: filterKey !== "ALL" ? filterKey : "%21ARCHIVE",
        });
        const dataFiltration = jdData?.filter(
          (value) =>
            value?.mlanguage === homeLanguage &&
            (filterKey === "ALL" || value?.mstatus === filterKey)
        );

        const updatedJobData = enrichJobDataWithAttachments(userAttachmentData, dataFiltration);
             
        setDataList(updatedJobData);
        console.log("updatedJobData fsr",updatedJobData);

        setTotalCount(jdData[jdData?.length - 1]?.totalCount || 0);
      } catch (error) {
        console.error("ERROR GETTING JOB DETAILS: ", error);
      } finally {
        setIsFetchingdata(false);
      }
    };
   
    // if (status === 'idle') {
    //   dispatch(fetchUserAttachment())
    // }
    // fetchData();
    if(status==='idle' || status==='loading' ){
      return
    }
    if(status === 'success'){  
      fetchData();
    }

  }, [page, homeLanguage, size, filterKey 
    , status
  ]);




  const formatSalary = (salary) => {
    if (!salary) return "";
    const numSalary = Number(salary);

    if (numSalary >= 1000000) {
      return `${(numSalary / 1000000)?.toFixed(1)}M`;
    } else if (numSalary >= 1000) {
      return `${(numSalary / 1000)?.toFixed(0)}k`;
    }

    return salary;
  };

  const totalPages = Math.ceil(totalCount / size);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (isFetchingdata || loading || status === 'idle'  ) {
    return (
      <div className="container-fluid">
        <div className="row">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="col my-2  mx-0">
              <div className="job-block col-lg-12 col-md-12 col-sm-12">
                <div className="inner-box">
                  <div className="content">
                    <h4>
                      <Skeleton variant="text" width="60%" />
                    </h4>
                    <ul className="job-information">
                      <Skeleton variant="text" width="90%" />
                      <Skeleton variant="text" width="50%" />
                    </ul>
                    <ul className="job-other-info d-flex gap-2">
                      <Skeleton variant="rectangular" width={60} height={30} />
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const jobOnclickFunction = async (id, jTitle) => {
    const queryParams = new URLSearchParams({
      id: sessionEncrypt(id),
      name: sessionEncrypt(jTitle),
    }).toString();
    let filteredData = jobs?.length && jobs?.find((job) => job?.id === id);

    try {
      const res = await getJdSkillAndQns(id);
      const filteredQuestions = res?.jdQuestionsList?.filter(
        (question) => question?.id
      );
      const filteredSkillList = res?.jdSkillsList?.filter((skill) => skill?.id);
      const formattedRes = {
        ...res,
        Questions: filteredQuestions,
        JdSkills: filteredSkillList,
      };
      delete formattedRes.jdQuestionsList;
      delete formattedRes.jdSkillsList;
      var finalRes_ = { ...formattedRes, ...filteredData };
    } catch (error) {
      console.error("Error getting jd skills and questions", error);
    }

    dispatch(setDashboardSelectedJd(finalRes_ ? finalRes_ : {}));
    // navigate(`/skill-seeker/Opportunities?redirect=true&id=${id}`);
    navigate(`/skill-seeker/Opportunities?redirect=true`);
  };
















  return (
    <>
    <Row className="m-0 p-0">

   
   <div className="col-lg-10 col-md-12 p-0 m-0" >
        <div className="d-flex justify-content-between flex-wrap">
          <div className="d-flex align-items-center">
            <span
              className="d-flex align-items-center"
              style={{ whiteSpace: "nowrap" }}
            >
              {contentLabel("FilterStatus", "Filter by status")}&nbsp;&nbsp;
            </span>
            <select
              class="form-select"
              value={filterKey}
              onChange={(e) => setFilterKey(e.target.value)}
              style={{
                minWidth: "8rem",
                maxWidth: "10rem",
                color: "var(--primary-color)",
              }}
            >
              <option value="ALL">{contentLabel("All", "nf All")}</option>
              <option value="PUBLISH">
                {contentLabel("Published", "nf Published")}
              </option>
              <option value="DRAFT">{contentLabel("Draft", "nf Draft")}</option>
              <option value="CLOSED">
                {contentLabel("Closed", "nf Closed")}
              </option>
            </select>
          </div>
          <div className="d-flex align-items-center mt-3 mt-md-0 p-3">
            <span className="d-flex align-items-center">
              {contentLabel("ItemsPerPage", "Items per page")}&nbsp;&nbsp;
            </span>
            <select
              class="form-select form-select-sm"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              aria-label=".form-select-sm example"
              style={{ width: "4rem", color: "var(--primary-color)" }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </div>
        </div>
        <div className="content-column col-lg-12">
          <div className="ls-outer" style={{ padding: "20px 0px 20px 0px" }}>
            <Row style={{ paddingRight: "0px" }} ref={jobListRef}>
              {/* JOB DETAIL */}
              <Col
                xl={12}
                lg={12}
                md={12}
                sm={12}
                xs={12}
                className="d-flex flex-wrap"
                style={{ paddingRight: !isSmallScreen && "3px" }}
              >
                <Row className="g-3 w-100">
                {jobs && jobs?.length > 0 ? (
                  jobs
                    ?.filter((job) => job?.id)
                    ?.map((job, index) => (
                      <Col
                        key={index}
                        className="dashboard_job-block"
                        xl={6}
                        lg={6}
                        md={6}
                        sm={12}
                        xs={12}
                      >
                        <JobDetail
                          id={job?.id}
                          userId={job?.userId}
                          fileName={job?.fileName}
                          fileId={job?.fileId}
                          jTitle={job?.title}
                          jCompany={job?.jdCompany}
                          jLocation={job?.jobLocation}
                          jTime={formatCreatedTime(job?.createdTime)}
                          currency={job?.currency}
                          salaryLow={
                            job?.salaryLow ? formatSalary(job?.salaryLow) : ""
                          }
                          userApplyStatus
                          salaryHigh={
                            job?.salaryHigh ? formatSalary(job?.salaryHigh) : ""
                          }
                          jCategory={job?.jdCategoryName}
                          jType={job?.jdType}
                          jExpLevel={job?.experienceLevel}
                          juserApplyStatus={job?.mstatus}
                          onClickFunction={jobOnclickFunction}
                          isAdvertisementPresent={true}
                          isSmallScreen={isSmallScreen}
                          salaryTimeFrame={job?.salaryTimeFrame}
                          hideSalary={job?.hideSalary}
                          newTotal={
                            // job?.totalResponses &&
                            job?.mstatus === "PUBLISH" &&
                            `${job?.newResponses || 0} ${contentLabel(
                              "New",
                              "nf New"
                            )} (${job?.totalResponses || 0} ${contentLabel(
                              "Total",
                              "nf Total"
                            )}) ${contentLabel(
                              "Applications",
                              "nf Applications"
                            )}`
                          }
                          jdCompanyLink={job?.companyLink}
                        />
                      </Col>
                    ))
                ) : (
                  <>
                    <h3 className="text-center">
                      {contentLabel(
                        "NoOpportunitiesAvailable",
                        "nf No opportunities available"
                      )}
                    </h3>
                  </>
                )}
                  </Row>

                {/* PAGINATION */}
                {jobs && jobs?.length > 0 && (
                  <Pagination
                    page={page}
                    count={totalPages}
                    onChange={handlePageChange}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: "var(--primary-color)",
                      },
                      "& .Mui-selected": {
                        backgroundColor: `${"var(--primary-color)"} !important`,
                        color: "#fff",
                      },
                    }}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      width: "100%",
                      margin: "1rem",
                    }}
                  />
                )}
              
              </Col>
              {/* ADVERTISEMENT */}
              <Col
                xl={2}
                lg={2}
                md={12}
                sm={12}
                xs={12}
                style={{
                  // backgroundColor: "var(--PalateTertiary)",
                  borderRadius: "10px",
                  height: "fit-content",
                  marginTop: isSmallScreen ? "" : "0px",
                  display: "flex",
                  justifyContent: "center",
                  paddingRight: "0px",
                }}
              >
                <span style={{ height: "100%" }}>
                  <b className="text-center d-block fs-6 mb-1 ">
                    {/* ADVERTISEMENT */}
                  </b>
                  {/* <img
                    src={skyscraper}
                    alt=""
                    className=""
                    style={{
                      width: "160px",
                      height: "600px",
                      objectFit: "contain",
                      borderRadius: "10px",
                    }}
                  /> */}
                </span>
              </Col>
            </Row>
          </div>
        </div>
      </div>


                        {
                          location?.pathname?.includes('skill-seeker/basic/dashboard') && !isSmallScreen2 &&
            <div className="col-lg-2 p-0 m-0 ps-3">
                        <AdSection row={false} height={jobHeight} placement={'Dashboard-Right'}/>
            </div>
                        }
       </Row>
    </>
  );
};

export default SeekerDashboard;
