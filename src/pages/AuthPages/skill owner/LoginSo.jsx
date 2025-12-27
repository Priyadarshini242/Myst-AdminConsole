import axios from "axios";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LoginApiEncrypt, RoleLoginApiEncrypt } from "../../../api/auth/getUserExistenceDetail";
import UserDetailsApi from "../../../api/auth/UserDetailsApi";
import ActionButton from "../../../components/atoms/Buttons/ActionButton";
import extractYouTubeVideoId from "../../../components/SkillOwner/HelperFunction/extractYouTubeVideoId";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import {
  encryptData,
  sessionDecrypt,
  sessionEncrypt,
} from "../../../config/encrypt/encryptData";
import { BASE_URL } from "../../../config/Properties";
import { icons } from "../../../constants";
import useContentLabel from "../../../hooks/useContentLabel";
import InformationPopup from "../../../layouts/AdminLayout/NavBar/NavRight/information/InformationPopup";
import { fetchUserAttachment } from "../../../reducer/attachments/getUserAttachmentSlice";
import { setRegCountry } from "../../../reducer/localization/CountryRegionalSlice";
import {
  fetchMenuItemR1,
  fetchMenuItemR2,
  fetchMenuItemR3,
} from "../../../reducer/menuItems/menuItemR1Slice";
import {
  fetchRoles,
  setCurrentRole,
  setUserRoles,
} from "../../../reducer/roles/RoleMappingSlice";
import { setUserProfile } from "../../../reducer/userDetails/UserProfileSlice";
import { fetchValidation } from "../../../reducer/validation/getUserValidationSlice";
import SoAuthFormContainer from "./SoAuthFormContainer";
import { fetchValidationRelation } from "../../../reducer/validation/validationRelationSlice";
import * as actionType from "../../../store/actions";
import { ConfigContext } from "../../../context/ConfigContext";
import { GetAllExternalLinksApi } from "../../../api/Jd Category, Jd Exp, External sites/GetAllExternalLinksApi";
import { clearAllCookies, clearCookiesExceptAuth, getCookie, removeCookie, setCookie } from "../../../config/cookieService";
import { remove } from "lodash";
import getEncryptedUserApi from "../../../api/auth/getEncryptedUserApi";
import LogoLoader from "../../../components/LogoLoader";

const LoginSo = () => {
  const contentLabel = useContentLabel();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  /* YOUTUBE VIDEO ID REF */
  const videoidRef = useRef(null);
  const configContext = useContext(ConfigContext);
  const { collapseMenu } = configContext.state;
  /* STORE IMPORTS */
  const {
    language: selectedLanguage,
    content,
    roles,
    regionalData: { listOfCountries },
  } = useSelector((state) => state);

  const { data: infoData, status: infoStatus } = useSelector(
    (state) => state.information
  );

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Extract query params from location.search
  const getParams = () => {
    return {
      client_id: searchParams.get("client_id"),
      redirect_uri: searchParams.get("redirect_uri"),
    };
  };

  const redirectDomain = process.env.REACT_APP_REDIRECT_URI;

  // Validate params
  const validateParams = (params) => {
    if (!params.client_id) return false;
    if (!params.redirect_uri) return false;
    // Optional strict checks
    // if (params.client_id !== "skillconnect") return false;
    // if (params.redirect_uri !== `${redirectDomain}/sso/callback`) return false;
    return true;
  };

  const email = getCookie("auth_key");
  const site = getCookie("auth_site");
  const jobId = sessionStorage.getItem("JD_ID");
  const jobName = sessionStorage.getItem("JD_NAME");
  const courseRId = sessionStorage.getItem("C_ID");
  const courseRName = sessionStorage.getItem("C_NAME");

  const [isPasswordShow, setIsPasswordShow] = useState(false);

  /* STATES INIT */
  const [password, setPassword] = useState("");

  const [selectedServiceRole, setSelectedServiceRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rolesMap, setRolesMap] = useState([]);
  const [isLoadinRoles, setIsLoadinRoles] = useState(false);
  const [error, setError] = useState("");
  const [isPopUpOpen, setPopUpOpen] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const { externalLinks } = useSelector((state) => state.ExternalLinks);

  /* CLEAR LOCAL STORAGE WHEN USER CLOSE TAB */
  useEffect(() => {
    const handleTabClose = () => {
      sessionStorage.clear();
      clearAllCookies();
    };

    window.addEventListener("unload", handleTabClose);

    return () => {
      window.removeEventListener("unload", handleTabClose);
    };
  }, []);
  useEffect(() => {
    console.log('authkey', email);

    if (!email) {
      if(location?.pathname.includes('/skill-owner')){
        navigate("/skill-owner/email");
      }else if(location?.pathname.includes('/services')){
          navigate("/services/email");
      }
    }
  }, []);
  useEffect(() => {
    dispatch(GetAllExternalLinksApi());
    dispatch(fetchRoles());
  }, []);

  // useEffect(() => {
  //   setIsLoadinRoles(true);
  //   const fetchDetails = async () => {
  //     const res = await getUserExistenceDetail(email);
  //     const filteredRoles = roles?.data.filter((role) =>
  //       res?.data?.account?.roles
  //         .map((role) => role.roleName)
  //         .includes(role.roleName)
  //     );
  //     setRolesMap(filteredRoles);
  //     setSelectedRole(filteredRoles[0]?.roleName);
  //     setIsLoadinRoles(false);
  //   };
  //   fetchDetails();
  // }, [email, roles]);

  /* DOCUMENT TITLE INIT */
  useEffect(() => {
    document.title = `${(
        content[selectedLanguage]?.find(
          (item) => item.elementLabel === "Title"
        ) || {}
      ).mvalue || "MySkillsTree"
      } ${(
        content[selectedLanguage]?.find(
          (item) => item.elementLabel === "SignIn"
        ) || {}
      ).mvalue || "SignIn"
      }`;
  }, [content, selectedLanguage]);

  /* GET ACCOUNT DETAIILS */
  const getAccountDetail = useCallback(async (accountId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/skill/api/v1/skills/AcccountDetails/${accountId}`
      );
      return res;
    } catch (error) {
      console.error("ERROR GETTING ACCOUNT DETAILS: ", error);
    }
  }, []);

  const successLogin = useCallback(() => {
    showSuccessToast(
      (
        content[selectedLanguage]?.find(
          (item) => item.elementLabel === "LoginSuccessful"
        ) || {}
      ).mvalue || "nf Login Successful!"
    );
    sessionStorage.removeItem("auth_key");
    removeCookie("auth_key");
    /* SET ISLOADING TO FALSE */
    setIsLoading(false);
  }, [content, selectedLanguage]);

  const funcDispatch = useCallback(() => {
    dispatch(fetchValidation());
    dispatch(fetchUserAttachment());
    dispatch(fetchValidationRelation());
    // dispatch({ type: actionType.COLLAPSE_MENU });
  }, [dispatch]);

  /* ERROR HANDLING MIDDLEWARE */
  const handleLoginError = useCallback(
    (err) => {
      switch (err) {
        case "Account is not registered with this tenant":
          showErrorToast(
            contentLabel(
              "NoAccountRegInTenant",
              "nf Account is not registered with this tenant"
            )
          );
          break;
        case "Account is not associated with any tenant":
          showErrorToast(
            contentLabel(
              "AccountNotRegWithAnyTenant",
              "nf Account is not associated with any tenant"
            )
          );
          break;
        case "Invalid Username/Password":
          showErrorToast(
            contentLabel("InvalidPassword", "nf Invalid Password")
          );
          break;
        case "User does not have the required roles to access this application":
          showErrorToast(
            contentLabel("SelectedRoleNotOpted", "nf Invalid Role")
          );
          break;
        case "Account locked due to too many failed login attempts. Please try again 5 minutes later.":
          showErrorToast(
            contentLabel(
              "LoginAttemptsExceedMsg",
              "nf Account locked due to too many failed login attempts. Please try again 5 minutes later."
            )
          );
          break;
        default:
          showErrorToast(
            contentLabel("SomethingWentWrong", "nf Something Went Wrong")
          );
      }
    },
    [contentLabel]
  );

  /* HANDLE SIGNIN */
  const handleSignIn = useCallback(
    async (e) => {
      setIsLoading(true);
      e.preventDefault();
      e.stopPropagation();
      const extractedParams = getParams();

      if (location?.pathname?.includes('/sso/authorize') && !validateParams(extractedParams)) {
        showErrorToast(contentLabel('InvalidParams', "nf Params are missing or invalid"));
        setIsLoading(false);
        return
      }

      const form = e.currentTarget;
      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (password === "") {
        setIsLoading(false);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "MissingMandatoryFields"
            ) || {}
          ).mvalue || "nf Mandatory fields cannot be empty"
        );
        return;
      }

      
      if (!selectedServiceRole && location?.pathname.includes('/services')) {
        setIsLoading(false);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "PleaseSelectARole"
            ) || {}
          ).mvalue || "nf Please Select a Role"
        );
        return;
      }

      /* PAYLOAD */
      const payload = {
        username: encryptData(
          getCookie("auth_key")
        ),
        password: encryptData(password),

        roles: location?.pathname.includes('/services') ? [selectedServiceRole] : ['R1']
      };

      try {
        const res = await RoleLoginApiEncrypt(payload);

        const data = res?.data;
        if (data?.status === "success" && data?.userId) {
          setSelectedRole(data?.priveleges?.sort()[0]);
          sessionStorage.setItem("userId", sessionEncrypt(data?.userId));

          sessionStorage.setItem(
            "token",
            sessionEncrypt(data?.authenticationtoken)
          );
          setCookie("authToken", data?.authenticationtoken);
          setCookie("userId", data?.userId);
          setCookie("token", data?.authenticationtoken);

          dispatch(setCurrentRole(data?.priveleges?.sort()[0]));

          if (
            data?.account?.homeTimeZone !== null &&
            data?.account.homeTimeZone !== undefined
          ) {
            const res = await axios.get(
              `${BASE_URL}/skill/api/v1/skills/RegionalData/Time Zone Data?&searchFieldName=countryCode&searchValue=${data?.account?.homeCountry}%25`
            );
            const mappedArray = res?.data.map((obj) => ({
              ...obj,
              value: obj.abbreviation,
              label:
                obj.countryCode +
                " " +
                obj.abbreviation +
                " " +
                obj?.timeZone +
                " " +
                obj.gmtOffset,
            }));

            let selectedObjects = data.account?.homeTimeZone;
            if (mappedArray.length > 0) {
              selectedObjects = mappedArray?.find(
                (item) => item.abbreviation === data.account?.homeTimeZone
              );
            }
            sessionStorage.setItem(
              "TimeZone",
              sessionEncrypt(selectedObjects?.label)
            );
            setCookie("TimeZone", selectedObjects?.label);
          } else {
            sessionStorage.setItem(
              "TimeZone",
              sessionEncrypt(data?.account?.homeTimeZone)
            );
            setCookie("TimeZone", data?.account?.homeTimeZone);
          }

          sessionStorage.setItem(
            "userName",
            sessionEncrypt(data?.account?.accountId)
          );
          setCookie("userName", data?.account?.accountId);
          sessionStorage.setItem(
            "countryCode",
            sessionEncrypt(data?.account?.homeCountry)
          );
          setCookie("countryCode", data?.account?.homeCountry);

          sessionStorage.setItem(
            "HLang",
            sessionEncrypt(data?.account?.homeLanguage)
          );
          setCookie("HLang", data?.account?.homeLanguage);
          /* STORE ROLE IN LOCAL STORAGE */
          sessionStorage.setItem(
            "USER_ROLE",
            sessionEncrypt(data?.priveleges?.sort()[0])
          );
          setCookie("USER_ROLE", data?.priveleges?.sort()[0]);

          sessionStorage.setItem("IS_PAGE_REFRESHED", sessionEncrypt("true"));
          setCookie("IS_PAGE_REFRESHED", "true");
          sessionStorage.setItem("ONBOARDING_TOGGLE", sessionEncrypt("false"));
          setCookie("ONBOARDING_TOGGLE", "false");
          dispatch(setUserRoles(data?.priveleges));

          if (listOfCountries) {
            for (let country of listOfCountries) {
              if (
                country.countryCode ===
                getCookie("countryCode")
              ) {
                sessionStorage.setItem(
                  "dateFormat",
                  sessionEncrypt(country.dateFormat)
                );
                setCookie("dateFormat", country.dateFormat);
                dispatch(setRegCountry(country));
                break;
              }
            }
          }

          /* IF CANDIDATE ID PRESENT IN DATA AND SET IT INTO USER PROFILE OR ELSE SHOW CREATE PROFILE POPUP */
          if (data?.userId !== undefined) {

            const encryptedUserId = await getEncryptedUserApi(data?.userId)
            console.log('encryptedUserId', encryptedUserId);

            if (location?.pathname?.includes('/sso/authorize') && validateParams(extractedParams) && encryptedUserId?.data?.encryptedText) {
              window.location.replace(
                `${searchParams.get("redirect_uri")}?id=${encryptedUserId?.data?.encryptedText}`
              );
              return
            }

            /* FETCH CANDIDATE DETAILS AND SET IN USER PROFILE */
            UserDetailsApi().then((res) => {
              if (res.status === 200) {
                /* SET STATE FOR USER DETAILS */
                const userDetails = {
                  ...res.data,
                  token: data?.authenticationtoken,
                };
                const siteName = externalLinks.filter((item) => {
                  if (
                    item.extSiteName === res?.data[0]?.signUpSite &&
                    item.interface === res?.data[0]?.interface
                  )
                    return item.interface;
                });
                // const interFace = siteName[0]?.interface ? siteName[0]?.interface : "Simple" ;
                const interFace = res?.data[0]?.onBoarding === "Yes" ? "Simple" : "Normal";
                
                /* ROLES API */
                // const interFace =
                //   res?.data[0]?.signUpSite === "bluecollar"
                //     ? "Simple"
                //     : "Normal";
                // const interFace =
                //   res?.data[0]?.onBoarding === "Yes" 
                //   // &&
                //   // res?.data[0]?.interface === "Simple"
                //     ? "Simple"
                //     : "Normal";
                if (data?.priveleges?.sort()[0] === "R1") {
                  dispatch(fetchMenuItemR1(interFace));
                  setCookie("interface", interFace);
                } else if (data?.priveleges?.sort()[0] === "R2") {
                  dispatch(fetchMenuItemR2());
                } else if (data?.priveleges?.sort()[0] === "R3") {
                  dispatch(fetchMenuItemR3());
                }

                /* SET EXTERNAL SITE IN SESSION STORAGE */
                const externalSiteValue = res?.data[0]?.signUpSite
                  ? res?.data[0]?.signUpSite
                  : "-";
                sessionStorage.setItem(
                  "externalSite",
                  sessionEncrypt(externalSiteValue)
                );
                setCookie("externalSite", externalSiteValue);
                sessionStorage.setItem("interface", sessionEncrypt(interFace));
                setCookie("interface", interFace);
                dispatch(setUserProfile(userDetails));
                const isOnboardingTrue =   res.data[0]?.onBoarding?.toLowerCase() === "yes" ? true : false;

                /* FOR JOB NAVIAGATION */
                if (
                  data?.priveleges?.sort()[0] === "R1" &&
                  rolesArray.includes("R1") &&
                  jobId === null &&
                  jobId === "null" &&
                  (res.data[0].signUpSite === "bluecollar" ||
                    res.data[0]?.interface === "Simple") &&
                  res.data[0]?.firstName &&
                  res.data[0]?.lastName
                ) {
                  navigate(`/skill-owner/dashboard`);
                  return;
                } else if (
                  data?.priveleges?.sort()[0] === "R1" &&
                  rolesArray.includes("R1") &&
                  jobId !== null &&
                  jobId !== "null" && !isOnboardingTrue
                ) {
                  const queryParams = new URLSearchParams({
                    id: jobId,
                    name: jobName,
                  }).toString();
                  res.data[0]?.interface !== "Simple"
                    ? navigate(
                      `/skill-owner/opportunities/view-opportunities/view?${queryParams}`
                    )
                    : handleRedirection(res.data[0]);

                  return;
                }

                if (
                  data?.priveleges?.sort()[0] === "R1" &&
                  rolesArray.includes("R1") &&
                  courseRId
                ) {

                  const id = sessionDecrypt(courseRId)
                  const name = sessionDecrypt(courseRName)

                  const queryParams = new URLSearchParams({
                    id: sessionEncrypt(id),
                    name: sessionEncrypt(name),
                  }).toString();

                  navigate(`/skill-owner/up-skilling/view-courses/view?${queryParams}`);
                  // navigate(
                  //   `/skill-owner/up-skilling/view-courses/${courseRName}/${courseRId}`
                  // );

                  return;
                }

                /* HANDLE REDIRECTION */
                if (
                  (res.data[0].signUpSite === "bluecollar" ||
                    res.data[0]?.interface === "Simple") &&
                  data?.priveleges?.sort()[0] === "R1"
                ) {
                  handleRedirection(res.data[0]);
                } else if (
                  data?.priveleges?.sort()[0] === "R1" &&
                  rolesArray.includes("R1")
                ) {
                  if (jobId !== null && jobId !== "null") {
                    const queryParams = new URLSearchParams({
                      id: jobId,
                      name: jobName,
                      view: "opportunities",
                    }).toString();
                    navigate(`/skill-owner/dashboard/view?${queryParams}`);
                  }
                  else navigate(`/skill-owner/dashboard`);
                  
                } else if (
                  data?.priveleges?.sort()[0] === "R2" &&
                  rolesArray.includes("R2")
                ) {
                  navigate("/skill-seeker/basic/dashboard");
                } else if (
                  data?.priveleges?.sort()[0] === "R3" &&
                  rolesArray.includes("R3")
                ) {
                  navigate("/skilling-agency/basic/dashboard");
                } else if (
                  data?.priveleges?.sort()[0] === "R6" &&
                  rolesArray.includes("R6")
                ) {
                  navigate("/support-services/skillsearch");
                }
              } else {
                /* Handle error */
                sessionStorage.clear();
                clearAllCookies();
                navigate("/skillowner/user-auth");
              }
            });

            /* REDIRECTION LOGIC */
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
              // ****************************************************Temporarily commented*****************************************************
              // if (jobId !== null && jobId !== "null") {
              //   const queryParams = new URLSearchParams({
              //     id: jobId,
              //     name: jobName,
              //   }).toString();
              //   navigate(`/skill-owner/dashboard/view?${queryParams}`);
              // } else if (userData?.onBoarding?.toLowerCase() === "yes") {
              //   if (userData?.onBoardingSection === "0") {
              //     navigate(`/skill-owner/introduction`);
              //   } else if (userData?.onBoardingSection !== "0") {
              //     navigate(`/skill-owner/welcome/continue`, {
              //       state: { path: navLink },
              //     });
              //   }
              // } else {
              //   navigate(`/skill-owner/dashboard`);
              // }
              const isOnboardingTrue =  userData?.onBoarding?.toLowerCase() === "yes" ? true : false;
              if (jobId !== null && jobId !== "null" && !isOnboardingTrue) {
                const queryParams = new URLSearchParams({
                  id: jobId,
                  name: jobName,
                }).toString();
                navigate(`/skill-owner/dashboard/view?${queryParams}`);
              } else if (userData?.interface?.toLowerCase() === "simple") {
                if (
                  userData?.onBoarding?.toLowerCase() === "yes" &&
                  userData?.onBoardingSection === "0"
                ) {
                  navigate(`/skill-owner/introduction`);
                } else {
                  navigate(`/skill-owner/introduction`, {
                    state: { path: navLink },
                  });
                }
              } else if (userData?.interface?.toLowerCase() === "normal") {
                navigate(`/skill-owner/dashboard`);
              }
            }
          }

          /* ROLES */
          const rolesArray = [];
          if (data && data?.account) {
            data?.priveleges?.forEach((role) => {
              rolesArray.push(role);
            });
          }

          if (!rolesArray.includes(data?.priveleges?.sort()[0])) {
            setIsLoading(false);
            Object.keys(sessionStorage).forEach((key) => {
              if (key !== "auth_key") sessionStorage.removeItem(key);
            });
            clearCookiesExceptAuth()
            return;
          }
          await getAccountDetail(data?.account?.accountId);
          funcDispatch();
          successLogin();
          document.title = contentLabel(
            "SkillsBasedJobs",
            "nf skillsbasedjobs.global"
          );
        } else if (
          data?.status === "FAILED" &&
          data?.message === "Account is not registered with this tenant"
        ) {
          showErrorToast(
            contentLabel(
              "NoAccountRegInTenant",
              "nf Account is not registered with this tenant"
            )
          );
          setIsLoading(false);
        } else if (
          data?.status === "FAILED" &&
          data?.message === "Account is not associated with any tenant"
        ) {
          showErrorToast(
            contentLabel(
              "AccountNotRegWithAnyTenant",
              "nf Account is not associated with any tenant"
            )
          );
          setIsLoading(false);
        } else if (data?.message === "Invalid Username/Password") {
          showErrorToast(
            contentLabel("InvalidPassword", "nf Invalid Password")
          );
          setIsLoading(false);
        }
         else if (data?.message === "User does not have the required roles to access this application") {
          showErrorToast(
            contentLabel("SelectedRoleNotOpted", "nf Invalid Role")
          );
          setIsLoading(false);
        }

        
      } catch (error) {
        setIsLoading(false);
        if (error instanceof ReferenceError) {
          console.error("Reference error occured: ", error?.message);
        } else if (error instanceof TypeError) {
          console.error("Type error occured: ", error?.message);
        } else {
          console.error("Error occured during login: ", error);
        }

        handleLoginError(error?.response?.data?.message);
      }
    },
    [
      // selectedRole,
      password,
      dispatch,
      navigate,
      getAccountDetail,
      content,
      selectedLanguage,
      listOfCountries,
      funcDispatch,
      contentLabel,
      successLogin,
      courseRId,
      courseRName,
      jobId,
      jobName,
      handleLoginError,
    ]
  );

  const handlePasswordShow = () => {
    setIsPasswordShow(!isPasswordShow);
  };

  const handleRedirectToInit = () => {
    if(location?.pathname.includes('/skill-owner')){
        navigate("/skill-owner/email");
      }else if(location?.pathname.includes('/services')){
          navigate("/services/email");
      }else{
        navigate(-1)
      }
  };

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
      (info) => info?.label === "SISOForgotPassword"
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
  //redirection logic based on user role
  if (token && role && userId && !location?.pathname?.includes('/sso/authorize')) {
    if (role === "R1") {
      navigate("/skill-owner/dashboard");
    }
    else if (role === "R2") {
      navigate("/skill-seeker/basic/dashboard");
    } else if (role === "R3") {
      navigate("/skilling-agency/basic/dashboard")
    } else if (role === "R6") {
      navigate("/support-services/skillsearch");
    }
  }


  return (
    <SoAuthFormContainer>
      {isLoading && <LogoLoader />}
      <div>
        <div>
          <h1 className="so-form-login-font">
            {contentLabel("Hello", "nf Hello")},
          </h1>
          <p className="so-form-note-font">{email ? email : ""}</p>
        </div>
        <form>
          <div className="so-form-grids">
            <label
              htmlFor="password"
              className="d-block w-100 position-relative text-start"
            >
              <span className="so-login-from-label-email">
                {contentLabel("Password", "nf Password")}
                <span className="text-danger">*</span>
              </span>
              <span className="so-form-login-input-wrapper">
                <input
                  type={isPasswordShow ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                {/* HANDLE EYE ICONS FUNC */}
                <div
                  style={{
                    position: "absolute",
                    top: "2.4rem",
                    right: "2rem",
                    cursor: "pointer",
                    color: "var(--sbj-primary-color)",
                  }}
                  onClick={handlePasswordShow}
                >
                  {isPasswordShow ? <icons.FaEyeSlash /> : <icons.FaEye />}
                </div>
              </span>
            </label>

{
  location.pathname?.includes('/services') && 

            <div className="mb-2">
                <span className="so-login-from-label-email">
                {contentLabel('Role','nf Select a Role' )}
                <span className="text-danger">*</span>
              </span>
              <select
                id="role"
                value={selectedServiceRole}
                onChange={(e)=>{setSelectedServiceRole(e.target.value)}}
                className="form-select"
                style={{height:'48px'}}
              >
                <option value="" selected disabled>{contentLabel('PleaseSelectARole','nf Please Select a Role' )}</option>
                {roles?.data?.filter((item)=>item.roleName !== 'R1')?.map((item, index) => (
                  <option key={index} value={item?.roleName}>
                    {item?.label}
                  </option>
                ))}
              </select>
            </div>
}

            {/* <Button
              label={contentLabel("CaptchaTest", "nf CaptchaTest")}
              disabled={false}
              onClick={() => {
                console.log("token ", captchaToken);
                if (!captchaToken) {
                  setError('Please complete the reCAPTCHA verification.');
                  console.log("token ", captchaToken);
                  return;
                }

                setError('');
              }}
            > {contentLabel("CaptchaTest", "nf CaptchaTest")} </Button> */}
            <div className="so-form-button-text">
              <ActionButton
                label={contentLabel("SignIn", "nf SignIn")}
                disabled={isLoading}
                onClick={handleSignIn}
              />
              <div className="d-flex justify-content-end align-items-center">
                <div
                  // to={"/forgotpassword"}
                  className="text-end text-decoration-none d-inline-block cursor-pointer links-color-so"
                  onClick={()=>{
                    if(location?.pathname?.includes('skill-owner')){
                    sessionStorage.setItem('prevSite','skill-owner')
                    }
                    else if(location?.pathname?.includes('services')){
                    sessionStorage.setItem('prevSite','services')
                    }
                    else if(location?.pathname?.includes('sso')){
                    sessionStorage.setItem('prevSite','sso')
                    }
                    else{
                    sessionStorage.setItem('prevSite','skill-owner')
                    }
                    navigate('/forgotpassword')
                    }}
                >
                  {contentLabel("ForgotPassword?", "nf Forgot Password?")}
                </div>
                &nbsp;
                {/* <span>
                  <icons.InfoOutlinedIcon
                    className="text-primary-color cursor-pointer"
                    onClick={() =>
                      handlePopUpOpen(
                        videoidRef.current?.id,
                        videoidRef.current?.title
                      )
                    }
                  />
                </span> */}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* LOGIN WITH DIFF USER */}
      <div className="card-bottom-so-container">
        <div style={{ flex: "1 1 0", display: "inline-block" }}>
          <button onClick={handleRedirectToInit}>
            {contentLabel(
              "LoginWithDiffUser",
              "nf Log in with a different user"
            )}
          </button>
        </div>
      </div>

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

export default LoginSo;