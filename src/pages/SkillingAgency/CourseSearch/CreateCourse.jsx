import { getCookie } from '../../../config/cookieService';
import React, { useEffect, useRef, useState } from "react";

import { allCourses, premiumServicePrices } from "../SkillingAgencyConstants";
import { BASE_URL } from "../../../config/Properties";
import "../../AuthPages/forgotpassword.css";
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

import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { fetchUserCourses } from "../../../api/SkillingAgency/fetchUserCourses";
import Loader from "../../../components/Loader";
import SkillSuggestionApi from "../../../api/skillOwner/mySkill/SkillSuggestionApi";
import { useSelector } from "react-redux";
import axios from "axios";
import LocationSuggestionApi from "../../../api/locationApi/LocationSuggestionApi";
import GetAllLangApi from "../../../api/content/GetAllLangApi";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { LIMITED_SPL_CHARS } from "../../../config/constant";
const CreateCourse = () => {
  const headers = {
    Authorization: "Bearer " + getCookie("token"),
  };
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
  });
  const [createCourseLoading, setCreateCourseLoading] = useState(false);
  const selectedLanguage = useSelector((state) => state.language);

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
  const [filterLocation, setFilterLocation] = useState([]);

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    LocationSuggestionApi(
      locationInput,
      "city",
       getCookie("countryCode")
    )
      .then((res) => {
        const data = res.data;

        //eslint-disable-next-line
        setFilterLocation(
          data.map((item) => ({
            value: item.city,
            label: item.city,
            latitude: item.cityLatitude,
            longitude: item.cityLongitude,
          }))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, [sessionStorage.getItem("countryCode")]);
  const createOption = (label) => ({
    label,
    value: label,
  });

  // course languages

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState("");
  const [filterLanguage, setFilterLanguage] = useState([]);

  useEffect(() => {
    GetAllLangApi().then((res) => {
      const data = res.data;
      setFilterLanguage(
        data.map((item) => ({
          value: item.name,
          label: item.name,
        }))
      );
    });
  }, []);

  //course currency
  const [price, setPrice] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [filterCurrency, setFilterCurrency] = useState([]);
  useEffect(() => {
    setFilterCurrency(
      premiumServicePrices.map((item) => ({
        value: item.currency,
        label: item.currency,
      }))
    );
  }, []);

  //other fields
  const [courseStartingDate, setCourseStatingDate] = useState("");
  const [durationNumber, setDurationNumber] = useState("");
  const [durationPhase, setDurationPhase] = useState("Months");
  const [courseStatus, setCourseStatus] = useState("Not started");

  // console.log(selectedLanguages.map((lan)=>lan.value).join(", "));

  //prerequsite skills
  //Suggestions inside skill search
  const [SkillSuggestions, setSkillSuggestions] = useState([]);
  const [skillSuggestionsLoading, setSkillSuggestionsLoading] = useState(false);
  const [prerequisiteSkills, setPrerequisiteSkills] = useState([]); //for array
  const [skill, setSkill] = useState({
    //for modal
    skillId: "",
    isMandatory: "yes",
    mlanguage: "EN-US",
    userId:getCookie("userId"),
  });

  //skills Attainable
  const [courseTopics, setCourseTopics] = useState([]); //skills attainable array
  const [topics, setTopics] = useState({
    //for modal
    skillId: "",
    duration: "",
    // phase: 'Days'
    mlanguage: "EN-US",
    userId:getCookie("userId"),
  });

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
    if (skill.skillId === "") {
      showErrorToast("Skill name is required");
      return;
    }
    setPrerequisiteSkills([...prerequisiteSkills, { ...skill }]);
    setSkill({
      skillId: "",
      isMandatory: "yes",
      mlanguage: "EN-US",
      userId:getCookie("userId"),
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

  // auto suggestion for skill
  const handlePrerequsiteChangeSkill = async (e) => {
    const val = e.target.value;
    setSkill({ ...skill, skillId: e.target.value });

    // if value greater than 2 then query the database and get the suggestions
    if (val.length > 2) {
      setSkillSuggestions([]);
      SkillSuggestionApi(val, selectedLanguage, "skill").then((res) => {
        console.log(res.data);
        // check res data length if empty pass No suggestions found
        if (res.data.length === 0) {
          setSkillSuggestions([{ noSkills: "No suggestions found" }]);
        } else {
          setSkillSuggestions(res.data);
        }
      });
    } else {
      setSkillSuggestions([]);
    }
  };

  //To select data from autosuggestion
  const handlePrerequsiteSuggestionClick = (value) => {
    console.log(value);
    setPrerequisiteSkills([
      ...prerequisiteSkills,
      {
        skillId: value.skill,
        isMandatory: "yes",
        mlanguage: "EN-US",
        userId:getCookie("userId"),
      },
    ]);

    setSkill({
      skillId: "",
      isMandatory: "yes",
      mlanguage: "EN-US",
      userId:getCookie("userId"),
    });

    setSkillSuggestions([]);
  };

  /////////////////////////////////////////////////////////////////////////skills attainable/////////////////////////////////////////////////
  //handle add topic
  const handleAddTopic = (e) => {
    e.preventDefault();

    if (SkillSuggestions[0].noSkills) {
      showErrorToast("No suggestions found");
      return;
    }
    if (!SkillSuggestions[0].selected) {
      showErrorToast("Please select from suggestions");
      return;
    }
    if (topics.skillId === "" && topics.duration === "") {
      showErrorToast("Please fill all required fields");
      return;
    }
    if (topics.skillId === "") {
      showErrorToast("Topic name is required");
      return;
    }
    if (topics.duration === "") {
      showErrorToast("Topic duration is required");
      return;
    }

    setCourseTopics([...courseTopics, topics]);
    setTopics({
      skillId: "",
      duration: "",
      // phase: 'Days'
      mlanguage: "EN-US",
      userId:getCookie("userId"),
    });
  };

  const handleSkillAttainableChangeSkill = (e) => {
    const val = e.target.value;
    setTopics({ ...topics, skillId: e.target.value });

    // if value greater than 2 then query the database and get the suggestions
    if (val.length > 2) {
      setSkillSuggestions([]);
      SkillSuggestionApi(val, selectedLanguage, "skill").then((res) => {
        console.log(res.data);
        // check res data length if empty pass No suggestions found
        if (res.data.length === 0) {
          setSkillSuggestions([{ noSkills: "No suggestions found" }]);
        } else {
          setSkillSuggestions(res.data);
        }
      });
    } else {
      setSkillSuggestions([]);
    }
  };

  //To select data from autosuggestion
  const handleSkillsAttainableSuggestionClick = (value) => {
    console.log(value);
    // setCourseTopics([...courseTopics, {

    //   skillId: value.skill,
    //   duration: "",
    //   // phase: 'Days'
    //   mlanguage: "EN-US",
    //   userId:getCookie("userId")

    // }])

    setTopics({
      skillId: value.skill,
      duration: "",
      // phase: 'Days'
      mlanguage: "EN-US",
      userId:getCookie("userId"),
    });

    setSkillSuggestions([{ selected: true }]);
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

  function formatDate(date) {
    // Create a new Date object from the provided date string
    const formattedDate = date ? new Date(date) : new Date();

    // Get the individual components of the date (month, day, and year)
    const month = String(formattedDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(formattedDate.getDate()).padStart(2, "0");
    const year = formattedDate.getFullYear();

    // Return the formatted date string
    return `${month}/${day}/${year}`;
  }

  // const handleCourseSubmit = () => {
  //   setCreateCourseLoading(true)

  //   PostApi("UserCourses",
  //     {
  //       "userId":getCookie("userId"),
  //       "courseName": courseName,
  //       // "dateCreated":JSON.stringify(Date.now()),
  //       "dateCreated": formatDate(),
  //       "courseDescription": courseDescription,
  //       "mlanguage": selectedLanguages.map((lan) => lan.value).join(", "),
  //       "status": courseStatus,
  //       "continent": "Asia",
  //       "region": "South Asia",
  //       "country": "India",
  //       "location": selectedLocations.map((lan) => lan.value).join(", "),
  //       "price": price,
  //       // "courseStartingDate":new Date(courseStartingDate).getTime().toString(),
  //       "courseStartingDate": formatDate(courseStartingDate),
  //       "durationNumber": durationNumber,
  //       "durationPhase": durationPhase,
  //       "prerequisiteSkills": "NA",
  //       "skillsAttainable": "NA"
  //     }

  //   ).then((res) => {
  //     console.log(res);
  //     setSteps((prev) => {
  //       return { ...prev, step3: true }
  //     })
  //     dispatch(fetchUserCourses())
  //     setCreateCourseLoading(false)
  //   }).catch((err) => {
  //     console.log(err);
  //     showErrorToast("Something went wrong");
  //   })

  // }

  const handleCourseSubmit = async () => {
    setCreateCourseLoading(true);

    try {
      let course = await PostApi("UserCourses", {
        userId:getCookie("userId"),
        courseName: courseName,
        // "dateCreated":JSON.stringify(Date.now()),
        dateCreated: formatDate(),
        courseDescription: courseDescription,
        mlanguage: selectedLanguages.map((lan) => lan.value).join(", "),
        status: courseStatus,
        continent: "Asia",
        region: "South Asia",
        country: "India",
        location: selectedLocations.map((lan) => lan.value).join(", "),
        price: price,
        // "courseStartingDate":new Date(courseStartingDate).getTime().toString(),
        courseStartingDate: formatDate(courseStartingDate),
        durationNumber: durationNumber,
        durationPhase: durationPhase,
        prerequisiteSkills: "NA",
        skillsAttainable: "NA",
      });
      console.log(course);
      let courseId = course.data.id;

      prerequisiteSkills?.forEach((skill) => {
        skill["userCourseId"] = courseId;
      });
      courseTopics?.forEach((skill) => {
        skill["userCourseId"] = courseId;
      });

      let prerequsite = await axios.put(
        `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20Prerequisite?authToken=${getCookie("token")}`,
        prerequisiteSkills,
        { headers }
      );
      console.log(prerequsite);
      let skillsAttainable = await axios.put(
        `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20SkillsAttainable?authToken=${getCookie("token")}`,
        courseTopics,
        { headers }
      );
      console.log(skillsAttainable);

      setSteps((prev) => {
        return { ...prev, step3: true };
      });
      dispatch(fetchUserCourses());
      setCreateCourseLoading(false);
    } catch (error) {
      console.log(error);
      showErrorToast("something went wrong");
      setCreateCourseLoading(false);
    }
  };

  if (createCourseLoading) {
    return <Loader />;
  }

  return (
    <div>
      {/* <div className='my-0 p-2 d-flex justify-content-between align-items-start gap-1 shadow' style={{ position: 'sticky', top: '0', backgroundColor: 'white', zIndex: '100' }}>
        <h4 className='p-0 m-0' style={{ textDecoration: 'underline', fontSize: '28px', position: 'relative', top: '-5px' }}>
          New Course
        </h4>
        <div className='d-flex gap-2 align-items-start'>
          <SecondaryBtn label={'Cancel '} className='px-2 py-2 rounded' style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }} onClick={() => navigate(`/skilling-agency/coursesearch`)}>Cancel</SecondaryBtn>
        </div>
      </div> */}

      <div
        class="col-lg-12  mx-auto mb-3 m-0 shadow p-2"
        style={{
          position: "sticky",
          top: "0",
          backgroundColor: "white",
          zIndex: "100",
        }}
      >
        <div class="progress-track">
          <ul id="progressbar" className="m-0">
            <li class="step0 active" id="step1"></li>
            <li
              class={`step0 ${steps.step1 ? "active" : ""}  text-right `}
              id="step2"
            ></li>
            <li
              class={`step0 ${steps.step2 ? "active" : ""}  text-right`}
              id="step3"
            ></li>
            <li
              class={`step0 ${steps.step3 ? "active" : ""}  text-right`}
              id="step4"
            ></li>
          </ul>
        </div>
        <div
          class="d-flex justify-content-between"
          style={{
            marginInline: "7rem",
            fontSize: "13px",
            color: "var(--primary-color)",
          }}
        >
          <div className="fw-bold">Course Details</div>
          <div className="fw-bold">Prerequsite Skills</div>
          <div className="fw-bold">Skills Attainable</div>
          <div className="fw-bold">Success</div>
        </div>
      </div>

      <div className="my-0  d-flex justify-content-between align-items-start gap-1 px-2">
        <h4
          className="p-0 m-0 fw-bold"
          style={{
            fontSize: "28px",
            position: "relative",
            top: "-5px",
            color: "var(--primary-color)",
          }}
        >
          {steps.step1 && steps.step2 && steps.step3
            ? "Successfull !!"
            : steps.step1
            ? courseName
            : "Create course"}
        </h4>
        <div className="d-flex gap-2 align-items-start">
          {steps.step1 && steps.step2 && steps.step3 ? (
            <button
              class="btn btn-success send btn-sm px-2 d-flex justify-content-center align-items-center gap-2 "
              onClick={() => {}}
            >
              View Course
              <FaAngleDoubleRight />
            </button>
          ) : (
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
          )}
        </div>
      </div>

      <div class="p-2">
        {/* course Details */}
        {!steps.step1 && (
          <div class=" d-flex gap-3 flex-column  ">
            <div class="">
              <label
                for="exampleFormControlInput1"
                class="form-label fw-bold mb-0"
              >
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
            </div>

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
                <span className="fw-semibold">jpg,jpeg,png,gif</span> ] format &
                <span className="ml-2">{` 100kb < Image < 5mb`}</span>
              </i>
            </div>

            <div>
              <label for="customFile" class="form-label fw-bold mb-0">
                Attach Course PDF
              </label>
              <input
                type="file"
                class={`form-control mb-0 ${isFileError ? "is-invalid" : ""}`}
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
                  placeholder={"Add Location"}
                  options={filterLocation}
                  components={components}
                  inputValue={locationInput}
                  onInputChange={(newValue) => setLocationInput(newValue)}
                  isClearable
                  isValidNewOption={() => false}
                  // menuIsOpen={false}
                  onChange={(newValue) => {
                    console.log(newValue);
                    setSelectedLocations(newValue);
                  }}
                  // onKeyDown={(event) => {

                  //   if (event.key === 'Enter' || event.key === 'Tab') {

                  //     if (!locationInput) return;
                  //     let isAlreadyPresent = selectedLocations.find((obj) => {
                  //       return obj.label === locationInput
                  //     })
                  //     if (isAlreadyPresent) {
                  //       showErrorToast(`${locationInput} is already there`)
                  //       return
                  //     }
                  //     switch (event.key) {
                  //       case 'Enter':
                  //       case 'Tab':
                  //         setSelectedLocations((prev) => [...prev, createOption(locationInput)]);
                  //         setLocationInput('');
                  //         event.preventDefault();
                  //     }
                  //   }
                  // }}
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
                  placeholder={"Add Language"}
                  options={filterLanguage}
                  components={components}
                  isValidNewOption={() => false}
                  inputValue={languageInput}
                  onInputChange={(newValue) => setLanguageInput(newValue)}
                  isClearable
                  // menuIsOpen={false}
                  onChange={(newValue) => {
                    console.log(newValue);
                    setSelectedLanguages(newValue);
                  }}
                  // onKeyDown={(event) => {

                  //   if (event.key === 'Enter' || event.key === 'Tab') {

                  //     if (!languageInput) return;
                  //     let isAlreadyPresent = selectedLanguages.find((obj) => {
                  //       return obj.label === languageInput
                  //     })
                  //     if (isAlreadyPresent) {
                  //       showErrorToast(`${languageInput} is already there`)
                  //       return
                  //     }
                  //     switch (event.key) {
                  //       case 'Enter':
                  //       case 'Tab':
                  //         setSelectedLanguages((prev) => [...prev, createOption(languageInput)]);
                  //         setLanguageInput('');
                  //         event.preventDefault();
                  //     }
                  //   }
                  // }}
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
                onChange={(e) => {
                  setCourseStatingDate(e.target.value);
                  console.log(e.target.value);
                }}
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
                  placeholder="Enter course duration"
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

            <div className="m-0 p-0 w-50">
              <label
                for="exampleFormControlInput1"
                class="form-label fw-bold m-0 p-0"
              >
                Course Price
              </label>
              <div class="input-group ">
                <input
                  type="number"
                  class="form-control"
                  style={{ width: "3rem" }}
                  id="exampleFormControlInput1"
                  placeholder="Enter course price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
                <CreatableSelect
                  isClearable
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
                  options={filterCurrency}
                  placeholder={"Currency"}
                  isValidNewOption={() => false}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      // borderColor: state.onFocus ? 'black' : '',
                      // border: "1px solid gray",

                      width: "10rem",
                    }),
                  }}
                  onChange={(newValue) => {
                    console.log(newValue);
                    setCurrencyInput(newValue);
                  }}
                />
              </div>
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

            <div class=" d-flex justify-content-between gap-2 ">
              {/* <button class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 " onClick={() => {
                setSteps((prev) => {
                  return { ...prev, step1: false }
                })
                showSuccessToast('Course details added successfully')
              }} >Back <FaAngleDoubleRight /> </button> */}
              <div></div>
              <button
                class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  setSteps((prev) => {
                    return { ...prev, step1: true };
                  });
                }}
              >
                Next <FaAngleDoubleRight />{" "}
              </button>
            </div>
          </div>
        )}

        {steps.step1 && !steps.step2 && (
          <div className="">
            <div className="d-flex gap-3  justify-content-center align-items-center">
              <div class="mb-3 w-75" style={{ position: "relative" }}>
                <label for="exampleFormControlInput1" class="form-label">
                  Skill Name
                </label>
                <input
                  type="text"
                  class="form-control w-100"
                  style={{ height: "32px" }}
                  id="exampleFormControlInput1"
                  value={skill.skillId}
                  onChange={(e) => {
                    handlePrerequsiteChangeSkill(e);
                  }}
                />
                {/* skill suggestion  dropdown*/}

                <>
                  {skill.skillId.length > 2 && SkillSuggestions.length > 1 && (
                    <div
                      className="dropdown-menu table-responsive d-flex font-5 my-0 py-0 shadow "
                      style={{
                        maxHeight: "150px",
                        position: "absolute",
                        zIndex: 999,
                        width: "100%",
                      }}
                    >
                      <table
                        className="table table-sm d-flex table-hover px-0 mx-1 py-0 w-100"
                        style={{ width: "100%" }}
                      >
                        <tbody className="font-5 w-100">
                          {SkillSuggestions.map((suggestion, index) => (
                            <tr
                              key={index}
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                handlePrerequsiteSuggestionClick(suggestion)
                              }
                            >
                              <td>
                                <span>{suggestion.skill}</span> ||{" "}
                                <span>{suggestion.occupation}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {skill.skillId.length > 2 && SkillSuggestions.length < 1 && (
                    <div
                      className=" d-flex font-5 my-0 py-0 shadow "
                      style={{
                        height: "150px",
                        position: "absolute",
                        zIndex: 999,
                        width: "100%",
                        backgroundColor: "white",
                      }}
                    >
                      <div
                        class="d-flex justify-content-center align-items-center"
                        style={{ height: "100%", width: "100%" }}
                      >
                        <div
                          class="spinner-border"
                          style={{ width: "2rem", height: "2rem" }}
                          role="status"
                        >
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {skill.skillId.length > 2 &&
                    SkillSuggestions.length === 1 && (
                      <div
                        className=" d-flex font-5 my-0 py-0 shadow "
                        style={{
                          height: "150px",
                          position: "absolute",
                          zIndex: 999,
                          width: "100%",
                          backgroundColor: "white",
                        }}
                      >
                        <div
                          class="d-flex justify-content-center align-items-center"
                          style={{ height: "100%", width: "100%" }}
                        >
                          <h5 style={{ color: "gray" }}>
                            {SkillSuggestions[0].noSkills}
                          </h5>
                        </div>
                      </div>
                    )}
                </>
              </div>

              {/* <div class="mb-3 d-flex flex-column ">
                  <label for="exampleFormControlInput1" class="form-label">Mandatory</label>
                  <input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.mandatory} onChange={e => setSkill({ ...skill, mandatory: e.target.checked })} />
                </div> */}
              <div>
                {/* <SecondaryBtn label={'Add'} className='p-1' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={(e) => handleAddSkill(e)} /> */}
              </div>
            </div>
            <div style={{ minHeight: "25rem" }}>
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
                          {skill.skillId}
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

            <div class=" d-flex justify-content-between gap-2 ">
              {/* <button class="btn btn-success btn-sm fw-bold " style={{ backgroundColor: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>Cancel</button> */}
              <button
                class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  setSteps((prev) => {
                    return { ...prev, step1: false };
                  });
                }}
              >
                <FaAngleDoubleLeft /> Back{" "}
              </button>
              <button
                class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  setSteps((prev) => {
                    return { ...prev, step2: true };
                  });
                }}
              >
                Next <FaAngleDoubleRight />{" "}
              </button>
            </div>
          </div>
        )}

        {steps.step1 && steps.step2 && !steps.step3 && (
          <div className="">
            <div className="d-flex gap-3 justify-content-center align-items-center mb-2">
              <div class="mb-1 w-50" style={{ position: "relative" }}>
                <label for="exampleFormControlInput1" class="form-label">
                  Skills/Topic Name
                </label>
                <input
                  type="text"
                  class="form-control "
                  style={{ height: "32px" }}
                  id="exampleFormControlInput1"
                  value={topics.skillId}
                  onChange={(e) => handleSkillAttainableChangeSkill(e)}
                />
                <>
                  {topics.skillId.length > 2 && SkillSuggestions.length > 1 && (
                    <div
                      className="dropdown-menu table-responsive d-flex font-5 my-0 py-0 shadow "
                      style={{
                        maxHeight: "150px",
                        position: "absolute",
                        zIndex: 999,
                        width: "100%",
                      }}
                    >
                      <table
                        className="table table-sm d-flex table-hover px-0 mx-1 py-0 w-100"
                        style={{ width: "100%" }}
                      >
                        <tbody className="font-5 w-100">
                          {SkillSuggestions.map((suggestion, index) => (
                            <tr
                              key={index}
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                handleSkillsAttainableSuggestionClick(
                                  suggestion
                                )
                              }
                            >
                              <td>
                                <span>{suggestion.skill}</span> ||{" "}
                                <span>{suggestion.occupation}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {topics.skillId.length > 2 && SkillSuggestions.length < 1 && (
                    <div
                      className=" d-flex font-5 my-0 py-0 shadow "
                      style={{
                        height: "150px",
                        position: "absolute",
                        zIndex: 999,
                        width: "100%",
                        backgroundColor: "white",
                      }}
                    >
                      <div
                        class="d-flex justify-content-center align-items-center"
                        style={{ height: "100%", width: "100%" }}
                      >
                        <div
                          class="spinner-border"
                          style={{ width: "2rem", height: "2rem" }}
                          role="status"
                        >
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {topics.skillId.length > 2 &&
                    SkillSuggestions.length === 1 &&
                    SkillSuggestions[0].noSkills && (
                      <div
                        className=" d-flex font-5 my-0 py-0 shadow "
                        style={{
                          height: "150px",
                          position: "absolute",
                          zIndex: 999,
                          width: "100%",
                          backgroundColor: "white",
                        }}
                      >
                        <div
                          class="d-flex justify-content-center align-items-center"
                          style={{ height: "100%", width: "100%" }}
                        >
                          <h5 style={{ color: "gray" }}>
                            {SkillSuggestions[0].noSkills}
                          </h5>
                        </div>
                      </div>
                    )}
                  {topics.skillId.length > 2 &&
                    SkillSuggestions.length === 1 &&
                    SkillSuggestions[0].selected && <></>}
                </>
              </div>
              <div class="mb-1 w-25">
                <label for="exampleFormControlInput1" class="form-label">
                  Skills/Topic Duration
                </label>
                <div class="input-group ">
                  <input
                    type="number"
                    class="form-control"
                    style={{ height: "32px", width: "5rem" }}
                    id="exampleFormControlInput1"
                    value={topics.duration}
                    onChange={(e) =>
                      setTopics({ ...topics, duration: e.target.value })
                    }
                  />
                  <select
                    disabled
                    class="form-select form-select-md"
                    style={{ height: "32px", width: "6rem" }}
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

            <div style={{ minHeight: "25rem" }}>
              <table class="table">
                <thead>
                  <tr>
                    <th className="p-1" scope="col">
                      #
                    </th>
                    <th className="p-1" scope="col">
                      Skills/Topic
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
                          {topic.skillId}
                        </td>
                        <td className="p-1" scope="col">
                          {topic.duration}
                          {topic.phase}--NA
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

            <div class=" d-flex justify-content-between gap-2 ">
              <button
                class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  setSteps((prev) => {
                    return { ...prev, step2: false };
                  });
                }}
              >
                <FaAngleDoubleLeft /> Back{" "}
              </button>
              <button
                class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  handleCourseSubmit();
                }}
              >
                Next <FaAngleDoubleRight />{" "}
              </button>
            </div>
          </div>
        )}

        {/* {
          steps.step1 && steps.step2 && !steps.step3 &&
          <div className=''>
            <div className='d-flex gap-3 justify-content-center align-items-center mb-2'>
              <div class="mb-1 w-50" style={{position:'relative'}}>
                <label for="exampleFormControlInput1" class="form-label">Skills/Topic Name</label>
                <input type="text" class="form-control " style={{ height: "32px" }} id="exampleFormControlInput1" value={topics.skillId} onChange={e => handleSkillAttainableChangeSkill(e) } />
                <>
                  {topics.skillId.length > 2 && SkillSuggestions.length > 1 && (
                    <div className='dropdown-menu table-responsive d-flex font-5 my-0 py-0 shadow ' style={{
                      maxHeight: "150px",
                      position: "absolute",
                      zIndex: 999,
                      width: '100%'
                    }}>
                      <table className='table table-sm d-flex table-hover px-0 mx-1 py-0 w-100' style={{ width: "100%" }}>
                        <tbody className='font-5 w-100'>
                          {SkillSuggestions.map((suggestion, index) => (
                            <tr key={index} style={{ cursor: 'pointer' }} onClick={() => handleSkillsAttainableSuggestionClick(suggestion)} >
                              <td>
                                <span>{suggestion.skill}</span> || <span>{suggestion.occupation}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {topics.skillId.length > 2 && SkillSuggestions.length < 1 && (
                    <div className=' d-flex font-5 my-0 py-0 shadow ' style={{
                      height: "150px",
                      position: "absolute",
                      zIndex: 999,
                      width: '100%',
                      backgroundColor: 'white'
                    }}>
                      <div class="d-flex justify-content-center align-items-center" style={{ height: "100%", width: '100%' }}>
                        <div class="spinner-border" style={{ width: "2rem", height: "2rem" }} role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {topics.skillId.length > 2 && SkillSuggestions.length === 1 && (
                    <div className=' d-flex font-5 my-0 py-0 shadow ' style={{
                      height: "150px",
                      position: "absolute",
                      zIndex: 999,
                      width: '100%',
                      backgroundColor: 'white'
                    }}>
                      <div class="d-flex justify-content-center align-items-center" style={{ height: "100%", width: '100%' }}>
                        <h5 style={{color:'gray'}}>No suggestions found</h5>
                      </div>
                    </div>
                  )}
                </>
              </div>
              <div class="mb-1 w-25">
                <label for="exampleFormControlInput1" class="form-label">Skills/Topic Duration</label>
                <div class="input-group ">
                  <input type="number" class="form-control" style={{ height: "32px", width: '5rem' }} id="exampleFormControlInput1" value={topics.duration} onChange={e => setTopics({ ...topics, duration: e.target.value })} />
                  <select disabled class="form-select form-select-md" style={{ height: "32px", width: '6rem' }} aria-label=".form-select-lg example" onChange={e => setTopics({ ...topics, phase: e.target.value })}>
                    <option value="Hours">Hours</option>
                    <option value="Days" selected>Days</option>
                    <option value="Weeks">Weeks</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <SecondaryBtn label={'Add'} className='p-1' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={(e) => handleAddTopic(e)} />
              </div>
            </div>

            <div style={{ minHeight: '25rem' }}>
              <table class="table">
                <thead>
                  <tr>
                    <th className='p-1' scope="col">#</th>
                    <th className='p-1' scope="col">Skills/Topic</th>
                    <th className='p-1' scope="col">Duration</th>
                    <th className='p-1' scope="col">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    courseTopics.map((topic, index) => {
                      return (
                        <tr>
                          <td className='p-1' scope="col">{index + 1}</td>
                          <td className='p-1' scope="col">{topic.skillId}</td>
                          <td className='p-1' scope="col">
                          <div class="input-group ">
                  <input type="number" class="form-control" style={{ height: "32px", width: '0rem' }} id="exampleFormControlInput1" value={topics.duration} onChange={e => setTopics({ ...topics, duration: e.target.value })} />
                  <select disabled class="form-select form-select-md" style={{ height: "32px",  }} aria-label=".form-select-lg example" onChange={e => setTopics({ ...topics, phase: e.target.value })}>
                    <option value="Hours">Hours</option>
                    <option value="Days" selected>Days</option>
                    <option value="Weeks">Weeks</option>
                    <option value="Months">Months</option>
                    <option value="Years">Years</option>
                  </select>
                </div>
                          </td>
                          <td className='p-1' scope="col" style={{ color: 'var(--primary-color)', cursor: 'pointer' }}><MdDelete onClick={() => handleCourseTopicDelete(index)} className='text-[var(--primary-color)] cursor-pointer' /></td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>

            <div class=" d-flex justify-content-between gap-2 ">
           
              <button class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 " onClick={() => {
                setSteps((prev) => {
                  return { ...prev, step2: false }
                })

              }} ><FaAngleDoubleLeft /> Back  </button>
              <button class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 " onClick={() => {

                handleCourseSubmit()

              }} >Next <FaAngleDoubleRight /> </button>
            </div>
          </div>
        } */}

        {steps.step1 && steps.step2 && steps.step3 && (
          <div className="" style={{ height: "30rem" }}>
            <img
              src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1707675280/4529819_laowir.png"
              alt=""
              className="h-100 w-100"
              style={{ objectFit: "contain" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCourse;
