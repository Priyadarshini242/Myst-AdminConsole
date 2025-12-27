import React from 'react'

const CourseQuestionsComponent = ({ id="", label="", required = "No", type="", values="" }) => {
    return (
        <div className=" mb-3 mt-3" key={id}>
            <div>
                {label}{" "}
                {required && (
                    <span style={{ color: "red" }}> *</span>
                )}
            </div>
            {(type === "Options" ||
                type === "nf Options") && (
                    <div className="form-check">
                        {values && values.length > 0 && values.map((option, optionIndex) => (
                            <div className='d-flex' key={optionIndex} >
                                <input

                                    type="radio"
                                    value={option}
                                    disabled
                                />
                                <div className="ms-2">
                                    {option}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            {(type === "Text" ||
                type === "nf Text") && (
                    <div className="form-group">
                        <textarea
                            className="form-control"
                            rows="3"
                            disabled
                        ></textarea>
                    </div>
                )}
            {(type === "Number" ||
                type === "nf Number") && (
                    <div className="form-group w-25">
                        <input type="Number" className="form-control" />
                    </div>
                )}
        </div>
    )
}

export default CourseQuestionsComponent