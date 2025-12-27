import { useSelector,useDispatch } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import { Col } from "react-bootstrap";

import icons from '../../../../constants/icons';
import useContentLabel from "../../../../hooks/useContentLabel";
import { fetchOccupationMaster } from "../../../../reducer/masterTables/occupationSlice";
import { setDropdownOptions, setIsSkillApiLoading, setSelectedOccupationObj } from "../../../../reducer/mySkills/AddMultipleSkillsSlice";

import getSkillsByOccupationApi from "../../../../api/skillOwner/mySkill/getSkillsByOccupationApi";

import CouresSkillSearchDirect from "./CouresSkillSearchDirect";

const CouresSkillSearchThruOccupation = ({ isActiveCard,usedInCategory = false }) => {
    const dispatch = useDispatch()
    const { selectedSkillsforAdd, dropdownOptions, isOccupationApiLoading, selectedOccupationObj } = useSelector((state) => state.addMultipleSkills);
    const { data: occupationMasterData, status: occupationmasterStatus } =
        useSelector((state) => state.occupationRedux);
    const selectedLanguage = useSelector((state) => state.language);
    const contentLabel = useContentLabel();
    
    const { skills,saveStatus } = useSelector((state) => state.createCourse );
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const inputRef = useRef();
    const dropdownWrapperRef = useRef(null);
    useEffect(() => {
        if (occupationmasterStatus === "idle") {
            dispatch(fetchOccupationMaster());
        }
    }, [dispatch, occupationmasterStatus]);

    const occupationList = useMemo(() => {
        return usedInCategory ? (dropdownOptions.occupations || []) : (occupationMasterData || []);
    }, [usedInCategory, dropdownOptions.occupations, occupationMasterData]);


    const userSkills = useMemo(
        () => selectedSkillsforAdd.filter((s) => s?.isUserSkill),
        [selectedSkillsforAdd]
    );
    const userSkillSet = useMemo(
        () => new Set(userSkills.map((s) => s?.skill.toLowerCase())),
        [userSkills]
    );

    //for occupation filter input
    const [occupationFilter, setOccupationFilter] = useState("");

    // Find if a skill is present in the list.
    const findASkillAlsoWithoutIsDelete = (data, skillsList) => {
        try {
            if (!data || !Array.isArray(skillsList)) return false;


            return skillsList.some(skill => {
                return skill?.skill.trim()?.toLowerCase() === data?.skill.trim()?.toLowerCase() && (skill?.isNew !== true);
            });



        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleOccupationSelect = async (occupation) => {
        if (
            !occupation || // checks for null or undefined or falsy
            (typeof occupation === "object" && Object.keys(occupation).length === 0)
        ) {
            return
        }

        dispatch(setSelectedOccupationObj(occupation))
        setOccupationFilter(occupation?.occupationName || "")
        dispatch(setDropdownOptions({ key: "skills", value: [] }));
        setDropdownVisible(false)
        dispatch(setIsSkillApiLoading(true))

        try {
            const res = await getSkillsByOccupationApi({ occupation: (occupation.occupationName || ""), mlanguage: selectedLanguage })
            const skillOptions = (res?.data || [])
                .filter((s) => s.skill) // filter out null/undefined skill values
                .sort((a, b) => a.skill.localeCompare(b.skill))
                .map((skill) => ({
                    ...skill,
                    id: skill.id,
                    name: skill.skill,
                    // isUserSkill: userSkillSet.has(skill.skill.toLowerCase()),
                    isUserSkill
                        :
                        saveStatus[1] === true ?
                            (Array.isArray(skills[isActiveCard?'preSkill':'abtainSkill']) ? findASkillAlsoWithoutIsDelete(skill, skills[isActiveCard?'preSkill':'abtainSkill']) : false)
                            : false,
                }));

            dispatch(setDropdownOptions({ key: "skills", value: skillOptions }));
        } catch (error) {
            console.error("Error fetching skills by occupation:", error);
        } finally {
            dispatch(setIsSkillApiLoading(false))

        }
    };


    return (
        <>
            {/* Occupation Dropdown */}
            <Col sm={6} className="mb-4">
                <label className="form-label fw-bold">{contentLabel("Occupation", "Occupation")}</label>
                <div className="position-relative "
                    ref={dropdownWrapperRef}
                    tabIndex={-1}
                    onBlur={(e) => {
                        const related = e.relatedTarget;
                        const clickedOutside = !dropdownWrapperRef.current.contains(related);

                        if (clickedOutside) {
                            setDropdownVisible(false);

                            // Clear input if no occupation is selected or mismatched
                            if (!selectedOccupationObj?.occupationName || selectedOccupationObj.occupationName !== occupationFilter) {
                                setOccupationFilter("");
                            }
                        }
                    }}
                >
                    <input
                        ref={inputRef}
                        className="form-control"
                        placeholder={contentLabel("PleaseSelectAnOccupation", "Please select an occupation")}
                        value={occupationFilter}
                        onChange={(e) => {
                            setOccupationFilter(e.target.value)
                            setDropdownVisible(true);
                        }
                        }
                        onFocus={() => {
                            setDropdownVisible(true);
                            setOccupationFilter("")
                            dispatch(setSelectedOccupationObj(null))
                        }}
                      
                    />

                    <span
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            pointerEvents: "none",
                            fontSize: "0.9rem",
                            color: "#999",
                        }}
                    >
                        <icons.KeyboardArrowDownIcon />
                    </span>

                    {  //occupation loader for while fetching all the occupations form master
                        (occupationmasterStatus === "loading") && isDropdownVisible &&
                        <ul className="dropdown-menu show w-100 mt-1" style={{ maxHeight: 150, overflowY: "auto" }}>
                            <li className="dropdown-item text-muted no-hover-list">{contentLabel("Loading", "nf Loading")}...</li>
                        </ul>
                    }

                    {   //occupation loader after user select category (to fetch occupation with related category)
                        usedInCategory && isOccupationApiLoading && isDropdownVisible &&
                        <ul className="dropdown-menu show w-100 mt-1" style={{ maxHeight: 150, overflowY: "auto" }}>
                            <li className="dropdown-item text-muted no-hover-list">{contentLabel("Loading", "nf Loading")}...</li>
                        </ul>
                    }

                    {  //if both of the above not loading                        
                        (occupationmasterStatus !== "loading") && !isOccupationApiLoading && isDropdownVisible &&
                        <ul className="dropdown-menu show w-100 mt-1" style={{ maxHeight: 150, overflowY: "auto" }}>
                            {occupationList
                                .filter((o) => o.occupationName.toLowerCase().includes(occupationFilter.toLowerCase()))
                                .map((occupation) => (
                                    <li
                                        key={occupation.id}
                                        className={`dropdown-item list-group-item-action  
                                        }`}
                                        // ${selectedOccupation?.id === occupation.id ? "active" : ""
                                        onClick={() => handleOccupationSelect(occupation)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {occupation.occupationName || ""}
                                    </li>
                                ))}
                            {
                                occupationList
                                    .filter((o) => o.occupationName.toLowerCase().includes(occupationFilter.toLowerCase()))?.length === 0 &&
                                <>
                                    <li

                                        className={`dropdown-item list-group-item-action 
                                       no-hover-list }`}
                                        style={{ opacity: ".6" }}

                                    >
                                        {contentLabel("NoOptions", "No Options")}
                                    </li>
                                </>
                            }
                        </ul>
                    }
                </div>
            </Col>
            <Col sm={6} >

            </Col>


            {selectedOccupationObj &&
                <CouresSkillSearchDirect isActiveCard={isActiveCard} enableTypeahead={false} />
            }


        </>
    );
};

export default CouresSkillSearchThruOccupation;