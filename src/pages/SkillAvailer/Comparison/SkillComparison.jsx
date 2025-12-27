import React, { useEffect, useState } from 'react'
import { Card } from 'react-bootstrap'
import { icons } from '../../../constants'
import useContentLabel from '../../../hooks/useContentLabel'
import { useSelector } from 'react-redux'
import JDSkillsTab from '../../../components/SkillAvailer/JDRelatedComponents/JDSkillsTab'
import OpportunityInformationsForCompare from './OpportunityInformationsForCompare'
import SkillAccordionWithCandidateTable from './SkillAccordionWithCandidateTable'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import SelectedSkillDetailsForCandidate from './SelectedSkillDetailsForCandidate'
import DownloadOpportunityPDF from './pdf/DownloadComparisonPdf'
import { formatExperience } from '../../../components/SkillOwner/HelperFunction/FormatExperience'
import { setCandidateDataForPDF, setSelectedSkillDetails } from '../../../reducer/SkillSeeker/Comparison/SkillComparisonSlice'
import CandidatePreviewPane from '../../../components/SkillAvailer/JDRelatedComponents/CandidatePreviewPane'

const SkillComparison = () => {
  const contentLabel = useContentLabel()
  const jdStore = useSelector((state) => state.JdDataSlice);
  const [jdSkills,setJdSkills] = useState([])
  const { skillComparisonSkillsData, skillComparisonCandidatesData, selectedSkillDetails, candidateDataForPDF } = useSelector(state => state.SkillComparison);
  const { search } = useLocation();
  const dispatch = useDispatch();
  const queryParams = new URLSearchParams(search);
  const navigate = useNavigate()
  const [candidatePaneOpen, setCandidatePaneOpen] = useState(false)


  // Redirect if essential Redux state is missing
  useEffect(() => {
    if (!skillComparisonCandidatesData?.length) {
      const title = queryParams.get("Title");
      const id = queryParams.get("Id");
      const type = queryParams.get("Type");

      if (title && id && type) {
        navigate(`/skill-seeker/Opportunities/Candidate-management?Title=${title}&Id=${id}&Type=${type}`);
      }
    }
  }, [skillComparisonCandidatesData]);

  useEffect(()=>{
   const skills = jdStore?.SelectedJd?.JdSkills?.filter((item)=>item.skill)
   setJdSkills(skills)
  },[jdStore?.SelectedJd])



  useEffect(() => {
    if (!skillComparisonSkillsData?.length || !skillComparisonCandidatesData?.length) return;

    const statusWeights = {
      "Perfect match": 1,
      "Over qualified": 2,
      "Under qualified": 3,
      "No match": 4,
    };

    const candidateDataBySkill = {};

    skillComparisonSkillsData.forEach((skill) => {
      const candidatesForSkill = skillComparisonCandidatesData.map((candidate) => {
        const matchedSkill = candidate?.matchingSkills?.find(
          (ms) => ms?.skill?.toLowerCase() === skill?.skill?.toLowerCase()
        );

        const candidateSkill = matchedSkill?.skillOccupation || "";
        const candidateId = candidate?.mystProfile || "";
        const candidateName = 
          candidate?.fn !== "Yes" && candidate?.mlnShowHide !== "Yes"
            ? `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim()
            : candidate?.fn !== "Yes" && candidate?.mlnShowHide === "No"
              ? candidate?.lastName || ''
              : candidate?.fn === "No" && candidate?.mlnShowHide !== "Yes"
                ? candidate?.firstName || ''
                : contentLabel("Confidential","nf Confidential");
        let experience = contentLabel('NoSkillPresent', 'nf No Skill Present');
        let statusLabel = "No match";
        let statusWeight = statusWeights["No match"];
        let status = (
          <div className='d-flex gap-2'>
            <div className="fs-5 text-danger d-flex align-items-center">
              <icons.BsCheckCircleFill />
            </div>
            <span>{contentLabel("NoMatch", "nf No match")}</span>
          </div>
        );
        let experienceValue = 0;
        let priority = null;
        let topSkillRank = 999;

        if (matchedSkill) {
          const skillAppliedExp = Number(matchedSkill?.skillAppliedExp || 0);
          const yoeMin = Number(skill.yoeMin);
          const yoeMax = Number(skill.yoeMax);

          const isExpInRange = skillAppliedExp >= yoeMin && skillAppliedExp <= yoeMax;
          const underQualified = skillAppliedExp < yoeMin;
          const overQualified = skillAppliedExp > yoeMax;

          experience = formatExperience(contentLabel, null, skillAppliedExp);
          experienceValue = skillAppliedExp;

          if (isExpInRange) {
            statusLabel = "Perfect match";
            statusWeight = statusWeights["Perfect match"];
            status = contentLabel("PerfectMatch", "nf Perfect match")
            // status = (
            //   <div className='d-flex gap-2'>
            //     <div className="fs-5 text-success d-flex align-items-center">
            //       <icons.BsCheckCircleFill />
            //     </div>
            //     <span>{contentLabel("PerfectMatch", "nf Perfect match")}</span>
            //   </div>
            // );
          } else if (overQualified) {
            statusLabel = "Over qualified";
            statusWeight = statusWeights["Over qualified"];
            status = contentLabel("OverQualified", "nf Over qualified")
            // status = (
            //   <div className='d-flex gap-2'>
            //     <div className="fs-5 text-warning d-flex align-items-center">
            //       <icons.BsCheckCircleFill />
            //     </div>
            //     <span>{contentLabel("OverQualified", "nf Over qualified")}</span>
            //   </div>
            // );
          } else if (underQualified) {
            statusLabel = "Under qualified";
            statusWeight = statusWeights["Under qualified"];
            status = contentLabel("UnderQualified", "nf Under qualified")
            // status = (
            //   <div className='d-flex gap-2'>
            //     <div className="fs-5 text-warning d-flex align-items-center">
            //       <icons.BsCheckCircleFill />
            //     </div>
            //     <span>{contentLabel("UnderQualified", "nf Under qualified")}</span>
            //   </div>
            // );
          }

          topSkillRank = Number(matchedSkill?.userRank) || 999;
          priority = `${matchedSkill?.userRank}`;
        }

        return {
          id: candidate?.id?.split("-")[1] || "",
          name: candidateName,
          experience,
          experienceValue,
          status,
          statusWeight,
          priority,
          topSkillRank,
          candidateId,
          candidateSkill,
        };
      });

      const sortedCandidates = candidatesForSkill.sort((a, b) => {
        if (a.statusWeight !== b.statusWeight) return a.statusWeight - b.statusWeight;
        if (a.topSkillRank !== b.topSkillRank) return a.topSkillRank - b.topSkillRank;
        if (a.experienceValue !== b.experienceValue) return b.experienceValue - a.experienceValue;
        return a.name.localeCompare(b.name);
      });

      candidateDataBySkill[skill.skill] = {
        skill,
        candidates: sortedCandidates,
      };
    });

    dispatch(setCandidateDataForPDF(candidateDataBySkill));
  }, [skillComparisonSkillsData]);


  console.log("candidates", candidateDataForPDF);



  const handleNavigateToCandidateManagement = () => {
    const params = new URLSearchParams({
      Title: queryParams.get("Title"),
      Id: queryParams.get("Id"),
      Type: queryParams.get("Type"),
    });

    navigate(`/skill-seeker/Opportunities/Candidate-management?${params.toString()}`);
  }

  if (!skillComparisonCandidatesData?.length){
    return (
      <>
        
      </>
    )
  }

  if (candidatePaneOpen) {
    return (
      // <SelectedSkillDetailsForCandidate />
      <Card>
        <Card.Header>
          <div className='text-end'>
            <icons.CloseOutlinedIcon size={25} className='cursor-pointer' onClick={() => { setCandidatePaneOpen(false) }} />
          </div>
        </Card.Header>
        <Card.Body className="card-scroll-hidden"
         style={{ minHeight: 'var(--cardBodyWithB-F)' }}
         >
          <CandidatePreviewPane row={jdStore.SelectedApplication} />
        </Card.Body>
      </Card>
    )
  }
  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title>
          {contentLabel("SkillsComparisonReport", "nf Skills Comparison Report")}&nbsp;
        </Card.Title>
        <div className='d-flex gap-1 justify-content-center align-items-center'>
          <DownloadOpportunityPDF
            data={jdStore.SelectedJd}
            skills={jdSkills?.map((skill) => {
              const isActive = skillComparisonSkillsData?.some(
                (compSkill) => compSkill?.id === skill?.id
              );
              return {
                ...skill,
                active: isActive, // true if found, false otherwise
              };
            })}
            candidates={candidateDataForPDF}
          />
          <icons.CloseOutlinedIcon
            className="cursor-pointer"
            onClick={() => { handleNavigateToCandidateManagement() }}
          />
        </div>
      </Card.Header>
      <Card.Body className="card-scroll-hidden" style={{ minHeight: 'var(--cardBodyWithB-F)' }}>
        <div class="accordion w-100" id="accordionPanelsStayOpenExample">


          <div class="accordion-item  ">
            <h2 class="accordion-header ">
              <button
                class={`accordion-button`}
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  // padding: '0.75rem 1rem'
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseOpportunityInformation"
                aria-expanded="true"
                aria-controls="panelsStayOpen-collapseOpportunityInformation"
              >
                {contentLabel("OpportunityInformation", "nf OpportunityInformation")}
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseOpportunityInformation"
              class={`accordion-collapse collapse show  p-4 bg-white`}
            >
              <OpportunityInformationsForCompare
                data={jdStore.SelectedJd}
                skills={jdSkills} 
                title={jdStore?.SelectedJd?.title}
                id={jdStore?.SelectedJd?.id}
              />

            </div>
          </div>


          <div class="accordion-item  ">
            <h2 class="accordion-header ">
              <button
                class={`accordion-button`}
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                  // padding: '0.75rem 1rem'
                }}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#panelsStayOpen-collapseSkillComparisonReport"
                aria-expanded="true"
                aria-controls="panelsStayOpen-collapseSkillComparisonReport"
              >
                {contentLabel("SelectedCandidateDetails", "nf Selected candidate details")}
              </button>
            </h2>
            <div
              id="panelsStayOpen-collapseSkillComparisonReport"
              class={`accordion-collapse collapse show  p-4 bg-white`}
            >

              {skillComparisonSkillsData?.length > 0 ?
                skillComparisonSkillsData?.map((skill) => (
                  <SkillAccordionWithCandidateTable skill={skill} setCandidatePaneOpen={setCandidatePaneOpen} />
                ))
                :
                <div>
                  {contentLabel("PleaseSelectSkillToCompare", "nf Please select a skill to compare")}
                </div>
              }

            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default SkillComparison
