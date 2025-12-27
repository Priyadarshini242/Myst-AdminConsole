import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";
import PostApi from "../../../../api/PostData/PostApi";

import { debouncedApiRequest } from "../../../../components/DebounceHelperFunction/debouncedApiRequest";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { toTitleCase } from "../../../../components/SkillOwner/HelperFunction/toTitleCase";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { Col, Row } from "react-bootstrap";
import { ResumeDateConverter } from "../../../../components/SkillOwner/HelperFunction/ResumeDateConverter";
import useContentLabel from "../../../../hooks/useContentLabel";
import { icons } from "../../../../constants";
import DatePicker from "react-datepicker";
import MonthDropdown from "../../../../views/simple ui/Simple Ui Forms/MonthDropdown";
import educationInstitutionApi from "../../../../api/searchSuggestionAPIs/educationInstitutionApi";
import MultiSelect from "../../../../components/SkillOwner/SelectComponent/MultiSelect";
import BriefDescriptionTextArea from "../../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import rangeOptions from "../../../../components/SkillOwner/HelperFunction/durationRangeVariables";
import InputLimit from "../../../../components/InputLimit";
import FloatInput from "../../../../components/atoms/Input/FloatInput";
import handleAvoidE from "../../../../components/SkillOwner/HelperFunction/handleAvoidE";
import DurationFieldTooltip from "../../../../components/atoms/tooltip/DurationFieldTooltip";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { customStylesForReactSelect } from "../../../../components/SkillOwner/HelperFunction/customVariableForReactSelect";

const ResumeCert = ({ edu, setResumeCert, index, updateResumeDetails }) => {
  const contentLabel = useContentLabel();
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);

  const [accordionStates, setAccordionStates] = useState({});
  const [onGoing, setOnGoing] = useState(false);
  const [online, setOnline] = useState(false);

  const updateAccordionState = (id, key, value) => {
    setAccordionStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [key]: value,
      },
    }));
  };

  useEffect(() => {
    if (edu?.onGoing) {
      setOnGoing(true);
    }
  }, [edu]);

  useEffect(() => {
    const currentAccordion = accordionStates[edu.id];

    if (currentAccordion?.institutionFirstWord?.trim()?.length > 2) {
      const controller = new AbortController();
      const signal = controller.signal;

      updateAccordionState(edu.id, "isApiLoader", true);

      debouncedApiRequest(
        educationInstitutionApi,
        currentAccordion.institutionFirstWord,
        selectedLanguage,
        (data) => {
          const formattedData = data?.map((data) => ({
            value: data?.institutionName,
            label: data?.institutionName,
          }));
          updateAccordionState(
            edu.id,
            "educationSuggestionsData",
            formattedData || []
          );
          updateAccordionState(edu.id, "isApiLoader", false);
        },
        () => updateAccordionState(edu.id, "isApiLoader", false),
        signal
      );

      return () => {
        controller.abort();
        updateAccordionState(edu.id, "isApiLoader", false);
      };
    } else {
      updateAccordionState(edu.id, "educationSuggestionsData", []);
    }
  }, [
    accordionStates[edu.id]?.institutionFirstWord,
    edu.id,
    selectedLanguage,
    edu?.edit,
  ]);

  const handleEducationChange = (selectedOption) => {
    const isExisting = accordionStates[edu.id]?.educationApiData?.some(
      (inst) => inst.label === selectedOption?.label
    );

    updateAccordionState(
      edu.id,
      "institution",
      isExisting ? selectedOption.label : toTitleCase(selectedOption.label)
    );

    setResumeCert((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              institution: isExisting
                ? selectedOption.label
                : toTitleCase(selectedOption.label),
            }
          : item
      )
    );

    // Blur the currently active element (the select input)
    document.activeElement.blur();
  };

  return (
    <div className="d-md-flex d-block gap-2 align-items-start">
      <input
        type="checkbox"
        className=""
        style={{ marginTop: "1.3rem" }}
        name=""
        id=""
        checked={edu?.active || edu?.import}
        disabled={edu?.import}
        onChange={(e) => {
          setResumeCert((prevEdu) => {
            return prevEdu.map((item) =>
              item.id === edu.id ? { ...item, active: e.target.checked } : item
            );
          });
        }}
      />
      <div class="accordion w-100 resumeAccordion" id="accordionPanelsStayOpenExample">
        <div class="accordion-item  ">
          <h2 class="accordion-header ">
            <button
              class={`accordion-button collapsed`}
              style={{ color: "black" }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#panelsStayOpen-collapseEdu${edu?.id}`}
              aria-expanded="false"
              aria-controls={`panelsStayOpen-collapseEdu${edu?.id}`}
              onClick={() => {
                if (!accordionStates[edu.id]?.isOpen) {
                  updateAccordionState(edu.id, "isOpen", true);
                  updateAccordionState(
                    edu.id,
                    "institutionFirstWord",
                    edu?.institution || ""
                  );
                  updateAccordionState(
                    edu.id,
                    "institution",
                    edu?.institution || ""
                  );
                }
              }}
            >
              {contentLabel("Certification", "nf Certification")}-{index + 1}
            </button>
          </h2>
          <div
            id={`panelsStayOpen-collapseEdu${edu?.id}`}
            class={`accordion-collapse collapse `}
          >
            <div
              class="accordion-body"
              style={{
                position: "relative",
                opacity: edu?.import ? ".5" : "1",
                pointerEvents: edu?.import ? "none" : "",
              }}
            >
              <Row
                className=""
                style={{ pointerEvents: edu.edit ? "" : "none" }}
              >
                {edu?.import && (
                  <div
                    className="d-flex justify-content-end fw-bold text-primary-color"
                    style={{ top: "1.3rem", right: "2rem" }}
                  >
                    {contentLabel("Imported", "nf Imported")}
                  </div>
                )}

                <Col md={6} xs={12}   className="mb-2">
                  <label htmlFor="" className="form-label">
                    {" "}
                    {contentLabel(
                      "CertificationName",
                      "nf Certification Name"
                    )}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="Text"
                    class="form-control"
                    id="cert-name"
                    placeholder="Enter your certification name"
                    value={edu?.certificationName}
                    onChange={(e) => {
                      setResumeCert((prevEdu) => {
                        return prevEdu.map((item) =>
                          item.id === edu.id
                            ? { ...item, certificationName: e.target.value }
                            : item
                        );
                      });
                    }}
                  />
                  <InputLimit value={edu?.certificationName} />
                </Col>

                <Col md={6} xs={12}   className=" mb-4">
                  <label htmlFor="org-name" className=" text-start form-label">
                    {contentLabel("Institution", "nf Institution")}
                    {/* <span className="text-danger">*</span> */}
                  </label>

                  <CreatableSelect
                    styles={customStylesForReactSelect}
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
                    components={{
                      DropdownIndicator: null,
                      IndicatorSeparator: null,
                    }}
                    onFocus={() => {
                      updateAccordionState(
                        edu.id,
                        "institutionFirstWord",
                        edu?.institution
                      );
                    }}
                    onInputChange={(value, event) => {
                      if (event.action === "menu-close" && false) {
                        if (!value) {
                          updateAccordionState(
                            edu.id,
                            "institutionFirstWord",
                            accordionStates[edu.id]?.institutionFirstWord
                          );
                        }
                      } else
                        updateAccordionState(
                          edu.id,
                          "institutionFirstWord",
                          value
                        );
                    }}
                    onChange={handleEducationChange}
                    // options={accordionStates[edu.id]?.educationSuggestionsData || []}
                    options={(() => {
                      const options =
                        accordionStates[edu.id]?.educationSuggestionsData || [];
                      const trimmedInputValue =
                        accordionStates[edu.id]?.institutionFirstWord
                          ?.trim()
                          .toLowerCase() || "";

                      // Sort options: exact matches first
                      return [...options].sort((a, b) => {
                        const aMatch =
                          a.label.trim().toLowerCase() === trimmedInputValue;
                        const bMatch =
                          b.label.trim().toLowerCase() === trimmedInputValue;
                        if (aMatch && !bMatch) return -1;
                        if (!aMatch && bMatch) return 1;
                        return 0;
                      });
                    })()}
                    isLoading={accordionStates[edu.id]?.isApiLoader}
                      menuIsOpen={accordionStates[edu.id]?.isApiLoader ? false : undefined}
                    inputValue={
                      accordionStates[edu.id]?.institutionFirstWord || ""
                    }
                    value={
                      accordionStates[edu.id]?.institution
                        ? {
                            label: accordionStates[edu.id]?.institution,
                            value: accordionStates[edu.id]?.institution,
                          }
                        : null
                    }
                    // menuIsOpen={true}
                    isValidNewOption={(inputValue) => {
                      const options =
                        accordionStates[edu.id]?.educationSuggestionsData || [];
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
                </Col>

                <Col xl={12} lg={12} className="d-flex justify-content-between">
                  {/* START YEAR */}
                  <Col xs={6} className="pe-1 pe-md-3">
                    <div className="mb-3 d-flex flex-column justify-content-between">
                      <label className="text-label form-label d-flex align-items-center white-space-no-wrap">
                        {(
                          content[selectedLanguage]?.find(
                            (item) =>
                              item.elementLabel === "CertificationStartedOn"
                          ) || {}
                        ).mvalue ||
                          "nf When did you start your Certification"}{" "}
                        <span className="text-danger ms-1">*</span>
                      </label>

                      <div className=" ">
                        <DatePicker
                          className={`form-control h-75 px-2 `}
                          selected={
                            edu?.startYear
                              ? new Date(
                                  parseInt(
                                    new Date(edu?.startYear, 0, 1).getTime()
                                  )
                                )
                              : null
                          }
                          onChange={(date) => {
                            if (!date) {
                              return;
                            }
                            // console.log(date)

                            setResumeCert((prevEdu) => {
                              return prevEdu.map((item) =>
                                item.id === edu.id
                                  ? {
                                      ...item,
                                      startYear: new Date(date).getFullYear(),
                                      startMonth: 1,
                                    }
                                  : item
                              );
                            });
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
                    <div className="mb-4 d-flex flex-column justify-content-between">
                      <label className="text-label form-label d-flex align-items-center">
                        &nbsp;
                      </label>

                      <MonthDropdown
                        isParser={true}
                        onSelectMonthInNumber={(data) => {
                          setResumeCert((prevEdu) => {
                            return prevEdu.map((item) =>
                              item.id === edu.id
                                ? { ...item, startMonth: data }
                                : item
                            );
                          });
                        }}
                        selectedMonthNumber={edu.startMonth}
                        selectedYear={new Date(edu?.startYear, 0, 1)}
                      />
                    </div>
                  </Col>
                </Col>

                <Col lg={12} className="d-flex justify-content-between">
                  {/* Duration in number */}
                  <Col xs={6} className="pe-1 pe-md-3">
                    <div className="mb-4 d-flex flex-column justify-content-between">
                      <label className="text-label form-label d-flex justify-content-between align-items-center white-space-no-wrap">
                        <div>
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Duration"
                            ) || {}
                          ).mvalue || "nf Duration"}
                          <span className="text-danger ms-1">*</span>
                          <DurationFieldTooltip />
                        </div>
                      </label>
                      <FloatInput
                        id="ResumeEduDurationNormal"
                        name="ResumeEduDurationNormal"
                        style={{ height: "2.6rem" }}
                        decimalStep="0.01" // Allows up to 2 decimal places
                        disabled={onGoing}
                        placeholder={"0.00"}
                        value={edu?.duration}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow numbers with up to 2 decimal places (e.g., 1.50, 2.75)
                          if (/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                            setResumeCert((prevEdu) => {
                              return prevEdu.map((item) =>
                                item.id === edu.id
                                  ? { ...item, duration: value }
                                  : item
                              );
                            });
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
                        disabled={onGoing}
                        placeholder="01"
                        value={edu?.duration}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.length <= 2) {
                            setResumeCert((prevEdu) => {
                              return prevEdu.map((item) =>
                                item.id === edu.id
                                  ? { ...item, duration: value }
                                  : item
                              );
                            })
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
                          onGoing.instituteEndDate
                            ? "d-flex ms-1 align-items-center justify-content-end"
                            : "d-flex ms-1 align-items-center justify-content-end"
                        }
                      >
                        <input
                          disabled={edu?.import}
                          className="me-1"
                          type="checkbox"
                          id="instituteEndDate"
                          name="instituteEndDate"
                          checked={onGoing}
                          onChange={(e) => {
                            setOnGoing((prev) => !prev);

                            if (e.target.checked) {
                              setResumeCert((prevEdu) => {
                                return prevEdu.map((item) =>
                                  item.id === edu.id
                                    ? {
                                        ...item,
                                        duration: 0,
                                        range: "month",
                                        onGoing: true,
                                      }
                                    : item
                                );
                              });
                            } else {
                              setResumeCert((prevEdu) => {
                                return prevEdu.map((item) =>
                                  item.id === edu.id
                                    ? {
                                        ...item,
                                        duration: 0,
                                        range: "month",
                                        onGoing: false,
                                      }
                                    : item
                                );
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor="instituteEndDate"
                          className="cursor-pointer"
                        >
                          {contentLabel(
                            "Current",
                            "nf Current"
                          )}
                        </label>
                      </div>
                    </label>
                    <div className="mb-4 d-flex flex-column justify-content-between">
                      <select
                        disabled={onGoing}
                        style={{
                          height: "2.6rem",
                          backgroundColor: "#ffffff",
                        }}
                        className="form-select"
                        aria-label="Default select example"
                        value={edu?.range}
                        onChange={(e) =>
                          setResumeCert((prevEdu) => {
                            return prevEdu.map((item) =>
                              item.id === edu.id
                                ? { ...item, range: e.target.value }
                                : item
                            );
                          })
                        }
                      >
                        {rangeOptions?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {contentLabel(option.label, `nf ${option.label}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </Col>
                </Col>

                <Col lg={6}>
                  <div className="mb-4">
                    <label className="d-flex justify-content-between form-label text-label">
                      <div for="exampleFormControlInput1" className="">
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
                          checked={edu?.location?.includes("Online")}
                          onChange={(e) => {
                            setOnline(!online);
                          }}
                        />
                        <label htmlFor="onlineCheckbox" className=" ms-1">
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
                        setResumeCert((prevCert) => {
                          return prevCert.map((item) =>
                            item.id === edu.id
                              ? { ...item, location: newLocation }
                              : item
                          );
                        });
                      }}
                      viewLocation={edu?.location}
                      onlineStatus={online}
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
                    value={edu?.kpi}
                    onChange={(e) => {
                      setResumeCert((prevCert) => {
                        return prevCert.map((item) =>
                          item.id === edu.id
                            ? { ...item, kpi: e.target.value }
                            : item
                        );
                      });
                    }}
                    limit={500}
                  />
                </Col>

                <Col class=" col-12 mb-3">
                  <BriefDescriptionTextArea
                    label={contentLabel(
                      "BriefDescriptionCertification",
                      "nf Brief Description About The Certification"
                    )}
                    htmlFor={"BriefDescription"}
                    textareaClass={""}
                    id={"CertBriefDescription"}
                    name={"briefDescription"}
                    value={edu?.description}
                    onChange={(e) => {
                      setResumeCert((prevEdu) => {
                        return prevEdu.map((item) =>
                          item.id === edu.id
                            ? { ...item, description: e.target.value }
                            : item
                        );
                      });
                    }}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeCert;
