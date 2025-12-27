import React, { useEffect, useState } from "react";
import SecondaryToggleBtn from "../../../components/Buttons/SecondaryToggleBtn";
import { LiaFileExportSolid } from "react-icons/lia";
import UserCardA from "../../../components/SkillAvailer/UserCardA";
import user from "../../../Images/user.jpeg";
import placeholderImage from "../../../Images/avatar-placeholder.webp";
import ListView from "../../../components/SkillAvailer/ListView";
import { myCourses } from "../SkillingAgencyConstants";
import { useParams } from "react-router-dom";
import Loader from "../../../components/Loader";
import { FiMinus } from "react-icons/fi";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import UserCardS from "../../../components/SkillingAgency/UserCardS";
import { useSelector } from "react-redux";

const CourseCandidate = () => {
  const { id } = useParams();
  const [view, setView] = useState("card");
  const [exportOptions, setExportOptions] = useState(false);
  const { data, status, error } = useSelector((state) => state.userCourses);

  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    let course = data.find((course) => id == course.id);
    setSelectedCourse(course);
    console.log(course);
  }, [id]);

  if (!selectedCourse) {
    return <Loader />;
  }

  return (
    <div
      className="col-lg-12 col-sm-12   rounded bg-white     font-5 overflow-y-auto p-2 "
      style={{ height: "auto" }}
    >
      <div>
        <div className=" px-1 d-md-flex flex-column mb-2">
          <div className="d-md-flex align-items-center justify-content-between   ">
            {/* <div className='d-md-flex align-items-center'>
                        Showing 2 results
                        {showListFilter.length > 0 &&
                            <>
                                <div>&nbsp;based on </div>
                                <div className='mx-2 d-md-flex ' >
                                    {showListFilter.map((skill, index) =>
                                        <span className='mx-1 badge ms-1 border-1 ' style={{ borderStyle: "solid", borderWidth: "1px", borderColor: "var(--primary-color)", backgroundColor: "#F7FFDD", color: "var(--primary-color)", padding: "3px 6px", borderRadius: "7px", alignContent: "center", alignItems: "center", fontSize: "11px", }} id={index}>{skill.skill}</span>)
                                    }
                                </div>
                            </>
                        }
                    </div> */}
            <div className="  d-flex  justify-content-between mb-1">
              {/* <div className=' ml-2' style={{ fontWeight: 'bold' }}><span className='' style={{ color: 'var(--primary-color)', fontWeight: 'bold' }} >Name :</span>{selectedCourse.courseName} </div> */}
              <div
                style={{ height: "25px" }}
                className="ml-2 pill-bg-color text-white rounded-pill px-2 pt-1 font-5   border-0  "
              >
                {selectedCourse.courseName}{" "}
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <div className="">
                <SecondaryToggleBtn
                  label={view === "card" ? "Card View" : "Card"}
                  onClick={() => setView("card")}
                  isActive={view === "card"}
                />
                <SecondaryToggleBtn
                  label={view === "list" ? "List View" : "List"}
                  onClick={() => setView("list")}
                  isActive={view === "list"}
                />
                <SecondaryToggleBtn
                  label={view === "map" ? "Map View" : "Map"}
                  onClick={() => setView("map")}
                  isActive={view === "map"}
                />
              </div>
              <div class="btn-group dropend">
                <button
                  className="border-0 p-0 m-0    bg-white"
                  onClick={() => setExportOptions(!exportOptions)}
                  data-tooltip-id="my-tooltip"
                  data-tooltip-content="Export"
                >
                  <LiaFileExportSolid style={{ fontSize: "26px" }} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="">
              there are 2 potential candidates for this course
            </div>
          </div>
          {exportOptions && (
            <div className="d-flex flex-row  justify-content-end   mx-3 mt-2">
              <div>
                <ul
                  class=" show p-0 m-0 "
                  style={{ minWidth: "116px", left: "33px" }}
                >
                  <div className="btn-group">
                    <button
                      className="btn text-start font-6  ms-1   "
                      type="button"
                      style={{
                        backgroundColor: "#EFF5DC",
                        borderStyle: "solid",
                        borderColor: "var(--primary-color)",
                        color: "var(--primary-color)",
                      }}
                    >
                      Excel
                    </button>
                    <button
                      className="btn text-start font-6    "
                      type="button"
                      style={{
                        backgroundColor: "white",
                        borderStyle: "solid",
                        color: "var(--primary-color)",
                        borderColor: "var(--primary-color)",
                      }}
                    >
                      CSV
                    </button>
                    <button
                      className="btn text-start font-6    "
                      type="button"
                      style={{
                        backgroundColor: "white",
                        borderStyle: "solid",
                        color: "var(--primary-color)",
                        borderColor: "var(--primary-color)",
                      }}
                    >
                      PDF
                    </button>
                  </div>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div class="accordion" id="accordionPanelsStayOpenExample">
          <div class="accordion-item ">
            <h2 class="accordion-header d-flex gap-2 ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseOne"
                aria-expanded="true"
                aria-controls="panelsStayOpen-collapseOne"
              >
                Course Description
              </button>
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseThree"
                aria-expanded="false"
                aria-controls="panelsStayOpen-collapseThree"
              >
                Prerequisite Skills
              </button>
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseTwo"
                aria-expanded="false"
                aria-controls="panelsStayOpen-collapseTwo"
              >
                Skills Atttainable
              </button>
            </h2>

            <div
              id="panelsStayOpen-collapseOne"
              class="accordion-collapse collapse"
              data-bs-parent="#accordionExample"
            >
              <div class="accordion-body">
                <div className="mb-2">
                  <span
                    className="mr-2"
                    style={{
                      color: "var(--primary-color)",
                      fontWeight: "bold",
                    }}
                  >
                    Description :{" "}
                  </span>
                  {selectedCourse.courseDescription} Lorem ipsum dolor sit amet
                  consectetur adipisicing elit. Sunt atque sapiente illo sequi
                  doloremque numquam.
                </div>
                {/* <div className='mb-2'><span className='mr-2' style={{ color: 'var(--primary-color)', fontWeight: 'bold' }} >Objective :</span> Lorem ipsum dolor sit amet consectetur adipisicing elit. Sunt atque sapiente illo sequi doloremque numquam.</div> */}
              </div>
            </div>

            <div
              id="panelsStayOpen-collapseTwo"
              class="accordion-collapse collapse"
              data-bs-parent="#accordionExample"
            >
              <div class="accordion-body">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th className="p-1" scope="col">
                        #
                      </th>
                      <th className="p-1" scope="col">
                        Topic Name
                      </th>
                      <th className="p-1" scope="col">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {
                                            selectedCourse.courseDetails.topics.map((topic, i) => {
                                                return (
                                                    <tr>
                                                        <th className='p-1' scope="row">{i + 1}</th>
                                                        <td className='p-1'>{topic.name}</td>
                                                        <td className='p-1'>{topic.duration}{topic.phase}</td>

                                                    </tr>
                                                )
                                            })
                                        } */}
                  </tbody>
                </table>
              </div>
            </div>
            <div
              id="panelsStayOpen-collapseThree"
              class="accordion-collapse collapse"
              data-bs-parent="#accordionExample"
            >
              <div class="accordion-body">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th className="p-1" scope="col">
                        #
                      </th>
                      <th className="p-1" scope="col">
                        prerequisite Skills
                      </th>
                      <th className="p-1" scope="col">
                        Mandatory
                      </th>
                      <th className="p-1" scope="col">
                        Exclude (not)
                      </th>
                    </tr>
                  </thead>
                  <tbody className=" divide-y ml-5  ">
                    {JSON.parse(
                      selectedCourse.prerequisiteSkills.replace(/'/g, '"')
                    ).map((skill, index) => {
                      if (skill.exclude) {
                        return (
                          <tr
                            className=""
                            style={{ opacity: ".3" }}
                            key={index}
                          >
                            <th className="p-1" scope="col">
                              {index + 1}
                            </th>
                            <td className="p-1" scope="col">
                              {skill.name}
                            </td>
                            <td className="p-1" scope="col">
                              <FiMinus />
                            </td>
                            <td className="p-1" scope="col">
                              <input
                                type="checkbox"
                                style={{ accentColor: "var(--primary-color)" }}
                                checked={true}
                              />
                            </td>
                          </tr>
                        );
                      } else {
                        return (
                          <tr key={index}>
                            <th className="p-1" scope="col">
                              {index + 1}
                            </th>
                            <td className="p-1" scope="col">
                              {skill.name}
                            </td>
                            <td className="p-1" scope="col">
                              <input
                                type="checkbox"
                                style={{ accentColor: "var(--primary-color)" }}
                                checked={skill.mandatory}
                              />
                            </td>
                            <td className="p-1" scope="col">
                              <input
                                type="checkbox"
                                style={{ accentColor: "var(--primary-color)" }}
                                checked={false}
                              />
                            </td>
                          </tr>
                        );
                      }
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* cards */}
        <div className="mt-4">
          {view === "card" && (
            <>
              <UserCardS
                name="David Marcos"
                image={user}
                email="david@gmail.com"
                phone="5710838457"
              />
              {/* <UserCardA name="Confidential" image={placeholderImage} email="****@gmail.com" phone="57********" /> */}
              {/* <UserCardA name="Michael " /> */}
            </>
          )}

          {/* just ignore the error id not found */}
          <div id="map" style={{ height: "0", width: "100%" }}></div>

          {view === "map" && (
            <div id="googleMap" style={{ width: "100%", height: "77vh" }}></div>
          )}

          {view === "list" && (
            <>
              <div className=" d-lg-block font-5">
                <table className="table table-sm  table-borderless  mt-2  my-0 py-0  table-fixed     ">
                  <tr className=" font-5   ">
                    <th scope="col" style={{ width: "13%" }}>
                      Name
                    </th>
                    <th
                      scope="col"
                      className="bg-body- "
                      style={{ width: "10%" }}
                    >
                      Location
                    </th>
                    <th scope="col" style={{ width: "10%" }}>
                      {" "}
                      About
                    </th>
                    <th scope="col" style={{ width: "13%" }}>
                      Organization
                    </th>
                    <th scope="col" className="" style={{ width: "18%" }}>
                      Email id
                    </th>
                    <th scope="col" className="" style={{ width: "15%" }}>
                      Phone number
                    </th>
                    <th scope="col" style={{ width: "21%" }}></th>
                  </tr>

                  <div className=" "></div>
                  {/* horizontal line */}
                  <tr
                    className=" p-0 m-0   border-black   "
                    style={{ borderColor: "gray", borderWidth: "1px" }}
                  />
                </table>
              </div>

              <ListView />
              <ListView />
            </>
          )}

          {view === "PremiumService" && (
            <>
              {/* back button */}
              <button
                className="input-group-text  mt-4   ms-1 primary-green "
                style={{
                  backgroundColor: "#",
                  color: "var(--primary-color)",
                  borderStyle: "solid",
                  borderColor: "",
                }}
                onClick={() => view("list")}
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCandidate;
