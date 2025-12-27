import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getUserExistenceDetailEmail } from "../../../api/auth/getUserExistenceDetail";
import ActionButton from "../../../components/atoms/Buttons/ActionButton";
import extractYouTubeVideoId from "../../../components/SkillOwner/HelperFunction/extractYouTubeVideoId";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import {
  encryptData,
  sessionEncrypt,
} from "../../../config/encrypt/encryptData";
import { icons } from "../../../constants";
import useContentLabel from "../../../hooks/useContentLabel";
import InformationPopup from "../../../layouts/AdminLayout/NavBar/NavRight/information/InformationPopup";
import { resetCountry } from "../../../reducer/localization/CountryRegionalSlice";
import { setLanguage } from "../../../reducer/localization/languageSlice";
import SoAuthFormContainer from "./SoAuthFormContainer";
import { logoutUser } from "../../../Store";
import { TriggerOtp } from "../../../api/auth/TriggerOtp";
import { fetchEnableFlags } from "../../../reducer/settings/EnableFlagsSlice";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import {
  clearAllCookies,
  getCookie,
  setCookie,
} from "../../../config/cookieService";
import useOwnerRedirection from "../../../hooks/useOwnerRedirection";
import UserDetailsApi from "../../../api/auth/UserDetailsApi";
import { setUserProfile } from "../../../reducer/userDetails/UserProfileSlice";
import LogoLoader from "../../../components/LogoLoader";

const EmailVerificationSO = () => {
  /* NAVIGATE INIT */
  const navigate = useNavigate();
  /* DISPATCH INIT */
  const dispatch = useDispatch();
  /* CONTENT LABEL */
  const contentLabel = useContentLabel();
  //owner redirection
  const ownerRedirectionDecider = useOwnerRedirection();
  /* YOUTUBE VIDEO ID REF */
  const videoidRef = useRef(null);

  const userDetails = useSelector((state) => state.userProfile.data);

  const location = useLocation();
  const searchParams = location.search;

  const emailInputRef = useRef(null);

  const { data: infoData, status: infoStatus } = useSelector(
    (state) => state.information
  );

  /* THIS PROCESS IS HANDLE IN SIGNUP TOO, MAKE SURE TO CONSIDER */
  const { host } = window.location;
  const domainParts = host.split(".");
  const isProdEnvironment = host.includes("www.myskillstree.com");
  const hasPrefixBeforeProd = domainParts.indexOf("prod") > 0;
  const isAuthorized =
    host.includes("localhost") ||
    host.includes("parent") ||
    host.includes("Parent") ||
    host.includes("Owners") ||
    host.includes("owners") ||
    host.includes("dev") ||
    host.includes("tcs") ||
    host.includes("stg") ||
    

    (isProdEnvironment && !hasPrefixBeforeProd);

  /* STATES INIT */
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const { language: selectedLanguage, content } = useSelector((state) => state);

  // STORE IMPORTS
  const enableFlags = useSelector((state) => state?.EnableFlagsSlice);

  useEffect(() => {
    /* FULL URL */
    const fullURL = window.location.href;
    console.log("Full URL console:", fullURL);

    const queryStartIndex = fullURL.indexOf("externalSite=");
    console.log("Query Start Index:", queryStartIndex);
    // if (queryStartIndex === -1) {
    //   console.log("No valid query parameters found.");
    //   return;
    // }

    /* EXTRACTING THE PARAMS */
    const querySegment = fullURL.slice(queryStartIndex).split("#")[0];
    const params = new URLSearchParams(querySegment);
    const externalSiteValue = params.get("externalSite");
    const jdIdValue = params.get("jdId");
    const jdNameValue = params.get("jobName");

    if (externalSiteValue) {
      sessionStorage.setItem("externalSite", sessionEncrypt(externalSiteValue));
      setCookie("externalSite", externalSiteValue);
    }
    if (jdIdValue) {
      sessionStorage.setItem("JD_ID", sessionEncrypt(jdIdValue));
    }
    if (jdNameValue) {
      sessionStorage.setItem("JD_NAME", sessionEncrypt(jdNameValue));
    }
  }, []);

  /* DOCUMENT TITLE INIT */
  useEffect(() => {
    document.title = contentLabel("WelcomeToMyST", "nf Welcome to MyST");
  }, [contentLabel]);

  /* DISPATCH COUNTRY INITIAL VALUE */
  useEffect(() => {
    dispatch(resetCountry());
  }, [dispatch]);

  /* CLAERING STATES */
  useEffect(() => {
    logoutUser();
  }, []);

  /* GET ENABLE FLAGS */
  useEffect(() => {
    console.log("enableFlags?.status", enableFlags?.status);

    if (enableFlags?.status === "idle") {
      dispatch(fetchEnableFlags());
    }
  }, [enableFlags?.status, dispatch]);

  /* HANDLE EMAIL SUBMIT */
  const handleEmailSubmit = useCallback(
    async (e) => {
      /* PREVENT BROWSER DEFAULT BEHAVIOR NOTE: ADDED THIS TO AVOID PAGE UNNECESSARY RELOAD */
      e.preventDefault();
      /* INIT LOADING */
      setIsLoading(true);

      /* EMAIL FORMAT */
      const emailRegX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email.length) {
        setIsLoading(false);
        showErrorToast(contentLabel("EnterEmail", "nf Please enter an email"));
        return;
      } else if (!emailRegX.test(email)) {
        setIsLoading(false);
        showErrorToast(
          contentLabel("EnterValidEmail", "nf Please enter valid email address")
        );
        return;
      }

      const payload = {
        id: encryptData(email),
      };

      try {
        const res = await getUserExistenceDetailEmail(payload);
        const data = res?.data;

        if (data?.message === "Account Not Exist") {
          if (location?.pathname.includes("/services")) {
            showErrorToast(
              contentLabel("AccountNotExist", "nf Account Not Exist")
            );
            return;
          }

          // if (enableFlags?.flags?.signupEmailVerification) {
          //   //  call api to trigger otp
          //   TriggerOtp(encryptData(email), "Email")
          //     .then((res) => {
          //       console.log("res", res);
          //     })
          //     .catch((error) => {
          //       console.log("error", error);
          //     });
          // }

          // showSuccessToast(
          //   (
          //     content[selectedLanguage]?.find(
          //       (item) => item.elementLabel === "EmailSent"
          //     ) || {}
          //   ).mvalue || "nf Email sent successfully"
          // );
          // isAuthorized ? navigate("/signup") : navigate("/unauthorized");
          isAuthorized
            ? navigate("/skill-owner/email-not-found")
            : navigate("/unauthorized");
        } else if (data?.message === "Account Exist") {
          /* GET HOME LANGUAGE OF THE USER */
          dispatch(setLanguage(data?.homeLanguage));
          // navigate("/signin");
          if (location?.pathname.includes("/skill-owner")) {
            navigate("/skill-owner/login");
          } else if (location?.pathname.includes("/services")) {
            navigate("/services/login");
          }
        }
        /* SET EMAIL IN LOCAL STORAGE */
        sessionStorage.setItem("auth_key", sessionEncrypt(email));
        sessionStorage.setItem("auth_site", sessionEncrypt(location?.pathname));
        setCookie("auth_key", email);
        setCookie("auth_site", location?.pathname);
      } catch (error) {
        if (error instanceof TypeError) {
          console.error("Type error occured: ", error.message);
        } else if (error instanceof ReferenceError) {
          console.error("Reference error occured: ", error.message);
        } else {
          console.error("Error occured while checking email: ", error.message);
        }
        showErrorToast(
          contentLabel("SomethingWentWrong", "nf Something Went Wrong")
        );
      } finally {
        /* SET LOADING STATE FALSE */
        setIsLoading(false);
      }
    },
    [email, navigate, dispatch, contentLabel, isAuthorized]
  );

  /* HANDLE POPUP OPEN */
  const handlePopUpOpen = useCallback((id, label) => {
    setPopUpOpen(true);
    setVideoData({
      id: id,
      label: label,
    });
  }, []);

  /* HANDLE POPUP CLOSE */
  const handlePopUpClose = useCallback(() => {
    setPopUpOpen(false);
  }, []);

  function handleRedirection(userData) {
    let navLink = "";

    switch (userData?.onBoardingSection) {
      case "1":
        navLink = `/skill-owner/welcome/personal-information`;
        break;
      case "2":
        navLink = `/skill-owner/welcome/skills`;
        break;
      case "3":
        navLink = `/skill-owner/welcome/employment`;
        break;
      case "4":
        navLink = `/skill-owner/welcome/education`;
        break;
      case "5":
        navLink = `/skill-owner/welcome/certifications`;
        break;
      case "6":
        navLink = `/skill-owner/welcome/achievements`;
        break;
      case "7":
        navLink = `/skill-owner/welcome/finish`;
        break;
      default:
        navLink = `/skill-owner/introduction`;
        break;
    }

    if (userData?.interface?.toLowerCase() === "simple") {
      if (
        userData?.onBoarding?.toLowerCase() === "yes" &&
        userData?.onBoardingSection === "0"
      ) {
        navigate(`/skill-owner/introduction`);
      } else {
        // navigate(`/skill-owner/welcome/continue`, {
        navigate(`/skill-owner/introduction`, {
          state: { path: navLink },
        });
      }
    } else if (userData?.interface?.toLowerCase() === "normal") {
      navigate(`/skill-owner/dashboard`);
    }
  }

  useEffect(() => {
    const [filteredData] = infoData?.filter(
      (info) => info?.label === "SISORegisterLogin"
    );
    const obj = {
      title: filteredData?.title,
      id: extractYouTubeVideoId(filteredData?.url),
    };
    videoidRef.current = obj;
  }, [infoData, videoData?.label]);

  // console.log("blah 1");

  useEffect(() => {
    const token = getCookie("token");
    const role = getCookie("USER_ROLE");
    const userId = getCookie("userId");
    //redirection logic based on user role
    if (token && role && userId) {
      // console.log("blah 11");

      if (location?.pathname.includes("/services/email") && role === "R1") {
        clearAllCookies();
      } else if (
        location?.pathname.includes("/skill-owner/email") &&
        role !== "R1"
      ) {
        clearAllCookies();
      } else if (role === "R1") {
        const urlParams = new URLSearchParams(window.location.search);
        const externalSite = urlParams.get("externalSite");
        const jdId = urlParams.get("jdId");
        const jobName = urlParams.get("jobName");
        let userData = null;
        // console.log("blah a");
        UserDetailsApi().then((res) => {
          if (res.status === 200) {
            const userDetails = {
              ...res.data,
              token: getCookie("token"),
            };
            userData = userDetails;
            // console.log("blah userDetails ", userDetails[0]);
            if (userDetails[0]?.onBoarding?.toLowerCase() === "yes") {
              // console.log("blah a1");

              handleRedirection(userDetails[0]);
            } else {
              // console.log("blah a2");
              // if redirect from external site and with valid jd params
              // get params from url externalSite and jdId and jobName

              ownerRedirectionDecider({ externalSite, jdId, jobName });
            }
            dispatch(setUserProfile(userDetails));
          }
        });
      } else if (role === "R2") {
        navigate("/skill-seeker/basic/dashboard");
      } else if (role === "R3") {
        navigate("/skilling-agency/my-courses");
      } else if (role === "R6") {
        navigate("/support-services/skillsearch");
      }
    }
  }, []);

  return (
    <SoAuthFormContainer>
      {
        isLoading && <LogoLoader />
      }
      <div>
        <h1 className="so-form-login-font">
          
          {contentLabel("Welcome", "nf Welcome!")}
        </h1>
        <p className="so-form-note-font">
          {contentLabel(
            "EnterEmailToProceed",
            "nf Enter your email address to proceed"
          )}
        </p>
      </div>
      <form>
        <div className="so-form-grids">
          <label
            htmlFor="email"
            className="d-block w-100 position-relative text-start"
          >
            <span className="so-login-from-label-email">
              {contentLabel("EmailAddress", "nf Email Address")}
              <span className="text-danger">*</span>
            </span>
            <span className="so-form-login-input-wrapper">
              {/* <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEmailSubmit(e);
                  }
                }}
                autoComplete
                required
                autoFocus
              /> */}

              <input
                ref={emailInputRef}
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => {
                  const cursorPos = e.target.selectionStart;
                  const lowerValue = e.target.value.toLowerCase();
                  setEmail(lowerValue);

                  requestAnimationFrame(() => {
                    try {
                      emailInputRef.current?.setSelectionRange(
                        cursorPos,
                        cursorPos
                      );
                    } catch {}
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleEmailSubmit(e);
                  }
                }}
                autoComplete="email"
                required
                autoFocus
              />
            </span>
          </label>
          <div className="so-form-button-text">
            <ActionButton
              label={contentLabel("Next", "nf Next")}
              disabled={isLoading || !email?.length}
              onClick={handleEmailSubmit}
            />
          </div>

          {/* INFORMATION POPUPS */}
          {/* <aside className="d-flex flex-column align-items-end">
            <Link
              className="text-center text-decoration-none cursor-pointer"
              onClick={() =>
                handlePopUpOpen(
                  videoidRef.current?.id,
                  videoidRef.current?.title
                )
              }
            >
              <icons.InfoOutlinedIcon />
            </Link>
          </aside> */}
        </div>
      </form>

      {isPopUpOpen && (
        <InformationPopup
          openPopup={isPopUpOpen}
          handlePopupClose={handlePopUpClose}
          label={videoData?.label}
          videoId={videoData?.id}
          isSearch={false}
        />
      )}
    </SoAuthFormContainer>
  );
};

export default EmailVerificationSO;
