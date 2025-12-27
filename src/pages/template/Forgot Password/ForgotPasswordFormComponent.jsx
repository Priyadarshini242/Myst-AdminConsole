import React from "react";
import { useSelector } from "react-redux";
import LazyLoadingImageComponent from "../../../components/Lazy Loading Images/LazyLoadingImageComponent";

const ForgotPasswordFormComponent = ({
  logo,
  validated,
  handleSubmitForgotPassword,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  isLoading,
}) => {
  /* STORE IMPORTS */
  const { language: selectedLanguage, content } = useSelector((state) => state);

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-lg-12 mx-auto">
          <div className="d-flex flex-column justify-content-center align-items-center gap-2">
            <LazyLoadingImageComponent
              src={logo}
              height={"50px"}
              style={{
                filter: "drop-shadow(2px 4px 6px rgba(40, 167, 69, 0.25))",
              }}
              alt={"logo"}
              className={""}
            />

            <h3 className="display-5 text-center">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "ResetYourPassword"
                ) || {}
              ).mvalue || "nf Reset Your Password"}
            </h3>
          </div>
          <div className=" px-4 mb-4">
            <p
              className="text-muted mb-2 text-center"
              style={{ letterSpacing: ".06rem" }}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "EnterPasswordNotUsedBefore"
                ) || {}
              ).mvalue || "nf Enter a password you haven't used before"}
            </p>
          </div>
          <form onSubmit={handleSubmitForgotPassword}>
            <div className="d-flex px-4 flex-column justify-content-center align-items-center gap-2 mb-3">
              <div className="form-group mb-3" style={{ position: "relative" }}>
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
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder={"Enter new password"}
                  required
                  className="form-control font-5 px-5"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="form-group mb-3" style={{ position: "relative" }}>
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
                  id="confirmNewPasswordconfirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  placeholder={"Confrim password"}
                  required
                  className="form-control font-5 px-5"
                  minLength={8}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>

              <button
                id="signInBtn"
                type="submit"
                className={`btn col-2 btn-block my-0 rounded-pill shadow-sm text-white py-1 ${
                  isLoading && "btn-loading"
                }`}
                style={{
                  backgroundColor:
                    (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "var(--primary-color)"
                      ) || {}
                    ).mvalue || "#FFEA00",
                  color:
                    (
                      content[selectedLanguage]?.find(
                        (item) =>
                          item.elementLabel === "SecondaryButtonOnFontColor"
                      ) || {}
                    ).mvalue || "#000",
                  direction:
                    (
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Direction"
                      ) || {}
                    ).mvalue || "ltr",
                }}
                disabled={isLoading}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Next"
                  ) || {}
                ).mvalue || "nf Next"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordFormComponent;
