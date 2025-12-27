import React, { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "../../../../components/Navbar";
import { useSelector } from "react-redux";
import { EditAccountDetails } from "../../../../api/editData/EditAccountDetails";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeScreenName } from "../../../../reducer/screen/screenNameSlice";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const NewUserDestinationScreen = () => {
  /* STORE IMPORTS */
  const { language: selectedLanguage, content } = useSelector((state) => state);

  /* NAVIGATE INIT */
  const navigate = useNavigate();
  /* USEREG */
  const navbarRef = useRef(null);
  /* DISPATCH INIT */
  const dispatch = useDispatch();
  /* JOB ID FROM LOCAL STORAGE */
  const jobId = sessionStorage.getItem("JD_ID");

  /* STATES INIT */
  const [screenName, setScreenName] = useState("MAIN");
  const [contentHeight, setContentHeight] = useState("100vh");

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  /* HANDLE UPDATE ACCOUNT DETAIL */
  const handleUpdateAccount = useCallback(async () => {
    try {
      const payload = {
        defaultView: screenName,
      };
      const res = await EditAccountDetails(
         getCookie("userName"),
        payload
      );
      dispatch(removeScreenName());
      showSuccessToast(res?.data?.message);
      if (jobId) {
        navigate(`/dashboard/jobview/${jobId}`);
      } else {
        navigate("/dashboard/skillprofile");
      }
    } catch (error) {
      if (error instanceof ReferenceError) {
        console.error("Reference error occurred: ", error?.message);
      } else if (error instanceof TypeError) {
        console.error("Type error occurred: ", error?.message);
      } else {
        console.error("Error occurred during update account: ", error);
      }
    }
  }, [screenName, navigate, dispatch, jobId]);

  return (
    <React.Fragment>
      <div ref={navbarRef}>
        <Navbar />
      </div>

      {/* CONTENT */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: contentHeight }}
      >
        <div style={{ textAlign: "center" }}>
          <div>
            <h3 style={{ fontWeight: "bolder", opacity: "0.85" }}>
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "MySTOnboard"
                ) || {}
              ).mvalue || "nf Now you've successfully onboarded to MyST"}
            </h3>
          </div>
          <div
            style={{ marginTop: "20px" }}
            className="fs-3 secondary-brown-text"
          >
            <p style={{ opacity: "0.8", fontWeight: "bold" }}>
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "WantToMoveToMyst"
                ) || {}
              ).mvalue || "nf Want to move to MyST Interface?"}
            </p>
          </div>
          <div
            className="d-flex justify-content-around align-items-center"
            style={{ marginTop: "30px" }}
          >
            {/* BACK BUTTON */}
            <button
              type="button"
              className="btn text-white font-5"
              style={{ backgroundColor: "var(--primary-color)" }}
              onClick={() => navigate("/newuser/linkskills")}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Back"
                ) || {}
              ).mvalue || "nf back"}
            </button>
            {/* OK BUTTON */}
            <button
              className="btn text-white font-5"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "white",
              }}
              onClick={handleUpdateAccount}
            >
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Yes"
                ) || {}
              ).mvalue || "nf Yes"}
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default NewUserDestinationScreen;
