import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import useContentLabel from "../../../hooks/useContentLabel";

const AuthPageFooter = () => {
  const contentLabel = useContentLabel();
  const location = useLocation()
  const navigate = useNavigate()
  const { hostname ,pathname } = window.location;
  const isPrivacyLinkWithDate =
    hostname.includes("localhost") ||
    hostname.includes("demo") ||
    hostname.includes("parent") ||
    hostname.includes("open") ||
    hostname.includes("Open") ||
    hostname.includes("Owners") ||
    hostname.includes("owners");

  return (
    <React.Fragment>
    {
      !pathname?.includes('info-support') &&
      <div className="so-form-login-footer mb-0">
        {contentLabel("NeedHelp?", "nf Need help?")}&nbsp;
        <div 
        // to={"/info-support"} 
        style={{color:'var(--primary-color)'}} 
        onClick={()=>{
            if (location?.pathname?.includes('skill-owner')) {
              sessionStorage.setItem('prevSite', 'skill-owner')
            }
            else if (location?.pathname?.includes('services')) {
              sessionStorage.setItem('prevSite', 'services')
            }
            else if (location?.pathname?.includes('sso')) {
              sessionStorage.setItem('prevSite', 'sso')
            }
            else {
              sessionStorage.setItem('prevSite', 'skill-owner')
            }
            navigate('/info-support')
          }} 
          
        >
          {contentLabel("ContactUs", "nf Contact Us")}
        </div>
      </div>
    }
      <div className="so-form-login-footer">
        {!isPrivacyLinkWithDate ? (
          <>
            <a
              // to={"/privacy-policy"}
              className="ms-2 links-color-so"
              href="https://www.skillsbasedjobs.global/#/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {contentLabel("PrivacyPolicyLink", "nf PrivacyPolicyLink")}
            </a>
            &nbsp;
            {contentLabel("and", "nf and")}&nbsp;
            <a
              //  to={"/terms&conditions"}
              className="links-color-so"
              href="https://www.skillsbasedjobs.global/#/terms&conditions"
              target="_blank"
              rel="noopener noreferrer"
            >
              {contentLabel("TermsOfServiceLink", "nf TermsOfServiceLink")}
            </a>
            &nbsp;
            {contentLabel("used", "nf used")}
          </>
        ) : (
          <>
            <a
              // to={"/terms&conditions"}
              className="links-color-so"
              href="https://www.skillsbasedjobs.global/#/terms&conditions"
              target="_blank"
              rel="noopener noreferrer"
            >
              {contentLabel("TermsAndConditions", "nf Terms and Conditions")}
            </a>
            &nbsp;
            {contentLabel("and", "nf and")}&nbsp;
            <a
              // to={"/privacy-policy"}
              className="links-color-so"
              href="https://www.skillsbasedjobs.global/#/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {contentLabel("PrivacyPolicyLink", "nf PrivacyPolicyLink")}
            </a>
            &nbsp;
            {contentLabel(
              "HaveBeenUpdatedAsDate",
              "nf have been updated as of 6th January 2025 - please see the links T&C, Privacy and Cookie Policies"
            )}
          </>
        )}
      </div>
     
      <div
        className="so-form-login-footer"
        dangerouslySetInnerHTML={{
          __html: contentLabel(
            "GoogleTermsAndPolicy",
            "nf This site is protected by reCAPTCHA Enterprise. #{1} and #{2} apply."
          )
            ?.replace(
              "#{1}",
              `<a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" class="links-color-so">
               &nbsp;${contentLabel("GooglePrivacyPolicy", "nf Privacy Policy")}&nbsp;
        </a>`
            )
            ?.replace(
              "#{2}",
              `<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" class="links-color-so">
              &nbsp;${contentLabel("GoogleTerms", "nf Google Terms")}&nbsp;
        </a>`
            ),
        }}
      />
    </React.Fragment>
  );
};

export default AuthPageFooter;
