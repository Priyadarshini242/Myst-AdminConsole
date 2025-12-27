import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import {
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaTimes,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EditAccountApi from "../../../../api/Accounts/EditAccountApi";
import LoginApi from "../../../../api/auth/LoginApi";
import UserDetailsApi from "../../../../api/auth/UserDetailsApi";
import { getAccountDetails } from "../../../../api/auth/getAccountDetails";
import { getUserExistenceDetail } from "../../../../api/auth/getUserExistenceDetail";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { BASE_URL } from "../../../../config/Properties";
import {
  encryptData,
  sessionDecrypt,
  sessionEncrypt,
} from "../../../../config/encrypt/encryptData";
import { fetchUserAttachment } from "../../../../reducer/attachments/getUserAttachmentSlice";
import { setRegCountry } from "../../../../reducer/localization/CountryRegionalSlice";
import {
  setCurrentRole,
  setUserRoles,
} from "../../../../reducer/roles/RoleMappingSlice";
import {
  removeScreenName,
  setScreenName,
} from "../../../../reducer/screen/screenNameSlice";
import { setUserProfile } from "../../../../reducer/userDetails/UserProfileSlice";
import { fetchValidation } from "../../../../reducer/validation/getUserValidationSlice";
import "../LoginPage.css";
import LoginForm from "./LoginForm";
import NewOwnerCard from "./NewOwnerCard";
import useContentLabel from "../../../../hooks/useContentLabel";
import { logoutUser } from "../../../../Store";
import { clearAllCookies, setCookie } from "../../../../config/cookieService";
import { getCookie } from "../../../../config/cookieService";

const LoginTemplate = () => {
  /* STORE IMPORTS */
  const {
    language: selectedLanguage,
    content,
    roles,
    UserAccountDetails,
    regionalData: { listOfCountries, selectedCountry },
  } = useSelector((state) => state);

  /* DISPATCH INIT */
  const dispatch = useDispatch();

  /* NAVIGATE INIT */
  const navigate = useNavigate();

  /* CONTENT LABEL */
  const contentLabel = useContentLabel();

  /* USE LOCATION */
  const location = window.location;
  const isParentDomain = location?.origin?.includes("parent" || "Parent");

  /* STATES INIT */
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("R1");
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState("");
  const [validated, setValidated] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [rolesMap, setRolesMap] = useState([]);
  const [isLoadinRoles, setIsLoadinRoles] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [roleAdding, setRoleAdding] = useState(false);
  const email = getCookie("auth_key");
  const jobId = sessionStorage.getItem("JD_ID");
  const jobName = sessionStorage.getItem("JD_NAME");
  const courseRId = sessionStorage.getItem("C_ID");
  const courseRName = sessionStorage.getItem("C_NAME");

  /* IMAGES */
  const logo = BASE_URL + "/skill/api/v1/getImage/logo.png";
  const loginImage = BASE_URL + "/skill/api/v1/getImage/skillowner_login.png";

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
    if (!email) {
      navigate("/skillowner/user-auth");
    }
  }, []);

  useEffect(() => {
    const fetchScreenDetail = async () => {
      try {
        const res = await getAccountDetails(email);
        if (res?.data?.account?.defaultView === "DIALOG") {
          dispatch(setScreenName(res?.data?.account?.defaultView));
        } else if (
          res?.data?.account?.defaultView === "MAIN" ||
          res?.data?.account?.defaultView !== "DIALOG"
        ) {
          dispatch(removeScreenName());
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchScreenDetail();
  }, [dispatch, email]);

  useEffect(() => {
    setIsLoadinRoles(true);
    const fetchDetails = async () => {
      const res = await getUserExistenceDetail(email);
      const filteredRoles = roles?.data.filter((role) =>
        res?.data?.account?.roles
          .map((role) => role.roleName)
          .includes(role.roleName)
      );
      setRolesMap(filteredRoles);
      setIsLoadinRoles(false);
    };
    fetchDetails();
  }, [email, roles]);

  /* DOCUMENT TITLE INIT */
  useEffect(() => {
    document.title = `${
      (
        content[selectedLanguage]?.find(
          (item) => item.elementLabel === "Title"
        ) || {}
      ).mvalue || "MySkillsTree"
    } ${
      (
        content[selectedLanguage]?.find(
          (item) => item.elementLabel === "SignIn"
        ) || {}
      ).mvalue || "SignIn"
    }`;
  }, [content, selectedLanguage]);

  /* HANDLE ROLE CHANGE */
  const handleRoleChange = useCallback((e) => {
    setSelectedRole(e.target.value);
  }, []);

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
    /* SET ISLOADING TO FALSE */
    setIsLoading(false);
  }, [content, selectedLanguage]);

  const funcDispatch = useCallback(() => {
    dispatch(fetchValidation());
    dispatch(fetchUserAttachment());
  }, [dispatch]);

  /* HANDLE SIGNIN */
  const handleSignIn = useCallback(
    async (e) => {
      setIsLoading(true);
      e.preventDefault();
      e.stopPropagation();
      const form = e.currentTarget;
      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }

      setValidation("was-validated");
      setValidated(true);

      if (selectedRole === "" || password === "") {
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

      /* PAYLOAD */
      const payload = {
        username: encryptData(getCookie("auth_key")),
        password: encryptData(password),
      };

      try {
        const res = await LoginApi(payload);

        dispatch(setCurrentRole(selectedRole));

        const data = res?.data;
        if (res?.status === 200 && data?.status === "success" && data?.userId) {
          sessionStorage.setItem("userId", sessionEncrypt(data?.userId));
          setCookie("userId", data?.userId);
          sessionStorage.setItem(
            "token",
            sessionEncrypt(data?.authenticationtoken)
          );
          setCookie("token", data?.authenticationtoken);

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
          sessionStorage.setItem("USER_ROLE", sessionEncrypt(selectedRole));

          setCookie("USER_ROLE", selectedRole);

          dispatch(setUserRoles(data?.account?.roles));

          if (listOfCountries) {
            for (let country of listOfCountries) {
              if (country.countryCode === getCookie("countryCode")) {
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
          if (data.userId !== undefined) {
            /* FETCH CANDIDATE DETAILS AND SET IN USER PROFILE */
            UserDetailsApi().then((res) => {
              if (res.status === 200) {
                /* SET STATE FOR USER DETAILS */
                const userDetails = {
                  ...res.data,
                  token: data?.authenticationtoken,
                };

                console.log("userdetail ", userDetails);

                // Set externalSite in session storage
                const externalSiteValue = res.data[0].signUpSite
                  ? res.data[0].signUpSite
                  : "-";
                sessionStorage.setItem(
                  "externalSite",
                  sessionEncrypt(externalSiteValue)
                );
                setCookie("externalSite", externalSiteValue);

                dispatch(setUserProfile(userDetails));

                // Handle redirection
                if (res.data[0].signUpSite === "bluecollar") {
                  handleRedirection(res.data[0]);
                } else {
                  console.log("REDIRECT TO DASHBOARD");
                  navigate(`/skill-owner/dashboard`);
                }
              } else {
                /* Handle error */
                sessionStorage.clear();
                clearAllCookies();
                navigate("/skillowner/user-auth");
              }
            });

            // Separate function for redirection logic
            function handleRedirection(userData) {
              if (!userData?.firstName && !userData?.lastName) {
                console.log("REDIRECT TO WELCOME");
                navigate(`/skill-owner/welcome/personal-information`);
              } else if (userData?.interface?.toLowerCase() === "simple") {
                console.log("REDIRECT TO WELCOME");
                if (userData?.onBoarding?.toLowerCase() === "no") {
                  navigate(`/skill-owner/introduction`);
                } else {
                  navigate(`/skill-owner/welcome/personal-information`);
                }
              } else if (userData?.interface?.toLowerCase() === "normal") {
                console.log("REDIRECT TO DASHBOARD");
                navigate(`/skill-owner/dashboard`);
              } else {
                console.log("REDIRECT TO DASHBOARD");
                navigate(`/skill-owner/welcome/personal-information`);
              }
            }
          }

          /* ROLES */
          const rolesArray = [];
          if (data && data?.account) {
            data?.account?.roles?.forEach((role) => {
              rolesArray.push(role.roleName);
            });
          }

          if (!rolesArray.includes(selectedRole)) {
            setIsLoading(false);
            Object.keys(sessionStorage).forEach((key) => {
              if (key !== "auth_key") sessionStorage.removeItem(key);
            });
            setIsOwner(false);
            return;
          }
          const response = await getAccountDetail(data?.account?.accountId);
          funcDispatch();
          //IF NO FIRST NAME OR LASTNAME
          console.log("REDIRECT TO WELCOME ", response);
          //   if ((!response.data.account.firstName && !response.data.account.lastName)
          //     || (response.data.account.firstName === "TEMP" && response.data.account.lastName === "TEMP")) {
          //     // console.log("REDIRECT TO WELCOME ", response);
          //     navigate(`/skill-owner/welcome/personal-information`);
          //   }
          //   /* IF A USER MEAN TO APPLY FOR A JOB FROM EXTERNAL LINK */
          //   else if (selectedRole === "R1" && rolesArray.includes("R1") && jobId) {
          //     if (response?.data?.account?.defaultView === "DIALOG") {
          //       navigate("/skill-owner/dashboard");
          //     } else if (
          //       response?.data?.account?.defaultView === "MAIN" ||
          //       response?.data?.account?.defaultView !== "DIALOG"
          //     ) {
          //       // Build the query string
          //       const queryParams = new URLSearchParams({
          //         id: jobId,
          //         name: jobName,
          //       }).toString();
          //       if (jobId === null || jobName === null) {
          //         navigate(`/skill-owner/dashboard`);
          //       } else {
          //         console.log("REDIRECT TO Opportunity");
          //         navigate(
          //           `/skill-owner/opportunities/view-opportunities/view?${queryParams}`
          //         );
          //       }
          //     }
          //     successLogin();
          //     return;
          //   }

          //   /* IF A USER MEAN TO APPLY FOR A COURSE FROM EXTERNAL LINK */
          //   else if (selectedRole === "R1" && rolesArray.includes("R1") && courseRId) {
          //     if (response?.data?.account?.defaultView === "DIALOG") {
          //       navigate("/skill-owner/dashboard");
          //     } else if (
          //       response?.data?.account?.defaultView === "MAIN" ||
          //       response?.data?.account?.defaultView !== "DIALOG"
          //     ) {
          //       navigate(
          //         `/skill-owner/up-skilling/view-courses/${courseRName}/${courseRId}`
          //       );
          //     }
          //     successLogin();
          //     return;
          //   }

          //    if (selectedRole === "R1" && rolesArray.includes("R1")) {
          //     if (response?.data?.account?.defaultView === "DIALOG") {
          //       navigate("/skill-owner/dashboard");
          //     } else if (
          //       response?.data?.account?.defaultView === "MAIN" ||
          //       response?.data?.account?.defaultView !== "DIALOG"
          //     ) {
          //       navigate("/skill-owner/dashboard");
          //     }
          //   } else {
          //     setIsLoading(false);
          //     showErrorToast(
          //       (
          //         content[selectedLanguage]?.find(
          //           (item) => item.elementLabel === "NotAuthoriedToRole"
          //         ) || {}
          //       ).mvalue ||
          //       "nf You are not authorized to selected role... Select a valid role and try again!"
          //     );
          //     Object.keys(sessionStorage).forEach((key) => {
          //       if (key !== "auth_key") sessionStorage.removeItem(key);
          //     });
          //     return;
          //   }
          //   /* SUCCESSFUL LOGIN */
          //   successLogin();
          // } else {
          //   setIsLoading(false);
          //   showErrorToast(
          //     (
          //       content[selectedLanguage]?.find(
          //         (item) => item.elementLabel === "InvalidEmailOrPassword"
          //       ) || {}
          //     ).mvalue ||
          //     "nf Invalid email address or password. Please try again!"
          //   );
        }
        // sessionStorage.removeItem("auth_key");
      } catch (error) {
        setIsLoading(false);
        if (error instanceof ReferenceError) {
          console.error("Reference error occured: ", error?.message);
        } else if (error instanceof TypeError) {
          console.error("Type error occured: ", error?.message);
        } else {
          console.error("Error occured during login: ", error);
        }
        showErrorToast(
          contentLabel("SomethingWentWrong", "nf Something Went Wrong")
        );
      }
    },
    [
      selectedRole,
      password,
      dispatch,
      navigate,
      getAccountDetail,
      content,
      selectedLanguage,
      listOfCountries,
      jobId,
      courseRId,
      successLogin,
      jobName,
      courseRName,
      funcDispatch,
      contentLabel,
    ]
  );

  /* HANDLE ADD ROLE */
  const handleAddOwnerRole = useCallback(async () => {
    setRoleAdding(true);
    try {
      let roleNames = [];
      roleNames = roles?.userRoles?.map((role) => {
        return role?.roleName;
      });
      roleNames.push("ROLE_MYST", "ROLE_DEFAULT");
      roleNames.push("R1");

      /* PAYLOAD */
      const payload = {
        accountId: email,
        roles: roleNames,
      };
      const res = await EditAccountApi(payload);
      dispatch(setUserRoles(res.data.account.roles));
      showSuccessToast(contentLabel("RoleAdded", "nf Role added"));
      setIsOwner(true);
      setRoleAdding(false);
    } catch (error) {
      setRoleAdding(false);
      console.error("Error adding owner role: ", error);
    }
  }, [dispatch, email, roles?.userRoles, contentLabel]);

  /* HANDLE PASSWORD SHOW */
  const handlePasswordShow = useCallback(() => {
    setIsPasswordShow((prev) => !prev);
  }, []);

  useEffect(() => {}, [UserAccountDetails]);

  useEffect(() => {}, [selectedCountry]);

  return (
    <React.Fragment>
      {/* NAVBAR */}
      {/* <NavbarComponent isNewLoginPage={true} isDisable={true} /> */}

      {/* CONTENT */}
      <div
        className="d-flex justify-content-center align-items-center w-75"
        style={{ height: "calc(-60px + 96vh)", margin: "0 auto" }}
      >
        <div className="container-fluid" style={{ height: "100%" }}>
          <div className="row no-gutter" style={{ height: "100%" }}>
            {/* LEFT CONTENT {IMAGE} */}
            {/* <div className="col-md-6 d-none d-lg-flex justify-content-end align-items-center h-100 ">
              <img
                src={loginImage}
                onError={(e) => {
                  e.target.src = signInImage;
                }}
                alt="login-avatar"
                style={{ width: "40vw" }}
              />
            </div> */}

            {/* RIGHT CONTENT */}
            <LoginForm
              content={content}
              selectedLanguage={selectedLanguage}
              validation={validation}
              validated={validated}
              isPasswordShow={isPasswordShow}
              password={password}
              setPassword={setPassword}
              handlePasswordShow={handlePasswordShow}
              handleRoleChange={handleRoleChange}
              selectedRole={selectedRole}
              handleSignIn={handleSignIn}
              isLoading={isLoading}
              roles={roles}
              FaEye={FaEye}
              FaEyeSlash={FaEyeSlash}
              logo={logo}
              rolesMap={rolesMap}
              isLoadinRoles={isLoadinRoles}
              isOwner={isOwner}
              email={email}
              isParentDomain={isParentDomain}
            />

            {/* NEW OWNER CARD */}
            {!isOwner && (
              <div
                className="d-flex justify-content-center position-absolute"
                style={{ margin: "0 auto", top: "25%", left: "0%" }}
              >
                <NewOwnerCard
                  content={content}
                  selectedLanguage={selectedLanguage}
                  setIsOwner={setIsOwner}
                  FaTimes={FaTimes}
                  handleAddOwnerRole={handleAddOwnerRole}
                  roleAdding={roleAdding}
                  FaExclamationTriangle={FaExclamationTriangle}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default LoginTemplate;
