import React, { useEffect, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import useContentLabel from "../../../hooks/useContentLabel";
import useMediaQuery from "../../../hooks/useMediaQuery";
import skyscraper from "../../../assets/images/ADVERTISEMENT/skyscraper.jpg";
import {
  sessionDecrypt,  
} from "../../../config/encrypt/encryptData";
import { Pagination, Skeleton } from "@mui/material";
import  fetchAgencyDashboard  from "../../../api/SkillingAgency/fetchAgencyDashboard";
import CourseDetailCard from "./CourseDetailCard";

const SkillAgencyDashboard = () => {
  /* STORE IMPORTS */
  const contentLabel = useContentLabel();
  const [size, setSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);  
  const [filterKey, setFilterKey] = useState("ALL");
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const [isloadingData, setLoadingData] = useState(true);
  const [myCoursesList,setMyCoursesList] = useState([]);

  useEffect(() => {
    console.log("Fetching user courses",filterKey);
    const fetchData = async() => {
      setLoadingData(true);

      try {
     const  getCourseData=await fetchAgencyDashboard({
          start: (page - 1) * size,
          size: size,
          sortField: "createdTime",
          sortOrder: "desc",
          filter:  "",
          status: filterKey!=="ALL" ? filterKey : "%21ARCHIVE",
      })
   setMyCoursesList(getCourseData?.data?.filter((item)=>item?.id));
   setTotalCount((getCourseData?.data?.[(getCourseData?.data?.length)-1]?.totalCount) || 0);  
   
  } catch (error) {
        console.error("ERROR GETTING JOB DETAILS: ", error);
      } finally {
        setLoadingData(false);
      }
    };
      fetchData();
  }, [page,size,filterKey]);


  const handlePageChange = (event, value) => {
    setPage(value);
  };

  console.log("myCoursesList Cout of page",myCoursesList,totalCount,size, Math.ceil(totalCount / size));

  if (isloadingData ) {
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


  return (
    <>
     {isloadingData ?<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><span 
                  className="spinner-border text-primary-color spinner-lg"
                  role="status"
                  aria-hidden="true"
                /></div>  : <div>
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
          <div className="d-flex align-items-center mt-3 mt-md-0">
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
          <div className="ls-outer" style={{ padding: "20px 15px 20px 0px" }}>
            <Row style={{ paddingRight: "0px" }}>
              {/* JOB DETAIL */}
              <Col
                xl={10}
                lg={10}
                md={12}
                sm={12}
                xs={12}
                className="d-flex flex-wrap"
                style={{ paddingRight: !isSmallScreen && "3px" }}
              >
                {myCoursesList && myCoursesList?.length > 0 ? (
                  myCoursesList
                    ?.filter((course) => course?.id)
                    ?.map((course, index) => (
                      <Col
                        key={index}
                        className="dashboard_job-block"
                        xl={6}
                        lg={6}
                        md={6}
                        sm={12}
                        xs={12}
                      >
                        <CourseDetailCard
                        courseDetails={course}
                        newTotal={
                            course?.courseStatus === "PUBLISH" &&
                            `${course?.newResponses || 0} ${contentLabel(
                              "New",
                              "nf New"
                            )} (${course?.totalResponses || 0} ${contentLabel(
                              "Total",
                              "nf Total"
                            )}) ${contentLabel(
                              "Applications",
                              "nf Applications"
                            )}`
                        }
                        />
                      </Col>
                    ))
                ) : (
                  <>
                    <h3 className="text-center">
                      {contentLabel(
                        "NoCoursesAvailable",
                        "nf No Courses available"
                      )}
                    </h3>
                  </>
                )}

                {/* PAGINATION */}
                {myCoursesList && myCoursesList?.length > 0 && (
                  <Pagination
                    page={page}
                    count={Math.ceil(totalCount / size)}
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
                      marginBottom: "1rem",
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
      </div>}
    </>
  );
};

export default SkillAgencyDashboard;
