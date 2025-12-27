import React from "react";
import Footer from "../components/Footer";
import useContentLabel from "../hooks/useContentLabel";

const NotFound = () => {
  const contentLabel = useContentLabel();
  return (
    <div>
      <div class="d-flex align-items-center justify-content-center mt-5  ">
        <div class="text-center">
          <h1 class="display-1 fw-bold">404</h1>
          <p class="fs-3">
            {" "}
            <span class="secondary-brown-text">Opps!</span> {contentLabel('PageNotFound', 'nf Page not found')}.
          </p>
          <p class="lead">{contentLabel('PageNotFoundMsg', 'nf The page you’re looking for doesn’t exist.')}</p>
          <button
            type="button"
            className="btn text-white font-5"
            style={{ backgroundColor: "var(--primary-color)" }}
            onClick={() => window.history.back()}
          >
            {contentLabel('GoBack', 'nf Go Back')}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotFound;
