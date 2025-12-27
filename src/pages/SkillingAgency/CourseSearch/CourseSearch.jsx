import React from "react";
import "./coursesearch.css";
import { useNavigate } from "react-router-dom";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { IoLanguage, IoLocation } from "react-icons/io5";
import { FaMoneyBillAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { premiumServicePrices } from "../SkillingAgencyConstants";

const CourseSearch = () => {
  const navigate = useNavigate();
  const currency = useSelector((state) => state.currency.value);
  return (
    <>
      <section class="light mt-2">
        <div class="container">
          <div className="d-flex justify-content-between  mb-4">
            <div
              class=" text-center d-flex justify-content-center align-items-center px-2 text-white rounded "
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              {" "}
              <div className="font-5">Top Courses</div>{" "}
            </div>

            <div class="main-search-input-wrap">
              <div
                class="main-search-input fl-wrap "
                style={{ position: "relative" }}
              >
                <div class="main-search-input-item rounded shadow-sm">
                  <input
                    type="text"
                    value=""
                    placeholder="Search Courses..."
                    className="p-1 rounded "
                    style={{
                      minWidth: "20rem",
                      border: "2px solid var(--primary-color)",
                    }}
                  />
                </div>
                <button
                  class="main-search-button"
                  className="rounded px-2 fn-bold "
                  style={{
                    position: "absolute",
                    bottom: "0px",
                    top: "0px",
                    right: "0px",
                    fontSize: ".8rem",
                    backgroundColor: "var(--primary-color)",
                    border: "none",
                    color: "white",
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          <article class="postcard light blue ">
            <a class="postcard__img_link" href="#">
              <img
                class="postcard__img"
                src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1704366309/Cartoon_tiny_young_programmers_and_coders_working_with_computers_xr7gjf.jpg"
                alt="Image Title"
              />
            </a>

            <div class="postcard__text p-4 t-dark">
              <div className="d-flex justify-content-between">
                <div>
                  <h1 class="postcard__title blue mb-0">
                    <a href="#">Advance Java</a>
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
                    Mon, May 25th 2020
                    <i
                      className="mx-2 pill-bg-color text-white rounded-pill px-2 py-1 ps-1   border-0  "
                      style={{ cursor: "pointer" }}
                    >
                      {" "}
                      on-going
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
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                Eligendi, fugiat asperiores inventore beatae accusamus odit
                minima enim, commodi quia, doloribus eius! Ducimus nemo
                accusantium maiores velit corrupti tempora reiciendis molestiae
                repellat vero. Eveniet ipsam adipisci illo iusto quibusdam, sunt
                neque nulla unde ipsum dolores nobis enim quidem excepturi,
                illum quos!
              </div>
              <ul class="postcard__tagbox my-2">
                <li
                  class="tag__item d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                  }}
                >
                  <IoLocation
                    style={{ fontSize: "17px", marginRight: "10px" }}
                  />
                  Delhi , Remote
                </li>
                <li
                  class="tag__item d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                  }}
                >
                  <IoLanguage
                    style={{ fontSize: "17px", marginRight: "10px" }}
                  />{" "}
                  English,Hindi
                </li>
                <li
                  class="tag__item d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                  }}
                >
                  <i class="fas fa-clock " style={{ marginRight: "10px" }}></i>6
                  Months
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
                  <div class="mb-0 yellow">
                    {premiumServicePrices.find((country) => {
                      return country.country === currency;
                    })?.price || <span>NA</span>}
                  </div>

                  <span>
                    {premiumServicePrices.find((country) => {
                      return country.country === currency;
                    })?.currency || <span>NA</span>}
                  </span>
                </li>
                <li
                  class="tag__item play blue d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    navigate(
                      "/skilling-agency/coursesearch/coursepreview/f136f094-3a6d-43cf-ab6c-58749b5b4706"
                    )
                  }
                >
                  <MdKeyboardDoubleArrowRight style={{ fontSize: "1.5rem" }} />
                  View Details
                </li>
              </ul>

              <div class="d-flex flex-row align-items-center">
                <div class="icon">
                  <img
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    style={{
                      height: "3rem",
                      width: "3rem",
                      borderRadius: "50%",
                    }}
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
          </article>
        </div>
      </section>
    </>
  );
};

export default CourseSearch;
