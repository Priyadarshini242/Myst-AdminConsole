import React, { useRef, useState } from "react";
import { allCourses } from "../SkillingAgencyConstants";

import { MdCancel, MdCloudUpload, MdDelete } from "react-icons/md";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import { useNavigate } from "react-router-dom";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { addMyCourse } from "../../../reducer/SkillingAgency/features/course/mycourse/myCourseSlice";
import CreateSelectInRequirements from "../../../components/SkillAvailer/CreateSelectInRequirements";

import CreatableSelect from "react-select/creatable";
import PostApi from "../../../api/PostData/PostApi";
import createNewCourse from "../../../api/SkillingAgency/createNewCourse";
import { LIMITED_SPL_CHARS } from "../../../config/constant";

const NewCourse = () => {
  //personal hooks
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //course name & course Suggestions
  const [courseName, setCourseName] = useState("");
  const [suggestCourse, setSuggestCourse] = useState(false);

  // course description
  const [courseDescription, setCourseDescription] = useState("");

  //course image
  const [selectedImage, setSelectedImage] = useState(null);

  //coursePDF
  const [coursePdf, setCoursePdf] = useState(null); //file upload
  const [isFileError, setIsFileError] = useState(false); //file arror

  // course locations
  const components = {
    DropdownIndicator: null,
  };
  const createOption = (label) => ({
    label,
    value: label,
  });
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");

  // course languages
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState("");

  //other fields
  const [courseStartingDate, setCourseStatingDate] = useState("");
  const [price, setPrice] = useState("");
  const [durationNumber, setDurationNumber] = useState("");
  const [durationPhase, setDurationPhase] = useState("Months");
  const [courseStatus, setCourseStatus] = useState("Not started");

  //prerequsite skills
  const [prerequisiteSkills, setPrerequisiteSkills] = useState([]); //for array
  const [skill, setSkill] = useState({
    //for modal
    name: "",
    exp: "",
    mandatory: false,
  });

  //skills Attainable
  const [courseTopics, setCourseTopics] = useState([]); //skills attainable array
  const [topics, setTopics] = useState({
    //for modal
    name: "",
    duration: "",
    phase: "Days",
  });

  console.log(courseStartingDate);

  //handle course name focus // show suggestion
  const handleCourseNameFocus = (e) => {
    setSuggestCourse(true);
    if (e.target.value.length === 0) {
      setSuggestCourse(allCourses);
      return;
    }
  };

  //handle course name change
  const handleCourseNameChange = (e) => {
    setCourseName(e.target.value);
    if (e.target.value.length === 0) {
      setSuggestCourse(allCourses);
      return;
    }
    const inputValue = e.target.value.toLowerCase(); // Convert the input value to lowercase for case-insensitive comparison
    // Iterate through the array of courses
    const matchingCourses = allCourses.filter((course) => {
      const courseName = course.courseName.toLowerCase(); // Convert the course name to lowercase for case-insensitive comparison
      return courseName.includes(inputValue);
    });
    setSuggestCourse(matchingCourses);
    console.log(matchingCourses);
  };

  // handle suggest course click
  const handleSuggestCourseClick = (course) => {
    setSuggestCourse(false);
    console.log("ok");
    setCourseName(course.courseName);
    setCourseDescription(course.courseDetails.description);
    setCourseTopics(course.courseDetails.topics);
    setPrerequisiteSkills(course.prerequisiteSkills);
  };

  /////////////////////////////////////////////////////////////////////////prerequsite skills/////////////////////////////////////////////////
  //handle add skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skill.name === "") {
      showErrorToast("Skill name is required");
      return;
    }
    setPrerequisiteSkills([...prerequisiteSkills, { ...skill }]);
    setSkill({
      name: "",
      exp: "",
      mandatory: false,
    });
  };
  //handle prerequisite value change
  const handlePrerequisiteValueChange = (e, index, key) => {
    setPrerequisiteSkills((prevSkills) => {
      let updatedSkills = [...prevSkills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        [key]:
          key === "exclude" || key === "mandatory"
            ? e.target.checked
            : e.target.value,
      };
      return updatedSkills;
    });
  };
  //handle prerequisite skill delete
  const handlePrerequisiteSkillDelete = (index) => {
    let skills = prerequisiteSkills.filter((skill, i) => {
      return i !== index;
    });
    setPrerequisiteSkills(skills);
  };

  /////////////////////////////////////////////////////////////////////////skills attainable/////////////////////////////////////////////////
  //handle add topic
  const handleAddTopic = (e) => {
    e.preventDefault();
    if (topics.name === "" && topics.duration === "") {
      showErrorToast("Please fill all required fields");
      return;
    }
    if (topics.name === "") {
      showErrorToast("Topic name is required");
      return;
    }
    if (topics.duration === "") {
      showErrorToast("Topic duration is required");
      return;
    }

    setCourseTopics([...courseTopics, topics]);
    setTopics({
      name: "",
      duration: "",
      phase: "Days",
    });
  };

  //handle topic value Change
  const handleCourseTopicValueChange = (e, index, key) => {
    setCourseTopics((prevTopics) => {
      let updatedTopics = [...prevTopics];
      updatedTopics[index] = { ...updatedTopics[index], [key]: e.target.value };
      return updatedTopics;
    });
  };

  //handle topic delete
  const handleCourseTopicDelete = (index) => {
    let topics = courseTopics.filter((topic, i) => {
      return i !== index;
    });
    setCourseTopics(topics);
  };

  //handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.name.match(/\.(jpg|jpeg|png|gif)$/)) {
        showErrorToast("Wrong image type");
        return;
      }

      if (file.size < 100000) {
        showErrorToast("image size is too small");
        return;
      }

      if (file.size > 5000000) {
        showErrorToast("image size is too large");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.name.match(/\.(pdf)$/)) {
        showErrorToast("Wrong file type");
        setIsFileError(true);
        return;
      }

      if (file.size < 100000) {
        showErrorToast("file size is too small");
        setIsFileError(true);
        return;
      }

      if (file.size > 5000000) {
        showErrorToast("file size is too large");
        setIsFileError(true);
        return;
      }

      setCoursePdf(file);
      setIsFileError(false);
      return;
    }
  };

  //////////////////////////////////////////////////////////////////////ignore this//////////////////////////////////////////////////////////////////////

  // const handleCourseSubmit =() => {
  // let isError = false;
  // //check course name and description
  // if (courseName === '' || courseDescription === '') {
  //   showErrorToast('please fill all required fields ')
  //   isError = true;
  //   return
  // }
  // //handle course name length
  // if (courseName.length < 4) {
  //   showErrorToast("Course Name should be greater than 4 char")
  //   isError = true;
  //   return
  // }

  // //handle empty skills and topics
  // if (prerequisiteSkills.length < 1 || courseTopics.length < 1) {
  //   showErrorToast("please add atleast 1 Prerequisite Skills / Course Topics")
  //   isError = true;
  //   return
  // }

  // //check if the topic name is empty
  // courseTopics.forEach(topic => {
  //   if (topic.name === "" || topic.duration === '') {
  //     showErrorToast("Please fill all the topic details");
  //     isError = true;
  //     return; // Break out of the forEach loop
  //   }
  // });

  // // check if skill name is empty
  // prerequisiteSkills.forEach(skill => {
  //   if (skill.name === "") {
  //     showErrorToast("Skill name is required");
  //     isError = true;
  //     return; // Break out of the forEach loop
  //   }
  // });

  // //if any of the above if condition is true then break the loop
  // if (isError) {
  //   return; // Break out of the entire handleSubmitMyCoursesData function
  // }

  // dispatch(addMyCourse({
  //   id: `64b2d00b-91a3-4b7e-86c3-d78412c437a9${Date.now()}`,
  //   courseName: courseName,
  //   prerequisiteSkills,
  //   courseDetails: {
  //     description: courseDescription,
  //     topics: courseTopics
  //   },
  //   "createdAt": `${new Date().getFullYear().toLocaleString()}- ${1 + +new Date().getMonth().toLocaleString()}-${new Date().getDate().toLocaleString()}`

  // }))

  // const newCourse = await PostApi('UserCourses', {
  //   userId: "USERD-2",
  //   courseName,
  //   dateCreated: Date.now(),
  //   courseDescription,
  //   mlanguage: JSON.stringify(selectedLanguages),
  //   status: courseStatus,
  //   continent: "Asia",
  //   region: "South Asia",
  //   country: "India",
  //   location: JSON.stringify(selectedLocations),
  //   price,
  //   courseStartingDate,
  //   durationNumber,
  //   durationPhase,
  //   prerequisiteSkills: JSON.stringify(prerequisiteSkills),
  //   skillsAttainable: JSON.stringify(courseTopics)
  // })

  // console.log({
  //   userId: "USERD-2",
  //   courseName,
  //   dateCreated: Date.now(),
  //   courseDescription,
  //   mlanguage: JSON.stringify(selectedLanguages),
  //   status: courseStatus,
  //   continent: "Asia",
  //   region: "South Asia",
  //   country: "India",
  //   location: JSON.stringify(selectedLocations),
  //   price,
  //   courseStartingDate,
  //   durationNumber,
  //   durationPhase,
  //   prerequisiteSkills: JSON.stringify(prerequisiteSkills),
  //   skillsAttainable: JSON.stringify(courseTopics)
  // });

  // const courseCredentials = {
  //         userId: "USERD-2",
  //   courseName,
  //   dateCreated: Date.now(),
  //   courseDescription,
  //   mlanguage: JSON.stringify(selectedLanguages),
  //   status: courseStatus,
  //   continent: "Asia",
  //   region: "South Asia",
  //   country: "India",
  //   location: JSON.stringify(selectedLocations),

  //   price,
  //   courseStartingDate,
  //   durationNumber,
  //   durationPhase,
  //   prerequisiteSkills: JSON.stringify(prerequisiteSkills),
  //   skillsAttainable: JSON.stringify(courseTopics)
  // }
  // const courseCredentials = {
  //   userId: "USERD-234",
  //   courseName: "CSS HSC",
  //   dateCreated: '1707197519030',
  //   courseDescription: "CSS3 has three module",
  //   mlanguage: "English",
  //   status: "on-going",
  //   continent: "Asia",
  //   region: "South Asia",
  //   country: "Indonesia",
  //   location: "Chennai",
  //   price: "15000",
  //   courseStartingDate: '1707197519030',
  //   durationNumber: "2",
  //   durationPhase: "yes",
  //   prerequisiteSkills: "C",
  //   skillsAttainable: "JAVA Script"
  // }
  // const courseCredentials = {
  //   "userId":"USERD-2",
  //   "courseName":"CSS",
  //   "dateCreated":"29/01/2023",
  //   "courseDescription":"CSS3 has three module",
  //   "mlanguage":"English",
  //   "status":"on-going",
  //   "continent":"Asia",
  //   "region":"South Asia",
  //   "country":"Indonesia",
  //   "location":"Chennai",
  //   "price":"15000",
  //   "courseStartingDate":"01/03/2022",
  //   "durationNumber":"2",
  //   "durationPhase":"yes",
  //   "prerequisiteSkills":"C",
  //   "skillsAttainable":"JAVA Script"
  // }

  // PostApi("UserCourses",{
  //   userId: "USERD-2",
  //   courseName: "CSS",
  //   dateCreated: "29/01/2023",
  //   courseDescription: "CSS3 has three module",
  //   mlanguage: "English",
  //   status: "on-going",
  //   continent: "Asia",
  //   region: "South Asia",
  //   country: "Indonesia",
  //   location: "Chennai",
  //   price: "15000",
  //   courseStartingDate: "29/01/2023",
  //   durationNumber: "2",
  //   durationPhase: "yes",
  //   prerequisiteSkills: "C",
  //   skillsAttainable: "JAVA Script"
  // }).then((res) => {
  //   console.log(res);
  // }).catch((err) => {
  //   console.log(err);
  //   showErrorToast("Something went wrong");
  // })

  // setCourseName("")
  // setCourseDescription('')
  // setCourseTopics([])
  // setPrerequisiteSkills([])
  // setSelectedImage(null)

  // }

  // ////////////////////////////////////////////////////////////////////ignore this//////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////// handle create new Course////////////////////////////////////

  const handleCourseSubmit = () => {
    PostApi("UserCourses", {
      userId: "USERD-5839",
      courseName: "Advance AWS",
      dateCreated: "01/01/2023",
      courseDescription: "Advance AWS has three module",
      mlanguage: "EN-US",
      status: "on-going",
      continent: "Asia",
      region: "South Asia",
      country: "Indonesia",
      location: "Chennai",
      price: "15000",
      courseStartingDate: "01/03/2022",
      durationNumber: "2",
      durationPhase: "months",
      prerequisiteSkills: "Webdesigning",
      skillsAttainable: "JAVA Script",
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        showErrorToast("Something went wrong");
      });
  };

  return (
    <>
      {/* Add skills attainable */}
      <div
        class="modal fade modal"
        style={{ marginTop: "50px" }}
        id="addtopic"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Add Topic
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div className="d-flex gap-2 flex-column ">
                <div class="mb-1">
                  <label for="exampleFormControlInput1" class="form-label">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    style={{ height: "32px" }}
                    id="exampleFormControlInput1"
                    value={topics.name}
                    onChange={(e) =>
                      setTopics({ ...topics, name: e.target.value })
                    }
                  />
                </div>
                <div class="mb-1">
                  <label for="exampleFormControlInput1" class="form-label">
                    Topic Duration
                  </label>
                  <div class="input-group ">
                    <input
                      type="number"
                      class="form-control"
                      style={{ height: "32px" }}
                      id="exampleFormControlInput1"
                      value={topics.duration}
                      onChange={(e) =>
                        setTopics({ ...topics, duration: e.target.value })
                      }
                    />
                    <select
                      class="form-select form-select-md"
                      style={{ height: "32px" }}
                      aria-label=".form-select-lg example"
                      onChange={(e) =>
                        setTopics({ ...topics, phase: e.target.value })
                      }
                    >
                      <option value="Hours">Hours</option>
                      <option value="Days" selected>
                        Days
                      </option>
                      <option value="Weeks">Weeks</option>
                      <option value="Months">Months</option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                </div>
                <div>
                  <SecondaryBtn
                    label={"Add"}
                    className="p-1"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                    }}
                    onClick={(e) => handleAddTopic(e)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Prerequisite Skill */}
      <div
        class="modal fade modal"
        id="addskill"
        style={{ marginTop: "50px" }}
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Add Prerequisite Skill
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              <div className="d-flex gap-5 ">
                <div class="mb-3">
                  <label for="exampleFormControlInput1" class="form-label">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    style={{ height: "32px" }}
                    id="exampleFormControlInput1"
                    value={skill.name}
                    onChange={(e) =>
                      setSkill({ ...skill, name: e.target.value })
                    }
                  />
                </div>

                <div class="mb-3 d-flex flex-column ">
                  <label for="exampleFormControlInput1" class="form-label">
                    Mandatory
                  </label>
                  <input
                    type="checkbox"
                    style={{ accentColor: "var(--primary-color)" }}
                    checked={skill.mandatory}
                    onChange={(e) =>
                      setSkill({ ...skill, mandatory: e.target.checked })
                    }
                  />
                </div>
                <div>
                  <SecondaryBtn
                    label={"Add"}
                    className="p-1"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                    }}
                    onClick={(e) => handleAddSkill(e)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* course name and buttons */}
      <div
        className="my-0 p-2 d-flex justify-content-between align-items-start gap-1 shadow"
        style={{
          position: "sticky",
          top: "0",
          backgroundColor: "white",
          zIndex: "100",
        }}
      >
        <h4
          className="p-0 m-0"
          style={{
            textDecoration: "underline",
            fontSize: "28px",
            position: "relative",
            top: "-5px",
          }}
        >
          New Course
        </h4>

        <div className="d-flex gap-2 align-items-start">
          <SecondaryBtn
            label={"Save"}
            className="px-2 py-2 rounded"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              border: "none",
            }}
            onClick={() => handleCourseSubmit()}
          >
            Add Course
          </SecondaryBtn>
          <SecondaryBtn
            label={"Cancel "}
            className="px-2 py-2 rounded"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              border: "none",
            }}
            onClick={() => navigate(`/skilling-agency/coursesearch`)}
          >
            Cancel
          </SecondaryBtn>
        </div>
      </div>

      {/* course Details */}
      <div class="accordion p-2" id="accordionPanelsStayOpenExample">
        <div class="mb-2 d-flex flex-column  ">
          <label for="exampleFormControlInput1" class="form-label fw-bold px-2">
            Course Name
          </label>
          <input
            type="text"
            class="form-control "
            id="exampleFormControlInput1"
            placeholder="enter course name"
            value={courseName}
            onChange={(e) => handleCourseNameChange(e)}
            onFocus={(e) => handleCourseNameFocus(e)}
          />
          {/* {
            suggestCourse &&
            <>
              <div style={{ position: 'relative' }}>
                <div class='rounded' style={{ position: 'absolute', zIndex: '10', backgroundColor: 'white', minHeight: 'fit-content', maxHeight: '250px', overflow: "scroll", width: "100%", border: suggestCourse.length > 0 ? '1px solid gray' : 'none' }} className=' rounded '>

                  <table class="mb-0 table table-hover">
                    <tbody>
                      {
                        suggestCourse.length > 0 &&
                        <tr>
                          <td className='d-flex justify-content-end mr-2' style={{ cursor: 'pointer' }} onClick={() => setSuggestCourse(false)}>X</td>
                        </tr>
                      }
                      {
                        suggestCourse.length > 0 &&
                        suggestCourse.map((course) => {
                          return (
                            <tr>
                              <td key={course.id} className='flex justify-items-start items-start gap-2 hover:bg-s-200  p-2  rounded-lg hover:bg-[#b9c498] cursor-pointer' onClick={() => handleSuggestCourseClick(course)}>{course.courseName}</td>

                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>

                </div>
              </div>
            </>
          } */}
        </div>

        <div class="accordion-item ">
          <h2 class="accordion-header ">
            <button
              class="accordion-button"
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
              Course Details
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseOne"
            class="accordion-collapse collapse show"
          >
            <div class="accordion-body px-2 py-2">
              <div class=" d-flex gap-3 flex-column  ">
                <div class="">
                  <label
                    for="exampleFormControlTextarea1 "
                    class="form-label fw-bold mb-0"
                  >
                    Description
                  </label>
                  <textarea
                    class="form-control"
                    id="exampleFormControlTextarea1"
                    rows="3"
                    placeholder="enter course description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                  ></textarea>
                </div>

                <div>
                  <label for="customFile" class="form-label fw-bold mb-0">
                    Choose Image
                  </label>
                  <input
                    type="file"
                    class=" form-control mb-2"
                    id="customFile"
                    style={{ display: "none" }}
                    onChange={(e) => handleImageChange(e)}
                  />
                  <div
                    style={{
                      height: "10rem",
                      aspectRatio: "4/5",
                      position: "relative",
                    }}
                  >
                    {selectedImage ? (
                      <>
                        <div
                          style={{
                            position: "absolute",
                            top: "5px",
                            right: "10px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setSelectedImage(null);
                          }}
                        >
                          <MdCancel />
                        </div>
                        <img
                          src={selectedImage}
                          style={{
                            objectFit: "cover",
                            height: "100%",
                            width: "100%",
                          }}
                          alt="..."
                          class="img-thumbnail"
                        ></img>
                      </>
                    ) : (
                      <label
                        for="customFile"
                        class="form-label d-flex justify-content-center align-items-center rounded"
                        style={{
                          cursor: "pointer",
                          height: "100%",
                          width: "100%",
                          backgroundColor: "#e5e5e5",
                        }}
                      >
                        <MdCloudUpload
                          style={{ cursor: "pointer", fontSize: "25px" }}
                        />
                      </label>
                    )}
                  </div>
                  <i className="mt-1 " style={{ fontSize: "13px" }}>
                    Note: Image should be in [{" "}
                    <span className="fw-semibold">jpg,jpeg,png,gif</span> ]
                    format &
                    <span className="ml-2">{` 100kb < Image < 5mb`}</span>
                  </i>
                </div>

                <div>
                  <label for="customFile" class="form-label fw-bold mb-0">
                    Attach Course PDF
                  </label>
                  <input
                    type="file"
                    class={`form-control mb-0 ${
                      isFileError ? "is-invalid" : ""
                    }`}
                    id="customFile"
                    onChange={(e) => handleAttachmentChange(e)}
                  />
                  {/* <input class="form-control" type="file" id="formFileMultiple" multiple  onChange={(e) => handleAttachmentChange(e)} /> */}
                  <i className="mt-1 " style={{ fontSize: "13px" }}>
                    Note: file should be in [{" "}
                    <span className="fw-semibold">pdf</span> ] format &
                    <span className="ml-2">{` 100kb < File < 5mb`}</span>
                  </i>
                </div>

                <div className="d-flex flex-column  ">
                  <div className="d-flex gap-3 ">
                    <label for="location" class="form-label fw-bold mb-0">
                      Location(s)
                    </label>
                    <div>
                      <input
                        type="checkbox"
                        id="remoteCheckbox"
                        className="mx-2"
                        checked={selectedLocations.find((obj) => {
                          return obj.label === "Remote";
                        })}
                        onChange={(e) => {
                          const isChecked = e.target.checked;

                          setSelectedLocations((prevLocation) => {
                            if (isChecked) {
                              const onlineLocation = {
                                label: "Remote",
                                value: "Remote",
                              };
                              return prevLocation.some(
                                (obj) => obj.label === "Remote"
                              )
                                ? prevLocation // Don't add "Online" if it already exists
                                : [...prevLocation, onlineLocation]; // Add "Online" if it doesn't exist
                            } else {
                              return prevLocation.filter(
                                (obj) => obj.label !== "Remote"
                              ); // Remove "Online"
                            }
                          });
                        }}
                      />
                      <label for="location" class="form-label fw-bold mb-0">
                        Remote
                      </label>
                    </div>
                  </div>
                  <div style={{}}>
                    <CreatableSelect
                      isMulti
                      
                      placeholder={"Add Language and Press Enter"}
                      components={components}
                      inputValue={locationInput}
                      onInputChange={(newValue) => setLocationInput(newValue)}
                      isClearable
                      menuIsOpen={false}
                      onChange={(newValue) => {
                        console.log(newValue);
                        setSelectedLocations(newValue);
                      }}
                      onKeyDown={(event) => {
                         if (LIMITED_SPL_CHARS.includes(event.key)) {
                              e.preventDefault();
                              showErrorToast(
                                contentLabel(
                                  "SpecialCharNotAllowed",
                                  "nf Special Characters Not Allowed"
                                )
                              );
                            }
                        if (event.key === "Enter" || event.key === "Tab") {
                          if (!locationInput) return;
                          let isAlreadyPresent = selectedLocations.find(
                            (obj) => {
                              return obj.label === locationInput;
                            }
                          );
                          if (isAlreadyPresent) {
                            showErrorToast(`${locationInput} is already there`);
                            return;
                          }
                          switch (event.key) {
                            case "Enter":
                            case "Tab":
                              setSelectedLocations((prev) => [
                                ...prev,
                                createOption(locationInput),
                              ]);
                              setLocationInput("");
                              event.preventDefault();
                          }
                        }
                      }}
                      value={selectedLocations}
                    />
                  </div>
                </div>

                <div className="d-flex flex-column">
                  <label for="location" class="form-label fw-bold mb-0">
                    Languages(s)
                  </label>
                  <div style={{}}>
                    <CreatableSelect
                      isMulti
                      placeholder={"Add Location and Press Enter"}
                      components={components}
                      inputValue={languageInput}
                      onInputChange={(newValue) => setLanguageInput(newValue)}
                      isClearable
                      menuIsOpen={false}
                      onChange={(newValue) => {
                        console.log(newValue);
                        setSelectedLanguages(newValue);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === "Tab") {
                          if (!languageInput) return;
                          let isAlreadyPresent = selectedLanguages.find(
                            (obj) => {
                              return obj.label === languageInput;
                            }
                          );
                          if (isAlreadyPresent) {
                            showErrorToast(`${languageInput} is already there`);
                            return;
                          }
                          switch (event.key) {
                            case "Enter":
                            case "Tab":
                              setSelectedLanguages((prev) => [
                                ...prev,
                                createOption(languageInput),
                              ]);
                              setLanguageInput("");
                              event.preventDefault();
                          }
                        }
                      }}
                      value={selectedLanguages}
                    />
                  </div>
                </div>

                <div className="m-0 p-0 w-50 ">
                  <label
                    for="exampleFormControlInput1"
                    class="form-label fw-bold m-0 p-0"
                  >
                    Starting Date
                  </label>
                  <input
                    type="date"
                    class="form-control "
                    id="exampleFormControlInput1"
                    value={courseStartingDate}
                    onChange={(e) => setCourseStatingDate(e.target.value)}
                  />
                </div>

                <div class="m-0 p-0 w-50">
                  <label
                    for="exampleFormControlInput1"
                    class="form-label fw-bold m-0 p-0 "
                  >
                    Course Duration
                  </label>
                  <div class="input-group ">
                    <input
                      type="number"
                      class="form-control"
                      id="exampleFormControlInput1"
                      value={durationNumber}
                      onChange={(e) => setDurationNumber(e.target.value)}
                    />
                    <select
                      class="form-select form-select-md"
                      aria-label=".form-select-lg example"
                      value={durationPhase}
                      onChange={(e) => setDurationPhase(e.target.value)}
                    >
                      <option value="Hours">Hours</option>
                      <option value="Days">Days</option>
                      <option value="Weeks">Weeks</option>
                      <option value="Months" selected>
                        Months
                      </option>
                      <option value="Years">Years</option>
                    </select>
                  </div>
                </div>

                <div className="m-0 p-0 ">
                  <label
                    for="exampleFormControlInput1"
                    class="form-label fw-bold m-0 p-0"
                  >
                    Course Price
                  </label>
                  <input
                    type="number"
                    class="form-control "
                    id="exampleFormControlInput1"
                    placeholder="Enter course price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div class="mb-3">
                  <label
                    for="exampleFormControlInput1"
                    class="form-label fw-bold m-0 p-0"
                  >
                    Course Status
                  </label>
                  <div class="input-group ">
                    <select
                      class="form-select form-select-md"
                      aria-label=".form-select-lg example"
                      value={courseStatus}
                      onChange={(e) => setCourseStatus(e.target.value)}
                    >
                      <option value="Not started" selected>
                        {" "}
                        Not started
                      </option>
                      <option value="On-going">On-going</option>
                      <option value="On-hold">On-hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button
              class="accordion-button "
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
              }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseThree"
              aria-expanded="true"
              aria-controls="panelsStayOpen-collapseThree"
            >
              Prerequisite Skills
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseThree"
            class="accordion-collapse collapse show"
          >
            <div class="accordion-body px-2 py-0">
              <div className="d-flex justify-content-end p-2">
                <button
                  className="btn py-1 px-2 m-0"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    fontSize: ".7rem",
                  }}
                  data-bs-toggle="modal"
                  data-bs-target="#addskill"
                >
                  Add Skill
                </button>
              </div>
              <table class="table ">
                <thead>
                  <tr>
                    <th className="p-1" scope="col">
                      #
                    </th>
                    <th className="p-1" scope="col">
                      Prerequisite Skills
                    </th>
                    <th className="p-1" scope="col">
                      Mandatory
                    </th>
                    <th className="p-1" scope="col">
                      Exclude (not)
                    </th>
                    <th className="p-1" scope="col">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody className=" divide-y ml-5  ">
                  {prerequisiteSkills.map((skill, index) => {
                    return (
                      <tr>
                        <td className="p-1" scope="row">
                          {index + 1}
                        </td>
                        <td className="p-1" scope="row">
                          {skill.name}
                        </td>
                        {skill.exclude ? (
                          <>
                            <td className="p-1" scope="row">
                              <FiMinus />
                            </td>
                            <td className="p-1" scope="row">
                              <input
                                type="checkbox"
                                style={{ accentColor: "var(--primary-color)" }}
                                checked={skill.exclude}
                                onChange={(e) =>
                                  handlePrerequisiteValueChange(
                                    e,
                                    index,
                                    "exclude"
                                  )
                                }
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-1" scope="row">
                              <input
                                type="checkbox"
                                style={{ accentColor: "var(--primary-color)" }}
                                checked={skill.mandatory}
                                onChange={(e) =>
                                  handlePrerequisiteValueChange(
                                    e,
                                    index,
                                    "mandatory"
                                  )
                                }
                              />
                            </td>
                            <td className="p-1" scope="row">
                              <input
                                type="checkbox"
                                style={{ accentColor: "var(--primary-color)" }}
                                checked={skill.exclude}
                                onChange={(e) =>
                                  handlePrerequisiteValueChange(
                                    e,
                                    index,
                                    "exclude"
                                  )
                                }
                              />
                            </td>
                          </>
                        )}
                        <td className="p-1" scope="row">
                          <MdDelete
                            style={{
                              color: "var(--primary-color)",
                              cursor: "pointer",
                            }}
                            onClick={() => handlePrerequisiteSkillDelete(index)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="accordion-item ">
          <h2 class="accordion-header ">
            <button
              class="accordion-button"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
              }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#panelsStayOpen-collapseTwo"
              aria-expanded="true"
              aria-controls="panelsStayOpen-collapseTwo"
            >
              Skills Attainable
            </button>
          </h2>
          <div
            id="panelsStayOpen-collapseTwo"
            class="accordion-collapse collapse show"
          >
            <div class="accordion-body px-2 py-0">
              <div className="d-flex justify-content-end p-2">
                <button
                  className="btn py-1 px-2 m-0"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    fontSize: ".7rem",
                  }}
                  data-bs-toggle="modal"
                  data-bs-target="#addtopic"
                >
                  Add Topic
                </button>
              </div>
              <table class="table">
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
                    <th className="p-1" scope="col">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {courseTopics.map((topic, index) => {
                    return (
                      <tr>
                        <td className="p-1" scope="col">
                          {index + 1}
                        </td>
                        <td className="p-1" scope="col">
                          {topic.name}
                        </td>
                        <td className="p-1" scope="col">
                          {topic.duration}
                          {topic.phase}
                        </td>
                        <td
                          className="p-1"
                          scope="col"
                          style={{
                            color: "var(--primary-color)",
                            cursor: "pointer",
                          }}
                        >
                          <MdDelete
                            onClick={() => handleCourseTopicDelete(index)}
                            className="text-[var(--primary-color)] cursor-pointer"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewCourse;
