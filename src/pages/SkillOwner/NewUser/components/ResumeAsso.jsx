import React from "react";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { useSelector } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateInputType } from "../../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import { MdDelete, MdDoneOutline, MdEdit } from "react-icons/md";
import { getCookie } from '../../../../config/cookieService';


const ResumeAsso = ({ data, setResumeAsso, index }) => {
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const regionalData = useSelector((state) => state.regionalData);
  return (
    <>
      <div class="accordion w-100 resumeAccordion" id="accordionPanelsStayOpenExample">
        <div class="accordion-item  ">
          <h2 class="accordion-header ">
            <button
              class={`accordion-button collapsed`}
              style={{ color: "black" }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#panelsStayOpen-collapseAsso${data?.id}`}
              aria-expanded="false"
              aria-controls={`panelsStayOpen-collapseAsso${data?.id}`}
            >
              {data?.name}
            </button>
          </h2>
          <div
            id={`panelsStayOpen-collapseAsso${data?.id}`}
            class={`accordion-collapse collapse `}
          >
            <div class="accordion-body" style={{ position: "relative" }}>
              <div
                className="d-flex align-items-center justify-content-end gap-2 px-2 "
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  zIndex: "9999",
                }}
              >
                {data.edit ? (
                  <MdDoneOutline
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setResumeAsso((prev) => {
                        return prev.map((item) =>
                          item.id === data.id ? { ...item, edit: false } : item
                        );
                      });
                    }}
                  />
                ) : (
                  <MdEdit
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setResumeAsso((prev) => {
                        return prev.map((item) =>
                          item.id === data.id ? { ...item, edit: true } : item
                        );
                      });
                    }}
                  />
                )}

                <MdDelete
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setResumeAsso((prev) => {
                      return prev.filter((item) => item.id !== data.id);
                    });
                  }}
                />
              </div>

              <div
                className="d-flex justify-content-center align-items-center flex-column gap-3 w-100 row"
                style={{ pointerEvents: data.edit ? "" : "none" }}
              >
                <div class=" d-md-flex d-block  gap-4 justify-content-center align-items-center col-md-6 col-12">
                  <label
                    htmlFor="first-name"
                    className="w-25 text-start text-md-end"
                  >
                    Name
                  </label>
                  <input
                    type="Text"
                    class="form-control"
                    id="first-name"
                    placeholder="Enter your first name"
                    value={data?.name}
                    onChange={(e) => {
                      setResumeAsso((prev) => {
                        return prev.map((item) =>
                          item.id === data.id
                            ? { ...item, name: e.target.value }
                            : item
                        );
                      });
                    }}
                  />
                </div>
                <div class=" d-md-flex d-block  gap-4 justify-content-center align-items-center col-md-6 col-12">
                  <label
                    htmlFor="first-name"
                    className="w-25 text-start text-md-end"
                  >
                    Role
                  </label>
                  <input
                    type="Text"
                    class="form-control"
                    id="first-name"
                    placeholder="Enter your first name"
                    value={data?.role}
                    onChange={(e) => {
                      setResumeAsso((prev) => {
                        return prev.map((item) =>
                          item.id === data.id
                            ? { ...item, role: e.target.value }
                            : item
                        );
                      });
                    }}
                  />
                </div>

                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="w-25 text-start text-md-end"
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "StartDate"
                      ) || {}
                    ).mvalue || "StartDate"}
                    <span className="text-danger"></span>
                  </label>
                  <DatePicker
                    style={{ height: "32px" }}
                    maxDate={timestampToYYYYMMDD(Date.now())}
                    className={`form-control  h-75 `}
                    id="exampleFormControlInput1"
                    onChange={(e) => {
                      setResumeAsso((prev) => {
                        return prev.map((item) =>
                          item.id === data.id ? { ...item, startDate: e } : item
                        );
                      });
                    }}
                    toggleCalendarOnIconClick
                    selected={data?.startDate}
                    dateFormat={formatDateInputType(
                      regionalData.selectedCountry.dateFormat
                    )}
                    showYearDropdown
                    scrollableYearDropdown
                    // showMonthDropdown
                    // scrollableMonthDropdown
                    yearDropdownItemNumber={100}
                    placeholderText={getCookie("dateFormat")}
                    onBlur={() => {}}
                  />
                </div>

                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                  <label
                    htmlFor="exampleFormControlInput1"
                    className="w-25 text-start text-md-end"
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "EndDate"
                      ) || {}
                    ).mvalue || "EndDate"}
                    <span className="text-danger"></span>
                  </label>
                  <DatePicker
                    style={{ height: "32px" }}
                    maxDate={timestampToYYYYMMDD(Date.now())}
                    className={`form-control  h-75 `}
                    id="exampleFormControlInput1"
                    onChange={(e) => {
                      setResumeAsso((prev) => {
                        return prev.map((item) =>
                          item.id === data.id ? { ...item, endDate: e } : item
                        );
                      });
                    }}
                    toggleCalendarOnIconClick
                    selected={data?.endDate}
                    dateFormat={formatDateInputType(
                      regionalData.selectedCountry.dateFormat
                    )}
                    showYearDropdown
                    scrollableYearDropdown
                    // showMonthDropdown
                    // scrollableMonthDropdown
                    yearDropdownItemNumber={100}
                    placeholderText={getCookie("dateFormat")}
                    onBlur={() => {}}
                  />
                </div>

                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                  <label
                    htmlFor="about"
                    className="w-25 text-start text-md-end"
                  >
                    Description
                  </label>
                  <textarea
                    rows={4}
                    cols={6}
                    class="form-control "
                    id="about"
                    placeholder="Brief Description..."
                    value={data?.description}
                    onChange={(e) => {
                      setResumeAsso((prev) => {
                        return prev.map((item) =>
                          item.id === data.id
                            ? { ...item, description: e.target.value }
                            : item
                        );
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeAsso;
