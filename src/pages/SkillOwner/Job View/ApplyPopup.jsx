import { getCookie } from '../../../config/cookieService';
import React, { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "./ApplyPopup.css";
import useContent from "../../../hooks/useContent";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import { FaStar } from "react-icons/fa";
import { BASE_URL } from "../../../config/Properties";
import axios from "axios";
import { SiTicktick } from "react-icons/si";
import { TiTick } from "react-icons/ti";
import { BsCheckCircleFill, BsTypeH1 } from "react-icons/bs";
import { useSelector } from "react-redux";
import PostApi from "../../../api/PostData/PostApi";
import { formatExperience } from "../../../components/SkillOwner/HelperFunction/FormatExperience";
import useRemoveLocalStorage from "../../../hooks/useRemoveLocalStoreage";
import icons from "./../../../constants/icons";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import useContentLabel from "../../../hooks/useContentLabel";
import axiosInstance from '../../../api/axiosInstance';
const UserDetailsApi = async () => {
  const token = getCookie("token");
  const userName =  getCookie("userName");
  try {
    const response = await axiosInstance.get(
      `/skill/api/v1/skills/get-all-user-data/User_Details/${userName}?authToken=${token}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

const ApplyPopup = ({
  jobdata,
  allMandatorySkillsIncluded,
  allSkills,
  convertDaysMin,
  convertDays,
  isLoading,
  mergedSkills,
}) => {
  const [show, setShow] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [formState, setFormState] = useState({});
  const [preview, setPreview] = useState(false);
const contentLabel = useContentLabel();
  const previewButtonRef = useRef(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { language: selectedLanguage, content } = useSelector((state) => state);
  const handleCloseWarning = () => setShowWarning(false);
  const handleShowWarning = () => setShowWarning(true);
  const navBarBgColor = useContent("NavBarBgColor", "var(--primary-color)");
  const handleInputChange = (id, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  useEffect(() => {
    // console.log(jobdata)
  
   
  }, [jobdata])
  
  /* REMOVE LOCAL STORAGE */
  const removeLocalStorage = useRemoveLocalStorage();

  const validateRequiredFields = () => {
    return jobdata?.jdQuestionsList?.every((que) => {
      if (que.jdRequired) {
        return formState[que.id] && formState[que.id].trim() !== "";
      }
      return true;
    });
  };

  const handlePreview = () => {
    if (validateRequiredFields()) {
      setPreview(true);
    } else {
      showErrorToast("Please fill all required fields.");
    }
  };

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const data = await UserDetailsApi();
        setUserDetails(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (mergedSkills.length === 0) {
      console.log("No skills to post. Skipping JAnswers and JRSkills.");
      return;
    }

    setIsPosting(true);

    try {
      const currentUser = userDetails[0];
      const {
        firstName,
        lastName,
        email,
        mobileNumber: mobile,
        id,
      } = currentUser;

      const res = await PostApi("JResponse", {
        jid: jobdata.id,
        jdTitle:jobdata.title,
        firstName: firstName,
        lastName: lastName,
        emailAddress: email,
        jrPhone: mobile,
        mystProfile: id,
      });

      console.log("posted JResponse", res.data);

      const newId = res.data.id;

      // Only proceed to post answers and JRSkills if mergedSkills.length > 0
      if (mergedSkills.length > 0) {
        const jAnswersTable = [];

        const questions = jobdata?.jdQuestionsList?.filter(
          (skill) => skill?.id
        );
        const answers = formState;
        console.log("question", questions);

        if (questions && answers) {
          for (const que of questions) {
            const { id: questionId, jdType: questionType } = que;
            const answer = answers[questionId];

            if (answer) {
              const answerResponse = await PostApi("JAnswers", {
                jid: jobdata.id,
                qid: questionId,
                jrid: newId,
                "Question Type": questionType,
                jdAnswer: answer,
              });

              console.log(`Posted answer for question ${questionId}`);
              jAnswersTable.push(answerResponse.data);
            }
          }
        }

        console.log("Successfully posted to jAnswers table", jAnswersTable);

        const postJRSkillsPromises = mergedSkills.map(async (obj) => {
          console.log("obj", obj);
          try {
            const secondRes = await PostApi("JRSkills", {
              jid: jobdata.id,
              jrid: newId,
              skill: obj.skill,
              occupation: obj.occupation,
              skillOccupation: obj.skillOccupation,
              jdType: obj.yoePhase,
              expMax: obj.skillAppliedExp ? obj.skillAppliedExp : "0",
              expMin: obj.skillAcquiredExp ? obj.skillAcquiredExp : "0",
              expPhase: obj.yoePhase,
              topFive: obj.userRank <= 5 ? "yes" : "no",
              jdValidated: "no",
              userSkillsId: obj.id,
              jdMatch: obj.matchType,
            });

            console.log(
              "Successfully posted to JRskills table",
              secondRes.data
            );
          } catch (error) {
            console.error("Error posting JRSkills", error);
          }
        });

        await Promise.all(postJRSkillsPromises);
      }
      removeLocalStorage("Jlang", "JD_ID");
    } catch (err) {
      console.log(err);
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "SomethingWentWrong"
          ) || {}
        ).mvalue || "Something went wrong"
      );
      setIsPosting(false);
    }
  };

  const questions = jobdata?.jdQuestionsList?.filter((skill) => skill?.id);
  useEffect(() => {
    if (questions.length === 0) {
      previewButtonRef.current?.click();
    }
  }, [questions]);

  console.log("questions", questions);

  return (
    <>
      <a
        onClick={() => {
          if (!allMandatorySkillsIncluded) {
            handleShowWarning();
          } else {
            handleShow();
          }
        }}
        className="btn btn-block btn-primary btn-md hover"
        style={{
          backgroundColor: useContent("NavBarBgColor", "#28a745"),
          color: useContent("NavBarFontColor", "#fff"),
          border: "none",
          direction: useContent("Direction", "ltr"),
        }}
      >
        {useContent("ApplyNow", "nf Apply Now")}
      </a>

      <Modal show={showWarning} onHide={handleCloseWarning} centered>
        <Modal.Header closeButton>
          <Modal.Title>{useContent("Warning", "nf Warning")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {useContent(
            "YouDontHave",
            "nf You don't have the mandatory skills required for this opportunity. Would you wish to proceed with your application?"
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseWarning}>
            {useContent("Close", "nf Close")}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              handleCloseWarning();
              handleShow();
            }}
          >
            {useContent("Proceed", "nf Proceed")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={show}
        onHide={handleClose}
        size="xl"
        centered
        className="mt-3"
      >
        <Modal.Header closeButton className="custom-modal-header">
          {!preview && (
            <Modal.Title>
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Application"
                ) || {}
              ).mvalue || "nf Application"}
            </Modal.Title>
          )}
          {preview && (
            <Modal.Title>
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "ApplicationPreview"
                ) || {}
              ).mvalue || "nf Application Preview"}
            </Modal.Title>
          )}
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          {!preview &&
            jobdata?.jdQuestionsList
              ?.filter((que) => que?.label)
              ?.map((que) => {
                const options = (() => {
                  try {
                    return JSON.parse(que.jdvalues);
                  } catch (e) {
                    console.error("Invalid JSON in jdvalues:", que.jdvalues);
                    return [];
                  }
                })();

                return (
                  <div className="fs-6 mb-3 mt-3" key={que.id}>
                    <h6>
                      {que.label}{" "}
                      {que.jdRequired === "Yes" && (
                        <span style={{ color: "red" }}> *</span>
                      )}
                    </h6>

                    {(que.jdType === "Options" ||
                      que.jdType === "nf Options") && (
                      <div className="form-check">
                        {options.map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <input
                              className="form-check-input"
                              type="radio"
                              name={`optionGroup_${que.id}`}
                              id={`option_${que.id}_${optionIndex}`}
                              value={option}
                              checked={formState[que.id] === option}
                              onChange={(e) =>
                                handleInputChange(que.id, e.target.value)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`option_${que.id}_${optionIndex}`}
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {(que.jdType === "Text" || que.jdType === "nf Text") && (
                      <div className="form-group">
                        <textarea
                          className="form-control"
                          rows="3"
                          value={formState[que.id] || ""}
                          onChange={(e) =>
                            handleInputChange(que.id, e.target.value)
                          }
                        ></textarea>
                      </div>
                    )}

                    {(que.jdType === "Number" ||
                      que.jdType === "nf Number") && (
                      <div className="form-group w-25">
                        <input
                          type="number"
                          className="form-control"
                          value={formState[que.id] || ""}
                          onChange={(e) =>
                            handleInputChange(que.id, e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
          {preview && (
            <main className="row p-2">
              <section className="col-12">
                <section className="row">
                  <div class="col-12 text-center">
                    <h4 class="fw-bold">Job Application Preview</h4>
                    <h5 className="text-muted">{jobdata?.title}</h5>
                  </div>
                  <div className="row">
                    <div className="col-md-6 col-12 mt-2">
                      <label class="form-label fw-bold">First Name</label>
                      <div>
                        <h6>
                          {userDetails.map((user) => {
                            return <span>{user.firstName}</span>;
                          })}
                        </h6>
                      </div>
                    </div>
                    <div className="col-md-6 col-12 mt-2">
                      <label class="form-label" style={{ fontWeight: "bold" }}>
                        Last Name
                      </label>
                      <div>
                        <h6>
                          {userDetails.map((user) => {
                            return <span>{user.lastName}</span>;
                          })}
                        </h6>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-12 col-lg-6 col-12 mb-3">
                      <label
                        htmlFor="exampleFormControlInput1"
                        className="form-label"
                        style={{ fontWeight: "bold" }}
                      >
                        Email
                      </label>
                      <h6>
                        {userDetails
                          ?.filter(
                            (data) =>
                              data?.id ===
                             getCookie("userId")
                          )
                          ?.map((user, index) => (
                            <span key={index}>{user.email}</span>
                          ))}
                      </h6>
                    </div>

                    <div className="col-md-12 col-lg-6 col-12 mb-3">
                      <label
                        className="form-label"
                        style={{ fontWeight: "bold" }}
                      >
                        Mobile no.
                      </label>
                      <h6>
                        {userDetails.map((user, index) => (
                          <span key={index}>{user.mobileNumber}</span>
                        ))}
                      </h6>
                    </div>
                  </div>
                </section>
                <div className="row mt-5">
                  <div className="col-12">
                    <h6 className="fs-6 fw-bold">Matching Skills</h6>
                    <hr />
                  </div>
                  {/* TABLE VIEW */}
                  <div className="col-12">
                    <table className="table table-hover table-responsive table-bordered">
                      <thead>
                        <tr className="fw-bold">
                          <td>
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "MySkills"
                              ) || {}
                            ).mvalue || "nf Skills"}
                          </td>
                          <td>
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "RequiredExperience"
                              ) || {}
                            ).mvalue || "nf Required Experience"}
                          </td>
                          <td>
                            {(
                              content[selectedLanguage]?.find(
                                (item) =>
                                  item.elementLabel === "ActualExperience"
                              ) || {}
                            ).mvalue || "nf Actual Experience"}
                          </td>
                          <td>
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "MatchedSkill"
                              ) || {}
                            ).mvalue || "nf Matched Skills"}
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {jobdata?.jdSkillsList
                          ?.filter((skill) => skill?.skill)
                          ?.map((skill) => {
                            const skillInAllSkills = allSkills.find(
                              (item) => item.skill === skill.skill
                            );
                            const isSkillInAllSkills = !!skillInAllSkills;
                            const skillAppliedExp = skillInAllSkills
                              ? Number(skillInAllSkills.skillAppliedExp)
                              : 0;
                            const yoeMin = Number(skill.yoeMin);
                            const yoeMax = Number(skill.yoeMax);
                            const isExpInRange =
                              (yoeMin === 0 && yoeMax === 0) ||
                              (skillAppliedExp >= yoeMin &&
                                skillAppliedExp <= yoeMax);
                            const highlightGreen =
                              isSkillInAllSkills && isExpInRange;
                            const highlightYellow =
                              isSkillInAllSkills && !isExpInRange;

                            return (
                              <tr key={skill?.id}>
                                <td>{skill.skill}</td>
                                <td>
                                  {convertDaysMin(
                                    skill?.yoeMin,
                                    skill?.yoePhase
                                  )}{" "}
                                  -{" "}
                                  {convertDays(skill?.yoeMax, skill?.yoePhase)}
                                </td>
                                <td>
                                  {skillInAllSkills?.skillAppliedExp
                                    ? formatExperience(
                                        contentLabel,
                                        null,
                                        skillInAllSkills.skillAppliedExp
                                      )
                                    : 0}
                                </td>
                                <td>
                                  {(highlightGreen || highlightYellow) && (
                                    <div>
                                      <BsCheckCircleFill />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  {/* NOTE: THIS IS THE PORTION CONVERTED INTO THE TABLE ABOVE, PLEASE REMOVE IT WHEN TIME COMES */}
                  {/* <div className="col-12">
                  {jobdata?.jdSkillsList?.filter((skill) => skill?.skill)?.map((skill) => {
                    // .......
                    const skillInAllSkills = allSkills.find((item) => item.skill === skill.skill);
                    const isSkillInAllSkills = !!skillInAllSkills;
                    const skillAppliedExp = skillInAllSkills ? Number(skillInAllSkills.skillAppliedExp) : 0;
                    const yoeMin = Number(skill.yoeMin);
                    const yoeMax = Number(skill.yoeMax);
                    const isExpInRange = (yoeMin === 0 && yoeMax === 0) || (skillAppliedExp >= yoeMin && skillAppliedExp <= yoeMax);
                    const highlightGreen = isSkillInAllSkills && isExpInRange;
                    const highlightYellow = isSkillInAllSkills && !isExpInRange;

                    return (
                      <div
                        key={skill.id}
                        className={` mb-2 rounded  d-flex justify-content-start  "}`}
                        style={{ background: "none", color: "black" }}
                      >


                        <div className={`ms-2 ${isLoading ? "skeleton-loading" : ""}`}>
                          {skill.skill}
                        </div>
                        <div className={`ms-2 ${isLoading ? "skeleton-loading" : ""}`}>
                          {convertDaysMin(skill?.yoeMin, skill?.yoePhase)} -{" "}
                          {convertDays(skill?.yoeMax, skill?.yoePhase)}
                        </div>
                        {(highlightGreen || highlightYellow) && (
                          <div
                            className={`ms-2 fs-5 ${highlightGreen ? 'text-success' : highlightYellow ? 'text-warning' : ''}`}

                          >
                            <BsCheckCircleFill />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div> */}
                </div>

                <div className="row mt-5">
                  {questions.length !== 0 && (
                    <div className="col-12">
                      <h6 className="fs-6 fw-bold">Questions</h6>
                      <hr />
                    </div>
                  )}
                  <div className="col-12">
                    {jobdata?.jdQuestionsList
                      ?.filter((skill) => skill?.id)
                      ?.map((que) => {
                        return (
                          <div key={que.id} className="mb-3">
                            <h6>
                              {que.label}{" "}
                              {que.jdRequired === "Yes" && (
                                <span style={{ color: "red" }}>*</span>
                              )}
                            </h6>
                            <p>{formState[que.id] || "No answer provided"}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </section>
            </main>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!preview && (
            <>
              <Button
                variant="secondary"
                onClick={handleClose}
                style={{ border: "none" }}
                className="btn-md"
              >
                Cancel
              </Button>
              <a
                className="btn btn-primary btn-md"
                onClick={handlePreview}
                ref={previewButtonRef}
                style={{
                  backgroundColor: "var(--primary-color)",
                  border: "none",
                }}
              >
                Preview
              </a>
            </>
          )}

          {preview && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  if (questions.length != 0) {
                    setPreview(false);
                  }
                }}
                style={{ border: "none" }}
                className="btn-md"
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handlePost}
                className="btn-md"
                style={{
                  backgroundColor: "var(--primary-color)",
                  border: "none",
                }}
                disabled={isPosting}
              >
                Submit
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApplyPopup;
