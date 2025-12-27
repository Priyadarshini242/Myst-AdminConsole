import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordApi } from "../../../../api/auth/ForgotPasswordApi";
import { getUserExistenceDetail } from "../../../../api/auth/getUserExistenceDetail";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import useContentLabel from "../../../../hooks/useContentLabel";
import SoAuthFormContainer from "../SoAuthFormContainer";
import ActionButton from "../../../../components/atoms/Buttons/ActionButton";
import { getCookie } from '../../../../config/cookieService';
import LogoLoader from "../../../../components/LogoLoader";


const ForgotPassword = () => {
  const contentLabel = useContentLabel();

  const email =  getCookie("auth_key");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [count, setCount] = useState(15);
  const navigate = useNavigate();

  /* HANDLE EMAIL FOR FORGOT PASSWORD TO SEND LINK */
  const handleForgotPasswordEmailSubmit = async (e) => {
    /* PREVENT BROWSER DEFAULT BEHAVIOR NOTE: ADDED THIS TO AVOID PAGE UNNECESSARY RELOAD */
    e.preventDefault();

    /* EMAIL FORMAT */
    const emailRegX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.length) {
      showErrorToast(contentLabel("EnterEmail", "nf Please Enter Email"));
      setIsLoading(false);
      return;
    } else if (!emailRegX.test(email)) {
      setIsLoading(false);
      showErrorToast(
        contentLabel("EnterValidEmail", "nf Please enter a valid email")
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
        showErrorToast(contentLabel("AccountNotExist", "nf Account Not Exist"));
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
      if (res?.status === 200) {
        setIsEmailSent(true);
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
        console.error(
          "Error occured while checking email for Forgot password: ",
          error.message
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isEmailSent && count > 0) {
      const timer = setTimeout(() => {
        setCount((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (count === 0) {
      navigate("/skill-owner/email");
      setIsEmailSent(false);
    }
  }, [count, isEmailSent, navigate]);

  const handleNavigateToInit = () => {
    // navigate("/skill-owner/email");
    if (sessionStorage?.getItem('prevSite') === 'skill-owner') {
      navigate("/skill-owner/email");
    } else if (sessionStorage?.getItem('prevSite') === 'services') {
      navigate("/services/email");
    } else if (sessionStorage?.getItem('prevSite') === 'sso') {
      navigate("/sso/authorize");
    }
    else {
      navigate(-1)
    }
  };

  return (
    <SoAuthFormContainer>
      {isLoading && <LogoLoader />}
      
      {isEmailSent ? (
        <>
          <p className="so-form-note-font">
            {contentLabel(
              "ResetPasswordLinkSent",
              "nf Reset password link has been sent to your email. Please use that link to continue!"
            )}
          </p>
          <p className="so-form-note-font">
            {`${contentLabel(
              "RedirectingToLoginPage",
              "nf Redirecting you to login page in"
            )} ${count}.`}
          </p>
        </>
      ) : (
        <>
          <div>
            <h1 className="so-form-login-font">
              {contentLabel("Hello", "nf Hello")}
            </h1>
            <p className="so-form-note-font">
              {`${email},
            ${contentLabel(
              "ShallWeSendPassResetEmail",
              "nf Shall we send the password reset link to you?"
            )}`}
            </p>
          </div>
          <form>
            <div className="so-form-grids">
              <div className="so-form-button-text">
                <ActionButton
                  label={contentLabel("EmailMe", "nf Email me")}
                  disabled={isLoading}
                  onClick={handleForgotPasswordEmailSubmit}
                />
              </div>
            </div>
          </form>
        </>
      )}
      {/* LOGIN WITH DIFF USER */}
      <div className="card-bottom-so-container">
        <div style={{ flex: "1 1 0", display: "inline-block" }}>
          <button onClick={handleNavigateToInit}>
            {contentLabel(
              "LoginWithDiffUser",
              "nf Log in with a different user"
            )}
          </button>
        </div>
      </div>
    </SoAuthFormContainer>
  );
};

export default ForgotPassword;
