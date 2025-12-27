import React from "react";
import { images } from "../../../constants";

const AuthenicationBanner = () => {
  return (
    <section
      className="d-flex flex-column justify-content-center align-items-center position-relative d-none d-lg-block so-banner-container"
      style={{
        backgroundColor: "var(--banner-bg-color)",
        flex: 1,
        height: "100vh",
      }}
    >
      <article style={{ width: "100%", height: "100%" }}>
        <img
          src={images.BannerImage}
          alt="banner"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </article>
    </section>
  );
};

export default AuthenicationBanner;
