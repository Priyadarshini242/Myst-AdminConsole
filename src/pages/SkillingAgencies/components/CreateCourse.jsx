import { getCookie } from '../../../config/cookieService';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { BASE_URL } from "../../../config/Properties";
import { MdPlayCircleOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { FiMinus } from "react-icons/fi";
import { useDispatch } from "react-redux";
import company_image from "../../../Images/skyline.png";
import CreatableSelect from "react-select/creatable";
import PostApi from "../../../api/PostData/PostApi";
import createNewCourse from "../../../api/SkillingAgency/createNewCourse";
import { icons, images } from "../../../constants";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { fetchUserCourses } from "../../../api/SkillingAgency/fetchUserCourses";
import Loader from "../../../components/Loader";
import SkillSuggestionApi from "../../../api/skillOwner/mySkill/SkillSuggestionApi";
import { useSelector } from "react-redux";
import axios from "axios";
import GetAllLangApi from "../../../api/content/GetAllLangApi";
import MultiSelect from "../../../components/SkillOwner/SelectComponent/MultiSelect";
import { GetAttachment } from "../../../api/Attachment  API/DownloadAttachmentApi";
import { Card, Col, Row } from "react-bootstrap";
import CreateStepper from "../../../components/Steppers/CreateStepper";
import LazyLoadingImageComponent from "../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import useContentLabel from "../../../hooks/useContentLabel";
import { FaStar } from "react-icons/fa";
import { MdOpenInNew } from "react-icons/md";
import Gallery from "../../../components/molecules/Gallery/Gallery";
import Files from "../../../components/molecules/Files/Files";
import CourseQuestions from "./create course/CourseQuestions";
import { setCourseQuestions } from "../../../reducer/skilling agency/create course/createCourseSlice";
import { debouncedSendRequest } from "../../../components/DebounceHelperFunction/debouncedSendRequest";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { formatDateInputType } from "../../../components/SkillOwner/HelperFunction/FormatDateInputType";
import DatePickerWidget from "../../../components/molecules/Date/DatePickerWidget";
import BriefDescriptionTextArea from "../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { LIMITED_SPL_CHARS } from "../../../config/constant";

const CreateCourse = ({ handleCloseView }) => {
  //HOOKS
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //VALUES
  const isLoading = false;
  const navBarBgColor = "var(--primary-color)";
  const contentLabel = useContentLabel();
  const allCourses = [];
  const headers = {
    Authorization: "Bearer " + getCookie("token"),
  };
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  /* STORES */
  const {
    language: selectedLanguage,
    content,
    getUserAttachment: { userAttachmentData },
  } = useSelector((state) => state);
  const userDetails = useSelector((state) => state.userProfile.data);
  const { data, remoteCheckBox, skills, questions } = useSelector(
    (state) => state.createCourse
  );
  const regionalData = useSelector((state) => state.regionalData);

  //PROFILE PIC FOR COURSES
  const [profilePicObj, setProfilePicObj] = useState({});
  function splitStringToObject(str) {
    try {
      const parts = str.split("||").map((part) => part.trim());
      const obj = {};
      parts?.forEach((part) => {
        const [key, value] = part.split("=").map((item) => item.trim());
        obj[key] = value;
      });
      return obj;
    } catch (error) {
      console.error("Error occurred while parsing the string:", error.message);
      return {}; /* RETURN EMPTY OBJECT INCASE OF FAILURE */
    }
  }
  useEffect(() => {
    if (userDetails[0]?.profilePictureFileName) {
      setProfilePicObj(
        splitStringToObject(userDetails[0]?.profilePictureFileName)
      );
    }
    console.log(splitStringToObject(userDetails[0]?.profilePictureFileName));
  }, [userDetails]);

  //AATACHMENT PDF AND IMAGE
  const [linkAttachmentOptions, setLinkAttachmentOptions] = useState([]);
  const [linkAttachment, setLinkAttachment] = useState([]);
  const [linkImageOptions, setLinkImageOptions] = useState([]);
  const [linkImage, setLinkImage] = useState([]);
  useEffect(() => {
    const formattedAttachmentOptions = userAttachmentData
      ?.filter((att) => !att?.fileType?.startsWith("image"))
      .map((att) => {
        return { label: att?.fileName, value: att };
      });
    setLinkAttachmentOptions(formattedAttachmentOptions);
    const formattedImageOptions = userAttachmentData
      ?.filter((att) => att?.fileType?.startsWith("image"))
      .map((att) => {
        return { label: att?.fileName, value: att };
      });
    setLinkImageOptions(formattedImageOptions);
  }, [userAttachmentData]);

  //POST API ERRORS
  const [error, setErrors] = useState(false);
  const validateForm = () => {
    const newErrors = {};
    if (!courseName) newErrors.courseName = "Course Name is required.";
    if (!courseDescription)
      newErrors.courseDescription = "Course Description is required.";
    if (courseDescription?.length > 1000)
      newErrors.courseDescription = "Course Description length exceeded.";
    if (!skillerName) newErrors.skillerName = "Skiller Name is required.";
    if (!skillerBio) newErrors.skillerBio = "Skiller Bio is required.";
    if (skillerBio?.length > 1000)
      newErrors.skillerBio = "Skiller Bio length exceeded.";
    // if (!selectedImage) newErrors.selectedImage = 'Course Image is required.';
    if (selectedLocations.length === 0)
      newErrors.selectedLocations = "At least one location must be selected.";
    if (selectedLanguages.length === 0)
      newErrors.selectedLanguages = "At least one language must be selected.";
    if (!courseStartingDate)
      newErrors.courseStartingDate = "Course Starting Date is required.";
    if (!durationNumber || isNaN(durationNumber))
      newErrors.durationNumber = "Course Duration must be a valid number.";
    if (!price || isNaN(price))
      newErrors.price = "Course Price must be a valid number.";
    if (!currencyInput) newErrors.currencyInput = "Currency is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //POST API LOADING
  const [createCourseLoading, setCreateCourseLoading] = useState(false);

  //COURSENAME AND NAME SUGGESTION
  const [courseName, setCourseName] = useState("");
  const [suggestCourse, setSuggestCourse] = useState(false);

  //COURSE DSCRIPTION
  const [courseDescription, setCourseDescription] = useState("");

  //SKILLER NAME AND BIO
  const [skillerName, setSkillerName] = useState("");
  const [skillerBio, setSkillerBio] = useState("");

  //COURSE IMAGE
  const [selectedImage, setSelectedImage] = useState(null);

  //COURSE PDF
  const [coursePdf, setCoursePdf] = useState(null); //file upload

  //COURSE LOCATION
  const [selectedLocations, setSelectedLocations] = useState("");
  const [online, setOnline] = useState(false);
  const components = {
    DropdownIndicator: null,
  };

  // COURSE LANGUGAES
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

  //COURSE PRICE WITH CURRENCY
  const [price, setPrice] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [filterCurrency, setFilterCurrency] = useState([]);
  useEffect(() => {
    setFilterCurrency(
      regionalData?.listOfCountries?.map((item) => ({
        value: item.currency,
        label: item.currency,
      }))
    );
  }, []);

  //COURSE DATE, DURATION, PHASE, STATUS
  const [courseStartingDate, setCourseStatingDate] = useState("");
  const [durationNumber, setDurationNumber] = useState("");
  const [durationPhase, setDurationPhase] = useState("Months");
  const [courseStatus, setCourseStatus] = useState("Not started");

  //SKILL API SUGGESTIONS
  const [SkillSuggestions, setSkillSuggestions] = useState([]);
  const [suggestionLoader, setSuggestionLoader] = useState(false);

  //PREREQUSITE SKILLS STATES
  const [prerequisiteSkills, setPrerequisiteSkills] = useState([]); //for array
  const [skill, setSkill] = useState({
    //for modal
    skillId: "",
    isMandatory: "No",
    mlanguage: getCookie("HLang"),
    userId:getCookie("userId"),
  });

  //SKILLS ATTAINABLE STATES
  const [courseTopics, setCourseTopics] = useState([]); //skills attainable array
  const [topics, setTopics] = useState({
    //for modal
    skillId: "",
    duration: "",
    durationPhase: "Days",
    mlanguage: getCookie("HLang"),
    userId:getCookie("userId"),
  });

  //HANDLE COURSE NAME FOCOUS // SHOW SUGGESTION (implimenting in future)
  const handleCourseNameFocus = (e) => {
    setSuggestCourse(true);
    if (e.target.value.length === 0) {
      setSuggestCourse(allCourses);
      return;
    }
  };

  //HANDLE COURSENAME CHANGE
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

  // HANDLE COURSE SUGGESTION CLICK (implimenting in future)
  const handleSuggestCourseClick = (course) => {
    setSuggestCourse(false);
    console.log("ok");
    setCourseName(course.courseName);
    setCourseDescription(course.courseDetails.description);
    setCourseTopics(course.courseDetails.topics);
    setPrerequisiteSkills(course.prerequisiteSkills);
  };

  /////////////////////////////////////////////////////////////////////////PREREQUSITE SKILLS/////////////////////////////////////////////////
  //HANDLE PREREQUSITE MANDATORY AND EXCLUDE CHANGE
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
  //HANDLE PREREQUSITE DELETE
  const handlePrerequisiteSkillDelete = (index) => {
    let skills = prerequisiteSkills.filter((skill, i) => {
      return i !== index;
    });
    setPrerequisiteSkills(skills);
  };

  // CALL SKILL API WHEN PREREQUSITE INPUT CHANGE
  const handlePrerequsiteChangeSkill = async (e) => {
    const val = e.target.value;
    setSkill({ ...skill, skillId: e.target.value });

    // if value greater than 2 then query the database and get the suggestions
    if (val.length > 2) {
      setSkillSuggestions([]);
      // SkillSuggestionApi(val, selectedLanguage, "skill").then((res) => {
      //   console.log(res.data);
      //   // check res data length if empty pass No suggestions found
      //   if (res.data.length === 0) {
      //     setSkillSuggestions([{ skillOccupation: "No suggestions found" }]);
      //   } else {
      //     setSkillSuggestions(res.data);
      //   }
      // });
      setSuggestionLoader(true);
      debouncedSendRequest(
        e.target.value,
        selectedLanguage,
        setSkillSuggestions,
        setSuggestionLoader,
        contentLabel
      );
    } else {
      setSkillSuggestions([]);
    }
  };

  //HANDLE PREREQUISITE CLICK FROM AUTO-SUGGESTION
  const handlePrerequsiteSuggestionClick = (value) => {
    console.log(value);
    setPrerequisiteSkills([
      ...prerequisiteSkills,
      {
        skillId: value.skillOccupation,
        isMandatory: "No",
        mlanguage: getCookie("HLang"),
        userId:getCookie("userId"),
      },
    ]);
    setSkill({
      skillId: "",
      isMandatory: "No",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
    });
    setSkillSuggestions([]);
  };

  /////////////////////////////////////////////////////////////////////////SKILLSATTAINABLE/////////////////////////////////////////////////
  //HANDLE ADD SKILLS ATTAINABLE
  const handleAddTopic = (e) => {
    e.preventDefault();

    if (SkillSuggestions[0].skillOccupation) {
      showErrorToast(
        contentLabel("NoSuggestionsFound", "nf No suggestions found")
      );
      return;
    }
    if (!SkillSuggestions[0].selected) {
      showErrorToast(
        contentLabel("PleaseSelectSkills", "nf Please Select Skills")
      );
      return;
    }
    if (topics.skillId === "" && topics.duration === "") {
      showErrorToast(
        contentLabel(
          "PleaseFillAllRequiredFields",
          "nf Please fill all required fields"
        )
      );
      return;
    }
    if (topics.skillId === "") {
      // showErrorToast('Topic name is required')
      showErrorToast(
        contentLabel(
          "PleaseFillAllRequiredFields",
          "nf Please fill all required fields"
        )
      );
      return;
    }
    if (topics.duration === "") {
      // showErrorToast('Topic duration is required')
      showErrorToast(
        contentLabel(
          "PleaseFillAllRequiredFields",
          "nf Please fill all required fields"
        )
      );
      return;
    }
    setCourseTopics([...courseTopics, topics]);
    setTopics({
      skillId: "",
      duration: "",
      durationPhase: "Days",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
    });
  };

  //CALL SKILL SUGGESTION API WHEN ATTAINABLE INPUT CHANGE
  const handleSkillAttainableChangeSkill = (e) => {
    const val = e.target.value;
    setTopics({ ...topics, skillId: e.target.value });
    // if value greater than 2 then query the database and get the suggestions
    if (val.length > 2) {
      setSkillSuggestions([]);
      // SkillSuggestionApi(val, selectedLanguage, "skill").then((res) => {
      //   console.log(res.data);
      //   // check res data length if empty pass No suggestions found
      //   if (res.data.length === 0) {
      //     setSkillSuggestions([{ skillOccupation: "No suggestions found" }]);
      //   } else {
      //     setSkillSuggestions(res.data);
      //   }
      // });
      setSuggestionLoader(true);
      debouncedSendRequest(
        e.target.value,
        selectedLanguage,
        setSkillSuggestions,
        setSuggestionLoader,
        contentLabel
      );
    } else {
      setSkillSuggestions([]);
    }
  };

  //HANDLE SKILL ATTAINABLE CLICK FROM AUTO-SUGGESTION
  const handleSkillsAttainableSuggestionClick = (value) => {
    setTopics({
      skillId: value.skillOccupation,
      duration: "",
      durationPhase: "Days",
      mlanguage: getCookie("HLang"),
      userId:getCookie("userId"),
    });
    setSkillSuggestions([{ selected: true }]);
  };

  //HANDLE COURSE TOPIC CHANGE
  const handleCourseTopicValueChange = (e, index, key) => {
    setCourseTopics((prevTopics) => {
      let updatedTopics = [...prevTopics];
      updatedTopics[index] = { ...updatedTopics[index], [key]: e.target.value };
      return updatedTopics;
    });
  };

  //HANDLE COURSE TOPIC DELETE
  const handleCourseTopicDelete = (index) => {
    let topics = courseTopics.filter((topic, i) => {
      return i !== index;
    });
    setCourseTopics(topics);
  };

  //FORMAT DATE FOR POST API
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

  //HANDLE COURSE SUBMIT
  const handleCourseSubmit = async (submitType) => {
    //check course details validation
    if (!validateForm()) {
      showErrorToast(
        contentLabel(
          "PleaseFillAllRequiredFields",
          "nf Please fill all required fields"
        )
      );
      return;
    }
    //check course skills attainable validation
    if (!courseTopics?.length > 0) {
      showErrorToast(
        contentLabel(
          "PleaseFillAllRequiredFields",
          "nf Please fill all required fields"
        )
      );
      return;
    }

    setCreateCourseLoading(true);

    const courseAttachment = [];
    const fileAttachment = linkAttachment?.map((attach) => {
      return attach;
    });
    if (fileAttachment) {
      courseAttachment.push(...fileAttachment);
    }
    if (linkImage[0]) {
      courseAttachment.push(linkImage[0]);
    }
    if (userDetails[0]?.profilePictureFileName?.length) {
      courseAttachment.push({
        ...profilePicObj,
        userId: userDetails[0]?.id,
        firstName: userDetails[0]?.firstName,
        lastName: userDetails[0]?.lastName,
        type: "AgencyImage",
      });
    }

    try {
      console.log({
        attachmentUrls: "Normal",
        userId:getCookie("userId"),
        courseName: courseName,
        dateCreated: formatDate(),
        courseDescription: courseDescription,
        mlanguage: selectedLanguage,
        courseLanguage: selectedLanguages.map((lan) => lan.value).join(", "),
        courseStatus: submitType,
        continent: "Asia",
        region: "South Asia",
        country: "India",
        location: selectedLocations,
        price: `${price}`,
        currency: currencyInput,
        attachmentFileNames:
          courseAttachment.length > 0 ? JSON.stringify(courseAttachment) : "",
        courseStartingDate: formatDate(courseStartingDate),
        durationNumber: durationNumber,
        durationPhase: durationPhase,
        skillerName: skillerName,
        skillerBio: skillerBio,
        prerequisiteSkills: "NA",
        skillsAttainable: "NA",
      });

      let course = await createNewCourse("User Courses", {
        attachmentUrls: "Normal",
        userId:getCookie("userId"),
        courseName: courseName,
        dateCreated: formatDate(),
        courseDescription: courseDescription,
        mlanguage: selectedLanguage,
        courseLanguage: selectedLanguages.map((lan) => lan.value).join(", "),
        courseStatus: submitType,
        continent: "Asia",
        region: "South Asia",
        country: "India",
        location: selectedLocations,
        price: `${price}`,
        currency: currencyInput,
        attachmentFileNames:
          courseAttachment.length > 0 ? JSON.stringify(courseAttachment) : "",
        courseStartingDate: formatDate(courseStartingDate),
        durationNumber: durationNumber,
        durationPhase: durationPhase,
        skillerName: skillerName,
        skillerBio: skillerBio,
        prerequisiteSkills: "NA",
        skillsAttainable: "NA",
      });
      console.log(course);
      let courseId = course.data.id;

      prerequisiteSkills?.forEach((skill) => {
        skill["userCourseId"] = courseId;
        skill["isMandatory"] = skill.mandatory ? "Yes" : "No";
      });
      courseTopics?.forEach((skill) => {
        skill["userCourseId"] = courseId;
      });

      if (prerequisiteSkills?.length > 0) {
        let prerequsite = await axios.put(
          `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20Prerequisite?authToken=${getCookie("token")}`,
          prerequisiteSkills,
          { headers }
        );
        console.log(prerequsite);
      }
      if (courseTopics?.length > 0) {
        let skillsAttainable = await axios.put(
          `${BASE_URL}/skill/api/v1/skills/courseEdit/UserCourse%20SkillsAttainable?authToken=${getCookie("token")}`,
          courseTopics,
          { headers }
        );
        console.log(skillsAttainable);
      }

      // Posting questions
      const postQuestions = questions?.map(async (question, index) => {
        console.log(
          "Processing question:",
          question.question,
          "Question ID:",
          question.id
        );
        const optionValues = question?.options?.map((option) => option?.value);

        try {
          const questionRes = await PostApi("CQuestions", {
            cid: course.data.id,
            cqOrder: index + 1,
            cqValues: JSON.stringify(optionValues),
            cqType: question.answer.value,
            cqLabel: question.question,
            cqRequired: question.required ? "Yes" : "No",
          });

          dispatch(setCourseQuestions([]));
          console.log(
            "Successfully posted to JQuestions table",
            questionRes.data
          );
        } catch (questionErr) {
          console.error("Error posting to JQuestions table", questionErr);
          throw questionErr;
        }
      });

      await Promise.all(postQuestions);

      showSuccessToast(
        contentLabel("CourseAddedSuccessfully", "nf Course Added Successfully")
      );
      dispatch(fetchUserCourses());
      navigate("/skilling-agency/my-courses");
      setSteps({
        step1: false,
        step2: false,
        step3: false,
        step4: false,
        step5: false,
      });
      setCourseName("");
      setCourseDescription("");
      setCoursePdf("");
      setCourseStatingDate("");
      setCourseStatus("Not started");
      setSelectedImage(null);
      setPrice("");
      setDurationNumber("");
      setDurationPhase("Months");
      setOnline(false);
      setSelectedLocations("");
      setSelectedLanguages("");
      setPrerequisiteSkills([]);
      setCourseTopics([]);
      setCreateCourseLoading(false);
    } catch (error) {
      console.log(error);
      showErrorToast(
        contentLabel("SomethingWentWrong", "nf Something Went Wrong")
      );
      setCreateCourseLoading(false);
    }
  };

  const steperSteps = [
    {
      name: contentLabel("CourseDetails", "nf Course Details"),
      number: 1,
      Component: () => <div>step1</div>,
    },
    {
      name: contentLabel("PrerequsiteSkills", "nf Prerequsite Skills"),
      number: 2,
      Component: () => <div>step2</div>,
    },
    {
      name: contentLabel("SkillsAttainable", "nf Skills Attainable"),
      number: 3,

      Component: () => <div>step3</div>,
    },
    {
      name: contentLabel("CourseQuestions", "nf Course Questions"),
      number: 4,

      Component: () => <div>step3</div>,
    },
    {
      name: contentLabel("Preview", "nf Preview"),
      number: 5,

      Component: () => <div>step4</div>,
    },
  ];

  const [openGallery, setOpenGallery] = useState(false);
  /* HANDLE GALLERY CLOSE */
  const handleGalleryClose = useCallback(() => {
    setOpenGallery(false);
  }, []);

  /* HANDLE GALLERY OPEN */
  const handleGalleryOpen = useCallback(() => {
    setOpenGallery(true);
  }, []);

  /* HANDLE SELECT IMAGE */
  const handleSelectImage = useCallback((image) => {
    console.log(image);
    setLinkImage([{ ...image }]);
    const imageUrl = GetAttachment(
      image?.userId,
      image?.fileName,
      image?.fileId
    );
    setSelectedImage(imageUrl);
  }, []);

  const [openFile, setOpenFile] = useState(false);
  /* HANDLE GALLERY CLOSE */
  const handleFileClose = useCallback(() => {
    setOpenFile(false);
  }, []);

  /* HANDLE GALLERY OPEN */
  const handleFileOpen = useCallback(() => {
    setOpenFile(true);
  }, []);
  /* HANDLE SELECT FILE */
  const handleSelectFile = useCallback((file) => {
    setLinkAttachment([{ ...file }]);
  }, []);

  if (createCourseLoading) {
    return <Loader />;
  }

  return (
    <>
      <Gallery
        title={contentLabel("ChooseCourseImage", "nf Choose Course Image")}
        openGallery={openGallery}
        handleGalleryClose={handleGalleryClose}
        handleSelectImage={handleSelectImage}
      />

      <Files
        title={contentLabel("ChooseCourseFile", "nf Choose Course File")}
        openFile={openFile}
        handleFileClose={handleFileClose}
        handleSelectFile={handleSelectFile}
      />

      <div class="card p-4">
        {/* <CreateStepper
          steps={steperSteps}
          activeSteps={steps}
          setActiveSteps={setSteps}
        /> */}
      </div>

      <div class="card p-4">
        {!steps.step1 && (
          <>
            <Row>
              <Col xl={12} lg={12} className="mb-4">
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label "
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "CourseName"
                    ) || {}
                  ).mvalue || "nf CourseName"}
                  <span className="text-danger"> *</span>
                </label>
                <input
                  type="text"
                  class="form-control "
                  id="exampleFormControlInput1"
                  placeholder={`${contentLabel(
                    "Enter",
                    "nf Enter"
                  )} ${contentLabel("CourseName", "nf Course Name")}`}
                  value={courseName}
                  onChange={(e) => handleCourseNameChange(e)}
                  onFocus={(e) => handleCourseNameFocus(e)}
                />
              </Col>

              <Col xl={12} lg={12} className="mb-4">
                <label
                  for="exampleFormControlTextarea1 "
                  class="form-label text-label "
                >
                  {" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Description"
                    ) || {}
                  ).mvalue || "nf Description"}
                  <span className="text-danger"> *</span>
                </label>
                <BriefDescriptionTextArea
                  class="form-control"
                  id="exampleFormControlTextarea1"
                  rows="3"
                  placeholder={`${contentLabel(
                    "Enter",
                    "nf Enter"
                  )} ${contentLabel("Description", "nf Description")}`}
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                ></BriefDescriptionTextArea>
              </Col>

              <Col xl={12} lg={12} className="mb-4">
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label "
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "SkillerName"
                    ) || {}
                  ).mvalue || "nf SkillerName"}
                  <span className="text-danger"> *</span>
                </label>
                <input
                  type="text"
                  class="form-control "
                  id="exampleFormControlInput1"
                  placeholder={`${contentLabel(
                    "Enter",
                    "nf Enter"
                  )} ${contentLabel("SkillerName", "nf Skiller Name")}`}
                  value={skillerName}
                  onChange={(e) => setSkillerName(e.target.value)}
                />
              </Col>

              <Col xl={12} lg={12} className="mb-4">
                <label
                  for="exampleFormControlTextarea1 "
                  class="form-label text-label "
                >
                  {" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "SkillerBio"
                    ) || {}
                  ).mvalue || "nf Skiller Bio"}
                  <span className="text-danger"> *</span>
                </label>
                <BriefDescriptionTextArea
                  class="form-control"
                  id="exampleFormControlTextarea1"
                  rows="3"
                  placeholder={`${contentLabel(
                    "Enter",
                    "nf Enter"
                  )} ${contentLabel("SkillerBio", "nf Skiller Bio")}`}
                  value={skillerBio}
                  onChange={(e) => setSkillerBio(e.target.value)}
                ></BriefDescriptionTextArea>
              </Col>

              {/* <Col xl={4} lg={6} className='mb-4'>
                <label for="exampleFormControlInput1" class="form-label text-label   ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Skillers') || {}).mvalue || "nf Skillers"}<span className='text-danger'> *</span></label>
                <div class="input-group ">
                  <select class="form-select form-select-md" aria-label=".form-select-lg example">
                    <option value="Skillers"> Skillers</option>
                  </select>
                </div>
              </Col> */}

              <Col xl={4} lg={6} className="mb-4">
                <div class="mb-3">
                  <label
                    for="formFile form-label text-label"
                    class="form-label"
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "CourseImage"
                      ) || {}
                    ).mvalue || "nf Course Image"}
                  </label>
                  <div className="relative" style={{ position: "relative" }}>
                    <div onClick={handleGalleryOpen}>
                      <input
                        class="form-control"
                        type="text"
                        id="formFile"
                        placeholder={contentLabel(
                          "NoImageSelected",
                          "nf No image selected"
                        )}
                        style={{ pointerEvents: "none" }}
                        value={linkImage[0]?.fileName || ""}
                      />
                    </div>
                    <div
                      style={{
                        color: "gray",
                        top: "9px",
                        right: "10px",
                        position: "absolute",
                        cursor: "pointer",
                      }}
                    >
                      <icons.FaTimes
                        onClick={() => {
                          console.log("triggered");
                          setLinkImage([]);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Col>

              <Col xl={4} lg={6} className="mb-4">
                <div class="mb-3">
                  <label
                    for="formFile form-label text-label"
                    class="form-label"
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "CoursePdf"
                      ) || {}
                    ).mvalue || "nf Course Pdf"}
                  </label>
                  <div className="relative" style={{ position: "relative" }}>
                    <div onClick={handleFileOpen}>
                      <input
                        class="form-control"
                        type="text"
                        id="formFile"
                        placeholder={contentLabel(
                          "NoFileSelected",
                          "nf No file selected"
                        )}
                        style={{ pointerEvents: "none" }}
                        value={linkAttachment[0]?.fileName || ""}
                      />
                    </div>
                    <div
                      style={{
                        color: "gray",
                        top: "9px",
                        right: "10px",
                        position: "absolute",
                        cursor: "pointer",
                      }}
                    >
                      <icons.FaTimes
                        onClick={() => {
                          console.log("triggered");
                          setLinkAttachment([]);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Col>

              <Col xl={4} lg={6} className="mb-4">
                <div
                  className="d-flex justify-content-between "
                  style={{ position: "relative" }}
                >
                  <label
                    htmlFor="locationInput"
                    className="form-label text-label "
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Location"
                      ) || {}
                    ).mvalue || "nf Location"}
                    <span className="text-danger"> *</span>
                  </label>
                  <div className="d-flex align-items-center justify-align-content">
                    <input
                      id="onlineCheckbox"
                      className="ms-2"
                      type="checkbox"
                      name="online"
                      checked={selectedLocations?.includes("Online")}
                      onChange={(e) => {
                        setOnline(!online);
                      }}
                    />
                    <label htmlFor="onlineCheckbox" className="ms-1">
                      {" "}
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Online"
                        ) || {}
                      ).mvalue || "nf Online"}
                    </label>
                  </div>
                </div>
                <MultiSelect
                  viewLocation={selectedLocations}
                  setLocationData={setSelectedLocations}
                  onlineStatus={online}
                />
              </Col>

              <Col xl={4} lg={6} className="mb-4">
                <label for="location" class="form-label text-label ">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Languages"
                    ) || {}
                  ).mvalue || "nf Languages"}
                  <span className="text-danger"> *</span>
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
                    placeholder={`${contentLabel(
                      "Enter",
                      "nf Enter"
                    )} ${contentLabel("Languages", "nf Languages")}`}
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
                    value={selectedLanguages}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary25: "#f5f5f5",
                        primary: "var(--primary-color)",
                        primary50: "#f5f5f5",
                      },
                    })}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        width: "100%",
                        border:
                          state.isFocused || state.isActive
                            ? "1px solid var(--primary-color)"
                            : "1px solid #ced4da", // Customize bottom border style
                        boxShadow: state.isFocused ? "none" : "none", // Remove the default focus box-shadow
                        ":hover": {
                          // border: error.language ? '2px solid #d9534f' : ''
                        },
                      }),
                      valueContainer: (provided) => ({
                        ...provided,
                        padding: "0.325rem 0.75rem",
                        borderRadius: "var(--bs-border-radius)",
                      }),
                    }}
                  />
                </div>
              </Col>

              <Col xl={4} lg={6} className="mb-4">
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label  "
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "StartDate"
                    ) || {}
                  ).mvalue || "nf StartDate"}
                  <span className="text-danger"> *</span>
                </label>
                {/* <input type="date" class="form-control " id="exampleFormControlInput1" value={courseStartingDate} onChange={(e) => {
                  setCourseStatingDate(e.target.value)
                  console.log(e.target.value)
                }} /> */}
                <DatePickerWidget
                  className={`form-control w-100 h-75 px-2 } `}
                  id="exampleFormControlInput1"
                  onChange={(e) => {
                    setCourseStatingDate(
                      e ? timestampToYYYYMMDD(new Date(e).getTime()) : null
                    );
                  }}
                  toggleCalendarOnIconClick
                  selected={courseStartingDate ? courseStartingDate : null}
                  dateFormat={formatDateInputType(
                    regionalData.selectedCountry.dateFormat
                  )}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  placeholderText={getCookie("dateFormat")}
                  onBlur={() => {}}
                  popperClassName="z-100"
                />
              </Col>

              <Col xl={4} lg={6} className="mb-4">
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label   "
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "CourseDuration"
                    ) || {}
                  ).mvalue || "nf Course Duration"}
                  <span className="text-danger"> *</span>
                </label>
                <div class="input-group ">
                  <input
                    type="number"
                    class="form-control"
                    id="exampleFormControlInput1"
                    placeholder={`${contentLabel(
                      "Enter",
                      "nf Enter"
                    )} ${contentLabel("CourseDuration", "nf Course Duration")}`}
                    value={durationNumber}
                    onChange={(e) => setDurationNumber(e.target.value)}
                  />
                  <select
                    class="form-select form-select-md"
                    aria-label=".form-select-lg example"
                    value={durationPhase}
                    onChange={(e) => setDurationPhase(e.target.value)}
                  >
                    <option value="Hours">
                      {" "}
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Hours"
                        ) || {}
                      ).mvalue || "nf Hours"}
                    </option>
                    <option value="Days">
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
                    <option value="Months" selected>
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Months"
                        ) || {}
                      ).mvalue || "nf Months"}
                    </option>
                    <option value="Years">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Years"
                        ) || {}
                      ).mvalue || "nf Years"}
                    </option>
                  </select>
                </div>
              </Col>

              <Col xl={4} lg={6} className="mb-4">
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label  "
                >
                  {" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "CoursePrice"
                    ) || {}
                  ).mvalue || "nf Course Price"}
                  <span className="text-danger"> *</span>
                </label>
                <div class="input-group">
                  <input
                    type="number"
                    class="form-control"
                    style={{ width: "50%" }}
                    id="exampleFormControlInput1"
                    placeholder={`${contentLabel(
                      "Enter",
                      "nf Enter"
                    )} ${contentLabel("CoursePrice", "nf Course Price")}`}
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
                    options={[
                      { value: "INR", label: "INR" },
                      { value: "USD", label: "USD" },
                    ]}
                    placeholder={"Currency"}
                    isValidNewOption={() => false}
                    onChange={(newValue) => {
                      console.log(newValue);
                      if (newValue) {
                        setCurrencyInput(newValue.value);
                      } else {
                        setCurrencyInput("");
                      }
                    }}
                    value={{ label: currencyInput, value: currencyInput }}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary25: "#f5f5f5",
                        primary: "var(--primary-color)",
                        primary50: "#f5f5f5",
                      },
                    })}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        width: "12rem",
                        border:
                          state.isFocused || state.isActive
                            ? "1px solid var(--primary-color)"
                            : "1px solid #ced4da", // Customize bottom border style
                        boxShadow: state.isFocused ? "none" : "none", // Remove the default focus box-shadow
                        ":hover": {
                          border: error ? "2px solid #d9534f" : "",
                        },
                      }),
                      valueContainer: (provided) => ({
                        ...provided,
                        padding: "0.325rem 0.75rem",
                        borderRadius: "var(--bs-border-radius)",
                      }),
                    }}
                  />
                </div>
              </Col>

              {/* <div class="mb-4 w-50">
              <label for="exampleFormControlInput1" class="form-label text-label  "> {(content[selectedLanguage]?.find(item => item.elementLabel === 'CourseStatus') || {}).mvalue || "nf Course Status"}</label>
              <div class="input-group ">
                <select class="form-select form-select-md" aria-label=".form-select-lg example" value={courseStatus} onChange={e => setCourseStatus(e.target.value)} >
                  <option value="Not started" selected> {(content[selectedLanguage]?.find(item => item.elementLabel === 'OnGoing') || {}).mvalue || "nf On-going"}</option>
                  <option value="On-going" >{(content[selectedLanguage]?.find(item => item.elementLabel === 'NotStarted') || {}).mvalue || "nf Not started"}</option>
                  <option value="On-hold">{(content[selectedLanguage]?.find(item => item.elementLabel === 'OnHold') || {}).mvalue || "nf On-hold "}</option>
                  <option value="Completed">{(content[selectedLanguage]?.find(item => item.elementLabel === 'Completed') || {}).mvalue || "nf Completed"}</option>
                </select>
              </div>
            </div> */}
            </Row>
            <div class=" d-flex justify-content-between gap-2 ">
              {/* <button class="btn btn-primary d-flex justify-content-center align-items-center gap-2 " onClick={() => {
                setSteps((prev) => {
                  return { ...prev, step1: false }
                })
                showSuccessToast('Course details added successfully')
              }} >Back  </button> */}
              <div></div>
              <button
                class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  if (validateForm()) {
                    // Proceed with form submission or next step
                    setSteps((prev) => {
                      return { ...prev, step1: true };
                    });
                  } else {
                    showErrorToast(
                      contentLabel(
                        "PleaseFillAllRequiredFields",
                        "nf Please fill all required fields"
                      )
                    );
                  }
                }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Next"
                  ) || {}
                ).mvalue || "nf Next"}{" "}
              </button>
            </div>
          </>
        )}

        {steps.step1 && !steps.step2 && (
          <div className="">
            <div className="d-flex gap-3  justify-content-center align-items-center">
              <div class="mb-4 w-75" style={{ position: "relative" }}>
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label"
                >
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
                                <span>{suggestion?.skillOccupation}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {skill.skillId.length > 2 && suggestionLoader && (
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
                    SkillSuggestions[0]?.skillOccupation ===
                      "No suggestions found" && (
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
                            {contentLabel(
                              "NoSuggestionsFound",
                              "nf No suggestions found"
                            )}
                          </h5>
                        </div>
                      </div>
                    )}
                </>
              </div>

              {/* <div class="mb-4 d-flex flex-column ">
                  <label for="exampleFormControlInput1" class="form-label text-label">Mandatory</label>
                  <input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.mandatory} onChange={e => setSkill({ ...skill, mandatory: e.target.checked })} />
                </div> */}
              <div>
                {/* <SecondaryBtn label={'Add'} className='p-1' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={(e) => handleAddSkill(e)} /> */}
              </div>
            </div>
            <div style={{ minHeight: "19.5rem" }}>
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
                      ).mvalue || "nf Prerequisite Skills"}
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
                            {/* <td className='p-1' scope="row"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.exclude} onChange={(e) => handlePrerequisiteValueChange(e, index, 'exclude')} /></td> */}
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
                            {/* <td className='p-1' scope="row"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.exclude} onChange={(e) => handlePrerequisiteValueChange(e, index, 'exclude')} /></td> */}
                          </>
                        )}
                        <td className="p-1" scope="row">
                          <icons.DeleteOutlineOutlinedIcon
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
              {/* <button class="btn btn-primary   " style={{ backgroundColor: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>Cancel</button> */}
              <button
                class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  setSteps((prev) => {
                    return { ...prev, step1: false };
                  });
                }}
              >
                {" "}
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Back"
                  ) || {}
                ).mvalue || "nf Back"}{" "}
              </button>
              <button
                class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  // if (prerequisiteSkills.length > 0) {
                  //   setSteps((prev) => {
                  //     return { ...prev, step2: true }
                  //   })
                  // } else {
                  //   showErrorToast('Prerequsite skills required')
                  // }
                  setSteps((prev) => {
                    return { ...prev, step2: true };
                  });
                }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Next"
                  ) || {}
                ).mvalue || "nf Next"}{" "}
              </button>
            </div>
          </div>
        )}

        {steps.step1 && steps.step2 && !steps.step3 && (
          <div className="">
            <div className="d-flex gap-3 justify-content-center align-items-center mb-4">
              <div class="mb-1 w-50" style={{ position: "relative" }}>
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label"
                >
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
                  <span className="text-danger"> *</span>
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
                                handleSkillsAttainableSuggestionClick(
                                  suggestion
                                )
                              }
                            >
                              <td>
                                <span>{suggestion?.skillOccupation}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {topics.skillId.length > 2 && suggestionLoader && (
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
                    SkillSuggestions[0]?.skillOccupation ===
                      "No suggestions found" && (
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
                            {contentLabel(
                              "NoSuggestionsFound",
                              "nf No suggestions found"
                            )}
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
                <label
                  for="exampleFormControlInput1"
                  class="form-label text-label"
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Skills/Topic"
                    ) || {}
                  ).mvalue || "nf Skills/Topic"}{" "}
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "ProjectDuration"
                    ) || {}
                  ).mvalue || "nf ProjectDuration"}
                  <span className="text-danger"> *</span>
                </label>
                <div class="input-group ">
                  <input
                    type="number"
                    class="form-control"
                    style={{ width: "5rem" }}
                    id="exampleFormControlInput1"
                    value={topics?.duration}
                    onChange={(e) =>
                      setTopics({ ...topics, duration: e.target.value })
                    }
                  />
                  <select
                    class="form-select form-select-md"
                    style={{ width: "6rem" }}
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
                {/* <SecondaryBtn label={'Add'} className='p-1' style={{ backgroundColor: 'var(--primary-color)', color: 'white' }} onClick={(e) => handleAddTopic(e)} /> */}
                <button
                  className="btn btn-secondary ms-3"
                  style={{ alignSelf: "baseline" }}
                  onClick={(e) => handleAddTopic(e)}
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Add"
                    ) || {}
                  ).mvalue || "nf Add"}{" "}
                </button>
              </div>
            </div>

            <div style={{ minHeight: "19.5rem" }}>
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
                      <tr>
                        <td className="p-1" scope="col">
                          {index + 1}
                        </td>
                        <td className="p-1" scope="col">
                          {topic.skillId}
                        </td>
                        <td className="p-1" scope="col">
                          {topic.duration} {topic.durationPhase}
                        </td>
                        <td
                          className="p-1"
                          scope="col"
                          style={{
                            color: "var(--primary-color)",
                            cursor: "pointer",
                          }}
                        >
                          <icons.DeleteOutlineOutlinedIcon
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
                class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  setSteps((prev) => {
                    return { ...prev, step2: false };
                  });
                }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Back"
                  ) || {}
                ).mvalue || "nf Back"}{" "}
              </button>
              <button
                class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                onClick={() => {
                  if (courseTopics.length > 0) {
                    setSteps({
                      step1: true,
                      step2: true,
                      step3: true,
                    });
                  } else {
                    showErrorToast(
                      contentLabel(
                        "PleaseFillAllRequiredFields",
                        "nf Please fill all required fields"
                      )
                    );
                  }
                }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Next"
                  ) || {}
                ).mvalue || "nf Next"}{" "}
              </button>
            </div>
          </div>
        )}

        {steps.step1 && steps.step2 && steps.step3 && !steps.step4 && (
          <CourseQuestions setSteps={setSteps} />
        )}

        {steps.step1 &&
          steps.step2 &&
          steps.step3 &&
          steps.step4 &&
          !steps.step5 && (
            <section>
              <section
                className="row"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
                <div className="col-lg-12  p-4">
                  <div className="d-flex align-items-center">
                    <div
                      className={`border p-1 d-inline-block rounded ${
                        isLoading && "skeleton-loading"
                      }`}
                    >
                      {/* {
                    !imgLoadingState &&
                        userInfo?.profilePictureFileName &&
                        userInfo?.profilePictureFileName.length > 2 && (
                          <LazyLoadingImageComponent
                            style={{
                              objectFit: "cover",
                              display: imgLoadingState ? "none" : "block",
                            }}
                            src={GetAttachment(
                              userInfo?.id,
                              profilePicObj?.fileName,
                              profilePicObj?.fileId
                            )}
                            alt="Profile picture"
                            className="rounded-circle"
                            width="150"
                            height="150"
                            onLoad={() => setImgLoadingState(false)}
                          />)


                  } */}

                      <LazyLoadingImageComponent
                        src={selectedImage || images.company_image}
                        className={`${isLoading & "skeleton-loading"}`}
                        alt={"Company-Image"}
                        style={{ width: "100px", height: "100px" }}
                        onError={(e) => {
                          e.target.src = images.company_image;
                        }}
                      />
                    </div>
                    <div style={{ marginLeft: "20px" }}>
                      <h2
                        style={{ color: navBarBgColor }}
                        className={`${isLoading ? "skeleton-loading" : ""}`}
                      >
                        {courseName}
                      </h2>

                      <div className="d-md-flex align-items-center mt-3">
                        <div className="d-md-flex  align-items-center">
                          <icons.BusinessCenterOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">{courseStartingDate}</span>
                        </div>
                        <div className="d-md-flex align-items-center  ms-md-5">
                          <icons.FmdGoodOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">{selectedLocations}</span>
                        </div>
                        <div className="d-md-flex align-items-center ms-md-5">
                          <icons.AccessTimeOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          <span className="ms-2">
                            {durationNumber && (
                              <>
                                {durationNumber}&nbsp;
                                {durationPhase}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section
                className="row"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
                <article className="col-lg-12  p-4">
                  <div className="mb-4">
                    <h3
                      className="h5 d-flex align-items-center mb-4 fw-bold"
                      style={{ color: navBarBgColor }}
                    >
                      {contentLabel("Description", "nf Description")}
                    </h3>
                    <p className={`${isLoading ? "skeleton-loading" : ""} `}>
                      {courseDescription}
                    </p>
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} `}
                    ></p>
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} `}
                    ></p>
                  </div>

                  <div className="mb-2 d-flex gap-3">
                    <strong className="fw-bold">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "SkillerName"
                        ) || {}
                      ).mvalue || "nf Skiller Name"}
                      :
                    </strong>
                    {skillerName}
                  </div>

                  <div className="mb-2 ">
                    <span className="fw-bold me-3">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "SkillerBio"
                        ) || {}
                      ).mvalue || "nf Skiller Bio"}
                      :
                    </span>
                    {skillerBio}
                  </div>
                </article>
              </section>

              <section
                className="row   p-4"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
                <div className="col-lg-6 p-0">
                  <h3
                    className="h5 d-flex align-items-center mb-4 fw-bold"
                    style={{ color: navBarBgColor }}
                  >
                    {contentLabel("SkillsAttainable", "nf Skills Attainable")}
                  </h3>

                  <table class="table">
                    <thead>
                      <tr style={{ border: "white" }}>
                        {/* <th className='p-1' scope="col">#</th> */}
                        <th className="p-1 w-75" scope="col">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Skills/Topic"
                            ) || {}
                          ).mvalue || "nf Skills/Topic"}
                        </th>
                        <th className="p-1 w-25" scope="col">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "ProjectDuration"
                            ) || {}
                          ).mvalue || "nf ProjectDuration"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseTopics.map((topic, index) => {
                        return (
                          <tr style={{ border: "white" }}>
                            {/* <td className='p-1' scope="col">{index + 1}</td> */}
                            <td className="p-1 w-75" scope="col">
                              {topic.skillId}
                            </td>
                            <td className="p-1  w-25" scope="col">
                              {topic.duration} {topic.durationPhase}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <article
                  className="col-lg-6 "
                  style={{ borderLeft: "2px solid var(--light-color)" }}
                >
                  <aside className="">
                    <h3
                      className=" h5 mb-4 fw-bold"
                      style={{ color: navBarBgColor }}
                    >
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "CourseSummary"
                        ) || {}
                      ).mvalue || "nf Course Summary"}
                    </h3>
                    <ul className="list-unstyled pl-3 mb-0">
                      <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CourseLanguage"
                            ) || {}
                          ).mvalue || "nf Course Language"}
                          :
                        </strong>
                        <p
                          className={`${
                            isLoading ? "skeleton-loading" : ""
                          } mb-0`}
                        >
                          {selectedLanguages.map((lan) => lan.value).join(", ")}
                        </p>
                      </li>

                      <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CourseLocation"
                            ) || {}
                          ).mvalue || "nf CourseLocation"}
                          :
                        </strong>
                        <p
                          className={`${
                            isLoading ? "skeleton-loading" : ""
                          } mb-0`}
                        >
                          {selectedLocations}
                        </p>
                      </li>
                      <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CoursePrice"
                            ) || {}
                          ).mvalue || "nf Course Price"}
                          :
                        </strong>
                        <p
                          className={`${
                            isLoading ? "skeleton-loading" : ""
                          } mb-0`}
                        >
                          {price}&nbsp;
                          {currencyInput}
                        </p>
                      </li>
                      {linkAttachment.length > 0 && (
                        <li className="mb-2 d-flex gap-3">
                          <strong className="fw-bold">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "CoursePdf"
                              ) || {}
                            ).mvalue || "nf Course Pdf"}
                            :
                          </strong>
                          <p
                            className={`${
                              isLoading ? "skeleton-loading" : ""
                            } mb-0`}
                          >
                            {linkAttachment?.map((attachment) => {
                              return (
                                <div className="d-flex ">
                                  <div>{attachment?.fileName}</div>
                                  <div>
                                    <a
                                      rel="noreferrer"
                                      href={GetAttachment(getCookie("userId"),
                                        attachment?.fileName,
                                        attachment?.fileId
                                      )}
                                      target="_blank"
                                    >
                                      {!attachment?.fileName?.endsWith(
                                        ".mp4"
                                      ) ? (
                                        <MdOpenInNew
                                          className="ms-2"
                                          style={{
                                            color: "var(--primary-color)",
                                            height: "16px",
                                            width: "16px",
                                          }}
                                        />
                                      ) : (
                                        <MdPlayCircleOutline
                                          className="ms-2"
                                          style={{
                                            color: "var(--primary-color)",
                                            height: "16px",
                                            width: "16px",
                                          }}
                                        />
                                      )}
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </p>
                        </li>
                      )}

                      {userDetails[0]?.profilePictureFileName && (
                        <li className="mb-2 d-flex gap-3">
                          <strong className="fw-bold">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Agency"
                              ) || {}
                            ).mvalue || "nf Agency"}
                            :
                          </strong>{" "}
                          <p
                            className={`${
                              isLoading ? "skeleton-loading" : ""
                            } mb-0`}
                          >
                            <div className="d-flex ">
                              <div>
                                {userDetails[0]?.firstName}{" "}
                                {userDetails[0]?.lastName}
                              </div>
                              <div>
                                <a
                                  rel="noreferrer"
                                  href={GetAttachment(
                                    userDetails[0]?.id,
                                    profilePicObj?.fileName,
                                    profilePicObj?.fileId
                                  )}
                                  target="_blank"
                                >
                                  <MdOpenInNew
                                    className="ms-2"
                                    style={{
                                      color: "var(--primary-color)",
                                      height: "16px",
                                      width: "16px",
                                    }}
                                  />
                                </a>
                              </div>
                            </div>
                          </p>
                        </li>
                      )}
                      {/* {
                      linkImage.length > 0 &&

                      <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CourseImage"
                            ) || {}
                          ).mvalue || "nf Course Image"}
                          :
                        </strong>
                        <p className={`${isLoading ? "skeleton-loading" : ""} mb-0`}>
                          {
                            linkImage?.map((attachment) => {
                              return (
                                <div className='d-flex '>
                                  <div>{attachment?.fileName}</div>
                                  <div>
                                    <a
                                      rel="noreferrer"
                                      href={GetAttachment(
                                       getCookie("userId"),
                                        attachment?.fileName,
                                        attachment?.fileId
                                      )}
                                      target="_blank"
                                    >
                                      {!attachment?.fileName?.endsWith(
                                        ".mp4"
                                      ) ? (
                                        <MdOpenInNew
                                          className="ms-2"
                                          style={{
                                            color: "var(--primary-color)",
                                            height: "16px",
                                            width: "16px",
                                          }}
                                        />
                                      ) : (
                                        <MdPlayCircleOutline
                                          className="ms-2"
                                          style={{
                                            color: "var(--primary-color)",
                                            height: "16px",
                                            width: "16px",
                                          }}
                                        />
                                      )}
                                    </a>
                                  </div>
                                </div>
                              )
                            })

                          }
                        </p>
                      </li>
                    } */}

                      <li className="mb-2 d-flex gap-3">
                        <strong className="fw-bold">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CourseStartDate"
                            ) || {}
                          ).mvalue || "nf Course Start Date"}
                          :
                        </strong>
                        {courseStartingDate}
                      </li>
                    </ul>
                  </aside>
                </article>
              </section>

              <section
                className="row align-items-center  p-4"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
                <div className="col-lg-12 p-0">
                  <h3
                    className="h5 d-flex align-items-center mb-4 fw-bold"
                    style={{ color: navBarBgColor }}
                  >
                    {contentLabel("Prerequisite", "nf Prerequisite")}
                  </h3>

                  <div className="d-flex flex-wrap gap-3">
                    {prerequisiteSkills?.map((skill, i) => {
                      return (
                        <div
                          key={i}
                          className={`border border-4 rounded p-2 d-flex align-items-center text-center me-2`}
                          style={{ background: "none", color: "black" }}
                        >
                          {skill.mandatory && (
                            <div
                              style={{
                                color: navBarBgColor,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <FaStar />
                            </div>
                          )}

                          <div
                            className={`ms-2`}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {skill?.skillId}
                          </div>
                          <div
                            className={`ms-2 ${
                              isLoading ? "skeleton-loading" : ""
                            }`}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className={`rounded p-2 px-2 d-flex gap-2 align-items-center text-center mt-3 border border-4 border-white
                  }`}
                    style={{ background: "none", color: "black" }}
                  >
                    <span
                      className="d-flex align-items-center"
                      style={{ color: navBarBgColor }}
                    >
                      <FaStar />
                    </span>
                    {contentLabel(
                      "TheseSkillsAreMandatory",
                      "nf These Skills Are Mandatory"
                    )}
                  </div>
                </div>
              </section>

              <div class=" d-flex justify-content-between gap-2 pt-4">
                <button
                  class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                  onClick={() => {
                    setSteps((prev) => {
                      return { ...prev, step4: false };
                    });
                  }}
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Back"
                    ) || {}
                  ).mvalue || "nf Back"}{" "}
                </button>

                <div className="d-flex gap-3">
                  <button
                    class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                    onClick={() => {
                      {
                        createCourseLoading && (
                          <div
                            class="spinner-border spinner-border spinner-border-sm text-light me-2"
                            role="status"
                          >
                            <span class="sr-only">Loading...</span>
                          </div>
                        );
                      }
                      handleCourseSubmit("DRAFT");
                    }}
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Save"
                      ) || {}
                    ).mvalue || "nf Save"}{" "}
                  </button>
                  <button
                    class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                    onClick={() => {
                      handleCourseSubmit("PUBLISH");
                    }}
                  >
                    {createCourseLoading && (
                      <div
                        class="spinner-border spinner-border spinner-border-sm text-light me-2"
                        role="status"
                      >
                        <span class="sr-only">Loading...</span>
                      </div>
                    )}
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Publish"
                      ) || {}
                    ).mvalue || "nf Publish"}{" "}
                  </button>
                </div>
              </div>
            </section>
          )}
      </div>
    </>
  );
};

export default CreateCourse;
