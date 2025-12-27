import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import EditApi from "../../../api/editData/EditApi";
import Loader from "../../../components/Loader";
import { OnlyNumbersAndSpecialCharacters } from "../../../components/SkillOwner/HelperFunction/OnlyNumbersAndSpecialCharacters";
import { editExistingUserProfile } from "../../../reducer/userDetails/UserProfileSlice";
import JobViewSoAlertBox from "../../AuthPages/Login & Singup/Login Component/JobViewSoAlertBox";
import EduCertTranSkillFormForNewUser from "./components/EduCertTranSkillFormForNewUser";
import Employment from "./components/Employment";
import ProjectFormForNewUser from "./components/ProjectFormForNewUser";
import SkillFormForNewUser from "./components/SkillFormForNewUser";
import "./newUser.css";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { getCookie } from "../../../config/cookieService";

const NewUser = () => {
  // to adjust the height of the content dynamically
  const navbarRef = useRef(null);
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const userDetails = useSelector((state) => state.userProfile.data);
  const user = useSelector((state) => state.userProfile);
  /* JOB ID */
  const jobId = sessionStorage.getItem("JD_ID");

  /* DISPATCH INIT */
  const dispatch = useDispatch();

  const [contentHeight, setContentHeight] = useState("100vh");
  const [selectedField, setSelectedField] = useState("profileInfo");

  const [showSkillFrom, setShowSkillForm] = useState(false);

  const [selectedType, setSelectedType] = useState(null);
  const [selectedAcquired, setSelectedAcquired] = useState(null);

  const [dialCodeSearchTerm, setDialCodeSearchTerm] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  /* THIS IS FOR THE PURPOSE OF SHOWING ALERT BOX WHEN USER COME FROM JOB APPLY */
  const [showAlert, setShowAlert] = useState(false);

  /* Phone Number*/
  const categoryCheckboxData = useSelector(
    (state) => state.category
  )?.specificCheckbox;
  const [checkboxValues, setCheckboxValues] = useState([]);
  const {
    regionalData: { listOfCountries },
  } = useSelector((state) => state);

  useEffect(() => {
    /* FILTER COUNTRIES BY DIAL CODES */
    const filterCountryValue = listOfCountries?.filter((country) =>
      country?.dialCode.includes(dialCodeSearchTerm)
    );
    setFilteredCountries(filterCountryValue);
  }, [listOfCountries, dialCodeSearchTerm]);

  const [selectedCountry, setSelectedCountry] = useState(null);

  useEffect(() => {
    const country = listOfCountries?.find(
      (country) =>
        country?.dialCode === userDetails[0]?.mobileNumber?.split("-")[0]
    );
    console.log(userDetails[0]?.mobileNumber?.split("-")[0]);
    // console.log(listOfCountries);
    setSelectedCountry(country);
  }, [listOfCountries, userDetails]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    /* CLEAR DIAL CODE SEARCH TERM */
    setDialCodeSearchTerm("");
  };

  const handlePdf = () => {
    window.print();
  };

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  const initialUserData = {
    firstName: userDetails?.[0]?.firstName,
    lastName: userDetails?.[0]?.lastName,
    mobileNumber: userDetails?.[0]?.mobileNumber,
  };

  const [userCredentials, setUserCredentials] = useState(initialUserData);

  useEffect(() => {
    setUserCredentials({
      firstName: userDetails?.[0]?.firstName,
      lastName: userDetails?.[0]?.lastName,
      mobileNumber: userDetails?.[0]?.mobileNumber,
    });
  }, [userDetails]);

  /* HANDLE INPUT CHANGE */
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setUserCredentials({
        ...userCredentials,
        [name]: value,
      });
    },
    [userCredentials]
  );

  useEffect(() => {}, [userCredentials]);

  /* HANDLE SUBMIT USER DETAILS */
  const handleSubmitUserData = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await EditApi("User Details", userDetails?.[0]?.id, userCredentials);
        dispatch(
          editExistingUserProfile({
            id: userDetails?.[0]?.id,
            updatedData: userCredentials,
          })
        );
        setSelectedField("Employment");
      } catch (error) {
        if (error instanceof ReferenceError) {
          console.error("Reference error occured: ", error?.message);
        } else if (error instanceof TypeError) {
          console.error("Type error occured: ", error?.message);
        } else {
          console.error("Error occured during update account: ", error);
        }
      }
    },
    [userCredentials, userDetails, dispatch]
  );

  useEffect(() => {
    if (jobId) {
      setShowAlert(true);
    }
  }, [jobId]);

  console.log(dialCodeSearchTerm);
  console.log(userDetails);
  console.log(selectedCountry);

  return (
    <>
      <div
        class="p-lg-5 p-2 py-5 bg-white rounded"
        style={{
          opacity: showAlert && "0.5",
          pointerEvents: showAlert && "none",
        }}
      >
        <ul
          id="myTab1"
          role="tablist"
          class="nav nav-tabs nav-pills with-arrow flex-column gap-2 flex-sm-row text-center"
          style={{ position: "relative", zIndex: "99" }}
        >
          <li
            class="nav-item flex-sm-fill"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedField("profileInfo")}
          >
            <span
              className="px-2 py-1 rounded-circle"
              style={{
                color: selectedField === "profileInfo" ? "white" : "",
                backgroundColor:
                  selectedField === "profileInfo"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "",
                border:
                  selectedField === "profileInfo"
                    ? `4px solid ${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "2px solid #555",
              }}
            >
              1
            </span>
            <div
              class={` mt-2   font-weight-bold mr-sm-3 rounded-0   fs-6 `}
              style={{
                color:
                  selectedField === "profileInfo"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "#555",
                fontWeight: "bolder",
              }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "ProfileInfo"
                ) || {}
              ).mvalue || "nf Profile Info"}
            </div>
          </li>
          <li
            class="nav-item flex-sm-fill"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedField("Employment")}
          >
            <span
              className="px-2 py-1 rounded-circle"
              style={{
                color: selectedField === "Employment" ? "white" : "",
                backgroundColor:
                  selectedField === "Employment"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "",
                border:
                  selectedField === "Employment"
                    ? `4px solid ${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "2px solid #555",
              }}
            >
              2
            </span>
            <div
              class={` mt-2   font-weight-bold mr-sm-3 rounded-0   fs-6 `}
              style={{
                color:
                  selectedField === "Employment"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "#555",
                fontWeight: "bolder",
              }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Employment"
                ) || {}
              ).mvalue || "nf Employment"}
            </div>
          </li>
          <li
            class="nav-item flex-sm-fill"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedField("Project/Work/Occupation")}
          >
            <span
              className="px-2 py-1 rounded-circle"
              style={{
                color:
                  selectedField === "Project/Work/Occupation" ? "white" : "",
                backgroundColor:
                  selectedField === "Project/Work/Occupation"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "",
                border:
                  selectedField === "Project/Work/Occupation"
                    ? `4px solid ${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "2px solid #555",
              }}
            >
              3
            </span>
            <div
              class={` mt-2  font-weight-bold mr-sm-3 rounded-0   fs-6 `}
              style={{
                color:
                  selectedField === "Project/Work/Occupation"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "#555",
                fontWeight: "bolder",
              }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "ProjectHistory"
                ) || {}
              ).mvalue || "nf ProjectHistory"}
            </div>
          </li>
          <li
            class="nav-item flex-sm-fill"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedField("Education")}
          >
            <span
              className="px-2 py-1 rounded-circle"
              style={{
                color: selectedField === "Education" ? "white" : "",
                backgroundColor:
                  selectedField === "Education"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "",
                border:
                  selectedField === "Education"
                    ? `4px solid ${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "2px solid #555",
              }}
            >
              4
            </span>
            <div
              class={` mt-2  font-weight-bold mr-sm-3 rounded-0   fs-6 `}
              style={{
                color:
                  selectedField === "Education"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "#555",
                fontWeight: "bolder",
              }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Education"
                ) || {}
              ).mvalue || "nf Education"}
            </div>
          </li>

          <li
            class="nav-item flex-sm-fill"
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedField("Skills")}
          >
            <span
              className="px-2 py-1 rounded-circle"
              style={{
                color: selectedField === "Skills" ? "white" : "",
                backgroundColor:
                  selectedField === "Skills"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "",
                border:
                  selectedField === "Skills"
                    ? `4px solid ${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "2px solid #555",
              }}
            >
              5
            </span>
            <div
              class={` mt-2  font-weight-bold mr-sm-3 rounded-0   fs-6 `}
              style={{
                color:
                  selectedField === "Skills"
                    ? `${
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarBgColor"
                          ) || {}
                        ).mvalue || "#000"
                      }`
                    : "#555",
                fontWeight: "bolder",
              }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "MySkills"
                ) || {}
              ).mvalue || "nf MySkills"}
            </div>
          </li>
        </ul>

        {selectedField === "profileInfo" && (
          <div id="myTab1Content" class="tab-content ">
            <div className="d-flex flex-column justify-content-center align-items-center m-5">
              <p
                class="text-muted mb-4 text-center"
                style={{ letterSpacing: ".1rem" }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "BasicInfoProfile"
                  ) || {}
                ).mvalue || "nf Tell Us About YourSelf"}
              </p>

              {user.status === "loading" ? (
                <>
                  <Loader />
                </>
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center gap-1 row ">
                  <div
                    class="form-group mb-3  col-12  "
                    style={{ position: "relative" }}
                  >
                    <div
                      class=""
                      style={{ position: "absolute", top: "2px", left: "2px" }}
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
                      value={userCredentials?.firstName}
                      onChange={handleInputChange}
                      name="firstName"
                      type="text"
                      placeholder={
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "FirstName"
                          ) || {}
                        ).mvalue || "nf FirstName"
                      }
                      required
                      autoFocus
                      class="form-control font-5 buttom-line-input"
                    />
                  </div>
                  <div
                    class="form-group mb-3  col-12 "
                    style={{ position: "relative" }}
                  >
                    <div
                      class=""
                      style={{ position: "absolute", top: "2px", left: "2px" }}
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
                      value={userCredentials?.lastName}
                      onChange={handleInputChange}
                      name="lastName"
                      type="text"
                      placeholder={
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "LastName"
                          ) || {}
                        ).mvalue || "nf LastName"
                      }
                      required
                      autoFocus
                      class="form-control font-5 buttom-line-input"
                    />
                  </div>

                  <div
                    className="d-flex justify-content-center align-content-center font-5  col-12"
                    style={{ position: "relative" }}
                  >
                    <div className="dropdown" style={{ position: "relative" }}>
                      <button
                        className="btn btn-white border text-dark dropdown-toggle d-flex align-items-center buttom-line-input"
                        style={{ padding: "0.2rem", marginRight: "0.2rem" }}
                        type="button"
                        id="dropdownMenuButton"
                        data-bs-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        <img
                          src={`https://flagsapi.com/${
                            selectedCountry?.countryCode ||
                           getCookie("countryCode")
                          }/flat/24.png`}
                          alt={selectedCountry?.country + " Flag"}
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
                          defaultValue={userDetails?.[0]?.mobileNumber}
                          type="text"
                          placeholder="Code.."
                          value={dialCodeSearchTerm}
                          onChange={(e) =>
                            setDialCodeSearchTerm(e.target.value)
                          }
                          className="form-control w-100 buttom-line-input"
                          style={{ marginBottom: "0.5rem", padding: "0.4 rem" }}
                          onKeyDown={OnlyNumbersAndSpecialCharacters}
                          onPaste={OnlyNumbersAndSpecialCharacters}
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
                          <p className="" style={{ fontSize: "0.7em" }}>
                            nf No Countries
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      class="form-group w-100 mb-3"
                      style={{ position: "relative" }}
                    >
                      <input
                        id="contactNumber"
                        style={{ height: "32px" }}
                        name="mobileNumber"
                        type="text"
                        value={
                          userCredentials?.mobileNumber?.includes("-")
                            ? userCredentials?.mobileNumber?.split("-")[1]
                            : userCredentials?.mobileNumber
                        }
                        onChange={handleInputChange}
                        placeholder={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "PhoneNumber"
                            ) || {}
                          ).mvalue || "nf PhoneNumber"
                        }
                        required
                        autoFocus
                        class="form-control font-5 buttom-line-input "
                      />
                    </div>
                  </div>
                </div>
              )}

              <div
                className="d-flex w-100 gap-2   p-4 pt-2  justify-content-between bg-white"
                style={{ position: "fixed", bottom: "10px" }}
              >
                {/* <SecondaryBtnLoader onClick={() => setSelectedField('Employment')} label="Skip & Next"  backgroundColor="#F8F8E9" color="var(--primary-color)" /> */}
                {/* <button
                  className="btn"
                  style={{
                    border: "2px solid var(--primary-color)",
                    color: "var(--primary-color)",
                    opacity: ".5",
                  }}
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Back"
                    ) || {}
                  ).mvalue || "nf Back"}
                </button> */}
                <div></div>
                <button
                  className="btn"
                  style={{
                    backgroundColor:
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "NavBarBgColor"
                        ) || {}
                      ).mvalue || "#000",
                    color: "white",
                  }}
                  onClick={handleSubmitUserData}
                >
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Next"
                    ) || {}
                  ).mvalue || "nf Next"}
                </button>

                {/* <DialogButton />
                                    <DialogButton Active={true} onClick={() => setSelectedField('Employment')} />  */}
              </div>
            </div>
          </div>
        )}

        {selectedField === "Employment" && (
          <Employment setSelectedField={setSelectedField} />
        )}

        {selectedField === "Project/Work/Occupation" && (
          <ProjectFormForNewUser setSelectedField={setSelectedField} />
        )}

        {selectedField === "Education" && (
          <EduCertTranSkillFormForNewUser setSelectedField={setSelectedField} />
        )}

        {selectedField === "Skills" && (
          <SkillFormForNewUser setSelectedField={setSelectedField} />
        )}
      </div>

      {/* SHOW ALERT BOX IF USER HAVE BOTH JOB ID AND LOG INTO DIALOG */}
      {showAlert && (
        <div
          className="d-flex justify-content-center "
          style={{ marginTop: "-25rem" }}
        >
          <JobViewSoAlertBox
            content={content}
            selectedLanguage={selectedLanguage}
            setShowAlert={setShowAlert}
            FaTimes={FaTimes}
            FaExclamationTriangle={FaExclamationTriangle}
          />
        </div>
      )}
    </>
  );
};

export default NewUser;
