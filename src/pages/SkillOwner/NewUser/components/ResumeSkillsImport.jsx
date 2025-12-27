import React from 'react'
import useContentLabel from '../../../../hooks/useContentLabel';
import { truncate } from '../../../../components/helperFunctions/GridHelperFunction';

const ResumeSkillsImport = ({ resumeSkills }) => {
    console.log(resumeSkills);
    const contentLabel = useContentLabel()

    return (
        <div style={{
            position: "relative",
            opacity: true ? '.5' : '1',
            pointerEvents: true ? 'none' : ''
        }}>
            <div className="d-flex justify-content-end fw-bold text-primary-color" style={{ top: '1.3rem', right: '2rem' }}>{contentLabel('Imported', 'nf Imported')}</div>
            <div className="d-flex flex-wrap gap-2 font-6 cursor-pointer mt-4">
                {
                    resumeSkills?.map((skill) => {

                        if (skill?.import) {

                            return (
                                <div
                                    key={skill.id}
                                    className="d-flex  align-items-center p-2"
                                    // style={{
                                    //     borderRadius: "20px",
                                    //     height: "30px",
                                    //     fontWeight: "600",
                                    //     color: skill?.active ? "white" : "var(--primary-color)",
                                    //     backgroundColor: skill?.active ? "var(--primary-color)" : "var(--PalateTertiary)",
                                    //     cursor: "pointer",
                                    //     transition: "opacity 0.3s ease, color 0.3s ease",
                                    // }}
                                    style={{
                                        borderRadius: "20px",
                                        height: "30px",
                                        backgroundColor: "var(--PalateTertiary)",
                                        color: "var(--primary-color)",
                                        opacity: true ? "" : "1",
                                        fontWeight: "600",
                                        cursor: true ? "grab" : "pointer",
                                        width: "180px",
                                        padding: " 0.5rem 2.5rem 0.5rem 0.5rem ",
                                        whiteSpace: "nowrap",
                                        justifyContent: "center",
                                    }}
                                >                           
                                       {truncate(skill?.skill || "", 20)}

                                </div>
                            )
                        }
                    })
                }
            </div>
        </div>
    )
}

export default ResumeSkillsImport
