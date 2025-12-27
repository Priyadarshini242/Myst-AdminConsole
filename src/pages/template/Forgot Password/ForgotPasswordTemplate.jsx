import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { encryptData } from "../../../config/encrypt/encryptData";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Lottie from "react-lottie";
import {
  ForgotPasswordTokenCheckApi,
  ForgotPasswordUpdateApi,
} from "../../../api/auth/ForgotPasswordApi";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import ExpiredTokenImage from "../img/expired.png";
import somethingWentWrong from "../validation success template/something-went-wrong-animation.json";
import { BASE_URL } from "../../../config/Properties";
import LazyLoadingImageComponent from "../../../components/Lazy Loading Images/LazyLoadingImageComponent";

/* LAZY LOADING COMPONENTS */
const LazyNavbarComponent = lazy(() =>
  import("../../../components/navbar/NavbarComponent")
);
const LazyProgressBar = lazy(() => import("./ForgotPassTempProggressBar"));
const LazyFormComponent = lazy(() => import("./ForgotPasswordFormComponent"));

const ForgotPasswordTemplate = () => {
  /* PARAM INIT */
  const { id } = useParams();

  /* STORE IMPORTS */
  const { language: selectedLanguage, content } = useSelector((state) => state);

  /* STATES INIT */
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValidErrMsg, setTokenValidErrMsg] = useState("");
  const [isExpired, setIsExpired] = useState(true);
  const [isInitLoading, setIsInItLoading] = useState(true);
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
  });

  /* IMAGES */
  const logo = BASE_URL + "/skill/api/v1/getImage/logo.png";

  useEffect(() => {}, [id]);

  /* TOKEN [ENPOINT ID] VALIDATION */
  useEffect(() => {
    const fetchTokenStatus = async () => {
      /* LOADING STATE INIT */
      setIsInItLoading(true);
      /* PAYLOAD */
      const payload = {
        token: id,
      };

      try {
        const res = await ForgotPasswordTokenCheckApi(payload);
        setIsExpired(res?.data?.expired);
        setIsInItLoading(false);
      } catch (error) {
        if (!error.response?.data) {
          setIsExpired(true);
        } else {
          setIsExpired(false);
        }
        if (!error?.response?.data?.expired) {
          setTokenValidErrMsg(error?.response?.data?.errorMessage);
        }
        setIsInItLoading(false);
        if (error instanceof TypeError) {
          console.error("Type error occured: ", error.message);
        } else if (error instanceof ReferenceError) {
          console.error("Reference error occured: ", error.message);
        } else {
          console.error("Error Occurs in token: ", error?.response);
        }
      }
    };

    fetchTokenStatus();
  }, [id]);

  /* HANDLE SUBMIT FORGOT PASSWORD */
  const handleSubmitForgotPassword = useCallback(
    async (e) => {
      e.preventDefault();

      /* VALIDATE PASSWORD */
      if (newPassword === "") {
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
      if (newPassword.length && newPassword.length < 8) {
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
      if (newPassword !== confirmNewPassword) {
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

      if (tokenValidErrMsg && !isExpired) {
        showErrorToast(tokenValidErrMsg);
        return;
      }

      const _ = e.currentTarget;
      if (_.checkValidity() === false) {
        e.stopPropagation();
        setValidated(true);
        return;
      }

      /* CHECK FOR ERROR IN INPUT FIELDS */
      const input$ = _.querySelectorAll("input");
      const hasError = Array.from(input$).some(
        (inputVal) => !inputVal.checkValidity()
      );
      if (hasError) return;

      /* SET LOADING STATE TO TRUE */
      setIsLoading(true);

      /* PAYLOAD */
      const payload = {
        token: id,
        password: newPassword,
      };

      try {
        const res = await ForgotPasswordUpdateApi(payload);
        /* SET LOADING STATE TO FALSE AFTER SUCCESSFULL CHANGE */
        if (
          res?.data === "Password updated successfully" &&
          res?.status === 200
        ) {
          setIsLoading(false);

          /* IF FORGOT PASSWORD SUCCESS NAVIGATE TO NEXT STEP */
          setSteps((prev) => {
            return { ...prev, step1: true };
          });

          /* RESET THE FIELDS */
          setNewPassword("");
          setConfirmNewPassword("");
        } else if (res?.data === "error") {
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
        if (error instanceof TypeError) {
          console.error("Type error occured: ", error.message);
        } else if (error instanceof ReferenceError) {
          console.error("Reference error occured: ", error.message);
        } else {
          console.error("Error changing password: ", error);
        }
      }
    },
    [
      newPassword,
      confirmNewPassword,
      id,
      tokenValidErrMsg,
      isExpired,
      content,
      selectedLanguage,
    ]
  );

  if (isInitLoading) {
    return <React.Fragment>{""}</React.Fragment>;
  }

  /* LOTTIE OPTIONS */
  const somethingWentWorngDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: somethingWentWrong,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <React.Fragment>
      {/* NAVBAR FOR FORGOT PASSWORD */}
      <Suspense>
        <LazyNavbarComponent />

        {!isExpired &&
        tokenValidErrMsg &&
        tokenValidErrMsg === "Invalid token" ? (
          <React.Fragment>
            <div className="d-flex justify-content-center align-items-center">
              <div>
                <Lottie
                  options={somethingWentWorngDefaultOptions}
                  style={{ width: "100%", height: "90vh" }}
                />
              </div>
            </div>
          </React.Fragment>
        ) : (
          <div className="px-5" style={{ height: "fit-content" }}>
            <div className="container-fluid " style={{ height: "100%" }}>
              <div className="row no-gutter " style={{ height: "100%" }}>
                <div className="col-md-6 d-none d-md-flex ">
                  {!steps.step3 ? (
                    <React.Fragment>
                      <LazyLoadingImageComponent
                        src={
                          BASE_URL +
                          "/skill/api/v1/getImage/forgot_password.svg"
                        }
                        alt={"forgotpassword-avatar"}
                        style={{ width: "80vh", position: "relative" }}
                      />
                      {!isExpired &&
                        tokenValidErrMsg &&
                        tokenValidErrMsg === "Link already used" && (
                          <LazyLoadingImageComponent
                            src={
                              BASE_URL + "/skill/api/v1/getImage/expired.png"
                            }
                            onError={(e) => {
                              e.target.src = ExpiredTokenImage;
                            }}
                            alt={"ExpiredTokenImage"}
                            style={{
                              position: "absolute",
                              width: "15vw",
                              top: "19vw",
                              left: "20vw",
                            }}
                          />
                        )}
                    </React.Fragment>
                  ) : (
                    <LazyLoadingImageComponent
                      src={BASE_URL + "/skill/api/v1/getImage/Success_pic.png"}
                      alt={"success-avatar"}
                      className={"mt-4"}
                      style={{ width: "80vh" }}
                    />
                  )}
                </div>

                <div className="col-md-6  ">
                  <div className="login d-flex flex-column  pt-5 ">
                    {/* PROGRESS BAR */}
                    <LazyProgressBar steps={steps} />

                    {/* FORGOT PASSWORD FORM */}
                    {!steps.step1 && tokenValidErrMsg !== "Invalid token" && (
                      <LazyFormComponent
                        logo={logo}
                        validated={validated}
                        handleSubmitForgotPassword={handleSubmitForgotPassword}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmNewPassword={confirmNewPassword}
                        setConfirmNewPassword={setConfirmNewPassword}
                        isLoading={isLoading}
                      />
                    )}

                    {/* SUCCESS PAGE */}
                    {steps.step1 && (
                      <div className="container mt-5">
                        <div className="row">
                          <div className="col-lg-12  mx-auto ">
                            <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                              <LazyLoadingImageComponent
                                src={logo}
                                height={"50px"}
                                alt={"logo"}
                                className={""}
                              />

                              <h3 className="display-5 text-center  ">
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) => item.elementLabel === "Success"
                                  ) || {}
                                ).mvalue || "nf Success"}
                                !
                              </h3>
                            </div>
                            <div className=" px-4 mb-4  ">
                              <p
                                className="text-muted mb-2 text-center"
                                style={{ letterSpacing: ".06rem" }}
                              >
                                {(
                                  content[selectedLanguage]?.find(
                                    (item) =>
                                      item.elementLabel === "PasswordChangedMsg"
                                  ) || {}
                                ).mvalue ||
                                  "Your Myst account password successfully changed"}
                                .{" "}
                              </p>
                              <div className="d-flex justify-content-between mt-5">
                                <p
                                  className="text-muted mb-2 text-center"
                                  style={{ letterSpacing: ".06rem" }}
                                >
                                  You may close this page now.{" "}
                                  <Link
                                    to="/skillowner/user-auth"
                                    className="ml-2"
                                  >
                                    {(
                                      content[selectedLanguage]?.find(
                                        (item) => item.elementLabel === "SignIn"
                                      ) || {}
                                    ).mvalue || "nf SignIn"}
                                  </Link>{" "}
                                </p>
                                <Link to="/forgotpassword" className="ml-2">
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel ===
                                        "Questions?GetInTouch"
                                    ) || {}
                                  ).mvalue ||
                                    "nf Questions? Just get in touch with us!"}
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </React.Fragment>
  );
};

export default ForgotPasswordTemplate;
