import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";
import { icons } from "../../../../constants";
import { debouncedSendRequest } from "../../../../components/DebounceHelperFunction/debouncedSendRequest";
import useContentLabel from "../../../../hooks/useContentLabel";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";

const ResumeSkills = ({ skills, setSkills, updateResumeDetails }) => {
  /* STORES */
  const selectedLanguage = useSelector((state) => state.language);
  const contentLabel = useContentLabel();

  // /* STATE INITIALIZATION WITH useMemo */
  // const memoizedSkills = useMemo(
  //   () =>
  //     initialSkills.map((skill) => ({
  //       ...skill,
  //       options: [], // Initialize options for each skill
  //       isLoading: false, // Track loading state per skill
  //        "", // Track input value per skill
  //     })),
  //   [skills]
  // );

  /* HANDLE INPUT CHANGE IN CREATESELECT */
  const handleInputChange = useCallback(
    (inputValue, skillId) => {
      setSkills((prevSkills) =>
        prevSkills.map((item) =>
          item.id === skillId ? { ...item, skill: inputValue } : item
        )
      );

      if (inputValue.length > 2) {
        setSkills((prevSkills) =>
          prevSkills.map((item) =>
            item.id === skillId ? { ...item, isLoading: true } : item
          )
        );

        debouncedSendRequest(
          inputValue,
          selectedLanguage,
          (newOptions) => {
            setSkills((prevSkills) =>
              prevSkills.map((item) =>
                item.id === skillId
                  ? { ...item, options: newOptions, isLoading: false }
                  : item
              )
            );
          },
          () => {
            setSkills((prevSkills) =>
              prevSkills.map((item) =>
                item.id === skillId ? { ...item, isLoading: false } : item
              )
            );
          },
          contentLabel
        );
      } else {
        setSkills((prevSkills) =>
          prevSkills.map((item) =>
            item.id === skillId
              ? { ...item, options: [], isLoading: false }
              : item
          )
        );
      }
    },
    [selectedLanguage, contentLabel]
  );

  /* HANDLE SKILL SELECTION */
  const handleSkillChange = (selectedOption, skillId) => {
    console.log(skillId);
    console.log(selectedOption);

    setSkills((prevSkills) =>
      prevSkills.map((item) =>
        item.id === skillId
          ? { ...item, skill: selectedOption?.value || item.skill }
          : item
      )
    );
  };

  /* DELETE SKILL */
  const handleDeleteSkill = (skillId) => {
    setSkills((prevSkills) =>
      prevSkills.filter((skill) => skill.id !== skillId)
    );
  };

  return (
    <div className="skills-container w-100">
      <div className="skills-list d-flex flex-column">
        {skills?.map((skill) => (
          <div
            className="skill-item d-flex justify-content-between py-4"
            key={skill.id}
            style={{ borderBottom: "2px solid var(--light-color)" }}
          >
            <div className="d-flex w-100">
              <CreatableSelect
                components={{
                  DropdownIndicator: null,
                  IndicatorSeparator: null,
                }}
                onKeyDown={(e) => {
                  if (LIMITED_SPL_CHARS.includes(e.key)) {
                    e.preventDefault();
                    showErrorToast(
                      contentLabel(
                        "SpecialCharNotAllowed",
                        "nf Special Characters Not Allowed"
                      )
                    );
                  }
                }}
                styles={{
                  container: (provided) => ({
                    ...provided,
                    width: "25rem",
                  }),
                }}
                value={{
                  value: skill?.skill,
                  label: skill?.skill,
                }} // Current value
                inputValue={skill.skill} // Controlled input value
                onInputChange={(inputValue) =>
                  handleInputChange(inputValue, skill.id)
                } // Update `inputValue` and fetch options
                onChange={(selectedOption) =>
                  handleSkillChange(selectedOption, skill.id)
                } // Update skill on selection
                options={skill.options?.map((option) => ({
                  value: option?.skillOccupation,
                  label: option?.skillOccupation,
                }))} // Fetched options
                isLoading={skill.isLoading} // Show loading indicator
                placeholder="Type to search or create..." // Placeholder text
              />
            </div>
            <div className="skill-actions d-flex gap-2 align-items-center">
              <icons.DeleteOutlineOutlinedIcon
                style={{ fontSize: "20px", cursor: "pointer" }}
                onClick={() => handleDeleteSkill(skill.id)}
                className="delete-icon"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeSkills;
