import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { DayDifferenceToDynamicMonthView } from "../../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicMonthView";
import { useSelector } from "react-redux";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import Select from "react-select";
import { FetchOrganizationHistory } from "../../../../api/fetchAllData/fetchOrganization";
import { FetchProjectHistory } from "../../../../api/fetchAllData/FetchProjectHistory";
import { fetchEducationHistory } from "../../../../api/fetchAllData/fetchEducationHistory";
import { fetchCertificationHistory } from "../../../../api/fetchAllData/fetchCertificationHistory";
import { fetchConferencesHistory } from "../../../../api/fetchAllData/fetchConferenceHistory";
import { fetchSkillingHistory } from "../../../../api/fetchAllData/fetchSkillingHistory";
import { fetchTrainingHistory } from "../../../../api/fetchAllData/fetchTrainingHistory";
import { useDispatch } from "react-redux";
import { calculateDaysDifference } from "../../../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";

function AllChart({ data, viewTable, setViewTable }) {
  //STORE
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const employmentHistory = useSelector((state) => state.employmentHistory);
  const projectHistory = useSelector((state) => state.projectHistory);
  const educationHistory = useSelector((state) => state.educationHistory);
  const certificationHistory = useSelector(
    (state) => state.certificationHistory
  );
  const trainingHistory = useSelector((state) => state.trainingHistory);
  const skillingsHistory = useSelector((state) => state.skillingsHistory);
  const conferenceHistory = useSelector((state) => state.conferenceHistory);
  const dispatch = useDispatch();

  //COMPONANT STATES
  // const innitalTimelineOptions = [
  //     { value: 'Employment', label: 'Employment' },
  //     { value: 'Project', label: 'Project' },
  //     { value: 'Education', label: 'Education' },
  //     { value: 'Certification', label: 'Certification' },
  //     { value: 'Training', label: 'Training' },
  //     { value: 'Skilling', label: 'Skilling' },
  //     { value: 'Conferences', label: 'Conferences' },

  const [view, setView] = useState("Both");
  // ]
  const [innitalTimelineOptions, setInnitalTimelineOptions] = useState([]);
  const [timelineOptions, setTimelineOptions] = useState([]);
  // const [timelineOptionsArray, setTimelineOptionsArray] = useState(['Employment','Project','Education','Certification','Training','Skilling','Conferences'])

  const [timelineAllRecords, setTimelineALlRecords] = useState([]);
  const [timelineTableRecords, setTimelineTableRecords] = useState([]);
  const [timelineChartRecords, setTimelineChartRecords] = useState([]);
  const [timelineChartGapRecords, setTimelineChartGapRecords] = useState([]);
  const [employmentAnnotation, setEmploymentAnnotation] = useState(null);
  const [dumbbleView, setDumbbleView] = useState(false);
  const [max, setMax] = useState(null);
  const [chartView, setChartView] = useState("Timeline");

  const [seriesData, setSeriesData] = useState([
    {
      name: "Labels",
      data: [
        {
          x: "Employment",
        },
        {
          x: "Project",
        },

        {
          x: "Education",
        },
        {
          x: "Certification",
        },
        {
          x: "Training",
        },
        {
          x: "Skilling",
        },
      ],
    },
    {
      name: "emp",
      data: [
        {
          label: "first",
          x: "Employment",
          y: [
            new Date(`${timestampToYYYYMMDD(1425314340000)}`).getTime(),
            new Date("2017-03-05").getTime(),
          ],
          color: "#008FFB",
        },
        {
          label: "Second",
          x: "Employment",
          y: [
            new Date("2016-05-02").getTime(),
            new Date("2018-03-05").getTime(),
          ],
          color: "#00E396",
        },
        {
          label: "third",
          x: "Employment",
          y: [
            new Date("2019-03-02").getTime(),
            new Date("2020-03-05").getTime(),
          ],
          color: "var(--primary-color)",
        },
        {
          label: "MMMH & MC",
          x: "Employment",
          y: [
            new Date("2020-03-05").getTime(),
            new Date("2021-01-05").getTime(),
          ],
        },
        {
          label: "ECURA",
          x: "Employment",
          y: [
            new Date("2021-01-05").getTime(),
            new Date("2022-03-06").getTime(),
          ],
        },

        {
          x: "Project",
        },

        {
          x: "Education",
        },

        {
          label: "cert 101",
          x: "Certification",
          y: [
            new Date("2019-03-11").getTime(),
            new Date("2019-06-13").getTime(),
          ],
        },

        {
          x: "Training",
        },
        {
          x: "Skilling",
        },
      ],
    },
  ]);

  const options = {
    chart: {
      height: 250,
      type: "rangeBar",
      zoom: {
        enabled: false, // Disable zooming
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: dumbbleView ? "8%" : "70%",
        borderWidth: 0, // Remove border from bars
      },
    },

    xaxis: {
      type: "datetime",
      min: new Date(
        `${timestampToYYYYMMDD(Number(timelineChartRecords[0]?.fromDate))}`
      ).getTime(),
      max: new Date(`${timestampToYYYYMMDD(Number(max))}`).getTime(),
      // max: new Date(`${timestampToYYYYMMDD(Number(timelineChartRecords[timelineChartRecords.length - 1].toDate ? timelineChartRecords[timelineChartRecords.length - 1].toDate : Date.now()))}`).getTime(),
    },

    stroke: {
      width: 0,
    },
    fill: {
      type: "solid",
      opacity: 0.7,
    },
    legend: {
      show: false, // Remove legend
    },
    toolbar: {
      show: false, // Remove toolbar
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const labelValue =
          w.globals.initialSeries[seriesIndex].data[dataPointIndex].label;
        const xValue =
          w.globals.initialSeries[seriesIndex].data[dataPointIndex].x;
        const fromDate =
          w.globals.initialSeries[seriesIndex].data[dataPointIndex].fromDate;
        const toDate =
          w.globals.initialSeries[seriesIndex].data[dataPointIndex].toDate;
        const duration =
          w.globals.initialSeries[seriesIndex].data[dataPointIndex].duration;
        // Customize tooltip content with x-axis value
        return `<div style="padding: 5px;" > 
                <div> 
                Name : ${labelValue}                
                </div>
                <div> 
                Start Date : ${formatTimestampToDate(fromDate)}                
                </div>
                <div> 
                End Date : ${
                  toDate ? formatTimestampToDate(toDate) : "on-going"
                }                
                </div>
                <div> 
                Duration : ${DayDifferenceToDynamicMonthView(
                  duration
                )}                
                </div>
                
                </div>`;
      },
    },
    annotations: {
      xaxis: [
        {
          x:
            employmentAnnotation && chartView === "Timeline"
              ? new Date(
                  `${timestampToYYYYMMDD(
                    Number(employmentAnnotation?.fromDate)
                  )}`
                ).getTime()
              : "",
          borderColor:
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "SecBarBgColor"
              ) || {}
            ).mvalue || "var(--primary-color)",
          label: {
            // borderColor: "#FF4560",
            offsetY: -4,
            orientation: "horizontal",
            style: {
              color: "#fff",
              opacity: ".7",
              background:
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SecBarBgColor"
                  ) || {}
                ).mvalue || "var(--primary-color)",
            },
          },
        },
      ],

      points: [
        {
          x:
            employmentAnnotation && chartView === "Timeline"
              ? new Date(
                  `${timestampToYYYYMMDD(
                    Number(employmentAnnotation?.fromDate)
                  )}`
                ).getTime()
              : "",
          y: "Employment",

          marker: {
            size: 3,
            fillColor:
              (
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "SecBarBgColor"
                ) || {}
              ).mvalue || "var(--primary-color)",
            strokeColor:
              (
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "SecBarBgColor"
                ) || {}
              ).mvalue || "var(--primary-color)",
            radius: 2,
            offsetY: -3,
          },
          label: {
            // borderColor: "#FF4560",
            offsetY: -7,
            style: {
              color: "#fff",
              background:
                (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SecBarBgColor"
                  ) || {}
                ).mvalue || "var(--primary-color)",
            },
            text: `Employment Start- ${formatTimestampToDate(
              Number(employmentAnnotation?.fromDate)
            )}`,
          },
        },
      ],
    },
  };

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

    const applicationNames = [
      ...new Set(
        allRecords?.map((record) => record?.applicationName?.split(" ")[0])
      ),
    ];
    const innitalTimelineOptions = applicationNames?.map((record) => {
      return { value: record, label: record };
    });
    setInnitalTimelineOptions(innitalTimelineOptions);
    setTimelineOptions(innitalTimelineOptions);

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
      // If fromdate is the same, sort by toDate
      return (
        parseInt(a.toDate ? a.toDate : `${Date.now()}`) -
        parseInt(b.toDate ? b.toDate : `${Date.now()}`)
      );
    });

    setTimelineALlRecords(sortedFormattedRecord);
    // setTimelineChartRecords(sortedFormattedRecord)
    // setTimelineTableRecords(sortedFormattedRecord)
  }, [
    employmentHistory,
    projectHistory,
    educationHistory,
    certificationHistory,
    trainingHistory,
    skillingsHistory,
    conferenceHistory,
  ]);

  // Helper function to add a day to a timestamp (in milliseconds)
  const addDay = (timestamp) => {
    return (parseInt(timestamp) + 24 * 60 * 60 * 1000).toString();
  };

  // Helper function to subtract a day from a timestamp (in milliseconds)
  const subtractDay = (timestamp) => {
    return (parseInt(timestamp) - 24 * 60 * 60 * 1000).toString();
  };

  useEffect(() => {
    const timelineOptionsArray =
      timelineOptions.length > 0
        ? timelineOptions.map((option) => option.label)
        : innitalTimelineOptions.map((option) => option.label);

    console.log(timelineOptions);
    let allRecords = timelineAllRecords?.filter((record) => {
      return timelineOptionsArray.includes(
        record?.applicationName?.split(" ")[0]
      );
    });
    console.log(allRecords);
    setTimelineChartRecords(allRecords);

    // Create a new array to include gaps
    const recordWithGaps = [];
    const onlyGapRecords = [];
    let bigDate = 0;

    for (let i = 0; i < allRecords.length - 1; i++) {
      const currentRecord = allRecords[i];
      const nextRecord = allRecords[i + 1];

      // Push the current employment
      recordWithGaps.push(currentRecord);

      bigDate =
        parseInt(
          currentRecord.toDate ? currentRecord.toDate : `${Date.now()}`
        ) > bigDate
          ? parseInt(
              currentRecord.toDate ? currentRecord.toDate : `${Date.now()}`
            )
          : bigDate;

      // Check for a gap
      if (
        bigDate <
        parseInt(nextRecord.fromDate ? nextRecord.fromDate : `${Date.now()}`)
      ) {
        // Create a gap object
        if (
          parseInt(
            nextRecord.fromDate ? nextRecord.fromDate : `${Date.now()}`
          ) -
            parseInt(
              currentRecord.toDate ? currentRecord.toDate : `${Date.now()}`
            ) >
          86400000
        ) {
          const gap = {
            applicationName: "GAP",
            name: "GAP",
            fromDate: `${addDay(currentRecord.toDate)}`,
            toDate: `${subtractDay(nextRecord.fromDate)}`,
            duration: calculateDaysDifference(
              addDay(currentRecord.toDate),
              subtractDay(nextRecord.fromDate)
            ),
          };
          // Push the gap object
          recordWithGaps.push(gap);
          onlyGapRecords.push(gap);
        }
      }
    }

    // Push the last employment period
    recordWithGaps.push(allRecords[allRecords.length - 1]);

    console.log(recordWithGaps);
    setTimelineTableRecords(recordWithGaps);
    setMax(bigDate);

    setTimelineChartGapRecords(onlyGapRecords);

    setChartView("Timeline");
  }, [timelineOptions, timelineAllRecords]);

  const findType = (applicationName) => {
    if (applicationName === "GAP") {
      return "applicationName";
    }
    if (applicationName === "Employment History") {
      return "organization";
    }
    if (applicationName === "Project  History") {
      return "projectActivity";
    }
    if (applicationName === "Education History") {
      return "course";
    }
    if (applicationName === "Certification History") {
      return "certificationName";
    }
    if (
      applicationName === "Training" ||
      applicationName === "Skilling" ||
      applicationName === "Conferences"
    ) {
      return "title";
    }
  };
  const findColor = (applicationName) => {
    if (applicationName === "Employment History") {
      return "var(--primary-color)";
    }
    if (applicationName === "Project  History") {
      return "#00E396";
    }
    if (applicationName === "Education History") {
      return "#008FFB";
    }
    if (applicationName === "Certification History") {
      return "#FEB019";
    }
    if (applicationName === "Training") {
      return "#775DD0";
    }
    if (applicationName === "Skilling") {
      return "#b8d8be";
    }
    if (applicationName === "Conferences") {
      return "#f7e7b4";
    }
  };

  useEffect(() => {
    console.log("triggred");
    if (chartView === "Timeline") {
      if (timelineChartRecords?.length > 0) {
        const chartDataFormat = timelineChartRecords?.map((data) => {
          return {
            ...data,
            label:
              data[findType(data.applicationName ? data?.applicationName : "")],
            x: data?.applicationName?.split(" ")[0],
            y: [
              new Date(
                `${timestampToYYYYMMDD(Number(data?.fromDate))}`
              ).getTime(),
              new Date(
                `${timestampToYYYYMMDD(
                  Number(data?.toDate ? data?.toDate : Date.now())
                )}`
              ).getTime(),
            ],
            fillColor: findColor(
              data.applicationName ? data?.applicationName : ""
            ),
            // fillColor: '#808080'

            goals: dumbbleView
              ? [
                  {
                    name: "Start Date",
                    value: new Date(
                      `${timestampToYYYYMMDD(Number(data?.fromDate))}`
                    ).getTime(),
                    strokeWidth: 10,
                    strokeHeight: 0,
                    strokeLineCap: "round",
                    strokeColor: findColor(
                      data.applicationName ? data?.applicationName : ""
                    ),
                  },
                  {
                    name: "End Date",
                    value: new Date(
                      `${timestampToYYYYMMDD(
                        Number(data?.toDate ? data?.toDate : Date.now())
                      )}`
                    ).getTime(),
                    strokeWidth: 10,
                    strokeHeight: 0,
                    strokeLineCap: "round",
                    strokeColor: findColor(
                      data.applicationName ? data?.applicationName : ""
                    ),
                  },
                ]
              : [],
          };
        });

        console.log(timelineChartRecords);
        console.log(
          timestampToYYYYMMDD(
            Number(
              timelineChartRecords[timelineChartRecords.length - 1].toDate
                ? timelineChartRecords[timelineChartRecords.length - 1].toDate
                : Date.now()
            )
          )
        );

        console.log(chartDataFormat);
        console.log(seriesData);
        console.log([
          //     {
          //     name: 'Labels',
          //     data: [
          //         {
          //             x: 'Employment',

          //         },
          //         {
          //             x: 'Project',

          //         },

          //         {
          //             x: 'Education',

          //         },
          //         {
          //             x: 'Certification',

          //         },
          //         {
          //             x: 'Training',

          //         },
          //         {
          //             x: 'Skilling',

          //         }
          //     ]
          // },
          {
            name: "emp",
            data: chartDataFormat,
          },
        ]);

        setSeriesData([
          //     {
          //     name: 'Labels',
          //     data: [
          //         {
          //             x: 'Employment',

          //         },
          //         {
          //             x: 'Project',

          //         },

          //         {
          //             x: 'Education',

          //         },
          //         {
          //             x: 'Certification',

          //         },
          //         {
          //             x: 'Training',

          //         },
          //         {
          //             x: 'Skilling',

          //         },
          //         {
          //             x: 'Conferences',

          //         }
          //     ]
          // },
          {
            name: "emp",
            data: chartDataFormat,
          },
        ]);
        console.log(timelineChartRecords);
        const emp = timelineChartRecords?.find(
          (record) => record.applicationName === "Employment History"
        );
        console.log(emp);
        setEmploymentAnnotation(emp);
      }
    } else {
      const chartDataFormat = timelineChartGapRecords?.map((data) => {
        return {
          ...data,
          label:
            data[findType(data.applicationName ? data?.applicationName : "")],
          x: data?.applicationName?.split(" ")[0],
          y: [
            new Date(
              `${timestampToYYYYMMDD(Number(data?.fromDate))}`
            ).getTime(),
            new Date(
              `${timestampToYYYYMMDD(
                Number(data?.toDate ? data?.toDate : Date.now())
              )}`
            ).getTime(),
          ],
          fillColor: "#d1e7dd",
          goals: dumbbleView
            ? [
                {
                  name: "Start Date",
                  value: new Date(
                    `${timestampToYYYYMMDD(Number(data?.fromDate))}`
                  ).getTime(),
                  strokeWidth: 10,
                  strokeHeight: 0,
                  strokeLineCap: "round",
                  strokeColor: "#d1e7dd",
                },
                {
                  name: "End Date",
                  value: new Date(
                    `${timestampToYYYYMMDD(
                      Number(data?.toDate ? data?.toDate : Date.now())
                    )}`
                  ).getTime(),
                  strokeWidth: 10,
                  strokeHeight: 0,
                  strokeLineCap: "round",
                  strokeColor: "#d1e7dd",
                },
              ]
            : [],
        };
      });

      console.log(chartDataFormat);
      console.log(seriesData);
      console.log([
        //     {
        //     name: 'Labels',
        //     data: [
        //         {
        //             x: 'Employment',

        //         },
        //         {
        //             x: 'Project',

        //         },

        //         {
        //             x: 'Education',

        //         },
        //         {
        //             x: 'Certification',

        //         },
        //         {
        //             x: 'Training',

        //         },
        //         {
        //             x: 'Skilling',

        //         }
        //     ]
        // },
        {
          name: "emp",
          data: chartDataFormat,
        },
      ]);

      setSeriesData([
        {
          name: "Labels",
          data: [
            {
              x: "GAP",
            },
          ],
        },
        {
          name: "emp",
          data: chartDataFormat,
        },
      ]);

      setEmploymentAnnotation(null);
    }
  }, [timelineChartRecords, chartView, dumbbleView]);

  return (
    <>
      <div
        className="d-flex gap-4 justify-content-start py-2 px-4"
        style={{ position: "relative", right: "40px", zIndex: "999" }}
      >
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="flexRadioDefault1"
            id="Tableview"
            checked={view === "Table"}
            onClick={() => setView("Table")}
          />
          <label
            class="form-check-label"
            htmlFor="Tableview"
            style={{ cursor: "pointer" }}
          >
            {(
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "TableView"
              ) || {}
            ).mvalue || "nf Table view"}
          </label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="flexRadioDefault1"
            id="Chartview"
            checked={view === "Chart"}
            onClick={() => setView("Chart")}
          />
          <label
            class="form-check-label"
            htmlFor="Chartview"
            style={{ cursor: "pointer" }}
          >
            {(
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "ChartView"
              ) || {}
            ).mvalue || "nf Chart view"}
          </label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="flexRadioDefault1"
            id="both"
            checked={view === "Both"}
            onClick={() => setView("Both")}
          />
          <label
            class="form-check-label"
            htmlFor="both"
            style={{ cursor: "pointer" }}
          >
            {(
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "Both"
              ) || {}
            ).mvalue || "nf Both"}
          </label>
        </div>
      </div>

      {/* {
                viewTable ?

                    <div className=' row d-flex my-1 '>

                        <div className='col-3 text-start p-0' style={{ cursor: 'pointer' }} onClick={() => setViewTable(false)}>
                            <MdKeyboardDoubleArrowLeft className='display-6' style={{ color: 'var(--primary-color)' }} />
                            Hide Table
                        </div>
                    </div>
                    :

                    <div className=' row my-1 d-flex text-start'>

                        <div className='col-3 p-0' style={{ cursor: 'pointer' }} onClick={() => setViewTable(true)}>
                            <MdKeyboardDoubleArrowRight className='display-6' style={{ color: 'var(--primary-color)' }} />
                            View Table
                        </div>
                    </div>

            } */}

      <div className="row d-flex justify-content-center mb-4 ">
        <div className="col-lg-7 col-12 p-0">
          <div className="d-flex gap-1 justify-content-end">
            <input
              type="checkbox"
              id="selectAll"
              checked={timelineOptions.join() === innitalTimelineOptions.join()}
              onChange={(e) => {
                if (e.target.checked) {
                  setTimelineOptions(innitalTimelineOptions);
                }
              }}
            />
            <label htmlFor="selectAll">
              {" "}
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "SelectAll"
                ) || {}
              ).mvalue || "nf Select All"}{" "}
            </label>
          </div>

          <Select
            // defaultValue={[colourOptions[2], colourOptions[3]]}
            styles={{
              // Fixes the overlapping problem of the component
              menu: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
            isMulti
            name="colors"
            options={innitalTimelineOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={(newValue) => {
              setTimelineOptions(newValue);
              console.log(newValue);
            }}
            value={timelineOptions}
          />
        </div>
      </div>

      {timelineOptions.length > 0 && (
        <div className=" row p-0">
          <div
            className={`p-0 pe-lg-3 pe-0 ${
              view === "Table" ? "col-12" : "col-lg-6 col-12"
            }`}
            style={{ display: `${view === "Chart" ? "none" : "block"}` }}
          >
            {/* style={{ display: `${viewTable ? 'block' : 'none'}` }} */}

            {view === "Both" && (
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
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "TableView"
                  ) || {}
                ).mvalue || "nf Table view"}
              </div>
            )}

            <div className="table-responsive w-100 mb-5">
              <table className="table table-sm  table-fixed table-hover    ">
                <thead>
                  <tr className="border-dark-subtle ">
                    <th scope="col" className="bg-body- ">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Type"
                        ) || {}
                      ).mvalue || "nf Type"}
                    </th>
                    <th scope="col" className="bg-body- ">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Name"
                        ) || {}
                      ).mvalue || "nf Name"}
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
                          (item) => item.elementLabel === "ProjectDuration"
                        ) || {}
                      ).mvalue || "nf ProjectDuration"}{" "}
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {timelineTableRecords?.length > 0 &&
                    timelineTableRecords?.map((certs) => (
                      <tr
                        className={`${
                          certs?.applicationName === "GAP"
                            ? "table-success"
                            : ""
                        }`}
                      >
                        {/* style={{backgroundColor:certs?.applicationName === 'GAP'?'var(--primary-color)':""}} */}
                        {certs?.applicationName === "GAP" && (
                          <>
                            <td>GAP</td>
                            <td> </td>

                            <td>
                              {formatTimestampToDate(Number(certs?.fromDate))}
                            </td>
                            <td>
                              {" "}
                              {certs?.toDate
                                ? formatTimestampToDate(Number(certs?.toDate))
                                : "On-going"}
                            </td>
                            <td>
                              {DayDifferenceToDynamicMonthView(certs?.duration)}
                            </td>
                          </>
                        )}
                        {certs?.applicationName === "Employment History" && (
                          <>
                            <td>
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Employment"
                                ) || {}
                              ).mvalue || "nf Employment"}
                            </td>
                            <td>
                              {certs?.organization
                                ? certs?.organization.length > 25
                                  ? certs?.organization.substring(0, 25) + "..."
                                  : certs?.organization
                                : "GAP"}
                            </td>

                            <td>
                              {formatTimestampToDate(Number(certs?.fromDate))}
                            </td>
                            <td>
                              {" "}
                              {certs?.toDate
                                ? formatTimestampToDate(Number(certs?.toDate))
                                : "On-going"}
                            </td>
                            <td>
                              {DayDifferenceToDynamicMonthView(certs?.duration)}
                            </td>
                          </>
                        )}
                        {certs?.applicationName === "Project  History" && (
                          <>
                            <td>
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Project"
                                ) || {}
                              ).mvalue || "nf Project"}
                            </td>
                            <td>
                              {certs?.projectActivity
                                ? certs?.projectActivity.length > 25
                                  ? certs?.projectActivity.substring(0, 25) +
                                    "..."
                                  : certs?.projectActivity
                                : "GAP"}
                            </td>

                            <td>
                              {formatTimestampToDate(Number(certs?.fromDate))}
                            </td>
                            <td>
                              {" "}
                              {certs?.toDate
                                ? formatTimestampToDate(Number(certs?.toDate))
                                : "On-going"}
                            </td>
                            <td>
                              {DayDifferenceToDynamicMonthView(certs?.duration)}
                            </td>
                          </>
                        )}
                        {certs?.applicationName === "Education History" && (
                          <>
                            <td>
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Education"
                                ) || {}
                              ).mvalue || "nf Education"}
                            </td>
                            <td>
                              {certs?.course
                                ? certs?.course.length > 25
                                  ? certs?.course.substring(0, 25) + "..."
                                  : certs?.course
                                : "GAP"}
                            </td>

                            <td>
                              {formatTimestampToDate(Number(certs?.fromDate))}
                            </td>
                            <td>
                              {" "}
                              {certs?.toDate
                                ? formatTimestampToDate(Number(certs?.toDate))
                                : "On-going"}
                            </td>
                            <td>
                              {DayDifferenceToDynamicMonthView(certs?.duration)}
                            </td>
                          </>
                        )}
                        {certs?.applicationName === "Certification History" && (
                          <>
                            <td>
                              {(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "Certification"
                                ) || {}
                              ).mvalue || "nf Certification"}
                            </td>
                            <td>
                              {certs?.certificationName
                                ? certs?.certificationName.length > 25
                                  ? certs?.certificationName.substring(0, 25) +
                                    "..."
                                  : certs?.certificationName
                                : "GAP"}
                            </td>

                            <td>
                              {formatTimestampToDate(Number(certs?.fromDate))}
                            </td>
                            <td>
                              {" "}
                              {certs?.toDate
                                ? formatTimestampToDate(Number(certs?.toDate))
                                : "On-going"}
                            </td>
                            <td>
                              {DayDifferenceToDynamicMonthView(certs?.duration)}
                            </td>
                          </>
                        )}
                        {certs?.applicationName === "Training" && (
                          <>
                            <td>
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Training"
                                ) || {}
                              ).mvalue || "nf Training"}
                            </td>
                            <td>
                              {certs?.title
                                ? certs?.title.length > 25
                                  ? certs?.title.substring(0, 25) + "..."
                                  : certs?.title
                                : "GAP"}
                            </td>

                            <td>
                              {formatTimestampToDate(Number(certs?.fromDate))}
                            </td>
                            <td>
                              {" "}
                              {certs?.toDate
                                ? formatTimestampToDate(Number(certs?.toDate))
                                : "On-going"}
                            </td>
                            <td>
                              {DayDifferenceToDynamicMonthView(certs?.duration)}
                            </td>
                          </>
                        )}
                        {certs?.applicationName === "Skilling" && (
                          <>
                            <td>
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Skilling"
                                ) || {}
                              ).mvalue || "nf Skilling"}
                            </td>
                            <td>
                              {certs?.title
                                ? certs?.title.length > 25
                                  ? certs?.title.substring(0, 25) + "..."
                                  : certs?.title
                                : "GAP"}
                            </td>

                            <td>
                              {formatTimestampToDate(Number(certs?.fromDate))}
                            </td>
                            <td>
                              {" "}
                              {certs?.toDate
                                ? formatTimestampToDate(Number(certs?.toDate))
                                : "On-going"}
                            </td>
                            <td>
                              {DayDifferenceToDynamicMonthView(certs?.duration)}
                            </td>
                          </>
                        )}
                        {certs?.applicationName === "Conferences" && (
                          <>
                            <td>
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Conferences"
                                ) || {}
                              ).mvalue || "nf Conferences"}
                            </td>
                            <td>
                              {certs?.title
                                ? certs?.title.length > 25
                                  ? certs?.title.substring(0, 25) + "..."
                                  : certs?.title
                                : "GAP"}
                            </td>

                            <td>
                              {formatTimestampToDate(Number(certs?.fromDate))}
                            </td>
                            <td>
                              {" "}
                              {certs?.toDate
                                ? formatTimestampToDate(Number(certs?.toDate))
                                : "On-going"}
                            </td>
                            <td>
                              {DayDifferenceToDynamicMonthView(certs?.duration)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className={`p-0 ps-lg-3 ps-0 ${
              view === "Chart" ? "col-12" : "col-lg-6 col-12"
            }`}
            style={{ display: view === "Table" ? "none" : "block",
            minHeight: 'var(--cardBodyWithB)',
             }}
          >
            {/* className={`p-0 ps-3 ${viewTable ? 'col-6' : 'col-12'}`}  */}
            {view === "Both" && (
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
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "ChartView"
                  ) || {}
                ).mvalue || "nf Chart view"}
              </div>
            )}

            <div
              className="d-flex gap-3 justify-content-between ps-5"
              style={{ position: "relative", right: "40px" }}
            >
              <div className="d-flex gap-3">
                <div class="form-check" style={{ zIndex: "1" }}>
                  <input
                    class="form-check-input"
                    type="radio"
                    name="dumbbleview"
                    id="dumbbleview1"
                    checked={dumbbleView}
                    onClick={() => setDumbbleView(true)}
                  />
                  <label
                    class="form-check-label"
                    htmlFor="dumbbleview1"
                    style={{ cursor: "pointer" }}
                  >
                    DumbbleView
                  </label>
                </div>
                <div class="form-check" style={{ zIndex: "1" }}>
                  <input
                    class="form-check-input"
                    type="radio"
                    name="dumbbleview"
                    id="dumbbleview2"
                    checked={!dumbbleView}
                    onClick={() => setDumbbleView(false)}
                  />
                  <label
                    class="form-check-label"
                    htmlFor="dumbbleview2"
                    style={{ cursor: "pointer" }}
                  >
                    StackView
                  </label>
                </div>
              </div>

              <div className="d-flex gap-3">
                <div class="form-check" style={{ zIndex: "99" }}>
                  <input
                    class="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault2"
                    checked={chartView === "Timeline"}
                    onClick={() => setChartView("Timeline")}
                  />
                  <label
                    class="form-check-label"
                    htmlFor="flexRadioDefault2"
                    style={{ cursor: "pointer" }}
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Timeline"
                      ) || {}
                    ).mvalue || "nf Timeline"}
                  </label>
                </div>
                <div class="form-check" style={{ zIndex: "99" }}>
                  <input
                    class="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault1"
                    checked={chartView === "GAP"}
                    onClick={() => setChartView("GAP")}
                  />
                  <label
                    class="form-check-label"
                    htmlFor="flexRadioDefault1"
                    style={{ cursor: "pointer" }}
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "GAP"
                      ) || {}
                    ).mvalue || "nf GAP"}
                  </label>
                </div>
              </div>
            </div>

            <div
              id="chart"
              className="text-center"
              style={{ position: "relative", top: "-27px" }}
            >
              <ReactApexChart
                options={options}
                series={seriesData}
                type="rangeBar"
                height={
                  timelineOptions.length > 2
                    ? (timelineOptions.length * 130) / 2
                    : (timelineOptions.length * 220) / 2
                }
              />
              {/* <ReactApexChart options={options} series={seriesData} type="rangeBar" height={200} /> */}
              {timelineChartGapRecords.length === 0 && chartView === "GAP" && (
                <p
                  className=""
                  style={{ position: "relative", bottom: "35vh" }}
                >
                  {" "}
                  Blank map indicates no GAP{" "}
                </p>
              )}
            </div>
            <div id="html-dist"></div>
          </div>
        </div>
      )}
    </>
  );
}

export default AllChart;
