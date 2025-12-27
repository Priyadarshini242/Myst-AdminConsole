import React from "react";
import SuccessBtn from "../../../../components/Buttons/SuccessBtn";
import CountryFlagComponent from "../../../../components/Country Flag/CountryFlagComponent";
import LanguageComponent from "../../../../components/LanguageComponent";
import useContent from "../../../../hooks/useContent";
import "../LoginPage.css";
import LazyLoadingImageComponent from "../../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import { images } from "../../../../constants";

const SignUpForm = ({
  content,
  selectedLanguage,
  validation,
  validated,
  isPasswordShow,
  isConfirmPasswordShow,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handlePasswordShow,
  handleConfirmPasswordShow,
  handleRoleChange,
  selectedRole,
  roles,
  handleSignUp,
  isLoading,
  FaEye,
  FaEyeSlash,
  ageConfirmationCheckBox,
  setAgeConfirmationCheckBox,
  tosCheckbox,
  setTosCheckBox,
  logo,
  Country,
  setCountry,
}) => {
  return (
    <React.Fragment>
      <div className="col-md-6 m-auto border-lg-screen rounded-lg-screen shadow-lg-screen w-100-md py-lg-3">
        <div className="d-flex justify-content-center">
          <LazyLoadingImageComponent
            src={images.SBJFullLogo}
            height={"50vw"}
            style={{
              pointerEvents: "none",
            }}
            alt={"logo"}
          />
        </div>
        <div className="d-flex justify-content-center align-items-center gap-2">
          {/* <LazyLoadingImageComponent
            src={logo}
            height={"50vw"}
            style={{
              filter: "drop-shadow(2px 4px 6px rgba(40, 167, 69, 0.25))",
            }}
            className={"pe-none"}
            alt={"logo"}
          /> */}
          <h3
            className="text-muted text-center"
            style={{ letterSpacing: ".2rem" }}
          >
            {useContent("SignUpHeading", "nf Sign-Up")}
          </h3>
        </div>
        <div className="col-lg-8 mx-auto d-flex justify-content-center align-items-center text-center mt-3">
          <h6
            style={{
              color: useContent("SystemGreenColor", "var(--primary-color)"),
              letterSpacing: ".1rem",
            }}
          >
            {useContent(
              "NewOwnerSignUpMessage",
              "nf Seems like you're not having Skill Owner profile. Let's create one"
            )}
            !
          </h6>
        </div>
        <div className="login d-flex align-items-center py-2">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 mx-auto">
                {/* FORM */}
                <form className={validation} validated={validated}>
                  <div className="col-lg-8 mx-auto">
                    <label htmlFor="password" id="password">
                      {(() => {
                        const label =
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Password"
                            ) || {}
                          ).mvalue || "nf Password*";
                        const lastChar = label.slice(-1);
                        const labelText = label.slice(0, -1);
                        return (
                          <>
                            {labelText}
                            <span className="text-danger">
                              <b>{lastChar}</b>
                            </span>
                          </>
                        );
                      })()}
                      :
                    </label>
                    <div
                      className="form-group mb-3"
                      style={{ position: "relative" }}
                    >
                      {/* PASSWORD */}
                      <div
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
                          <i className="fa fa-lock text-muted"></i>
                        </span>
                      </div>
                      <input
                        id="password"
                        style={{ height: "32px", paddingLeft: "43px" }}
                        name="password"
                        type={isPasswordShow ? "text" : "password"}
                        placeholder={useContent("Password", "nf Password")}
                        required
                        autoFocus
                        minLength={8}
                        className={
                          "form-control font-5" +
                          (password.length < 8 && password.length
                            ? " is-invalid"
                            : "")
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "10px",
                          cursor: "pointer",
                        }}
                        onClick={handlePasswordShow}
                      >
                        {isPasswordShow ? <FaEyeSlash /> : <FaEye />}
                      </div>
                      {/* ERROR MSG */}
                      <div className="text-end invalid-feedback">
                        {password.length && password.length < 8 ? (
                          <p>
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel ===
                                  "PasswordMustBeAtleastCharactersLong"
                              ) || {}
                            ).mvalue ||
                              "nf Password must be at least 8 characters long"}
                          </p>
                        ) : (
                          <p>
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "PleaseEnterNewPassword"
                              ) || {}
                            ).mvalue || "nf Please Enter New Password"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <label htmlFor="password" id="password">
                      {useContent("ConfirmPassword", "nf Confirm Password")}
                      <span className="text-danger">
                        <b>*</b>
                      </span>
                      :
                    </label>
                    <div
                      className="form-group mb-3"
                      style={{ position: "relative" }}
                    >
                      <div
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
                          <i className="fa fa-lock text-muted"></i>
                        </span>
                      </div>
                      <input
                        id="Confirmpassword"
                        style={{ height: "32px", paddingLeft: "43px" }}
                        name="ConfirmPassword"
                        type={isConfirmPasswordShow ? "text" : "password"}
                        placeholder={`${useContent(
                          "ConfirmPassword",
                          "nf ConfirmPassword"
                        )}`}
                        required
                        className={
                          "form-control font-5" +
                          (confirmPassword.length &&
                          confirmPassword !== password
                            ? " is-invalid"
                            : "")
                        }
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "10px",
                          cursor: "pointer",
                        }}
                        onClick={handleConfirmPasswordShow}
                      >
                        {isConfirmPasswordShow ? <FaEyeSlash /> : <FaEye />}
                      </div>
                      {/* CONFIRM PASSWORD ERR MSG */}
                      <div className="text-end invalid-feedback">
                        {confirmPassword !== password ? (
                          <p>
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel ===
                                  "ConfirmPasswordNotMatchNewPassword"
                              ) || {}
                            ).mvalue ||
                              "nf Confirm password should match New Password"}
                          </p>
                        ) : (
                          <p>
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel ===
                                  "PleaseEnterConfirmPassword"
                              ) || {}
                            ).mvalue || "nf Please Enter Confirm Password"}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ROLE SELECT */}
                    <div className="mt-3 d-none">
                      <select
                        onChange={handleRoleChange}
                        value={selectedRole}
                        required
                        className="form-select font-5 mb-2"
                        aria-label="Default select example"
                      >
                        {roles?.data.map((role) => {
                          if (
                            role.active === "Yes" &&
                            role.mlanguage === selectedLanguage
                          ) {
                            return (
                              <option key={role.roleName} value={role.roleName}>
                                {role.label}
                              </option>
                            );
                          }
                          return null;
                        })}
                      </select>
                      <div className="text-end invalid-feedback">
                        {useContent(
                          "PleaseSelectARole",
                          "nf PleaseSelectARole"
                        )}
                      </div>
                    </div>

                    {/* HOME COUNTRY */}
                    <div className="d-flex align-items-center">
                      {useContent("HomeCountryLable", "nf Home Country")}&nbsp;
                      <span>
                        <CountryFlagComponent
                          Country={Country}
                          setCountry={setCountry}
                          isOwnerSignup={true}
                        />
                      </span>
                    </div>

                    {/* LANGUAGE COMPONENT */}
                    <div className="d-flex align-items-center">
                      {useContent("HomeLanguageLabel", "nf Home Language")}
                      &nbsp;
                      <span>
                        <LanguageComponent isOwnerSignup={true} />
                      </span>
                    </div>

                    {/* CONSENTS SECTION */}
                    <div className="d-flex justify-content-between align-items-end mt-2 mx-2 mb-2">
                      <div>
                        <div className="d-flex">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value={ageConfirmationCheckBox}
                            onChange={(e) =>
                              setAgeConfirmationCheckBox(e.target.checked)
                            }
                            id="ageCheckbox"
                            style={{ borderColor: "gray" }}
                          />
                          <label
                            class="form-check-label ms-2 "
                            for="ageCheckbox"
                            style={{
                              color: useContent("SecondaryColor", "#6c757d"),
                            }}
                          >
                            {useContent("AgeConsent", "nf AgeConsent")}
                          </label>
                        </div>

                        <div className="d-flex">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            onChange={(e) => setTosCheckBox(e.target.checked)}
                            value={tosCheckbox}
                            id="servicepolicy"
                            style={{ borderColor: "gray" }}
                          />
                          <label
                            class="form-check-label ms-2"
                            for="servicepolicy"
                            style={{
                              color: useContent("SecondaryColor", "#6c757d"),
                            }}
                          >
                            {useContent("PolicyConsent", "nf PolicyConsent")}
                          </label>
                        </div>

                        <div>
                          <a
                            href="https://www.myskillstree.com/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {useContent(
                              "TermsOfServiceLink",
                              "nf TermsOfServiceLink"
                            )}
                          </a>
                          <a
                            className="ms-2"
                            href="https://www.myskillstree.com/privacypolicy"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {useContent(
                              "PrivacyPolicyLink",
                              "nf PrivacyPolicyLink"
                            )}
                          </a>
                        </div>
                      </div>
                    </div>
                    <div>
                      {/* SIGNIN BUTTON */}
                      <div className="d-flex align-items-center justify-content-end mt-3">
                        <SuccessBtn
                          onClick={handleSignUp}
                          isLoading={isLoading}
                          isLargebtn={true}
                          label={useContent("SignUp", "nf SignUp")}
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
    </React.Fragment>
  );
};

export default SignUpForm;
