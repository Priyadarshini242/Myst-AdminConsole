import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { signupApiSimple } from "../../../api/auth/signupApiSimple";
import ActionButton from "../../../components/atoms/Buttons/ActionButton";
import CustomTooltip from "../../../components/atoms/tooltip/CustomTooltip";
import CountryFlagComponentAuthPage from "../../../components/Country Flag/CountryFlagComponentAuthpage";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import {
  encryptData,
  sessionDecrypt,
  sessionEncrypt,
} from "../../../config/encrypt/encryptData";
import { BASE_URL, VAR_1 } from "../../../config/Properties";
import { icons } from "../../../constants";
import useContentLabel from "../../../hooks/useContentLabel";
import { fetchExternalSite } from "../../../reducer/external site/externalSiteSlice";
import useGoogleRecaptcha from "../Captcha Integration/useGoogleRecaptcha";
import SoAuthFormContainer from "./SoAuthFormContainer";
import { GetAllExternalLinksApi } from "../../../api/Jd Category, Jd Exp, External sites/GetAllExternalLinksApi";
import { timestampToYYYYMMDD } from "../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { FormatDateIntoPost } from "../../../components/SkillOwner/HelperFunction/FormatDateIntoPost";
import { fetchEnableFlags } from "../../../reducer/settings/EnableFlagsSlice";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { toast } from "react-toastify";
import { clearAllCookies, getCookie, setCookie } from "../../../config/cookieService";
import DatePicker from "react-datepicker";
import MultiLayerSelect from "../../../components/MultiLayerSelect";
import { fetchSourceMapMaster } from "../../../reducer/masterTables/sourceMapSlice";
import { Form } from "react-bootstrap";
import CustomInput from "../../../components/atoms/Input/CustomInput";

const SignUpSo = () => {
  const contentLabel = useContentLabel();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const paramToken = params.get("token");

    const { data: sourceMapData = [], status: sourceMapStatus } = useSelector((state) => state.sourceMapSlice);
     console.log("souf",sourceMapData)
  //google recaptcha hook
  const { captchaToken, recaptchaRef, handleTokenChange, resetRecaptcha } =
    useGoogleRecaptcha(VAR_1);
  /* STORE IMPORTS */
  const {
    language: selectedLanguage,
    regionalData: { selectedCountry },
    direction,
    externalSiteRedux: { data: externalSiteDetails, status: extSiteApiStatus },
    content,
  } = useSelector((state) => state);

  const enableFlags = useSelector((state) => state?.EnableFlagsSlice);

  /* THE SAME EXACT PROCESS HANDLED IN EMAIL VERIFICATION PAGE TOO, IF YOU CHANGE ANYTHING HERE THEN CHANGE THERE TOO */
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
  
     const [referralCode, setReferralCode] = useState('');
  const [selectedSource,setSelectedSource] = useState('')
  const [isNewPasswordShow, setIsNewPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [Country, setCountry] = useState(selectedCountry);
  const { externalLinks } = useSelector((state) => state.ExternalLinks);

  /* STATES INIT */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("R1");
  const [isLoading, setIsLoading] = useState(false);
  const [timeZone, setTimeZone] = useState();
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const email =  getCookie("auth_key");
  // ***************** Temprorily Commented *****************
  // const externalSite =
  //   sessionStorage.getItem("externalSite") !== null
  //     ? sessionDecrypt(sessionStorage.getItem("externalSite"))
  //     : null;
  const siteName = null;
  const encryptedSiteName = encryptData(siteName);
  // console.log(siteName, encryptedSiteName, "SKkkkkk");
  const externalSite =
    getCookie("externalSite") !== null ? getCookie("externalSite") : "default";
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 5 minutes in seconds
  const [isResendEnabled, setIsResendEnabled] = useState(false);


      useEffect(() => {
          if (sourceMapStatus === 'idle') {
              dispatch(fetchSourceMapMaster())
          }
      }, [sourceMapStatus]);
      useEffect(() => {
        if( !!sourceMapData?.length){
          const selected = sourceMapData.find(
                      (item) => item.sourceLabel === 'NS'
                    );
                    setSelectedSource(selected);
        }
      }, [sourceMapStatus]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === 0) {
      setIsResendEnabled(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]); // <- Dependency added

  /* GET ENABLE FLAGS */
  useEffect(() => {
    console.log("enableFlags?.status", enableFlags?.status);

    if (enableFlags?.status === "idle") {
      dispatch(fetchEnableFlags());
    }
  }, [enableFlags?.status, dispatch]);

  // Convert seconds to mm:ss format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleResendOtp = () => {
    //  call resend otp api
    const payload = {
      id: encryptData(email),
      type: "Email",
    };

    // api/v1/email-verification/resend
    axios
      .post(`${BASE_URL}/skill/api/v1/email-verification/resend`, payload)
      .then((res) => {
        console.log("Resend otp response: ", res.data);

        if (res?.data === "OTP already sent, please wait for expiry.") {
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "OtpAlreadySent"
              ) || {}
            ).mvalue ||
              "nf OTP already sent, please try again after few minutes"
          );
        } else if (res?.data === "Verification sent successfully.") {
          showSuccessToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "OtpSentSuccessfully"
              ) || {}
            ).mvalue || "nf OTP sent successfully"
          );
        } else if (res?.data === "Email already verified") {
          showErrorToast(
            contentLabel("EmailAlreadyVerified", "nf Email already verified")
          );
        } else {
          showErrorToast(
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "ErrorSendingOtp"
              ) || {}
            ).mvalue || "nf Error sending OTP"
          );
        }
      })
      .catch((err) => {
        console.error("Error in resending otp: ", err);
      });

    setOtp(["", "", "", "", "", ""]); // Clear OTP fields
    setTimeLeft(10 * 60); // Reset timer
    setIsResendEnabled(false); // Disable the link again
  };

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
    dispatch(GetAllExternalLinksApi());
  }, []);
  useEffect(() => {
    if(!location.pathname.includes("/redirect")){
      if (!email) {
        navigate("/skill-owner/email");
      }
    }
  }, [email, navigate]);

  /* DOCUMENT TITLE INIT */
  useEffect(() => {
    document.title = `${contentLabel(
      "Title",
      "nf MySkillsTree"
    )} ${contentLabel("SignUp", "nf SignUp")}`;
  }, [contentLabel]);

  useEffect(() => {
    async function fetchTimeZone() {
      try {
        const check = Country?.countryCode;

        const res = await axios.get(
          `${BASE_URL}/skill/api/v1/skills/RegionalData/Time Zone Data?&searchFieldName=countryCode&searchValue=${check}%25`
        );
        setTimeZone(res?.data?.[0]?.abbreviation);
      } catch (err) {
        console.error("Cant fetch TimezoneS ", err);
      }
    }
    fetchTimeZone();
  }, [Country?.countryCode]);

  /* HANDLE SIGNUP */
  const handleSignUp = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();      
         //validates first name and last name
    if (validateFirstAndLastName(firstName,lastName)) {
      return;
    }
      
      setIsLoading(true);
      const form = e.currentTarget;
      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (selectedRole === "" || password === "" || confirmPassword === "") {
        setIsLoading(false);
        showErrorToast(
          contentLabel(
            "MissingMandatoryFields",
            "nf Mandatory fields cannot be empty"
          )
        );
        return;
      }

      /* CHECK FOR 8 CHARACTERS */
      if (password.length && password.length < 8) {
        setIsLoading(false);
        showErrorToast(
          contentLabel(
            "PasswordMustBeAtleastCharactersLong",
            "nf Password must be atleast 8 characters long"
          )
        );
        return;
      }
      // if (captchaToken === null) {

      //   showErrorToast(
      //     contentLabel(
      //       "CaptchaRequired",
      //       "nf CaptchaRequired"
      //     )
      //   );
      // setIsLoading(false);
      //   return;

      // }

      /* VALIDATING PASSWORD FOR REQ -> AS OF NOW PASSWORD SHOULD CONTAIN ATEAST 8 CHAR LONG, 1 UPPERCASE, 1 LOWER CASE, 1 SPECIAL CHAR */
      const passwordRegExp =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegExp.test(password)) {
        setIsLoading(false);
        showErrorToast(
          contentLabel(
            "PasswordRequre1Number1Special1Upp1Low",
            "nf Password must contain atleast 1 Number, 1 Special character, 1 Uppercase & 1 Lowercase"
          )
        );
        return;
      }

      /* RETURN IF NEW PASSWORD AND CONFIRM PASSWORD IS MATCHED */
      if (password !== confirmPassword) {
        setIsLoading(false);
        showErrorToast(
          contentLabel(
            "ConfirmPasswordNotMatchNewPassword",
            "nf Confirm password should match new password"
          )
        );
        setIsLoading(false);
        return;
      }
      /* I COMMENTED FOR THE REQUIREMENT FOR ALL USER TO BE AS INTERFACE SIMPLE,
       IF THERE IS NEED TO CHANGE DYNAMICALLY UNCOMMENT THE FOLLOWING LINES AND REMOVE THE DUPLICATE LINES BELOW */
      // const interFace =
      //   externalSite === "bluecollar" && externalSite !== null
      //     ? externalSiteDetails?.length && externalSiteDetails[0]?.interface
      //     : "Normal";
      // const interFace =
      //   externalSite === "bluecollar" && externalSite !== null
      //     ? externalSiteDetails?.length && externalSiteDetails[0]?.interface
      //     : "Normal";

      const extSite = externalLinks.filter(
        (item) => item.extSiteName === externalSite
      );

      const getDefaultInterface = () => {
        const extSite = externalLinks.filter(
          (item) => item.extSiteName === "default"
        );

        return extSite[0]?.interface;
      };

      // const interFace =
      //   ((extSite?.length > 0) && (externalSite === extSite[0]?.extSiteName) && (externalSite !== null))
      //     ? extSite[0]?.interface
      //     : getDefaultInterface();

      const interFace = "Simple";

      /* PAYLOAD */
      const payload = {
        firstName: firstName?.trim() || "",
        lastName: lastName?.trim() || "",
        chToken: captchaToken ? captchaToken : "",
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
        onBoarding: interFace !== "Simple" ? "No" : "Yes",
        onBoardingSection: 0,
        userCreatedTime: FormatDateIntoPost(
          timestampToYYYYMMDD(Number(new Date().getTime()))
        ),
        otp: otp.join(""),
        type: "Email",
      };

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
                workSource: selectedSource?.sourceLabel || "",
                referralCode:referralCode?.trim() || "",
                emailValidated: "Yes",
                whatsappPreference: "No",
                emailPreference: "No",
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
            /* REMOVE THE JOB ID IN SESSION STORAGE, IF THEY HAVE TO CREATE A NEW ACC */
            // sessionStorage.removeItem("JD_ID");
            setIsLoading(false);
            showSuccessToast(
              contentLabel(
                "AccountCreatedSuccessfully",
                "nf Account created successfully"
              ),
              // {
              //   position: "top-right",
              //   autoClose: 5000,
              //   hideProgressBar: true,
              //   closeOnClick: false,
              //   pauseOnHover: false,
              //   draggable: false,
              //   closeButton: false,
              //   // progress: undefined,
              //   theme: "colored",
              //   className: "snackbar",
              //   bodyClassName: "snackbar-body",
              //   style: { backgroundColor: "#17B169" },
              // }
            );
            navigate("/skill-owner/login");
          } catch (error) {
            console.error("ERROR OCCURED: ", error);
          }
        } else {
          setIsLoading(false);
          if (data?.status === "INVALID") {
            toast.error(contentLabel("OtpInvalid", "nf OTP is invalid"), {
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
            });
          } else if (data?.status === "NOT_TRIGGERED") {
            toast.error(
              contentLabel(
                "OtpNotTriggered",
                "nf OTP not sent, please try again"
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
          } else if (data?.status === "EXPIRED") {
            toast.error(contentLabel("OtpExpired", "nf OTP expired"), {
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
            });

            // redirect to sign up page
            // navigate("/skill-owner/email");
          } else {
            toast.error(
              contentLabel("ErrCreatingAccount", "nf Error creating account"),
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
      } finally {
        resetRecaptcha();
      }
    },
    [
      selectedRole,
      password,
      confirmPassword,
      email,
      navigate,
      timeZone,
      Country,
      externalSite,
      contentLabel,
      selectedLanguage,
      externalSiteDetails,
      captchaToken,
      resetRecaptcha,
      firstName,
      lastName,
      referralCode,
      selectedSource
    ]
  );

  const handleSignUpWithToken = async (e) => {
    e.preventDefault();
    e.stopPropagation();

       //validates first name and last name
    if (validateFirstAndLastName(firstName,lastName)) {
      return;
    }

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (selectedRole === "" || password === "" || confirmPassword === "") {
      showErrorToast(
        contentLabel(
          "MissingMandatoryFields",
          "nf Mandatory fields cannot be empty"
        )
      );
      return;
    }

    /* CHECK FOR 8 CHARACTERS */
    if (password.length && password.length < 8) {
      showErrorToast(
        contentLabel(
          "PasswordMustBeAtleastCharactersLong",
          "nf Password must be atleast 8 characters long"
        )
      );
      return;
    }


    /* VALIDATING PASSWORD FOR REQ -> AS OF NOW PASSWORD SHOULD CONTAIN ATEAST 8 CHAR LONG, 1 UPPERCASE, 1 LOWER CASE, 1 SPECIAL CHAR */
    const passwordRegExp =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegExp.test(password)) {

      showErrorToast(
        contentLabel(
          "PasswordRequre1Number1Special1Upp1Low",
          "nf Password must contain atleast 1 Number, 1 Special character, 1 Uppercase & 1 Lowercase"
        )
      );
      return;
    }

    /* RETURN IF NEW PASSWORD AND CONFIRM PASSWORD IS MATCHED */
    if (password !== confirmPassword) {

      showErrorToast(
        contentLabel(
          "ConfirmPasswordNotMatchNewPassword",
          "nf Confirm password should match new password"
        )
      );

      return;
    }


    if (!paramToken) {
      showErrorToast('SomethingWentWrong', 'nf Something Went Wrong')
      return
    }

    const payload = {
      "token": paramToken || '',
      "password": password,
      "confirmPassword": confirmPassword,
      firstName: firstName.trim() || '',
      lastName: lastName.trim() || '',
      workSource: selectedSource?.sourceLabel || "",
      referralCode: referralCode?.trim() || "",
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        'https://beanstalk.myskillstree.com/skill/register-external-user',
        payload
      );
      const data = res?.data
      const interFace = 'Simple'

          if (res?.status === 200 && data?.message === 'User registered successfully' && data?.userDetails?.accountId) {
          try {
               /* PAYLOAD */
      const payload = {
        firstName: data?.userDetails?.firstName ||'',
        lastName: data?.userDetails?.lastName ||'',
        chToken: captchaToken ? captchaToken : "",
        accountId: encryptData(data?.userDetails?.accountId),
        email: data?.userDetails?.accountId || '',
        password: encryptData(password),
        confirmPassword: encryptData(password),
        role: data?.userDetails?.userRole,
        isEncrypted: true,
        homeLanguage: data?.userDetails?.homeLanguage || '',
        mlanguage: data?.userDetails?.homeLanguage || '',
        homeCountry: data?.userDetails?.homeCountry,
        homeTimeZone: data?.userDetails?.homeTimeZone,
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
        onBoarding: interFace !== "Simple" ? "No" : "Yes",
        onBoardingSection: 0,
        userCreatedTime: FormatDateIntoPost(
          timestampToYYYYMMDD(Number(new Date().getTime()))
        ),
        type: "Email",
      };
            await axios.post(
              `${BASE_URL}/skill/api/v1/skills/create/User Details`,
              {
                ...payload,
                UserID: data?.userDetails?.userid,
                accountId: data?.userDetails?.accountId,
                userRole: data?.userDetails?.userRole,
                signUpSite: externalSite,
                interface: interFace,
                workSource: selectedSource?.sourceLabel,
                referralCode:referralCode || "",
                emailValidated: "Yes",
                whatsappPreference: "No",
                emailPreference: "No",
              },
              {
                auth: {
                  username: data?.userDetails?.accountId,
                  password: password,
                  signUpSite: externalSite,
                  interface: interFace,
                },
              }
            );
            /* REMOVE THE JOB ID IN SESSION STORAGE, IF THEY HAVE TO CREATE A NEW ACC */
            // sessionStorage.removeItem("JD_ID");
            
            /* SET EMAIL IN LOCAL STORAGE */
            sessionStorage.setItem("auth_key", sessionEncrypt(data?.userDetails?.accountId));
            setCookie("auth_key", data?.userDetails?.accountId);

            setIsLoading(false);
            showSuccessToast(
              contentLabel(
                "AccountCreatedSuccessfully",
                "nf Account created successfully"
              ));
            navigate("/skill-owner/login");
          } catch (error) {
            console.error("ERROR OCCURED: ", error);
          }
        }else{
          if(data?.error === 'User registration failed: Account id already exist'){
              showErrorToast(contentLabel('AccountIdAlreadyExist','nf Account id already exist'))
              return
          }
          if(data?.error === 'Invalid or expired token'){
              showErrorToast(contentLabel('InvalidToken','nf Invalid Token'))
              return
          }
          showErrorToast(contentLabel('SomethingWentWrong','nf Something Went Wrong'))
          return
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
      } finally {
        setIsLoading(false)
        resetRecaptcha();
      }
  }

  const handleNewPasswordShow = () => {
    setIsNewPasswordShow(!isNewPasswordShow);
  };

  const handleConfirmPassShow = () => {
    setIsConfirmPasswordShow(!isConfirmPasswordShow);
  };

  const handleRedirectToLogin = () => {
    navigate("/skill-owner/email");
  };

  useEffect(() => {
    if (extSiteApiStatus === "idle" && externalSite) {
      dispatch(fetchExternalSite());
    }
  }, [dispatch, extSiteApiStatus, externalSite]);

  /* CHECKS FOR PASSWORD TOOLTIP */
  const hasMinLimit = password?.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);

  // useEffect for signup button idasble check 
  useEffect(() => {
    // isLoading ||
                  // extSiteApiStatus === "loading" ||
                  // captchaToken === null ||
                  // !isAuthorized
    console.log("isLoading", isLoading);
    console.log("if extSiteApiStatus is loading ", extSiteApiStatus);
    console.log("if captchaToken is null ", captchaToken);
    console.log("if isAuthorized is false ", isAuthorized);
  }, [isLoading, extSiteApiStatus, captchaToken, isAuthorized])
  
  const conditions = [
    {
      label: contentLabel(
        "Atleast1LowerCase",
        "nf At Least One Lower case Character"
      ),
      valid: hasLowerCase,
    },
    {
      label: contentLabel(
        "Atleast1UpperCase",
        "nf At Least One Upper case Character"
      ),
      valid: hasUpperCase,
    },
    {
      label: contentLabel("AtleastNumber", "nf At Least One Number"),
      valid: hasNumber,
    },
    {
      label: contentLabel(
        "AtleastSplCharacter",
        "nf At Least One Special Character"
      ),
      valid: hasSpecialChar,
    },
    {
      label: contentLabel(
        "PasswordCharactersRangeLabel",
        "nf Minimum 8 to 15 Characters"
      ),
      valid: hasMinLimit,
    },
  ];

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleChange = (index, e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numbers
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (index < 5 && value) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = "";
      } else if (index > 0) {
        newOtp[index - 1] = "";
        inputRefs.current[index - 1].focus();
      }
      setOtp(newOtp);
    }
  };

  const getSignUpConsentLabel = () => {
    try {
      const tAndCLink = `<a href="https://www.skillsbasedjobs.global/#/terms&conditions" target="_blank" style="color: var(--primary-color);">${contentLabel(
        "TermsOfServiceLink",
        `nf Terms Of Service`
      )}</a>`;
      const priAndPolicyLink = `<a href="https://www.skillsbasedjobs.global/#/privacy-policy" target="_blank" style="color: var(--primary-color);">${contentLabel(
        "PrivacyPolicyLink",
        `nf Privacy and Cookie Policies`
      )}</a>`;

      return contentLabel(
        "SignUpPolicyConsent",
        `nf By clicking SIGN UP, you accept our #{T&C}, #{PrivacyPolicy}`
      )
        .replace("#{T&C}", tAndCLink)
        .replace("#{PrivacyPolicy}", priAndPolicyLink);
    } catch (error) {
      console.error(error);
      return "By clicking SIGN UP, you accept our Terms Of Service, Privacy Policy";
    }
  };

  const token = getCookie("token");
  const role = getCookie("USER_ROLE");
  const userId = getCookie("userId");
  //redirection logic based on user role
  if (token && role && userId) {
    if (role === "R1") {
      navigate("/skill-owner/dashboard");
    } else if (role === "R2") {
      navigate("/skill-seeker/basic/dashboard");
    } else if (role === "R3") {
      navigate("/skilling-agency/my-courses");
    } else if (role === "R6") {
      navigate("/support-services/skillsearch");
    }
  }

  // for external signup
    useEffect(() => {
    if (location.pathname.includes("/redirect")) {
      if (!paramToken) {
        // 🚨 redirect page but no token → go home
        navigate("/skill-owner/email", { replace: true });
      }
    } 
  }, [location, navigate]);


  const knowOptionsJSON = [
  {
    "value": "college",
    "label": "College / University",
    "next": {
      "type": "select",
      "label": "Select your College / University",
      "placeholder": "Choose a college",
      "options": [
        {
          "value": "college_a",
          "label": "ABC University",
          "next": {
            "type": "input",
            "label": "Department / Stream",
            "placeholder": "Enter your department or stream"
          }
        },
        {
          "value": "college_b",
          "label": "XYZ College",
          "next": {
            "type": "input",
            "label": "Department / Stream",
            "placeholder": "Enter your department or stream"
          }
        }
      ]
    }
  },
  {
    "value": "social_media",
    "label": "Social Media",
    "next": {
      "type": "select",
      "label": "Select Social Media Platform",
      "placeholder": "Choose a platform",
      "options": [
        {
          "value": "facebook",
          "label": "Facebook",
          "next": {
            "type": "input",
            "label": "Friend or page who referred you",
            "placeholder": "Enter friend or page name"
          }
        },
        {
          "value": "instagram",
          "label": "Instagram",
          "next": {
            "type": "input",
            "label": "Friend or account who referred you",
            "placeholder": "Enter friend or account name"
          }
        },
        {
          "value": "twitter",
          "label": "Twitter",
          "next": {
            "type": "input",
            "label": "Friend or account who referred you",
            "placeholder": "Enter friend or account name"
          }
        }
      ]
    }
  },
  {
    "value": "friend",
    "label": "Friend / Referral",
    "next": {
      "type": "input",
      "label": "Friend's Name",
      "placeholder": "Enter your friend's name"
    }
  },
  {
    "value": "online_ad",
    "label": "Online Advertisement",
    "next": {
      "type": "input",
      "label": "Ad Source",
      "placeholder": "Enter the website or ad name"
    }
  },
  {
    "value": "other",
    "label": "Other",
    "next": {
      "type": "input",
      "label": "Please Specify",
      "placeholder": "Enter your source"
    }
  }
]


    const handleKnowChange = (selectedLayers) => {
    console.log("User selection:", selectedLayers);
  };

    const validateFirstAndLastName = (userInfo) => {
      if (
        !firstName ||
        firstName.trim().length === 0 ||
        !lastName ||
        lastName.trim().length === 0
      ) {
        showErrorToast(
          contentLabel(
            "PleaseFillAllRequiredFields",
            "nf Please Fill All Required Fields"
          )
        );
        return true;
      }
  
      /* CHECK FOR VALID NAME */
      if (/^[^a-zA-Z]/.test(firstName?.trim()) || /^[^a-zA-Z]/.test(lastName?.trim())) {
        showErrorToast(
          contentLabel(
            "FirstLetterShouldBeAlphabet",
            "First Letter Should Be Alphabet"
          )
        ); /* PREVENT INPUT IF FIRST LETTER IS NOT ALPHABEL */
        return true;
      }
    }

  return (
    <SoAuthFormContainer>
      <div>
        <div>
          <h1 className="so-form-login-font">
            {contentLabel("SignUp", "nf SignUp")}
          </h1>

          <p className="so-form-note-font mb-2"> {contentLabel("Hello", "nf Hello")}, {email ? email : ""}</p>

          <p className="so-form-note-font text-center mb-2">
            {contentLabel("SetNewPasswordText", "nf Please set a password to register")}
          </p>

                    <p className=" text-center text-muted">
                  <i>
            {contentLabel("NameCannotChangeAfterSignup", "nf Note : Name cannot be changed after signup")}
                    </i>
          </p>
        </div>
        <form>
          <div className="so-form-grids">
            
            <label className="d-block w-100 position-relative text-start">
              <span className="so-login-from-label-email">
                {contentLabel("FirstName", "nf First Name")}
              <span className="text-danger ms-1">*</span>
              </span>
              <CustomInput
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) =>{
                  
                  let value = e.target.value;

                  // Prevent leading spaces
  if (value.startsWith(" ")) return;

                  if (value.length > 0) {
                    value =
                      value.charAt(0).toUpperCase() + value.slice(1);
                  }
                  setFirstName(value)
                } 
                }
                onPaste={(e) => e.preventDefault()}
                maxLength={100}
                style={{ border: '1px solid black', borderRadius: '12px', padding: "0.325rem 0.75rem", width: '100%', height: "50px" }}
              />
            </label>

            
            <label className="d-block w-100 position-relative text-start">
              <span className="so-login-from-label-email">
                {contentLabel("LastName", "nf Last Name")}
              <span className="text-danger ms-1">*</span>
              </span>
            <CustomInput
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => {
                let value = e.target.value;

                // Prevent leading spaces
  if (value.startsWith(" ")) return;

                if (value.length > 0) {
                  value =
                    value.charAt(0).toUpperCase() + value.slice(1);
                }
                setLastName(value)
              }}
              onPaste={(e) => e.preventDefault()}
              maxLength={100}
              style={{ border: '1px solid black', borderRadius: '12px', padding: "0.325rem 0.75rem", width: '100%', height: "50px" }}
            />
            </label>

            {/* NEW PASSWORD INPUT */}
            <label
              htmlFor="newPassword"
              className="d-block w-100 position-relative text-start"
            >
              <span className="so-login-from-label-email">
                {contentLabel("NewPassword", "nf New Password")}
                <span className="text-danger">*</span>
              </span>
              <CustomTooltip
                open={showTooltip && password?.length > 0}
                title={
                  <div className="text-start">
                    {conditions?.map((condition, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center gap-1"
                      >
                        {condition.valid ? (
                          <icons.CheckCircleIcon className="text-success" />
                        ) : (
                          <icons.CancelIcon className="text-danger" />
                        )}
                        {condition.label}
                      </div>
                    ))}
                  </div>
                }
              >
                <span className="so-form-login-input-wrapper">
                  <input
                    type={isNewPasswordShow ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
                    maxLength={15}
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
                    onClick={handleNewPasswordShow}
                  >
                    {isNewPasswordShow ? <icons.FaEyeSlash /> : <icons.FaEye />}
                  </div>
                </span>
              </CustomTooltip>
            </label>

            {/* CONFIRM PASSWORD INPUT */}
            <label
              htmlFor="confirmPassword"
              className="d-block w-100 position-relative text-start"
            >
              <span className="so-login-from-label-email">
                {contentLabel("ConfirmPassword", "nf Confirm Password")}
                <span className="text-danger">*</span>
              </span>
              <span className="so-form-login-input-wrapper">
                <input
                  type={isConfirmPasswordShow ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  onClick={handleConfirmPassShow}
                >
                  {isConfirmPasswordShow ? (
                    <icons.FaEyeSlash />
                  ) : (
                    <icons.FaEye />
                  )}
                </div>
              </span>
            </label>



           {/* WHERE DID YOU KNOW ABOUT US */}
           <label
                htmlFor="otp"
                className="d-block w-100 position-relative text-start mb-3"
              >
                <span className="so-login-from-label-email">
                  {contentLabel("HowDidYouKnowAboutUs", "nf How did you know about us ?")}
                </span>
             {/* <MultiLayerSelect optionsJSON={knowOptionsJSON} onChange={handleKnowChange} /> */}
              <Form.Select
                value={selectedSource?.srcMapValue || ""}
                onChange={(e) => {
                  const selected = sourceMapData.find(
                    (item) => item.srcMapValue === e.target.value
                  );
                  setSelectedSource(selected);
                }}
                style={{
                  border: "1px solid black",
                  borderRadius: "12px",
                  padding: "0.325rem 0.75rem",
                  width: "100%",
                  height: "50px",
                }}
              >
                {sourceMapData.map((item) => (
                  <option key={item.id} value={item.srcMapValue}>
                    {item.srcMapValue}
                  </option>
                ))}
              </Form.Select>
              <Form.Group className="" controlId="referralCodeInput">
                {/* <Form.Label>{contentLabel('ReferralCode','nf Referral Code')}</Form.Label> */}
                <Form.Control
                  type="text"
                  className="mt-2"
                  placeholder={contentLabel('ReferralCode', 'nf Referral Code')}
                  value={referralCode}
                  onChange={(e) => {
                    console.log(sourceMapData)
                     let value = e.target.value;
                                    // Prevent leading spaces
  if (value.startsWith(" ")) return;
                    setReferralCode(value)
                  }}
                  maxLength={10}
                  style={{ border: '1px solid black', borderRadius: '12px', padding: "0.325rem 0.75rem", width: '100%', height: "50px" }}
                />
              </Form.Group>
             </label>

            {/* OTP */}
            {enableFlags?.flags?.signupEmailVerification === true && (
              <label
                htmlFor="otp"
                className="d-block w-100 position-relative text-start"
              >
                <span className="so-login-from-label-email">
                  {contentLabel("OTP", "nf OTP")}
                </span>
                <div style={{ display: "flex", gap: "22px" }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={(e) => e.preventDefault()} // <-- disables pasting
                      maxLength={1}
                      autoFocus={index === 0}
                      style={{
                        width: "40px",
                        height: "40px",
                        textAlign: "center",
                        fontSize: "18px",
                      }}
                    />
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    onClick={
                      isResendEnabled
                        ? handleResendOtp
                        : (e) => e.preventDefault()
                    }
                    style={{
                      color: isResendEnabled ? "var(--primary-color)" : "gray",
                      cursor: isResendEnabled ? "pointer" : "not-allowed",
                      textDecoration: "none",
                    }}
                  >
                    {contentLabel("ResentOtp", "nf Resend OTP")}
                  </div>
                  <span className="so-login-from-label-email">
                    ({contentLabel("Expires", "nf expires in")}{" "}
                    <strong>{formatTime(timeLeft)}</strong>)
                  </span>
                </div>
              </label>
            )}

            <div className="so-form-button-text d-flex justify-content-center scale-80-origin-top-left">
              <ReCAPTCHA
                ref={recaptchaRef} // Reference to ReCAPTCHA component
                sitekey={VAR_1} // Google reCAPTCHA site key
                onChange={handleTokenChange} // Handle token change
                onExpired={resetRecaptcha} // Automatically reset on expiration
              />
            </div>
            <div className="so-form-button-text">
              {/* CaptchaTest button */}
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
              <ActionButton
                label={contentLabel("SignUp", "nf SignUp")}
                disabled={
                  isLoading ||
                  extSiteApiStatus === "loading" ||
                  captchaToken === null ||
                  !isAuthorized
                }
                onClick={ (paramToken && paramToken?.trim()) ? handleSignUpWithToken : handleSignUp}
              />
              <div className="fw-bold">
                <div
                  dangerouslySetInnerHTML={{
                    __html: getSignUpConsentLabel(),
                  }}
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* LOGIN WITH DIFF USER */}
      <div className="card-bottom-so-container">
        <div style={{ flex: "1 1 0", display: "inline-block" }}>
          <button onClick={handleRedirectToLogin}>
            {contentLabel(
              "LoginWithDiffUser",
              "nf Log in with a different user"
            )}
          </button>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "-3rem",
          left: direction === "ltr" ? "0" : "25.7rem",
          right: "0rem",
        }}
      >
        <CountryFlagComponentAuthPage
          Country={Country}
          setCountry={setCountry}
        />
      </div>
    </SoAuthFormContainer>
  );
};

export default SignUpSo;
