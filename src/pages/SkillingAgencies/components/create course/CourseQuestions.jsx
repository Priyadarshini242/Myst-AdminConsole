import React, { useEffect } from "react";
import useContentLabel from "./../../../../hooks/useContentLabel";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Row } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import icons from "./../../../../constants/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import CustomButton from "../../../../components/atoms/Buttons/CustomButton";
import { setCourseQuestions,setCourseInfo } from "../../../../reducer/skilling agency/create course/createCourseSlice";
import DeleteApi from "../../../../api/DeleteData/DeleteApi";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { LIMITED_SPL_CHARS } from "../../../../config/constant";

const CourseQuestions = ({isCourseLoading, pagemode, setSteps, handleSaveCourse }) => {
  /* CONTENT LABEL */
  const contentLabel = useContentLabel();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname,state } = useLocation();
  const { mode } = state || {};
  
  //store

  const { language: selectedLanguage, content } = useSelector((state) => state);
  const {courseinfo, data, remoteCheckBox, skills, questions } = useSelector(
    (state) => state.createCourse
  );



  const [isDeletingCourseQuestion, setIsDeletingCourseQuestion] =
    useState(false);

  const queOptions = [
    {
      value: "Options",
      label:
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "Options"
          ) || {}
        ).mvalue || "nf Options",
    },
    {
      value: "Text",
      label:
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "Text"
          ) || {}
        ).mvalue || "nf Text",
    },
    {
      value: "Number",
      label:
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "Number"
          ) || {}
        ).mvalue || "nf Number",
    },
  ];

  const components = {
    DropdownIndicator: null,
  };
  const createOption = (label) => ({
    label,
    value: label,
  });

  const [question, setQuestion] = useState("");
  const [questionArray, setQuestionArray] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // question options......
  const [inputValue, setInputValue] = useState("");
  const [optionArray, setOptionArray] = useState([]);

  const handleOpportunityQuestion = (value) => {   
    dispatch(setCourseInfo({...courseinfo, ['courseQuestions']:value,['isQuestion']:false}));
  };

  const handleKeyDown = (event) => {
     if (LIMITED_SPL_CHARS.includes(event.key)) {
          event.preventDefault();
          showErrorToast(
            contentLabel(
              "SpecialCharNotAllowed",
              "nf Special Characters Not Allowed"
            )
          );
        }
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setOptionArray((prev) => [...prev, createOption(inputValue)]);
        setInputValue("");
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  const handleAnswerChange = (newValue) => {
    setSelectedAnswer(newValue);
  };

  const handleAddQuestion = () => {
    if (
      question.trim() === "" ||
      selectedAnswer === null ||
      ((selectedAnswer.label === "Options" ||
        selectedAnswer.label === "nf Options") &&
        optionArray.length === 0)
    ) {
      return;
    }

  
      handleOpportunityQuestion([
      ...(courseinfo?.courseQuestions || []),
      {
        question: question,
        answer: selectedAnswer,
        options: [...optionArray],
        id: crypto.randomUUID(),
        required: false,
        rank: (courseinfo?.courseQuestions?.length || 0) + 1,
      },
    ]);
    // setQuestionArray((currentValue) => {
    //   return [
    //     ...currentValue,
    //     {
    //       question: question,
    //       answer: selectedAnswer,
    //       options: [...optionArray],
    //       id: crypto.randomUUID(),
    //       required: false,
    //       rank: currentValue.length + 1,
    //     },
    //   ];
    // });
    setQuestion(" ");

    setSelectedAnswer(null);

    setOptionArray([]);
  };

  const deleteQuestion = async (questionId) => {
    // console.log(questionId);
    // if (questionId?.includes('CQSTN')) {
    //   setIsDeletingCourseQuestion(true)
    //   try {
    //     await DeleteApi('CQuestions', questionId)
    //     const updatedQuestions = questions?.filter(
    //       (que) => que.id !== questionId
    //     );
    //     handleOpportunityQuestion(updatedQuestions.map((question, index) => ({
    //       ...question,
    //       rank: index + 1,
    //     })));
    //   } catch (error) {
    //     showErrorToast(contentLabel('SomethingWentWrong', 'nf Something Went Wrong'))
    //     console.log(error);
    //   } finally {
    //     setIsDeletingCourseQuestion(false)
    //   }
    //   return
    // } else {
    //   const updatedQuestions = questions?.filter(
    //     (que) => que.id !== questionId
    //   );
    //   console.log(updatedQuestions);

    //   handleOpportunityQuestion(updatedQuestions.map((question, index) => ({
    //     ...question,
    //     rank: index + 1,
    //   })));

    // }

    const updatedQuestions = courseinfo?.courseQuestions?.filter((que) => que.id !== questionId);
    handleOpportunityQuestion(
      updatedQuestions.map((question, index) => ({
        ...question,
        rank: index + 1,
      }))
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorderedItems = Array.from(courseinfo?.courseQuestions);
    const [removed] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, removed);

    // Update the rank
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      rank: index + 1,
      isEdit:item?.id?.includes("CQSTN")? true : false
    }));

    handleOpportunityQuestion(updatedItems);
  };

  const renderText = (text, maxLength = 30) => {
    if (text.length > maxLength) {
      return <span>{text}</span>;
    } else {
      return (
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            display: "inline-block",
            width: "100%",
            verticalAlign: "top",
          }}
        >
          {text}
        </span>
      );
    }
  };

  const toggleRequired = (questionId, checked) => {
    handleOpportunityQuestion(
      courseinfo?.courseQuestions?.map((que) => {
        if (que?.id === questionId) return { ...que, required: checked,isEdit:que?.id?.includes("CQSTN")? true:false };
        return que;
      })
    );
  };

console.log("select code",selectedAnswer)

  return (
    <div
      className="d-flex flex-column justify-content-between"
      style={{ minHeight: "27.7rem" }}
    >
      <form>
        <Row className="row">
          <Col xs={12}>
            <div className="mb-3">
              <label
                className="form-label fw-bold"
                style={{ fontWeight: "bold" }}
              >
                {contentLabel("Question", "nf Question")}
              </label>
              <input
                type="text"
                className="form-control"
                value={question}
                onChange={(e) =>{setQuestion(e.target.value)
                }}
              />
            </div>
          </Col>

          <Col xs={4}>
            <div className="mb-3">
              <label className="form-label" style={{ fontWeight: "bold" }}>
                {contentLabel("AnswerType", "nf Answer Type")}
              </label>
              <CreatableSelect
                isClearable
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
                options={queOptions}
                value={selectedAnswer}
                onChange={handleAnswerChange}
              />
            </div>
          </Col>
          <Col>
            <div
              className={`mb-3 ${
                !selectedAnswer ||
                !(
                  selectedAnswer.label === "Options" ||
                  selectedAnswer.label.startsWith("nf Options")
                )
                  ? "d-none"
                  : ""
              }`}
            >
              <label
                className="form-label fw-bold"
                style={{ fontWeight: "bold" }}
              >
                {contentLabel("Options", "nf Options")}
              </label>
              <CreatableSelect
                components={components}
                inputValue={inputValue}
                isClearable
                isMulti
                menuIsOpen={false}
                onChange={(newValue) => setOptionArray(newValue)}
                onInputChange={(newValue) => setInputValue(newValue)}
                onKeyDown={handleKeyDown}
                placeholder={
                  (
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "TypeOptions"
                    ) || {}
                  ).mvalue || "nf Type options and press enter..."
                }
                value={optionArray}
              />
            </div>
          </Col>

          <div className="col-12 d-flex justify-content-end">
            <div className="mb-3">
              <Button
              disabled={
                   (question != null &&
  question.trim() !== "" &&
  selectedAnswer != null &&
  (
    selectedAnswer.value !== "Options" &&
    selectedAnswer.value !== "nf Options"
    ||
    (Array.isArray(optionArray) && optionArray.length > 0)
  ))?false:true
                  }
                variant="primary"
                onClick={handleAddQuestion}
                style={{
                  backgroundColor: "var(--primary-color)",
                  border: "none",
                }}
              >
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "AddQuestion"
                  ) || {}
                ).mvalue || "nf Add Question"}
              </Button>
            </div>
          </div>

          <div
            className={`col-12 ${
              courseinfo?.courseQuestions && courseinfo?.courseQuestions.length === 0 ? "d-none" : ""
            }`}
          >
            <span className="text-secondary ">
              <i>
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "DragAndDropQuestion"
                  ) || {}
                ).mvalue || "nf *Drag and drop to reorder your questions "}
              </i>
            </span>
            {courseinfo?.courseQuestions && courseinfo?.courseQuestions?.length>0 &&
            <div className="mb-3">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided) => (
                    <table
                      className="table table-hover"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Question"
                              ) || {}
                            ).mvalue || "nf Question"}
                          </th>
                          <th scope="col">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "AnswerType"
                              ) || {}
                            ).mvalue || "nf Answer Type"}
                          </th>
                          <th scope="col">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Options"
                              ) || {}
                            ).mvalue || "nf Options"}
                          </th>
                          <th scope="col">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Required"
                              ) || {}
                            ).mvalue || "nf Required"}
                          </th>
                          <th scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseinfo?.courseQuestions?.map((obj, index) => (
                          <Draggable
                            key={obj.id}
                            draggableId={obj.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  border: snapshot.isDragging
                                    ? "2px solid var(--primary-color)"
                                    : "inherit",
                                }}
                              >
                                <th
                                  scope="row"
                                  style={{
                                    width: "60px",
                                  }}
                                >
                                  {obj.rank}
                                </th>
                                <td
                                  style={{
                                    width: "340px",
                                  }}
                                  className="wrap-text"
                                >
                                  {obj.question}
                                </td>
                                <td
                                  style={{
                                    width: "200px",
                                  }}
                                  className="wrap-text"
                                >
                                  {obj?.answer?.label}
                                </td>
                                <td
                                  style={{
                                    width: "360px",
                                  }}
                                  className="wrap-text"
                                >
                                  {obj.options?.map((option) => option.label)?.join(", ")}
                                </td>
                                <td
                                  style={{
                                    width: "200px",
                                  }}
                                  className="wrap-text"
                                >
                                  <input
                                    type="checkbox"
                                    checked={obj.required}
                                    onChange={(e) =>
                                      toggleRequired(obj.id, e.target.checked)
                                    }
                                  />
                                </td>
                                <td
                                  onClick={() => deleteQuestion(obj?.id)}
                                  style={
                                    isDeletingCourseQuestion
                                      ? { opacity: ".5", pointerEvents: "none" }
                                      : { cursor: "pointer", width: "40px" }
                                  }
                                  className="wrap-text"
                                >
                                  <icons.DeleteOutlineOutlinedIcon
                                    style={{ color: "var(--primary-color)" }}
                                  />
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </tbody>
                    </table>
                  )}
                </Droppable>
              </DragDropContext>
            </div>}
          </div>
        </Row>
      </form>
      <div className="d-flex justify-content-between gap-3">
        <CustomButton
          title={contentLabel("Back", "nf Back")}
          onClick={() => {
            setSteps((prev) => {
              return { ...prev, step3: false };
            });
          }}
        />
         <div className="d-flex gap-3">
         <CustomButton
          title={
            isCourseLoading ?(
                      <div
                        class="spinner-border spinner-border spinner-border-sm text-light me-2"
                        role="status"
                      >
                        <span class="sr-only">Loading...</span>
                      </div>
                    ): contentLabel("Save", "nf Save")}
          onClick={() => {
             handleSaveCourse("DRAFT","QUESTION");
          }}
          disabled={courseinfo?.isQuestion && (courseinfo?.isPreSkill && courseinfo?.isBasicButton && courseinfo?.isAptainSkill) }
        />
        <CustomButton
          title={contentLabel("Next", "nf Next")}
          onClick={() => {
            setSteps((prev) => {
              return { ...prev, step4: true };
            });
          }}
        />
        </div>
      </div>
    </div>
  );
};

export default CourseQuestions;
