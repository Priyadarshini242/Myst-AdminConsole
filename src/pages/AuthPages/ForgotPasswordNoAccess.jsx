import React, { useState } from "react";
import LanguageComponent from "../../components/LanguageComponent";
import { useSelector } from "react-redux";
import logo from "../../Images/logo.png";
import Footer from "../../components/Footer";
import "./forgotpassword.css";

import { MdCancel, MdCloudUpload, MdLabelImportant } from "react-icons/md";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import { Link } from "react-router-dom";
import { getLogoutRoute } from "../../components/helperFunctions/getLogoutRoute";

const ForgotPasswordNoAccess = () => {
  // const [firstName, setFirstName] = useState("");
  // const [lastName, setLastName] = useState("");
  // const [contactNumber, setContactNumber] = useState("");
  // const [email, setEmail] = useState("");
  const [email, setEmail] = useState("");
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const [primaryEmail, setPrimaryEmail] = useState(false);

  const [newPassword, setNewPassword] = useState({
    password: "",
    confrimPassword: "",
  });

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
          <a className="navbar-brand d-flex align-items-center   " href={getLogoutRoute()}>
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
                      (item) => item.elementLabel === "navBarFontColor"
                    ) || {}
                  ).mvalue || "#F7FFDD",
                direction: content[selectedLanguage].direction,
              }}
            >
              MySkillsTree
            </div>
          </a>

          <div className="d-flex align-items-center ">
            <LanguageComponent />
          </div>
        </div>
      </nav>

      <div className="px-5" style={{ height: "fit-content" }}>
        <div class="container-fluid " style={{ height: "100%" }}>
          <div class="row no-gutter " style={{ height: "100%" }}>
            <div class="col-md-6 d-none d-md-flex ">
              {!steps.step3 ? (
                <img
                  src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1706029549/4841113_nly1vv.svg"
                  alt="forgotpassword-avatar"
                  style={{ width: "80vh" }}
                />
              ) : (
                <img
                  src="https://res.cloudinary.com/dr9v4bjwg/image/upload/v1706096581/5522423_vvipbx.svg"
                  alt="success-avatar"
                  className="mt-4"
                  style={{ width: "80vh" }}
                />
              )}
            </div>

            <div class="col-md-6  ">
              <div class="login d-flex flex-column  pt-5 ">
                <div class="col-lg-12  mx-auto ">
                  <div class="progress-track">
                    <ul id="progressbar">
                      <li class="step0 active " id="step1"></li>
                      <li
                        class={`step0 ${
                          steps.step1 ? "active" : ""
                        }  text-right`}
                        id="step2"
                      ></li>
                      <li
                        class={`step0 ${
                          steps.step2 ? "active" : ""
                        }  text-right`}
                        id="step3"
                      ></li>
                      <li
                        class={`step0 ${
                          steps.step3 ? "active" : ""
                        }  text-right`}
                        id="step4"
                      ></li>
                    </ul>
                  </div>
                </div>
                {!steps.step1 && (
                  <div class="container m-auto mt-5">
                    <div class="row">
                      <div class="col-lg-12  mx-auto   ">
                        <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                          <img
                            src={logo}
                            height={"50px"}
                            alt="logo"
                            className=""
                          ></img>

                          <h3 class="display-5 text-center  ">
                            Don't have alt email address?
                          </h3>
                        </div>

                        <p
                          class="text-muted mb-4 text-center"
                          style={{ letterSpacing: ".06rem" }}
                        >
                          {" "}
                          <span className="fw-bold">Don't worry! </span> We can
                          verify your identity so you can change your login
                          e-mail address.
                        </p>
                        <div className="d-flex px-4 flex-column  justify-content-center  align-items-center gap-2 mb-3">
                          <div className="d-flex flex-column px-4  justify-content-start  align-items-start gap-2 mb-3">
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
                                  style={{
                                    height: "32px",
                                    paddingLeft: "40px",
                                  }}
                                  name="firstName"
                                  type="text"
                                  placeholder={
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "FirstName"
                                      ) || {}
                                    ).mvalue || "not found"
                                  }
                                  required
                                  autoFocus
                                  class="form-control font-5"
                                />
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
                                  style={{
                                    height: "32px",
                                    paddingLeft: "40px",
                                  }}
                                  name="lastName"
                                  type="text"
                                  placeholder={
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "LastName"
                                      ) || {}
                                    ).mvalue || "not found"
                                  }
                                  required
                                  autoFocus
                                  class="form-control font-5"
                                />
                              </div>
                            </div>

                            <div
                              className="d-flex gap-1 w-100  "
                              style={{ position: "relative" }}
                            >
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
                                  style={{
                                    height: "32px",
                                    paddingLeft: "43px",
                                  }}
                                  name="email"
                                  type="text"
                                  placeholder={
                                    (
                                      content[selectedLanguage]?.find(
                                        (item) =>
                                          item.elementLabel === "EmailAddress"
                                      ) || {}
                                    ).mvalue || "not found"
                                  }
                                  required
                                  autoFocus
                                  class="form-control font-5"
                                />
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
                                    <i class="fa fa-envelope text-muted"></i>
                                  </span>
                                </div>
                                <input
                                  id="email"
                                  style={{
                                    height: "32px",
                                    paddingLeft: "44px",
                                  }}
                                  name="email"
                                  type="email"
                                  placeholder={"Alt Email Address"}
                                  required
                                  autoFocus
                                  class="form-control font-5"
                                />
                              </div>
                            </div>

                            <div
                              className="d-flex gap-1 w-100  "
                              style={{ position: "relative" }}
                            >
                              <div
                                class="form-group mb-3 w-50"
                                style={{ position: "relative" }}
                              >
                                <input
                                  id="email"
                                  style={{ height: "32px" }}
                                  name="email"
                                  type="date"
                                  placeholder={"DOB"}
                                  required
                                  autoFocus
                                  class="form-control font-5"
                                />
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
                                    <i class="fa fa-phone text-muted"></i>
                                  </span>
                                </div>
                                <input
                                  id="email"
                                  style={{
                                    height: "32px",
                                    paddingLeft: "44px",
                                  }}
                                  name="email"
                                  type="email"
                                  placeholder={"Mobile Number"}
                                  required
                                  autoFocus
                                  class="form-control font-5"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            id="signInBtn"
                            class="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  "
                            style={{ backgroundColor: "var(--primary-color)" }}
                            onClick={() => {
                              setSteps((prev) => {
                                return { ...prev, step1: true };
                              });
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {steps.step1 && !steps.step2 && (
                  <div class="container  mt-5">
                    <div class="row">
                      <div class="col-lg-12  mx-auto ">
                        <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                          <img
                            src={logo}
                            height={"50px"}
                            alt="logo"
                            className=""
                          ></img>

                          <h3 class="display-5 text-center  ">
                            Verify your identity!
                          </h3>
                        </div>

                        <div className=" px-4 ">
                          <p
                            class="text-muted mb-2"
                            style={{ letterSpacing: ".06rem" }}
                          >
                            <MdLabelImportant />
                            We have already sent your reset password link to
                            *******kar33@gmail.com
                          </p>
                          <p
                            class="text-muted mb-2 "
                            style={{ letterSpacing: ".06rem" }}
                          >
                            <MdLabelImportant /> please verify for the next step{" "}
                          </p>
                        </div>

                        <div
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
                        </div>

                        {/* <div className=' px-4 '>

                                                    <p class="text-muted mb-2" style={{ letterSpacing: '.06rem' }}><MdLabelImportant /> This step serves to protect your data: Upload a photo of the front of your ID card or driving licence. </p>
                                                    <p class="text-muted mb-2 " style={{ letterSpacing: '.06rem' }}><MdLabelImportant /> We'll only use these images to verify your identity and will delete them after 30 days at the latest. </p>
                                                </div> */}
                        {/* <div className='d-flex flex-column px-4  justify-content-start  align-items-start gap-2 mb-3'>



                                                    <div>
                                                        <label for="customFile" class="form-label fw-bold mb-0" >Choose Image</label>
                                                        <input type="file" class=" form-control mb-2" id="customFile" style={{ display: 'none' }} onChange={(e) => handleImageChange(e)} />

                                                        <div style={{ height: '10rem', aspectRatio: '1/1', position: 'relative' }}>
                                                            {
                                                                selectedImage ?
                                                                    <>
                                                                        <div style={{ position: 'absolute', top: '5px', right: '10px', cursor: 'pointer' }} onClick={() => {

                                                                            setSelectedImage(null)

                                                                        }
                                                                        }><MdCancel /></div>
                                                                        <img src={selectedImage} style={{ objectFit: 'cover', height: '100%', width: '100%' }} alt="..." class="img-thumbnail" ></img>
                                                                    </>
                                                                    :

                                                                    <label for="customFile" class='form-label d-flex justify-content-center align-items-center rounded' style={{ cursor: 'pointer', height: '100%', width: '100%', backgroundColor: '#e5e5e5' }}>
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

                                                        <button id="signInBtn" class="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  " style={{ backgroundColor: "var(--primary-color)" }} onClick={() => {
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
                  <div class="container mt-5">
                    <div class="row">
                      <div class="col-lg-12  mx-auto ">
                        {/* <div className='d-flex flex-column justify-content-center align-items-center gap-2'>

                                                    <img src={logo} height={"50px"} alt='logo' className=''  ></img>


                                                    <h3 class="display-5 text-center  ">
                                                        Change e-mail address
                                                    </h3>

                                                </div>
                                                <div className=' px-4 mb-4 '>

                                                    <p class="text-muted mb-2" style={{ letterSpacing: '.06rem' }}>What e-mail address would you like to use to log in to MyST from now on? </p>

                                                </div>

                                                <div className='d-flex px-4  justify-content-center  align-items-center gap-2 mb-3'>

                                                    <div class="form-group col-10 " style={{ position: 'relative' }}>
                                                        <div class="" style={{ position: 'absolute', top: '2px', left: '2px' }}>
                                                        <span class="input-group-text bg-white pl-2 border-0 h-100" style={{ borderRadius: 0 }} >
                                                            <i class="fa fa-envelope text-muted"></i>
                                                        </span>
                                                    </div>
                                                        <input id="email" style={{ height: "32px", width: '100%' , paddingLeft:'42px' }} name="email" type="text" placeholder={'Previous Email Address'} required autoFocus class="form-control font-5" vlaue={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                                                    </div>

                                                    <button id="signInBtn" class="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  " style={{ backgroundColor: "var(--primary-color)" }} onClick={() => {

                                                        setSteps((prev) => {
                                                            return { ...prev, step3: true }
                                                        })

                                                    }} >
                                                        Next
                                                    </button>
                                                </div> */}

                        <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                          <img
                            src={logo}
                            height={"50px"}
                            alt="logo"
                            className=""
                          ></img>

                          <h3 class="display-5 text-center  ">
                            Reset Your Password
                          </h3>
                        </div>
                        <div className=" px-4 mb-4 ">
                          <p
                            class="text-muted mb-2 text-center"
                            style={{ letterSpacing: ".06rem" }}
                          >
                            Enter a password you haven't used before
                          </p>
                        </div>

                        <div className="d-flex px-4 flex-column  justify-content-center  align-items-center gap-2 mb-3">
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
                              placeholder={"Enter new password"}
                              required
                              class="form-control font-5 px-5"
                              value={newPassword.password}
                              onChange={(e) =>
                                setNewPassword((prev) => {
                                  return { ...prev, password: e.target.value };
                                })
                              }
                            />
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
                              placeholder={"Confrim password"}
                              required
                              class="form-control font-5 px-5"
                              value={newPassword.confrimPassword}
                              onChange={(e) =>
                                setNewPassword((prev) => {
                                  return {
                                    ...prev,
                                    confrimPassword: e.target.value,
                                  };
                                })
                              }
                            />
                          </div>

                          <button
                            id="signInBtn"
                            class="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  "
                            style={{ backgroundColor: "var(--primary-color)" }}
                            onClick={() => {
                              setSteps((prev) => {
                                return { ...prev, step3: true };
                              });
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 
                                {
                                    steps.step1 && steps.step2 && steps.step3 && !steps.step4 &&
                                    <div class="container mt-5" >
                                        <div class="row">
                                            <div class="col-lg-12  mx-auto ">

                                                <div className='d-flex flex-column justify-content-center align-items-center gap-2'>

                                                    <img src={logo} height={"50px"} alt='logo' className=''  ></img>


                                                    <h3 class="display-5 text-center  ">
                                                        Enter verification code
                                                    </h3>

                                                </div>
                                                <div className=' px-4 mb-4 '>

                                                    <p class="text-muted mb-2 text-center" style={{ letterSpacing: '.06rem' }}>Please enter the code we just sent to <span className='fw-bold' style={{ letterSpacing: '.00rem' }}>{newEmail}</span> </p>

                                                </div>

                                                <div className='d-flex px-4  justify-content-center  align-items-center gap-2 mb-3'>

                                                    <div class="form-group " style={{ position: 'relative' }}>

                                                        <input id="number" style={{ height: "32px", width: 'fit-content' }} name="email" type="text" placeholder={'Enter Code'} required autoFocus class="form-control font-5" vlaue={email} onChange={(e) => setEmail(e.target.value)} />
                                                    </div>

                                                    <button id="signInBtn" class="btn col-2  btn-block my-0 rounded-pill shadow-sm text-white py-1  " style={{ backgroundColor: "var(--primary-color)" }} onClick={() => {
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
                                    <div class="container mt-5" >
                                        <div class="row">
                                            <div class="col-lg-12  mx-auto ">

                                                <div className='d-flex flex-column justify-content-center align-items-center gap-2'>

                                                    <img src={logo} height={"50px"} alt='logo' className=''  ></img>


                                                    <h3 class="display-5 text-center  ">
                                                        Success!
                                                    </h3>

                                                </div>
                                                <div className=' px-4 mb-4  '>

                                                    <p class="text-muted mb-2 text-center" style={{ letterSpacing: '.06rem' }}>Thanks! We'll take a look and get back to you within 2 working days via your new address  <span className='fw-bold' style={{ letterSpacing: '.00rem' }}>{newEmail}</span> </p>
                                                    <p class="text-muted mb-2 text-center" style={{ letterSpacing: '.06rem' }}>N.B.: If your account is deactivated at the moment, we'll reactivate it for you right away. </p>
                                                    <div className='d-flex justify-content-between mt-5'>
                                                        <p class="text-muted mb-2 text-center" style={{ letterSpacing: '.06rem' }}>You may close this page now.   <Link to="/skill-owner/email" class="ml-2">{'Home'}</Link>  </p>
                                                        <Link to="/forgotpassword" class="ml-2">{'Questions? Just get in touch with us!'}</Link>
                                                    </div>
                                                </div>



                                            </div>
                                        </div>
                                    </div>
                                }
 */}

                {steps.step1 && steps.step2 && steps.step3 && (
                  <div class="container mt-5">
                    <div class="row">
                      <div class="col-lg-12  mx-auto ">
                        <div className="d-flex flex-column justify-content-center align-items-center gap-2">
                          <img
                            src={logo}
                            height={"50px"}
                            alt="logo"
                            className=""
                          ></img>

                          <h3 class="display-5 text-center  ">Success!</h3>
                        </div>
                        <div className=" px-4 mb-4  ">
                          <p
                            class="text-muted mb-2 text-center"
                            style={{ letterSpacing: ".06rem" }}
                          >
                            Thanks! Your Profile is updated{" "}
                          </p>
                          <p
                            class="text-muted mb-2 text-center"
                            style={{ letterSpacing: ".06rem" }}
                          >
                            You can signin with your updated data{" "}
                          </p>
                          <div className="d-flex justify-content-between mt-5">
                            <p
                              class="text-muted mb-2 text-center"
                              style={{ letterSpacing: ".06rem" }}
                            >
                              You may close this page now.{" "}
                              <Link to={getLogoutRoute()} class="ml-2">
                                {"Home"}
                              </Link>{" "}
                            </p>
                            <Link to="/forgotpassword" class="ml-2">
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
};

export default ForgotPasswordNoAccess;
