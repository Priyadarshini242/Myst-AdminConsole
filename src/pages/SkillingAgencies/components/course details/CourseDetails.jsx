import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { convertDaysToPhase } from "../../../../components/SkillAvailer/helperFunction/conversion";
import { GetAttachment } from "../../../../api/Attachment  API/DownloadAttachmentApi";
import { MdOpenInNew, MdPlayCircleOutline } from "react-icons/md";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import MultiSelect from "../../../../components/SkillOwner/SelectComponent/MultiSelect";
import CreatableSelect from "react-select/creatable";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import GetAllLangApi from "../../../../api/content/GetAllLangApi";
import Select from "react-select";
import EditApi from "../../../../api/editData/EditApi";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { fetchUserCourses } from "../../../../api/SkillingAgency/fetchUserCourses";
import { useDispatch } from "react-redux";
import { FormatDateIntoPost } from "../../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { seteditCourseData } from "../../../../reducer/SkillingAgency/CourseSearch/editCourseSlice";
import { Col } from "react-bootstrap";
import { icons } from "../../../../constants";
import Gallery from "../../../../components/molecules/Gallery/Gallery";
import Files from "../../../../components/molecules/Files/Files";
import useContentLabel from "../../../../hooks/useContentLabel";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const CourseDetails = () => {
  const { selectedCourse: data } = useSelector((state) => state.myCourses);
  const contentLabel = useContentLabel();
  const dispatch = useDispatch();
  const {
    language: selectedLanguage,
    content,
    getUserAttachment: { userAttachmentData },
  } = useSelector((state) => state);

  const [courseImage, setCourseImage] = useState([]);
  const [courseFiles, setCourseFiles] = useState([]);

  //Edit
  const [editCourseLoading, setEditCourseLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [coursePdf, setCoursePdf] = useState(null);
  const [courseStartingDate, setCourseStatingDate] = useState("");
  const [selectedLocations, setSelectedLocations] = useState("");
  const [online, setOnline] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [languageInput, setLanguageInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState([]);

  const [filterLanguage, setFilterLanguage] = useState([]);

  const [linkAttachmentOptions, setLinkAttachmentOptions] = useState([]);
  const [linkAttachment, setLinkAttachment] = useState([]);
  const [linkImageOptions, setLinkImageOptions] = useState([]);
  const [linkImage, setLinkImage] = useState([]);

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

  const [edit, setEdit] = useState(false);

  const components = {
    DropdownIndicator: null,
  };

  useEffect(() => {
    if (data) {
      setSelectedCourse(data);

      const attachments = data?.attachmentFileNames
        ? JSON.parse(data?.attachmentFileNames)
        : [];
      const files = attachments
        ?.filter((att) => att?.fileType?.endsWith("pdf"))
        .map((att) => {
          return {
            label: att?.fileName,
            value: att,
          };
        });
      setLinkAttachment(files);
      setCourseFiles(files);
      const images = attachments
        ?.filter((att) => att?.fileType?.startsWith("image"))
        .map((att) => {
          return {
            label: att?.fileName,
            value: att,
          };
        });
      setLinkImage(images);
      console.log(images);

      setCourseImage(images);
      if (images.length > 0) {
        const imageUrl = GetAttachment(
          images[0].value?.userId,
          images[0].value?.fileName,
          images[0].value?.fileId
        );
        setSelectedImage(imageUrl);
      } else {
        setSelectedImage(null);
      }

      setCourseStatingDate(
        timestampToYYYYMMDD(Number(data.courseStartingDate))
      );
      let languages = data?.courseLanguage?.split(",").map((lan) => {
        return { label: lan, value: lan };
      });
      setSelectedLanguages(languages);
      setSelectedLocations(data.location);

      setCurrencyInput({ label: data?.currency, value: data?.currency });
    }
  }, [data]);

  const handleSaveCourse = async () => {
    const newErrors = {};

    if (!selectedCourse?.courseName)
      newErrors.courseName = "Course Name is required.";
    if (!selectedCourse?.courseDescription)
      newErrors.courseDescription = "Course Description is required.";
    if (!selectedImage) newErrors.selectedImage = "Course Image is required.";
    if (selectedLocations?.length === 0)
      newErrors.selectedLocations = "At least one location must be selected.";
    if (selectedLanguages?.length === 0)
      newErrors.selectedLanguages = "At least one language must be selected.";
    if (!courseStartingDate)
      newErrors.courseStartingDate = "Course Starting Date is required.";
    if (
      !selectedCourse?.durationNumber ||
      isNaN(selectedCourse?.durationNumber)
    )
      newErrors.durationNumber = "Course Duration must be a valid number.";
    if (!selectedCourse?.price || isNaN(selectedCourse?.price))
      newErrors.price = "Course Price must be a valid number.";
    if (!currencyInput?.value)
      newErrors.currencyInput = "Currency is required.";

    if (Object.keys(newErrors).length > 0) {
      showErrorToast("Please fill all required fields");
      return;
    }

    setEditCourseLoading(true);

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

    // setEditCourseLoading(true)

    const courseAttachment = [];

    const fileAttachment = linkAttachment?.map((attach) => {
      return attach.value;
    });

    if (fileAttachment.length > 0) {
      courseAttachment.push(...fileAttachment);
    }
    console.log(linkImage);

    if (linkImage.length > 0) {
      courseAttachment.push(linkImage[0].value);
    }

    console.log({
      //  "location": selectedLocations,
      courseName: selectedCourse.courseName,
      courseDescription: selectedCourse.courseDescription,
      courseLanguage: selectedLanguages.map((lan) => lan.value).join(", "),
      courseStartingDate: FormatDateIntoPost(courseStartingDate),
      durationNumber: selectedCourse.durationNumber,
      durationPhase: selectedCourse.durationPhase,
      price: selectedCourse.price.toString(),
      currency: currencyInput?.value,
      attachmentFileNames:
        courseAttachment.length > 0 ? JSON.stringify(courseAttachment) : "",
    });

    try {
      let course = await EditApi("User Courses", data?.id, {
        // "location": selectedLocations,
        courseName: selectedCourse.courseName,
        courseDescription: selectedCourse.courseDescription,
        courseLanguage: selectedLanguages.map((lan) => lan.value).join(", "),
        courseStartingDate: FormatDateIntoPost(courseStartingDate),
        durationNumber: selectedCourse.durationNumber,
        durationPhase: selectedCourse.durationPhase,
        price: selectedCourse.price.toString(),
        currency: currencyInput?.value,
        attachmentFileNames:
          courseAttachment.length > 0 ? JSON.stringify(courseAttachment) : "",
      });

      console.log(course);

      showSuccessToast("Edit Successful");
      dispatch(fetchUserCourses());
      dispatch(
        seteditCourseData({
          ...course?.data,
          courseStartingDate: new Date(
            course?.data?.courseStartingDate
          ).getTime(),
        })
      );
      setEditCourseLoading(false);
      setEdit(false);
    } catch (error) {
      console.log(error);
      showErrorToast("something went wrong");
      setEditCourseLoading(false);
    }
  };

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
    setLinkImage([{ label: image?.fileName, value: { ...image } }]);
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
    setLinkAttachment([{ label: file?.name, value: { ...file } }]);
  }, []);

  console.log(linkAttachment);

  if (!data.id) {
    return (
      <div
        className=" d-flex justify-content-center align-items-center p-2"
        style={{ width: "100%", height: "100%" }}
      >
        {contentLabel(
          "SelectACourseToViewData",
          "nf Select a course to view data"
        )}
      </div>
    );
  }

  return (
    <div className="w-100 px-3 py-2">
      <div className="d-flex ">
        {/* <div style={{ marginLeft: "auto" }} className=''>
                    {
                        selectedCourse?.courseStatus !== 'PUBLISH' &&
                        <SecondaryBtnLoader statusTab={true} onClick={() => setEdit(true)} label={(content[selectedLanguage]?.find((item) => item.elementLabel === "Edit") || {}).mvalue || "nf Edit"} />
                    }
                </div> */}
      </div>
      <div className="row p-2">
        <div className="col-12">
          <div className="row">
            <div class="mb-3 col-4">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Name"
                  ) || {}
                ).mvalue || "nf Title"}{" "}
              </label>
              <div>{data?.courseName}</div>
            </div>
            <div className="col-4">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Duration"
                  ) || {}
                ).mvalue || "nf Type"}{" "}
              </label>
              <div>
                <div>
                  {data?.durationNumber} {data?.durationPhase}
                </div>
              </div>
            </div>
            <div className="col-4">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Locations"
                  ) || {}
                ).mvalue || "nf Location(s)"}
              </label>
              <div>
                <div>{data?.location}</div>
              </div>
            </div>
            <div className="col-4">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Languages"
                  ) || {}
                ).mvalue || "nf Languages"}{" "}
              </label>
              <div>
                <div>{data?.courseLanguage}</div>
              </div>
            </div>
            <div class=" col-4 mb-3">
              <label
                for="exampleFormControlInput1"
                class="form-label"
                style={{ fontWeight: "bold" }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "StartDate"
                  ) || {}
                ).mvalue || "nf StartDate"}{" "}
              </label>
              <div>
                {data?.courseStartingDate
                  ? formatTimestampToDate(data?.courseStartingDate)
                  : "Not  Applicable"}
              </div>
            </div>

            <div className="col-4">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "CoursePrice"
                  ) || {}
                ).mvalue || "nf Course Price"}{" "}
              </label>
              <div>
                <div>
                  {data?.price} {data?.currency}
                </div>
              </div>
            </div>
            <div className="col-4">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Status"
                  ) || {}
                ).mvalue || "nf Status"}{" "}
              </label>
              <div>
                <div>{data?.courseStatus?.toLowerCase()}</div>
              </div>
            </div>
            <div className="col-4">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "CoursePDF"
                  ) || {}
                ).mvalue || "nf Course PDF"}{" "}
              </label>
              <div>
                {courseFiles?.map((attachment) => {
                  return (
                    <div className="d-flex ">
                      <div>{attachment?.value?.fileName}</div>
                      <div>
                        <a
                          rel="noreferrer"
                          href={GetAttachment(
                           getCookie("userId"),
                            attachment?.value?.fileName,
                            attachment?.value?.fileId
                          )}
                          target="_blank"
                        >
                          {!attachment?.value?.fileName?.endsWith(".mp4") ? (
                            <MdOpenInNew
                              className=""
                              style={{
                                color: "var(--primary-color)",
                                height: "16px",
                                width: "16px",
                              }}
                            />
                          ) : (
                            <MdPlayCircleOutline
                              className=""
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
              </div>
            </div>
            <div className="col-4">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "CourseImage"
                  ) || {}
                ).mvalue || "nf Course Image"}{" "}
              </label>
              <div>
                <div>
                  {courseImage?.map((attachment) => {
                    return (
                      <div className="d-flex ">
                        <div>{attachment?.value?.fileName}</div>
                        <div>
                          <a
                            rel="noreferrer"
                            href={GetAttachment(
                             getCookie("userId"),
                              attachment?.value?.fileName,
                              attachment?.value?.fileId
                            )}
                            target="_blank"
                          >
                            {!attachment?.value?.fileName?.endsWith(".mp4") ? (
                              <MdOpenInNew
                                className=""
                                style={{
                                  color: "var(--primary-color)",
                                  height: "16px",
                                  width: "16px",
                                }}
                              />
                            ) : (
                              <MdPlayCircleOutline
                                className=""
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
                </div>
              </div>
            </div>

            <div className="col-12 mt-2">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SkillerName"
                  ) || {}
                ).mvalue || "nf SkillerName"}
              </label>
              <div>
                <p>{data?.skillerName}</p>
              </div>
            </div>

            <div className="col-12 mt-3">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SkillerBio"
                  ) || {}
                ).mvalue || "nf SkillerBio"}
              </label>
              <div>
                <p>{data?.skillerBio}</p>
              </div>
            </div>

            <div className="col-12 mt-3">
              <label class="form-label" style={{ fontWeight: "bold" }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Description"
                  ) || {}
                ).mvalue || "nf Description"}
              </label>
              <div>
                <p>{data?.courseDescription}</p>
              </div>
            </div>

            {data.courseQuestions?.length > 0 && (
              <div className="col-12 mt-3">
                <label class="form-label" style={{ fontWeight: "bold" }}>
                  {contentLabel("Questions", "nf Questions")}
                </label>
                {data.courseQuestions?.map((que) => (
                  <div className="fs-6 mb-3 mt-3" key={que.id}>
                    <h6>
                      {que.cqLabel}{" "}
                      {que.cqRequired === "Yes" && (
                        <span style={{ color: "red" }}> *</span>
                      )}
                    </h6>
                    {(que.cqType === "Options" ||
                      que.cqType === "nf Options") && (
                      <div className="form-check">
                        {JSON.parse(que.cqValues).map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <input
                              className="form-check-input text-primary-color"
                              type="radio"
                              value={option}
                              disabled
                            />
                            <label className="form-check-label">{option}</label>
                          </div>
                        ))}
                      </div>
                    )}

                    {(que.cqType === "Text" || que.cqType === "nf Text") && (
                      <div className="form-group">
                        <textarea
                          className="form-control"
                          rows="3"
                          disabled
                        ></textarea>
                      </div>
                    )}
                    {(que.cqType === "Number" ||
                      que.cqType === "nf Number") && (
                      <div className="form-group w-25">
                        <input type="Number" className="form-control" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
