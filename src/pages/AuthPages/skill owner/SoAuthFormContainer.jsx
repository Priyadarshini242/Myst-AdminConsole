import React from "react";
import { Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { images } from "../../../constants";
import AuthPageFooter from "./AuthPageFooter";
import LanguageComponentSOLogin from "./LanguageComponentSOLogin";
import SkillOwnerAuthenticationTemplate from "./SkillOwnerAuthenticationTemplate";

const SoAuthFormContainer = ({ children }) => {
  return (
    <SkillOwnerAuthenticationTemplate>
      <section className="so-login-right-side-container">
        <article className="d-flex flex-wrap flex-column justify-content-center form-container-so-login-container">
          <div className="form-container-so-login">
            <Link
              to={"#"}
              className={`
              d-flex justify-content-center pe-none mt-2`}
              // login-grid-brand-logo 
            >
              <span>
                <img
                  src={images.SBJFullLogo}
                  alt="Brand logo"
                  style={{ 
                    width: "18rem" , 
                    objectFit:'contain' 
                    }}
                />
              </span>
            </Link>
            <div className="form-section-so">
              <div className="form-section-so-content">
                <div className="d-flex justify-content-center">
                  <div className="so-login-card">
                    <div className="so-login-card-container">
                      <div className="so-login-card-box">
                        <div className="so-login-form-grid">{children}</div>
                      </div>
                    </div>

                    {/* LANUGAGE CONTENT */}
                    <Col
                      xl={4}
                      lg={4}
                      md={5}
                      sm={12}
                      xs={12}
                      className="so-form-language"
                    >
                      <LanguageComponentSOLogin />
                    </Col>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <AuthPageFooter />
        </article>
      </section>
    </SkillOwnerAuthenticationTemplate>
  );
};

export default SoAuthFormContainer;
