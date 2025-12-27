import React from "react";
import { useSelector } from "react-redux";
import useContentLabel from "../../../../hooks/useContentLabel";
import { convertDaysToPhase } from "../../../../components/SkillAvailer/helperFunction/conversion";

const PrerequsiteSkills = () => {
  const contentLabel = useContentLabel();
  const { preRequisiteSkillsList: prerequsiteSkills } = useSelector(
    (state) => state.myCourses.selectedCourse
  );

  return (
    <>
      <div className="d-flex align-items-center  ">
        <div className="font-3 mt-2">
          {contentLabel("PrerequsiteSkills", "nf Prerequsite Skills")}
        </div>
      </div>
      <table class="ms-2 opportunity-tables table-hover table-responsive table-bordered  align-self-center font-5 w-100 mt-2">
        <thead>
          <tr>
            <th className="p-1" scope="col" style={{ width: "5%" }}>
              #
            </th>
            <th className="p-1" scope="col" style={{ width: "50%" }}>
              {contentLabel("PrerequsiteSkills", "nf Prerequsite Skills")}
            </th>
            <th className="p-1" scope="col" style={{ width: "25%" }}>
              {contentLabel("Experience", "nf Experience")}
            </th>
            <th className="p-1" scope="col" style={{ width: "25%" }}>
              {contentLabel("Mandatory", "nf Mandatory")}
            </th>
            {/* <th className='p-1' scope="col">Exclude (not)</th> */}
          </tr>
        </thead>
        <tbody className=" divide-y ml-5  ">
          {/* {prerequsiteLoading &&
                        <>
                            <tr className=''>
                                <th className='p-1' > </th>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                            </tr>
                            <tr>
                                <th className='p-1' > </th>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                            </tr>
                            <tr>
                                <th className='p-1'> </th>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                            </tr>
                        </>
                    } */}
          {prerequsiteSkills?.map((skill, index) => {
            if (skill.skill) {
              return (
                <tr key={index}>
                  <th className="p-1" scope="col">
                    {index + 1}
                  </th>
                  <td className="p-1" scope="col">
                    {skill.skill}
                  </td>
                  <td className="p-1" scope="col">
                    {convertDaysToPhase(skill.yoeMin, skill.yoePhase)} -{" "}
                    {convertDaysToPhase(skill.yoeMax, skill.yoePhase)}{" "}
                    {skill.yoePhase}
                  </td>
                  <td className="p-1" scope="col">
                    <input
                      type="checkbox"
                      style={{ accentColor: "var(--primary-color)" }}
                      checked={
                        skill.isMandatory === "true" ||
                        skill.isMandatory === "Yes"
                          ? true
                          : false
                      }
                    />
                  </td>
                  {/* <td className='p-1' scope="col">NA</td> */}
                  {/* <td className='p-1' scope="col"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={skill.mandatory} /></td> */}
                  {/* <td className='p-1' scope="col"><input type='checkbox' style={{ accentColor: 'var(--primary-color)' }} checked={false} /></td> */}
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </>
  );
};

export default PrerequsiteSkills;
