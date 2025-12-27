import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { YearWeekMonthConvertor } from "../../../../components/SkillAvailer/DaysConvertorsFunc";
import { BsCheckCircleFill } from "react-icons/bs";

import useContentLabel from "../../../../hooks/useContentLabel";
import icons from "./../../../../constants/icons";
import { formatExperience } from "../../../../components/SkillOwner/HelperFunction/FormatExperience";
import { useLocation } from "react-router-dom";
import CourseSkillMatching from "../../../../views/upskillings/view upskilling/CourseSkillMatching";
import SkillsMatchingLegends from "../../../../views/opportunities/SkillsMatchingLegends";
const CourseCandidateBasicDetails = ({ row }) => {
  /* CONTENT LABELS */
  const contentLabel = useContentLabel();
  const { selectedCourse } = useSelector((state) => state.myCourses);
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const { search } = useLocation(); // Get search params from the URL
  const queryParams = new URLSearchParams(search); // Parse the query params
  const preSkillColumn = [
    (
      content[selectedLanguage]?.find(
        (item) => item.elementLabel === "Prerequisite"
      ) || {}
    ).mvalue || "nf Prerequisite",
    (
      content[selectedLanguage]?.find(
        (item) => item.elementLabel === "AppliedExperience"
      ) || {}
    ).mvalue || "nf Applied Experience",
    (
      content[selectedLanguage]?.find(
        (item) => item.elementLabel === "AcquiredExperience"
      ) || {}
    ).mvalue || "nf Acquired Experience",
    (
      content[selectedLanguage]?.find(
        (item) => item.elementLabel === "MatchedSkill"
      ) || {}
    ).mvalue || "nf Matched Skills",
  ];

  return (
    <div style={{ backgroundColor: "#fff" }}>
      <div
        className="font-1 d-flex justify-content-center"
        style={{ fontWeight: "bold" }}
      >
        {(
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "CandidateSummary"
          ) || {}
        ).mvalue || "nf Candidate Summary"}
      </div>
      <CourseSkillMatching
        preRequest={selectedCourse?.preRequisiteSkillsList}
        allSkills={row?.userSkills}
        cloumn={preSkillColumn}
        headerName={contentLabel("MatchingSkills", "nf Matching Skills")}
      />
     

      {selectedCourse?.courseQuestions &&
        selectedCourse?.courseQuestions?.filter(
          (item) => !(item?.hasNext === true || item?.hasNext === false)
        )?.length > 0 && (
          <div className="ms-2 mt-4">
            <h2 className="fs-6 fw-bold">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "Questions"
                ) || {}
              ).mvalue || "nf Questions"}
            </h2>
            <hr className="my-1" />

            <div>
              {selectedCourse?.courseQuestions?.length > 0 &&
              !queryParams.get("Type") ? (
                <div className="me-3 ms-2 font-4" style={{}}>
                  {selectedCourse?.courseQuestions?.map((qn, index) => {
                    if (!qn?.cqLabel) return <></>; // Skip if there's no label

                    return (
                      <div
                        key={qn?.id || index}
                        className="gap-2 d-flex px-1 py-2"
                        style={{ backgroundColor: "#fff", borderRadius: "8px" }}
                      >
                        <div className="me-2">{index + 1}</div>
                        <div className="d-flex flex-column">
                          <div className="font-weight-1 mb-2">
                            {qn?.cqLabel}
                          </div>
                          <div>
                            {row?.canswersList?.length > 0 ? (
                              <div>
                                {
                                  row.canswersList.find(
                                    (ans) => ans?.cqId === qn?.id
                                  )?.canswer
                                }
                              </div>
                            ) : (
                              <div>
                                {contentLabel(
                                  "NoAnswerFromUser",
                                  "nf No Answer From User"
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  {contentLabel("NoQuestionsAsked", "nf No Questions Asked")}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default CourseCandidateBasicDetails;
