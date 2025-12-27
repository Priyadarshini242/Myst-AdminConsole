import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signupApiSimple } from "../../../../api/auth/signupApiSimple";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { BASE_URL } from "../../../../config/Properties";
import {
  encryptData,
  sessionDecrypt,
} from "../../../../config/encrypt/encryptData";
import useContentLabel from "../../../../hooks/useContentLabel";
import "../LoginPage.css";
import SignUpForm from "./SignUpForm";
import { clearAllCookies, getCookie } from "../../../../config/cookieService";

const SignUpTemplate = () => {
  /* STORE IMPORTS */
  const {
    language: selectedLanguage,
    content,
    roles,
    regionalData: { selectedCountry },
  } = useSelector((state) => state);

  /* NAVIGATE INIT */
  const navigate = useNavigate();
  /* CONTENT LABEL */
  const contentLabel = useContentLabel();

  /* STATES INIT */
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("R1");
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState("");
  const [validated, setValidated] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [ageConfirmationCheckBox, setAgeConfirmationCheckBox] = useState();
  const [tosCheckbox, setTosCheckBox] = useState();
  const [timeZone, setTimeZone] = useState();
  const [Country, setCountry] = useState(selectedCountry);
  const email =  getCookie("auth_key");
  const externalSite =
    getCookie("externalSite") !== null
      ? getCookie("externalSite")
      : null;

  /* IMAGES */
  const logo = BASE_URL + "/skill/api/v1/getImage/logo.png";

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
  }, [email, navigate]);

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
          (item) => item.elementLabel === "SignUp"
        ) || {}
      ).mvalue || "SignUp"
    }`;
  }, [content, selectedLanguage]);

  useEffect(() => {}, [roles]);

  useEffect(() => {
    async function fetchTimeZone() {
      try {
        const check = Country?.countryCode;

        const res = await axios.get(
          `${BASE_URL}/skill/api/v1/skills/RegionalData/Time Zone Data?&searchFieldName=countryCode&searchValue=${check}%25`
        );
        setTimeZone(res?.data[0]?.abbreviation);

        const mappedArray = res?.data.map((obj) => ({
          ...obj,
          value: obj.abbreviation,
          label: obj.countryCode + " " + obj.abbreviation + " " + obj.gmtOffset,
        }));

        setTimeZone(res?.data?.[0]?.abbreviation);
      } catch (err) {
        console.error("Cant fetch TimezoneS ", err);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "CantFetchTimeZone"
            ) || {}
          ).mvalue || "nf Can't fetch time zones"
        );
      }
    }
    fetchTimeZone();
  }, [Country, content, selectedLanguage]);

  /* HANDLE ROLE CHANGE */
  const handleRoleChange = useCallback((e) => {
    setSelectedRole(e.target.value);
  }, []);

  /* HANDLE SIGNUP */
  const handleSignUp = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsLoading(true);
      const form = e.currentTarget;
      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }

      setValidation("was-validated");
      setValidated(true);

      if (selectedRole === "" || password === "" || confirmPassword === "") {
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

      /* CHECK FOR 8 CHARACTERS */
      if (password.length && password.length < 8) {
        setIsLoading(false);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) =>
                item.elementLabel === "PasswordMustBeAtleastCharactersLong"
            ) || {}
          ).mvalue || "nf Password must be at least 8 characters long"
        );
        return;
      }

      /* RETURN IF NEW PASSWORD AND CONFIRM PASSWORD IS MATCHED */
      if (password !== confirmPassword) {
        setIsLoading(false);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) =>
                item.elementLabel === "ConfirmPasswordNotMatchNewPassword"
            ) || {}
          ).mvalue || "nf Confirm password should match New Password"
        );
        setIsLoading(false);
        return;
      }
      const interFace =
        externalSite === "bluecollar" && externalSite !== null
          ? "Simple"
          : "Normal";
      /* PAYLOAD */
      const payload = {
        accountId: encryptData(email),
        email: email,
        password: encryptData(password),
        confirmPassword: encryptData(password),
        role: selectedRole,
        isEncrypted: true,
        homeLanguage: selectedLanguage,
        mlanguage: selectedLanguage,
        homeCountry: Country.countryCode,
        homeTimeZone: timeZone !== undefined && timeZone,
        hideProfile: "No",
        hlShowHide: "No",
        pcShowHide: "No",
        cityShowHide: "No",
        stateShowHide: "No",
        countryShowHide: "No",
        address3ShowHide: "No",
        address1ShowHide: "No",
        address2ShowHide: "No",
        dobShowHide: "No",
        genderShowHide: "No",
        mnShowHide: "No",
        reShowHide: "No",
        memailShowHide: "No",
        mlnShowHide: "No",
        fn: "No",
      };

      // if (externalSite !== null) {
      //   payload.extSiteId = externalSite;
      // }
      try {
        const res = await signupApiSimple(payload);
        const data = res?.data;

        if (res?.status === 200 && data?.status === "success") {
          try {
            await axios.post(
              `${BASE_URL}/skill/api/v1/skills/create/User Details`,
              {
                ...payload,
                UserID: data?.userid,
                accountId: email,
                userRole: selectedRole,
                signUpSite: externalSite,
                interface: interFace,
              },
              {
                auth: {
                  username: email,
                  password: password,
                  signUpSite: externalSite,
                  interface: interFace,
                },
              }
            );
            setIsLoading(false);
            toast.success(
              contentLabel(
                "AccountCreatedSuccessfully",
                "nf Account created successfully"
              ),
              {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: false,
                draggable: false,
                closeButton: false,
                // progress: undefined,
                theme: "colored",
                className: "snackbar",
                bodyClassName: "snackbar-body",
                style: { backgroundColor: "#17B169" },
              }
            );
            navigate("/skillowner/signin");
          } catch (error) {
            console.error("ERROR OCCURED: ", error);
          }
        } else {
          setIsLoading(false);
          toast.error(
            contentLabel(
              "ErrCreatingAccount",
              "nf Error creating account"
            ),
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: false,
              draggable: false,
              closeButton: false,
              // progress: undefined,
              theme: "colored",
              className: "snackbar",
              bodyClassName: "snackbar-body",
              style: { backgroundColor: "#D2042D" },
            }
          );
        }
      } catch (error) {
        setIsLoading(false);
        if (error instanceof ReferenceError) {
          console.error("Reference error occured: ", error?.message);
        } else if (error instanceof TypeError) {
          console.error("Type error occured: ", error?.message);
        } else {
          console.error("Error occured during signup: ", error);
        }
      }
    },
    [
      selectedRole,
      password,
      confirmPassword,
      email,
      navigate,
      selectedLanguage,
      timeZone,
      Country,
      content,
      externalSite,
      contentLabel
    ]
  );

  /* HANDLE PASSWORD SHOW */
  const handlePasswordShow = useCallback(() => {
    setIsPasswordShow((prev) => !prev);
  }, []);

  /* HANDLE CONFIRM PASSWORD SHOW */
  const handleConfirmPasswordShow = useCallback(() => {
    setIsConfirmPasswordShow((prev) => !prev);
  }, []);

  useEffect(() => {}, [Country]);

  return (
    <React.Fragment>
      {/* NAVBAR */}
      {/* <NavbarComponent
        isNewLoginPage={true}
        isDisable={true}
        Country={Country}
        setCountry={setCountry}
      /> */}

      {/* CONTENT */}
      <div
        className="d-flex justify-content-center align-items-center w-75"
        style={{ height: "calc(-60px + 96vh)", margin: "0 auto" }}
      >
        <div className="container-fluid" style={{ height: "100%" }}>
          <div className="row no-gutter" style={{ height: "100%" }}>
            {/* LEFT CONTENT {IMAGE} */}
            {/* <div className="col-md-6 d-none d-lg-flex justify-content-end align-items-center h-100">
              <img
                src={BASE_URL + "/skill/api/v1/getImage/skillowner_signup.png"}
                onError={(e) => {
                  e.target.src = signUpImage;
                }}
                alt="signup-avatar"
                style={{ width: "40vw" }}
              />
            </div> */}

            {/* RIGHT CONTENT */}
            <SignUpForm
              content={content}
              selectedLanguage={selectedLanguage}
              validation={validation}
              validated={validated}
              isPasswordShow={isPasswordShow}
              isConfirmPasswordShow={isConfirmPasswordShow}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              handlePasswordShow={handlePasswordShow}
              handleConfirmPasswordShow={handleConfirmPasswordShow}
              handleRoleChange={handleRoleChange}
              selectedRole={selectedRole}
              handleSignUp={handleSignUp}
              isLoading={isLoading}
              roles={roles}
              FaEye={FaEye}
              FaEyeSlash={FaEyeSlash}
              ageConfirmationCheckBox={ageConfirmationCheckBox}
              setAgeConfirmationCheckBox={setAgeConfirmationCheckBox}
              tosCheckbox={tosCheckbox}
              setTosCheckBox={setTosCheckBox}
              logo={logo}
              Country={Country}
              setCountry={setCountry}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SignUpTemplate;
