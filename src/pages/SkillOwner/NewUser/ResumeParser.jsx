import React, { useEffect, useRef, useState } from "react";
import FileUpload from "./components/FileUpload";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/Navbar";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ResumeResults from "./ResumeResults";

const ResumeParser = () => {
  const navbarRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);

  // const[resumeParsed,setResumeParsed] = useState(false)

  const handlePdf = () => {
    window.print();
  };
  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  useEffect(() => {
    const resumeData = JSON.parse(sessionStorage.getItem("resumeData"));
    setResumeData(resumeData?.Value?.ResumeData);
  }, [sessionStorage.getItem("resumeData")]);

  return (
    <>
      <FileUpload />
      <div
        className="d-flex w-100 gap-2   p-4 pt-2  justify-content-end bg-white"
        style={{ position: "fixed", bottom: "10px" }}
      >
        <button
          className="btn"
          style={{ backgroundColor: "var(--primary-color)", color: "white" }}
          onClick={() => navigate("/newuser/basicinfo")}
        >
          {(
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Skip"
            ) || {}
          ).mvalue || "nf Skip"}
        </button>
      </div>
    </>
  );
};

export default ResumeParser;
