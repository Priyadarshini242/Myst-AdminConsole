import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/Footer";
import LanguageComponent from "../../components/LanguageComponent";
import "./forgotpassword.css";

import { MdLabelImportant } from "react-icons/md";
import { ForgotPasswordApi } from "../../api/auth/ForgotPasswordApi";
import { FormatEmailWithStars } from "../../components/SkillOwner/HelperFunction/FormartEmailWithStars";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import { BASE_URL } from "../../config/Properties";
import PrimaryBtn from "../../components/Buttons/PrimaryBtn";
import { getUserExistenceDetail } from "../../api/auth/getUserExistenceDetail";
import LazyLoadingImageComponent from "../../components/Lazy Loading Images/LazyLoadingImageComponent";
import { sessionDecrypt } from "../../config/encrypt/encryptData";
import { getCookie } from '../../config/cookieService';
import { getLogoutRoute } from "../../components/helperFunctions/getLogoutRoute";


const ForgotPassword = () => {
  const navigate = useNavigate();
  /* PARAM INIT */
  const { id } = useParams();
  const [email, setEmail] = useState(
     getCookie("auth_key")
  );
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const [newEmail, setNewEmail] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const [isEmail, setIsEmail] = useState(true);
  const [isInvalidEmail, setIsInvalidEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // store imports
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const roles = useSelector((state) => state.roles);

  //handle image select
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.name.match(/\.(jpg|jpeg|png|gif)$/)) {
        showErrorToast("Wrong image type");
        return;
      }

      if (file.size < 100000) {
        showErrorToast("image size is too small");
        return;
      }

      if (file.size > 5000000) {
        showErrorToast("image size is too large");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  useEffect(() => {}, [email]);

  /* HANDLE EMAIL FOR FORGOT PASSWORD TO SEND LINK */
  const handleForgotPasswordEmailSubmit = async (e) => {
    /* PREVENT BROWSER DEFAULT BEHAVIOR NOTE: ADDED THIS TO AVOID PAGE UNNECESSARY RELOAD */
    e.preventDefault();

    /* EMAIL FORMAT */
    const emailRegX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.length) {
      setIsEmail(false);
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "EnterEmail"
          ) || {}
        ).mvalue || "nf EnterAnEmail"
      );
      setIsLoading(false);
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

    /* PAYLOAD DATA */
    const payload = {
      email: email,
    };

    /* SET LOADING STATE TRUE */
    setIsLoading(true);

    /* CHECK USER EXISTENCE */
    try {
      const res = await getUserExistenceDetail(email);
      const data = res?.data;

      if (data?.message === "Account Not Exist") {
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "AccountNotExist"
            ) || {}
          ).mvalue || "nf Account Not Exist"
        );
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error checking user existence: ", error);
    }
    try {
      /* SET LOADING STATE TRUE */
      setIsLoading(true);

      const res = await ForgotPasswordApi(payload);
      if (res.status === 200) {
        setIsEmail(true);
        setIsInvalidEmail(false);
        /* RESET THE LOADING STATE */
        setIsLoading(false);
        setSteps((prev) => {
          return { ...prev, step1: true };
        });
      }
    } catch (error) {
      /* RESET THE LOADING STATE */
      setIsLoading(false);
      if (error instanceof TypeError) {
        console.error("Type error occured: ", error.message);
      } else if (error instanceof ReferenceError) {
        console.error("Reference error occured: ", error.message);
      } else {
        console.error(
          "Error occured while checking email for Forgot password: ",
          error.message
        );
      }
    }
  };

  return (
    <>
      <nav
        style={{
          color:
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "navBarFontColor"
              ) || {}
            ).mvalue || "#F7FFDD",
          backgroundColor:
            (
              content[selectedLanguage]?.find(
                (item) => item.elementLabel === "navBarBgColor"
              ) || {}
            ).mvalue || "var(--primary-color)",
          direction: content[selectedLanguage].direction,
        }}
        className="navbar navbar-expand-lg d-print-none p-0 m-0 position- w-100   "
      >
        <div className="container-fluid  ">
          <Link
            className="navbar-brand d-flex align-items-center"
            to={
               getCookie("auth_key") ? "/skillowner/user-auth" : getLogoutRoute()
            }
          >
            <LazyLoadingImageComponent
              src={BASE_URL + "/skill/api/v1/getImage/logo.png"}
              alt={"Logo"}
              width={"38"}
              height={"38"}
              className={"d-inline-block bg-img"}
            />
            <div
              className="px-1 font-weight-1  font-1   "
              style={{
                color:
                  (
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "navBarFontColor"
                    ) || {}
                  ).mvalue || "#F7FFDD",
                direction: content[selectedLanguage].direction,
              }}
            >
              MySkillsTree
            </div>
          </Link>

          <div className="d-flex align-items-center ">
            <LanguageComponent />
          </div>
        </div>
      </nav>

      <div className="px-5" style={{ height: "fit-content" }}>
        <div className="container-fluid " style={{ height: "100%" }}>
          <div className="row no-gutter" style={{ height: "100%" }}>
            <div className="col-md-6 d-none d-md-flex">
              {!steps.step3 ? (
                <LazyLoadingImageComponent
                  src={BASE_URL + "/skill/api/v1/getImage/forgot_password.png"}
                  alt={"forgotpassword-avatar"}
                  style={{ width: "80vh" }}
                />
              ) : (
                <LazyLoadingImageComponent
                  src={BASE_URL + "/skill/api/v1/getImage/Success_pic.png"}
                  alt={"success-avatar"}
                  className={"mt-4"}
                  style={{ width: "80vh" }}
                />
              )}
            </div>

            <div className="col-md-6">
              <div className="login d-flex flex-column pt-5">
                <div className="col-lg-12 mx-auto d-none d-lg-block">
                  <div className="progress-track">
                    <ul id="progressbar">
                      <li className="step0 active " id="step1"></li>
                      <li
                        className={`step0 ${
                          steps.step1 ? "active" : ""
                        }  text-right`}
                        id="step2"
                      ></li>
                      <li
                        className={`step0 ${
                          steps.step2 ? "active" : ""
                        }  text-right`}
                        id="step3"
                      ></li>
                      <li
                        className={`step0 ${
                          steps.step3 ? "active" : ""
                        }  text-right`}
                        id="step4"
                      ></li>
                    </ul>
                  </div>
                </div>
                {!steps.step1 && (
                  <div className="container">
                    <div className="row">
                      <div className="col-lg-12 mx-auto">
                        <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                          <LazyLoadingImageComponent
                            src={BASE_URL + "/skill/api/v1/getImage/logo.png"}
                            style={{
                              filter:
                                "drop-shadow(2px 4px 6px rgba(40, 167, 69, 0.25))",
                              width: "4rem",
                              height: "4rem",
                            }}
                            height={"50vw"}
                            alt={"logo"}
                            className={"pe-none"}
                          />

                          <h3 className="display-5 text-center">
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "ForgottenYourPassword?"
                              ) || {}
                            ).mvalue || "nf Forgotten your password"}
                            ?
                          </h3>
                        </div>

                        <p
                          className="text-muted mb-4 text-center"
                          style={{ letterSpacing: ".06rem" }}
                        >
                          {" "}
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "PleaseEnterEmailUsedTo"
                            ) || {}
                          ).mvalue ||
                            "nf Please enter the e-mail address you use to log in to MyST."}
                        </p>

                        <form
                          className={
                            validated
                              ? "needs-validation was-validated"
                              : "needs-validation"
                          }
                          noValidate
                        >
                          <div className="d-flex px-1  justify-content-center  align-items-center gap-2 mb-3">
                            <div
                              className="form-group col-10 "
                              style={{ position: "relative" }}
                            >
                              <div
                                className=""
                                style={{
                                  position: "absolute",
                                  top: "2px",
                                  left: "2px",
                                }}
                              >
                                <span
                                  className="input-group-text bg-white pl-2 border-0 h-100"
                                  style={{ borderRadius: 0 }}
                                >
                                  <i className="fa fa-envelope text-muted"></i>
                                </span>
                              </div>
                              <input
                                id="email"
                                style={{
                                  height: "32px",
                                  width: "100%",
                                  paddingLeft: "42px",
                                }}
                                name="email"
                                type="email"
                                placeholder={"Email Address"}
                                required
                                autoFocus
                                className="form-control font-5"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                              />
                              <div className="invalid-feedback">
                                <p style={{ marginBottom: "-1.5rem" }}>
                                  {isInvalidEmail
                                    ? "Please Enter Valid Email"
                                    : "Please Enter Email"}
                                </p>
                              </div>
                            </div>

                            <button
                              id="signInBtn"
                              className={`btn col-2 btn-block my-0 rounded-pill shadow-sm text-white py-1 ${
                                isLoading && "btn-loading"
                              }`}
                              style={{
                                backgroundColor:
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel ===
                                        "var(--primary-color)"
                                    ) || {}
                                  ).mvalue || "#FFEA00",
                                color:
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel ===
                                        "SecondaryButtonOnFontColor"
                                    ) || {}
                                  ).mvalue || "#000",
                                direction:
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "Direction"
                                    ) || {}
                                  ).mvalue || "ltr",
                              }}
                              disabled={isLoading}
                              onClick={handleForgotPasswordEmailSubmit}
                            >
                              {(
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Next"
                                ) || {}
                              ).mvalue || "nf Next"}
                            </button>
                            {/* <PrimaryBtn
                              style={{
                                backgroundColor: (content[selectedLanguage]?.find(item => item.elementLabel === 'var(--primary-color)') || {}).mvalue || "#FFEA00",
                                color: (content[selectedLanguage]?.find(item => item.elementLabel === 'SecondaryButtonOnFontColor') || {}).mvalue || "#000",
                                direction: (content[selectedLanguage]?.find(item => item.elementLabel === 'Direction') || {}).mvalue || "ltr",
                                borderStyle: "solid",
                                height: "auto"
                              }}
                              className={`col-2 btn-block rounded-pill shadow-sm py-0 ${isLoading && "btn-loading"}`}
                              label={(
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "Next?"
                                ) || {}
                              ).mvalue || "nf Next"}
                              onClick={handleForgotPasswordEmailSubmit} /> */}
                          </div>
                        </form>

                        {/* <div
                          className=" text-muted mb-5 text-center"
                          style={{
                            letterSpacing: ".06rem",
                            textDecoration: "underline",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate("/forgotpassword-altemail")}
                        >
                          Email Address not working ?
                        </div> */}

                        {/* <div className="d-flex flex-column justify-content-center  align-items-center ">
                          <p
                            style={{ letterSpacing: ".06rem" }}
                            className="m-0"
                          >
                            Other problems logging in?
                          </p>
                          <Link>Contact us</Link>
                        </div> */}
                      </div>
                    </div>
                  </div>
                )}

                {steps.step1 && !steps.step2 && (
                  <div className="container  mt-5">
                    <div className="row">
                      <div className="col-lg-12  mx-auto ">
                        <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                          <LazyLoadingImageComponent
                            src={BASE_URL + "/skill/api/v1/getImage/logo.png"}
                            height={"50vw"}
                            alt={"logo"}
                            className={""}
                            style={{
                              filter:
                                "drop-shadow(2px 4px 6px rgba(40, 167, 69, 0.25))",
                              width: "4rem",
                              height: "4rem",
                            }}
                          />

                          <h3 className="display-5 text-center  ">
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "VerifyYourIdentity"
                              ) || {}
                            ).mvalue || "nf Verify your identity!"}
                          </h3>
                        </div>

                        <div className=" px-4 ">
                          <p
                            className="text-muted mb-2"
                            style={{ letterSpacing: ".06rem" }}
                          >
                            <MdLabelImportant />
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "WeSentEmailTo"
                              ) || {}
                            ).mvalue ||
                              "nf We have already sent your reset password link to"}{" "}
                            {FormatEmailWithStars(email)}
                          </p>
                          <p
                            className="text-muted mb-2 "
                            style={{ letterSpacing: ".06rem" }}
                          >
                            <MdLabelImportant />{" "}
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "VerifyForNextStep"
                              ) || {}
                            ).mvalue ||
                              "nf please verify for the next step"}{" "}
                          </p>
                        </div>

                        {/* <div
                          className="p-4 mt-5"
                          onClick={() => {
                            setSteps((prev) => {
                              return { ...prev, step2: true };
                            });
                          }}
                        >
                          <Link className="text-center">
                            https://myhostname/webapp/wcs/stores/servlet/ResetPassword
                          </Link>
                        </div> */}

                        {/* <div className=' px-4 '>

                                                    <p className="text-muted mb-2" style={{ letterSpacing: '.06rem' }}><MdLabelImportant /> This step serves to protect your data: Upload a photo of the front of your ID card or driving licence. </p>
                                                    <p className="text-muted mb-2 " style={{ letterSpacing: '.06rem' }}><MdLabelImportant /> We'll only use these images to verify your identity and will delete them after 30 days at the latest. </p>
                                                </div> */}
                        {/* <div className='d-flex flex-column px-4  justify-content-start  align-items-start gap-2 mb-3'>



                                                    <div>
                                                        <label for="customFile" className="form-label fw-bold mb-0" >Choose Image</label>
                                                        <input type="file" className=" form-control mb-2" id="customFile" style={{ display: 'none' }} onChange={(e) => handleImageChange(e)} />

                                                        <div style={{ height: '10rem', aspectRatio: '1/1', position: 'relative' }}>
                                                            {
                                                                selectedImage ?
                                                                    <>
                                                                        <div style={{ position: 'absolute', top: '5px', right: '10px', cursor: 'pointer' }} onClick={() => {

                                                                            setSelectedImage(null)

                                                                        }
                                                                        }><MdCancel /></div>
                                                                        <img src={selectedImage} style={{ objectFit: 'cover', height: '100%', width: '100%' }} alt="..." className="img-thumbnail" ></img>
                                                                    </>
                                                                    :

                                                                    <label for="customFile" className='form-label d-flex justify-content-center align-items-center rounded' style={{ cursor: 'pointer', height: '100%', width: '100%', backgroundColor: '#e5e5e5' }}>
                                                                        <MdCloudUpload style={{ cursor: 'pointer', fontSize: '25px' }} />
                                                                    </label>
                                                            }
                                                        </div>

                                                    </div>



                                                    <div className='d-flex justify-content-between w-100'>
                                                        <i className='mt-1 ' style={{ fontSize: '13px' }}>
                                                            Note: Image should be in [ <span className='fw-semibold'>jpg,jpeg,png</span> ] format  &
                                                            <span className='ml-2'>{` 100kb < Image < 5mb`}</span>

                                                        </i>

                                                        <button id="signInBtn" className="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  " style={{ backgroundColor: "var(--primary-color)" }} onClick={() => {
                                                            setSteps((prev) => {
                                                                return { ...prev, step2: true }
                                                            })
                                                        }} >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div> */}
                      </div>
                    </div>
                  </div>
                )}

                {steps.step1 && steps.step2 && !steps.step3 && (
                  // <div className="container mt-5">
                  //   <div className="row">
                  //     <div className="col-lg-12  mx-auto ">
                  //       {/* <div className='d-flex flex-column justify-content-center align-items-center gap-2'>

                  //                                   <img src={logo} height={"50px"} alt='logo' className=''  ></img>

                  //                                   <h3 className="display-5 text-center  ">
                  //                                       Change e-mail address
                  //                                   </h3>

                  //                               </div>
                  //                               <div className=' px-4 mb-4 '>

                  //                                   <p className="text-muted mb-2" style={{ letterSpacing: '.06rem' }}>What e-mail address would you like to use to log in to MyST from now on? </p>

                  //                               </div>

                  //                               <div className='d-flex px-4  justify-content-center  align-items-center gap-2 mb-3'>

                  //                                   <div className="form-group col-10 " style={{ position: 'relative' }}>
                  //                                       <div className="" style={{ position: 'absolute', top: '2px', left: '2px' }}>
                  //                                       <span className="input-group-text bg-white pl-2 border-0 h-100" style={{ borderRadius: 0 }} >
                  //                                           <i className="fa fa-envelope text-muted"></i>
                  //                                       </span>
                  //                                   </div>
                  //                                       <input id="email" style={{ height: "32px", width: '100%' , paddingLeft:'42px' }} name="email" type="text" placeholder={'Previous Email Address'} required autoFocus className="form-control font-5" vlaue={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  //                                   </div>

                  //                                   <button id="signInBtn" className="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  " style={{ backgroundColor: "var(--primary-color)" }} onClick={() => {

                  //                                       setSteps((prev) => {
                  //                                           return { ...prev, step3: true }
                  //                                       })

                  //                                   }} >
                  //                                       Next
                  //                                   </button>
                  //                               </div> */}

                  //       <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                  //         <img
                  //           src={logo}
                  //           height={"50px"}
                  //           alt="logo"
                  //           className=""
                  //         ></img>

                  //         <h3 className="display-5 text-center  ">
                  //           Reset Your Password
                  //         </h3>
                  //       </div>
                  //       <div className=" px-4 mb-4 ">
                  //         <p
                  //           className="text-muted mb-2 text-center"
                  //           style={{ letterSpacing: ".06rem" }}
                  //         >
                  //           Enter a password you haven't used before
                  //         </p>
                  //       </div>
                  //       <form
                  //         className={
                  //           validated
                  //             ? "needs-validation was-validated"
                  //             : "needs-validation"
                  //         }
                  //         onSubmit={handleSubmitForgotPassword}
                  //         noValidate
                  //       >
                  //         <div className="d-flex px-4 flex-column  justify-content-center  align-items-center gap-2 mb-3">
                  //           <div
                  //             className="form-group mb-3"
                  //             style={{ position: "relative" }}
                  //           >
                  //             <div
                  //               className=""
                  //               style={{
                  //                 position: "absolute",
                  //                 top: "2px",
                  //                 left: "2px",
                  //               }}
                  //             >
                  //               <span
                  //                 className="input-group-text bg-white pl-2 border-0 h-100"
                  //                 style={{ borderRadius: 0 }}
                  //               >
                  //                 <i className="fa fa-lock text-muted"></i>
                  //               </span>
                  //             </div>
                  //             <input
                  //               id="newPassword"
                  //               name="newPassword"
                  //               type="password"
                  //               placeholder={"Enter new password"}
                  //               required
                  //               className={
                  //                 "form-control font-5 px-5" +
                  //                 (newPassword.length ? " is-invalid" : "") +
                  //                 (newPassword.length < 8 && newPassword.length
                  //                   ? " is-invalid"
                  //                   : "")
                  //               }
                  //               minLength={8}
                  //               value={newPassword}
                  //               onChange={(e) => setNewPassword(e.target.value)}
                  //             />
                  //             <div className="invalid-feedback">
                  //               {newPassword.length &&
                  //               newPassword.length < 8 ? (
                  //                 <p>
                  //                   Password must be at least 8 characters long
                  //                 </p>
                  //               ) : (
                  //                 !newPassword.length && (
                  //                   <p>Please Enter New Password</p>
                  //                 )
                  //               )}
                  //             </div>
                  //           </div>

                  //           <div
                  //             className="form-group mb-3"
                  //             style={{ position: "relative" }}
                  //           >
                  //             <div
                  //               className=""
                  //               style={{
                  //                 position: "absolute",
                  //                 top: "2px",
                  //                 left: "2px",
                  //               }}
                  //             >
                  //               <span
                  //                 className="input-group-text bg-white pl-2 border-0 h-100"
                  //                 style={{ borderRadius: 0 }}
                  //               >
                  //                 <i className="fa fa-lock text-muted"></i>
                  //               </span>
                  //             </div>

                  //             <input
                  //               id="confirmNewPasswordconfirmNewPassword"
                  //               name="confirmNewPassword"
                  //               type="password"
                  //               placeholder={"Confrim password"}
                  //               required
                  //               className={
                  //                 "form-control font-5 px-5" +
                  //                 (confirmNewPassword.length &&
                  //                 confirmNewPassword !== newPassword
                  //                   ? " is-invalid"
                  //                   : "")
                  //               }
                  //               minLength={8}
                  //               value={confirmNewPassword}
                  //               onChange={(e) =>
                  //                 setConfirmNewPassword(e.target.value)
                  //               }
                  //             />
                  //             <div className="invalid-feedback">
                  //               {confirmNewPassword !== newPassword ? (
                  //                 <p>
                  //                   Confirm password should match New Password
                  //                 </p>
                  //               ) : (
                  //                 <p>Please Enter Confirm Password</p>
                  //               )}
                  //             </div>
                  //           </div>

                  //           <button
                  //             id="signInBtn"
                  //             type="submit"
                  //             className="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  "
                  //             style={{ backgroundColor: "var(--primary-color)" }}
                  //             // onClick={() => {
                  //             //   setSteps((prev) => {
                  //             //     return { ...prev, step3: true };
                  //             //   });
                  //             // }}
                  //           >
                  //             Next
                  //           </button>
                  //         </div>
                  //       </form>
                  //     </div>
                  //   </div>
                  // </div>
                  <React.Fragment>
                    {/* <Outlet>
                      <ForgotPasswordTemplate emailToChild={email} setSteps={setSteps} />
                    </Outlet> */}
                  </React.Fragment>
                )}

                {/* 
                                {
                                    steps.step1 && steps.step2 && steps.step3 && !steps.step4 &&
                                    <div className="container mt-5" >
                                        <div className="row">
                                            <div className="col-lg-12  mx-auto ">

                                                <div className='d-flex flex-column justify-content-center align-items-center gap-2'>

                                                    <img src={logo} height={"50px"} alt='logo' className=''  ></img>


                                                    <h3 className="display-5 text-center  ">
                                                        Enter verification code
                                                    </h3>

                                                </div>
                                                <div className=' px-4 mb-4 '>

                                                    <p className="text-muted mb-2 text-center" style={{ letterSpacing: '.06rem' }}>Please enter the code we just sent to <span className='fw-bold' style={{ letterSpacing: '.00rem' }}>{newEmail}</span> </p>

                                                </div>

                                                <div className='d-flex px-4  justify-content-center  align-items-center gap-2 mb-3'>

                                                    <div className="form-group " style={{ position: 'relative' }}>

                                                        <input id="number" style={{ height: "32px", width: 'fit-content' }} name="email" type="text" placeholder={'Enter Code'} required autoFocus className="form-control font-5" vlaue={email} onChange={(e) => setEmail(e.target.value)} />
                                                    </div>

                                                    <button id="signInBtn" className="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  " style={{ backgroundColor: "var(--primary-color)" }} onClick={() => {
                                                        setSteps((prev) => {
                                                            return { ...prev, step4: true }
                                                        })
                                                    }} >
                                                        Next
                                                    </button>
                                                </div>



                                            </div>
                                        </div>
                                    </div>
                                }

                                {
                                    steps.step1 && steps.step2 && steps.step3 && steps.step4 &&
                                    <div className="container mt-5" >
                                        <div className="row">
                                            <div className="col-lg-12  mx-auto ">

                                                <div className='d-flex flex-column justify-content-center align-items-center gap-2'>

                                                    <img src={logo} height={"50px"} alt='logo' className=''  ></img>


                                                    <h3 className="display-5 text-center  ">
                                                        Success!
                                                    </h3>

                                                </div>
                                                <div className=' px-4 mb-4  '>

                                                    <p className="text-muted mb-2 text-center" style={{ letterSpacing: '.06rem' }}>Thanks! We'll take a look and get back to you within 2 working days via your new address  <span className='fw-bold' style={{ letterSpacing: '.00rem' }}>{newEmail}</span> </p>
                                                    <p className="text-muted mb-2 text-center" style={{ letterSpacing: '.06rem' }}>N.B.: If your account is deactivated at the moment, we'll reactivate it for you right away. </p>
                                                    <div className='d-flex justify-content-between mt-5'>
                                                        <p className="text-muted mb-2 text-center" style={{ letterSpacing: '.06rem' }}>You may close this page now.   <Link to="/skill-owner/email" className="ml-2">{'Home'}</Link>  </p>
                                                        <Link to="/forgotpassword" className="ml-2">{'Questions? Just get in touch with us!'}</Link>
                                                    </div>
                                                </div>



                                            </div>
                                        </div>
                                    </div>
                                }
 */}

                {steps.step1 && steps.step2 && steps.step3 && (
                  <div className="container mt-5">
                    <div className="row">
                      <div className="col-lg-12  mx-auto ">
                        <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                          <LazyLoadingImageComponent
                            src={BASE_URL + "/skill/api/v1/getImage/logo.png"}
                            height={"50px"}
                            alt={"logo"}
                            className={""}
                          />

                          <h3 className="display-5 text-center  ">Success!</h3>
                        </div>
                        <div className=" px-4 mb-4  ">
                          <p
                            className="text-muted mb-2 text-center"
                            style={{ letterSpacing: ".06rem" }}
                          >
                            Thanks! We'll take a look and get back to you within
                            2 working days via your new address{" "}
                            <span
                              className="fw-bold"
                              style={{ letterSpacing: ".00rem" }}
                            >
                              {newEmail}
                            </span>{" "}
                          </p>
                          <p
                            className="text-muted mb-2 text-center"
                            style={{ letterSpacing: ".06rem" }}
                          >
                            N.B.: If your account is deactivated at the moment,
                            we'll reactivate it for you right away.{" "}
                          </p>
                          <div className="d-flex justify-content-between mt-5">
                            <p
                              className="text-muted mb-2 text-center"
                              style={{ letterSpacing: ".06rem" }}
                            >
                              You may close this page now.{" "}
                              <Link to={getLogoutRoute()} className="ml-2">
                                {"Home"}
                              </Link>{" "}
                            </p>
                            <Link to="/forgotpassword" className="ml-2">
                              {"Questions? Just get in touch with us!"}
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

      <Footer />
    </>
  );

  // const [email, setEmail] = useState('')
  // const [withAccess, setWithAccess] = useState(true)
  // const navigate = useNavigate()
  // const [steps, setSteps] = useState({
  //     step1: false,
  //     step2: false,
  //     step3: false,
  //     step4: false,
  // })
  // // store imports
  // const selectedLanguage = useSelector(state => state.language);
  // const content = useSelector(state => state.content);
  // const roles = useSelector(state => state.roles);

  // return (
  //     <>
  //         <nav style={{ color: (content[selectedLanguage]?.find(item => item.elementLabel === 'navBarFontColor') || {}).mvalue || "#F7FFDD", backgroundColor: (content[selectedLanguage]?.find(item => item.elementLabel === 'navBarBgColor') || {}).mvalue || "var(--primary-color)", direction: content[selectedLanguage].direction }} className="navbar navbar-expand-lg d-print-none p-0 m-0 position- w-100   "  >
  //             <div className="container-fluid  ">
  //                 <a className="navbar-brand d-flex align-items-center   " href="/skill-owner/email">
  //                     <img src={logo} alt="Logo" width="38" height="38" className="d-inline-block bg-img" />
  //                     <div className='px-1 font-weight-1  font-1   ' style={{ color: (content[selectedLanguage]?.find(item => item.elementLabel === 'navBarFontColor') || {}).mvalue || "#F7FFDD", direction: content[selectedLanguage].direction }}>MySkillsTree</div>
  //                 </a>

  //                 <div className='d-flex align-items-center '>

  //                     <LanguageComponent />

  //                 </div>

  //             </div>

  //         </nav>

  //         <div className='px-5' style={{ height: 'fit-content' }} >

  //             <div className="container-fluid " style={{ height: '100%' }} >
  //                 <div className="row no-gutter " style={{ height: '100%' }}>

  //                     <div className="col-md-6 d-none d-md-flex " >
  //                         <img src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1706029549/4841113_nly1vv.svg" alt="login-avatar" style={{ width: '80vh' }} />
  //                     </div>

  //                     <div className="col-md-6 m-auto " >
  //                         <div className="login d-flex align-items-center py-5 ">

  //                             <div className="container" >

  //                                 <div className="row">
  //                                     <div className="col-lg-12  mx-auto ">
  //                                         <div className='d-flex flex-column justify-content-center align-items-center gap-2'>

  //                                             <img src={logo} height={"50px"} alt='logo' className=''  ></img>

  //                                             <h3 className="display-5 text-center  ">
  //                                                 Forgotten your password?
  //                                             </h3>

  //                                         </div>

  //                                         <p className="text-muted mb-4 text-center" style={{ letterSpacing: '.06rem' }}> <span className='fw-bold'>No problem:</span>Please enter the e-mail address or mobile number you use to log in to MyST.</p>

  //                                         <div className='d-flex px-1  justify-content-center  align-items-center gap-2 mb-3'>

  //                                             <div className="form-group col-10 " style={{ position: 'relative' }}>
  //                                                 <div className="" style={{ position: 'absolute', top: '2px', left: '2px' }}>
  //                                                     <span className="input-group-text bg-white pl-2 border-0 h-100" style={{ borderRadius: 0 }} >
  //                                                         <i className="fa fa-envelope text-muted"></i>
  //                                                     </span>
  //                                                 </div>
  //                                                 <input id="email" style={{ height: "32px", width: '100%' , paddingLeft:'42px' }} name="email" type="text" placeholder={'Email Address'} required autoFocus className="form-control font-5" vlaue={email} onChange={(e) => setEmail(e.target.value)} />
  //                                             </div>

  //                                             <button id="signInBtn" className="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  " style={{ backgroundColor: "var(--primary-color)" }} >
  //                                                 Next
  //                                             </button>
  //                                         </div>

  //                                         <div className=" text-muted mb-5 text-center" style={{ letterSpacing: '.06rem', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/forgotpassword-noaccess')}>Email Address not working ?</div>

  //                                         <div className='d-flex flex-column justify-content-center  align-items-center '>
  //                                             <p style={{ letterSpacing: '.06rem' }} className='m-0' >Other problems logging in?</p>
  //                                             <Link>Contact us</Link>
  //                                         </div>

  //                                     </div>
  //                                 </div>
  //                             </div>

  //                         </div>
  //                     </div>

  //                 </div>
  //             </div>
  //         </div>

  //         <Footer />
  //     </>
  // )
};

export default ForgotPassword;
