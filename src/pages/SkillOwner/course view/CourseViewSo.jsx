import { getCookie } from '../../../config/cookieService';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { CiLocationOn } from "react-icons/ci";
import { FaLinkedin, FaRegHeart, FaStar } from "react-icons/fa";
import { FaSquareFacebook, FaSquareXTwitter } from "react-icons/fa6";
import {
  MdOpenInNew,
  MdOutlineWatchLater,
  MdPlayCircleOutline,
} from "react-icons/md";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";

import { PiSuitcaseSimpleDuotone } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import PostApi from "../../../api/PostData/PostApi";
import { fetchCourse } from "../../../api/SkillSeeker/course detail/fetchCourseDetail";
import SuccessBtn from "../../../components/Buttons/SuccessBtn";
import LanguageComponent from "../../../components/LanguageComponent";
import LazyLoadingImageComponent from "../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import CouresApplyModal from "../../../components/Modals/CouresApplyModal";
import Navbar from "../../../components/Navbar";
import { GetUserForSelectedLanguage } from "../../../components/SkillOwner/HelperFunction/GetUserForSelectedLanguage";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { BASE_URL } from "../../../config/Properties";
import useContent from "../../../hooks/useContent";
import useRemoveLocalStorage from "../../../hooks/useRemoveLocalStoreage";
import company_image from "../../../Images/skyline.png";
import { GetAttachment, GetAttachmentNoToken } from "../../../api/Attachment  API/DownloadAttachmentApi";
import { setLanguage } from "../../../reducer/localization/languageSlice";
import MyStImage from "./../../template/img/A.png";
import { images } from "../../../constants";
import { ConfigContext } from "../../../context/ConfigContext";
import { FiAlignLeft, FiArrowRight } from "react-icons/fi";
import icons from "../../../constants/icons";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import useContentLabel from "../../../hooks/useContentLabel";
import {
  sessionDecrypt,
  sessionEncrypt,
} from "../../../config/encrypt/encryptData";

const CourseViewSo = () => {
  const { id } = useParams();
  const navbarRef = useRef(null);
  const contentLabel = useContentLabel();
  const {
    language: selectedLanguage,
    content,
    TopSkill,
  } = useSelector((state) => state);
  const userDetails = useSelector((state) =>
    GetUserForSelectedLanguage(state.userProfile.data, selectedLanguage)
  );
  /* DISPATCH */
  const dispatch = useDispatch();
  /* NAVIGATE */
  const navigate = useNavigate();
  /* REMOVE LOCAL STORAGE */
  const removeLocalStorage = useRemoveLocalStorage();
  /* TOKEN */
  const token = getCookie("token");
  /* Role */
  const role = getCookie("USER_ROLE");
  /* COURSE LANG */
  const courseLang = getCookie("CLang");
  /* HOME LANG */
  const homeLang = getCookie("HLang");

  const [selectedImage, setSelectedImage] = useState(null);
  const [linkAttachment, setLinkAttachment] = useState([]);
  const [linkAgencyImage, setLinkAgencyImage] = useState(null);
  const [linkImage, setLinkImage] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState("100vh");
  const [openDialog, setOpenDialog] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [allSkills, setAllSkills] = useState([]);

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  useEffect(() => {
    if (courseLang) {
      sessionStorage.setItem("prevLang", sessionEncrypt(selectedLanguage));

      dispatch(setLanguage(getCookie("CLang")));
    }
  }, [dispatch, selectedLanguage, courseLang, homeLang, token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchCourse(id);
        setCourseData(res?.data);

        const attachments = res?.data?.attachments
          ? res?.data?.attachments
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
        const images = attachments
          ?.filter((att) => att?.fileType?.startsWith("image"))
          .map((att) => {
            return {
              label: att?.fileName,
              value: att,
            };
          });
        setLinkImage(images);

        const agencyImage = attachments?.find(
          (att) => att?.type === "AgencyImage"
        );
        setLinkAgencyImage(agencyImage);

        if (images.length > 0) {
          const imageUrl = GetAttachmentNoToken(
            images[0].value?.userId,
            images[0].value?.fileName,
            images[0].value?.fileId
          );
          setSelectedImage(imageUrl);
        }
      } catch (err) {
        showErrorToast("Error fetching course details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (TopSkill?.status === "success") {
      const filteredSkills = TopSkill?.data?.filter(
        (val) => val?.mlanguage === selectedLanguage
      );
      console.log("filtered skills", filteredSkills);
      setAllSkills(filteredSkills);
    }
  }, [TopSkill?.status, TopSkill?.data, selectedLanguage]);

  const navBarBgColor = "var(--primary-color)";

  /* HANDLE PAGE ROUTE */
  const handlePageRouting = useCallback(() => {
    if (getCookie("USER_ROLE") === "R1" && getCookie("token") && getCookie("userId")) {
      const queryParams = new URLSearchParams({
        id: sessionEncrypt(courseData?.id),
        name: sessionEncrypt(courseData?.courseName),
      }).toString();

      navigate(`/skill-owner/up-skilling/view-courses/view?${queryParams}`);
    }else{
      sessionStorage.setItem("CLang", sessionEncrypt(courseData?.mlanguage));
      sessionStorage.setItem("C_NAME", sessionEncrypt(courseData?.courseName));
      sessionStorage.setItem("C_ID", sessionEncrypt(courseData?.id));
      navigate("/skill-owner/email");
    }
  }, [courseData?.mlanguage, courseData?.id, navigate]);

  /* HANDLE ENROLL */
  const enrollCourse = useCallback(async () => {
    try {
      setIsEnrolling(true);
      const payload = {
        userCourseId: courseData?.id,
        mystProfile: courseData?.userId,
        firstName: userDetails?.firstName,
        lastName: userDetails?.lastName || "",
        email: userDetails?.email,
        coursePhone: userDetails?.mobileNumber,
        shortlisted: "No",
        status:'New'
      };
      await PostApi("Course Response", payload);
      /* REMOVE LOCAL STORAGE RELATED TO COURSE */
      removeLocalStorage("CLang", "C_ID");
      showSuccessToast("Course applied successfull");
      handleDialogClose();
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.error(
          "Reference error occured during Enrolling course: ",
          error?.message
        );
      } else {
        console.error("Error occured during Enrolling course: ", error);
      }
    } finally {
      setIsEnrolling(false);
    }
  }, [
    courseData?.id,
    courseData?.userId,
    userDetails?.firstName,
    userDetails?.lastName,
    userDetails?.email,
    userDetails?.mobileNumber,
    removeLocalStorage,
  ]);

  const configContext = useContext(ConfigContext);
  const { collapseMenu, layout } = configContext.state;
  // Apply dynamic styles based on the icon
  const iconStyles = { width: "110px", important: true }; // Apply width only if collapseMenu is true
  // Determine the logo and its size based on the menu state
  const logoSrc = collapseMenu ? images.SBJSmallLogo : images.SBJFullLogo;
  const logoWidth = collapseMenu ? 40 : 160;
  const toggleIcon = collapseMenu ? <FiArrowRight /> : <FiAlignLeft />;



  return (
    <React.Fragment>
      {/* NAVBAR */}
      {/* {token && role === 'R1' ? (
        <div ref={navbarRef}>
          <Navbar />
        </div>
      ) : ( */}

      <div
        className="d-flex px-3 py-2 justify-content-between"
        style={{ backgroundColor: "white" }}
      >
        <div className=" d-flex" style={iconStyles}>
          <Link to="#" className="b-brand">
            <LazyLoadingImageComponent
              id="main-logo"
              src={logoSrc}
              alt="Logo"
              className="logo"
              width={logoWidth}
            />
          </Link>
        </div>
        {/* <Link to="#" className={moreClass.join(' ')} >
                        <i className="feather icon-more-vertical" />
                    </Link> */}
        <div className="d-flex gap-5 align-items-center">
          <div className="d-flex ">
            <span className="navbar-text myhref">
              <span
                className="fw-bold fs-6"
                style={{
                  color: "var(--primary-color)",
                  direction: content[selectedLanguage].direction,
                }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "WantToJoinTheMyst"
                  ) || {}
                ).mvalue || "nf Want to join the Myst community"}
              </span>
              <Link
                to={"/skill-owner/email"}
                className="signup fs-6 text-decoration-underline"
                style={{ marginLeft: "1em", color: "var(--primary-color)" }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SignUp"
                  ) || {}
                ).mvalue || "nf SignUp"}
              </Link>
            </span>
          </div>
          <div className="col-md-1 btn-group me-2">
            <LanguageComponent />
          </div>
        </div>
      </div>
      {/* )} */}

      {/* CONTENT */}
      <main
        className="site-section bg-light pt-5"
        style={{
          height: contentHeight,
          position: "relative",
          isolation: "isolate",
          overflowY: "auto",
        }}
      >
        <section className="card container ">
          <section
            className="row align-items-center p-4 mb-4"
            style={{ borderBottom: "2px solid var(--light-color)" }}
          >
          <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="d-flex align-items-center">
                <div
                  className={`border p-1 d-inline-block rounded ${
                    isLoading && "skeleton-loading"
                  }`}
                >
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
                    {courseData?.courseName}
                  </h2>

                  <div className="d-md-flex align-items-center mt-3">
                    {(courseData?.courseStartingDate) && <div className="d-md-flex  align-items-center">
                      <DateRangeOutlinedIcon 
                        style={{ color: "var(--primary-color)" }}
                      />
                      {isLoading ? (
                        <p
                          className={`${isLoading ? "skeleton-loading" : ""}`}
                        ></p>
                      ) : (
                        <span className="ms-2">
                          {formatTimestampToDate(
                            courseData?.courseStartingDate
                          )}
                        </span>
                      )}
                    </div>}
                  {(courseData?.location) &&   <div className="d-md-flex align-items-center  ms-md-5">
                      <icons.FmdGoodOutlinedIcon
                        style={{ color: "var(--primary-color)" }}
                      />
                      {isLoading ? (
                        <p
                          className={`${isLoading ? "skeleton-loading" : ""}`}
                        ></p>
                      ) : (
                        <span className="ms-2"> {courseData?.location}</span>
                      )}
                    </div>}
                       {(courseData?.durationNumber) &&  <div className="d-md-flex align-items-center ms-md-5">
                      <icons.AccessTimeOutlinedIcon
                        style={{ color: "var(--primary-color)" }}
                      />
                      {isLoading ? (
                        <p
                          className={`${isLoading ? "skeleton-loading" : ""}`}
                        ></p>
                      ) : (
                        <span className="ms-2">
                          {courseData?.durationNumber}&nbsp;
                          {courseData?.durationPhase}
                        </span>
                      )}
                    </div>}
                  </div>

                </div>
              </div>
            </div>
         {courseData?.courseName && <div className="col-lg-4">
              <div className="row">
                <div className="col-6">
                  {/* <div className="btn btn-block btn-light btn-md">
                    <div
                      className="d-flex align-items-center"
                      style={{ color: navBarBgColor }}
                    >
                      <FaRegHeart />
                      <span className="ms-2">
                        {useContent("SaveCourse", "nf Save Course")}
                      </span>
                    </div>
                  </div> */}
                </div>
                <div className="col-6">
                  <SuccessBtn
                    label={contentLabel("ApplyNow", "nf ApplyNow")}
                    // onClick={token && role === 'R1' ? handleDialogOpen : handlePageRouting}
                    onClick={handlePageRouting}
                  />
                </div>
              </div>
            </div>}
          </section>

          <section
            className="row align-items-center p-4 mb-4"
            style={{ borderBottom: "2px solid var(--light-color)" }}
          >
             {courseData?.courseDescription &&<div className="">
              <h3
                className="h5 d-flex align-items-center mb-4 fw-bold"
                style={{ color: navBarBgColor }}
              >
                {contentLabel("Description", "nf Description")}
              </h3>
              <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                {courseData?.courseDescription}
              </p>
              <p className={`${isLoading ? "skeleton-loading" : ""}`}></p>
              <p className={`${isLoading ? "skeleton-loading mb-3" : ""}`}></p>
            </div>}

            {courseData?.skillerName &&  <div className="mb-2 d-flex gap-2">
              <strong className="fw-bold">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SkillerName"
                  ) || {}
                ).mvalue || "nf Skiller Name"}
                :
              </strong>
              <span className={`${isLoading ? "skeleton-loading" : ""}`}>
                {courseData?.skillerName}
              </span>
            </div>}
           {courseData?.skillerBio && <div className="mb-2 ">
              <strong className="fw-bold me-2">
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SkillerBio"
                  ) || {}
                ).mvalue || "nf Skiller Bio"}
                :
              </strong>
              <span className={`${isLoading ? "skeleton-loading" : ""}`}>
                {courseData?.skillerBio}
              </span>
            </div>}
        
          </section>

          <section className="row px-4">
            <div className="col-lg-6 ">
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
                  {isLoading ? (
                    <>
                      <tr style={{ border: "white" }}>
                        <td
                          className={"skeleton-loading ms-2"}
                          scope="col"
                        ></td>
                        <td className={"skeleton-loading "} scope="col"></td>
                      </tr>
                      <tr style={{ border: "white" }}>
                        <td
                          className={"skeleton-loading ms-2"}
                          scope="col"
                        ></td>
                        <td className={"skeleton-loading "} scope="col"></td>
                      </tr>
                      <tr style={{ border: "white" }}>
                        <td
                          className={"skeleton-loading ms-2"}
                          scope="col"
                        ></td>
                        <td className={"skeleton-loading "} scope="col"></td>
                      </tr>
                    </>
                  ) : (
                    <>
                      {courseData?.attaiable.map((topic, index) => {
                        return (
                          <tr style={{ border: "white" }}>
                            {/* <td className='p-1' scope="col">{index + 1}</td> */}
                            <td className="p-1 w-75" scope="col">
                              {topic.skill}
                            </td>
                            <td className="p-1  w-25" scope="col">
                              {topic.duration} {topic.durationPhase}
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* <div className=" col-lg-8">
              <h3
                className="h5 d-flex align-items-center mb-4 fw-bold"
                style={{ color: navBarBgColor }}
              >
                <span className="icon-rocket mr-3"></span>
                {contentLabel("Skills Attainable", "nf Skills Attainable")}
              </h3>
              <p className={`${isLoading ? "skeleton-loading" : ""}`}>
                {courseData?.attaiable
                  ? courseData?.attaiable
                    .filter((val) => val?.id)
                    ?.map((data) => (
                      <div>
                        {data?.skill}:&nbsp;
                        {data?.duration} {data?.durationPhase}
                      </div>
                    ))
                  : !isLoading && "-"}
              </p>
            </div> */}

            <article
              className="col-lg-6 "
              style={{ borderLeft: "2px solid var(--light-color)" }}
            >
              <aside className="mb-4">
                <h3
                  className=" h5 mb-3 fw-bold"
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
                    </strong>{" "}
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} mb-0`}
                    >
                      {courseData?.courseLanguage}
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
                    </strong>{" "}
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} mb-0`}
                    >
                      {courseData?.location}
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
                    </strong>{" "}
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} mb-0`}
                    >
                      {courseData?.price}&nbsp;
                      {courseData?.currency}
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
                      </strong>{" "}
                      <p
                        className={`${
                          isLoading ? "skeleton-loading" : ""
                        } mb-0`}
                      >
                        {linkAttachment?.map((attachment) => {
                          return (
                            <div className="d-flex ">
                              <div>{attachment?.value?.fileName}</div>
                              <div>
                                <a
                                  rel="noreferrer"
                                  href={GetAttachmentNoToken(
                                    attachment?.value?.userId,
                                    attachment?.value?.fileName,
                                    attachment?.value?.fileId
                                  )}
                                  target="_blank"
                                >
                                  {!attachment?.value?.fileName?.endsWith(
                                    ".mp4"
                                  ) ? (
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
                      </p>
                    </li>
                  )}

                  {linkAgencyImage && (
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
                            {linkAgencyImage?.firstName}{" "}
                            {linkAgencyImage?.lastName}
                          </div>
                          <div>
                            <a
                              rel="noreferrer"
                              href={GetAttachment(
                                linkAgencyImage?.userId,
                                linkAgencyImage?.fileName,
                                linkAgencyImage?.fileId
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
                      linkImage?.length > 0 &&

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
                    </strong>{" "}
                    <p
                      className={`${isLoading ? "skeleton-loading" : ""} mb-0`}
                    >
                      {courseData?.courseStartingDate
                        ? new Date(
                            parseInt(courseData?.courseStartingDate)
                          ).toDateString()
                        : " - "}
                    </p>
                  </li>
                </ul>
              </aside>
            </article>

            <section
              className="row align-items-center  p-4 mb-4"
              style={{ borderBottom: "2px solid var(--light-color)" }}
            >
              <div className="col-lg-12 ">
                <h3
                  className="h5 d-flex align-items-center mb-4 fw-bold"
                  style={{ color: navBarBgColor }}
                >
                  {contentLabel("Prerequisite", "nf Prerequisite")}
                </h3>

                <div className="d-flex flex-wrap gap-3">
                  {isLoading &&
                    [1, 2, 3, 4, 5, 6, 7, 8].map((skill) => {
                      return (
                        <div
                          key={skill}
                          className=" d-flex align-items-center text-center "
                          style={{ background: "none", color: "black" }}
                        >
                          <p
                            className="skeleton-loading "
                            style={{ width: "5rem" }}
                          ></p>
                        </div>
                      );
                    })}
                  {courseData?.preRequest
                    ?.filter((course) => course?.id)
                    ?.map((course) => {
                      const isSkillPresent = allSkills?.some(
                        (skill) => skill?.title === course?.skill
                      );
                      return (
                        <div
                          key={course.id}
                          className={`border border-4 rounded p-2 d-flex align-items-center text-center me-2 ${
                            token &&
                            role === "R1" &&
                            isSkillPresent &&
                            "border-success"
                          }`}
                          style={{ background: "none", color: "black" }}
                        >
                          {course?.isMandatory && (
  course?.isMandatory?.toLowerCase() === "yes" ||
  course?.isMandatory?.toLowerCase() === "true"
) && (
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
                            className={`ms-2 ${
                              isLoading ? "skeleton-loading" : ""
                            }`}
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {course?.skill}
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

            <aside className="p-3 ">
              <h3 className="h5" style={{ color: navBarBgColor }}>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Share"
                  ) || {}
                ).mvalue || "nf Share"}
              </h3>
              <div className="fs-1 text-black">
                <a
                  href="#"
                  className="pt-3 pb-3 pe-3 ps-0"
                  style={{ color: navBarBgColor }}
                >
                  <FaSquareFacebook />
                </a>
                <a
                  href="#"
                  className="pt-3 pb-3 pe-3 ps-0"
                  style={{ color: navBarBgColor }}
                >
                  <FaSquareXTwitter />
                </a>
                <a
                  href="#"
                  className="pt-3 pb-3 pe-3 ps-0"
                  style={{ color: navBarBgColor }}
                >
                  <FaLinkedin />
                </a>
              </div>
            </aside>
          </section>
        </section>

        {/* COURSE APPLY DIALOG */}
        <CouresApplyModal
          openDialog={openDialog}
          handleDialogClose={handleDialogClose}
          courseData={courseData}
          userDetails={userDetails}
          allSkills={allSkills}
          BsCheckCircleFill={BsCheckCircleFill}
          enrollCourse={enrollCourse}
          isEnrolling={isEnrolling}
        />
      </main>
    </React.Fragment>
  );
};

export default CourseViewSo;
