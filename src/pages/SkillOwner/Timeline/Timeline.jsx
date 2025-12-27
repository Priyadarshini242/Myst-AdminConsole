import React, { useEffect, useRef, useState } from "react";
import Footer from "../../../components/Footer";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar";
import { FetchOrganizationHistory } from "../../../api/fetchAllData/fetchOrganization";
import { useDispatch } from "react-redux";
import {
  MdDelete,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import TableLoaders from "../../../components/CustomLoader/TableLoaders";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { DayDifferenceToDynamicView } from "../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import { duration } from "moment";
import { calculateDaysDifference } from "../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { DayDifferenceToDynamicMonthView } from "../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicMonthView";
import EmploymentChart from "./components/EmploymentChart";
import ExampleChart from "./components/ExampleChart";
import EmpChart from "./components/EmpChart";
import AllChart from "./components/AllChart";
import "./timeline.css";
import { fetchEducationHistory } from "../../../api/fetchAllData/fetchEducationHistory";
import { fetchCertificationHistory } from "../../../api/fetchAllData/fetchCertificationHistory";
import { fetchConferencesHistory } from "../../../api/fetchAllData/fetchConferenceHistory";
import { fetchSkillingHistory } from "../../../api/fetchAllData/fetchSkillingHistory";
import { fetchTrainingHistory } from "../../../api/fetchAllData/fetchTrainingHistory";
import { FetchProjectHistory } from "../../../api/fetchAllData/FetchProjectHistory";
import Loader from "../../../components/Loader";
import AllChart2 from "./components/AllChart2";

const Timeline = () => {
  const navbarRef = useRef(null);
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const [contentHeight, setContentHeight] = useState("100vh");
  const employmentHistory = useSelector((state) => state.employmentHistory);
  const projectHistory = useSelector((state) => state.projectHistory);
  const educationHistory = useSelector((state) => state.educationHistory);
  const certificationHistory = useSelector(
    (state) => state.certificationHistory
  );
  const trainingHistory = useSelector((state) => state.trainingHistory);
  const skillingsHistory = useSelector((state) => state.skillingsHistory);
  const conferenceHistory = useSelector((state) => state.conferenceHistory);
  const [empTimeline, setEmpTimeline] = useState(null);
  const regionalData = useSelector((state) => state.regionalData);
  const dispatch = useDispatch();

  const [viewTable, setViewTable] = useState(false);

  const [selectedTimeline, setSelectedtimeline] = useState("All");
  const [allTimelineRecords, setAllTimelineRecords] = useState([]);

  const handlePdf = () => {
    window.print();
  };

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  useEffect(() => {
    if (employmentHistory.status === "idle") {
      dispatch(FetchOrganizationHistory());
    }

    if (projectHistory.status === "idle") {
      dispatch(FetchProjectHistory());
    }

    if (educationHistory.status === "idle") {
      dispatch(fetchEducationHistory());
    }
    if (certificationHistory?.status === "idle") {
      dispatch(fetchCertificationHistory());
    }
    if (conferenceHistory?.status === "idle") {
      dispatch(fetchConferencesHistory());
    }
    if (skillingsHistory?.status === "idle") {
      dispatch(fetchSkillingHistory());
    }
    if (trainingHistory?.status === "idle") {
      dispatch(fetchTrainingHistory());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper function to add a day to a timestamp (in milliseconds)
  const addDay = (timestamp) => {
    return (parseInt(timestamp) + 24 * 60 * 60 * 1000).toString();
  };

  // Helper function to subtract a day from a timestamp (in milliseconds)
  const subtractDay = (timestamp) => {
    return (parseInt(timestamp) - 24 * 60 * 60 * 1000).toString();
  };

  useEffect(() => {
    // let sortedEmploymentHistory = employmentHistory?.data?.slice().sort((a, b) => parseInt(a.toDate ? a.toDate : `${Date.now()}`) - parseInt(b.toDate ? b.toDate : `${Date.now()}`));

    let sortedEmploymentHistory = employmentHistory?.data
      ?.slice()
      .sort((a, b) => {
        const toDateComparison =
          parseInt(a.toDate ? a.toDate : `${Date.now()}`) -
          parseInt(b.toDate ? b.toDate : `${Date.now()}`);
        if (toDateComparison !== 0) {
          return toDateComparison;
        }
        // If toDate is the same, sort by fromDate
        return parseInt(a.fromDate) - parseInt(b.fromDate);
      });

    // Create a new array to include gaps
    const employmentWithGaps = [];

    for (let i = 0; i < sortedEmploymentHistory.length - 1; i++) {
      const currentEmployment = sortedEmploymentHistory[i];
      const nextEmployment = sortedEmploymentHistory[i + 1];

      // Push the current employment
      employmentWithGaps.push(currentEmployment);

      // Check for a gap
      if (
        parseInt(
          currentEmployment.toDate ? currentEmployment.toDate : `${Date.now()}`
        ) <
        parseInt(
          nextEmployment.fromDate ? nextEmployment.fromDate : `${Date.now()}`
        )
      ) {
        // Create a gap object
        if (
          parseInt(
            nextEmployment.fromDate ? nextEmployment.fromDate : `${Date.now()}`
          ) -
            parseInt(
              currentEmployment.toDate
                ? currentEmployment.toDate
                : `${Date.now()}`
            ) >
          86400000
        ) {
          const gap = {
            applicationName: "Employment",
            organization: "GAP",
            fromDate: `${addDay(currentEmployment.toDate)}`,
            toDate: `${subtractDay(nextEmployment.fromDate)}`,
            duration: calculateDaysDifference(
              addDay(currentEmployment.toDate),
              subtractDay(nextEmployment.fromDate)
            ),
          };
          // Push the gap object
          employmentWithGaps.push(gap);
        }
      }
    }

    // Push the last employment period
    employmentWithGaps.push(
      sortedEmploymentHistory[sortedEmploymentHistory.length - 1]
    );

    setEmpTimeline(employmentWithGaps);
  }, [employmentHistory]);

  useEffect(() => {
    let allRecords = [
      ...employmentHistory?.data,
      ...projectHistory.data,
      ...educationHistory.data,
      ...certificationHistory.data,
      ...trainingHistory.data,
      ...skillingsHistory.data,
      ...conferenceHistory.data,
    ];

    console.log(allRecords);
    let formattedRecords = allRecords.map((record) => {
      if (record.fromDate) {
        return record;
      } else {
        return {
          ...record,
          fromDate: record.startDate,
          toDate: record.endDate ? record.endDate : "",
        };
      }
    });

    console.log(formattedRecords);

    let sortedFormattedRecord = formattedRecords?.sort((a, b) => {
      const toDateComparison = parseInt(a.fromDate) - parseInt(b.fromDate);
      if (toDateComparison !== 0) {
        return toDateComparison;
      }
      // If toDate is the same, sort by fromDate
      return (
        parseInt(a.toDate ? a.toDate : `${Date.now()}`) -
        parseInt(b.toDate ? b.toDate : `${Date.now()}`)
      );
    });

    setAllTimelineRecords(sortedFormattedRecord);
  }, [
    employmentHistory,
    projectHistory,
    educationHistory,
    certificationHistory,
    trainingHistory,
    skillingsHistory,
    conferenceHistory,
  ]);

  return (
    <div>
      <div ref={navbarRef} id="yourNavbarId">
        <Navbar handlePdf={handlePdf}></Navbar>
      </div>

      <hr className="p-0 m-0 " />

      {employmentHistory.status === "loading" ||
      projectHistory.status === "loading" ||
      educationHistory.status === "loading" ||
      certificationHistory.status === "loading" ||
      trainingHistory.status === "loading" ||
      skillingsHistory.status === "loading" ||
      conferenceHistory.status === "loading" ? (
        <>
          <Loader />
        </>
      ) : (
        <>
          <div
            className="px-lg-5 px-4"
            style={{
              height: contentHeight,
              position: "relative",
              isolation: "isolate",
            }}
          >
            {/* <div className=' row ' style={{ width: '20%' }}>
                    <label for="exampleFormControlInput1" class="form-label">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Timeline') || {}).mvalue || "nf Timeline"}<span className='text-danger' >*</span></label>
                    <select className="form-select mb-3 w-100  " aria-label="Default select example" name="type" onChange={(e) => setSelectedtimeline(e.target.value)} value={selectedTimeline}
                    >
                       
                        <option selected value="All" >{(content[selectedLanguage]?.find(item => item.elementLabel === 'All') || {}).mvalue || "nf All"}</option>
                        <option value="Employment" >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Employment') || {}).mvalue || "nf Employment"}</option>
                        <option value="Project" >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Project') || {}).mvalue || "nf Project"}</option>
                        <option value="Education" >{(content[selectedLanguage]?.find(item => item.elementLabel === 'Education') || {}).mvalue || "nf Education"}</option>
                        <option value="Certification">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Certification') || {}).mvalue || "nf Certification"}</option>
                        <option value="Training"> {(content[selectedLanguage]?.find(item => item.elementLabel === 'Training') || {}).mvalue || "nf Training"}</option>
                        <option value="Skilling"> {(content[selectedLanguage]?.find(item => item.elementLabel === 'Skilling') || {}).mvalue || "nf Skilling"}</option>
                        <option value="Conferences">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Conferences') || {}).mvalue || "nf Conferences"}</option>
                    </select>
                </div> */}

            {selectedTimeline === "Employment" && (
              <div className=" row p-0">
                <div className="col-6 p-0 pe-3">
                  <div
                    className="text-white p-2 px-2 rounded-top d-flex justify-content-between  fs-6 w-100 mb-2 "
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "SecBarBgColor"
                          ) || {}
                        ).mvalue || "var(--primary-color)",
                    }}
                  >
                    Employment Timeline
                  </div>

                  <div className="table-responsive w-100">
                    <table className="table table-sm  table-fixed table-hover    ">
                      <thead>
                        <tr className="border-dark-subtle ">
                          <th scope="col" className="bg-body- ">
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "ProjectOrganization"
                              ) || {}
                            ).mvalue || "nf ProjectOrganization"}
                          </th>

                          <th scope="col" className="bg-body- ">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "StartDate"
                              ) || {}
                            ).mvalue || "nf StartDate"}{" "}
                          </th>
                          <th scope="col" className="bg-body- ">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "EndDate"
                              ) || {}
                            ).mvalue || "nf EndDate"}{" "}
                          </th>
                          <th scope="col" className="bg-body- ">
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "ProjectDuration"
                              ) || {}
                            ).mvalue || "nf ProjectDuration"}{" "}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="">
                        {employmentHistory.status === "loading" ? (
                          <TableLoaders Rows={2} Cols={5} btnCols={3} />
                        ) : (
                          employmentHistory.status === "success" &&
                          employmentHistory.data.length > 0 &&
                          empTimeline?.map((certs) => (
                            <tr
                              className={`${
                                certs.organization === "GAP"
                                  ? "table-secondary"
                                  : ""
                              }`}
                            >
                              <td>
                                {certs.organization
                                  ? certs.organization.length > 25
                                    ? certs.organization.substring(0, 25) +
                                      "..."
                                    : certs.organization
                                  : "GAP"}
                              </td>

                              <td>
                                {formatTimestampToDate(Number(certs.fromDate))}
                              </td>
                              <td>
                                {" "}
                                {certs.toDate
                                  ? formatTimestampToDate(Number(certs.toDate))
                                  : "On-going"}
                              </td>
                              <td>
                                {DayDifferenceToDynamicMonthView(
                                  certs.duration
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="col-6 p-0 ps-3">
                  <EmpChart data={empTimeline} />
                </div>
              </div>
            )}

            {selectedTimeline === "All" && (
              <AllChart
                data={allTimelineRecords}
                viewTable={viewTable}
                setViewTable={setViewTable}
              />
            )}

            {/* selectedTimeline === 'All' && <AllChart data={allTimelineRecords} viewTable={viewTable} setViewTable={setViewTable} /> */}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default Timeline;
