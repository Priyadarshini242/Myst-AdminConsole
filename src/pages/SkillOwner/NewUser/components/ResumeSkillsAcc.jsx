import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import CreatableSelect from "react-select/creatable";
import { debouncedSendRequest } from "../../../../components/DebounceHelperFunction/debouncedSendRequest";
import useContentLabel from "../../../../hooks/useContentLabel";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";

const ResumeSkillsAcc = ({ skill, setSkills, index }) => {
  /* STORES */
  const selectedLanguage = useSelector((state) => state.language);
  const contentLabel = useContentLabel();
  const [menuOpen, setMenuOpen] = useState(true);

  /* HANDLE INPUT CHANGE IN CREATESELECT */
  const handleInputChange = (inputValue, action) => {
    if (action !== "input-change") {
      return;
    }

    setMenuOpen(true);

    setSkills((prevSkills) =>
      prevSkills.map((item) =>
        item.id === skill?.id
          ? { ...item, skill: inputValue, inputValue: inputValue }
          : item
      )
    );

    if (inputValue.length > 2) {
      setSkills((prevSkills) =>
        prevSkills.map((item) =>
          item.id === skill?.id ? { ...item, isLoading: true } : item
        )
      );

      debouncedSendRequest(
        inputValue,
        selectedLanguage,
        (newOptions) => {
          setSkills((prevSkills) =>
            prevSkills.map((item) =>
              item.id === skill?.id
                ? { ...item, options: newOptions, isLoading: false }
                : item
            )
          );
        },
        () => {
          setSkills((prevSkills) =>
            prevSkills.map((item) =>
              item.id === skill?.id ? { ...item, isLoading: false } : item
            )
          );
        },
        contentLabel
      );
    } else {
      setSkills((prevSkills) =>
        prevSkills.map((item) =>
          item.id === skill?.id
            ? { ...item, options: [], isLoading: false }
            : item
        )
      );
    }
  };

  /* HANDLE ACCORDION CLICK TO FETCH SUGGESTIONS */
  const handleAccordionClick = useCallback(() => {
    if (!skill?.options?.length && skill?.skill?.length > 2) {
      setSkills((prevSkills) =>
        prevSkills.map((item) =>
          item.id === skill.id ? { ...item, isLoading: true } : item
        )
      );

      debouncedSendRequest(
        skill?.skill,
        selectedLanguage,
        (newOptions) => {
          setSkills((prevSkills) =>
            prevSkills.map((item) =>
              item.id === skill.id
                ? { ...item, options: newOptions, isLoading: false }
                : item
            )
          );
        },
        () => {
          setSkills((prevSkills) =>
            prevSkills.map((item) =>
              item.id === skill.id ? { ...item, isLoading: false } : item
            )
          );
        },
        contentLabel
      );
    }
  }, [skill.id, skill.options, selectedLanguage, contentLabel, setSkills]);

  return (
    <>
      <div className="accordion w-100" id="accordionPanelsStayOpenExample">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button collapsed`}
              style={{ color: "black" }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#panelsStayOpen-collapseEmp${skill?.id}`}
              aria-expanded="false"
              aria-controls={`panelsStayOpen-collapseEmp${skill?.id}`}
              onClick={handleAccordionClick} // Trigger API call on click
            >
              {contentLabel("Skill", "nf Skill")}-{index + 1}
            </button>
          </h2>
          <div
            id={`panelsStayOpen-collapseEmp${skill?.id}`}
            className={`accordion-collapse collapse`}
          >
            <div
              className="accordion-body"
              style={{ position: "relative", minHeight: "15rem" }}
            >
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
                  menu: (provided) => ({
                    ...provided,
                    height: "150px", // Set your desired height here
                    overflowY: "auto", // Add vertical scroll if the content exceeds the set height
                  }),
                }}
                value={
                  skill?.skill
                    ? {
                        value: skill?.skill,
                        label: skill?.skill,
                      }
                    : null
                }
                // inputValue={skill?.inputValue || ""}
                onInputChange={(value, { action }) => {
                  if (action === "input-change") {
                    handleInputChange(value, action);
                  }
                }}
                onChange={(selectedOption) => {
                  setMenuOpen(false);
                  setSkills((prevSkills) =>
                    prevSkills.map((item) =>
                      item.id === skill?.id
                        ? {
                            ...item,
                            inputValue: selectedOption?.value || "",
                            skill: selectedOption?.value || "",
                            id: selectedOption?.id,
                          }
                        : item
                    )
                  );
                }}
                options={skill.options
                  ?.filter((option) => !(option?.dontSelect === true))
                  ?.map((option) => ({
                    ...option,
                    value: option?.skillOccupation,
                    label: option?.skillOccupation,
                  }))}
                isLoading={skill.isLoading}
                placeholder="Type to search or create..."
                formatCreateLabel={(inputValue) => `"${inputValue}"`} // Customize the "Create" label
                createOptionPosition="first" // Ensure "Create" option appears at the top
                menuIsOpen={menuOpen}
                onFocus={() => setMenuOpen(true)}
                onBlur={() => {
                  if (
                    typeof skill?.id === "string" &&
                    skill.id.includes("SKLS")
                  ) {
                    setMenuOpen(false);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeSkillsAcc;
