import React, { useEffect, useState } from 'react'
import SoAuthFormContainer from './SoAuthFormContainer';
import useContentLabel from '../../../hooks/useContentLabel';
import { showSuccessToast } from '../../../components/ToastNotification/showSuccessToast';
import { TriggerOtp } from '../../../api/auth/TriggerOtp';
import { encryptData } from '../../../config/encrypt/encryptData';
import { useSelector } from 'react-redux';
import ActionButton from '../../../components/atoms/Buttons/ActionButton';
import { getCookie } from '../../../config/cookieService';
import { useNavigate } from 'react-router-dom';
import LogoLoader from '../../../components/LogoLoader';

const EmailNotFound = () => {
    // CONTENT LABEL
    const contentLabel = useContentLabel()
    const navigate = useNavigate()

    // STORE IMPORTS
    const enableFlags = useSelector((state) => state?.EnableFlagsSlice);

    // COMPONENT STATES
    const [isLoading, setIsLoading] = useState(false);
    const email = getCookie("auth_key");

    /* THIS PROCESS IS HANDLE IN SIGNUP TOO, MAKE SURE TO CONSIDER */
  const { host } = window.location;
  const domainParts = host.split(".");
  const isProdEnvironment = host.includes("www.myskillstree.com");
  const hasPrefixBeforeProd = domainParts.indexOf("prod") > 0;
  const isAuthorized =
    host.includes("localhost") ||
    host.includes("parent") ||
    host.includes("Parent") ||
    host.includes("Owners") ||
    host.includes("owners") ||
    host.includes("dev") ||
    host.includes("tcs") ||
    host.includes("stg") ||

    (isProdEnvironment && !hasPrefixBeforeProd);

    // HANDLE NEW EMAIL SUBMIT
    const handleEmailSubmit = () => {
        setIsLoading(true)
        if (enableFlags?.flags?.signupEmailVerification) {
            //  call api to trigger otp
            TriggerOtp(encryptData(email), "Email")
                .then((res) => {
                    console.log("res", res);
                })
                .catch((error) => {
                    console.log("error", error);
                });
        }
        showSuccessToast(contentLabel('EmailSent', 'nf Email sent successfully'));
        isAuthorized ? navigate("/signup") : navigate("/unauthorized");
        setIsLoading(false)
    }

    const handleRedirectToLogin = () => {
        navigate("/skill-owner/email");
    };

      useEffect(() => { 
          if (!email) {
            navigate("/skill-owner/email");
          }
      }, [email, navigate]);

    return (
        <SoAuthFormContainer>
            {isLoading && <LogoLoader />}
            
            <div>
                <div>
                    <h1 className="so-form-note-font">
                       {email ? email : ""} 
                    </h1>
                    <p className="so-form-note-font">{contentLabel("NoAccountFound", "No Account Found")}</p>
                </div>
                <p className=" text-center mt-2">
                    {contentLabel('RegisterAsNewOwner', 'nf Do you wish to register as a new skill owner?')}
                </p>
            </div>




                      <div className="so-form-button-text">
                <ActionButton
                    label={contentLabel("SignUp", "nf SignUp")}
                    disabled={isLoading || !email?.length}
                    onClick={handleEmailSubmit}
                />
            </div>

            <div className='text-center mt-3 mb-1'>{contentLabel('Or', 'nf Or')}</div>

            {/* LOGIN WITH DIFF USER */}
            <div className="card-bottom-so-container m-0 p-0">
                <div style={{ flex: "1 1 0", display: "inline-block" }}>
                    <button onClick={handleRedirectToLogin}>
                        {contentLabel(
                            "LoginWithDiffUser",
                            "nf Log in with a different user"
                        )}
                    </button>
                </div>
            </div>

        </SoAuthFormContainer>
    );
}

export default EmailNotFound
