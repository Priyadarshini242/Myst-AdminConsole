import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiMinus } from "react-icons/fi";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import Loader from "../../../components/Loader";

import { premiumServicePrices } from "../SkillingAgencyConstants";
import { IoLanguage, IoLocation } from "react-icons/io5";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdOutlineReportGmailerrorred,
} from "react-icons/md";
import { FaFileDownload, FaMoneyBillAlt } from "react-icons/fa";
import { FaReplyAll } from "react-icons/fa";
import PrerequsiteSkills from "../../../components/SkillingAgency/CourseSearchComponents/PrerequsiteSkills";
import SkillsAttainable from "../../../components/SkillingAgency/CourseSearchComponents/SkillsAttainable";

const CoursePreview = () => {
  //Redux
  const { data, status, error } = useSelector((state) => state.userCourses);
  const currency = useSelector((state) => state.currency.value);

  //Hooks
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  //find selected course from all user courses
  useEffect(() => {
    let course = data.find((course) => id == course.id);
    setSelectedCourse(course);
    console.log(course);
  }, [id, status]);

  //if not selected courses then show loader
  if (!selectedCourse) {
    return <Loader />;
  }

  return (
    <div className="p-2">
      {/* PremiumServices */}
      <div
        class="modal fade modal"
        id="showpremium"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Premium Access{" "}
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div class="col-md-12">
                <div
                  class="card card-blue p-3 text-white mb-3"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  <span>You have to pay</span>
                  <div class="d-flex flex-row align-items-end mb-3">
                    <div className="d-flex justify-content-center gap-1">
                      <h1 class="mb-0 yellow">
                        {premiumServicePrices.find((country) => {
                          return country.country === currency;
                        })?.price || <h2>NA</h2>}
                      </h1>
                      <span>
                        {premiumServicePrices.find((country) => {
                          return country.country === currency;
                        })?.currency || <span>NA</span>}
                      </span>
                    </div>
                  </div>
                  <span>
                    Enjoy all the features and perk after you complete the
                    payment
                  </span>
                  <Link
                    href="#"
                    class="yellow decoration"
                    style={{ color: "#87CEEB" }}
                  >
                    Know all the features
                  </Link>
                  <div class="hightlight">
                    <span>
                      100% Guaranteed support and update for the next 1 years.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* comment modal */}
      <div
        class="modal fade modal"
        id="addcomment"
        style={{ marginTop: "50px" }}
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Add a comment
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body ">
              <div class="comment-card">
                <div class="row p-2">
                  <div class="col-1 p-0">
                    <img
                      class=""
                      style={{ borderRadius: "50%" }}
                      src="https://i.imgur.com/xxJl1D7.jpg"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div class="col-11 " style={{ paddingLeft: "10px" }}>
                    <div class="comment-box ml-2">
                      <div class="comment-rating">
                        <input
                          type="radio"
                          name="comment-rating"
                          value="5"
                          id="5"
                        />
                        <label for="5">☆</label>
                        <input
                          type="radio"
                          name="comment-rating"
                          value="4"
                          id="4"
                        />
                        <label for="4">☆</label>
                        <input
                          type="radio"
                          name="comment-rating"
                          value="3"
                          id="3"
                        />
                        <label for="3">☆</label>
                        <input
                          type="radio"
                          name="comment-rating"
                          value="2"
                          id="2"
                        />
                        <label for="2">☆</label>
                        <input
                          type="radio"
                          name="comment-rating"
                          value="1"
                          id="1"
                        />
                        <label for="1">☆</label>
                      </div>
                      <div class="comment-area">
                        <textarea
                          class="form-control"
                          placeholder="what is your view?"
                          rows="4"
                        ></textarea>
                      </div>
                      <div class="comment-btns mt-2 d-flex justify-content-end gap-2">
                        <button
                          class="btn btn-success btn-sm fw-bold "
                          style={{
                            backgroundColor: "white",
                            color: "var(--primary-color)",
                            border: "2px solid var(--primary-color)",
                          }}
                        >
                          Cancel
                        </button>
                        <button class="btn btn-success send btn-sm">
                          Send <i class="fa fa-long-arrow-right ml-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* reply modal */}
      <div
        class="modal fade modal"
        id="addreply"
        style={{ marginTop: "50px" }}
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Reply
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body ">
              <div class="comment-card">
                <div class="row p-2">
                  <div class="col-1 p-0">
                    <img
                      class=""
                      style={{ borderRadius: "50%" }}
                      src="https://i.imgur.com/xxJl1D7.jpg"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div class="col-11 " style={{ paddingLeft: "10px" }}>
                    <div className="mb-1">
                      It is a long established fact that a reader will be
                      distracted by the readable content of a page when looking
                      at its layout. The point of using Lorem Ipsum is that it
                      has a more-or-less normal distribution of letters, as
                      opposed to using 'Content here, content here', making it
                      look like readable English.
                    </div>
                  </div>
                </div>
                <div class="row p-2">
                  <div class="col-1 p-0">
                    <img
                      class=""
                      style={{ borderRadius: "50%" }}
                      src="https://i.imgur.com/nAcoHRf.jpg"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div class="col-11 " style={{ paddingLeft: "10px" }}>
                    <div class="comment-box ml-2">
                      <div class="comment-area">
                        <textarea
                          class="form-control"
                          placeholder="what is your view?"
                          rows="4"
                        ></textarea>
                      </div>
                      <div class="comment-btns mt-2 d-flex justify-content-end gap-2">
                        <button
                          class="btn btn-success btn-sm fw-bold "
                          style={{
                            backgroundColor: "white",
                            color: "var(--primary-color)",
                            border: "2px solid var(--primary-color)",
                          }}
                        >
                          Cancel
                        </button>
                        <button class="btn btn-success send btn-sm">
                          Send <i class="fa fa-long-arrow-right ml-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* report modal */}
      <div
        class="modal fade modal"
        id="report"
        style={{ marginTop: "50px" }}
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Reply
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body ">
              <div class="comment-card">
                <div class="row p-2">
                  <div class="col-1 p-0">
                    <img
                      class=""
                      style={{ borderRadius: "50%" }}
                      src="https://i.imgur.com/xxJl1D7.jpg"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div class="col-11 " style={{ paddingLeft: "10px" }}>
                    <div className="mb-1">
                      It is a long established fact that a reader will be
                      distracted by the readable content of a page when looking
                      at its layout. The point of using Lorem Ipsum is that it
                      has a more-or-less normal distribution of letters, as
                      opposed to using 'Content here, content here', making it
                      look like readable English.
                    </div>
                  </div>
                </div>
                <div class="row p-2  d-flex align-items-start">
                  <div class="col-1 p-0 pt-2">
                    <img
                      class=""
                      style={{ borderRadius: "50%" }}
                      src="https://i.imgur.com/nAcoHRf.jpg"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div class="col-11 " style={{ paddingLeft: "10px" }}>
                    <div class="alert alert-danger" role="alert">
                      Report the above comment! Are you sure?
                    </div>
                    <div class="comment-btns mt-2 d-flex justify-content-end gap-2">
                      <button type="button" class="btn btn-secondary">
                        Cancel
                      </button>
                      <button type="button" class="btn btn-danger">
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* course name and buttons */}
      <div className="  d-flex  justify-content-between mb-1">
        <div className="d-flex gap-3">
          <div className=" ml-2" style={{ fontWeight: "bold" }}>
            <span
              className="mx-2"
              style={{ color: "var(--primary-color)", fontWeight: "bold" }}
            >
              Name :
            </span>
            {selectedCourse.courseName}{" "}
          </div>
          {/* <div className=' ml-2' style={{ fontWeight: 'bold' }}><span className='mx-2' style={{ color: 'var(--primary-color)', fontWeight: 'bold' }} >Release Status :</span>Not Released </div> */}
        </div>
        <SecondaryBtn
          label={"Edit"}
          backgroundColor="#F7FFDD"
          color="var(--primary-color)"
          onClick={() =>
            navigate(`/skilling-agency/coursesearch/courseedit/${id}`)
          }
        />
      </div>

      <div className="d-flex gap-2 mb-2 justify-content-center align-items-center mx-2">
        <i className=" m-1">
          There are{" "}
          <i
            className="mx-2 pill-bg-color text-white rounded-pill px-2 py-1 font-5   border-0  "
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/skilling-agency/coursesearch/coursecandidate/${id}`)
            }
          >
            {" "}
            2 potential candidates{" "}
          </i>{" "}
          for this course
        </i>
        <div>
          <SecondaryBtn
            label={"show"}
            backgroundColor="#F7FFDD"
            color="var(--primary-color)"
            onClick={() =>
              navigate(`/skilling-agency/coursesearch/coursecandidate/${id}`)
            }
          />
          <button
            className="btn py-1 px-2 m-0 ml-2"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontSize: ".7rem",
            }}
            data-bs-toggle="modal"
            data-bs-target="#showpremium"
          >
            show
          </button>
        </div>
      </div>

      {/* course card and details */}
      <div className="postcard d-flex flex-column mx-2">
        {/* course card */}
        <article class="d-flex light blue ">
          <div class="postcard__text p-4 t-dark">
            <div className="d-flex justify-content-between">
              <div>
                <h1 class="postcard__title blue mb-0">
                  <a href="#">{selectedCourse.courseName}</a>
                </h1>
                <div class="postcard__subtitle small">
                  <time datetime="2020-05-25 12:00:00" class="mr-2"></time>
                  <i className="fw-semibold" style={{ display: "block" }}>
                    Course started from
                  </i>
                  <i
                    class="fas fa-calendar-alt ml-2"
                    style={{ marginRight: "5px" }}
                  ></i>
                  {new Date(
                    Number(selectedCourse.courseStartingDate)
                  ).toLocaleDateString("en-US", { weekday: "long" })}{" "}
                  ,{" "}
                  {new Date(
                    Number(selectedCourse.courseStartingDate)
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  <i
                    className="mx-2 pill-bg-color text-white rounded-pill px-2 py-1      border-0  "
                    style={{ cursor: "pointer" }}
                  >
                    {selectedCourse.status}
                  </i>
                </div>
              </div>
              <div class="d-flex justify-content-center">
                <div class="content text-center">
                  <div class="ratings">
                    <span class="product-rating p-0">4.6</span>
                    <span>/5</span>
                    <div class="stars">
                      <i class="fa fa-star"></i>
                      <i class="fa fa-star"></i>
                      <i class="fa fa-star"></i>
                      <i class="fa fa-star"></i>
                      <i class="fa fa-star"></i>
                    </div>
                    <div class="rating-text">
                      <span>46 ratings & 15 reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <div class="postcard__bar"></div> */}
            <div class="postcard__preview-txt mt-2">
              {selectedCourse.courseDescription.length > 200
                ? selectedCourse.courseDescription.substring(0, 200) + "..."
                : selectedCourse.courseDescription}
            </div>
            <ul class="postcard__tagbox my-2">
              <li
                class="tag__item d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
              >
                <IoLocation style={{ fontSize: "17px", marginRight: "10px" }} />
                {selectedCourse.location}
              </li>
              <li
                class="tag__item d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
              >
                <IoLanguage style={{ fontSize: "17px", marginRight: "10px" }} />
                {selectedCourse.mlanguage}
              </li>
              <li
                class="tag__item d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
              >
                <i class="fas fa-clock " style={{ marginRight: "10px" }}></i>
                {selectedCourse.durationNumber +
                  " " +
                  selectedCourse.durationPhase}
              </li>
              <li
                class="tag__item d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
              >
                <FaMoneyBillAlt
                  style={{ fontSize: "17px", marginRight: "10px" }}
                />
                {/* <div class="mb-0 yellow">
                  {
                    premiumServicePrices.find((country) => {
                      return country.country === currency
                    })?.price || <span>NA</span>
                  }
                </div>


                <span>
                  {

                    premiumServicePrices.find((country) => {
                      return country.country === currency
                    })?.currency || <span>NA</span>
                  }
                </span> */}
                {selectedCourse.price + " INR"}
              </li>
              {showAllDetails ? (
                <li
                  class="tag__item play blue d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowAllDetails(false)}
                >
                  <MdKeyboardDoubleArrowLeft
                    style={{ fontSize: "1.5rem", marginInline: "auto" }}
                  />
                  Close Details
                </li>
              ) : (
                <li
                  class="tag__item play blue d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowAllDetails(true)}
                >
                  <MdKeyboardDoubleArrowRight style={{ fontSize: "1.5rem" }} />
                  View Details
                </li>
              )}
            </ul>
            <div class="d-flex flex-row align-items-center">
              <div class="icon">
                <img
                  src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt=""
                  style={{ height: "3rem", width: "3rem", borderRadius: "50%" }}
                />{" "}
              </div>

              <div class="ms-2 c-details py-1">
                <h6 class="mb-0 " style={{ fontWeight: "bold" }}>
                  Mailchimp
                </h6>
                <span style={{ fontSize: ".8rem" }}>7 more courses</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded">
            <a class="postcard__img_link" href="#">
              <img
                class="postcard__img  rounded"
                src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1704366309/Cartoon_tiny_young_programmers_and_coders_working_with_computers_xr7gjf.jpg"
                alt="Image Title"
              />
            </a>
          </div>
        </article>

        {/* course details */}
        <div class="accordion" id="accordionPanelsStayOpenExample">
          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class={`accordion-button collapsed `}
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseOne"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseOne"
              >
                Course Details
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseOne"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
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
                  {selectedCourse.courseDescription}{" "}
                </div>
                <table class="">
                  <tbody className=" ">
                    <tr className="">
                      <th className="p-1" scope="col">
                        <span
                          className="mr-2"
                          style={{
                            color: "var(--primary-color)",
                            fontWeight: "bold",
                          }}
                        >
                          Location :
                        </span>
                      </th>
                      <td className="p-1" scope="col">
                        {" "}
                        <div
                          class="tag__item d-flex justify-content-start align-items-center px-2 py-0 rounded"
                          style={{
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                            width: "fit-content",
                          }}
                        >
                          <IoLocation
                            style={{ fontSize: "17px", marginRight: "10px" }}
                          />
                          {selectedCourse.location}
                        </div>
                      </td>
                    </tr>
                    <tr className="">
                      <th className="p-1" scope="col">
                        {" "}
                        <span
                          className="mr-2"
                          style={{
                            color: "var(--primary-color)",
                            fontWeight: "bold",
                          }}
                        >
                          Language :
                        </span>
                      </th>
                      <td className="p-1" scope="col">
                        <div
                          class="tag__item d-flex justify-content-start align-items-center px-2 py-0 rounded"
                          style={{
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                          }}
                        >
                          <IoLanguage
                            style={{ fontSize: "17px", marginRight: "10px" }}
                          />
                          {selectedCourse.mlanguage}
                        </div>
                      </td>
                    </tr>
                    <tr className="">
                      <th className="p-1" scope="col">
                        {" "}
                        <span
                          className="mr-2"
                          style={{
                            color: "var(--primary-color)",
                            fontWeight: "bold",
                          }}
                        >
                          Duration :
                        </span>
                      </th>
                      <td className="p-1" scope="col">
                        <div
                          class="tag__item d-flex justify-content-start align-items-center px-2 py-0 rounded"
                          style={{
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                          }}
                        >
                          <i
                            class="fas fa-clock "
                            style={{ marginRight: "10px" }}
                          ></i>
                          {selectedCourse.durationNumber}{" "}
                          {selectedCourse.durationPhase}
                        </div>
                      </td>
                    </tr>
                    <tr className="">
                      <th className="p-1" scope="col">
                        {" "}
                        <span
                          className="mr-2"
                          style={{
                            color: "var(--primary-color)",
                            fontWeight: "bold",
                          }}
                        >
                          Course PDF:
                        </span>
                      </th>
                      <td className="p-1" scope="col">
                        <div
                          class="tag__item d-flex justify-content-start align-items-center px-2 py-0 rounded"
                          style={{
                            backgroundColor: "var(--primary-color)",
                            color: "white",
                          }}
                        >
                          <FaFileDownload
                            style={{ fontSize: "17px", marginRight: "10px" }}
                          />
                          Download
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header">
              <button
                class="accordion-button collapsed  "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseThree"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseThree"
              >
                Prerequisite Skills
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseThree"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body">
                {/* <table class="table table-hover">
                  <thead>
                    <tr>
                      <th className='p-1' scope="col">#</th>
                      <th className='p-1' scope="col">prerequisite Skills</th>
                      <th className='p-1' scope="col">Mandatory</th>
                      <th className='p-1' scope="col">Exclude (not)</th>
                    </tr>
                  </thead>
                  <tbody className=" divide-y ml-5  ">
                    {
                      JSON.parse(selectedCourse.prerequisiteSkills.replace(/'/g, '"')).map((skill, index) => {

                        if (skill.exclude) {
                          return (
                            <tr className='' style={{ opacity: '.3' }} key={index}>
                              <th className='p-1' scope="col">{index + 1}</th>
                              <td className='p-1' scope="col">{skill.name}</td>
                              <td className='p-1' scope="col"><FiMinus /></td>
                              <td className='p-1' scope="col"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={true} /></td>
                            </tr>

                          )
                        } else {
                          return (
                            <tr key={index}>
                              <th className='p-1' scope="col">{index + 1}</th>
                              <td className='p-1' scope="col">{skill.name}</td>
                              <td className='p-1' scope="col"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.mandatory} /></td>
                              <td className='p-1' scope="col"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={false} /></td>
                            </tr>
                          )
                        }
                      })
                    }
                  </tbody>
                </table> */}
                <PrerequsiteSkills courseId={id} />
              </div>
            </div>
          </div>

          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseTwo"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseTwo"
              >
                Skills Attainable
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseTwo"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body">
                {/* <table class="table table-hover">
                  <thead>
                    <tr>
                      <th className='p-1' scope="col">#</th>
                      <th className='p-1' scope="col">Skills/Topic Name</th>
                      <th className='p-1' scope="col">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      JSON.parse(selectedCourse.skillsAttainable.replace(/'/g, '"')).map((topic, i) => {
                        return (
                          <tr>
                            <th className='p-1' scope="row">{i + 1}</th>
                            <td className='p-1'>{topic.name}</td>
                            <td className='p-1'>{topic.duration}{topic.phase}</td>

                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table> */}
                <SkillsAttainable courseId={id} />
              </div>
            </div>
          </div>

          <div class="accordion-item ">
            <h2 class="accordion-header ">
              <button
                class="accordion-button collapsed "
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseFour"
                aria-expanded={setShowAllDetails}
                aria-controls="panelsStayOpen-collapseFour"
              >
                Course Reviews
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseFour"
              class={`accordion-collapse collapse ${
                showAllDetails ? "show" : ""
              }`}
            >
              <div class="accordion-body">
                <div class=" mt-2">
                  <div class="d-flex justify-content-center row">
                    <div class="col-md-12">
                      <div class=" bg-white rounded">
                        <div className="d-flex justify-content-between">
                          <h6 className="fw-bold">Reviews[3]</h6>
                          <button
                            className="btn py-1 px-2 m-0"
                            style={{
                              backgroundColor: "var(--primary-color)",
                              color: "white",
                              fontSize: ".7rem",
                            }}
                            data-bs-toggle="modal"
                            data-bs-target="#addcomment"
                          >
                            Add Comment
                          </button>
                        </div>
                        <div class="review mt-2">
                          <div class="d-flex flex-row comment-user">
                            <img
                              class=""
                              style={{ borderRadius: "50%" }}
                              src="https://i.imgur.com/xxJl1D7.jpg"
                              width="40"
                              height="40"
                            />
                            <div class="mx-2">
                              <div class="d-flex flex-row align-items-center">
                                <span class="name fw-bold">Hui jhong</span>
                                <span class="dot"></span>
                                <span
                                  class="date "
                                  style={{
                                    fontSize: "12px",
                                    marginLeft: "10px",
                                  }}
                                >
                                  12 Aug 2020
                                </span>
                              </div>
                              <div class="stars">
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                              </div>
                            </div>
                          </div>
                          <div class="mt-1 ">
                            <p class="comment-text mb-0">
                              It is a long established fact that a reader will
                              be distracted by the readable content of a page
                              when looking at its layout. The point of using
                              Lorem Ipsum is that it has a more-or-less normal
                              distribution of letters, as opposed to using
                              'Content here, content here', making it look like
                              readable English.
                            </p>
                            <div
                              className="d-flex gap-2 align-items-center justify-content-start"
                              style={{
                                position: "relative",
                                isolation: "isolate",
                              }}
                            >
                              <div
                                class="accordion"
                                id="accordionPanelsStayOpenExample"
                              >
                                <div class="accordion-item">
                                  <h2
                                    class="accordion-header"
                                    id="panelsStayOpen-headingROne"
                                  >
                                    <button
                                      class="accordion-button collapsed"
                                      style={{
                                        width: "10rem",
                                        boxShadow: "none",
                                      }}
                                      type="button"
                                      data-bs-toggle="collapse"
                                      data-bs-target="#panelsStayOpen-collapseROne"
                                      aria-expanded="false"
                                      aria-controls="panelsStayOpen-collapseROne"
                                    >
                                      <div className="d-flex align-items-center">
                                        <span
                                          style={{
                                            cursor: "pointer",
                                            color: "var(--primary-color)",
                                            fontSize: "12px",
                                            fontWeight: "bolder",
                                            textDecoration: "underline",
                                          }}
                                        >
                                          Show 3 Replies
                                        </span>
                                      </div>
                                    </button>
                                  </h2>
                                  <div
                                    id="panelsStayOpen-collapseROne"
                                    class="accordion-collapse collapse"
                                    aria-labelledby="panelsStayOpen-headingROne"
                                  >
                                    <div class="accordion-body d-flex flex-column gap-3">
                                      <div>
                                        <div class="d-flex flex-row comment-user">
                                          <img
                                            class=""
                                            style={{ borderRadius: "50%" }}
                                            src="https://i.imgur.com/xELPaag.jpg"
                                            width="25"
                                            height="25"
                                          />
                                          <div class="mx-2">
                                            <div class="d-flex flex-row align-items-center">
                                              <span class="name fw-bold">
                                                Simona Disa
                                              </span>
                                              <span class="dot"></span>
                                              <span
                                                class="date "
                                                style={{
                                                  fontSize: "12px",
                                                  marginLeft: "10px",
                                                }}
                                              >
                                                12 Aug 2020
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <p class="comment-text mb-0">
                                          letters, as opposed to using 'Content
                                          here, content here', making it look
                                          like readable English. The standard
                                          chunk of Lorem Ipsum used since the
                                          1500s is reproduced below for those
                                          interested.
                                        </p>
                                      </div>
                                      <div>
                                        <div class="d-flex flex-row comment-user">
                                          <img
                                            class=""
                                            style={{ borderRadius: "50%" }}
                                            src="https://i.imgur.com/nAcoHRf.jpg"
                                            width="25"
                                            height="25"
                                          />
                                          <div class="mx-2">
                                            <div class="d-flex flex-row align-items-center">
                                              <span class="name fw-bold">
                                                John Smith
                                              </span>
                                              <span class="dot"></span>
                                              <span
                                                class="date "
                                                style={{
                                                  fontSize: "12px",
                                                  marginLeft: "10px",
                                                }}
                                              >
                                                12 Aug 2020
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        <p class="comment-text mb-0">
                                          {" "}
                                          the majority have suffered alteration
                                          in some form, by injected humour, or
                                          randomised words.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div
                                className="d-flex gap-2"
                                style={{
                                  position: "absolute",
                                  right: "10px",
                                  top: "5px",
                                }}
                              >
                                <div
                                  className="d-flex align-items-center"
                                  data-bs-toggle="modal"
                                  data-bs-target="#addreply"
                                >
                                  <FaReplyAll
                                    style={{
                                      cursor: "pointer",
                                      color: "var(--primary-color)",
                                      fontSize: "20px",
                                      marginRight: "2px",
                                    }}
                                  ></FaReplyAll>
                                  <span
                                    style={{
                                      cursor: "pointer",
                                      color: "var(--primary-color)",
                                      fontSize: "12px",
                                      fontWeight: "bolder",
                                    }}
                                  >
                                    Reply
                                  </span>
                                </div>
                                <div
                                  className="d-flex  align-items-center"
                                  data-bs-toggle="modal"
                                  data-bs-target="#report"
                                >
                                  <MdOutlineReportGmailerrorred
                                    style={{
                                      cursor: "pointer",
                                      color: "var(--primary-color)",
                                      fontSize: "20px",
                                      marginRight: "2px",
                                    }}
                                  ></MdOutlineReportGmailerrorred>
                                  <span
                                    style={{
                                      cursor: "pointer",
                                      color: "var(--primary-color)",
                                      fontSize: "12px",
                                      fontWeight: "bolder",
                                    }}
                                  >
                                    Report
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="review mt-4">
                          <div class="d-flex flex-row comment-user">
                            <img
                              class=""
                              style={{ borderRadius: "50%" }}
                              src="https://i.imgur.com/xxJl1D7.jpg"
                              width="40"
                              height="40"
                            />
                            <div class="mx-2">
                              <div class="d-flex flex-row align-items-center">
                                <span class="name fw-bold">Timso hui</span>
                                <span class="dot"></span>
                                <span
                                  class="date "
                                  style={{
                                    fontSize: "12px",
                                    marginLeft: "10px",
                                  }}
                                >
                                  12 Aug 2020
                                </span>
                              </div>
                              <div class="stars">
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                              </div>
                            </div>
                          </div>
                          <div class="mt-2" style={{ position: "relative" }}>
                            <p class="comment-text pb-3">
                              Lorem ipsum dolor sit amet, consectetur adipiscing
                              elit, sed do eiusmod tempor incididunt ut labore
                              et dolore magna aliqua. Ut enim ad minim veniam,
                              quis nostrud exercitation ullamco laboris nisi ut
                              aliquip
                            </p>
                            <div
                              className="d-flex gap-2 align-items-center"
                              style={{
                                position: "absolute",
                                right: "5px",
                                bottom: "0px",
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <FaReplyAll
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "20px",
                                    marginRight: "2px",
                                  }}
                                ></FaReplyAll>
                                <span
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "12px",
                                    fontWeight: "bolder",
                                  }}
                                >
                                  Reply
                                </span>
                              </div>
                              <div className="d-flex  align-items-center">
                                <MdOutlineReportGmailerrorred
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "20px",
                                    marginRight: "2px",
                                  }}
                                ></MdOutlineReportGmailerrorred>
                                <span
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "12px",
                                    fontWeight: "bolder",
                                  }}
                                >
                                  Report
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="review mt-2">
                          <div class="d-flex flex-row comment-user">
                            <img
                              class=""
                              style={{ borderRadius: "50%" }}
                              src="https://i.imgur.com/xxJl1D7.jpg"
                              width="40"
                              height="40"
                            />
                            <div class="mx-2">
                              <div class="d-flex flex-row align-items-center">
                                <span class="name fw-bold">Hui jhong</span>
                                <span class="dot"></span>
                                <span
                                  class="date "
                                  style={{
                                    fontSize: "12px",
                                    marginLeft: "10px",
                                  }}
                                >
                                  12 Aug 2020
                                </span>
                              </div>
                              <div class="stars">
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                                <i class="fa fa-star"></i>
                              </div>
                            </div>
                          </div>
                          <div class="mt-2" style={{ position: "relative" }}>
                            <p class="comment-text pb-3">
                              It is a long established fact that a reader will
                              be distracted by the readable content of a page
                              when looking at its layout. The point of using
                              Lorem Ipsum is that it has a more-or-less normal
                              distribution of letters, as opposed to using
                              'Content here, content here', making it look like
                              readable English.
                            </p>
                            <div
                              className="d-flex gap-2 align-items-center"
                              style={{
                                position: "absolute",
                                right: "5px",
                                bottom: "0px",
                              }}
                            >
                              <div className="d-flex align-items-center">
                                <FaReplyAll
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "20px",
                                    marginRight: "2px",
                                  }}
                                ></FaReplyAll>
                                <span
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "12px",
                                    fontWeight: "bolder",
                                  }}
                                >
                                  Reply
                                </span>
                              </div>
                              <div className="d-flex  align-items-center">
                                <MdOutlineReportGmailerrorred
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "20px",
                                    marginRight: "2px",
                                  }}
                                ></MdOutlineReportGmailerrorred>
                                <span
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--primary-color)",
                                    fontSize: "12px",
                                    fontWeight: "bolder",
                                  }}
                                >
                                  Report
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
