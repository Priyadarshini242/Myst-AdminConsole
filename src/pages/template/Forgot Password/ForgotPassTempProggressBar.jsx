import React from "react";

const ForgotPassTempProggressBar = ({ steps }) => {
  return (
    <div className="col-lg-12 mx-auto d-lg-block d-none">
      <div className="progress-track">
        <ul id="progressbar">
          <li className="step0 active" id="step1"></li>
          <li
            className={`step0 active text-right`}
            id="step2"
          ></li>
          <li
            className={`step0 active text-right`}
            id="step3"
          ></li>
          <li
            className={`step0 ${steps.step1 ? "active" : ""}  text-right`}
            id="step4"
          ></li>
        </ul>
      </div>
    </div>
  );
};

export default ForgotPassTempProggressBar;
