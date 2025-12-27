import { getCookie } from '../../../config/cookieService';
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { BASE_URL } from "../../../config/Properties";

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
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import SkillSuggestionApi from "../../../api/skillOwner/mySkill/SkillSuggestionApi";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";

const EditSkills = ({
  setEdit,
  prerequsiteSkills,
  skillsAttainable,
  fetchUserCoursePrerequsites,
  fetchUserCourseSkillsAttainable,
}) => {
  const headers = {
    Authorization: "Bearer " + getCookie("token"),
  };

  const [editCourseLoading, setEditCourseLoading] = useState(false);

  const { data, status, error } = useSelector((state) => state.userCourses);
  const dispatch = useDispatch();
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const regionalData = useSelector((state) => state.regionalData);

  //personal hooks
  const [createCourseLoading, setCreateCourseLoading] = useState(false);
  const navigate = useNavigate();
  // const { id } = useParams()
  const { id } = useSelector((state) => state.editCourse);
  const [SkillSuggestions, setSkillSuggestions] = useState([]);
  const [skillSuggestionsLoading, setSkillSuggestionsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // const [prerequsiteLoading, setPrerequsiteLoading] = useState(false)
  // const [skillsAttainableLoading, setSkillsAttainableLoading] = useState(false)
  // const [addSkill, setAddSkill] = useState(false)
  // const [addTopics, setAddTopics] = useState(false)

  const [prerequisiteSkills, setPrerequisiteSkills] = useState([]); //for array
  const [skill, setSkill] = useState({
    //for modal
    applicationName: "UserCourse Prerequisite",
    skillId: "",
    isMandatory: "No",
    mlanguage: getCookie("HLang"),
    userId:getCookie("userId"),
    userCourseId: id,
  });

  //skills Attainable
  const [courseTopics, setCourseTopics] = useState([]); //skills attainable array
  const [topics, setTopics] = useState({
    //for modal
    applicationName: "UserCourse SkillsAttainable",
    skillId: "",
    duration: "",
    durationPhase: "Days",
    mlanguage: getCookie("HLang"),
    userId:getCookie("userId"),
    userCourseId: id,
  });

  useEffect(() => {
    setPrerequisiteSkills(prerequsiteSkills);
    setCourseTopics(skillsAttainable);
  }, [prerequsiteSkills, skillsAttainable]);

  // const fetchUserCoursePrerequsites = async () => {
  //     setPrerequsiteLoading(true)
  //     try {
  //         const token = getCookie("token");
  //         const response = await fetch(`${BASE_URL}/skill/api/v1/skills/courses/UserCourse%20Prerequisite?authToken=${token}&searchFieldName=userCourseId&searchValue=${id}`);
  //         const data = await response.json();
  //         setPrerequisiteSkills(data)
  //         console.log(data);
  //         setPrerequsiteLoading(false)
  //     } catch (error) {
  //         showErrorToast('something went wrong')
  //         setPrerequsiteLoading(false)
  //         throw error;
  //     }
  // }

  // const fetchUserCourseSkillsAttainable = async () => {
  //     setSkillsAttainableLoading(true)
  //     try {
  //         const token = getCookie("token");
  //         const response = await fetch(`${BASE_URL}/skill/api/v1/skills/courses/UserCourse%20SkillsAttainable?authToken=${token}&searchFieldName=userCourseId&searchValue=${id}`);
  //         const data = await response.json();
  //         setCourseTopics(data)
  //         console.log(data);
  //         setSkillsAttainableLoading(false)
  //     } catch (error) {
  //         showErrorToast('something went wrong')
  //         setSkillsAttainableLoading(false)
  //         throw error;
  //     }
  // }

  const [selectedImage, setSelectedImage] = useState(null);
  const [coursePdf, setCoursePdf] = useState(null);

  const [courseStartingDate, setCourseStatingDate] = useState("");

  const [selectedLocations, setSelectedLocations] = useState("");

  const [online, setOnline] = useState(false);

  const [locationInput, setLocationInput] = useState("");

  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState("");

  // const [courseStartingDate, setCourseStatingDate] = useState('');

  const [isFileError, setIsFileError] = useState(false);

  console.log("alldatais", selectedCourse);

  // useEffect(() => {
  //     let course = data.find((course) => id == course.id)
  //     if (course) {
  //         setSelectedCourse(course)
  //         console.log('selcted', course);

  //         setCourseStatingDate(timestampToYYYYMMDD(Number(course.courseStartingDate)))

  //         let languages = course?.courseLanguage?.split(",").map((lan) => {
  //             return { 'label': lan, 'value': lan }
  //         })
  //         setSelectedLanguages(languages)

  //         let locations = course?.location?.split(",").map((loc) => {
  //             return { 'label': loc, 'value': loc }
  //         })
  //         console.log(course.location);
  //         setSelectedLocations(course.location)

  //         fetchUserCoursePrerequsites()
  //         fetchUserCourseSkillsAttainable()
  //     }
  // }, [id, status])

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
      isMandatory: "No",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
      userCourseId: id,
    });
  };
  //handle prerequisite value change
  const handlePrerequisiteValueChange = (e, index, key) => {
    setPrerequisiteSkills((prevSkills) => {
      let updatedSkills = [...prevSkills];
      updatedSkills[index] = {
        ...updatedSkills[index],
        [key]:
          key === "exclude" || key === "isMandatory"
            ? e.target.checked
              ? "Yes"
              : "No"
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
        skillId: value.skillOccupation,
        isMandatory: "No",
        mlanguage: getCookie("HLang"),
        userId:getCookie("userId"),
        userCourseId: id,
      },
    ]);

    setSkill({
      skillId: "",
      isMandatory: "No",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
      userCourseId: id,
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

    setCourseTopics([...courseTopics, { ...topics, userCourseId: id }]);
    setTopics({
      skillId: "",
      duration: "",
      durationPhase: "Days",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
      userCourseId: id,
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

    setTopics({
      skillId: value.skillOccupation,
      duration: "",
      durationPhase: "Days",
      mlanguage: getCookie("HLang"),
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
      const filteredPrerequisiteSkills = prerequisiteSkills?.filter(
        (skill) => skill.skillId
      );
      const filteredCourseTopics = courseTopics?.filter(
        (skill) => skill.skillId
      );

      let prerequsite = await axios.put(
        `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20Prerequisite?authToken=${getCookie("token")}`,
        filteredPrerequisiteSkills,
        { headers }
      );
      console.log(prerequsite);
      let skillsAttainables = await axios.put(
        `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20SkillsAttainable?authToken=${getCookie("token")}`,
        filteredCourseTopics,
        { headers }
      );
      console.log(skillsAttainables);
      showSuccessToast("Edit Successful");
      fetchUserCoursePrerequsites();
      fetchUserCourseSkillsAttainable();
      setEditCourseLoading(false);
      setEdit(false);
    } catch (error) {
      console.log(error);
      showErrorToast("something went wrong");
      setEditCourseLoading(false);
    }
  };

  // const handleSaveasCourse = async () => {

  //     setEditCourseLoading(true)

  //     try {

  //         let course = await PostApi("UserCourses",
  //             {
  //                 "userId":getCookie("userId"),
  //                 "dateCreated": formatDate(),

  //                 "courseName": selectedCourse.courseName,
  //                 "courseDescription": selectedCourse.courseDescription,
  //                 "location": selectedLocations,
  //                 "mlanguage": selectedLanguages.map((lan) => lan.value).join(", "),
  //                 "courseStartingDate": formatDate(Number(courseStartingDate)),
  //                 "durationNumber": selectedCourse.durationNumber,
  //                 "durationPhase": selectedCourse.durationPhase,
  //                 "price": selectedCourse.price.toString(),
  //                 "status": selectedCourse.status,

  //                 "continent": "Asia",
  //                 "region": "South Asia",
  //                 "country": "India",
  //                 "prerequisiteSkills": "NA",
  //                 "skillsAttainable": "NA"
  //             }

  //         )
  //         console.log(course);
  //         let courseId = course.data.id

  //         prerequisiteSkills?.forEach((skill) => {
  //             skill['userCourseId'] = courseId;
  //             delete skill['id'];
  //         })
  //         courseTopics?.forEach((skill) => {
  //             skill['userCourseId'] = courseId;
  //             delete skill['id'];
  //         })

  //         const filteredPrerequisiteSkills = prerequisiteSkills?.filter((skill) => skill.skillId)
  //         const filteredCourseTopics = courseTopics?.filter((skill) => skill.skillId)

  //         let prerequsite = await axios.put(`${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20Prerequisite?authToken=${getCookie("token")}`, filteredPrerequisiteSkills, { headers })
  //         console.log(prerequsite);
  //         let skillsAttainables = await axios.put(`${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20SkillsAttainable?authToken=${getCookie("token")}`, filteredCourseTopics, { headers })
  //         console.log(skillsAttainables);

  //         dispatch(fetchUserCourses())
  //         setEditCourseLoading(false)

  //     } catch (error) {
  //         console.log(error);
  //         showErrorToast('something went wrong')
  //         setEditCourseLoading(false)
  //     }

  // }

  return (
    <div className="py-2 px-4">
      <div className="d-flex justify-content-between ">
        <div></div>
        <div className="d-flex gap-2">
          <SecondaryBtnLoader
            onClick={() => setEdit(false)}
            label={
              (
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Cancel"
                ) || {}
              ).mvalue || "nf Cancel"
            }
          />
          <SecondaryBtnLoader
            loading={editCourseLoading}
            onClick={() => handleSaveCourse()}
            label={
              (
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Save"
                ) || {}
              ).mvalue || "nf Save"
            }
          />
        </div>
      </div>

      <div>
        <div className="d-flex gap-3 justify-content-center align-items-center mb-2">
          <div class="mb-1 w-75" style={{ position: "relative" }}>
            <label for="exampleFormControlInput1" class="form-label">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Skills/Topic"
                ) || {}
              ).mvalue || "nf Skills/Topic"}{" "}
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Name"
                ) || {}
              ).mvalue || "nf Name"}
            </label>
            <input
              type="text"
              class="form-control "
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
                            handleSkillsAttainableSuggestionClick(suggestion)
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
              {" "}
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "ProjectDuration"
                ) || {}
              ).mvalue || "nf ProjectDuration"}
            </label>
            <div class="input-group ">
              <input
                type="number"
                class="form-control"
                style={{ width: "2rem" }}
                id="exampleFormControlInput1"
                value={topics.duration}
                onChange={(e) =>
                  setTopics({ ...topics, duration: e.target.value })
                }
              />
              <select
                class="form-select form-select-md"
                style={{ height: "32px", width: "5rem" }}
                aria-label=".form-select-lg example"
                value={topics?.durationPhase}
                onChange={(e) =>
                  setTopics({ ...topics, durationPhase: e.target.value })
                }
              >
                <option value="Hours">
                  {" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Hours"
                    ) || {}
                  ).mvalue || "nf Hours"}
                </option>
                <option value="Days" selected>
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Days"
                    ) || {}
                  ).mvalue || "nf Days"}
                </option>
                <option value="Weeks">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Weeks"
                    ) || {}
                  ).mvalue || "nf Weeks"}
                </option>
                <option value="Months">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Months"
                    ) || {}
                  ).mvalue || "nf Months"}
                </option>
                <option value="Years">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Year"
                    ) || {}
                  ).mvalue || "nf Year"}
                </option>
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

        <div style={{ minHeight: "10rem" }}>
          <table class="table">
            <thead>
              <tr>
                <th className="p-1" scope="col">
                  #
                </th>
                <th className="p-1" scope="col">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Skills/Topic"
                    ) || {}
                  ).mvalue || "nf Skills/Topic"}
                </th>
                <th className="p-1" scope="col">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectDuration"
                    ) || {}
                  ).mvalue || "nf ProjectDuration"}
                </th>
                <th className="p-1" scope="col">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Delete"
                    ) || {}
                  ).mvalue || "nf Delete"}
                </th>
              </tr>
            </thead>
            <tbody>
              {courseTopics.map((topic, index) => {
                return (
                  topic.skillId && (
                    <tr>
                      <td className="p-1" scope="col">
                        {index + 1}
                      </td>
                      <td className="p-1" scope="col">
                        {topic.skillId}
                      </td>
                      <td className="p-1" scope="col">
                        {topic.duration}
                        {topic.durationPhase}
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
                  )
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="d-flex flex-column gap-3">
        <div className="d-flex gap-3  justify-content-center align-items-center">
          <div class=" w-100" style={{ position: "relative" }}>
            <label for="exampleFormControlInput1" class="form-label">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "SkillName"
                ) || {}
              ).mvalue || "nf Skill Name"}
            </label>
            <input
              type="text"
              class="form-control w-100"
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
              {skill.skillId.length > 2 && SkillSuggestions.length === 1 && (
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
        <div style={{ minHeight: "10rem" }}>
          <table class="table ">
            <thead>
              <tr>
                <th className="p-1" scope="col">
                  #
                </th>
                <th className="p-1" scope="col">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "PrerequsiteSkills"
                    ) || {}
                  ).mvalue || "nf Prerequsite Skills"}
                </th>
                <th className="p-1" scope="col">
                  {" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Mandatory"
                    ) || {}
                  ).mvalue || "nf Mandatory"}
                </th>
                {/* <th className='p-1' scope="col">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Exclude') || {}).mvalue || "nf Exclude"}</th> */}
                <th className="p-1" scope="col">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Delete"
                    ) || {}
                  ).mvalue || "nf Delete "}
                </th>
              </tr>
            </thead>
            <tbody className=" divide-y ml-5  ">
              {prerequisiteSkills.map((skill, index) => {
                return (
                  skill.skillId && (
                    <tr>
                      <td className="p-1" scope="row">
                        {index + 1}
                      </td>
                      <td className="p-1" scope="row">
                        {skill.skillId}
                      </td>
                      {skill.exclude ? (
                        <>
                          {/* <td className='p-1' scope="row"><FiMinus /></td>
                                <td className='p-1' scope="row"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.exclude} onChange={(e) => handlePrerequisiteValueChange(e, index, 'exclude')} /></td> */}
                        </>
                      ) : (
                        <>
                          <td className="p-1" scope="row">
                            <input
                              type="checkbox"
                              style={{ accentColor: "var(--primary-color)" }}
                              checked={
                                skill.isMandatory === "Yes" ? true : false
                              }
                              onChange={(e) =>
                                handlePrerequisiteValueChange(
                                  e,
                                  index,
                                  "isMandatory"
                                )
                              }
                            />
                          </td>
                          {/* <td className='p-1' scope="row"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.exclude} onChange={(e) => handlePrerequisiteValueChange(e, index, 'exclude')} /></td> */}
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
                  )
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EditSkills;
