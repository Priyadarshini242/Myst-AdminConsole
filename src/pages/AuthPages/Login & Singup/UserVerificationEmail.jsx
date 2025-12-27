import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserExistenceDetail } from "../../../api/auth/getUserExistenceDetail";
import SuccessBtn from "../../../components/Buttons/SuccessBtn";
import LanguageComponent from "../../../components/LanguageComponent";
import LazyLoadingImageComponent from "../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { sessionEncrypt } from "../../../config/encrypt/encryptData";
import { images } from "../../../constants";
import useContent from "../../../hooks/useContent";
import useContentLabel from "../../../hooks/useContentLabel";
import { resetCountry } from "../../../reducer/localization/CountryRegionalSlice";
import { setLanguage } from "../../../reducer/localization/languageSlice";
import { setCookie } from "../../../config/cookieService";

const UserVerificationEmail = () => {
  /* STORE IMPORTS */
  const { language: selectedLanguage, content } = useSelector((state) => state);

  /* NAVIGATE INIT */
  const navigate = useNavigate();
  /* DISPATCH INIT */
  const dispatch = useDispatch();
  /* CONTENT LABEL */
  const contentLabel = useContentLabel();

  /* STATES INIT */
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [isEmail, setIsEmail] = useState(true);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const [Country, setCountry] = useState({
    countryCode: "US",
    countryName: "United States",
  });
  const [externalSite, setExternalSite] = useState(null);
  const [jdId, setJdId] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    const query = hash.split("?")[1]; // Extract the query portion of the hash
    const params = new URLSearchParams(query);

    setExternalSite(params.get("externalSite"));
    setJdId(params.get("jdId"));
  }, []);

  if (externalSite) {
    sessionStorage.setItem(
      "externalSite", sessionEncrypt(externalSite));
      setCookie("externalSite", externalSite);
  }
  sessionStorage.setItem("JD_ID", jdId ? sessionEncrypt(jdId) : null);
  /* DOCUMENT TITLE INIT */
  useEffect(() => {
    document.title =
      (
        content[selectedLanguage]?.find(//temp_change
          (item) => item.elementLabel === "WelcomeToMyST"
        ) || {}
      ).mvalue || "Welcome To MyST";
  }, [content, selectedLanguage]);

  /* DISPATCH COUNTRY INITIAL VALUE */
  useEffect(() => {
    dispatch(resetCountry());
  }, [dispatch]);

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
        setIsEmail(false);
        setIsLoading(false);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "EnterEmail"
            ) || {}
          ).mvalue || "nf EnterAnEmail"
        );
        return;
      } else if (!emailRegX.test(email)) {
        setIsInvalidEmail(true);
        setIsLoading(false);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "EnterValidEmail"
            ) || {}
          ).mvalue || "nf Please enter valid Email address"
        );
        return;
      }

      if (emailRegX.test(email)) setIsInvalidEmail(false);

      try {
        const res = await getUserExistenceDetail(email);
        const data = res?.data;

        if (data?.message === "Account Not Exist") {
          navigate("/skillowner/signup");
        } else if (data?.message === "Account Exist") {
          /* GET HOME LANGUAGE OF THE USER */
          dispatch(setLanguage(data?.homeLanguage));
          navigate("/skillowner/signin");
        }
        /* SET EMAIL IN LOCAL STORAGE */
        sessionStorage.setItem("auth_key", sessionEncrypt(email));
         setCookie("auth_key", email);
        setIsEmail(true);
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
    [email, navigate, content, selectedLanguage, dispatch, contentLabel]
  );

  /* CONTENTS */
  const notEmailMsg = useContent("EnterEmail", "nf EnterEmail");
  const invalidEmailMsg = useContent("EnterValidEmail", "nf EnterValidEmail");

  return (
    <React.Fragment>
      {/* NAVBAR */}
      {/* <NavbarComponent
        isNewLoginPage={true}
        Country={Country}
        setCountry={setCountry}
        userAuthPage={true}
      /> */}

      {/* LANGUAGE COMPONENT */}
      <div className="d-flex justify-content-end align-items-center p-2">
        <LanguageComponent />
      </div>

      {/* PAGE CONTENT */}
      <div
        className="d-flex justify-content-center align-items-center w-75"
        style={{ height: "calc(-60px + 96vh)", margin: "0 auto" }}
      >
        <div class="container-fluid" style={{ height: "100%" }}>
          <div class="row no-gutter" style={{ height: "100%" }}>
            {/* LEFT CONTENT {IMAGE} */}
            {/* <div class="col-md-6 d-none d-lg-flex justify-content-end align-items-center h-100">
              <img
                src={BASE_URL + "/skill/api/v1/getImage/usermail_page_img.PNG"}
                onError={(e) => {
                  e.target.src = leftContImg;
                }}
                alt="login-avatar"
                style={{ width: "40vw" }}
              />
            </div> */}

            {/* RIGHT CONTENT */}
            <div class="col-md-6 m-auto border-lg-screen rounded-lg-screen shadow-lg-screen">
              <div class="login d-flex align-items-center py-5">
                <div class="container">
                  <div className="d-flex justify-content-center align-content-center mb-2">
                    <LazyLoadingImageComponent
                      // src={BASE_URL + "/skill/api/v1/getImage/logo.png"}
                      src={images.SBJFullLogo}
                      height={"50vw"}
                      style={{
                        filter:
                          "drop-shadow(2px 4px 6px rgba(40, 167, 69, 0.25))",
                        // width: "6rem",
                        // height: "6rem",
                        width: "10rem",
                        height: "4rem",
                      }}
                      className={"pe-none"}
                      alt={"logo"}
                    />
                  </div>
                  <div class="row">
                    <div class="col-lg-12 mx-auto">
                      <div className="text-center mb-4 mt-2">
                        <h4>
                          {useContent("WelcomeToMySsT", "Welcome To MyST")}
                          {/* <strong>
                            {useContent("SkillOwner", "nf SkillOwner")}!
                          </strong> */}
                        </h4>
                      </div>
                      <h6 class="mb-2 col-lg-8 mx-auto">
                        {" "}
                        {useContent(
                          "EnterEmail",
                          "nf Please Enter Email Address"
                        )}
                        <span className="text-danger">
                          <b>*</b>
                        </span>
                        :
                      </h6>
                      {/* FORM */}
                      <form
                        className={
                          validated
                            ? "needs-validation was-validated"
                            : "needs-validation"
                        }
                        noValidate
                      >
                        <div className="col-lg-8 mx-auto">
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
                              placeholder={`${useContent(
                                "EmailAddress",
                                "nf EmailAddress"
                              )}`}
                              required
                              autoFocus
                              class={
                                "form-control font-5" +
                                ((email.length === 0 && !isEmail) ||
                                isInvalidEmail
                                  ? " is-invalid"
                                  : "")
                              }
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              autoComplete
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleEmailSubmit(e);
                                }
                              }}
                            />
                            {/* THIS IS INVALID FEEDBACK COMMENTED, INCASE IF NEEDED UNCOMMENT IT */}
                            <div class="invalid-feedback">
                              {email.length === 0 && !isEmail ? (
                                <p>{notEmailMsg}</p>
                              ) : isInvalidEmail ? (
                                <p>{invalidEmailMsg}</p>
                              ) : null}
                            </div>

                            {/* SIGNIN AND SIGNUP FUNC BUTTON */}
                            <div className="d-flex align-items-center justify-content-center mt-3">
                              <SuccessBtn
                                onClick={handleEmailSubmit}
                                label={`${useContent(
                                  "Continue",
                                  "nf Continue"
                                )}`}
                                isLargebtn={true}
                                isLoading={isLoading}
                              />
                            </div>
                          </div>
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
    </React.Fragment>
  );
};

export default UserVerificationEmail;
