import React, { useState } from "react";
import { icons } from "../../../../constants";
import { useSelector } from "react-redux";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const ResumePillSkills = ({ resumeOcc, setResumeOcc }) => {
    // Selected language
    const selectedLanguage = useSelector((state) => state.language);
    // State to track which occupation is adding a new skill
    const [editingOccupationId, setEditingOccupationId] = useState(null);
    const [newSkill, setNewSkill] = useState("");

    // Toggle a single skill within an occupation
    const handleToggleSkill = (occupationId, skillId) => {
        setResumeOcc(prevResumeOcc =>
            prevResumeOcc.map(occupation =>
                occupation.id === occupationId
                    ? {
                        ...occupation,
                        skills: occupation.skills.map(skill =>
                            skill.id === skillId ? { ...skill, active: !skill.active } : skill
                        )
                    }
                    : occupation
            )
        );
    };

    // Check if all skills in an occupation are selected
    const areAllSelected = occupation =>
        occupation.skills?.every(skill => skill.active);

    // Toggle all skills within an occupation
    const handleSelectAll = occupationId => {
        setResumeOcc(prevResumeOcc =>
            prevResumeOcc.map(occupation =>
                occupation.id === occupationId
                    ? {
                        ...occupation,
                        skills: occupation.skills.map(skill => ({
                            ...skill,
                            active: !areAllSelected(occupation),
                        }))
                    }
                    : occupation
            )
        );
    };

    // Handle clicking the plus icon
    const handleSkillAddClick = occupationId => {
        setEditingOccupationId(occupationId);
        setNewSkill(""); // Reset input
    };

    // Handle input change
    const handleSkillInputChange = e => {
        setNewSkill(e.target.value);
    };

    // Handle pressing Enter in the input field
    const handleSkillInputKeyDown = (e, occupationId) => {
        if (e.key === "Enter" && newSkill.trim() !== "") {
            setResumeOcc(prevResumeOcc =>
                prevResumeOcc.map(occupation =>
                    occupation.id === occupationId
                        ? {
                            ...occupation,
                            skills: [
                                ...occupation.skills,
                                {
                                    id: Date.now(),
                                    userId:getCookie("userId"),
                                    skill: newSkill, skillOccupation: `${newSkill} | | ${occupation?.occupation}`,
                                    mlanguage: selectedLanguage,
                                    active: false,
                                    occupation: occupation?.occupation,
                                    new: true
                                }, // New skill added
                            ]
                        }
                        : occupation
                )
            );
            setEditingOccupationId(null); // Hide input after adding
            setNewSkill(""); // Clear input
        }
    };

    const handleDeleteNewSkill = (occupationId, skillId) => {
        setResumeOcc(prevResumeOcc =>
            prevResumeOcc.map(occupation =>
                occupation.id === occupationId
                    ? {
                        ...occupation,
                        skills: occupation.skills.filter(skill => skill.id !== skillId) // Remove the skill
                    }
                    : occupation
            )
        );
    };


    return (
        <>
            {resumeOcc?.map((occupationItem) => (
                <div key={occupationItem.id} className="mb-5">
                    {/* Occupation Title */}
                    <div className="d-flex justify-content-between">
                        <p className="fw-bold">{occupationItem?.occupation}</p>

                        {!!occupationItem?.skills?.length && (
                            <div className="d-flex align-items-center gap-2 px-2 mb-3">
                                <input
                                    type="checkbox"
                                    checked={areAllSelected(occupationItem)}
                                    onChange={() => handleSelectAll(occupationItem?.id)}
                                    className="me-1"
                                />
                                <label
                                    style={{ fontWeight: "600", cursor: "pointer" }}
                                    onClick={() => handleSelectAll(occupationItem?.id)}
                                >
                                    Select All
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Skills List */}
                    <div className="d-flex gap-2 flex-wrap">
                        {occupationItem?.skills?.map(skill => (
                            <div
                                key={skill.id}
                                className="d-flex justify-content-between align-items-center p-2"
                                style={{
                                    borderRadius: "20px",
                                    height: "30px",
                                    fontWeight: "600",
                                    color: skill.active ? "white" : "var(--primary-color)",
                                    backgroundColor: skill.active ? "var(--primary-color)" : "var(--PalateTertiary)",
                                    cursor: "pointer",
                                    transition: "opacity 0.3s ease, color 0.3s ease",
                                }}
                                onClick={() => handleToggleSkill(occupationItem?.id, skill.id)}
                            >
                                {skill.skill}

                                {
                                    skill?.new &&
                                    <span
                                        onClick={() => handleDeleteNewSkill(occupationItem?.id, skill.id)}
                                        className="ms-2"
                                        style={{ zIndex: '99999' }}
                                    >
                                        <icons.CloseOutlinedIcon fontSize="16px" />
                                    </span>
                                }
                            </div>
                        ))}

                        {/* Add New Skill */}
                        {editingOccupationId === occupationItem.id ? (
                            <>
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={handleSkillInputChange}
                                    onKeyDown={e => handleSkillInputKeyDown(e, occupationItem.id)}
                                    autoFocus
                                    className="p-2"
                                    style={{
                                        borderRadius: "20px",
                                        height: "30px",
                                        // fontWeight: "600",
                                        // color: "var(--primary-color)",
                                        backgroundColor: "var(--PalateTertiary)",
                                        border: "none",
                                        outline: "none",
                                    }}
                                />
                                <div
                                    className="d-flex justify-content-between align-items-center p-2"
                                    style={{
                                        position: 'relative',
                                        left: '-2.5rem',
                                        borderRadius: "20px",
                                        height: "30px",
                                        fontWeight: "600",
                                        color: "var(--primary-color)",
                                        cursor: "pointer",
                                        transition: "opacity 0.3s ease, color 0.3s ease",
                                    }}
                                    onClick={() => handleSkillInputKeyDown({ key: 'Enter' }, occupationItem.id)}
                                >
                                    <icons.FaPlus />
                                </div>
                            </>
                        ) : (
                            <div
                                className="d-flex justify-content-between align-items-center p-2"
                                style={{
                                    borderRadius: "20px",
                                    height: "30px",
                                    fontWeight: "600",
                                    color: "var(--primary-color)",
                                    backgroundColor: "var(--PalateTertiary)",
                                    cursor: "pointer",
                                    transition: "opacity 0.3s ease, color 0.3s ease",
                                }}
                                onClick={() => handleSkillAddClick(occupationItem.id)}
                            >
                                <icons.FaPlus />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </>
    );
};

export default ResumePillSkills;







{/* Select All Checkbox */ }
{/* <div className="d-flex align-items-center gap-2 px-2 mb-3">
                <input
                    type="checkbox"
                    checked={areAllSelected}
                    onChange={handleSelectAll}
                    className="me-1"
                />
                <label style={{ fontWeight: '600', cursor: 'pointer' }} onClick={handleSelectAll}>
                    Select All
                </label>
            </div> */}

{/* Skill List */ }
{/* <div className="d-flex gap-2 flex-wrap">
                {skills?.map((skill) => (
                    <div
                        key={skill.id}
                        className="d-flex justify-content-between align-items-center p-2"
                        style={{
                            borderRadius: '20px',
                            height: '30px',
                            fontWeight: '600',
                            color: 'var(--primary-color)',
                            backgroundColor: 'var(--PalateTertiary)',
                            cursor: 'pointer',
                            transition: 'opacity 0.3s ease, color 0.3s ease',
                        }}
                        onClick={() => handleToggleSkill(skill.id)}
                    >
                        <input
                            type="checkbox"
                            checked={skill.active}
                            className='me-2'
                            onChange={() => handleToggleSkill(skill.id)}
                        />
                        {skill.skill}
                    </div>
                ))}
            </div> */}


{/* <Row className="">
{skills?.map((skill) => (
    <Col xl={6} className='px-2'>
        <Col xl={12}
            key={skill.id}
            className="d-flex  align-items-center justify-content-between p-2 mb-2"
            style={{
                borderRadius: '20px',
                height: '50px',
                fontWeight: '600',
                color: 'var(--primary-color)',
                backgroundColor: 'var(--PalateTertiary)',
                cursor: 'pointer',
                transition: 'opacity 0.3s ease, color 0.3s ease',
            }}
      
        >
        <Col xl={6} onClick={() => handleToggleSkill(skill.id)}>
            <input
                type="checkbox"
                checked={skill.active}
                className='me-2'
                onChange={() => handleToggleSkill(skill.id)}
            />
            {skill.skill}
        </Col>


            <Col xl={4}>

                <select
                    value={skill?.occupation}
                    onChange={() => handleOccupationChange()}
                    class="form-select form-select-lg " 
                    style={{border:'none', width:'100%', marginRight:'5rem' }}
                >
                    <option value="" disabled selected>Select an occupation</option>
                    {resumeOcc?.map((option, index) => (
                        <option key={index} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

            </Col>

        </Col>

    </Col>
))}
</Row> */}



