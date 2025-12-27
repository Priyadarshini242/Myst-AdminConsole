import React, { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MdDelete, MdDoneOutline, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";
import PostApi from "../../../../api/PostData/PostApi";
import organizationSearchSuggestions from "../../../../api/searchSuggestionAPIs/organizationSearchSuggestions";
import SuccessBtn from "../../../../components/Buttons/SuccessBtn";
import { debouncedApiRequest } from "../../../../components/DebounceHelperFunction/debouncedApiRequest";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { toTitleCase } from "../../../../components/SkillOwner/HelperFunction/toTitleCase";
import useContent from "../../../../hooks/useContent";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import DatePickerWidget from "../../../../components/molecules/Date/DatePickerWidget";
import { icons } from "../../../../constants";
import { Col, Row } from "react-bootstrap";
import useContentLabel from "../../../../hooks/useContentLabel";
import MonthDropdown from "../../../../views/simple ui/Simple Ui Forms/MonthDropdown";
import { ResumeDateConverter } from "../../../../components/SkillOwner/HelperFunction/ResumeDateConverter";
import MultiSelect from "../../../../components/SkillOwner/SelectComponent/MultiSelect";
import BriefDescriptionTextArea from "../../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import { fetchEmpType } from "../../../../reducer/emp type/empTypeSlice";
import { useDispatch } from "react-redux";
import rangeOptions from "../../../../components/SkillOwner/HelperFunction/durationRangeVariables";
import InputLimit from "../../../../components/InputLimit";
import FloatInput from "../../../../components/atoms/Input/FloatInput";
import handleAvoidE from "../../../../components/SkillOwner/HelperFunction/handleAvoidE";
import DurationFieldTooltip from "../../../../components/atoms/tooltip/DurationFieldTooltip";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { customStylesForReactSelect } from "../../../../components/SkillOwner/HelperFunction/customVariableForReactSelect";

const DropdownIndicator = (props) => {
  return (
    <components.DropdownIndicator {...props}>
      <></>
    </components.DropdownIndicator>
  );
};

const IndicatorSeparator = (innerProps) => {
  return <></>;
};

const ResumeEmp = ({ emp, setResumeEmp, index, updateResumeDetails }) => {
  const contentLabel = useContentLabel();
  const content = useSelector((state) => state.content);
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state) => state.language);
  const regionalData = useSelector((state) => state.regionalData);
  const [onGoing, setOnGoing] = useState(false);
  const [online, setOnline] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState({})
  const { data: emptype, status: emptypeStatus } = useSelector(
    (state) => state.emptype
  );

  /* FETCH EMP-TYPE */
  useEffect(() => {
    const fetchEmptype = async () => {
      try {
        if (emptypeStatus === "idle") {
          await dispatch(fetchEmpType());
        }
      } catch (error) {
        console.error("Failed to fetch emp type", error);
      }
    };
    fetchEmptype();
  }, [emptypeStatus, dispatch]);

  /* STATES INIT */
  const [orgFirstWord, setOrgFirstWord] = useState(
    emp?.organization?.split(" ")[0] || ""
  );
  const [orgSearchValue, setOrgSearchValue] = useState("");
  const [organizationSuggestionsData, setOrganizationSuggestionsData] =
    useState([]);
  const [orgApiData, setOrgApiData] = useState([]);
  const [isApiLoader, setIsApiLoader] = useState(false);
  const [organizationName, setOrganizationName] = useState(
    emp?.organization || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   if (emp?.onGoing) {
  //     setOnGoing(true)
  //   }
  // }, [emp])

  /* ORGANIZATION SUGGESTIONS */
  useEffect(() => {
    if (
      organizationSuggestionsData.length > 0 &&
      organizationSuggestionsData[0].skillOccupation !== "No suggestions found"
    ) {
      const data = organizationSuggestionsData?.map((item) => {
        const newItem = {
          ...item,
          value: item.organization,
          label: item.organization,
        };
        return newItem;
      });
      setOrgApiData(data);
    }
  }, [organizationSuggestionsData]);

  // const orgSearch = (e) => {
  //   // Create a new AbortController on each search change
  //   const controller = new AbortController();
  //   const signal = controller.signal;
  //   if (e.length > 0) {
  //     setOrgApiData([]);
  //     setIsApiLoader(true);
  //     debouncedApiRequest(
  //       organizationSearchSuggestions,
  //       e,
  //       selectedLanguage,
  //       setOrganizationSuggestionsData,
  //       setIsApiLoader,
  //       signal
  //     );
  //   } else {
  //     setOrgApiData([]);
  //   }
  // };
  // Track state for all accordions
  const [accordionStates, setAccordionStates] = useState({});

  // Utility to update accordion-specific state
  const updateAccordionState = (id, key, value) => {
    setAccordionStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [key]: value,
      },
    }));
  };

  // API effect scoped to each accordion
  useEffect(() => {
    const currentAccordion = accordionStates[emp.id];
    // console.log(currentAccordion?.orgFirstWord);
    if (currentAccordion?.orgFirstWord?.trim()?.length > 2) {
      const controller = new AbortController();
      const signal = controller.signal;

      updateAccordionState(emp.id, "isApiLoader", true);

      debouncedApiRequest(
        organizationSearchSuggestions,
        currentAccordion.orgFirstWord,
        selectedLanguage,
        (data) => {
          // console.log(data);
          const formattedData = data?.map((data) => ({
            value: data?.organization,
            label: data?.organization,
          }));
          updateAccordionState(
            emp.id,
            "organizationSuggestionsData",
            formattedData || []
          );
          updateAccordionState(emp.id, "isApiLoader", false);
        },
        () => updateAccordionState(emp.id, "isApiLoader", false),
        signal
      );

      return () => {
        controller.abort();
        updateAccordionState(emp.id, "isApiLoader", false);
      };
    } else {
      updateAccordionState(emp.id, "organizationSuggestionsData", []);
    }
  }, [
    accordionStates[emp.id]?.orgFirstWord,
    emp.id,
    selectedLanguage,
    emp?.edit,
  ]);

  const handleOrganizationChange = (selectedOption) => {
    // console.log('triggered2');

    // console.log(selectedOption);

    const isExisting = accordionStates[emp.id]?.orgApiData?.some(
      (org) => org.label === selectedOption?.label
    );

    // updateAccordionState(emp.id, "orgFirstWord",  isExisting ? selectedOption.label : toTitleCase(selectedOption.label));
    // updateAccordionState(emp.id, "orgFirstWord", accordionStates[emp.id]?.orgFirstWord);
    updateAccordionState(
      emp.id,
      "organizationName",
      isExisting ? selectedOption.label : toTitleCase(selectedOption.label)
    );

    // updateAccordionState(emp.id, "orgFirstWord", selectedOption?.label);

    setOrganizationName(selectedOption.label);

    // Update parent state if necessary
    setResumeEmp((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
            ...item,
            organization: isExisting
              ? selectedOption.label
              : toTitleCase(selectedOption.label),
          }
          : item
      )
    );
    // Blur the currently active element (the select input)
    document.activeElement.blur();
  };

  // /* HANDLE ORGANIZATION NAME CHANGE */
  // const handleOrganizationChange = (selectedOption) => {
  //   if (selectedOption) {
  //     /* CHECKING FOR THE ENTERED ORGANIZATION VALUE PRESENT IN DB */
  //     const isExistingOrganization = orgApiData.some(
  //       (organization) => organization.label === selectedOption.labelm
  //     );

  //     if (!isExistingOrganization) {
  //       /* FOR USER ENTERED VALUE */
  //       setOrganizationName(toTitleCase(selectedOption.label));
  //     } else {
  //       /* FOR THE ORGANIZATION VALUES IN DB */
  //       setOrganizationName(selectedOption.label);
  //     }
  //   } else {
  //     setOrganizationName("");
  //     setOrgApiData([]);
  //   }
  // };

  // Custom styles for CreatableSelect
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      width: "100%",
      // pointerEvents:'none'
    }),
  };

  // Handle change of position data
  const handleChange = (companyId, positionIndex, field, value) => {
    setResumeEmp((prevEmp) => {
      const updatedData = prevEmp.map((company) => {
        if (company.id === companyId) {
          const updatedPositions = company.position.map((position, index) => {
            if (index === positionIndex) {
              return {
                ...position,
                [field]: value,
              };
            }
            return position;
          });
          return {
            ...company,
            position: updatedPositions,
          };
        }
        return company;
      });

      return updatedData;
    });
    // setResumeEmp(updatedData);
  };

  //to set online state when all location set to null
  useEffect(()=>{
    if (emp?.position) {
      const newStatus = {};
      emp.position.forEach((position, index) => {
        newStatus[index] = position.location?.includes("Online") || false;
      });
      setOnlineStatus(newStatus);
    }
  },[emp])

  
  

  return (
    <div
      className="d-md-flex d-block gap-2 align-items-start"
    // style={{opacity : emp?.position?.every(pos => pos.import === true) ? '.5' : '1' , pointerEvents: emp?.position?.every(pos => pos.import === true) ?'none' : ''}}
    >
      <input
        type="checkbox"
        className=""
        style={{ marginTop: "1.3rem" }}
        name=""
        id=""
        checked={emp?.active || emp?.import}
        // disabled={emp?.position?.every(pos => pos.import === true)}
        disabled={
          emp?.import || emp?.position?.every((pos) => pos.import === true)
        }
        onChange={(e) => {
          setResumeEmp((prevEmp) => {
            return prevEmp.map((item) =>
              item.id === emp.id ? { ...item, active: e.target.checked } : item
            );
          });
        }}
      />
      <div class="accordion w-100 resumeAccordion" id="accordionPanelsStayOpenExample" >
        <div class="accordion-item  ">
          <h2 class="accordion-header ">
            <button
              class={`accordion-button collapsed`}
              style={{ color: "black" }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#panelsStayOpen-collapseEmp${emp?.id}`}
              aria-expanded="false"
              aria-controls={`panelsStayOpen-collapseEmp${emp?.id}`}
              onClick={() => {
                if (!accordionStates[emp.id]?.isOpen) {
                  updateAccordionState(emp.id, "isOpen", true);
                  updateAccordionState(
                    emp.id,
                    "orgFirstWord",
                    emp?.organization || ""
                  );
                  updateAccordionState(
                    emp.id,
                    "organization",
                    emp?.organization || ""
                  );
                }
              }}
            >
              {/* {emp?.organization} */}
              {contentLabel("Employment", "nf Employment")}-{index + 1}
            </button>
          </h2>
          <div
            id={`panelsStayOpen-collapseEmp${emp?.id}`}
            class={`accordion-collapse collapse `}
          >
            <div class="accordion-body" style={{ position: "relative" }}>
              <Row>
                <Col
                  lg={6}
                  style={{
                    opacity:
                      emp?.import ||
                        emp?.position?.some((pos) => pos.import === true)
                        ? ".5"
                        : "1",
                    pointerEvents:
                      emp?.import ||
                        emp?.position?.some((pos) => pos.import === true)
                        ? "none"
                        : "",
                  }}
                >
                  <div class="mb-4">
                    <label
                      htmlFor="org-name"
                      className=" text-start form-label"
                    >
                      {contentLabel("Organization", "nf Organization")}
                      <span className="text-danger ms-1">*</span>
                    </label>

                    <div className="w-100">
                      <CreatableSelect
                        styles={customStylesForReactSelect}
                        components={{
                          DropdownIndicator: null,
                          IndicatorSeparator: null,
                        }}
                        onKeyDown={(e) => {
                          if (LIMITED_SPL_CHARS.includes(e.key)) {
                            e.preventDefault();
                            showErrorToast(
                              contentLabel(
                                "SpecialCharNotAllowed",
                                "nf Special Characters Not Allowed"
                              )
                            );
                          }
                        }}
                        onFocus={() => {
                          updateAccordionState(
                            emp.id,
                            "orgFirstWord",
                            emp?.organization
                          );
                        }}
                        onInputChange={(value, event) => {
                          if (event.action === "menu-close" && false) {
                            if (!value) {
                              updateAccordionState(
                                emp.id,
                                "orgFirstWord",
                                accordionStates[emp.id]?.orgFirstWord
                              );
                            }
                          } else
                            updateAccordionState(emp.id, "orgFirstWord", value);
                        }}
                        onChange={handleOrganizationChange}
                        // options={accordionStates[emp.id]?.organizationSuggestionsData || []}
                        options={(() => {
                          const options =
                            accordionStates[emp.id]
                              ?.organizationSuggestionsData || [];
                          const trimmedInputValue =
                            accordionStates[emp.id]?.orgFirstWord
                              ?.trim()
                              .toLowerCase() || "";

                          // Sort options: exact matches first
                          return [...options].sort((a, b) => {
                            const aMatch =
                              a.label.trim().toLowerCase() ===
                              trimmedInputValue;
                            const bMatch =
                              b.label.trim().toLowerCase() ===
                              trimmedInputValue;
                            if (aMatch && !bMatch) return -1;
                            if (!aMatch && bMatch) return 1;
                            return 0;
                          });
                        })()}
                        isLoading={accordionStates[emp.id]?.isApiLoader}
                          menuIsOpen={accordionStates[emp.id]?.isApiLoader ? false : undefined}
                        inputValue={accordionStates[emp.id]?.orgFirstWord || ""}
                        value={
                          emp?.organization
                            ? {
                              label: emp?.organization,
                              value: emp?.organization,
                            }
                            : null
                        }
                        // menuIsOpen={true}
                        isValidNewOption={(inputValue) => {
                          const options =
                            accordionStates[emp.id]
                              ?.organizationSuggestionsData || [];
                          // return (
                          //   inputValue?.trim()?.length > 2 &&
                          //   !options?.some(
                          //     (option) =>
                          //       option?.label?.trim() === inputValue?.trim() // case-sensitive comparison
                          //   )
                          // );

                          if (!inputValue || inputValue?.trim()?.length <= 2) return false;
                          const trimmed = inputValue?.trim()?.toLowerCase();
                          // Check if option exists already
                          const exists =  options?.some(
                            (opt) => opt?.label?.trim()?.toLowerCase() === trimmed
                          );
                          return !exists; // allow create only when NOT existing
                        }}
                              formatCreateLabel={(inputValue) => (
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <span>
  {inputValue
    ?.split(" ")
    ?.map(word => word.charAt(0).toUpperCase() + word.slice(1))
    ?.join(" ")
  }
</span>
          <span style={{ color: "var(--primary-color)" }}>{contentLabel('Create', 'nf Create')}</span>
        </div>
      )}
                        createOptionPosition="first" // Ensure "Create" option appears at the top
                      />
                    </div>
                  </div>
                </Col>

                <Col
                  lg={6}
                  style={{
                    opacity:
                      emp?.import ||
                        emp?.position?.some((pos) => pos.import === true)
                        ? ".5"
                        : "1",
                    pointerEvents:
                      emp?.import ||
                        emp?.position?.some((pos) => pos.import === true)
                        ? "none"
                        : "",
                  }}
                >
                  <div className="mb-4">
                    <label class="text-label form-label">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Type"
                        ) || {}
                      ).mvalue || "nf Type"}
                      <span className="text-danger ms-1">*</span>
                    </label>

                    <select
                      className={`form-select ${emptypeStatus === "loading" && "skeleton-loading"
                        }`}
                      style={{ backgroundColor: "#ffff" }}
                      aria-label="Default select example"
                      value={emp?.empType}
                      onChange={(e) => {
                        setResumeEmp((prevEmp) => {
                          return prevEmp.map((item) =>
                            item.id === emp.id
                              ? { ...item, empType: e.target.value }
                              : item
                          );
                        });
                      }}
                    >
                      <option selected disabled>
                        {contentLabel(
                          "PleaseSelectType",
                          "nf Please Select a Type"
                        )}
                      </option>
                      <>
                        {emptype?.length &&
                          emptype?.map((type) => (
                            <option key={type?.id} value={type?.empLabel}>
                              {type?.empLabel}
                            </option>
                          ))}
                      </>
                    </select>
                  </div>
                </Col>

                <Col lg={6}
                 style={{
                    opacity:
                      emp?.import ||
                        emp?.position?.some((pos) => pos.import === true)
                        ? ".5"
                        : "1",
                    pointerEvents:
                      emp?.import ||
                        emp?.position?.some((pos) => pos.import === true)
                        ? "none"
                        : "",
                  }}
                >
                  <div className="mb-4">
                    <label htmlFor="" className="form-label">{contentLabel('CurrentDesignation', 'nf Current Designation')}</label>
                    <input
                      className="form-control"
                      maxLength={100}
                      value={emp?.latestDesignation || ""} // Make it controlled
                      onChange={(e) => {
                        setResumeEmp((prevEmp) => {
                          return prevEmp.map((item) =>
                            item.id === emp.id
                              ? { ...item, latestDesignation: e.target.value }
                              : item
                          );
                        });
                      }}
                    />
                    <Col className="text-secondary text-muted text-end w-100">
                      {(100 - (emp?.latestDesignation?.length > 0 ? emp?.latestDesignation?.length : 0))}
                    </Col>
                  </div>
                </Col>

                <Col
                  xs={12}
                  style={{
                    opacity:
                      emp?.import ||
                        emp?.position?.some((pos) => pos.import === true)
                        ? ".5"
                        : "1",
                    pointerEvents:
                      emp?.import ||
                        emp?.position?.some((pos) => pos.import === true)
                        ? "none"
                        : "",
                  }}
                >
                  <BriefDescriptionTextArea
                    label={contentLabel("KPI", "nf KPI")}
                    htmlFor={"kpi"}
                    isRequired={false}
                    textareaClass={""}
                    id="kpi"
                    name={"kpi"}
                    value={emp?.kpi}
                    onChange={(e) => {
                      setResumeEmp((prevEmp) => {
                        return prevEmp.map((item) =>
                          item.id === emp.id
                            ? { ...item, kpi: e.target.value }
                            : item
                        );
                      });
                    }}
                    limit={500}
                  />
                </Col>

                {emp?.position?.map((position, positionIndex) => {
                  return (
                    <div
                      className="d-md-flex d-block align-items-start gap-3 " 
                      style={{
                        opacity: position?.import ? ".5" : "1",
                        pointerEvents: position?.import ? "none" : "",
                      }}
                    >
                      <input
                        type="checkbox"
                        className=""
                        name=""
                        id=""
                        checked={position?.active || position?.import}
                        disabled={position?.import}
                        onChange={(e) => {
                          handleChange(
                            emp?.id,
                            positionIndex,
                            "active",
                            e.target.checked
                          );
                          if(e.target.checked){
                          setResumeEmp((prevEmp) => {
                          return prevEmp.map((item) =>
                            item.id === emp.id
                              ? { ...item, active: true }
                              : item
                          );
                          });
                          }
                        }}
                      />

                      <div
                        className="p-md-4 p-1 mb-4 border border-2 rounded d-flex align-items-start gap-3 w-100"
                        style={{ position: "relative" }}
                      >
                        {/* <input type="checkbox" className='mt-1'  name="" id="" checked={position?.active}
                        onChange={(e) => {
                          handleChange(emp?.id, positionIndex, 'active', e.target.checked)
                        }}
                      /> */}
                        <Row className="p-2">
                            {position?.import && (
                          <Col className="mb-1" sm={12}>
                              <div
                                className="d-flex justify-content-end fw-bold text-primary-color"
                                style={{ top: "1.3rem", right: "2rem" }}
                              >
                                {contentLabel("Imported", "nf Imported")}
                              </div>
                            </Col>
                            )}
                          
                          <Col className="mb-4" lg={6} sm={12}>
                            <label
                              htmlFor="last-name"
                              className=" text-start form-label"
                            >
                              {contentLabel("Project", "nf Work Detail")} -{" "}
                              {positionIndex + 1}
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <input
                              type="Text"
                              class="form-control"
                              id="position-name"
                              placeholder="Enter your position"
                              value={position.workDetail}
                              onChange={(e) => {
                                handleChange(
                                  emp?.id,
                                  positionIndex,
                                  "workDetail",
                                  e?.target?.value
                                );
                                // setResumeEmp((prevEmp) => {
                                //   return prevEmp.map((item) =>
                                //     item.id === emp.id
                                //       ? { ...item, position: { ...item?.position, workDetail: e.target.value } }
                                //       : item
                                //   );
                                // });
                              }}
                            />
                            <InputLimit value={position.workDetail} />
                          </Col>

                          <Col lg={6}>
                            <div className="mb-4">
                              <label htmlFor="" className="form-label">{contentLabel('Designation', 'nf Designation')}</label>
                              <input
                                className="form-control"
                                maxLength={100}
                                value={position?.designation || ""} // Make it controlled
                             onChange={(e) => {
                                handleChange(
                                  emp?.id,
                                  positionIndex,
                                  "designation",
                                  e?.target?.value
                                );
                              }}
                              />
                              <Col className="text-secondary text-muted text-end w-100">
                                {(100 - (position?.designation?.length > 0 ? position?.designation?.length : 0))}
                              </Col>
                            </div>
                          </Col>

                          <Col
                            xl={12}
                            lg={12}
                            xs={12}
                            className="d-flex justify-content-between"
                          >
                            {/* START YEAR */}
                            <Col xs={6} className="pe-1 pe-md-3">
                              <div className="mb-2 d-flex flex-column justify-content-between">
                                <label className="text-label form-label d-flex align-items-center white-space-no-wrap">
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel ===
                                        "WhenDidYouStartYourWork"
                                    ) || {}
                                  ).mvalue ||
                                    "nf When did you start your Work "}{" "}
                                  <span className="text-danger ms-1">*</span>
                                </label>

                                <div className=" ">
                                  <DatePicker
                                    className={`form-control h-75 px-2 `}
                                    selected={
                                      position?.startYear
                                        ? new Date(
                                          parseInt(
                                            new Date(
                                              position?.startYear,
                                              0,
                                              1
                                            ).getTime()
                                          )
                                        )
                                        : null
                                    }
                                    onChange={(date) => {
                                      // console.log(date)
                                      if (!date) {
                                        return;
                                      }
                                      handleChange(
                                        emp?.id,
                                        positionIndex,
                                        "startYear",
                                        new Date(date).getFullYear()
                                      );
                                      handleChange(
                                        emp?.id,
                                        positionIndex,
                                        "startMonth",
                                        1
                                      );
                                      // setResumeEmp((prevEmp) => {
                                      //   return prevEmp.map((item) =>
                                      //     item.id === emp.id
                                      //       ? { ...item, position: { ...item?.position, startYear: new Date(date).getFullYear() } }
                                      //       : item
                                      //   );
                                      // })
                                    }}
                                    selectsEnd
                                    dateFormat="yyyy"
                                    placeholderText="Year"
                                    showYearPicker
                                    maxDate={new Date()}
                                  />
                                </div>
                              </div>
                            </Col>
                            {/* start month */}

                            <Col xs={6} className="ps-1 ps-md-3">
                              <div className="mb-2 d-flex flex-column justify-content-between">
                                <label className="text-label form-label d-flex align-items-center">
                                  &nbsp;
                                </label>

                                <MonthDropdown
                                  isParser={true}
                                  onSelectMonthInNumber={(data) => {
                                    handleChange(
                                      emp?.id,
                                      positionIndex,
                                      "startMonth",
                                      data
                                    );
                                    // setResumeEmp((prevEmp) => {
                                    //   return prevEmp.map((item) =>
                                    //     item.id === emp.id
                                    //       ? { ...item, position: { ...item?.position, startMonth: data } }
                                    //       : item
                                    //   );
                                    // })
                                  }}
                                  selectedMonthNumber={position.startMonth}
                                  selectedYear={
                                    new Date(position?.startYear, 0, 1)
                                  }
                                />
                              </div>
                            </Col>
                          </Col>

                          <Col
                            lg={12}
                            className="d-flex justify-content-between"
                          >
                            {/* Duration in number */}
                            <Col xs={6} className="pe-1 pe-md-3">
                              <div className="mb-4 d-flex flex-column justify-content-between">
                                <label className="text-label form-label d-flex justify-content-between align-items-center white-space-no-wrap">
                                  <div>
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Duration"
                                      ) || {}
                                    ).mvalue || "nf Duration"}
                                    <span className="text-danger ms-1">*</span>
                                    <DurationFieldTooltip />
                                  </div>
                                </label>
                                <FloatInput
                                  id="EmploymentResumeDurationNormal"
                                  name="EmploymentResumeDurationNormal"
                                  style={{ height: "2.6rem" }}
                                  decimalStep="0.01" // Allows up to 2 decimal places
                                  disabled={position?.onGoing}
                                  placeholder={"0.00"}
                                  value={position?.duration}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow numbers with up to 2 decimal places (e.g., 1.50, 2.75)
                                    if (/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                                      handleChange(
                                        emp?.id,
                                        positionIndex,
                                        "duration",
                                        value
                                      );
                                    }
                                  }}
                                  onKeyDown={handleAvoidE}
                                />
                                {/* <input
                                    type="number"
                                    className="form-control"
                                    id="duration"
                                    name="duration"
                                    style={{ height: "3rem" }}
                                    min="00"
                                    max="99"
                                    disabled={position?.onGoing}
                                    placeholder="01"
                                    value={position?.duration}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (value.length <= 2) {
                                        handleChange(emp?.id, positionIndex, 'duration', value)
                                        // setResumeEmp((prevEmp) => {
                                        //   return prevEmp.map((item) =>
                                        //     item.id === emp.id
                                        //       ? { ...item, position: { ...item?.position, duration: value } }
                                        //       : item
                                        //   );
                                        // })
                                      }
                                    }}
                                  /> */}
                              </div>
                            </Col>
                            {/* Range dropdown */}
                            <Col xs={6} className="ps-1 ps-md-3">
                              <label
                                htmlFor="instituteEndDate"
                                className="form-label d-flex justify-content-between"
                              >
                                &nbsp;
                                <div
                                  className={
                                    "d-flex ms-1 align-items-center justify-content-end"
                                  }
                                >
                                  <input
                                    className="me-1"
                                    type="checkbox"
                                    id="instituteEndDate"
                                    name="instituteEndDate"
                                    checked={position?.onGoing}
                                    disabled={position?.import}
                                    onChange={(e) => {
                                      // setOnGoing((prev) => !prev);

                                      if (e.target.checked) {
                                        handleChange(
                                          emp?.id,
                                          positionIndex,
                                          "duration",
                                          0
                                        );
                                        handleChange(
                                          emp?.id,
                                          positionIndex,
                                          "range",
                                          "month"
                                        );
                                        handleChange(
                                          emp?.id,
                                          positionIndex,
                                          "onGoing",
                                          e?.target?.checked
                                        );
                                        // setResumeEmp((prevEmp) => {
                                        //   return prevEmp.map((item) =>
                                        //     item.id === emp.id
                                        //       ? { ...item, position: { ...item?.position, duration: 0, range: "month", onGoing: e?.target?.checked } }
                                        //       : item
                                        //   );
                                        // })
                                      } else {
                                        handleChange(
                                          emp?.id,
                                          positionIndex,
                                          "onGoing",
                                          e?.target?.checked
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor="instituteEndDate"
                                    className="cursor-pointer"
                                  >
                                    {contentLabel(
                                      "CurrentWork",
                                      "nf Current Work"
                                    )}
                                  </label>
                                </div>
                              </label>
                              <div className="mb-4 d-flex flex-column justify-content-between">
                                <select
                                  disabled={position?.onGoing}
                                  style={{
                                    height: "2.6rem",
                                    backgroundColor: "#ffffff",
                                  }}
                                  className="form-select"
                                  aria-label="Default select example"
                                  value={position?.range}
                                  onChange={
                                    (e) =>
                                      handleChange(
                                        emp?.id,
                                        positionIndex,
                                        "range",
                                        e.target.value
                                      )
                                    // setResumeEmp((prevEmp) => {
                                    //   return prevEmp.map((item) =>
                                    //     item.id === emp.id
                                    //       ? { ...item, position: { ...item?.position, range: e.target.value } }
                                    //       : item
                                    //   )

                                    // })
                                  }
                                >
                                  {rangeOptions?.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {contentLabel(
                                        option.label,
                                        `nf ${option.label}`
                                      )}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </Col>
                          </Col>

                          <Col lg={6}>
                            <div className="mb-4">
                              <label className="d-flex justify-content-between form-label text-label">
                                <div
                                  for="exampleFormControlInput1"
                                  className=""
                                >
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "Location"
                                    ) || {}
                                  ).mvalue || "not Location"}{" "}
                                </div>

                                <div className="d-flex align-items-center justify-content-center">
                                  <input
                                    id="onlineCheckbox"
                                    className="ml-2"
                                    type="checkbox"
                                    name="online"
                                    checked={onlineStatus[positionIndex] || false} // Use position-based state
                                    onChange={() => {
                                      setOnlineStatus((prev) => ({
                                        ...prev,
                                        [positionIndex]: !prev[positionIndex], // Toggle only for this position
                                      }));
                                    }}
                                  />
                                  <label
                                    htmlFor="onlineCheckbox"
                                    className=" ms-1"
                                  >
                                    {" "}
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) => item.elementLabel === "Online"
                                      ) || {}
                                    ).mvalue || "nf Online"}
                                  </label>
                                </div>
                              </label>
                              <MultiSelect
                                setLocationData={(newLocation) => {
                                  handleChange(
                                    emp?.id,
                                    positionIndex,
                                    "location",
                                    newLocation
                                  );
                                }}
                                viewLocation={position?.location}
                                onlineStatus={onlineStatus[positionIndex] || false} // Pass the correct state
                              />
                            </div>
                          </Col>

                          <Col xs={12}>
                            <BriefDescriptionTextArea
                              label={contentLabel("KPI", "nf KPI")}
                              htmlFor={"kpi"}
                              isRequired={false}
                              textareaClass={""}
                              id="kpi"
                              name={"kpi"}
                              value={position?.kpi}
                              onChange={(e) => {
                                handleChange(
                                  emp?.id,
                                  positionIndex,
                                  "kpi",
                                  e.target.value
                                );
                              }}
                              limit={500}
                            />
                          </Col>

                          <Col lg={12}>
                            <BriefDescriptionTextArea
                              label={contentLabel(
                                "BriefDescriptionAboutProject",
                                "nf Brief Description About Project"
                              )}
                              htmlFor={"ProjBriefDescription"}
                              isRequired={false}
                              textareaClass={""}
                              id={"ProjBriefDescription"}
                              name={"briefDescriptions"}
                              onChange={(e) =>
                                handleChange(
                                  emp?.id,
                                  positionIndex,
                                  "description",
                                  e.target.value
                                )
                              }
                              value={position?.description}
                            />
                          </Col>
                        </Row>
                      </div>
                    </div>
                  );
                })}
                {/* <div className="d-flex justify-content-end">
                <SuccessBtn
                  label={useContent("Import", "nf Import")}
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  disable={isLoading}
                />
              </div> */}
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEmp;
