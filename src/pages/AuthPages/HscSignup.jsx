import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import logo from "../../Images/logo.png";
import SignupApi from "../../api/auth/SignupApi";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Footer from "../../components/Footer";
import { BiSolidInfoCircle } from "react-icons/bi";
import axios from "axios";
import { BASE_URL } from "../../config/Properties";
import LanguageComponent from "../../components/LanguageComponent";
import { encryptData } from "../../config/encrypt/encryptData";
import Playground from "../../components/FlagSelection";
import { IoLanguage, IoLocation } from "react-icons/io5";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import { OnlyNumbersAndSpecialCharacters } from "../../components/SkillOwner/HelperFunction/OnlyNumbersAndSpecialCharacters";
import { IoMdArrowDropdown } from "react-icons/io";
import { useDispatch } from "react-redux";
import { setIsNewUser } from "../../reducer/edit/isEditSlice";

const HscSignup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userCreated, setUserCreated] = useState(false);
  const [selectedRole, setSelectedRole] = useState("R1");
  const [Country, setCountry] = useState({
    countryCode: "US",
    countryName: "United States",
  });
  const [ShowDropDown, setShowDropDown] = useState(false);
  const [flagSearch, setFlagSearch] = useState("");
  const [ageConfirmationCheckBox, setAgeConfirmationCheckBox] = useState();
  const [tosCheckbox, setTosCheckBox] = useState();
  const [timeZone, setTimeZone] = useState();

  const [validated, setValidated] = useState(false);
  const [validationCls, setValidationCls] = useState("");

  const dispatch = useDispatch();

  const handleFlagFilter = (e) => {
    setFlagSearch(e.target.value);
  };

  // const initialState = { userCreated: false, errorMsg: "", successDiv: false }

  // const [data, setData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("general");
  const [dialCodeSearchTerm, setDialCodeSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);

  /* CATEGORY STORE IMPORT */
  const categoryCheckboxData = useSelector(
    (state) => state.category
  )?.specificCheckbox;
  const [checkboxValues, setCheckboxValues] = useState([]);
  const {
    regionalData: { listOfCountries },
  } = useSelector((state) => state);

  useEffect(() => {
    /* FILTER COUNTRIES BY DIAL CODES */
    const filterCountryValue = listOfCountries?.filter(
      (country) =>
        country?.dialCode.includes(dialCodeSearchTerm) ||
        country?.country
          ?.toLowerCase()
          ?.includes(dialCodeSearchTerm?.toLowerCase())
    );
    setFilteredCountries(filterCountryValue);
  }, [listOfCountries, dialCodeSearchTerm]);

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
    if (event.target.value) {
    }
  };
  const navigate = useNavigate();

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

        console.log("change value is bb", res?.data?.[0]);
        setTimeZone(res?.data?.[0]?.abbreviation);
      } catch (err) {
        console.log("Cant fetch TimezoneS ", err);
        showErrorToast("Cant fetch TimezoneS");
      }
    }
    fetchTimeZone();
  }, [Country]);

  const handleSignUp = (e) => {
    // if (password !== '') {
    //     const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    //     console.log(passwordRegex.test(password));
    //     if (!passwordRegex.test(password)) {
    //         showErrorToast("password doesn't meets requirements");
    //         return;
    //     }
    // }

    // Regular expression to check email format
    e.preventDefault();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidationCls("was-validated");
    setValidated(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isValidUserName = emailRegex.test(userName);
    const isValidEmail = emailRegex.test(email);
    if (userName && !isValidUserName && form.checkValidity() === true) {
      showErrorToast("nf Please enter a valid email");
      console.log("triggered");
      return;
    }
    if (email && !isValidEmail && form.checkValidity() === true) {
      showErrorToast("nf Please enter a valid alt email");
      return;
    }

    if (
      isValidUserName &&
      isValidEmail &&
      userName === email &&
      form.checkValidity() === true
    ) {
      showErrorToast("nf Email and Alt Email are same");
      return;
    }

    if (password !== confirmPassword) {
      showErrorToast("nf Passwords are mismatched");
      return;
    }

    if (
      userName !== "" &&
      password !== "" &&
      password === confirmPassword &&
      email &&
      firstName !== "" &&
      contactNumber > 0 &&
      ageConfirmationCheckBox === true &&
      tosCheckbox === true
    ) {
      setLoading(true);
      const ePswd = encryptData(password);
      const eUserName = encryptData(userName);
      let data = {
        accountId: eUserName,
        email: userName,
        altEmail: email,
        contactNumber: `${selectedCountry?.dialCode}-${contactNumber}`,
        firstName: firstName,
        lastName: lastName,
        password: ePswd,
        confirmPassword: ePswd,
        mobileNumber: `${selectedCountry?.dialCode}-${contactNumber}`,
        mlanguage: selectedLanguage,
        role: selectedRole,
        isEncrypted: true,
        homeLanguage: selectedLanguage,
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
      SignupApi(data)
        .then((response) => {
          console.log("response : " + response.data.status);
          if (response.data.status === "success") {
            setUserCreated(true);

            axios
              .post(
                `${BASE_URL}/skill/api/v1/skills/create/User Details`,
                {
                  ...data,
                  UserID: response.data.userid,
                  accountId: userName,
                  userCategory:
                    selectedOption === "specific"
                      ? checkboxValues.toString()
                      : "C1",
                  userRole: selectedRole,
                },
                {
                  auth: {
                    username: userName,
                    password: password,
                  },
                }
              )
              .then((response) => {
                console.log("response : " + response.data);
                dispatch(setIsNewUser(true));
              })
              .catch((error) => {
                console.log("error : " + error);
              })
              .finally(() => {
                toast.success(response.data.message, {
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
                });
                navigate("/skill-owner/email");
              });
          } else {
            toast.error(response.data.message, {
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
            setUserCreated(false);
          }
        })
        .catch((error) => {
          toast.error(error, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
            // progress: undefined,
            closeButton: false,
            theme: "colored",
            className: "snackbar",
            bodyClassName: "snackbar-body",
            style: { backgroundColor: "#D2042D" },
          });
          setUserCreated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      showErrorToast("Please fill the mandatory* fields");
    }
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  // store imports
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const roles = useSelector((state) => state.roles);
  // const userDetails = useSelector(state => state.userProfile.data);

  const handleCheckboxChange = (value) => {
    if (checkboxValues.includes(value)) {
      setCheckboxValues(checkboxValues.filter((item) => item !== value));
    } else {
      setCheckboxValues([...checkboxValues, value]);
    }
  };

  const handleDropDown = () => {
    setShowDropDown(!ShowDropDown);
  };

  console.log(
    content[selectedLanguage]?.find((item) => item.elementLabel === "GetStarted")
  );
  console.log(
    content[selectedLanguage]?.find(
      (item) => item.elementLabel === "CategoryInfo"
    )
  );
  console.log(
    content[selectedLanguage]?.find(
      (item) => item.elementLabel === "UserCategory"
    )
  );

  const [selectedCountry, setSelectedCountry] = useState({
    country: "United States",
    countryCode: "US",
    dialCode: "+1",
  });

  useEffect(() => {}, [filteredCountries]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    /* CLEAR DIAL CODE SEARCH TERM */
    setDialCodeSearchTerm(country.dialCode);
  };

  return (
    <>
      {userCreated ? <Navigate to="/signin"></Navigate> : ""}

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
          direction: "ltr",
        }}
        className="navbar navbar-expand-lg d-print-none p-0 m-0 position- w-100   "
      >
        <div className="container-fluid  ">
          <a className="navbar-brand d-flex align-items-center   " href="/">
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
                direction: "ltr",
              }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Title"
                ) || {}
              ).mvalue || "nf MySkillsTree"}
            </div>
          </a>

          <div className="d-flex align-items-center">
            <LanguageComponent />
          </div>
        </div>
      </nav>

      <div className="lg-px-5 md-px-0" style={{ height: "fit-content" }}>
        <div class="container-fluid " style={{ height: "100%" }}>
          <div class="row no-gutter " style={{ height: "100%" }}>
            <div class="col-lg-6 d-none  d-lg-flex  justify-content-center align-items-center h-100">
              <img
                src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1706759529/55806084555_zu7shg.png"
                alt="login-avatar"
                style={{ width: "40vw" }}
              />
            </div>

            <div class="col-lg-6 p-0 pt-3 ">
              <div class="login d-flex align-items-center  ">
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
                              (item) => item.elementLabel === "SignUpHeading"
                            ) || {}
                          ).mvalue || "nf SignUp"}
                        </h3>
                      </div>

                      <div
                        className="mb-2 text-muted mb-4 text-center d-flex justify-content-between "
                        style={{ letterSpacing: ".1rem" }}
                      >
                        <div className="">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "GetStarted"
                            ) || {}
                          ).mvalue || "nf GetStarted"}
                        </div>

                        <div>
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "HaveAccount"
                            ) || {}
                          ).mvalue || "nf Already have an account ?"}
                          <Link
                            to="/signin"
                            style={{
                              textDecoration: "underline",
                              marginLeft: "10px",
                            }}
                          >
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "SignInLink"
                              ) || {}
                            ).mvalue || "nf SignInLink"}
                          </Link>
                        </div>
                      </div>

                      <form class={validationCls} validated={validated}>
                        <div
                          className="d-flex gap-1 w-100  "
                          style={{ position: "relative" }}
                        >
                          <div class="form-group mb-3 w-100  ">
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
                                <i class="fa fa-user text-muted"></i>
                              </span>
                            </div>
                            <input
                              id="firstName"
                              style={{ height: "32px", paddingLeft: "40px" }}
                              name="firstName"
                              type="text"
                              placeholder={
                                `${
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "FirstName"
                                    ) || {}
                                  ).mvalue || "nf FirstName"
                                }` + "*"
                              }
                              required
                              autoFocus
                              class="form-control font-5"
                              value={firstName}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                const regex = /^[A-Za-z\s]*$/; // Only letters and spaces

                                if (regex.test(inputValue)) {
                                  setFirstName(inputValue);
                                }
                              }}
                            />
                            <div class="text-end invalid-feedback">
                              {(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "EnterFirstName"
                                ) || {}
                              ).mvalue || "nf Please Enter First Name"}
                            </div>
                          </div>
                          <div
                            class="form-group mb-3 w-100 "
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
                                <i class="fa fa-user text-muted"></i>
                              </span>
                            </div>
                            <input
                              id="lastName"
                              style={{ height: "32px", paddingLeft: "40px" }}
                              name="lastName"
                              type="text"
                              placeholder={
                                `${
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "LastName"
                                    ) || {}
                                  ).mvalue || "nf LastName"
                                }` + "*"
                              }
                              required
                              autoFocus
                              class="form-control font-5"
                              value={lastName}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                const regex = /^[A-Za-z\s]*$/; // Only letters and spaces

                                if (regex.test(inputValue)) {
                                  setLastName(inputValue);
                                }
                              }}
                            />
                            <div class="text-end invalid-feedback">
                              {(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "EnterLastName"
                                ) || {}
                              ).mvalue || "nf Please Enter Last Name"}
                            </div>
                          </div>
                        </div>

                        <div
                          className="d-flex gap-1 w-100  "
                          style={{ position: "relative" }}
                        >
                          <div
                            class="form-group mb-3 w-100 "
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
                              placeholder={
                                `${
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "EmailAddress"
                                    ) || {}
                                  ).mvalue || "nf EmailAddress"
                                }` + "*"
                              }
                              required
                              autoFocus
                              class="form-control font-5"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                            />
                            <div class="text-end invalid-feedback">
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "EnterEmail"
                                ) || {}
                              ).mvalue || "nf Please Enter Email"}
                            </div>
                            {/* <input id="email" style={{ height: "32px" }} name="email" type="text" placeholder={(content[selectedLanguage]?.find(item => item.elementLabel === 'UserName') || {}).mvalue || "not found"} required autoFocus class="form-control font-5" value={userName} onChange={(e) => setUserName(e.target.value)} /> --------------original field by prakash */}
                          </div>
                          <div
                            class="form-group mb-3 w-100 "
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
                              id="altemail"
                              style={{ height: "32px", paddingLeft: "44px" }}
                              name="email"
                              type="email"
                              placeholder={
                                `${
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "AltEmailAddress"
                                    ) || {}
                                  ).mvalue || "nf AltEmailAddress"
                                }` + "*"
                              }
                              required
                              autoFocus
                              class="form-control font-5"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <div class="text-end invalid-feedback">
                              {(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "EnterAltEmail"
                                ) || {}
                              ).mvalue || "nf Please Enter Alt Email"}
                            </div>
                            {/* <input id="email" style={{ height: "32px" }} name="email" type="text" placeholder={(content[selectedLanguage]?.find(item => item.elementLabel === 'EmailAddress') || {}).mvalue || "not found"} required autoFocus class="form-control font-5" value={email} onChange={(e) => setEmail(e.target.value)} /> --------------original field by prakash */}
                          </div>
                        </div>

                        <div
                          className="d-flex gap-1 w-100  "
                          style={{ position: "relative" }}
                        >
                          <div
                            class="form-group mb-3 w-100"
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
                            <div className="d-flex flex-column  ">
                              <input
                                id="password"
                                style={{ height: "32px", paddingLeft: "40px" }}
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
                                class="form-control font-5"
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
                          </div>
                          <div
                            class="form-group mb-3 w-100"
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
                            <div>
                              <input
                                id="confirmPassword"
                                style={{ height: "32px", paddingLeft: "40px" }}
                                name="confirmPassword"
                                type="password"
                                placeholder={
                                  `${
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel ===
                                          "ConfirmPassword"
                                      ) || {}
                                    ).mvalue || "nf ConfirmPassword"
                                  }` + "*"
                                }
                                required
                                class="form-control font-5"
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
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
                          </div>
                        </div>

                        <div
                          className="d-flex align-content-center font-5"
                          style={{ position: "relative" }}
                        >
                          {/* <select class="form-select font-5   " style={{ width: "80px", height: "32px", position: 'relative' }}>

                                                    <option selected >+1</option>
                                                    <option value="+91">+91</option>
                                                    <option value="+94">+94</option>
                                                    <option value="+95">+95</option>
                                                </select> */}
                          <div
                            className="dropdown"
                            style={{ position: "relative" }}
                          >
                            <button
                              className="btn btn-white border text-dark dropdown-toggle d-flex align-items-center"
                              style={{
                                padding: "0.2rem",
                                marginRight: "0.2rem",
                              }}
                              type="button"
                              id="dropdownMenuButton"
                              data-bs-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <img
                                src={`https://flagsapi.com/${
                                  selectedCountry?.countryCode || "US"
                                }/flat/24.png`}
                                alt={selectedCountry.country + " Flag"}
                                style={{ marginRight: "5px" }}
                              />
                              {selectedCountry?.dialCode}
                            </button>
                            <div
                              className="dropdown-menu"
                              aria-labelledby="dropdownMenuButton"
                              style={{
                                position: "absolute",
                                zIndex: "1000",
                                minWidth: "1em",
                                maxHeight: "33vh",
                                overflowY: "scroll",
                              }}
                            >
                              <input
                                type="text"
                                placeholder="+91"
                                value={dialCodeSearchTerm}
                                onChange={(e) =>
                                  setDialCodeSearchTerm(e.target.value)
                                }
                                className="form-control"
                                style={{
                                  marginBottom: "0.5rem",
                                  width: "100%",
                                  padding: "0.4 rem",
                                }}
                                // onKeyDown={OnlyNumbersAndSpecialCharacters}
                                // onPaste={OnlyNumbersAndSpecialCharacters}
                              />
                              {filteredCountries.length ? (
                                filteredCountries.map((country, index) => (
                                  <button
                                    key={index}
                                    className="dropdown-item flag-focus"
                                    onClick={() => handleCountrySelect(country)}
                                  >
                                    <img
                                      src={`https://flagsapi.com/${country?.countryCode}/flat/24.png`}
                                      alt=""
                                      style={{ marginRight: "0.1rem" }}
                                    />
                                    {country.dialCode}
                                  </button>
                                ))
                              ) : (
                                <p
                                  className="text-success"
                                  style={{ fontSize: "0.7em" }}
                                >
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "NoCounties"
                                    ) || {}
                                  ).mvalue || "nf NoCounties"}
                                </p>
                              )}
                            </div>
                          </div>
                          <div
                            class="form-group w-50 mb-3"
                            style={{ position: "relative" }}
                          >
                            <input
                              id="contactNumber"
                              style={{ height: "32px" }}
                              name="contactNumber"
                              type="number"
                              placeholder={
                                `${
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "PhoneNumber"
                                    ) || {}
                                  ).mvalue || "nf PhoneNumber"
                                }` + "*"
                              }
                              required
                              autoFocus
                              class="form-control font-5"
                              value={contactNumber}
                              onChange={(e) => setContactNumber(e.target.value)}
                            />
                            <div class="text-end font-5 invalid-feedback">
                              {(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "EnterPhoneNumber"
                                ) || {}
                              ).mvalue || "nf Please Enter Phone Number"}
                            </div>
                          </div>
                        </div>

                        <div
                          className="d-flex gap-2 align-items-center mb-1"
                          style={{ marginLeft: "3px" }}
                        >
                          <div className="d-flex mb-1 align-items-center ms-2 gap-1   ">
                            <div
                              className="me-2"
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content={
                                (
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "RoleInfo"
                                  ) || {}
                                ).mvalue || "nf role info"
                              }
                            >
                              <BiSolidInfoCircle
                                className="text-muted"
                                style={{ fontSize: "20px" }}
                              />
                            </div>
                            <label className=" me-0 " htmlFor="">
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Role"
                                ) || {}
                              ).mvalue || "nf Role"}
                            </label>
                          </div>
                          <select
                            onChange={handleRoleChange}
                            value={selectedRole}
                            class="form-select font-5 mb-2 "
                            aria-label="Default select example"
                            style={{ height: "32px", width: "fit-content" }}
                          >
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
                        </div>

                        {selectedRole === "R1" && (
                          <>
                            {/* CATEGORY RADIO BUTTONS */}
                            <div className="d-flex mx-2 gap-2 mb-2  ">
                              <div
                                className="d-flex  gap-1 "
                                style={{ marginLeft: "3px" }}
                              >
                                <div
                                  className="me-2"
                                  data-tooltip-id="my-tooltip"
                                  data-tooltip-content={
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "CategoryInfo"
                                      ) || {}
                                    ).mvalue || "nf category info"
                                  }
                                >
                                  <BiSolidInfoCircle
                                    className="text-muted"
                                    style={{ fontSize: "20px" }}
                                  />
                                </div>
                                {/* <div>{(content[selectedLanguage]?.find(item => item.elementLabel === 'UserCategory') || {}).mvalue || "nf UserCategory"}</div> */}
                                <div>
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "UserCategory"
                                    ) || {}
                                  ).mvalue || "nf UserCategory"}
                                </div>
                              </div>

                              <div className="d-flex  justify-content-start gap-2   ">
                                {categoryCheckboxData.map(
                                  (category) =>
                                    category.categoryId === "C3" &&
                                    category.mlanguage === selectedLanguage && (
                                      <div
                                        class="form-check   "
                                        key={category.id}
                                      >
                                        <input
                                          class="form-check-input    "
                                          type="radio"
                                          name="flexRadioDefault"
                                          value="general"
                                          style={{ borderColor: "gray" }}
                                          id={category.id}
                                          checked={selectedOption === "general"}
                                          onChange={handleRadioChange}
                                        />
                                        <label
                                          class="form-check-label"
                                          for="category1"
                                        >
                                          {/* {(content[selectedLanguage]?.find(item => item.elementLabel === 'General') || {}).mvalue || "nfs general"} */}
                                          {(
                                            content[selectedLanguage]?.find(
                                              (item) =>
                                                item.elementLabel === "General"
                                            ) || {}
                                          ).mvalue || "nf General"}
                                        </label>
                                      </div>
                                    )
                                )}

                                <div class="form-check  ">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    name="flexRadioDefault"
                                    id="category2"
                                    value="specific"
                                    style={{ borderColor: "gray" }}
                                    checked={selectedOption === "specific"}
                                    onChange={handleRadioChange}
                                  />
                                  <label
                                    class="form-check-label"
                                    for="category2"
                                  >
                                    {/* {(content[selectedLanguage]?.find(item => item.elementLabel === 'specific') || {}).mvalue || "nf specific"} */}
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "Specific"
                                      ) || {}
                                    ).mvalue || "nf Specific"}
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* CHECKBOXES FOR CATEGORY */}
                            {selectedOption === "specific" && (
                              <div className=" row mb-2 ms-2 ">
                                {categoryCheckboxData.map(
                                  (category) =>
                                    category.categoryId !== "C1" &&
                                    category.mlanguage === selectedLanguage && (
                                      <div
                                        className="form-check col-md-4 col-6  p-1"
                                        key={category.id}
                                      >
                                        <div className="d-flex gap-1 ">
                                          <input
                                            type="checkbox"
                                            id={category.id}
                                            checked={checkboxValues.includes(
                                              category.categoryId
                                            )}
                                            onChange={() =>
                                              handleCheckboxChange(
                                                category.categoryId
                                              )
                                            }
                                          />
                                          <label
                                            htmlFor={category.label}
                                            className="form-check-label ms-1"
                                          >
                                            {category.label}
                                          </label>
                                        </div>
                                      </div>
                                    )
                                )}
                              </div>
                            )}

                            {checkboxValues.checkbox6 && (
                              <div class="form-group mb-3">
                                <input
                                  id="other"
                                  style={{ height: "32px" }}
                                  name="email"
                                  type="text"
                                  placeholder={
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel ===
                                          "IfOthersPleaseSpecify"
                                      ) || {}
                                    ).mvalue || "nf IfOthersPleaseSpecify"
                                  }
                                  required
                                  autoFocus
                                  class="form-control"
                                />
                              </div>
                            )}
                          </>
                        )}

                        <div
                          className="d-flex mb-2 gap-0 gap-1  "
                          style={{ marginLeft: "3px" }}
                        >
                          <IoLanguage
                            className="text-muted ms-2 me-2"
                            style={{ fontSize: "20px" }}
                          />
                          <label className="me-2  " htmlFor="">
                            {" "}
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "HomeLanguage"
                              ) || {}
                            ).mvalue || "nf Home language"}
                          </label>
                          <LanguageComponent />
                        </div>

                        <div
                          className="d-flex  gap-1  "
                          style={{ marginLeft: "3px" }}
                        >
                          <IoLocation
                            className="text-muted ms-2 me-2 "
                            style={{ fontSize: "20px" }}
                          />
                          <label className="me-2 " htmlFor="">
                            {" "}
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "HomeCountry"
                              ) || {}
                            ).mvalue || "nf Home Country"}
                          </label>
                          <div class="   px-0 d-none d-lg-block  ">
                            <button
                              type="button"
                              onClick={handleDropDown}
                              class="btn border-0 p-0 m-0  ms-2  "
                              data-bs-auto-close="outside"
                            >
                              <img
                                className="m-0 p-0 "
                                style={{
                                  width: "35px",
                                  height: "37px",
                                  borderRadius: "100%",
                                }}
                                src={`https://flagsapi.com/${Country.countryCode}/flat/32.png`}
                                alt=""
                              />
                              <IoMdArrowDropdown size={20} />
                              <div
                                className="font-10px p-0 m-0 "
                                style={{
                                  color:
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel ===
                                          "NavBarFontColor"
                                      ) || {}
                                    ).mvalue || "#F7FFDD",
                                }}
                              >
                                {Country.countryCode}
                              </div>
                            </button>
                            {ShowDropDown && (
                              <div
                                class={
                                  ShowDropDown
                                    ? "dropdown-menu show"
                                    : "dropdown-menu "
                                }
                                style={{
                                  minWidth: "10px",
                                  marginRight: "100px",
                                  marginLeft: "-30px",
                                }}
                              >
                                <div className="d-flex justify-content-center ">
                                  <input
                                    placeholder="Search Country..."
                                    value={flagSearch}
                                    onChange={handleFlagFilter}
                                    style={{
                                      width: "130px",
                                      height: "20px",
                                      fontSize: "10px",
                                      padding: "2px",
                                    }}
                                  ></input>
                                </div>
                                <div
                                  className=" table-responsive d-flex  font-5 "
                                  style={{ height: "130px" }}
                                >
                                  <table className="table table-sm d-flex table-hover  ">
                                    <tbody
                                      className="font-5"
                                      style={{ width: "5%" }}
                                    >
                                      <Playground
                                        setCountry={setCountry}
                                        setShowDropDown={setShowDropDown}
                                        flagSearch={flagSearch}
                                        setFlagSearch={setFlagSearch}
                                      />
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-end  mx-2 ms-3 mb-4 pb-2">
                          <div>
                            <div className="d-flex">
                              <input
                                required
                                class="form-check-input me-2"
                                type="checkbox"
                                value=""
                                onChange={(e) =>
                                  setAgeConfirmationCheckBox(e.target.checked)
                                }
                                id="ageCheckbox"
                                style={{ borderColor: "gray" }}
                              />
                              <label
                                class="form-check-label ms-2 "
                                for="ageCheckbox"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "AgeConsent"
                                  ) || {}
                                ).mvalue || "nf AgeConsent"}
                                *
                              </label>
                            </div>

                            {/* <br /> */}

                            <div className="d-flex">
                              <input
                                required
                                class="form-check-input me-2"
                                type="checkbox"
                                onChange={(e) =>
                                  setTosCheckBox(e.target.checked)
                                }
                                value=""
                                id="servicepolicy"
                                style={{ borderColor: "gray" }}
                              />
                              <label
                                class="form-check-label ms-2 "
                                for="servicepolicy"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "PolicyConsent"
                                  ) || {}
                                ).mvalue || "nf PolicyConsent"}
                                *
                              </label>
                            </div>

                            <div>
                              {/* <a href="https://www.myskillstree.com/terms" target="_blank" rel="noopener noreferrer">{(content[selectedLanguage]?.find(item => item.elementLabel === 'termsOfService') || {}).mvalue || "nf termsOfService"}</a>
                                                        <a className='ms-2' href="https://www.myskillstree.com/privacypolicy" target="_blank" rel="noopener noreferrer">{(content[selectedLanguage]?.find(item => item.elementLabel === 'privacyPolicy') || {}).mvalue || "nf privacyPolicy"}</a> */}
                              <a
                                href="https://www.myskillstree.com/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "TermsOfServiceLink"
                                  ) || {}
                                ).mvalue || "nf TermsOfServiceLink"}
                              </a>
                              <a
                                className="ms-2"
                                href="https://www.myskillstree.com/privacypolicy"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "PrivacyPolicyLink"
                                  ) || {}
                                ).mvalue || "nf TermsOfServiceLink"}
                              </a>
                            </div>
                          </div>

                          <button
                            id="signInBtn"
                            class="btn  btn-block my-0    float-end rounded-pill shadow-sm text-white  "
                            style={{ backgroundColor: "var(--primary-color)" }}
                            onClick={handleSignUp}
                          >
                            {loading && (
                              <span
                                class="spinner-border spinner-border-sm me-2  "
                                role="status"
                                aria-hidden="true"
                              ></span>
                            )}
                            {/* {(content[selectedLanguage]?.find(item => item.elementLabel === 'SignUp') || {}).mvalue || "nf SignUp"} */}
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "SignUpHeading"
                              ) || {}
                            ).mvalue || "nf SignUp"}
                          </button>
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
  );
};

export default HscSignup;
