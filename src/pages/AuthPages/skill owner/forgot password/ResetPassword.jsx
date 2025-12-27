import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ForgotPasswordTokenCheckApi,
  ForgotPasswordUpdateApi,
} from "../../../../api/auth/ForgotPasswordApi";
import ActionButton from "../../../../components/atoms/Buttons/ActionButton";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { icons } from "../../../../constants";
import useContentLabel from "../../../../hooks/useContentLabel";
import Unauthorized from "../error pages/Unauthorized";
import SoAuthFormContainer from "../SoAuthFormContainer";
import CustomTooltip from "../../../../components/atoms/tooltip/CustomTooltip";

const ResetPassword = () => {
  const { id } = useParams();
  const contentLabel = useContentLabel();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValidErrMsg, setTokenValidErrMsg] = useState("");
  const [isExpired, setIsExpired] = useState(true);
  const [isInitLoading, setIsInItLoading] = useState(true);
  const [isNewPasswordShow, setIsNewPasswordShow] = useState(false);
  const [isConfirmPasswordShow, setIsConfirmPasswordShow] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
          contentLabel(
            "MissingMandatoryFields",
            "nf Mandatory fields cannot be empty"
          )
        );
        return;
      }

      /* CHECK FOR 8 CHARACTERS */
      if (newPassword.length && newPassword.length < 8) {
        setIsLoading(false);
        showErrorToast(
          contentLabel(
            "PasswordMustBeAtleastCharactersLong",
            "nf Password must atleast 8 characters long"
          )
        );
        return;
      }

      const passwordRegExp =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegExp.test(newPassword)) {
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
      if (newPassword !== confirmNewPassword) {
        showErrorToast(
          contentLabel(
            "ConfirmPasswordNotMatchNewPassword",
            "nf Confirm password should match new password!"
          )
        );
        setIsLoading(false);
        return;
      }

      if (tokenValidErrMsg && !isExpired) {
        showErrorToast(contentLabel("tokenValidErrMsg", "nf Invalid token!"));
        return;
      }

      const _ = e.currentTarget;
      if (_.checkValidity() === false) {
        e.stopPropagation();
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
          /* RESET THE FIELDS */
          setNewPassword("");
          setConfirmNewPassword("");
          navigate("/skill-owner/email");
          showSuccessToast(
            contentLabel(
              "PasswordResetSuccessfully",
              "nf Password reset successfully"
            )
          );
        } else if (res?.data === "error") {
          setIsLoading(false);
        }
      } catch (error) {
        showErrorToast(
          contentLabel("SomethingWentWrong", "nf Something went wrong")
        );
        if (error instanceof TypeError) {
          console.error("Type error occured: ", error.message);
        } else if (error instanceof ReferenceError) {
          console.error("Reference error occured: ", error.message);
        } else {
          console.error("Error changing password: ", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      newPassword,
      confirmNewPassword,
      id,
      tokenValidErrMsg,
      isExpired,
      contentLabel,
      navigate,
    ]
  );

  const handleNewPasswordShow = () => {
    setIsNewPasswordShow(!isNewPasswordShow);
  };

  const handleConfirmPassShow = () => {
    setIsConfirmPasswordShow(!isConfirmPasswordShow);
  };

  /* CHECKS FOR PASSWORD TOOLTIP */
  const hasMinLimit = newPassword?.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);

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
      label: contentLabel("MinimumCharacter", "nf Minimum 8 Character"),
      valid: hasMinLimit,
    },
  ];

  if (!isExpired) {
    return (
      <Unauthorized
        message={contentLabel("tokenValidErrMsg", "Invalid token")}
      />
    );
  }

  return (
    <SoAuthFormContainer>
      <div className={isInitLoading && "opacity-50 pe-none"}>
        <div>
          <h1 className="so-form-login-font">
            {contentLabel("ResetYourPassword", "nf ResetYourPassword")},
          </h1>
          <p className="so-form-note-font">
            {contentLabel(
              "EnterNewCredentials",
              "nf Enter your new credentials!"
            )}
          </p>
        </div>
        <form>
          <div className="so-form-grids">
            {/* NEW PASSWORD INPUT */}
            <label
              htmlFor="newPassword"
              className="d-block w-100 position-relative text-start"
            >
              <span className="so-login-from-label-email">
                {contentLabel("NewPassword", "nf New Password")}
              </span>

              <CustomTooltip
                open={showTooltip && newPassword?.length > 0}
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setShowTooltip(true)}
                    onBlur={() => setShowTooltip(false)}
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
              </span>
              <span className="so-form-login-input-wrapper">
                <input
                  type={isConfirmPasswordShow ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
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
            <div className="so-form-button-text">
              <ActionButton
                label={contentLabel("Reset", "nf Reset")}
                disabled={isLoading}
                onClick={handleSubmitForgotPassword}
              />
            </div>
          </div>
        </form>
      </div>
    </SoAuthFormContainer>
  );
};

export default ResetPassword;
