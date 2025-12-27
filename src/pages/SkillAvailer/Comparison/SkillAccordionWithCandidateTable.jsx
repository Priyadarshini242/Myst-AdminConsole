import React, { useEffect, useState } from 'react';
import { Accordion, Card, Container, Table } from 'react-bootstrap';
import { convertDaysToPhase } from '../../../components/SkillAvailer/helperFunction/conversion';
import useContentLabel from '../../../hooks/useContentLabel';
import { useSelector } from 'react-redux';
import { icons } from '../../../constants';
import { formatExperience } from '../../../components/SkillOwner/HelperFunction/FormatExperience';
import { useDispatch } from 'react-redux';
import { setCandidateDataForPDF, setSelectedSkillDetails } from '../../../reducer/SkillSeeker/Comparison/SkillComparisonSlice';
import { setSelectedApplication } from '../../../reducer/SkillSeeker/JdData/JdDataSlice';

const SkillAccordionWithCandidateTable = ({ skill, setCandidatePaneOpen }) => {
  // console.log(skill);
  const contentLabel = useContentLabel()
  const { skillComparisonCandidatesData } = useSelector(state => state.SkillComparison);
  const [candidates, setCandidates] = useState([])
  const dispatch = useDispatch()
  console.log(skillComparisonCandidatesData);


  useEffect(() => {
    const statusWeights = {
      "Perfect match": 1,
      "Over qualified": 2,
      "Under qualified": 3,
      "No match": 4,
    };

    const candidatesForSelectedSkill = skillComparisonCandidatesData?.map((candidate) => {
      const matchedSkill = candidate?.matchingSkills?.find(
        (matchingSkill) => matchingSkill?.skill === skill?.skill
      );

      let candidateSkill = matchedSkill?.skillOccupation
      let candidateId = candidate?.mystProfile
      let experience = contentLabel('NoSkillPresent', 'nf No Skill Present');
      let status = null;
      let statusLabel = "No match";
      let statusWeight = 4;
      let priority = null;
      let topSkillRank = 999; // large number to deprioritize
      let experienceValue = 0;

      if (matchedSkill) {
        const skillAppliedExp = Number(matchedSkill?.skillAppliedExp || 0);
        const yoeMin = Number(skill.yoeMin);
        const yoeMax = Number(skill.yoeMax);
        const skillMatch = matchedSkill.skill?.toLowerCase() === skill.skill?.toLowerCase();

        const isExpInRange = skillAppliedExp >= yoeMin && skillAppliedExp <= yoeMax;
        const perfectMatch = skillMatch && isExpInRange;
        const underQualified = skillMatch && skillAppliedExp < yoeMin;
        const overQualified = skillMatch && skillAppliedExp > yoeMax;

        experience = formatExperience(contentLabel, null, skillAppliedExp);
        experienceValue = skillAppliedExp;

        if (perfectMatch) {
          statusLabel = "Perfect match";
          statusWeight = 1;
          status = (
            <div className='d-flex gap-2'>
              <div className="fs-5 text-success d-flex align-items-center">
                <icons.BsCheckCircleFill />
              </div>
              <span>{contentLabel("PerfectMatch", "nf Perfect match")}</span>
            </div>
          );
        } else if (overQualified) {
          statusLabel = "Over qualified";
          statusWeight = 2;
          status = (
            <div className='d-flex gap-2'>
              <div className="fs-5 text-warning d-flex align-items-center">
                <icons.BsCheckCircleFill />
              </div>
              <span>{contentLabel("OverQualified", "nf Over qualified")}</span>
            </div>
          );
        } else if (underQualified) {
          statusLabel = "Under qualified";
          statusWeight = 3;
          status = (
            <div className='d-flex gap-2'>
              <div className="fs-5 text-warning d-flex align-items-center">
                <icons.BsCheckCircleFill />
              </div>
              <span>{contentLabel("UnderQualified", "nf Under qualified")}</span>
            </div>
          );
        } else {
          statusLabel = "No match";
          statusWeight = 4;
          status = (
            <div className='d-flex gap-2'>
              <div className="fs-5 text-danger d-flex align-items-center">
                <icons.BsCheckCircleFill />
              </div>
              <span>{contentLabel("NoMatch", "nf No match")}</span>
            </div>
          );
        }

        topSkillRank = Number(matchedSkill?.userRank) <= 5 ? Number(matchedSkill?.userRank) : 999;
        // priority = `Candidate top ${matchedSkill?.userRank} skill`;
        priority = `${matchedSkill?.userRank}`;
      }

      return {
        candidateInfo: candidate,
        id: candidate?.id?.split("-")[1] || "",
        name:
          candidate?.fn !== "Yes" && candidate?.mlnShowHide !== "Yes"
            ? `${candidate?.firstName || ''} ${candidate?.lastName || ''}`.trim()
            : candidate?.fn !== "Yes" && candidate?.mlnShowHide === "No"
              ? candidate?.lastName || ''
              : candidate?.fn === "No" && candidate?.mlnShowHide !== "Yes"
                ? candidate?.firstName || ''
                : contentLabel("Confidential","nf Confidential"),

        experience,
        experienceValue,
        status,
        statusWeight,
        priority,
        topSkillRank,
        candidateId,
        candidateSkill
      };
    }) || [];

    // ✅ Apply the sorting logic
    const sortedCandidates = [...candidatesForSelectedSkill].sort((a, b) => {
      if (a.statusWeight !== b.statusWeight) return a.statusWeight - b.statusWeight;
      if (a.topSkillRank !== b.topSkillRank) return a.topSkillRank - b.topSkillRank;
      if (a.experienceValue !== b.experienceValue) return b.experienceValue - a.experienceValue;
      return a.name.localeCompare(b.name);
    });

    setCandidates(sortedCandidates);
    dispatch(setCandidateDataForPDF(sortedCandidates))
  }, [skillComparisonCandidatesData, skill]);


  console.log(candidates);
  

  // useEffect(() => {
  //   const candidatesForSelectedSkill = skillComparisonCandidatesData?.map((candidate) => {
  //     const matchedSkill = candidate?.matchingSkills?.find(
  //       (matchingSkill) => matchingSkill?.skill === skill?.skill
  //     );

  //     let experience = contentLabel('NoSkillPresent', 'nf No Skill Present');
  //     let status = null;
  //     let priority = null;

  //     if (matchedSkill) {
  //       const skillAppliedExp = Number(matchedSkill?.skillAppliedExp || 0);
  //       const yoeMin = Number(skill.yoeMin);
  //       const yoeMax = Number(skill.yoeMax);

  //       const isExpInRange = skillAppliedExp >= yoeMin && skillAppliedExp <= yoeMax;
  //       const skillMatch = matchedSkill.skill?.toLowerCase() === skill.skill?.toLowerCase();

  //       const perfectMatch = skillMatch && isExpInRange;
  //       const underQualified = skillMatch && skillAppliedExp < yoeMin;
  //       const overQualified = skillMatch && skillAppliedExp > yoeMax;

  //       experience = formatExperience(contentLabel, null, skillAppliedExp);

  //       if (perfectMatch) {
  //         status = (
  //           <div className='d-flex gap-2'>
  //           <div className="fs-5 text-success d-flex align-items-center ">
  //             <icons.BsCheckCircleFill />
  //           </div>
  //             <span>{contentLabel("PerfectMatch","nf Perfect match")}</span>
  //           </div>
  //         );
  //       } else if (underQualified) {
  //         status = (
  //           <div className='d-flex gap-2'>
  //           <div className="fs-5 text-warning d-flex align-items-center ">
  //              <icons.BsCheckCircleFill />
  //           </div>
  //              <span>{contentLabel("UnderQualified","nf Under qualified")}</span>
  //           </div>
  //         );
  //       } else if (overQualified) {
  //         status = (
  //           <div className='d-flex gap-2'>
  //           <div className="fs-5 text-warning d-flex align-items-center ">
  //              <icons.BsCheckCircleFill />
  //           </div>
  //               <span>{contentLabel("OverQualified","nf Over qualified")}</span>
  //           </div>
  //         );
  //       }
  //       else {
  //         status = (
  //           <div className='d-flex gap-2'>
  //           <div className="fs-5 text-danger d-flex align-items-center ">
  //              <icons.BsCheckCircleFill />
  //           </div>
  //               <span>{contentLabel("NoMatch","nf No match")}</span>
  //           </div>
  //         );
  //       }

  //       priority = `Candidate top ${matchedSkill?.userRank} skill`;
  //     }

  //     return {
  //       name: `${candidate?.firstName || ''} ${candidate?.lastName || ''}`,
  //       experience,
  //       status,
  //       priority,
  //     };
  //   }) || [];

  //   setCandidates(candidatesForSelectedSkill);
  // }, [skillComparisonCandidatesData, skill]);


  // const candidates = [
  //   {
  //     name: 'John Doe',
  //     experience: '5 years',
  //     status: 'Perfect match',
  //     priority: 'Candidate top 3 skill',
  //   },
  //   {
  //     name: 'Jane Smith',
  //     experience: '3 years',
  //     status: 'Under qualified',
  //     priority: 'Candidate top 2 skill',
  //   },
  //   {
  //     name: 'Alice Johnson',
  //     experience: '7 years',
  //     status: 'Over qualified',
  //     priority: 'Candidate top 1 skill',
  //   },
  // ];

  return (
    // <Container className="">
      <Accordion defaultActiveKey="0" >
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex gap-5 w-100 p-0" >
              <span className='w-25' style={{color:"black"}}><normal>{skill?.skill || ""}</normal></span>
              <span className='w-25' style={{color:"black"}}>{convertDaysToPhase(skill.yoeMin, skill.yoePhase)} - {convertDaysToPhase(skill.yoeMax, skill.yoePhase)} {skill.yoePhase}</span>
              <span className='w-25' style={{color:"black"}}> {skill.jdType === "Mandatory" ? contentLabel("Mandatory", "nf Mandatory") : contentLabel("NonMandatory", "nf Non Mandatory")}</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Table 
              // striped 
              bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th className="text-secondary p-2" style={{width:"20%"}}>{contentLabel("Id", "nf Id")}</th>
                  <th className="text-secondary p-2" style={{width:"20%"}}>{contentLabel("CandidateName", "nf Candidate Name")}</th>
                  <th className="text-secondary p-2" style={{width:"20%"}}> {contentLabel("CandidateExperience", "nf Candidate Experience")}</th>
                  <th className="text-secondary p-2" style={{width:"20%"}}> {contentLabel("MatchingStatus", "nf Matching Status")}</th>
                  <th className="text-secondary p-2" style={{width:"20%"}}> {contentLabel("RankingWithinTheTop5Skill", "nf Ranking within the Top 5 skills")}</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr key={index}>
                    <td className='p-2'>{candidate?.id}</td>
                    <td
                      className="cursor-pointer p-2"
                      style={{ textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      onClick={() => {
                        dispatch(setSelectedApplication(candidate?.candidateInfo));
                        setCandidatePaneOpen(true)
                      }}>{candidate?.name || "-"}</td>
                    <td className='p-2'>{candidate?.experience || "-"}</td>
                    <td className='p-2'>{candidate?.status || "-"}</td>
                    <td className='p-2'>{Number(candidate?.priority || 0) <= 5 ? (candidate?.priority || "-") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    // </Container>
  );
};

export default SkillAccordionWithCandidateTable;
