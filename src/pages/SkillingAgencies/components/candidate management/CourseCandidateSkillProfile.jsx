import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SkillProfileExpanable from "../../../../components/SkillAvailer/JDRelatedComponents/JdApplication Components/SkillProfileExpanable";

const CourseCandidateSkillProfile = ({
  skillProfileView,
  userDetail,
  skillPofileLoader,
  appliedData,
  acquiredData,
  listView = false,
  isSkillowner = false,
  skillsAppliedData,
  skillsAcqiedData,
  dbAccess = false,
}) => {
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const RefMyRequirements = useSelector((state) => state.RefMyRequirements);

  const [viewMode, setViewMode] = useState("summary");

  const renderedData = isSkillowner ? userDetail : userDetail?.otherSkills;
  const renderedDataAvailable = isSkillowner
    ? userDetail
    : dbAccess
    ? userDetail.userSkills
    : userDetail.matchingSkills;

  return (
    skillProfileView && (
      <div
        className=" font-5   mb-2"
        style={{
          borderRadius: listView ? "0px" : "20px",
          borderColor: listView ? "#ffff" : "#ffff",
          borderStyle: "solid",
          backgroundColor: listView ? "#ffff" : "#ffff",
        }}
      >
        {/* {
                renderedData && renderedData?.length > 0 &&
                <React.Fragment>
                    {!isSkillowner && (
                        <div className='UserCardBg'>
                            <div
                                className="d-flex bg-body- justify-content-center align-items-center font-5   mb-2"
                                style={{

                                    color: "#212529",
                                    backgroundColor: listView ? "#fff" : "#F8F9FA",
                                    fontWeight: "bolder",
                                }}
                            >
                                {(
                                    content[selectedLanguage]?.find(
                                        (item) => item.elementLabel === "OtherSkills"
                                    ) || {}
                                ).mvalue || "nf Other Skills"}
                            </div>
                            <div className="d-flex mt-1 UserCardBg" style={{ flexWrap: "wrap" }}>
                                {renderedData?.map((skills) => (
                                    <div
                                        key={skills?.id}
                                        className="m-2 p-2 rounded-1 print-skill"
                                        style={{
                                            backgroundColor: "rgba(0, 0, 0, 0.125)",
                                            color: "#181818",
                                        }}
                                    >
                                        {skills?.skill
                                            ? skills.skill
                                            : skills?.skillOccupation &&
                                            skills?.skillOccupation.split("| |")[0].trim()}
                                    </div>
                                ))}


                            </div>
                        </div>
                    )}
                </React.Fragment>
            } */}

        {/* Title */}
        <div className="d-flex bg-body- justify-content-between align-items-center  mb-2 ">
          <div
            style={{
              margin: "0 auto",
              fontSize: `22px`,
              color: "#212529",
              fontWeight: "bold",
            }}
          >
            {isSkillowner
              ? (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "MySkillProfile"
                  ) || {}
                ).mvalue || "nf My SkillProfile"
              : (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "MySkillProfile"
                  ) || {}
                ).mvalue || "nf SkillProfile"}
          </div>
          <div className="move-right-side align-self-end align-content-end">
            <div class="form-check form-switch me-2">
              <input
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
                checked={viewMode === "detailed"}
                onChange={() =>
                  setViewMode((prev) =>
                    prev === "summary" ? "detailed" : "summary"
                  )
                }
              />
              <label class="form-check-label" for="flexSwitchCheckDefault">
                {" "}
                Detail view
              </label>
            </div>
          </div>
        </div>
        <div
          style={{
            maxHeight: "100%",
            minHeight: "150px",
            overflowY: "auto",
            backgroundColor: listView ? "#fff" : "#ffff",
          }}
        >
          {renderedDataAvailable &&
            renderedDataAvailable.map((skills) =>
              listView === false ? (
                //new View
                <div className="me-2 mt-2">
                  <SkillProfileExpanable
                    view={viewMode} //summary view or detail view
                    skillDetail={skills} //basic skilll details
                    appliedExp={skills?.skillAppliedExp} //appliedExp
                    acquiredExp={skills?.skillAcquiredExp} //acquiredExp
                    acquiredData={
                      isSkillowner ? skillsAcqiedData : userDetail.skillacq
                    } //acquiredData
                    appliedData={
                      isSkillowner ? skillsAppliedData : userDetail.skillapp
                    } //appliedData
                    loader={skillPofileLoader}
                    isSkillowner={isSkillowner}
                  />
                </div>
              ) : (
                // RefMyRequirements?.skillsInRefined.some((refinedSkill) => refinedSkill.label === skills.skillOccupation) &&
                // <div className="ms-3  " style={{}} key={skills?.skillOccupation}>

                //     <div className="d-flex flex-column font-5 font-weight-2 mb-2  align-items-baseline  " >
                //         <div className="font-4 font-weight-2 mb-2 d-flex align-items-baseline  " >

                //             <div> {(content[selectedLanguage]?.find(item => item.elementLabel === 'Skill') || {}).mvalue || "nf Skill"} : {skills?.skillOccupation}</div>
                //             {skills.Rank <= 5 && <div className="mx-2 " >#{skills.Rank}</div>}
                //         </div>
                //         <div className='d-flex gap-4'>
                //             <p> {(content[selectedLanguage]?.find(item => item.elementLabel === 'AppliedExperience') || {}).mvalue || "nf AppliedExperience"} : {DayDifferenceToDynamicView(skills.AppliedExp !== '0' ? skills.AppliedExp : 0)}</p>
                //             <p> {(content[selectedLanguage]?.find(item => item.elementLabel === 'AcquiredExperience') || {}).mvalue || "nf AcquiredExperience"} : {DayDifferenceToDynamicView(skills.AcquiredExp !== '0' ? skills.AcquiredExp : 0)}</p>
                //         </div>
                //     </div>
                //     <div className="my-2  font-weight-2 font-5 ms-3">
                //         {(
                //             content[selectedLanguage]?.find(
                //                 (item) => item.elementLabel === "SkillsApplied"
                //             ) || {}
                //         ).mvalue || "nf SkillsApplied"}
                //     </div>
                //     {skillPofileLoader ? <SmallLoader bg={"120px"} height={"3rem"} width={"3rem"} /> :
                //         <>
                //             <SeekerSkillAppliedDetail skillName={skills?.skillOccupation} userDetails={userDetail} />
                //             {/* Skill learnt from */}
                //         </>
                //     }

                //     <div className="my-2 mt-3 ms-3  font-weight-2 font-5">
                //         {(
                //             content[selectedLanguage]?.find(
                //                 (item) => item.elementLabel === "SkillsAcquired"
                //             ) || {}
                //         ).mvalue || "nf SkillsAcquired"}
                //     </div>

                //     {/* table start */}
                //     {skillPofileLoader ? <SmallLoader bg={"120px"} height={"3rem"} width={"3rem"} color={"black"} /> :
                //         <>
                //             <SeekerSkillAcquiredDetail skillName={skills?.skillOccupation} userDetails={userDetail} />
                //             {/* Skill learnt from */}
                //         </>
                //     }
                //     {/* table end */}
                // </div>

                //new View
                <div className="me-2 mt-2">
                  <SkillProfileExpanable
                    view={viewMode} //summary view or detail view
                    skillDetail={skills} //basic skilll details
                    appliedExp={
                      isSkillowner
                        ? skills?.skillAppliedExp
                        : skills.expMax || skills.AppliedExp
                    } //appliedExp
                    acquiredExp={
                      isSkillowner
                        ? skills?.skillAcquiredExp
                        : skills.expMin || skills.AcquiredExp
                    } //acquiredExp
                    acquiredData={
                      isSkillowner ? skillsAcqiedData : userDetail.skillacq
                    } //acquiredData
                    appliedData={
                      isSkillowner ? skillsAppliedData : userDetail.skillapp
                    } //appliedData
                    loader={skillPofileLoader}
                    isSkillowner={isSkillowner}
                    isSkillingAgency={true}
                    validationData={userDetail.validationDatas}
                  />
                </div>
              )
            )}
        </div>
      </div>
    )
  );
};

export default CourseCandidateSkillProfile;
