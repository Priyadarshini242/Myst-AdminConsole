import React from "react";
import { useState } from "react";
import Select from "react-select";
import Logo from "../../../Images/logo.png";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
const Demo = () => {
  const [isClearable, setIsClearable] = useState(true);
  const [isSearchable, setIsSearchable] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRtl, setIsRtl] = useState(false);
  const [appAcq, setAppAcq] = useState([
    { label: "Skill Acquired", value: "Skill Acquired" },
    { label: "Skill Applied", value: "Skill Applied" },
  ]);
  const [acqData, setAcqData] = useState([
    { label: "Certification", value: "Certification" },
    { label: "Skilling", value: "Skilling" },
    { label: "Trainings", value: "Trainings" },
    { label: "Conference", value: "Conference" },
  ]);
  return (
    <div>
      <div
        class="modal fade"
        id="exampleModalToggle"
        aria-hidden="true"
        aria-labelledby="exampleModalToggleLabel"
        tabindex="-1"
      >
        <div
          class="modal-dialog modal-dialog-centered  modal-lg"
          style={{ width: "470px" }}
        >
          <div class="modal-content">
            <div class="modal-header" style={{ textAlign: "center" }}>
              {/* <h1 class="modal-title fs-5 " style={{textAlign:"center"}} id="exampleModalToggleLabel">Demo</h1> */}
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div className="d-flex flex-column   ">
                <div className="d-flex flex-column  justify-content-center ">
                  <div className="d-flex   justify-content-center ">
                    <img height={180} width={180} src={Logo} />
                  </div>
                  <div
                    style={{ color: "var(--primary-color)" }}
                    className="d-flex  justify-content-center "
                  >
                    <h3 style={{ fontWeight: "600" }}>MySkillsTree</h3>
                  </div>
                </div>
                <div
                  className="d-flex   justify-content-center  "
                  style={{ height: "200px" }}
                >
                  <div className="d-flex justify-content-center mt-3  ">
                    <h3
                      className="fst-italic "
                      style={{ fontWeight: "100", fontSize: "20px" }}
                    >
                      Quick start by adding a skill
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="d-flex  justify-content-center mt-2 me-2 mb-2 border-top-1 pt-3"
              style={{ borderTop: "solid 1px #C8C8C8" }}
            >
              <button
                class="btn btn-outline-secondary"
                data-bs-target="#Q1"
                data-bs-toggle="modal"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Q1 */}
      <div
        class="modal fade"
        id="Q1"
        aria-hidden="true"
        aria-labelledby="Q1"
        tabindex="-1"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-xl"
          style={{ width: "800px" }}
        >
          <div class="modal-content">
            <div
              class="modal-header mt-1"
              style={{ height: "20px", borderBottom: "0px" }}
            >
              <h1 class="modal-title fs-5" id="Q1">
                Step 1 / 5
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div class="modal-body" style={{ height: "220px" }}>
              <div class="container text-center" style={{ height: "100%" }}>
                <div class="row" style={{ height: "100%" }}>
                  <div
                    class="col col-lg-5 d-flex "
                    style={{
                      backgroundSize: "cover",
                      height: "100%",
                      borderRight: " solid 2px #C8C8C8",
                    }}
                  >
                    <img
                      className="object-fit-contain"
                      src="https://img.freepik.com/free-photo/beautiful-landscape-mother-nature_23-2148992406.jpg"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>

                  <div className="col d-flex flex-column ">
                    <div className="">
                      <div className="d-flex mt-5">
                        <h5 style={{ textAlign: "left" }}>Enter a skill </h5>
                      </div>
                      <div className="">
                        <div class="input-group mt-2">
                          <input
                            type="text"
                            border={"4px"}
                            placeholder="Enter a skill"
                            class="form-control"
                            aria-label="Sizing example input"
                            aria-describedby="inputGroup-sizing-default"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="m-2 d-flex  justify-content-between ">
              <div className=" ">
                <button
                  class="btn btn-secondary "
                  data-bs-target="#exampleModalToggle"
                  data-bs-toggle="modal"
                >
                  {" "}
                  <FaAngleLeft />{" "}
                </button>
              </div>
              <div className="align-self mx-2">
                <button
                  class="btn btn-secondary"
                  data-bs-target="#Q2"
                  data-bs-toggle="modal"
                >
                  {" "}
                  <FaAngleRight />{" "}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 2ND Q */}
      <div
        class="modal fade"
        id="Q2"
        aria-hidden="true"
        aria-labelledby="Q2"
        tabindex="-1"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-xl"
          style={{ width: "800px" }}
        >
          <div class="modal-content">
            <div
              class="modal-header mt-1"
              style={{ height: "20px", borderBottom: "0px" }}
            >
              <h1 class="modal-title fs-5" id="Q2">
                Step 2 / 5
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div class="modal-body" style={{ height: "220px" }}>
              <div class="container text-center" style={{ height: "100%" }}>
                <div class="row" style={{ height: "100%" }}>
                  <div
                    class="col col-lg-5 d-flex "
                    style={{
                      backgroundSize: "cover",
                      height: "100%",
                      borderRight: " solid 2px #C8C8C8",
                    }}
                  >
                    <img
                      className="object-fit-contain"
                      src="https://img.freepik.com/free-photo/beautiful-landscape-mother-nature_23-2148992406.jpg"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>
                  <div
                    className="col d-flex flex-column   gap-2  "
                    style={{ textAlign: "left" }}
                  >
                    <div className="">
                      <div className="d-flex mt-5">
                        <h5>
                          Would you like to add skill applied or skill acquired
                          ?{" "}
                        </h5>
                      </div>
                      <div className="">
                        <div class="mt-3">
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            isDisabled={isDisabled}
                            isLoading={isLoading}
                            isClearable={isClearable}
                            isRtl={isRtl}
                            isSearchable={isSearchable}
                            name="color"
                            options={appAcq}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="m-2 d-flex  justify-content-between ">
              <div className=" ">
                <button
                  class="btn  btn-secondary  "
                  data-bs-target="#Q1"
                  data-bs-toggle="modal"
                >
                  {" "}
                  <FaAngleLeft />
                </button>
              </div>
              <div className="align-self mx-2">
                <button
                  class="btn  btn-secondary "
                  data-bs-target="#Q3"
                  data-bs-toggle="modal"
                >
                  <FaAngleRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 3RD Q */}
      <div
        class="modal fade"
        id="Q3"
        aria-hidden="true"
        aria-labelledby="Q3"
        tabindex="-1"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-xl"
          style={{ width: "800px" }}
        >
          <div class="modal-content">
            <div
              class="modal-header mt-1"
              style={{ height: "20px", borderBottom: "0px" }}
            >
              <h1 class="modal-title fs-5" id="Q3">
                Step 3 / 5
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div class="modal-body" style={{ height: "220px" }}>
              <div class="container text-center" style={{ height: "100%" }}>
                <div class="row" style={{ height: "100%" }}>
                  <div
                    class="col col-lg-5 d-flex "
                    style={{
                      backgroundSize: "cover",
                      height: "100%",
                      borderRight: " solid 2px #C8C8C8",
                    }}
                  >
                    <img
                      className="object-fit-contain"
                      src="https://img.freepik.com/free-photo/beautiful-landscape-mother-nature_23-2148992406.jpg"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>
                  <div className="col d-flex flex-column   gap-2  ">
                    <div className="" style={{ textAlign: "left" }}>
                      <div className="d-flex mt-5">
                        <h5>Where did you acquried the skill from ? </h5>
                      </div>

                      <div className="">
                        <div class="mt-2">
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            isDisabled={isDisabled}
                            isLoading={isLoading}
                            isClearable={isClearable}
                            isRtl={isRtl}
                            isSearchable={isSearchable}
                            name="color"
                            options={acqData}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="m-2 d-flex  justify-content-between ">
              <div className=" ">
                <button
                  class="btn  btn-secondary  "
                  data-bs-target="#Q2"
                  data-bs-toggle="modal"
                >
                  {" "}
                  <FaAngleLeft />
                </button>
              </div>
              <div className="align-self mx-2">
                <button
                  class="btn  btn-secondary "
                  data-bs-target="#Q4"
                  data-bs-toggle="modal"
                >
                  <FaAngleRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4TH Q */}
      <div
        class="modal fade"
        id="Q4"
        aria-hidden="true"
        aria-labelledby="Q4"
        tabindex="-1"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-xl"
          style={{ width: "800px" }}
        >
          <div class="modal-content">
            <div
              class="modal-header mt-1"
              style={{ height: "20px", borderBottom: "0px" }}
            >
              <h1 class="modal-title fs-5" id="Q4">
                Step 4 / 5
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div class="modal-body" style={{ height: "220px" }}>
              <div class="container text-center" style={{ height: "100%" }}>
                <div class="row" style={{ height: "100%" }}>
                  <div
                    class="col col-lg-5 d-flex "
                    style={{
                      backgroundSize: "cover",
                      height: "100%",
                      borderRight: " solid 2px #C8C8C8",
                    }}
                  >
                    <img
                      className="object-fit-contain"
                      src="https://img.freepik.com/free-photo/beautiful-landscape-mother-nature_23-2148992406.jpg"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>
                  <div className="col d-flex flex-column   gap-2  ">
                    <div className="">
                      <div className="d-flex mt-5">
                        <h5 style={{ textAlign: "left" }}>
                          From which institution or orgainization you acquired
                          it ?{" "}
                        </h5>
                      </div>

                      <div className="">
                        <div class="input-group mt-2">
                          <input
                            type="text"
                            border={"4px"}
                            placeholder="Enter insitution or organization name"
                            class="form-control"
                            aria-label="Sizing example input"
                            aria-describedby="inputGroup-sizing-default"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="m-2 d-flex  justify-content-between ">
              <div className=" ">
                <button
                  class="btn  btn-secondary "
                  data-bs-target="#Q3"
                  data-bs-toggle="modal"
                >
                  {" "}
                  <FaAngleLeft />
                </button>
              </div>
              <div className="align-self mx-2">
                <button
                  class="btn btn-secondary "
                  data-bs-target="#Q5"
                  data-bs-toggle="modal"
                >
                  <FaAngleRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5TH Q */}
      <div
        class="modal fade"
        id="Q5"
        aria-hidden="true"
        aria-labelledby="Q5"
        tabindex="-1"
      >
        <div
          class="modal-dialog modal-dialog-centered modal-xl"
          style={{ width: "800px" }}
        >
          <div class="modal-content">
            <div
              class="modal-header mt-1"
              style={{ height: "20px", borderBottom: "0px" }}
            >
              <h1 class="modal-title fs-5" id="Q5">
                Step 5 / 5
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div class="modal-body" style={{ height: "220px" }}>
              <div class="container text-center" style={{ height: "100%" }}>
                <div class="row" style={{ height: "100%" }}>
                  <div
                    class="col col-lg-5 d-flex "
                    style={{
                      backgroundSize: "cover",
                      height: "100%",
                      borderRight: " solid 2px #C8C8C8",
                    }}
                  >
                    <img
                      className="object-fit-contain"
                      src="https://img.freepik.com/free-photo/beautiful-landscape-mother-nature_23-2148992406.jpg"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                      }}
                    />
                  </div>
                  <div
                    className="col d-flex flex-column "
                    style={{ textAlign: "left" }}
                  >
                    <div className="">
                      <div className="d-flex mt-5">
                        <h5 style={{ textAlign: "left" }}>
                          When did you acquired it ?{" "}
                        </h5>
                      </div>

                      <div className="">
                        <div class="input-group mt-3">
                          <span className="" style={{ width: "50px" }}>
                            From:{" "}
                          </span>
                          <input type="date" />
                        </div>
                      </div>
                      <div className="">
                        <div class="input-group mt-3">
                          <span className=" " style={{ width: "50px" }}>
                            To:{" "}
                          </span>
                          <input type="date" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="m-2 d-flex  justify-content-between ">
              <div className=" ">
                <button
                  class="btn  btn-secondary  "
                  data-bs-target="#Q4"
                  data-bs-toggle="modal"
                >
                  {" "}
                  <FaAngleLeft />
                </button>
              </div>
              <div className="align-self mx-2">
                <button
                  class="btn  btn-secondary "
                  data-bs-target="#Q5"
                  data-bs-toggle="modal"
                >
                  SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        style={{
          backgroundColor: "#F7FFDD",
          cursor: "pointer",
          color: "var(--primary-color)",
          borderStyle: "solid",
          borderColor: "var(--primary-color)",
          opacity: 1,
          padding: "3px",
          fontSize: "10px",
          fontWeight: "600",
          border: "solid 1px",
          borderRadius: "6px",
        }}
        class=""
        data-bs-target="#exampleModalToggle"
        data-bs-toggle="modal"
      >
        Demo
      </button>
    </div>
  );
};

export default Demo;
