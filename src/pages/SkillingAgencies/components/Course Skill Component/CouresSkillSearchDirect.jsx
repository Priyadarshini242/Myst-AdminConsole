import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Col } from "react-bootstrap";

import PostSkillsIntoMaster from "../../../../api/PostData/PostSkillsIntoMaster";
import useContentLabel from "../../../../hooks/useContentLabel";

import { setDropdownOptions, setMasterDataCreated, setSelectedSkillsforAdd } from "../../../../reducer/mySkills/AddMultipleSkillsSlice";
import { debounceApiForSkillSearch } from "../../../../components/DebounceHelperFunction/debounceApiForSkillSearch";

import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";

import { setIsApiLoading } from "../../../../reducer/loading/isApiLoadingSlice";

import SkillManagementDropdown from "../../../../views/profile management/skills data/new skill management/SkillManagementDropdown";
import NewSkillPlusButton from "../../../../views/profile management/skills data/new skill management/NewSkillPlusButton";

import { setDeletePreSkillInCreate,setCreateCourseAptainquestSkills,setDeleteAptainSkillInCreate,setCreateCoursePrequestSkills } from "../../../../reducer/skilling agency/create course/createCourseSlice";

const CouresSkillSearchDirect = ({ isActiveCard, enableTypeahead = true }) => {
    const contentLabel = useContentLabel();
    const dispatch = useDispatch()
    const selectedLanguage = useSelector((state) => state.language);
    const { selectedSkillsforAdd, dropdownOptions, isSkillApiLoading, masterDataCreated, selectedOccupationObj } = useSelector((state) => state.addMultipleSkills);
    const {       
        skills,      
        saveStatus,
        deleteSkillInCreate
    } = useSelector((state) => state.createCourse);

    const skillKey = isActiveCard ? 'preSkill' : 'abtainSkill';
    const currentSkills = Array.isArray(skills[skillKey]) ? skills[skillKey] : [];

    //COMPONENT STATES
    const userSkills = useMemo(
        () => currentSkills?.filter((s) => s?.id),
        [skills]
    );
    const userSkillSet = useMemo(
        () => userSkills?.filter((s) => s?.id),
        [userSkills]
    );
    const dropdownRef = useRef();
    const [inputValue, setInputValue] = useState("");
    const [suggestionLoader, setSuggestionLoader] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    //NEW SKILL STATES FOR THE MASTER
    const [isEditing, setIsEditing] = useState(false)
    const [newSkillInput, setNewSkillInput] = useState("")

   

    // Find if a skill is present in the list.
    const findASkillAlsoWithoutIsDelete = (data, skillsList) => {
        try {
            if (!data || !Array.isArray(skillsList)) return false;

            return skillsList.some(skill => {
                return skill?.skill?.trim()?.toLowerCase() === data?.skill?.trim()?.toLowerCase() && (skill?.isNew !== true);
            });
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    //function which gets a list of skills (from suggestion api) and set its dropdown's checkboxes like -
    //  if the skill is already present in selected skill list.
    const autoHandleSuggestionCheckbox = (res) => {
        const validSkills = res?.filter((s) => s.skill) || [];
        const sorted = validSkills
            .sort((a, b) => a.skill.localeCompare(b.skill))
            .map((skill) => ({
                ...skill,
                id: skill.id,
                name: skill.skill,
                // isUserSkill: userSkillSet.has(skill.skill.toLowerCase()),
                //if jd is already saved block checkbox for already selected skills else dont block at all.
                isUserSkill
                    :
                    saveStatus[1] !== true ?
                        (Array.isArray(currentSkills) ? findASkillAlsoWithoutIsDelete(skill, currentSkills) : false)
                        : false,
                // isNew: isNewSkillSet.has(skill.skill.toLowerCase())
            })) || [];

        return sorted;
    }

    //SET SKILL SUGGESTION AFTER SKILL SEARCH API SUCCESS
    const setSkillSuggestions = (res) => {
        const sorted = autoHandleSuggestionCheckbox(res);
        dispatch(setDropdownOptions({ key: "skills", value: sorted }))
        setShowDropdown(true);
    };

    //SKILL SUGGESTION API CALL ON INPUT CHANGE
    useEffect(() => {
        if (enableTypeahead) {
            if (inputValue.length > 2) {
                setSuggestionLoader(true)
                setShowDropdown(true);
                debounceApiForSkillSearch(
                    inputValue,
                    selectedLanguage,
                    setSkillSuggestions,
                    setSuggestionLoader,
                    contentLabel
                );
            } else {
                dispatch(setDropdownOptions({ key: "skills", value: [] }))
                setShowDropdown(false);
            }
        } else {

        }
    }, [inputValue, enableTypeahead]);

    //HANDLE CHECKBOX CHANGE FROM  THE DROPDOWN LIST
    const handleCheckboxChange = (skill) => {
        console.log("handleCheckboxChange skill ", skill)
        if (!skill) return;

        const isSelected = currentSkills?.find((s) => s?.skill === skill?.skill);
        console.log("is Selected",isSelected)
        console.log("CurrentSkill",currentSkills)
        const baseSkillData = {
            ...skill,
            isUserSkill: false,
            skillOccupation: skill.skill,
            occupation: Array.isArray(skill?.occupationsRelated)
                ? skill.occupationsRelated?.filter(s => s.length > 1).join(", ")
                : "",
            checked: false,
            idss: crypto.randomUUID(), // dummy unused
            skillid: skill.id,
            min: "0",
            max: "0",
            timeunit: "year",
        };

        if (saveStatus[1] !== true) {
            if (isSelected) {
                // Handle delete logic
                const delData = currentSkills?.find((s) => s?.skill === skill?.skill);
                if (delData) {
                    dispatch(setDeletePreSkillInCreate([...deleteSkillInCreate, delData]));
                }

                const updated = currentSkills?.filter((s) => s?.skill?.trim()?.toLowerCase() !== skill?.skill?.trim()?.toLowerCase());
                      const newSkillsValue = { ...skills, [isActiveCard?'preSkill':'abtainSkill']: updated
                        };
                         console.log("Unselected isstat ",updated,"new Skills",newSkillsValue)
                     dispatch(setCreateCoursePrequestSkills(newSkillsValue || []));
            } else {
                 
                // Add new skill
                const updated = [...currentSkills, { ...baseSkillData, isNew: true }];
                const newSkillsValue = {...skills,[isActiveCard?'preSkill':'abtainSkill']: updated};
     console.log("Unselected isstat elese",updated)
                dispatch(setCreateCoursePrequestSkills(newSkillsValue || []));
            }
        } else {
            if (isSelected) {
                const updated = currentSkills?.filter((s) => s?.skill !== skill?.skill);
                console.log("Unselected",updated)
                const newSkillsValue = {...skills,[isActiveCard ? 'preSkill':'abtainSkill']: updated};
                dispatch(setCreateCoursePrequestSkills(newSkillsValue || []));
            } else {
                
                const updated = [...currentSkills, baseSkillData];
                  console.log("Unselected eles",updated)
                const newSkillsValue = {...skills,[isActiveCard?'preSkill':'abtainSkill']: updated
                 };

                dispatch(setCreateCoursePrequestSkills(newSkillsValue || []));
            }
        }
    };


    //HANDLE DOUBLE CLICK ON DROPDOWN LIST
    const handleDoubleClick = (skill) => {
        handleCheckboxChange(skill);
    };

    // HANDLE CLICK OUTSIDE OF DROPDOWN
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setShowDropdown(false);
            if (!enableTypeahead) {
                setInputValue("")
            }

        }
    };

    useEffect(() => {
        const validSkills = dropdownOptions?.skills?.filter((s) => s.skill) || [];
        const sorted = autoHandleSuggestionCheckbox(validSkills);
        dispatch(setDropdownOptions({ key: "skills", value: sorted }))
    }, [skills])


    //MANAGE MOUSE EVENT
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    //HANDLE NEW SKILL ADD TO THE MASTER
    const handleNewSkillCheck = async () => {
        
        // Check for duplicate in  skills list  by skill name 
        let isAlreadySelected = currentSkills?.some(
            (s) =>
                s.skill?.trim()?.toLowerCase() === inputValue?.trim()?.toLowerCase()
        );

        if (isAlreadySelected) {
            showErrorToast(`${inputValue?.trim()} ${contentLabel("IsAlreadyPresent", "is already present")}`);
            return;
        }



        try {
            dispatch(setIsApiLoading(true));

            const newSkillInputValue = inputValue?.trim();
            if (!newSkillInputValue) {
                showErrorToast(contentLabel("PleaseEnterASkill", "nf PPlease enter a skill"));
                dispatch(setIsApiLoading(false));
                return;
            }

            const newSkill = await PostSkillsIntoMaster({
                skill: newSkillInputValue,
                occupationsRelated: selectedOccupationObj?.occupationName || "",
            });

            if (!newSkill?.data?.message) {
                dispatch(setIsApiLoading(false));
                return;
            }

            const newSkillObj = newSkill.data.skill || {};


            // Check for duplicate by skill ID or skill name
            let isAlreadySelected = currentSkills?.some(
                (s) =>
                    s.skill?.trim()?.toLowerCase() === inputValue?.trim()?.toLowerCase()
            );

            if (isAlreadySelected) {
                showErrorToast(`${newSkillObj?.skill} ${contentLabel("IsAlreadyPresent", "is already present")}`);
                dispatch(setIsApiLoading(false));
                return;
            }

            let updated;
            const baseSkillData = {
                ...newSkillObj,
                isUserSkill: false,
                skillOccupation: newSkillObj.skill,
                occupation: Array.isArray(newSkillObj?.occupationsRelated)
                    ? newSkillObj.occupationsRelated?.filter(s => s.length > 1).join(", ")
                    : "",
                checked: false,
                idss: crypto.randomUUID(), // dummy unused
                skillid: newSkillObj.id,
                min: "0",
                max: "0",
                timeunit: "year",
                isNew: true
            };
            console.log("baseSkillData ", baseSkillData)
            if (newSkillObj?.mstatus === "W") {
                updated = [...currentSkills, { ...baseSkillData, isUserSkill: false, exceptionHandleRequired: true }];
            }
            else if (newSkill?.data?.message === "Already present.") {



                updated = [...currentSkills, { ...baseSkillData, isUserSkill: false, exceptionHandleRequired: false }];


            }
            else {
                updated = [...currentSkills, { ...baseSkillData, isUserSkill: false, exceptionHandleRequired: false }];

            }

            const newSkillsValue = {
            ...skills,
            [isActiveCard?'preSkill':'abtainSkill']: updated
            };
            
            dispatch(setCreateCoursePrequestSkills(newSkillsValue))
            setNewSkillInput("");
             setInputValue("");
        } catch (error) {
            console.error("Error while adding new skill:", error);
            showErrorToast(contentLabel("SomethingWentWrong", "Something went wrong"));
        } finally {
            dispatch(setIsApiLoading(false));
            
        }
    };

    return (
        <>
            <Col sm={6}>
                <SkillManagementDropdown
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    showDropdown={showDropdown}
                    setShowDropdown={setShowDropdown}
                    options={
                        (dropdownOptions?.skills?.filter((s) => s.skill.toLowerCase().includes(inputValue.toLowerCase())) || [])
                    }
                    suggestionLoader={suggestionLoader}
                    selectedSkills={currentSkills}
                    onCheckboxChange={handleCheckboxChange}
                    onDoubleClick={handleDoubleClick}
                    label={contentLabel("Skill", "nf Skill")}
                    dropdownRef={dropdownRef}
                    enableTypeahead={enableTypeahead}
                    placeholder={
            enableTypeahead
              ? contentLabel(
                  "TypeMoreThan2LettersForOptions",
                  "nf Please enter more than 2 letters for options"
                )
              : contentLabel("PleaseSelectASkill", "nf Please select a skill")
          }  />
            </Col>
            <Col sm={6}>
                <label htmlFor="" className="form-label fw-bold">{contentLabel("NotPresentClickPlus", "nf Skill not present in the list? Click + to add")}</label>
                {/* <NewSkillPlusButton
                    value={newSkillInput}
                    onChange={(e) => {
                        setNewSkillInput(e.target.value)
                    }}
                    onClick={() => handleNewSkillCheck()}
                    onOpen={() => setIsEditing(true)}
                    onClose={() => {
                        setIsEditing(false)
                        setNewSkillInput("")
                    }}
                    isEditing={isEditing}
                    disabled={false}
                    placeholder={contentLabel(
                        "EnterNewSkill",
                        "Enter a new skill"
                    )}
                /> */}

                <NewSkillPlusButton
                value={inputValue}
                onChange={(e) => {
                  setNewSkillInput(e.target.value);
                console.log("New Skill Input Changed: ", e.target.value);
                }}
          onClick={() => handleNewSkillCheck()}
          onOpen={() => handleNewSkillCheck()}
          // onOpen={() => setIsEditing(true)}
          onClose={() => {
            setIsEditing(false);
            setNewSkillInput("");
          }}
          isEditing={isEditing}
          disabled={false}
          placeholder={contentLabel("EnterNewSkill", "Enter a new skill")}
        />
            </Col>
        </>
    );
};

export default CouresSkillSearchDirect;