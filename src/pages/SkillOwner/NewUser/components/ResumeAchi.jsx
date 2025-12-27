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
import organizationSearchSuggestions from "../../../../api/searchSuggestionAPIs/organizationSearchSuggestions";
import BriefDescriptionTextArea from "../../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import rangeOptions from "../../../../components/SkillOwner/HelperFunction/durationRangeVariables";
import InputLimit from "../../../../components/InputLimit";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { customStylesForReactSelect } from "../../../../components/SkillOwner/HelperFunction/customVariableForReactSelect";


const ResumeAchi = ({ conf, setResumeConf, index }) => {
  const contentLabel = useContentLabel();
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);

  const [accordionStates, setAccordionStates] = useState({});
  const [onGoing, setOnGoing] = useState(false)
  const [online, setOnline] = useState(false)

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
    if (conf?.onGoing) {
      setOnGoing(true)
    }
  }, [conf])

  useEffect(() => {
    const currentAccordion = accordionStates[conf.id];

    if (currentAccordion?.institutionFirstWord?.trim()?.length > 2) {
      const controller = new AbortController();
      const signal = controller.signal;

      updateAccordionState(conf.id, "isApiLoader", true);


      debouncedApiRequest(
        organizationSearchSuggestions,
        currentAccordion.institutionFirstWord,
        selectedLanguage,
        (data) => {
          const formattedData = data?.map((data) => ({
            value: data?.organization,
            label: data?.organization,
          }));
          updateAccordionState(conf.id, "educationSuggestionsData", formattedData || []);
          updateAccordionState(conf.id, "isApiLoader", false);
        },
        () => updateAccordionState(conf.id, "isApiLoader", false),
        signal
      );

      return () => {
        controller.abort();
        updateAccordionState(conf.id, "isApiLoader", false);
      };
    } else {
      updateAccordionState(conf.id, "educationSuggestionsData", []);
    }
  }, [accordionStates[conf.id]?.institutionFirstWord, conf.id, selectedLanguage, conf?.edit]);

  const handleEducationChange = (selectedOption) => {
    const isExisting = accordionStates[conf.id]?.educationApiData?.some(
      (inst) => inst.label === selectedOption?.label
    );

    updateAccordionState(
      conf.id,
      "organization",
      isExisting ? selectedOption.label : toTitleCase(selectedOption.label)
    );



    setResumeConf((prev) =>
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


  return (
    <div className="d-md-flex d-block gap-2 align-items-start">
      <input type="checkbox" className='' style={{ marginTop: '1.3rem' }} name="" id="" checked={conf?.active || conf?.import}
        disabled={conf?.import}
        onChange={(e) => {
          setResumeConf((prevSkillings) => {
            return prevSkillings.map((item) =>
              item.id === conf.id ? { ...item, active: e.target.checked } : item
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
              data-bs-target={`#panelsStayOpen-collapseEdu${conf?.id}`}
              aria-expanded="false"
              aria-controls={`panelsStayOpen-collapseEdu${conf?.id}`}
              onClick={() => {
                if (!accordionStates[conf.id]?.isOpen) {
                  updateAccordionState(conf.id, "isOpen", true);
                  updateAccordionState(conf.id, "institutionFirstWord", conf?.organization || "");
                  updateAccordionState(conf.id, "organization", conf?.organization || "");
                }
              }}
            >
              {contentLabel('Achievement', 'nf Achievement')}-{index + 1}
            </button>
          </h2>
          <div
            id={`panelsStayOpen-collapseEdu${conf?.id}`}
            class={`accordion-collapse collapse `}
          >
            <div class="accordion-body" style={{
              position: "relative",
              opacity: conf?.import ? '.5' : '1',
              pointerEvents: conf?.import ? 'none' : ''
            }}>

              <Row
                className=""
                style={{ pointerEvents: conf.edit ? "" : "none" }}
              >

                {
                  conf?.import &&
                  <div className="d-flex justify-content-end fw-bold text-primary-color" style={{ top: '1.3rem', right: '2rem' }}>{contentLabel('Imported', 'nf Imported')}</div>
                }
                   <Col md={6} xs={12}   className="mb-2">
                  <label htmlFor="" className="form-label"> {contentLabel('AchievementName', 'nf Achievement Name')}<span className="text-danger ms-1">*</span></label>
                  <input
                    type="Text"
                    class="form-control"
                    id="cert-name"
                    placeholder="Enter your Achievement name"
                    value={conf?.achivementName}
                    onChange={(e) => {
                      setResumeConf((prevSkillings) => {
                        return prevSkillings.map((item) =>
                          item.id === conf.id
                            ? { ...item, achivementName: e.target.value }
                            : item
                        );
                      });
                    }}
                  />
                    <InputLimit value={conf?.achivementName}/>
                </Col>


                <Col  md={6} xs={12} className="mb-4">
                  <label
                    htmlFor="org-name"
                    className=" text-start form-label"
                  >
                    {contentLabel('Organization', 'nf Organization')}
                    <span className="text-danger ms-1">*</span>
                  </label>


                  <div className="w-100">
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
                        updateAccordionState(conf.id, "institutionFirstWord", conf?.organization)
                      }}
                      onInputChange={(value) => {

                        updateAccordionState(conf.id, "institutionFirstWord", value);
                      }}
                      onChange={handleEducationChange}
                      // options={accordionStates[conf.id]?.educationSuggestionsData || []}
                      options={(() => {
                        const options = accordionStates[conf.id]?.educationSuggestionsData || [];
                        const trimmedInputValue = accordionStates[conf.id]?.institutionFirstWord?.trim().toLowerCase() || "";

                        // Sort options: exact matches first
                        return [...options].sort((a, b) => {
                          const aMatch = a.label.trim().toLowerCase() === trimmedInputValue;
                          const bMatch = b.label.trim().toLowerCase() === trimmedInputValue;
                          if (aMatch && !bMatch) return -1;
                          if (!aMatch && bMatch) return 1;
                          return 0;
                        });
                      })()}
                      isLoading={accordionStates[conf.id]?.isApiLoader}
                       menuIsOpen={accordionStates[conf.id]?.isApiLoader ? false : undefined}
                      inputValue={accordionStates[conf.id]?.institutionFirstWord || ''}
                      value={
                        accordionStates[conf.id]?.organization
                          ? {
                            label: accordionStates[conf.id]?.organization,
                            value: accordionStates[conf.id]?.organization,
                          }
                          : null
                      }
                      // menuIsOpen={true}
                      isValidNewOption={(inputValue) => {
                        const options = accordionStates[conf.id]?.educationSuggestionsData || [];
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

                </Col>

                <Col xl={12} lg={12} className="d-flex justify-content-between">
                  {/* START YEAR */}
                  <Col xs={6} className="pe-1 pe-md-3">
                    <div className="mb-3 d-flex flex-column justify-content-between">
                      <label className="text-label form-label d-flex align-items-center white-space-no-wrap">
                        {contentLabel("AwardsIssuedDate", "nf Awards Issued Date")}{" "}
                        <span className="text-danger ms-1">*</span>
                      </label>

                      <div className=" ">
                        <DatePicker
                          className={`form-control h-75 px-2 `

                          }
                          selected={conf?.startYear ? new Date(parseInt(new Date(conf?.startYear, 0, 1).getTime())) : null}
                          onChange={(date) => {

                            if (!date) {
                              return;
                            }
                            // console.log(date)

                            setResumeConf((prevSkillings) => {
                              return prevSkillings.map((item) =>
                                item.id === conf.id
                                  ? { ...item, startYear: new Date(date).getFullYear() , startMonth: 1 }
                                  : item
                              );
                            })
                          }
                          }
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
                          setResumeConf((prevSkillings) => {
                            return prevSkillings.map((item) =>
                              item.id === conf.id
                                ? { ...item, startMonth: data }
                                : item
                            );
                          })
                        }}
                        selectedMonthNumber={conf.startMonth}
                        selectedYear={new Date(conf?.startYear, 0, 1)}
                      />
                    </div>
                  </Col>
                </Col>

                {/* <Col lg={12} className="d-flex justify-content-between">
            
                    <Col lg={6} >
                      <div className="mb-4 d-flex flex-column justify-content-between">
                        <label className="text-label form-label d-flex justify-content-between align-items-center white-space-no-wrap">
                          <div>
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Duration"
                              ) || {}
                            ).mvalue || "nf Duration"}
                      
                          </div>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="duration"
                          name="duration"
                          style={{ height: "3rem" }}
                          min="00"
                          max="99"
                          disabled={onGoing}
                          placeholder="01"
                          value={conf?.duration}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 2) {
                              setResumeConf((prevSkillings) => {
                                return prevSkillings.map((item) =>
                                  item.id === conf.id
                                    ? { ...item, duration: value }
                                    : item
                                );
                              })
                            }
                          }}
                        />
                      </div>
                    </Col>
                 
                    <Col lg={6} className="ms-2">
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
                          disabled={conf?.import}
                            className="me-1"
                            type="checkbox"
                            id="instituteEndDate"
                            name="instituteEndDate"
                            checked={onGoing}
                            onChange={(e) => {
                              setOnGoing((prev) => !prev);

                              if (e.target.checked) {
                                setResumeConf((prevSkillings) => {
                                  return prevSkillings.map((item) =>
                                    item.id === conf.id
                                      ? {
                                        ...item, duration: 0,
                                        range: "month",
                                      }
                                      : item
                                  );
                                })

                              }
                            }}
                          />
                          <label
                            htmlFor="instituteEndDate"
                            className="cursor-pointer"
                          >
                            {contentLabel(
                              "CurrentConference",
                              "nf Current Conference"
                            )}
                          </label>
                        </div>
                      </label>
                      <div className="mb-4 d-flex flex-column justify-content-between">
                        <select
                          disabled={onGoing}
                          style={{
                            height: "3rem",
                            backgroundColor: "#ffffff",
                          }}
                          className="form-select"
                          aria-label="Default select example"
                          value={conf?.range}
                          onChange={(e) =>

                            setResumeConf((prevSkillings) => {
                              return prevSkillings.map((item) =>
                                item.id === conf.id
                                  ? { ...item, range: e.target.value, }
                                  : item
                              )

                            })
                          }
                        >
                          <option value="month">
                            {contentLabel("Month(s)", "nf Month(s)")}
                          </option>
                          <option value="year">
                            {contentLabel("Year(s)", "nf Year(s)")}
                          </option>
                        </select>
                      </div>
                    </Col>
                  </Col> */}

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
                          checked={conf?.location?.includes("Online")}
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
                        setResumeConf((prevConf) => {
                          return prevConf.map((item) =>
                            item.id === conf.id ? { ...item, location: newLocation } : item
                          );
                        });
                      }}
                      viewLocation={conf?.location}
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
                    value={conf?.kpi}
                    onChange={(e) => {
                      setResumeConf((prevConf) => {
                        return prevConf.map((item) =>
                          item.id === conf.id
                            ? { ...item, kpi: e.target.value }
                            : item
                        );
                      });
                    }}

                    limit={500}
                  />
                </Col>

                <Col xs={12}>
                  <BriefDescriptionTextArea
                    label={contentLabel(
                      "AwardBriefDesc",
                      "nf Brief description of the award"
                    )}
                    htmlFor={"AwardsBriefDescription"}
                    textareaClass={""}
                    id={"AwardsBriefDescription"}
                    name={"briefDescriptions"}
                    value={conf?.description}
                    onChange={(e) => {
                      setResumeConf((prevSkillings) => {
                        return prevSkillings.map((item) =>
                          item.id === conf.id
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

export default ResumeAchi;
