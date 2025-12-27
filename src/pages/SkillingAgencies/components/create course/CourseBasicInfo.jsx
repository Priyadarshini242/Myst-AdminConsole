import useContentLabel from "../../../../hooks/useContentLabel";
import Gallery from "../../../../components/molecules/Gallery/Gallery";
import Files from "../../../../components/molecules/Files/Files";
import { GetAttachment } from "../../../../api/Attachment  API/DownloadAttachmentApi";
import GetAllLangApi from "../../../../api/content/GetAllLangApi";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import {
  setCourseQuestions,
  setCreateCoursePrequestSkills,
  setDeletePreSkillInCreate,
  setCreateCourseAptainquestSkills,
  setDeleteAptainSkillInCreate,
  setCourseInfo,
} from "../../../../reducer/skilling agency/create course/createCourseSlice";

import BriefDescriptionTextArea from "../../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea";
import MultiSelect from "../../../../components/SkillOwner/SelectComponent/MultiSelect";

import { icons, images } from "../../../../constants";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";

import React, {
  useContext,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import CreatableSelect from "react-select/creatable";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row } from "react-bootstrap";

const CourseBasicInfo = ({
  setisDirty,
  externalLinks,
  subCategories,
  categories,
  setSelectedImage,
  linkImage,
  setLinkImage,
  linkAttachment,
  setLinkAttachment,
  selectedLocations,
  setSelectedLocations,
  setSteps,
  handleSaveCourse,
  setisActivePreskill,
  isCourseLoading,
}) => {
  const {
    myCoursesList: data,
    status,
    error,
  } = useSelector((state) => state.myCourses);

  const [filterCurrency, setFilterCurrency] = useState([]);

  const contentLabel = useContentLabel();
  const content = useSelector((state) => state.content);
  const regionalData = useSelector((state) => state.regionalData);
  //const {courseinfo} = useSelector((state) => state.createCourse);
  const selectedLanguage = useSelector((state) => state.language);
  const dispatch = useDispatch();
  const [filterLanguage, setFilterLanguage] = useState([]);
  //const [courseStartingDate, setCourseStatingDate] = useState("");
  const { courseinfo, skills, saveStatus, deleteSkillInCreate } = useSelector(
    (state) => state.createCourse
  );

  //const [currencyInput, setCurrencyInput] = useState("");
  // const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState("");
  //const [selectedImage, setSelectedImage] = useState(null);
  const [coursePdf, setCoursePdf] = useState(null);
  const [online, setOnline] = useState(selectedLocations?.includes("Online"));

  // const [selectedLocations, setSelectedLocations] = useState('');

  const components = {
    DropdownIndicator: null,
  };

  useEffect(() => {
    if (regionalData?.listOfCountries) {
      const uniqueCurrencies =
        Array.from(
          new Set(regionalData?.listOfCountries?.map((item) => item?.currency))
        )?.map((currency) => ({
          value: currency,
          label: currency,
        })) || [];

      setFilterCurrency(uniqueCurrencies);
    }
  }, [regionalData]);

  useEffect(() => {
    GetAllLangApi().then((res) => {
      const data = res.data;
      setFilterLanguage(
        data?.map((item) => ({
          value: item.name,
          label: item.name,
        }))
      );
    });
  }, []);
  //POST API ERRORS
  const [errors, setErrors] = useState(false);

  // const [linkImage, setLinkImage] = useState([]);
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
    setLinkImage([{ ...image }]);
    const imageUrl = GetAttachment(
      image?.userId,
      image?.fileName,
      image?.fileId
    );
    console.log("inside", courseinfo);
    //dispatch(setCourseInfo({...courseinfo, 'linkImage': [{ ...image }],['imageUrl']:imageUrl}))
    //dispatch(setCourseInfo({...courseinfo,['imageUrl']:imageUrl}))
    setSelectedImage(imageUrl);
  }, []);

  //  const [linkAttachment, setLinkAttachment] = useState([]);
  const [openFile, setOpenFile] = useState(false);
  /* HANDLE FILE CLOSE */
  const handleFileClose = useCallback(() => {
    setOpenFile(false);
  }, []);

  /* HANDLE FILE OPEN */
  const handleFileOpen = useCallback(() => {
    setOpenFile(true);
  }, []);
  /* HANDLE SELECT FILE */
  const handleSelectFile = useCallback((file) => {
    setLinkAttachment([{ ...file }]);
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!courseinfo?.courseName)
      newErrors.courseName = "Course Name is required.";
    if (courseinfo?.courseDescription?.length > 1000)
      newErrors.courseDescription = "Course Description length exceeded.";
    if (courseinfo?.skillerBio?.length > 1000)
      newErrors.skillerBio = "Skiller Bio length exceeded.";

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  function convertTimestampToDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const handleChange = (fieldName, value) => {
    //Course name validation
    if (fieldName === "courseName" && value && value.trim().length > 100) {
      return value.slice(0, 101).trim();
    } else if (
      fieldName === "skillerName" &&
      value &&
      value.trim().length > 100
    ) {
      return value.slice(0, 101).trim();
    }

    return value ? value?.trimStart() : "";
  };

  return (
    <>
      <div>
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
      </div>
      <div>
        <Row>
          <Col xl={6} className="mb-3">
            <label className="form-label fw-bold">
              {contentLabel(
                "DoYouWantToListJdOnExternal",
                "nf Do you want to list Jd on External sites?"
              )}
            </label>

            <Col className="d-flex gap-4 align-content-center">
              {/* Yes == internal */}
              <div className="d-flex gap-2 align-content-center">
                <input
                  type="radio"
                  id="Internal"
                  name="fav_language"
                  value="Internal"
                  checked={!(courseinfo?.userCourseType === "External")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      dispatch(
                        setCourseInfo({
                          ...courseinfo,
                          userCourseType: "Internal",
                          externalSite: "",
                          isBasicButton: false,
                        })
                      );
                    }
                  }}
                />
                <label
                  className="form-label mb-0"
                  style={{ fontWeight: "500" }}
                  for="Internal"
                >
                  {contentLabel("Yes", "nf Yes")}
                </label>
              </div>

              {/* No == internal */}
              <div className="d-flex gap-2 align-content-center">
                <input
                  type="radio"
                  id="External"
                  name="fav_language"
                  value="External"
                  checked={courseinfo?.userCourseType === "External"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      dispatch(
                        setCourseInfo({
                          ...courseinfo,
                          userCourseType: "External",
                          isBasicButton: false,
                        })
                      );
                    }
                  }}
                />
                <label
                  className="form-label mb-0"
                  style={{ fontWeight: "500" }}
                  for="External"
                >
                  {contentLabel("No", "nf No")}
                </label>
              </div>
            </Col>
          </Col>
          <Col xl={6} lg={6} className="mb-2">
            <div class="mb-3">
              <label
                for="formFile form-label text-label "
                class="form-label fw-bold"
              >
                {(
                  content[selectedLanguage].find(
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
                  {linkAttachment[0]?.fileName && (
                    <icons.FaTimes
                      onClick={() => {
                        setLinkAttachment([]);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </Col>
          {!(courseinfo?.userCourseType === "External") && (
            <Col xl={6} className="mb-3">
              <label className="form-label fw-bold">
                {/* {contentLabel("ExternalSite", "nf External Site")}{" "} */}
                {contentLabel("Website", "nf Website")}
              </label>
              <select
                className="form-select"
                aria-label="Select..."
                onChange={(e) => {
                  const selectedOption =
                    e.target.options[e.target.selectedIndex];
                  const selectedId = selectedOption.getAttribute("data-id");
                  dispatch(
                    setCourseInfo({
                      ...courseinfo,
                      extSiteId: selectedId,
                      externalSite: e.target.value,
                      isBasicButton: false,
                    })
                  );

                  // console.log(selectedId);  // Logs the id of the selected option
                }}
                value={courseinfo.externalSite || ""}
              >
                <option value="" disabled>
                  {contentLabel("PleaseSelectSite", "nf Please Select Site")}{" "}
                </option>
                {Array.isArray(externalLinks) &&
                  externalLinks.map(
                    (Options, i) =>
                      Options.extSiteName && (
                        <option
                          key={i}
                          value={Options.extSiteName}
                          data-id={Options.id}
                        >
                          {Options.extSiteLabel}
                        </option>
                      )
                  )}
              </select>
            </Col>
          )}
          <Col xl={6} className="mb-3">
            <label className="form-label fw-bold">
              {contentLabel("Category", "nf Category")}{" "}
            </label>
            <select
              disabled={
                courseinfo?.externalSite
                  ? false
                  : !(courseinfo?.userCourseType === "External")
                  ? true
                  : false
              }
              className="form-select"
              aria-label="Select Category"
              onChange={(e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                const selectedId = selectedOption.getAttribute("data-id");

                dispatch(
                  setCourseInfo({
                    ...courseinfo,
                    userCategory: e.target.value,
                    userSubCategory: selectedId,
                    isBasicButton: false,
                  })
                );
              }}
              value={courseinfo.userCategory || ""}
            >
              <option value="" disabled>
                {contentLabel(
                  "PleaseSelectCategory",
                  "nf Please select a Category"
                )}
              </option>
              {Array.isArray(categories) &&
                categories.map((Options, i) => {
                  const isValidExternalSite =
                    typeof courseinfo.externalSite !== "string" ||
                    courseinfo.externalSite.trim().length === 0 ||
                    courseinfo?.userCourseType === "External" ||
                    courseinfo.externalSite === Options.extSiteLabel;
                  return (
                    Options.categoryName &&
                    isValidExternalSite && (
                      <option
                        key={i}
                        value={Options.categoryName}
                        data-id={Options.id}
                      >
                        {Options.categoryName}
                      </option>
                    )
                  );
                })}
            </select>
          </Col>
          {/*CourseName*/}
          <Col xl={6} lg={6}>
            <div class="mb-2">
              <label
                for="exampleFormControlInput1"
                class="form-label text-label fw-bold "
              >
                {contentLabel("CourseName", "nf Course Name")}
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
                value={courseinfo?.courseName}
                onChange={(e) => {
                  dispatch(
                    setCourseInfo({
                      ...courseinfo,
                      courseName: handleChange("courseName", e.target.value),
                      isBasicButton: false,
                    })
                  );
                  setisDirty(true);
                }}
              />
            </div>
          </Col>
          {/*Course Image*/}
          <Col xl={6} lg={6} className="mb-2">
            <div class="mb-3">
              <label
                for="formFile form-label text-label "
                class="form-label fw-bold"
              >
                {(
                  content[selectedLanguage].find(
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
                  {linkImage[0]?.fileName && (
                    <icons.FaTimes
                      onClick={() => {
                        setLinkImage([]);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </Col>
          {/*Description*/}
          <Col xl={12} lg={12}>
            <div class="mb-2">
              <label
                for="exampleFormControlTextarea1 "
                class="form-label text-label fw-bold"
              >
                {contentLabel("Description", "nf Description")}
              </label>
              <BriefDescriptionTextArea
                limit={3000}
                class="form-control"
                id="exampleFormControlTextarea1"
                rows="3"
                placeholder={`${contentLabel(
                  "Enter",
                  "nf Enter"
                )} ${contentLabel("Description", "nf Description")}`}
                value={courseinfo?.courseDescription}
                onChange={(e) => {
                  dispatch(
                    setCourseInfo({
                      ...courseinfo,
                      courseDescription: e.target.value,
                      isBasicButton: false,
                    })
                  );
                }}
              ></BriefDescriptionTextArea>
            </div>
          </Col>

          {/*SkillerName */}
          <Col xl={6} lg={6} className="mb-2">
            <label
              for="exampleFormControlInput1"
              class="form-label text-label fw-bold "
            >
              {(
                content[selectedLanguage].find(
                  (item) => item.elementLabel === "SkillerName"
                ) || {}
              ).mvalue || "nf SkillerName"}
            </label>
            <input
              type="text"
              class="form-control "
              id="exampleFormControlInput1"
              placeholder={`${contentLabel("Enter", "nf Enter")} ${contentLabel(
                "SkillerName",
                "nf Skiller Name"
              )}`}
              value={courseinfo?.skillerName}
              onChange={(e) => {
                dispatch(
                  setCourseInfo({
                    ...courseinfo,
                    skillerName: handleChange("skillerName", e.target.value),
                    isBasicButton: false,
                  })
                );
              }}
            />
          </Col>
          <Col xl={6} lg={6}>
            <div className="mb-4">
              <label
                for="exampleFormControlInput1"
                class="form-label text-label m-1 p-0 fw-bold"
              >
                {contentLabel("NumberOfOpenings", "nf Number Of Openings")}
              </label>
              <div className="d-flex gap-3">
                <input
                  type="number"
                  class="form-control  "
                  id="exampleFormControlInput1"
                  placeholder={`${contentLabel(
                    "Enter",
                    "nf Enter"
                  )} ${contentLabel(
                    "NumberOfOpenings",
                    "nf Number Of Openings"
                  )}`}
                  value={courseinfo?.openings}
                  onChange={(e) => {
                    dispatch(
                      setCourseInfo({
                        ...courseinfo,
                        openings: e.target.value,
                        isBasicButton: false,
                      })
                    );
                  }}
                />
              </div>
            </div>
          </Col>
          <Col xl={12} lg={12} className="mb-2">
            <label
              for="exampleFormControlTextarea1 "
              class="form-label text-label fw-bold"
            >
              {" "}
              {(
                content[selectedLanguage].find(
                  (item) => item.elementLabel === "SkillerBio"
                ) || {}
              ).mvalue || "nf Skiller Bio"}
            </label>
            <BriefDescriptionTextArea
              class="form-control"
              id="exampleFormControlTextarea1"
              rows="3"
              placeholder={`${contentLabel("Enter", "nf Enter")} ${contentLabel(
                "SkillerBio",
                "nf Skiller Bio"
              )}`}
              value={courseinfo?.skillerBio}
              onChange={(e) => {
                dispatch(
                  setCourseInfo({
                    ...courseinfo,
                    skillerBio: e.target.value,
                    isBasicButton: false,
                  })
                );
              }}
            ></BriefDescriptionTextArea>
          </Col>

          <Col xl={6} lg={6}>
            <div className="mb-4">
              <label for="location" class="form-label text-label fw-bold">
                {contentLabel("Languages", "nf Languages")}
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
                  placeholder={"Add Location and Press Enter"}
                  options={languageInput.length >= 3 ? filterLanguage : []}
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  inputValue={languageInput}
                  onInputChange={(newValue) => setLanguageInput(newValue)}
                  isClearable
                  isValidNewOption={() => false}
                  onChange={(newValue) => {
                    dispatch(
                      setCourseInfo({
                        ...courseinfo,
                        courseLanguage: newValue,
                        isBasicButton: false,
                      })
                    );
                  }}
                  value={courseinfo?.courseLanguage}
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
            </div>
          </Col>
          <Col xl={6} lg={6}>
            <div className="mb-4">
              <label
                for="exampleFormControlInput1"
                class="form-label text-label m-0 p-0 fw-bold"
              >
                {contentLabel("CourseStartDate", "nf Course Start Date")}
              </label>
              <input
                type="date"
                class="form-control "
                id="exampleFormControlInput1"
                defaultValue={convertTimestampToDate(
                  courseinfo?.courseStartingDate
                )}
                onChange={(e) => {
                  dispatch(
                    setCourseInfo({
                      ...courseinfo,
                      courseStartingDate: FormatDateIntoPost(e.target.value),
                      isBasicButton: false,
                    })
                  );
                }}
              />
            </div>
          </Col>
          <Col xl={6} lg={6}>
            <div className="mb-4">
              <label
                for="exampleFormControlInput1"
                class="form-label text-label m-0 p-0 fw-bold"
              >
                {contentLabel("CoursePrice", "nf Course Price")}
              </label>
              {courseinfo?.price && <span className="text-danger"> *</span>}
              <div className="d-flex gap-3">
                <input
                  type="number"
                  class="form-control  "
                  id="exampleFormControlInput1"
                  placeholder={`${contentLabel(
                    "Enter",
                    "nf Enter"
                  )} ${contentLabel("CoursePrice", "nf Course Price")}`}
                  value={courseinfo?.price}
                  onChange={(e) => {
                    dispatch(
                      setCourseInfo({
                        ...courseinfo,
                        price: e.target.value,
                        isBasicButton: false,
                      })
                    );
                  }}
                />
                <CreatableSelect
                  isClearable
                  components={{
                    DropdownIndicator: () => null,
                    IndicatorSeparator: () => null,
                  }}
                  placeholder={"Currency"}
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
                  isValidNewOption={() => false}
                  onChange={(newValue) => {
                    if (newValue) {
                      dispatch(
                        setCourseInfo({
                          ...courseinfo,
                          currency: newValue.value,
                          isBasicButton: false,
                        })
                      );
                      //setCurrencyInput(newValue.value)
                    } else {
                      dispatch(
                        setCourseInfo({
                          ...courseinfo,
                          currency: "",
                          isBasicButton: false,
                        })
                      );
                      //setCurrencyInput("")
                    }
                  }}
                  value={
                    courseinfo?.currency
                      ? {
                          label: courseinfo.currency,
                          value: courseinfo.currency,
                        }
                      : null
                  }
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
                      minWidth: "250px",
                      maxWidth: "250px",
                      border:
                        state.isFocused || state.isActive
                          ? "1px solid var(--primary-color)"
                          : "1px solid #ced4da", // Customize bottom border style
                      boxShadow: state.isFocused ? "none" : "none", // Remove the default focus box-shadow
                    }),
                    valueContainer: (provided) => ({
                      ...provided,
                      padding: "0.325rem 0.75rem",
                      borderRadius: "var(--bs-border-radius)",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      maxHeight: "90px", // Set max height of dropdown
                      overflowY: "auto", // Enable vertical scrolling if needed
                    }),
                    menuList: (provided) => ({
                      ...provided,
                      maxHeight: "90px", // Limit height of the dropdown list
                      overflowY: "auto", // Add scrolling when items exceed max height
                    }),
                  }}
                />
              </div>
            </div>
          </Col>
          <Col xl={6} lg={6}>
            <div class="mb-4">
              <label
                for="exampleFormControlInput1"
                class="form-label text-label m-0 p-0 fw-bold"
              >
                {contentLabel("CourseDuration", "nf Course Duration")}
              </label>
              <div className="d-flex gap-3">
                <input
                  type="number"
                  class="form-control"
                  id="exampleFormControlInput1"
                  value={courseinfo?.durationNumber}
                  onChange={(e) => {
                    dispatch(
                      setCourseInfo({
                        ...courseinfo,
                        durationNumber: e.target.value,
                        isBasicButton: false,
                      })
                    );
                  }}
                />
                <select
                  class="form-select form-select-md"
                  aria-label=".form-select-lg example"
                  value={
                    courseinfo?.durationPhase
                      ? courseinfo?.durationPhase
                      : (
                          content[selectedLanguage].find(
                            (item) => item.elementLabel === "Weeks"
                          ) || {}
                        ).mvalue || "nf Weeks"
                  }
                  onChange={(e) => {
                    dispatch(
                      setCourseInfo({
                        ...courseinfo,
                        durationPhase: e.target.value,
                        isBasicButton: false,
                      })
                    );
                  }}
                >
                  <option value="Hours">
                    {" "}
                    {(
                      content[selectedLanguage].find(
                        (item) => item.elementLabel === "Hours"
                      ) || {}
                    ).mvalue || "nf Hours"}
                  </option>
                  <option value="Days">
                    {(
                      content[selectedLanguage].find(
                        (item) => item.elementLabel === "Days"
                      ) || {}
                    ).mvalue || "nf Days"}
                  </option>
                  <option value="Weeks">
                    {(
                      content[selectedLanguage].find(
                        (item) => item.elementLabel === "Weeks"
                      ) || {}
                    ).mvalue || "nf Weeks"}
                  </option>
                  <option value="Months" selected>
                    {(
                      content[selectedLanguage].find(
                        (item) => item.elementLabel === "Months"
                      ) || {}
                    ).mvalue || "nf Months"}
                  </option>
                  <option value="Years">
                    {(
                      content[selectedLanguage].find(
                        (item) => item.elementLabel === "Years"
                      ) || {}
                    ).mvalue || "nf Years"}
                  </option>
                </select>
              </div>
            </div>
          </Col>
          <Col xl={6} lg={6}>
            <div className="mb-4">
              <div
                className="d-flex justify-content-between "
                style={{ position: "relative" }}
              >
                <label
                  htmlFor="locationInput"
                  className="form-label text-label fw-bold"
                >
                  {contentLabel("Location", "nf Location")}
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
                  <label htmlFor="onlineCheckbox" className="ms-1 fw-bold">
                    {contentLabel("Online", "nf Online")}
                  </label>
                </div>
              </div>
              <MultiSelect
                viewLocation={selectedLocations}
                setLocationData={setSelectedLocations}
                onlineStatus={online}
              />
            </div>
          </Col>
          {/* Button Logic */}
          <Col xl={12} lg={12}>
            <div className=" d-flex justify-content-end">
              <div className="d-flex gap-3">
                <button
                  class="btn btn-primary d-flex justify-content-center align-items-center gap-2 "
                  onClick={() => {
                    handleSaveCourse("DRAFT", "BASIC");
                  }}
                  disabled={
                    courseinfo?.isBasicButton &&
                    courseinfo?.isPreSkill &&
                    courseinfo?.isAptainSkill &&
                    courseinfo?.isQuestion
                  }
                >
                  {isCourseLoading && (
                    <div
                      class="spinner-border spinner-border spinner-border-sm text-light me-2"
                      role="status"
                    >
                      <span class="sr-only">Loading...</span>
                    </div>
                  )}
                  {contentLabel("Save", "nf Save")}
                </button>

                <button
                  class="btn btn-primary"
                  onClick={() => {
                    // if (validateForm()) {
                    setSteps((prev) => {
                      return { ...prev, step1: true };
                    });
                    setisActivePreskill(true);
                    // } else {
                    //   showErrorToast(
                    //     contentLabel(
                    //       "PleaseFillAllRequiredFields",
                    //       "nf Please fill all required fields"
                    //     )
                    //   );
                    // }
                  }}
                >
                  {contentLabel("Next", "nf Next")}{" "}
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default CourseBasicInfo;
