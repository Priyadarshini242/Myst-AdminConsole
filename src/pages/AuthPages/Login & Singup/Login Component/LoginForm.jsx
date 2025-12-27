import React from "react";
import { Link } from "react-router-dom";
import SuccessBtn from "../../../../components/Buttons/SuccessBtn";
import "../LoginPage.css";
import useContent from "../../../../hooks/useContent";
import LazyLoadingImageComponent from "../../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import { images } from "../../../../constants";

const LoginForm = ({
  content,
  selectedLanguage,
  validation,
  validated,
  isPasswordShow,
  password,
  setPassword,
  handlePasswordShow,
  handleRoleChange,
  selectedRole,
  roles,
  handleSignIn,
  isLoading,
  FaEye,
  FaEyeSlash,
  logo,
  rolesMap,
  isLoadinRoles,
  isOwner,
  email,
  isParentDomain,
}) => {
  return (
    <React.Fragment>
      <div
        className="col-md-6 m-auto border-lg-screen rounded-lg-screen shadow-lg-screen"
        style={{
          opacity: !isOwner && "0.7",
          pointerEvents: !isOwner && "none",
        }}
      >
        <div className="py-lg-5">
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
              // src={logo}
              src={images.SBJFullLogo}
              height={"50vw"}
              style={{
                filter: "drop-shadow(2px 4px 6px rgba(40, 167, 69, 0.25))",
                pointerEvents: "none",
              }}
              alt={"logo"}
            /> */}

            <h3 class="display-5 text-center">
              {useContent("SignIn", "nf SignIn")}
            </h3>
          </div>
          <p
            className="text-muted mb-4 text-center"
            style={{ letterSpacing: ".1rem" }}
          >
            {" "}
            {useContent("SignInMessage", "nf SignInMessage")}
          </p>
          <div className="login d-flex align-items-center">
            <div className="container">
              <div className="row">
                <div className="col-lg-12 mx-auto">
                  {/* FORM */}
                  <form className={validation} validated={validated}>
                    <div className="col-lg-8 mx-auto">
                      <label htmlFor="email" id="email">
                        {useContent("EmailAddress", "nf EmailAddress")}:
                      </label>
                      <div className="mb-3 opacity-75">{email}</div>
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
                            <i className="fa fa-lock text-muted"></i>
                          </span>
                        </div>
                        <input
                          id="password"
                          style={{ height: "32px", paddingLeft: "43px" }}
                          name="password"
                          type={isPasswordShow ? "text" : "password"}
                          placeholder={`${useContent(
                            "Password",
                            "nf Password"
                          )}`}
                          required
                          autoFocus
                          autoComplete
                          className={"form-control font-5"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        {/* HANDLE EYE ICONS FUNC */}
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
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "EnterCurrentPassword"
                            ) || {}
                          ).mvalue || "nf Please enter password"}
                        </div>

                        {/* ROLE SELECT */}
                        <div className="mt-3 d-none">
                          <div>
                            <label htmlFor="role" id="role">
                              {(() => {
                                const label =
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "Role"
                                    ) || {}
                                  ).mvalue || "nf Select a role*";
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
                          </div>
                          {isLoadinRoles ? (
                            <React.Fragment>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                style={{ color: "var(--primary-color)" }}
                                role="status"
                                aria-hidden="true"
                              ></span>
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              <select
                                onChange={handleRoleChange}
                                value={selectedRole}
                                required
                                className="form-select font-5 mb-2"
                                style={{
                                  pointerEvents:
                                    rolesMap?.length >= 0 && "none",
                                  opacity: "0.7",
                                }}
                                aria-label="Default select example"
                              >
                                {rolesMap.map((role, index) => {
                                  if (
                                    role.active === "Yes" &&
                                    role.mlanguage === selectedLanguage
                                  ) {
                                    return (
                                      <option key={index} value={role.roleName}>
                                        {role?.label}
                                      </option>
                                    );
                                  }
                                  return null;
                                })}
                              </select>
                            </React.Fragment>
                          )}
                        </div>
                        {/* ROLE INPUT */}
                        <div className={`mt-3 ${isParentDomain && "d-none"}`}>
                          <div>
                            <label htmlFor="role" id="role">
                              {(() => {
                                const label =
                                  (
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "RoleLabel"
                                    ) || {}
                                  ).mvalue || "nf Role*";
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
                          </div>
                          <input
                            id="userRole"
                            style={{
                              height: "32px",
                              paddingLeft: "43px",
                              opacity: "0.7",
                            }}
                            name="role"
                            type="text"
                            placeholder={`${useContent(
                              "SkillOwner",
                              "nf SkillOwner"
                            )}`}
                            required
                            autoFocus
                            className={"form-control font-5"}
                            value={useContent("SkillOwner", "nf SkillOwner")}
                            readOnly
                          />
                        </div>

                        {/* FORGOT PASSWORD REDIRECT */}
                        <div className="d-block d-md-flex justify-content-between mt-2">
                          <div className="links">
                            <Link to="/forgotpassword" className="ml-2">
                              {" "}
                              {useContent(
                                "ForgotPasswordLable",
                                "nf Forgot Password"
                              )}
                              ?
                            </Link>
                          </div>
                        </div>

                        {/* SIGNIN BUTTON */}
                        <div className="d-flex align-items-center justify-content-end mt-3">
                          <SuccessBtn
                            onClick={handleSignIn}
                            isLoading={isLoading}
                            label={useContent("SignIn", "nf SignIn")}
                            disable={!isOwner}
                            isLargebtn={true}
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
    </React.Fragment>
  );
};

export default LoginForm;
