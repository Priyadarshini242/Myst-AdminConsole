import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { getCookie, setCookie } from "../../../config/cookieService";
import { v4 as uuidv4 } from 'uuid';
import getEncryptedUserApi from "../../../api/auth/getEncryptedUserApi";
import { setIsApiLoading } from "../../../reducer/loading/isApiLoadingSlice";

const EmailVerificationSSO = () => {
  /* NAVIGATE INIT */
  const navigate = useNavigate();
  /* DISPATCH INIT */
  const dispatch = useDispatch();
  /* CONTENT LABEL */
  const contentLabel = useContentLabel();
  /* YOUTUBE VIDEO ID REF */
  const videoidRef = useRef(null);
  const redirectDomain = process.env.REACT_APP_REDIRECT_URI;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
    const { isLoading: redirectionLoading } = useSelector(state => state.isApiLoading);


    // Extract query params from location.search
  const getParams = () => {

    return {
      client_id: searchParams.get("client_id"),
      redirect_uri: searchParams.get("redirect_uri"),
    };
  };

  // Validate params
  const validateParams = (params) => {
    if (!params.client_id) return false;
    if (!params.redirect_uri) return false;

    // Optional strict checks
    // if (params.client_id !== "skillconnect") return false;
    // if (params.redirect_uri !== redirectDomain) return false;

    return true;
  };

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

    const extractedParams = getParams();

    if (!validateParams(extractedParams)) {
      showErrorToast( contentLabel('InvalidParams',"nf Params are missing or invalid"));
      return
    }

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
          showErrorToast(contentLabel('AccountNotExist', 'nf Account Not Exist'))
          return
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
          // isAuthorized ? navigate(`/signup/sso/authorize/${location.search}`) : navigate("/unauthorized");
        } else if (data?.message === "Account Exist") {
          /* GET HOME LANGUAGE OF THE USER */
          dispatch(setLanguage(data?.homeLanguage));
          navigate(`/signin/sso/authorize${location.search}`);
        }
        /* SET EMAIL IN LOCAL STORAGE */
        sessionStorage.setItem("auth_key", sessionEncrypt(email));
        setCookie("auth_key", email);
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

  const token = getCookie("token");
  const role = getCookie("USER_ROLE");
  const userId = getCookie("userId");

  // //redirection logic based on user role
  // if (token && role && userId && validateParams(getParams())) {
  //   if (role === "R1") {
  //    window.location.href = `https://skillconnect.com/sso/callback?id=${userId}`;
  //   } 
  // }

  
useLayoutEffect(() => {
  const handleRedirection = async () => {

    
    if (token && role && userId && validateParams(getParams())) {
      if (role === "R1") {

         setIsApiLoading(true)
        try {
          const encryptedUserId = await getEncryptedUserApi(userId);

          if (
            location?.pathname?.includes("/sso/authorize") &&
            encryptedUserId?.data?.encryptedText
          ) {
            window.location.replace(
              `${searchParams.get("redirect_uri")}?id=${encryptedUserId?.data?.encryptedText}`
            );
          }
        } catch (err) {
          console.error("Encryption API error:", err);
          showErrorToast(contentLabel('InvalidParams','nf Invalid Parameters'))
        } finally{
           setIsApiLoading(false)
        }
      }
    }
  };

  handleRedirection();
}, []);

 if(redirectionLoading){
  return (
  <>

  </>
  )
 }

  return (
    <SoAuthFormContainer>
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

export default EmailVerificationSSO;
