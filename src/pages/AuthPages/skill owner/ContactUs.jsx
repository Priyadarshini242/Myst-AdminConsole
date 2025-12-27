import React, { useCallback, useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PostApi from "../../../api/PostData/PostApi";
import ActionButton from "../../../components/atoms/Buttons/ActionButton";
import isValidEmail from "../../../components/SkillOwner/HelperFunction/isValidEmail";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import useContentLabel from "../../../hooks/useContentLabel";
import SoAuthFormContainer from "./SoAuthFormContainer";
import useGoogleRecaptcha from "../Captcha Integration/useGoogleRecaptcha";
import ReCAPTCHA from "react-google-recaptcha";
import { VAR_1 } from "../../../config/Properties";
import { getCookie } from '../../../config/cookieService';


const ContactUs = () => {
  /* HOOKS */
  const contentLabel = useContentLabel();
  const navigate = useNavigate();
  //google recaptcha hook

  const { captchaToken, recaptchaRef, handleTokenChange, resetRecaptcha } = useGoogleRecaptcha(VAR_1);
  const homeLang = getCookie("HLang") || "EN-US";

  const initialData = useMemo(
    () => ({
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      description: "",
    }),
    []
  );

  const [contactForm, setContactForm] = useState(initialData);

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value,
    });
  };

  /* VALIDATION OF FORM */
  const formvalidation = useCallback(() => {
    const { firstName, lastName, email, subject, description } = contactForm;

    if (!firstName || !lastName || !email || !subject || !description) {
      return contentLabel(
        "PleaseFillAllRequiredFields",
        "nf Please Fill All Required Fields"
      );
    }

    if (!isValidEmail(email)) {
      return contentLabel(
        "EnterValidEmail",
        "nf Please enter a valid email address"
      );
    }

    if (description?.length > 1000) {
      return contentLabel(
        "DescErrMsg",
        "nf Description should not exceed 1000 characters"
      );
    }

    return null;
  }, [contactForm, contentLabel]);

  const handleSubmitDetail = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitted(true);

      const error = formvalidation();
      if (error) {
        showErrorToast(error);
        setIsSubmitted(false);
        return;
      }

      if (captchaToken === null) {
        showErrorToast("Captcha Required");
        setIsSubmitted(false);
        return;
      }

      const payload = {
        chToken: captchaToken ? captchaToken : "",
        firstName: contactForm.firstName?.trim(),
        lastName: contactForm.lastName?.trim(),
        userEmail: contactForm.email?.trim(),
        emailDestination: "info@skillsbasedjobs.global",
        subject: contactForm.subject?.trim(),
        description: contactForm.description,
        mlanguage: homeLang,
      };
      try {
        const res = await PostApi("Support", payload);
        if (res?.status === 200) {
          showSuccessToast(
            contentLabel("ContactFormSuccessMsg", "nf Email sent successfully")
          );
          setContactForm(initialData);
        }
      } catch (error) {
        if (error instanceof TypeError) {
          console.error("Type error occured", error?.message);
        } else if (error instanceof ReferenceError) {
          console.error("Reference error occured", error?.message);
        } else {
          console.error("Error submitting contact form", error);
          showErrorToast(
            contentLabel("SomethingWentWrong", "nf Something Went Wrong")
          );
        }
      } finally {
        setIsSubmitted(false);
        resetRecaptcha();
      }
    },
    [
      contactForm,
      contentLabel,
      formvalidation,
      homeLang,
      initialData,
      captchaToken,
      resetRecaptcha,
    ]
  );

  const handleRedirectToInit = useCallback(() => {
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
  }, [navigate]);

  return (
    <SoAuthFormContainer>
      <div>
        <div>
          <h1 className="so-form-login-font">
            {contentLabel("ContactUs", "nf Contact Us")}
          </h1>
        </div>
        <form>
          <div className="so-form-grids">
            <Row>
              <Col lg={6} xs={12} className="contact-form-grid">
                <label
                  htmlFor="firstName"
                  className="d-block w-100 position-relative text-start"
                >
                  <span className="so-login-from-label-email">
                    {contentLabel("FirstName", "nf First Name")}*
                  </span>
                  <span className="so-form-login-input-wrapper">
                    <input
                      type={"text"}
                      id="firstName"
                      name="firstName"
                      value={contactForm.firstName}
                      onChange={handleInputChange}
                    />
                  </span>
                </label>
              </Col>
              <Col lg={6} xs={12}>
                <label
                  htmlFor="lastName"
                  className="d-block w-100 position-relative text-start"
                >
                  <span className="so-login-from-label-email">
                    {contentLabel("LastName", "nf Last Name")}*
                  </span>
                  <span className="so-form-login-input-wrapper">
                    <input
                      type={"text"}
                      id="lastName"
                      name="lastName"
                      value={contactForm.lastName}
                      onChange={handleInputChange}
                    />
                  </span>
                </label>
              </Col>
            </Row>

            {/* <Row>
              <Col lg={6} xs={12} className="contact-form-grid"> */}
            <label
              htmlFor="email"
              className="d-block w-100 position-relative text-start"
            >
              <span className="so-login-from-label-email">
                {contentLabel("Email", "nf Email")}*
              </span>
              <span className="so-form-login-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                />
              </span>
            </label>
            {/* </Col> */}
            {/* <Col lg={6} xs={12}> */}
            <label
              htmlFor="subject"
              className="d-block w-100 position-relative text-start"
            >
              <span className="so-login-from-label-email">
                {contentLabel("Subject", "nf Subject")}*
              </span>
              <span className="so-form-login-input-wrapper">
                <input
                  type={"text"}
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                />
              </span>
            </label>
            {/* </Col>
            </Row> */}

            <label
              htmlFor="description"
              className="d-block w-100 position-relative text-start"
            >
              <span className="so-login-from-label-email">
                {contentLabel("Description", "nf Description")}*
              </span>
              <textarea
                type={"text"}
                id="description"
                name="description"
                className="w-100 contactus-text-area-desc"
                rows={5}
                value={contactForm.description}
                onChange={handleInputChange}
              />
              <Col className="text-secondary text-muted text-end w-100">
                {1000 -
                  (contactForm.description
                    ? contactForm.description?.length
                    : 0)}
              </Col>
            </label>

            <div className="so-form-button-text">
              <div className="w-100">
                <ReCAPTCHA
                  ref={recaptchaRef} // Reference to ReCAPTCHA component
                  sitekey={VAR_1} // Google reCAPTCHA site key
                  onChange={handleTokenChange} // Handle token change
                  onExpired={resetRecaptcha} // Automatically reset on expiration
                />
              </div>
            </div>
            <div className="so-form-button-text">
              <ActionButton
                label={contentLabel("Submit", "nf Submit")}
                disabled={isSubmitted || captchaToken === null}
                onClick={handleSubmitDetail}
              />
            </div>
          </div>
        </form>
      </div>

      {/* LOGIN WITH DIFF USER */}
      <div className="card-bottom-so-container">
        <div style={{ flex: "1 1 0", display: "inline-block" }}>
          <button onClick={handleRedirectToInit}>
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

export default ContactUs;
