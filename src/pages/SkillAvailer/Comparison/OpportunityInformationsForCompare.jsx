import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSkillComparisonSkillData } from '../../../reducer/SkillSeeker/Comparison/SkillComparisonSlice';
import { convertDaysToPhase } from '../../../components/SkillAvailer/helperFunction/conversion';
import useContentLabel from '../../../hooks/useContentLabel';
import { icons } from '../../../constants';
import Tooltip from '@mui/material/Tooltip';
import { FaStar } from 'react-icons/fa';

const OpportunityInformationsForCompare = ({ skills, data = false }) => {
  const contentLabel = useContentLabel();
  const dispatch = useDispatch();
  const [selectedSkills, setSelectedSkills] = useState([]);

  useEffect(() => {
    if (skills?.length) {
      const sorted = [...skills].sort((a, b) => {
        if (a.jdType === "Mandatory" && b.jdType !== "Mandatory") return -1;
        if (a.jdType !== "Mandatory" && b.jdType === "Mandatory") return 1;
        return a.skill.localeCompare(b.skill);
      });
      setSelectedSkills(sorted);
    }
  }, [skills]);


  const handleSkillSelect = (skillObj) => {
    setSelectedSkills((prev) => {
      const exists = prev.some((s) => s.id === skillObj.id);
      let updated = exists
        ? prev.filter((s) => s.id !== skillObj.id)
        : [...prev, skillObj];

      // Sort updated selected skills based on sorted `skills` order
      const sorted = [...skills].sort((a, b) => {
        if (a.jdType === "Mandatory" && b.jdType !== "Mandatory") return -1;
        if (a.jdType !== "Mandatory" && b.jdType === "Mandatory") return 1;
        return a.skill.localeCompare(b.skill);
      });

      return sorted.filter((sortedSkill) =>
        updated.some((s) => s.id === sortedSkill.id)
      );
    });
  };

  useEffect(() => {
    dispatch(setSkillComparisonSkillData(selectedSkills));
  }, [selectedSkills]);

  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const allSelected = skills.length > 0 && skills.every(skill => selectedSkills.some(s => s.id === skill.id));
    setSelectAll(allSelected);
  }, [skills, selectedSkills]);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSkills([]);
    } else {
      setSelectedSkills(skills);
    }
    setSelectAll(!selectAll);
  };

  return (
    <div className='d-flex flex-column justify-content-center '>
      <div className="col-lg-12 mb-3">
        <div className="d-flex align-items-center">
          <div className="w-100">
            <h2 style={{ color: "var(--primary-color)" }}>
              {data?.title}
            </h2>

            {data?.jdsType === 'SEARCH' && data?.description?.trim() && data?.description !== "-" && (
              <>
                <icons.InfoOutlinedIcon style={{ color: 'var(--primary-color)' }} />
                <span className='ms-2'>{data.description}</span>
              </>
            )}

            <div className="row d-md-flex align-items-center mt-3">
              {data?.jdCompany?.trim() && (
                <div className="col-4 mb-3 d-md-flex align-items-center">
                  <icons.BusinessCenterOutlinedIcon style={{ color: "var(--primary-color)" }} />
                  <span className="ms-2">{data.jdCompany}</span>
                </div>
              )}

              {((Array.isArray(data.jobLocation) && data.jobLocation.length) ||
                (typeof data.jobLocation === "string" && data.jobLocation.trim())) && (
                  <div className="col-4 mb-3 d-md-flex align-items-center">
                    <icons.FmdGoodOutlinedIcon style={{ color: "var(--primary-color)" }} />
                    <span className="ms-2">
                      {Array.isArray(data.jobLocation)
                        ? data.jobLocation.map((item) => item.value).join(", ")
                        : data.jobLocation}
                    </span>
                  </div>
                )}

              {data?.jdType?.trim() && (
                <div className="col-4 mb-3 d-md-flex align-items-center">
                  <icons.AccessTimeOutlinedIcon style={{ color: "var(--primary-color)" }} />
                  <span className="ms-2">{data.jdType}</span>
                </div>
              )}

              {data?.jdCategoryName?.trim() && (
                <div className="col-4 mb-3 d-md-flex align-items-center">
                  <icons.TbCategory size={23} style={{ color: "var(--primary-color)" }} />
                  <span className="ms-2">{data.jdCategoryName}</span>
                </div>
              )}

              {data?.jdSubCategoryName?.trim() && (
                <div className="col-4 mb-3">
                  <div className="ps-4 fst-italic" style={{ opacity: "0.8" }}>
                    {data.jdSubCategoryName}
                  </div>
                </div>
              )}

              {data?.externalSite?.trim() && (
                <div className="col-4 mb-3 d-md-flex align-items-center">
                  <icons.LanguageIcon size={23} style={{ color: "var(--primary-color)" }} />
                  <span className="ms-2">{data.externalSite}</span>
                </div>
              )}

              {data?.experienceLevel?.trim() && (
                <div className="col-4 mb-3 d-md-flex align-items-center">
                  <icons.MdOutlineVerifiedUser size={23} style={{ color: "var(--primary-color)" }} />
                  <span className="ms-2">{data.experienceLevel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

<div>
     {/* <h6 className='fw-bold mb-3' ></h6> */}
      <table className='opportunity-tables table-hover table-responsive table-bordered align-self-center font-5 table-light' style={{ width: "99.6%", height: "100%" }}>
        <thead className='mb-2'>
          <tr className='fw-bold'>
            <td className='p-2 text-start' style={{ width: '4%' }}>
             <Tooltip title={contentLabel('SelectAll', 'nf Select All')}>
              <input
                type='checkbox'
                checked={selectAll}
                onChange={handleSelectAll}
              />
             </Tooltip>
            </td>
            <td className='p-2' style={{ width: '71%' }}>{contentLabel('SkillsRequired', 'nf Skills Required')}</td>
            <td className='p-2' style={{ width: '15%' }}>{contentLabel('Experience', 'nf Experience')}</td>
            <td className='p-2' style={{ width: '10%' }}>{contentLabel('Mandatory', 'nf Mandatory')}</td>
          </tr>
        </thead>
        <tbody>
          {skills &&
            [...skills].sort((a, b) => {
              // First sort by jdType: Mandatory first
              if (a.jdType === "Mandatory" && b.jdType !== "Mandatory") return -1;
              if (a.jdType !== "Mandatory" && b.jdType === "Mandatory") return 1;

              // If same jdType, sort alphabetically by skill name
              return a.skill.localeCompare(b.skill);
            }).map((skill, index) => (
              <tr key={index} style={{ height: "30px" }}>
                <td className='p-2 text-start'>
                  <input
                    type='checkbox'
                    checked={selectedSkills.some((s) => s.id === skill.id)}
                    onChange={() => handleSkillSelect(skill)}
                  />
                </td>
                <td className='p-2'>{skill.skill}</td>
                <td className='p-2' style={{ width: "130px" }}>
                  <div>
                    {convertDaysToPhase(skill.yoeMin, skill.yoePhase)} - {convertDaysToPhase(skill.yoeMax, skill.yoePhase)} {skill.yoePhase}
                  </div>
                </td>
                <td className='p-2'>
                
                  {/* {skill.jdType === "Mandatory" && (
                    <input type='checkbox' checked readOnly />
                  )} */}
                  {skill.jdType === "Mandatory" && (
                     <FaStar style={{color:"var(--primary-color)"}} />
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
        
</div>
    </div>
  );
};

export default OpportunityInformationsForCompare;
