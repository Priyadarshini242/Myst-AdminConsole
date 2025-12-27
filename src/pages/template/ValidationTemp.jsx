import { getCookie } from '../../config/cookieService';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button, Col, Row } from "react-bootstrap";
import { FaChevronLeft, FaTimes } from "react-icons/fa";
import Lottie from "react-lottie";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import AttachmentPost from "../../api/Attachment  API/AttachmentPost";
import {
  DeleteAttachment,
  GetAttachmentNoToken,
  splitStringToObject,
} from "../../api/Attachment  API/DownloadAttachmentApi";
import {
  validationReqApi,
  validationTemplateUpdateApi,
} from "../../api/validations/validationApi";
import LanguageComponent from "../../components/LanguageComponent";
import LazyLoadingImageComponent from "../../components/Lazy Loading Images/LazyLoadingImageComponent";
import { calculateDaysDifference } from "../../components/SkillOwner/HelperFunction/CalculateDaysDifference ";
import { DayDifferenceToDynamicView } from "../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView";
import { formatTimestampToDate } from "../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import { showSuccessToast } from "../../components/ToastNotification/showSuccessToast";
import CustomButton from "../../components/atoms/Buttons/CustomButton";
import { sessionDecrypt } from "../../config/encrypt/encryptData";
import { images } from "../../constants";
import icons from "../../constants/icons";
import { ConfigContext } from "../../context/ConfigContext";
import useContentLabel from "../../hooks/useContentLabel";
import { fetchValidationRelation } from "../../reducer/validation/validationRelationSlice";
import "./validation success template/ValidationAnimation.css";
import ValidationLetterTemplate from "./validation success template/ValidationLetterTemplate";
import ValidationSuccessTemp from "./validation success template/ValidationSuccessTemp";
import expiredAnimation from "./validation success template/cancel-animation.json";
import somethingWentWrong from "./validation success template/something-went-wrong-animation.json";
import { formatExperience } from "../../components/SkillOwner/HelperFunction/FormatExperience";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";

const ValidationTemp = () => {
  /* CONTENT HOOK */
  const contentLabel = useContentLabel();
  const dispatch = useDispatch();
  /* STATES */
  const [userValidationData, setUserValidationData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [validatorComment, setValidatiorComment] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [days, setDays] = useState("");
  const [errorPage, setErrorPage] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [attachmentFileNames, setAttachmentFileNames] = useState([]);
  const [showAttachmentError, setShowAttachmentError] = useState(false);
  const [showFileSizeError, setShowFileSizeError] = useState(false);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [isAttachmentLoading, setIsAttachmentLoading] = useState(false);
  const [profilePicObj, setProfilePicObj] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSending, setIsSending] = useState(false);

  /* INIT TOKEN */
  const token = getCookie("token");

  /* ROUTE PARAMS */
  const { id } = useParams();
  /* USE REFS */
  const navbarRef = useRef(null);

  /* STORE IMPORTS */
  const {
    language: selectedLanguage,
    content,
    regionalData,
  } = useSelector((state) => state);
  const { data: validationRelationData } = useSelector(
    (state) => state.validationRelation
  );

  const configContext = useContext(ConfigContext);
  const { collapseMenu, layout } = configContext.state;
  const iconStyles = { width: "110px", important: true };
  const logoSrc = collapseMenu ? images.SBJSmallLogo : images.SBJFullLogo;
  const logoWidth = collapseMenu ? 40 : 160;
  const [contentHeight, setContentHeight] = useState("100vh");

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchValidationRelation());
  }, [dispatch]);

  /* LOAD DATA FOR SPECIFIC USER */
  const getValidationDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await validationReqApi(id);
      setUserValidationData(res?.data);
      setIsLoading(false);
      setErrorPage(false);
    } catch (error) {
      console.error("Error getting validation data", error);
      setIsLoading(false);
      setErrorPage(true);
    }
  }, [id]);

  useEffect(() => {
    getValidationDetails();
  }, [getValidationDetails]);

  /* FORMAT THE PROFILE PIC */
  useEffect(() => {
    setProfilePicObj(
      splitStringToObject(userValidationData?.profilePictureFileName)
    );
  }, [userValidationData]);

  useEffect(() => {
    if (
      userValidationData?.validatorResponse === "Request Sent" ||
      userValidationData?.validatorResponse === "Resend"
    ) {
      setIsValidated(false);
    } else {
      setIsValidated(true);
    }

    /* FOR DURATION */
    const calcDays = calculateDaysDifference(
      userValidationData?.fromDate,
      userValidationData?.toDate
    );
    setDays(calcDays);
  }, [
    userValidationData?.validatorResponse,
    userValidationData?.fromDate,
    userValidationData?.toDate,
  ]);

  const handleValidatorAttachment = async (e) => {
    const files = Array.from(e.target.files);

    if (files?.length === 0) {
      console.error("No file selected!");
      setShowAttachmentError(false);
      return;
    }

    const maxFileSize = Number(
      (
        content[selectedLanguage]?.find(
          (item) => item.elementLabel === "MaxFileSize"
        ) || {}
      ).mvalue || "nf MaxFileSize"
    );

    const validFiles = files.filter((file) => {
      if (file.size > maxFileSize) {
        setShowFileSizeError(true);
        setTimeout(() => {
          setShowFileSizeError(false);
        }, 5000);
        return false;
      }
      return true;
    });

    if (validFiles?.length === 0) {
      console.error("No valid files selected!");
      return;
    }

    setSelectedFiles(validFiles);
  };

  /* HANDLE ATTACHMENT REMOVING */
  const handleRemoveAttachment = async (indexToRemove) => {
    const updatedAttachmentFiles = [...attachmentFiles];
    updatedAttachmentFiles.splice(indexToRemove, 1);
    setAttachmentFiles(updatedAttachmentFiles);
  };

  const handleAddFiles = () => {
    if (selectedFiles.length === 0) {
      document.getElementById("inputGroupFile04").value =
        ""; /* CLEARING FILE INPUTS */
      console.error("No files to add!");
      return;
    }

    /* CHECKING FOR TOTAL NUMBER OF FILES */
    if (attachmentFiles.length + selectedFiles.length > 4) {
      setShowAttachmentError(true);
      setTimeout(() => {
        setShowAttachmentError(false);
      }, 5000);
      return;
    }

    const newFiles = selectedFiles.slice(0, 4 - attachmentFiles.length);
    setAttachmentFiles((prev) => [...prev, ...newFiles]);
    setSelectedFiles([]); /* CLEARING TEMPORARY FILES */
    document.getElementById("inputGroupFile04").value =
      ""; /* CLEARING FILE INPUTS */
  };

  useEffect(() => {}, [uploadedFiles]);

  /* HANDLE VALIDATOR PUT */
  const handleUpdate = async (response) => {
    try {
      setIsSending(true);
      let newUploadedFiles = [];
      if (
        attachmentFiles?.length > 0 &&
        (response === "Accept" || response === "Reject")
      ) {
        const formData = new FormData();
        attachmentFiles?.forEach((file) => {
          formData.append("file", file);
        });

        try {
          setIsAttachmentLoading(true);

          const res = await AttachmentPost(
            "handleMultiFile",
            userValidationData?.id,
            formData
          );
          const data = res?.data;

          newUploadedFiles = data?.map((file) => ({
            filename: file?.fileName,
            fileId: file?.fileId,
            fileTitle: file?.fileTitle || file?.fileName,
          }));

          setUploadedFiles((prev) => [...prev, ...newUploadedFiles]);
          setIsAttachmentLoading(false);
        } catch (error) {
          setIsAttachmentLoading(false);
          console.error("Error uploading files: ", error);
        }
      }

      /* UPDATE EXISTING DATA */
      const updatedData = {
        validatorComments: validatorComment,
        validatorResponse: response,
        validatorName: userValidationData?.validatorName,
        relationship: userValidationData?.relationship,
        description:
          userValidationData?.about || userValidationData?.description,
        validatorEmail: userValidationData?.validatorEmail,
        validatorPhone: userValidationData?.validatorPhone,
        isValidated: response === "Accept" ? "Yes" : "No",
        skillOccupation: userValidationData?.skillOccupation,
        requestorId: userValidationData?.requestorId,
        requestorItemId: userValidationData?.requestorItemId,
        remarks: userValidationData?.remarks,
        mlanguage: userValidationData?.mlanguage,
        userId: userValidationData?.userId,
        invitationLink: userValidationData?.invitationLink,
        keyTable: userValidationData?.keyTable,
        keyName: userValidationData?.keyName,
        requestorAttachmentUrls: userValidationData?.requestorAttachmentUrls,
        requestorAttachmentFileNames:
          userValidationData?.requestorAttachmentFileNames,
        validatorAttachmentUrls: "",
        validatorAttachmentFileNames: newUploadedFiles?.length
          ? JSON.stringify(newUploadedFiles)
          : "",
      };

      await validationTemplateUpdateApi(userValidationData?.id, updatedData);
      showSuccessToast(
        contentLabel(
          "ValidationUpdatedSuccessfully",
          "Validation Updated Successfully"
        )
      );
      /* REFRESH DATA */
      getValidationDetails();
      /* EMPTY THE COMMENT BOX */
      setValidatiorComment("");
      /* RESETTING THE ATTACHMENT */
      setAttachmentFiles([]);
      setAttachmentFileNames([]);
      setUploadedFiles([]);
      /* DISABLE THE BUTTONS ON SUCCESS */
      setIsValidated(true);
      setShowAttachmentError(false);
    } catch (error) {
      showErrorToast(
        contentLabel("SomethingWentWrong", "nf Something Went Wrong")
      );
      console.error("Error validating the request: ", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {}, [attachmentFileNames, attachmentFiles]);

  const toggleAdditionalDetails = () => {
    setShowAdditionalDetails(!showAdditionalDetails);
  };

  if (isLoading) {
    return <div>{""}</div>;
  }

  /* LOTTIE OPTIONS */
  const somethingWentWorngDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: somethingWentWrong,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const expiredDefaultOptions = {
    loop: false,
    autoplay: true,
    animationData: expiredAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const getBaseUrl = () => {
    const origin = window.location.origin; // Get the full origin (protocol + hostname)

    if (origin.includes("localhost")) {
      return "http://localhost:3000/skill-owner/email";
    }

    if (origin.includes("dev")) {
      return "https://dev.myskillstree.com/skill-owner/email";
    } else if (origin.includes("stg")) {
      return "https://stg.myskillstree.com/skill-owner/email";
    } else {
      return "http://myskillstree.com/skill-owner/email";
    }
  };

  return (
    <React.Fragment>
      <div
        className="d-md-flex d-block px-3 py-2 justify-content-between"
        style={{ backgroundColor: "white" }}
        ref={navbarRef}
      >
        <div className=" d-flex ">
          <div
            className=" d-flex w-100 justify-content-center justify-content-center justify-content-md-start"
            style={iconStyles}
          >
            <Link to="#" className="b-brand">
              <LazyLoadingImageComponent
                id="main-logo"
                src={logoSrc}
                alt="Logo"
                className=""
                width={logoWidth}
              />
            </Link>
          </div>
        </div>
        <div className="d-flex flex-sm-row flex-column  gap-3 align-items-center justify-content-between">
          <div className="d-flex ">
            <span className="navbar-text myhref text-center">
              <span
                className="fw-bold fs-6 text-center"
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
                to={getBaseUrl()}
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
          <div className="col-md-1 btn-group me-4">
            <LanguageComponent />
          </div>
        </div>
      </div>

      {/* PAGE CONTENT IF VALIDATION IS NOT UPDATED */}
      {userValidationData?.isValidated === "No" &&
        userValidationData?.validatorResponse !== "Request Expired" &&
        ["Request Sent", "Resend"].includes(
          userValidationData?.validatorResponse
        ) && (
          <main
            className="site-section bg-light p-3"
            style={{
              position: "relative",
              isolation: "isolate",
              overflowY: "auto",
            }}
          >
            <div className="card">
              {/* REQUESTOR DETAILS */}
              <Row
                className="row align-items-center p-4 mb-2"
                style={{ borderBottom: "2px solid var(--light-color)" }}
              >
                <Col xs={12}>
                  <div className="d-flex align-items-center">
                    <div
                      className={`border p-1 d-inline-block rounded ${
                        isLoading && "skeleton-loading"
                      }`}
                    >
                      <LazyLoadingImageComponent
                        className={`${isLoading & "skeleton-loading"}`}
                        style={{ width: "100px", height: "100px" }}
                        src={
                          userValidationData?.profilePictureFileName &&
                          userValidationData?.ppShowHide !== "Yes"
                            ? GetAttachmentNoToken(
                                userValidationData?.userId,
                                profilePicObj?.fileName,
                                profilePicObj?.fileId
                              )
                            : images.user
                        }
                        onError={(e) => {
                          e.target.src = images.user;
                        }}
                        alt={"requestor-profile-image"}
                      />
                    </div>

                    <div style={{ marginLeft: "20px" }}>
                      <h2
                        className={`${isLoading ? "skeleton-loading" : ""}`}
                        style={{ color: "var(--primary-color)" }}
                      >
                        {userValidationData?.firstName || ""}
                        &nbsp;
                        {userValidationData?.lastName || ""}
                      </h2>
                      <div className="d-md-flex align-items-center mt-3 flex-wrap w-100">
                        {/* EMAIL */}
                        {userValidationData?.email ? (
                          <div className="d-md-flex  align-items-center">
                            <icons.EmailOutlinedIcon
                              style={{ color: "var(--primary-color)" }}
                            />
                            {isLoading ? (
                              <p
                                className={`${
                                  isLoading ? "skeleton-loading" : ""
                                }`}
                              ></p>
                            ) : (
                              <span className="ms-2">
                                {userValidationData?.email}
                              </span>
                            )}
                          </div>
                        ) : null}

                        {/* MOBILE NUMBER */}
                        {userValidationData?.mobileNumber ? (
                          <div className="d-md-flex align-items-center  ms-md-5">
                            <icons.PhoneEnabledOutlinedIcon
                              className="rotate-90"
                              style={{ color: "var(--primary-color)" }}
                            />
                            {isLoading ? (
                              <p
                                className={`${
                                  isLoading ? "skeleton-loading" : ""
                                }`}
                              ></p>
                            ) : (
                              <span className="ms-2">
                                {userValidationData?.mobileNumber
                                  ? userValidationData?.mnShowHide !== "Yes"
                                    ? userValidationData?.mobileNumber
                                    : contentLabel(
                                        "Confidential",
                                        "nf Confidential"
                                      )
                                  : ""}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>

                      {/* DESCRIPTION OR ABOUT SECTION */}
                      {userValidationData?.about ||
                      userValidationData?.description ? (
                        <div className="d-md-flex align-items-center  mt-2">
                          <icons.InfoOutlinedIcon
                            style={{ color: "var(--primary-color)" }}
                          />
                          {isLoading ? (
                            <p
                              className={`${
                                isLoading ? "skeleton-loading" : ""
                              }`}
                            ></p>
                          ) : (
                            <span className="ms-2">
                              {userValidationData?.about ||
                                userValidationData?.description}
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Validation Details */}
              <Row className=" p-lg-3 ">
                <p className="fw-bold fs-5">
                  {contentLabel("ValidationDetails", "nf ValidationDetails")}
                </p>
                <div
                  className="col-12"
                  style={{ borderBottom: "2px solid var(--light-color)" }}
                >
                  <div className="ms-4">
                    <p className="fw-bold fs-6 mt-2">
                      {contentLabel(
                        "ValidationRequiredFor",
                        "nf Validation Required For"
                      )}
                      :
                    </p>
                    <Row className="mb-2">
                      <Col md={4}>
                        <strong>
                          {contentLabel("ItemName", "nf Item Name")}
                        </strong>
                        <p>{userValidationData?.keyName || "N/A"}</p>
                      </Col>

                      <Col md={4}>
                        <strong>
                          {contentLabel("ProjectType", "nf Project Type")}
                        </strong>
                        <p>{userValidationData?.mtype || "N/A"}</p>
                      </Col>

                      {/* Horizontal Row: Location */}
                      {userValidationData?.location && (
                        <Col md={4}>
                          <strong>
                            {contentLabel(
                              "ProjectLocation",
                              "nf Project Location"
                            )}
                          </strong>
                          <p>{userValidationData?.location || "N/A"}</p>
                        </Col>
                      )}

                      {/* Vertical Row: Skill */}
                      {userValidationData?.skillOccupation && (
                        <Col md={4}>
                          <strong>
                            {contentLabel("SkillLabel", "nf SkillLabel")}
                          </strong>
                          <p className="text-secondary">
                            {userValidationData?.skillOccupation || "N/A"}
                          </p>
                        </Col>
                      )}

                      {/* Vertical Row: Validation */}

                      <Col md={4}>
                        <strong>
                          {contentLabel("Validated", "nf Validated")}
                        </strong>
                        <p className="text-secondary">
                          {userValidationData?.validatorResponse === "Accept"
                            ? contentLabel(
                                "AlreadyValidated",
                                "nf Already Validated"
                              )
                            : contentLabel("No", "nf No")}
                        </p>
                      </Col>

                      {/* Horizontal Row: From, To */}

                      {userValidationData?.fromDate && (
                        <Col md={4}>
                          <strong>{contentLabel("From", "nf From")}</strong>
                          <p className="text-secondary">
                            {formatTimestampToDate(
                              Number(
                                userValidationData?.fromDate
                                  ? userValidationData?.fromDate
                                  : userValidationData?.dateSent
                              ),
                              regionalData?.selectedCountry?.dateFormat
                            )}
                          </p>
                        </Col>
                      )}

                      {userValidationData?.toDate && (
                        <Col md={4}>
                          <strong>{contentLabel("To", "nf To")}</strong>
                          <p className="text-secondary">
                            {formatTimestampToDate(
                              Number(userValidationData?.toDate),
                              regionalData?.selectedCountry?.dateFormat
                            )}
                          </p>
                        </Col>
                      )}

                      {userValidationData?.fromDate &&
                      userValidationData?.toDate ? (
                        <Col md={4}>
                          <strong>
                            {contentLabel(
                              "ProjectDuration",
                              "nf Project Duration"
                            )}
                          </strong>
                          <p>
                            {formatExperience(
                              contentLabel,
                              userValidationData?.fromDate,
                              days
                            )}
                          </p>
                        </Col>
                      ) : null}

                      {/* Vertical Row: Brief Description */}

                      <Col md={12}>
                        <strong>
                          {contentLabel(
                            "ProjectBriefDescription",
                            "nf Project Brief Description"
                          )}
                        </strong>
                        <p
                          className={
                            !userValidationData?.briefDescriptions?.length &&
                            "opacity-50"
                          }
                        >
                          {userValidationData?.briefDescriptions ||
                            contentLabel(
                              "NoBriefDesc",
                              "nf No brief description available"
                            )}
                        </p>
                      </Col>
                    </Row>
                  </div>
                </div>
                {/* REQUESTOR MESSAGE */}
                <div
                  className="col-12 col-md-6"
                  style={{ borderRight: "1px solid var(--light-color)" }}
                >
                  <div className="ms-4">
                    <h5 className="fw-bold mt-4">
                      {contentLabel(
                        "MessageFromTheRequester",
                        "nf Message from the requester"
                      )}{" "}
                      :
                    </h5>
                    <blockquote className="mt-2">
                      <p
                        className={
                          !userValidationData?.remarks?.length && "opacity-50"
                        }
                      >
                        {userValidationData?.remarks ||
                          contentLabel(
                            "NoMsgSent",
                            "nf No message sent from requestor"
                          )}
                      </p>
                    </blockquote>
                  </div>
                </div>
                {/* VALIDATIOR MESSAGE */}
                <div className="col-12 col-md-6">
                  <div className="ms-4">
                    <h5 className="fw-bold mt-4">
                      {contentLabel(
                        "MessageToTheRequester",
                        "nf Message To The Requester"
                      )}{" "}
                      :
                    </h5>
                    <div className="form-floating">
                      <textarea
                        className="form-control"
                        placeholder="Leave a comment here"
                        id="floatingTextarea"
                        value={validatorComment}
                        onChange={(e) => setValidatiorComment(e.target.value)}
                      ></textarea>
                      <label htmlFor="floatingTextarea">
                        {contentLabel("TypeRemarks", "nf Type Remarks")} ...
                      </label>
                    </div>
                  </div>
                </div>
                {/* REQUESTOR ATTACHMENTS */}
                <div
                  className="col-12 col-md-6"
                  style={{ borderRight: "1px solid var(--light-color)" }}
                >
                  <div className="ms-4">
                    <h5 className="fw-bold mt-4">
                      {contentLabel(
                        "ReqAttachments",
                        "nf Requestor Attachments"
                      )}{" "}
                      :
                    </h5>
                    <p>
                      <span>
                        {userValidationData?.requestorAttachmentFileNames &&
                        JSON.parse(
                          userValidationData?.requestorAttachmentFileNames
                        ) ? (
                          JSON.parse(
                            userValidationData?.requestorAttachmentFileNames
                          ).map((attachment, index) => (
                            <React.Fragment>
                              <span
                                key={index}
                                className="text-primary-color cursor-pointer"
                                onClick={() => {
                                  attachment?.fileType === "youtube.com"
                                    ? window.open(
                                        attachment?.fileTitle,
                                        "_blank"
                                      )
                                    : window.open(
                                        GetAttachmentNoToken(
                                          attachment?.linkedId,
                                          attachment?.fileName,
                                          attachment?.fileId
                                        ),
                                        "_blank"
                                      );
                                }}
                              >
                                {index > 0 && " | "}{" "}
                                {attachment?.fileName?.trim()}
                              </span>
                            </React.Fragment>
                          ))
                        ) : (
                          <p className="opacity-75">
                            {contentLabel(
                              "NoAttachmentsSent",
                              "nf No Attachments Sent"
                            )}
                          </p>
                        )}
                      </span>
                    </p>
                  </div>
                </div>
                {/* VALIDATOR ATTACHMENTS */}
                <div className="col-12 col-md-6">
                  <div className="ms-4">
                    <h5 className="fw-bold mt-4">
                      {contentLabel("Attachments", "nf Attachments")} :
                    </h5>
                    <div className="input-group">
                      <input
                        type="file"
                        className="form-control"
                        id="inputGroupFile04"
                        aria-describedby="inputGroupFileAddon04"
                        aria-label="Upload"
                        onChange={(e) => handleValidatorAttachment(e)}
                        multiple
                        accept=".pdf,.jpeg,.jpg,.png,.xlsx,.docx"
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        id="inputGroupFileAddon04"
                        onClick={handleAddFiles}
                      >
                        {(
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "Add"
                          ) || {}
                        ).mvalue || "nf Add"}
                      </button>
                    </div>
                    {attachmentFiles?.length > 0 && (
                      <div className="d-flex align-items-center">
                        {attachmentFiles?.map((file, index) => (
                          <div key={index}>
                            <p
                              className="bg-primary text-white p-2 rounded me-1"
                              style={{
                                fontSize: "0.9em",
                                opacity: isAttachmentLoading ? "0.5" : "",
                              }}
                            >
                              <FaTimes
                                className="cursor-pointer"
                                onClick={() => handleRemoveAttachment(index)}
                              />
                              {file?.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* INCASE OF ERROR IN FILE NUMBERS */}
                    {showAttachmentError && (
                      <b className="text-danger">{"Upto 4 files allowed!"}</b>
                    )}
                    {showFileSizeError && (
                      <b className="text-danger">{"File size too large!"}</b>
                    )}
                  </div>
                </div>
              </Row>

              <Row className="mt-4 mb-2 mx-2">
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button
                    variant="outline-secondary"
                    disabled={isValidated || isAttachmentLoading || isSending}
                    onClick={() => handleUpdate("Abstain")}
                  >
                    {contentLabel("Abstain", "nf Abstain")}
                  </Button>
                  <Button
                    variant="outline-danger"
                    disabled={isValidated || isAttachmentLoading || isSending}
                    onClick={() => handleUpdate("Reject")}
                  >
                    {contentLabel("Reject", "nf Reject")}
                  </Button>
                  <CustomButton
                    title={contentLabel("Accept", "nf Accept")}
                    disabled={isValidated || isAttachmentLoading || isSending}
                    onClick={() => handleUpdate("Accept")}
                  />
                </div>
              </Row>
            </div>
            {/* Arrow for toggling additional details */}
            <div
              className="arrow-toggle"
              onClick={toggleAdditionalDetails}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "fixed",
                top: "50%",
                right: "0",
                cursor: "pointer",
                zIndex: 100,
                animation: !showAdditionalDetails
                  ? "moveArrow 0.5s infinite alternate"
                  : "none",
              }}
            >
              <FaChevronLeft
                size={30}
                style={{ color: "var(--primary-color)" }}
              />
            </div>

            {/* Additional details bar */}
            {showAdditionalDetails && (
              <div
                className="additional-details pt-5"
                style={{
                  position: "fixed",
                  top: "0",
                  left: showAdditionalDetails ? "0" : "-100%",
                  width: showAdditionalDetails ? "100%" : "0",
                  height: "100vh",
                  backgroundColor: "white",
                  zIndex: 1000,
                  overflowY: "auto",
                  transition: "left 0.5s ease-in-out, width 0.5s ease-in-out",
                }}
              >
                {/* Close icon */}
                <div
                  className="close-icon"
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    cursor: "pointer",
                    zIndex: 1001,
                  }}
                  onClick={toggleAdditionalDetails}
                >
                  <FaTimes size={30} />
                </div>
                {/* Additional details content */}
                <ValidationLetterTemplate
                  dateSent={userValidationData?.dateSent}
                  firstName={userValidationData?.firstName}
                  lastName={userValidationData?.lastName}
                  skillOccupation={userValidationData?.skillOccupation}
                  fromDate={userValidationData?.fromDate}
                  toDate={userValidationData?.toDate}
                  briefDescription={userValidationData?.remarks}
                  keyName={userValidationData?.keyName}
                  keyTable={userValidationData?.keyTable}
                  relationship={
                    validationRelationData?.find(
                      (relation) =>
                        relation?.validatorLabel ===
                        userValidationData?.relationship
                    )?.validatorRelation
                  }
                  location={userValidationData?.location}
                />
              </div>
            )}
          </main>
        )}

      {/* IF VALIDATION ABSTAIN OR REJECT */}
      {["Reject", "Abstain"].includes(userValidationData?.validatorResponse) &&
        !errorPage &&
        !userValidationData?.expired && (
          <React.Fragment>
            <ValidationSuccessTemp
              content={content}
              selectedLanguage={selectedLanguage}
            />
          </React.Fragment>
        )}

      {/* IF VALIDATION IS UPDATED */}
      {userValidationData?.expired &&
        !errorPage &&
        userValidationData?.message === "Validation link already used" && (
          <React.Fragment>
            <ValidationSuccessTemp
              content={content}
              selectedLanguage={selectedLanguage}
            />
          </React.Fragment>
        )}

      {/* ERROR PAGE */}
      {errorPage && (
        <div className="d-flex justify-content-center align-items-center">
          <div>
            <Lottie
              options={somethingWentWorngDefaultOptions}
              style={{ width: "100%", height: "90vh" }}
            />
          </div>
        </div>
      )}

      {/* LINK EXPIRED PAGE */}
      {userValidationData?.validatorResponse === "Request Expired" &&
        !errorPage &&
        userValidationData?.expired &&
        userValidationData?.message && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "90vh",
            }}
          >
            <div style={{ width: "200px", height: "200px" }}>
              <Lottie
                options={expiredDefaultOptions}
                style={{
                  animation: "heartbeat 1s infinite",
                  width: "100%",
                  height: "100%",
                }}
              />
              <div
                className="mt-2"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "rgb(140, 0, 0)",
                  textAlign: "center",
                }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "LinkExpired"
                  ) || {}
                ).mvalue || "nf Link has expired"}
                !
              </div>
            </div>
          </div>
        )}
    </React.Fragment>
  );
};

export default ValidationTemp;
