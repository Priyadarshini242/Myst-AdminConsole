import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../Images/logo.png";
import LoginApi from "../../api/auth/LoginApi";
import UserDetailsApi from "../../api/auth/UserDetailsApi";
import Footer from "../../components/Footer";
import LanguageComponent from "../../components/LanguageComponent";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../components/ToastNotification/showSuccessToast";
import {
  encryptData,
  sessionDecrypt,
  sessionEncrypt,
} from "../../config/encrypt/encryptData";
import { setRegCountry } from "../../reducer/localization/CountryRegionalSlice";
import {
  setCurrentRole,
  setUserRoles,
} from "../../reducer/roles/RoleMappingSlice";
import {
  logout,
  setUserProfile,
} from "../../reducer/userDetails/UserProfileSlice";
import { fetchValidation } from "../../reducer/validation/getUserValidationSlice";
import { fetchUserAttachment } from "../../reducer/attachments/getUserAttachmentSlice";
import { logoutUser } from "../../Store";
import { clearAllCookies, setCookie } from "../../config/cookieService";
import { getCookie } from "../../config/cookieService";

const HscLogin = () => {
  const regionalData = useSelector(
    (state) => state.regionalData.listOfCountries
  );
  const selectedCountry = useSelector(
    (state) => state.regionalData.selectedCountry
  );

  const isNewUser = useSelector((state) => state.editMode.isNewUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [validationCls, setValidationCls] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const funcDispatch = () => {
    dispatch(fetchValidation());
    dispatch(fetchUserAttachment());
  };
  const handleSignIn = (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidationCls("was-validated");
    setValidated(true);

    if (selectedRole === "") {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isValidEmail = emailRegex.test(email);
    if (email && !isValidEmail && form.checkValidity() === true) {
      showErrorToast("nf Please enter a valid email");

      return;
    }

    if (email !== "" && password !== "") {
      setLoading(true);
      const data = {
        username: encryptData(email),
        password: encryptData(password),
      };

      LoginApi(data)
        .then(async (response) => {
          setLoading(false);
          console.log("response : ", response.data);
          if (response.status === 200) {
            // the userid is coming from userHomelanguage
            sessionStorage.setItem(
              "userId",
              sessionEncrypt(response.data.userId)
            );
            sessionStorage.setItem(
              "token",
              sessionEncrypt(response.data.authenticationtoken)
            );
            setCookie("userId", response.data.userId);
            setCookie("token", response.data.authenticationtoken);

            console.log(response.data.account?.homeTimeZone);

            // if (response.data.account?.homeTimeZone !== null && response.data.account.homeTimeZone !== undefined) {
            //     const res = await axios.get(`${BASE_URL}/skill/api/v1/skills/RegionalData/Time Zone Data?&searchFieldName=countryCode&searchValue=${response.data.account?.homeCountry}%25`);
            //     const mappedArray = res?.data.map(obj => ({
            //         ...obj,
            //         value: obj.abbreviation,
            //         label: obj.countryCode + " " + obj.abbreviation + " " + obj?.timeZone + " " + obj.gmtOffset
            //     }));

            //     let selectedObjects = response.data.account?.homeTimeZone;
            //     if (mappedArray.length > 0) {
            //         selectedObjects = mappedArray?.find(item => item.abbreviation === response.data.account?.homeTimeZone);
            //     }
            //     sessionStorage.setItem("TimeZone", selectedObjects?.label);
            //     console.log("selectedObjects ", selectedObjects);
            // } else {
            //     sessionStorage.setItem("TimeZone", response.data?.account?.homeTimeZone);
            // }

            sessionStorage.setItem(
              "userName",
              sessionEncrypt(response.data.account.accountId)
            );
            setCookie("userName", response.data.account.accountId);

            //sessionStorage.setItem("roles", response.data.account.roles);
            sessionStorage.setItem(
              "countryCode",
              sessionEncrypt(response.data.account.homeCountry)
            );

            setCookie("countryCode", response.data.account.homeCountry);

            sessionStorage.setItem(
              "HLang",
              sessionEncrypt(response.data.account.homeLanguage)
            );
            setCookie("HLang", response.data.account.homeLanguage);
            sessionStorage.setItem(
              "TenantId",
              sessionEncrypt(response.data.account.tenantId)
            );
            setCookie("TenantId", response.data.account.tenantId);
            dispatch(setUserRoles(response.data.account.roles));
            // if response.data.candidateId present field then fetch the candidate details and set the user profile else popup the create profile page
            const rolesArray = [];
            console.log(response.data.account.roles);
            if (response.data && response.data.account) {
              response.data.account.roles?.forEach((role) => {
                rolesArray.push(role.roleName);
              });
            }

            setLoading(false);
            if (!rolesArray.includes(selectedRole)) {
              showErrorToast(
                " You are not authorized to selected role... Select a valid role and try again!"
              );
              return;
            }
            dispatch(setCurrentRole(selectedRole));
            showSuccessToast("Login Successful!!");
            funcDispatch();

            if (response.data.userId !== undefined) {
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
                  console.log("externalSiteValue ", externalSiteValue);
                  sessionStorage.setItem(
                    "externalSite",
                    sessionEncrypt(externalSiteValue)
                  );

                  setCookie("externalSite", externalSiteValue);
                  dispatch(setUserProfile(userDetails));
                  if (selectedRole === "R1" && rolesArray.includes("R1")) {
                    if (isNewUser) {
                      navigate("/skill-owner/profile-management/profile-info");
                    } else {
                      navigate("/skill-owner/dashboard");
                    }
                  } else if (
                    selectedRole === "R2" &&
                    rolesArray.includes("R2")
                  ) {
                    navigate("/skill-seeker/Home");
                  } else if (
                    selectedRole === "R3" &&
                    rolesArray.includes("R3")
                  ) {
                    navigate("/skilling-agency/basic/dashboard");
                  } else if (
                    selectedRole === "R6" &&
                    rolesArray.includes("R6")
                  ) {
                    navigate("/supportservices/skillsearch");
                  }
                } else {
                  /* Handle error */
                  sessionStorage.clear();
                  clearAllCookies();
                  navigate("/skillowner/user-auth");
                }
              });
            }

            /* STORE ROLE IN LOCAL STORAGE */
            sessionStorage.setItem("USER_ROLE", sessionEncrypt(selectedRole));
            setCookie("USER_ROLE", selectedRole);
          } else {
            setLoading(false);
            console.log("error : " + response.data.errorMessage);
            showErrorToast("Invalid username or password, please try again!");
          }
        })
        .catch((error) => {
          setLoading(false);
          console.log("error : " + error);
          showErrorToast("Invalid Credentials, please try again!");
        });
    }
  };

  // store imports
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const roles = useSelector((state) => state.roles);

  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  useEffect(() => {
    dispatch(logout());
    clearAllCookies();
    sessionStorage.clear();
  }, []);

  useEffect(() => {
    console.log("regionalData ", regionalData);
    regionalData?.map((country) => {
      if (country?.countryCode === getCookie("countryCode")) {
        sessionStorage.setItem(
          "dateFormat",
          sessionEncrypt(country?.dateFormat)
        );
         setCookie("dateFormat", country?.dateFormat);
        dispatch(setRegCountry(country));

        return;
      }
    });
  }, [sessionStorage.getItem("countryCode")]);

  useEffect(() => {
    console.log("selectedCountry ", selectedCountry);
  }, [selectedCountry]);

  return (
    <>
      <>
        <nav
          style={{
            color:
              (
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "NavBarFontColor"
                ) || {}
              ).mvalue || "#F7FFDD",
            backgroundColor:
              (
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "NavBarBgColor"
                ) || {}
              ).mvalue || "var(--primary-color)",
            direction: content[selectedLanguage].direction,
          }}
          className="navbar navbar-expand-lg d-print-none p-0 m-0 position- w-100   "
        >
          <div className="container-fluid  ">
            <a className="navbar-brand d-flex align-items-center   " href="/skill-owner/email">
              <img
                src={logo}
                alt="Logo"
                width="38"
                height="38"
                className="d-inline-block bg-img"
              />
              <div
                className="px-1 font-weight-1  font-1   "
                style={{
                  color:
                    (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "NavBarFontColor"
                      ) || {}
                    ).mvalue || "#F7FFDD",
                  direction: content[selectedLanguage].direction,
                }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Title"
                  ) || {}
                ).mvalue || "nf MySkillsTree"}
              </div>
            </a>

            <div className="d-flex align-items-center ">
              <LanguageComponent />
            </div>
          </div>
        </nav>

        <div className="p-5" style={{ height: "calc(-60px + 96vh)" }}>
          <div class="container-fluid " style={{ height: "100%" }}>
            <div class="row no-gutter " style={{ height: "100%" }}>
              <div class="col-md-6 d-none  d-lg-flex  justify-content-center align-items-center h-100 ">
                <img
                  src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1706759529/6300958_kouoz3555_ntgoex.png"
                  alt="login-avatar"
                  style={{ width: "40vw" }}
                />
              </div>

              <div class="col-md-6 m-auto ">
                <div class="login d-flex align-items-center py-5 ">
                  <div class="container">
                    <div class="row">
                      <div class="col-lg-12  mx-auto ">
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <img
                            src={logo}
                            height={"50px"}
                            alt="logo"
                            className=""
                          ></img>

                          <h3 class="display-5 text-center  ">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "SignIn"
                              ) || {}
                            ).mvalue || "nf SignIn"}
                          </h3>
                        </div>

                        <p
                          class="text-muted mb-4 text-center"
                          style={{ letterSpacing: ".2rem" }}
                        >
                          {" "}
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "SignInMessage"
                            ) || {}
                          ).mvalue || "nf SignInMessage"}
                        </p>
                        <form class={validationCls} validated={validated}>
                          <div class="col-lg-8 mx-auto     ">
                            <div
                              class="form-group mb-3"
                              style={{ position: "relative" }}
                            >
                              <div
                                class=""
                                style={{
                                  position: "absolute",
                                  top: "2px",
                                  left: "2px",
                                }}
                              >
                                <span
                                  class="input-group-text bg-white pl-2 border-0 h-100"
                                  style={{ borderRadius: 0 }}
                                >
                                  <i class="fa fa-envelope text-muted"></i>
                                </span>
                              </div>
                              <input
                                id="email"
                                style={{ height: "32px", paddingLeft: "43px" }}
                                name="email"
                                type="email"
                                placeholder={`${
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "EmailAddress"
                                    ) || {}
                                  ).mvalue || "nf EmailAddress"
                                } / ${
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "UserName"
                                    ) || {}
                                  ).mvalue || "nf Username"
                                }`}
                                required
                                autoFocus
                                class="form-control font-5"
                                vlaue={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                              <div class="text-end invalid-feedback">
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "EnterEmail"
                                  ) || {}
                                ).mvalue || "nf EnterAnEmail"}
                              </div>
                            </div>

                            <div
                              class="form-group mb-3"
                              style={{ position: "relative" }}
                            >
                              <div
                                class=""
                                style={{
                                  position: "absolute",
                                  top: "2px",
                                  left: "2px",
                                }}
                              >
                                <span
                                  class="input-group-text bg-white pl-2 border-0 h-100"
                                  style={{ borderRadius: 0 }}
                                >
                                  <i class="fa fa-lock text-muted"></i>
                                </span>
                              </div>
                              <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder={
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "Password"
                                    ) || {}
                                  ).mvalue || "nf Password"
                                }
                                required
                                class="form-control font-5 px-5"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <div class="text-end invalid-feedback">
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel ===
                                      "ValidPasswordIsRequired"
                                  ) || {}
                                ).mvalue || "nf ValidPasswordIsRequired"}
                              </div>
                            </div>

                            <div>
                              <select
                                onChange={handleRoleChange}
                                value={selectedRole}
                                required
                                class="form-select font-5 mb-2 "
                                aria-label="Default select example"
                              >
                                <option
                                  className="bg-body-tertiary"
                                  value=""
                                  disabled
                                  selected
                                >
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "Role"
                                    ) || {}
                                  ).mvalue || "nf Role"}
                                </option>
                                {roles.data.map((role) => {
                                  if (
                                    role.active === "Yes" &&
                                    role.mlanguage === selectedLanguage
                                  ) {
                                    return (
                                      <option value={role.roleName}>
                                        {role.label}
                                      </option>
                                    );
                                  }
                                  return null;
                                })}
                              </select>
                              <div class="text-end invalid-feedback">
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "PleaseSelectARole"
                                  ) || {}
                                ).mvalue || "nf PleaseSelectARole"}
                              </div>
                            </div>

                            <div className="d-block d-md-flex  justify-content-between   ">
                              <div class="links d-flex gap-1 flex-row flex-md-column">
                                <div>
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel ===
                                        "DontHaveAnAccount"
                                    ) || {}
                                  ).mvalue || " nf DontHaveAnAccount"}
                                </div>
                                <Link to="/signup" class="">
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "SignUp"
                                    ) || {}
                                  ).mvalue || "nf SignUp"}
                                </Link>
                              </div>
                              <div class="links">
                                {/* <Link to="/forgotpassword" class="ml-2">{(content[selectedLanguage]?.find(item => item.elementLabel === 'ForgotPassword') || {}).mvalue || "ForgotPassword?"}</Link> */}
                                <Link to="/forgotpassword" class="ml-2">
                                  {" "}
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel ===
                                        "HavingTroubleSigningIn"
                                    ) || {}
                                  ).mvalue || "nf HavingTroubleSigningIn"}
                                </Link>
                              </div>
                            </div>

                            <button
                              type="button"
                              id="signInBtn"
                              class="btn mt-2    text-white  btn-block mb-2 float-end rounded-pill shadow-sm"
                              style={{
                                backgroundColor: "var(--primary-color)",
                              }}
                              onClick={handleSignIn}
                            >
                              {loading && (
                                <span
                                  class="spinner-border spinner-border-sm me-2  "
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              )}
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "SignIn"
                                ) || {}
                              ).mvalue || "nf SignIn"}
                            </button>

                            <div></div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </>
    </>
  );
};

export default HscLogin;
