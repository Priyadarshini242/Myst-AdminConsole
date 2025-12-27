import { getCookie } from '../../../config/cookieService';
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../config/Properties";

import { allCourses } from "../SkillingAgencyConstants";

import { MdCancel, MdCloudUpload, MdDelete } from "react-icons/md";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { FiPlus, FiMinus } from "react-icons/fi";
import { useDispatch } from "react-redux";
import {
  addMyCourse,
  editMyCourse,
} from "../../../reducer/SkillingAgency/features/course/mycourse/myCourseSlice";
import Loader from "../../../components/Loader";

import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import EditApi from "../../../api/editData/EditApi";
import { fetchUserCourses } from "../../../api/SkillingAgency/fetchUserCourses";
import PostApi from "../../../api/PostData/PostApi";
import axios from "axios";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { LIMITED_SPL_CHARS } from "../../../config/constant";

const EditCourse = () => {
  const headers = {
    Authorization: "Bearer " + getCookie("token"),
  };
  const [editCourseLoading, setEditCourseLoading] = useState(false);
  const myCourses = useSelector((state) => state.myCourse.value);
  const { data, status, error } = useSelector((state) => state.userCourses);
  const dispatch = useDispatch();

  //personal hooks
  const [createCourseLoading, setCreateCourseLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [prerequsiteSkills, setPrerequisiteSkills] = useState([]);
  const [prerequsiteLoading, setPrerequsiteLoading] = useState(false);
  const [skillsAttainable, setSkillsAttainable] = useState([]);
  const [skillsAttainableLoading, setSkillsAttainableLoading] = useState(false);
  const [addSkill, setAddSkill] = useState(false);
  const [addTopics, setAddTopics] = useState(false);
  const [skill, setSkill] = useState({
    userCourseId: id,
    skillId: "",
    isMandatory: "Yes",
    exclude: "No",
    mlanguage: "EN-US",
    userId:getCookie("userId"),
  });
  const [topics, setTopics] = useState({
    userCourseId: id,
    skillId: "",
    duration: "",
    durationPhase: "Days",
    mlanguage: "EN-US",
    userId:getCookie("userId"),
  });

  const fetchUserCoursePrerequsites = async () => {
    setPrerequsiteLoading(true);
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${BASE_URL}/skill/api/v1/skills/courses/UserCourse%20Prerequisite?authToken=${token}&searchFieldName=userCourseId&searchValue=${id}`
      );
      const data = await response.json();
      setPrerequisiteSkills(data);
      console.log(data);
      setPrerequsiteLoading(false);
    } catch (error) {
      showErrorToast("something went wrong");
      setPrerequsiteLoading(false);
      throw error;
    }
  };

  const fetchUserCourseSkillsAttainable = async () => {
    setSkillsAttainableLoading(true);
    try {
      const token = getCookie("token");
      const response = await fetch(
        `${BASE_URL}/skill/api/v1/skills/courses/UserCourse%20SkillsAttainable?authToken=${token}&searchFieldName=userCourseId&searchValue=${id}`
      );
      const data = await response.json();
      setSkillsAttainable(data);
      console.log(data);
      setSkillsAttainableLoading(false);
    } catch (error) {
      showErrorToast("something went wrong");
      setSkillsAttainableLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    let course = data.find((course) => id == course.id);
    if (course) {
      setSelectedCourse(course);
      console.log("selcted", course);

      setCourseStatingDate(course.courseStartingDate);

      let languages = course?.mlanguage?.split(",").map((lan) => {
        return { label: lan, value: lan };
      });
      setSelectedLanguages(languages);

      let locations = course?.location?.split(",").map((loc) => {
        return { label: loc, value: loc };
      });
      setSelectedLocations(locations);

      fetchUserCoursePrerequsites();
      fetchUserCourseSkillsAttainable();
    }
  }, [id, status]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [coursePdf, setCoursePdf] = useState(null);

  const [courseStartingDate, setCourseStatingDate] = useState("");

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState("");

  // const [courseStartingDate, setCourseStatingDate] = useState('');

  const [isFileError, setIsFileError] = useState(false);

  console.log("alldatais", selectedCourse);

  //handle prerequisite value chnage
  const handlePrerequisiteValueChange = (e, index, key) => {
    setSelectedCourse((prevCourse) => {
      const updatedSkills = [...prevCourse.prerequisiteSkills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        [key]:
          key === "exclude" || key === "mandatory"
            ? e.target.checked
            : e.target.value,
      };
      return {
        ...prevCourse,
        prerequisiteSkills: updatedSkills,
      };
    });
  };

  // //handle course details value change
  // const handleCourseNameChange = (e) => {
  //     setSelectedCourse((prevCourse) => {
  //         return {
  //             ...prevCourse,
  //             courseName: e.target.value
  //         }
  //     })

  // }
  // const handleCourseDescriptionChange = (e) => {
  //     setSelectedCourse((prevCourse) => {
  //         return {
  //             ...prevCourse,
  //             courseDetails: { ...prevCourse.courseDetails, 'description': e.target.value },
  //         }
  //     })

  // }

  // const handleCourseDetailsValueChange = (e, index, key) => {
  //     if (key === 'description') {
  //        setSelectedCourse((prevCourse) => {
  //             return {
  //                 ...prevCourse,
  //                 courseDetails: { ...prevCourse.courseDetails, 'description': e.target.value },
  //             }
  //         })
  //     } else {
  //         setSelectedCourse((prevCourse) => {
  //             const updatedTopics = [...prevCourse.courseDetails.topics];
  //             updatedTopics[index] = { ...updatedTopics[index], [key]: e.target.value };

  //             return {
  //                 ...prevCourse,
  //                 courseDetails: { ...prevCourse.courseDetails, 'topics': updatedTopics },
  //             }
  //         })
  //     }
  // }

  //handle add additional data in prerequisite skills
  const handleAddSkill = () => {
    if (skill.skillId === "") {
      showErrorToast("please fill the all required fields");
      return;
    }
    setPrerequisiteSkills((prev) => [...prev, skill]);
    setSkill({
      userCourseId: id,
      skillId: "",
      isMandatory: "yes",
      mlanguage: "EN-US",
      userId:getCookie("userId"),
    });
    setAddSkill(false);
  };

  //handle add additional data in course details topics
  const handleAddTopic = () => {
    if (topics.skillId === "" || topics.duration === "") {
      showErrorToast("please fill the all required fields");
      return;
    }
    setSkillsAttainable((prev) => [...prev, topics]);
    setTopics({
      userCourseId: id,
      skillId: "",
      duration: "",
      // phase: 'Days'
      mlanguage: "EN-US",
      userId:getCookie("userId"),
    });
    setAddTopics(false);
  };

  //handle delete prerequisite skills
  const handlePrerequisiteSkillDelete = (index) => {
    let skills = prerequsiteSkills.filter((skill, i) => {
      return i !== index;
    });
    setPrerequisiteSkills(skills);
  };

  //handle delete Topics
  const handleCourseTopicDelete = (index) => {
    let topics = skillsAttainable.filter((topic, i) => {
      return i !== index;
    });
    setSkillsAttainable(topics);
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

  const components = {
    DropdownIndicator: null,
  };

  const createOption = (label) => ({
    label,
    value: label,
  });

  ////////////////////////////////////////HANDLE SUBMIT///////////////////////////////////
  // const handleSubmitMyCoursesData = () => {
  //     let isError = false;

  //     if (selectedCourse.courseName === "") {
  //         toast.error("Please fill the course name");
  //         isError = true;
  //     }
  //     if (selectedCourse.courseDetails.description === "") {
  //         toast.error("Please fill the course description");
  //         isError = true;
  //     }

  //     selectedCourse.courseDetails.topics?.forEach(topic => {
  //         if (topic.name === "" || topic.duration === '') {
  //             toast.error("Please fill all the topic details");
  //             isError = true;
  //             return; // Break out of the forEach loop
  //         }
  //     });

  //     selectedCourse.prerequisiteSkills?.forEach(skill => {
  //         if (skill.name === "") {
  //             toast.error("Please fill the prerequisite skill name");
  //             isError = true;
  //             return; // Break out of the forEach loop
  //         }
  //     });

  //     if (isError) {
  //         return; // Break out of the entire handleSubmitMyCoursesData function
  //     }

  //     setMyCoursesData((prevCourses) => {
  //         return prevCourses.map((course, index) => {
  //             if (course.id === selectedCourse.id) {
  //                 // Replace the INDEX object with the updated one
  //                 return selectedCourse;
  //             }
  //             // Keep other objects unchanged
  //             return course;
  //         });
  //     })
  //     setEditMyCoursesData(false)
  // }

  // const handleSaveAS=()=>{
  //     let course = myCourses.find((course) => id == course.id)
  //     if(course.courseName === selectedCourse.courseName){
  //         showErrorToast('Course Name Should be different from existing course')
  //         return
  //     }
  // }

  function convertTimestampToDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

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

  const handleSaveCourse = async () => {
    // let isError = false;

    // if (selectedCourse.courseName === "") {
    //     showErrorToast("Please fill the course name");
    //     isError = true;
    // }
    // if (selectedCourse.courseDetails.description === "") {
    //     showErrorToast("Please fill the course description");
    //     isError = true;
    // }

    // selectedCourse.courseDetails.topics?.forEach(topic => {
    //     if (topic.name === "" || topic.duration === '') {
    //         showErrorToast("Please fill all the topic details");
    //         isError = true;
    //         return; // Break out of the forEach loop
    //     }
    // });

    // selectedCourse.prerequisiteSkills?.forEach(skill => {
    //     if (skill.name === "") {
    //         showErrorToast("Please fill the prerequisite skill name");
    //         isError = true;
    //         return; // Break out of the forEach loop
    //     }
    // });

    // if (isError) {
    //     return; // Break out of the entire handleSubmitMyCoursesData function
    // }

    // dispatch(editMyCourse(selectedCourse))

    // navigate(`/skilling-agency/coursesearch/coursepreview/${id}`)

    // EditApi('UserCourses','USRCR-175173',{
    //     courseName:"JS Advance",
    // }).then((res) => {
    //     console.log(res);
    //     dispatch(fetchUserCourses())
    //     navigate(`/skilling-agency/coursesearch/coursepreview/${id}`)

    //   }).catch((err) => {
    //     console.log(err);
    //     showErrorToast("Something went wrong");
    //   }).finally(() => {

    //   })
    setEditCourseLoading(true);

    try {
      let course = await EditApi("UserCourses", id, {
        courseName: selectedCourse.courseName,
        courseDescription: selectedCourse.courseDescription,
        location: selectedLocations.map((lan) => lan.value).join(", "),
        mlanguage: selectedLanguages.map((lan) => lan.value).join(", "),
        courseStartingDate: formatDate(Number(courseStartingDate)),
        durationNumber: selectedCourse.durationNumber,
        durationPhase: selectedCourse.durationPhase,
        price: selectedCourse.price.toString(),
        status: selectedCourse.status,
      });

      let prerequsite = await axios.put(
        `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20Prerequisite?authToken=${getCookie("token")}`,
        prerequsiteSkills,
        { headers }
      );
      console.log(prerequsite);
      let skillsAttainables = await axios.put(
        `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20SkillsAttainable?authToken=${getCookie("token")}`,
        skillsAttainable,
        { headers }
      );
      console.log(skillsAttainables);
      await dispatch(fetchUserCourses());
      setEditCourseLoading(false);
      navigate(`/skilling-agency/coursesearch/coursepreview/${id}`);
    } catch (error) {
      console.log(error);
      showErrorToast("something went wrong");
      setEditCourseLoading(false);
    }
  };

  const handleSaveasCourse = async () => {
    setEditCourseLoading(true);

    try {
      let course = await PostApi("UserCourses", {
        userId:getCookie("userId"),
        dateCreated: formatDate(),

        courseName: selectedCourse.courseName,
        courseDescription: selectedCourse.courseDescription,
        location: selectedLocations.map((lan) => lan.value).join(", "),
        mlanguage: selectedLanguages.map((lan) => lan.value).join(", "),
        courseStartingDate: formatDate(Number(courseStartingDate)),
        durationNumber: selectedCourse.durationNumber,
        durationPhase: selectedCourse.durationPhase,
        price: selectedCourse.price.toString(),
        status: selectedCourse.status,

        continent: "Asia",
        region: "South Asia",
        country: "India",
        prerequisiteSkills: "NA",
        skillsAttainable: "NA",
      });
      console.log(course);
      let courseId = course.data.id;

      prerequsiteSkills?.forEach((skill) => {
        skill["userCourseId"] = courseId;
        delete skill["id"];
      });
      skillsAttainable?.forEach((skill) => {
        skill["userCourseId"] = courseId;
        delete skill["id"];
      });

      let prerequsite = await axios.put(
        `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20Prerequisite?authToken=${getCookie("token")}`,
        prerequsiteSkills,
        { headers }
      );
      console.log(prerequsite);
      let skillsAttainables = await axios.put(
        `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20SkillsAttainable?authToken=${getCookie("token")}`,
        skillsAttainable,
        { headers }
      );
      console.log(skillsAttainables);

      dispatch(fetchUserCourses());
      setEditCourseLoading(false);
    } catch (error) {
      console.log(error);
      showErrorToast("something went wrong");
      setEditCourseLoading(false);
    }
  };

  if (editCourseLoading) {
    return <Loader />;
  }

  if (!selectedCourse) {
    return <></>;
  }

  return (
    <div>
      {/* <div className='mb-2  d-flex justify-content-end'>
         <SecondaryBtn label={'Edit'} backgroundColor="#F7FFDD" color="var(--primary-color)" onClick={()=> navigate('coursepreview/edit/${id}')}  />
         </div>
    
    
     */}
      <div
        class="modal fade modal"
        id="addtopic"
        style={{ marginTop: "50px" }}
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
                    value={topics.skillId}
                    onChange={(e) =>
                      setTopics({ ...topics, skillId: e.target.value })
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
                      disabled
                      class="form-select form-select-md"
                      style={{ height: "32px" }}
                      aria-label=".form-select-lg example"
                      onChange={(e) =>
                        setTopics({ ...topics, phase: e.target.value })
                      }
                    >
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
            <div class="modal-body ">
              <div className="d-flex gap-5 justify-content-center align-items-center   ">
                <div class="mb-3 w-75 ">
                  <label for="exampleFormControlInput1" class="form-label">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    style={{ height: "32px" }}
                    id="exampleFormControlInput1"
                    value={skill.skillId}
                    onChange={(e) =>
                      setSkill({ ...skill, skillId: e.target.value })
                    }
                  />
                </div>

                {/* <div class="mb-3 d-flex flex-column ">
                                    <label for="exampleFormControlInput1" class="form-label">Mandatory</label>
                                    <input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.mandatory} onChange={e => setSkill({ ...skill, mandatory: e.target.checked })} />
                                </div> */}
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

      <div
        class="modal fade modal"
        id="save"
        style={{ marginTop: "50px" }}
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Save Changes?
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body ">
              <div className="d-flex gap-2 flex-column align-items-end ">
                <div>
                  {" "}
                  <span className="fw-bold">Clicking 'Save'</span> will replace
                  the existing file with the changes you've made. Are you sure
                  you want to proceed?
                </div>
                <div className="d-flex gap-2 ">
                  {/* <SecondaryBtn label={'Save'} className='p-1' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={() => handleSaveCourse()} />
                                    <SecondaryBtn label={'Cancel'} className='p-1' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} /> */}
                  <button
                    className="btn py-1 px-2 m-0 fw-bold"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      fontSize: ".7rem",
                    }}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => handleSaveCourse()}
                  >
                    Save
                  </button>
                  <button
                    className="btn py-1 px-2 m-0 fw-bold"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      fontSize: ".7rem",
                    }}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="modal fade modal"
        id="saveas"
        style={{ marginTop: "50px" }}
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <div className="d-flex flex-column">
                <h1 class="modal-title fs-5 m-0" id="exampleModalLabel">
                  Save As New Course?
                </h1>
                <i className="mt-0 " style={{ fontSize: "13px" }}>
                  Note: Course name should be different from previous course.
                </i>
              </div>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body ">
              <div className="d-flex gap-2 flex-column align-items-end ">
                <div>
                  {" "}
                  <span className="fw-bold" style={{ alignSelf: "start" }}>
                    Clicking 'Save'
                  </span>{" "}
                  will create a new file with the changes you've made. Are you
                  sure you want to save as a new file?
                </div>

                <div className="d-flex gap-2 ">
                  {/* <SecondaryBtn label={'Save'} className='p-1' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={()=>handleSaveasCourse()}  />
                                    <SecondaryBtn label={'Cancel'} className='p-1' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} /> */}
                  <button
                    className="btn py-1 px-2 m-0 fw-bold"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      fontSize: ".7rem",
                    }}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => handleSaveasCourse()}
                  >
                    Save
                  </button>
                  <button
                    className="btn py-1 px-2 m-0 fw-bold"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      color: "white",
                      fontSize: ".7rem",
                    }}
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="my-0 p-2 d-flex justify-content-between align-items-start gap-1  shadow-lg"
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
          Edit Course
        </h4>

        <div className="d-flex gap-2 align-items-start">
          {/* <SecondaryBtn label={'Save'} className='px-2 py-2 rounded' style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }} data-bs-toggle="modal" data-bs-target="#save"  onClick={() => handleCourseSubmit()}></SecondaryBtn>
                    <SecondaryBtn label={'Save as'} className='px-2 py-2 rounded' style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }} onClick={() => handleCourseSubmit()} ></SecondaryBtn> */}
          {/* <SecondaryBtn label={'Cancel '} className='px-2 py-2 rounded' style={{ backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}  onClick={() => navigate(`/skilling-agency/coursesearch/coursepreview/${id}`)}></SecondaryBtn> */}
          <button
            className="btn py-1 px-2 m-0 fw-bold"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontSize: ".7rem",
            }}
            data-bs-toggle="modal"
            data-bs-target="#save"
          >
            Save
          </button>
          <button
            className="btn py-1 px-2 m-0 fw-bold"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontSize: ".7rem",
            }}
            data-bs-toggle="modal"
            data-bs-target="#saveas"
          >
            Save as
          </button>
          <button
            className="btn py-1 px-2 m-0 fw-bold"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontSize: ".7rem",
            }}
            onClick={() =>
              navigate(`/skilling-agency/coursesearch/coursepreview/${id}`)
            }
          >
            Cancel
          </button>
        </div>
      </div>

      {/* <div class="mb-0 d-flex flex-column px-2 pt-2 ">
                <label for="exampleFormControlInput1" class="form-label fw-bold px-2 mb-0">Course Name</label>
                <input type="text" class="form-control " id="exampleFormControlInput1" placeholder="enter course name" value={selectedCourse.courseName} onChange={(e) => setSelectedCourse({...selectedCourse,courseName:e.target.value})} />
            </div> */}

      {/* <div class="m-2">
                <label for="exampleFormControlInput1" class="form-label fw-bold m-0 p-0">Release Status</label>
                <div class="input-group ">
                    <select class="form-select form-select-md" aria-label=".form-select-lg example">
                        <option value="Not Released" selected> Not Released</option>
                        <option value="Released" >Released</option>


                    </select>
                </div>
            </div> */}

      <div class="accordion p-2" id="accordionPanelsStayOpenExample">
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
            <div class="accordion-body px-2 py-1">
              {/* <div class="mb-3 d-flex flex-column  ">




                                <div class="mb-1 mt-1">
                                    <label for="exampleFormControlTextarea1" class="form-label fw-bold">Description</label>
                                    <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" placeholder='enter course description' value={selectedCourse.courseDetails.description} onChange={(e) => handleCourseDescriptionChange(e)}></textarea>
                                </div>

              </div> */}

              <div class=" d-flex gap-3 flex-column  ">
                <div class="mt-2">
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
                    value={selectedCourse.courseName}
                    onChange={(e) =>
                      setSelectedCourse({
                        ...selectedCourse,
                        courseName: e.target.value,
                      })
                    }
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
                    value={selectedCourse.courseDescription}
                    onChange={(e) =>
                      setSelectedCourse({
                        ...selectedCourse,
                        courseDescription: e.target.value,
                      })
                    }
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
                        checked={selectedLocations?.find((obj) => {
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
                          let isAlreadyPresent = selectedLocations?.find(
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

                <div className="d-flex flex-column mb-3 ">
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

                <div className="m-0 p-0 ">
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
                    defaultValue={convertTimestampToDate(
                      Number(selectedCourse.courseStartingDate)
                    )}
                    onChange={(e) => setCourseStatingDate(e.target.value)}
                  />
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
                    value={selectedCourse.price}
                    onChange={(e) =>
                      setSelectedCourse({
                        ...selectedCourse,
                        price: e.target.value,
                      })
                    }
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
                      value={selectedCourse.durationNumber}
                      onChange={(e) =>
                        setSelectedCourse({
                          ...selectedCourse,
                          durationNumber: e.target.value,
                        })
                      }
                    />
                    <select
                      class="form-select form-select-md"
                      aria-label=".form-select-lg example"
                      value={selectedCourse.durationPhase}
                      onChange={(e) =>
                        setSelectedCourse({
                          ...selectedCourse,
                          durationPhase: e.target.value,
                        })
                      }
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
                      value={selectedCourse.status}
                      onChange={(e) =>
                        setSelectedCourse({
                          ...selectedCourse,
                          status: e.target.value,
                        })
                      }
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
                  {prerequsiteSkills?.map((skill, index) => {
                    if (skill.skillId) {
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
                              {/* <td className='p-1' scope="row"><FiMinus /></td> */}
                              {/* <td className='p-1' scope="row"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.exclude} onChange={(e) => handlePrerequisiteValueChange(e, index, 'exclude')} /></td> */}
                            </>
                          ) : (
                            <>
                              <td className="p-1" scope="row">
                                NA
                              </td>
                              <td className="p-1" scope="row">
                                NA
                              </td>
                              {/* <td className='p-1' scope="row"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.mandatory} onChange={(e) => handlePrerequisiteValueChange(e, index, 'mandatory')} /></td> */}
                              {/* <td className='p-1' scope="row"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.exclude} onChange={(e) => handlePrerequisiteValueChange(e, index, 'exclude')} /></td> */}
                            </>
                          )}

                          <td className="p-1" scope="row">
                            <MdDelete
                              style={{
                                color: "var(--primary-color)",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                handlePrerequisiteSkillDelete(index)
                              }
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

              <table class="table mb-4">
                <thead>
                  <tr>
                    <th className="p-1" scope="col">
                      #
                    </th>
                    <th className="p-1" scope="col">
                      Topic/Skill Name
                    </th>
                    <th className="p-1" scope="col">
                      Duration
                    </th>
                    <th className="p-1" scope="col"></th>
                    <th className="p-1" scope="col">
                      Delete
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {skillsAttainable?.map((topic, index) => {
                    if (topic.skillId) {
                      return (
                        <tr>
                          <td className="p-1" scope="col">
                            {index + 1}
                          </td>
                          <td className="p-1" scope="col">
                            {topic.skillId}
                          </td>
                          <td className="p-1" scope="col">
                            {topic.duration} - NA
                          </td>
                          <td className="p-1" scope="col"></td>
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
                    }
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* <div class="accordion-item">
            <h2 class="accordion-header">
              <button class="accordion-button" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} type="button" data-bs-toggle="collapse" data-bs-target="#panelsStayOpen-collapseThree" aria-expanded="true" aria-controls="panelsStayOpen-collapseThree">
                Accordion Item #3
              </button>
            </h2>
            <div id="panelsStayOpen-collapseThree" class="accordion-collapse collapse show">
              <div class="accordion-body">
                <strong>This is the third item's accordion body.</strong> It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
              </div>
            </div>
          </div> */}
      </div>
    </div>
  );
};

export default EditCourse;
