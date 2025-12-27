import React from "react";
import Footer from "../../../components/Footer";
import AuthenicationBanner from "./AuthenicationBanner";

const SkillOwnerAuthenticationTemplate = ({ children }) => {
  return (
    <main className="d-flex so-auth-main" style={{ height: "100%" }}>
      <AuthenicationBanner />
      {children}
      <Footer />
    </main>
  );
};

export default SkillOwnerAuthenticationTemplate;
