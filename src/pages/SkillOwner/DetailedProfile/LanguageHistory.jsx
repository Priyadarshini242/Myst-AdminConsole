import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../../components/Navbar";
import DetailedPofileNavbar from "../../../components/DetailedPofileNavbar";
import { MdDelete, MdEdit } from "react-icons/md";
import { ImAttachment } from "react-icons/im";
import RightSideBar from "../../../components/RightSideBar";
import ShowHideIcon from "../../../components/ShowHideIcon";
import DetailedResume from "../../../components/DetailedResume";
import Footer from "../../../components/Footer";
import { useSelector, useDispatch } from "react-redux";
import SecondaryBtn from "../../../components/Buttons/SecondaryBtn";
import PremiumServicesOptions from "../../../components/PremiumServicesOptions";
import PrimaryBtn from "../../../components/Buttons/PrimaryBtn";
import PremiumService from "../../../components/SkillOwner/PremiumServices/PremiumService";
import CustomAnalyticsPS from "../../../components/SkillOwner/PremiumServices/CustomAnalyticsPS";
import { fetchUserLanguages } from "../../../api/fetchAllData/fetchUserLanguages";
import { showSuccessToast } from "../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import PostApi from "../../../api/PostData/PostApi";
import { addNewKnownLanguages } from "../../../reducer/detailedProfile/languageKnownSlice";
import TableLoaders from "../../../components/CustomLoader/TableLoaders";
import SecondaryBtnLoader from "../../../components/Buttons/SecondaryBtnLoader";
import { setSkillOwnerAttachment } from "../../../reducer/attachments/skillOwnerAttachments";
import AttachmentForm from "../../../components/AttachmentForm";
import { setDetailedProfileEditData } from "../../../reducer/edit/detailedProfileEditSlice";
import EditLanguageAndOthers from "../../../components/SkillOwner/Forms/Edit Forms/EditLanguageAndOthers";
import Anonimization from "../../../components/Anonimization";
import { setDeleteDetailedProfileData } from "../../../reducer/delete/deleteDetailedProfileSlice";
import DeleteFormDetailedProfile from "../../../components/DeleteFormDetailedProfile";
import ViewOpportunities from "../../../components/SkillOwner/PremiumServices/ViewOpportunities";
import ViewCourses from "../../../components/SkillOwner/PremiumServices/ViewCourses";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { getCookie } from '../../../config/cookieService';


const LanguageHistory = () => {
  const initialState = {
    mystSpeak: "No",
    mystWrite: "No",
    mystRead: "No",
    mlanguage: getCookie("HLang"),
    userLanguage: "",
    validation: "No",
    userId:getCookie("userId"),
  };

  const dispatch = useDispatch();
  const [editEnable, setEditEnable] = useState(false);
  const [switchTab, setSwitchTab] = useState("");
  const [formData, setFormData] = useState(initialState);
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);

  //store
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const languageKnown = useSelector((state) => state.languageKnown);
  const langList = useSelector((state) => state?.langList);

  const handleEdit = () => {
    setEditEnable(!editEnable);
  };

  /* HANDLE EDIT FOR OTHERS DETAIL */
  const handleEditForLang = (data) => {
    dispatch(setDetailedProfileEditData(data));
  };

  const handleAccordion1 = (event) => {
    event.stopPropagation();
    const target = document.getElementById("panelsStayOpen-collapseOne");
    if (target.classList.contains("show")) {
      target.classList.remove("show");
    } else {
      target.classList.add("show");
    }
  };
  useEffect(() => {
    dispatch(fetchUserLanguages());
  }, [dispatch]);

  const pdfRef = useRef();

  const handlePdf = () => {
    window.print();
  };

  const handleValidateProject = () => {
    setValidation(true);
  };

  const handleValidationClose = () => {
    setValidation(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No file chosen");
    }
  };
  const handleAttachment = (selectedData) => {
    dispatch(setSkillOwnerAttachment(selectedData));
  };

  // modal validation show hide
  const [Validation, setValidation] = useState(false);
  const actualBtnRef = useRef(null);
  const [fileName, setFileName] = useState("No file chosen");

  const buttonRef = useRef(null);

  const handleModalClose = () => {
    setValidation(false);
  };

  // to adjust the height of the content dynamically
  const navbarRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
    }
  }, []);

  const handleSubmit = (close) => {
    if (
      formData.userLanguage.length === 0 &&
      (formData.mystRead || formData.mystSpeak || formData.mystWrite)
    ) {
      showErrorToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "PleaseFillMandatoryBoxes"
          ) || {}
        ).mvalue || "nf Please Fill Mandatory Boxes"
      );
      return;
    }

    setIsAddingLanguage(true);

    PostApi("User Languages", {
      ...formData,
    })
      .then((res) => {
        console.log("res ", res);
        //dispatch(addNewConference({ ...res.data, startDate: convertDateToMilliseconds(res.data.startDate), endDate: convertDateToMilliseconds(res.data.endDate) }))
        showSuccessToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "NewTrainingAddedSuccessful"
            ) || {}
          ).mvalue || "nf New Training Added Successful"
        );
        dispatch(addNewKnownLanguages(res.data));
        setFormData(initialState);

        if (close && buttonRef.current) {
          buttonRef.current.click();
        }
        if (!close && buttonRef.current) {
          setFormData(initialState);
        }
        setIsAddingLanguage(false);
      })
      .catch((err) => {
        console.log(err);
        showErrorToast(
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "SomethingWentWrong"
            ) || {}
          ).mvalue || "nf Something went wrong"
        );
        setIsAddingLanguage(false);
      })
      .finally(() => {
        //setIsAddingSkill(false);
        setIsAddingLanguage(false);
        console.log(languageKnown.data);
      });
  };
  useEffect(() => {
    console.log(formData);
  }, [formData]);

  useEffect(() => {
    console.log(languageKnown.data);
  }, [languageKnown]);

  return (
    <>
      <AttachmentForm />
      {/* LANGUAGES DETAILED PROFILE EDIT MODAL */}
      {<EditLanguageAndOthers />}
      {/* DELETE MODAL */}
      {<DeleteFormDetailedProfile />}
      <div className="d-print-none">
        {/* <!-- Modal --> */}
        <div
          className="modal fade font-5 m-0 p-0 "
          style={{ margin: "0" }}
          id="exampleModal"
          tabIndex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <div className="d-flex justify-content-between align-items-center  w-100  ">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "Languages"
                      ) || {}
                    ).mvalue || "nf Languages"}
                  </h1>
                  <i className=" me-2">
                    {" "}
                    <span className="text-danger ">*</span>{" "}
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "RequiredFields"
                      ) || {}
                    ).mvalue || "nf Required Fields"}
                  </i>
                </div>

                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  id="mclose"
                  ref={buttonRef}
                ></button>
              </div>
              <div className="modal-body ">
                {/* form start */}
                <div className="   ">
                  {!Validation && (
                    <div className=" ">
                      <div class="mb-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Languages"
                            ) || {}
                          ).mvalue || "nf Languages"}
                          <span className="text-danger"> *</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                          name="userLanguage"
                          value={formData.userLanguage}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [e.target.name]: e.target.value,
                            })
                          }
                          list="languageList"
                        />
                        <datalist id="languageList">
                          {langList?.AllLanguage?.length &&
                            langList?.AllLanguage?.map((lang, index) => (
                              <option key={index} value={lang?.code}>
                                {lang?.code}
                              </option>
                            ))}
                        </datalist>
                      </div>

                      <div className="d-flex gap-4 my-3  ">
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="flexCheckDefault"
                            name="mystRead"
                            checked={formData.mystRead === "Yes" ? true : false}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [e.target.name]: e.target.checked
                                  ? "Yes"
                                  : "No",
                              })
                            }
                          />
                          <label
                            class="form-check-label"
                            for="flexCheckDefault"
                          >
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Read"
                              ) || {}
                            ).mvalue || "nf Read"}
                          </label>
                        </div>
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="flexCheckChecked"
                            checked={
                              formData.mystWrite === "Yes" ? true : false
                            }
                            name="mystWrite"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [e.target.name]: e.target.checked
                                  ? "Yes"
                                  : "No",
                              })
                            }
                          />
                          <label
                            class="form-check-label"
                            for="flexCheckChecked"
                          >
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Write"
                              ) || {}
                            ).mvalue || "nf Write"}
                          </label>
                        </div>
                        <div class="form-check">
                          <input
                            class="form-check-input"
                            type="checkbox"
                            value=""
                            id="flexCheckChecked"
                            checked={
                              formData.mystSpeak === "Yes" ? true : false
                            }
                            name="mystSpeak"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                [e.target.name]: e.target.checked
                                  ? "Yes"
                                  : "No",
                              })
                            }
                          />
                          <label
                            class="form-check-label"
                            for="flexCheckChecked"
                          >
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Speak"
                              ) || {}
                            ).mvalue || "nf Speak"}
                          </label>
                        </div>
                      </div>

                      {/* <div className="d-flex justify-content-between align-items-baseline   ">

                                            <div>
                                                <div>
                                                    <input type="file" id='fileChoose'  ref={actualBtnRef} hidden onChange={handleFileChange} />
                                                    <label htmlFor="fileChoose" className="btn btn-success font-5  ">{(content[selectedLanguage]?.find(item => item.elementLabel === 'AttachRelatedDocuments') || {}).mvalue || "nf AttachRelatedDocuments"}</label>
                                                </div>
                                                <div id="file-chosen" class="form-text">{fileName}</div>
                                            </div>

                                        </div> */}
                    </div>
                  )}

                  {Validation === true && (
                    <div className="ms-2  me-2  border  px-1 py-1  ">
                      <div className="d-flex justify-content-between align-items-center ">
                        <h3 className="modal-title fs-5" id="exampleModalLabel">
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel === "ProjectValidationDetail"
                            ) || {}
                          ).mvalue || "nf Validation"}
                        </h3>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={handleValidationClose}
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="my-2  ">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label "
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "WhoValidates"
                            ) || {}
                          ).mvalue || "nf WhoValidates"}{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          className="form-control bg-body-tertiary h-75 "
                          id="exampleFormControlInput1"
                        />
                      </div>

                      <div className="my-2  ">
                        <label
                          htmlFor="exampleFormControlInput1"
                          className="form-label "
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel ===
                                "ProjectValidatorRelationship"
                            ) || {}
                          ).mvalue || "nf ProjectValidatorRelationship"}{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          className="form-control bg-body-tertiary h-75 "
                          id="exampleFormControlInput1"
                        />
                      </div>

                      <div class="form-check form-check-inline mb-2   ">
                        <input
                          class="form-check-input bg-body-tertiary  "
                          type="radio"
                          name="relationship"
                          id="relationship4"
                          value="Other Person"
                        />
                        <label class="form-check-label" for="relationship4">
                          {(
                            content[selectedLanguage]?.find(
                              (item) =>
                                item.elementLabel ===
                                "OtherPersonWhoIsAwareOfProject"
                            ) || {}
                          ).mvalue || "nf OtherPersonWhoIsAwareOfProject"}
                        </label>
                      </div>

                      <div class="mb-2  ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "EmailId"
                            ) || {}
                          ).mvalue || "nf EmailId"}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          style={{ height: "32px" }}
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                        />
                      </div>
                      <div class="my-2 ">
                        <label
                          for="exampleFormControlInput1"
                          class="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "MobileNo"
                            ) || {}
                          ).mvalue || "nf MobileNo"}
                        </label>
                        <input
                          type="text"
                          style={{ height: "32px" }}
                          class="form-control bg-body-tertiary h-75 "
                          id=""
                          placeholder=""
                        />
                      </div>
                      <div className="my-2 ">
                        <label
                          htmlFor="exampleFormControlTextarea1"
                          className="form-label"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Remarks"
                            ) || {}
                          ).mvalue || "nf Remarks"}{" "}
                        </label>
                        <textarea
                          className="form-control bg-body-tertiary"
                          id="exampleFormControlTextarea1"
                          rows="2"
                        ></textarea>
                      </div>

                      <div className="d-flex justify-content-end align-items-center mb-1  ">
                        <button
                          type="button"
                          className="text-white border-0 px-2 py-1 rounded   pill-bg-color  font-5"
                        >
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Validate"
                            ) || {}
                          ).mvalue || "nf Validate"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-end  ">
                <div className="d-flex gap-2 ">
                  <SecondaryBtnLoader
                    label={
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Save"
                        ) || {}
                      ).mvalue || "Save"
                    }
                    onClick={() => handleSubmit(false)}
                    backgroundColor="#F8F8E9"
                    color="var(--primary-color)"
                    loading={isAddingLanguage}
                  />
                  <SecondaryBtnLoader
                    label={
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Save&Close"
                        ) || {}
                      ).mvalue || "Save & Close"
                    }
                    onClick={() => handleSubmit(true)}
                    backgroundColor="var(--primary-color)"
                    color="#F8F8E9"
                    loading={isAddingLanguage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={navbarRef} id="yourNavbarId">
          <Navbar handlePdf={handlePdf}></Navbar>
        </div>

        <hr className="p-0 m-0 " />

        <div
          style={{ backgroundColor: "#", minHeight: "", height: "" }}
          className="container-fluid  h6 "
        >
          <div className="row  gap-0 ">
            <div className=" bg-white px-1 col-md font-5 fixed-sidebar   rounded ">
              <div>
                <DetailedPofileNavbar />
              </div>
              <div>
                <PremiumServicesOptions setSwitchTab={setSwitchTab} />
              </div>
            </div>

            <hr className="vr m-0 p-0" />

            <div
              className="col-md-7  rounded bg-white  px-1 font-5   "
              style={{ overflowY: "auto", height: contentHeight }}
            >
              {switchTab === "" && (
                <>
                  <div className="d-md-flex align-items-center justify-content-between my-1 px-1   ">
                    <div className="d-flex align-items-center "></div>
                    <div className="py-1 d-flex gap-1  ">
                      <div
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        <SecondaryBtn
                          label={
                            (
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "AddSkillButton"
                              ) || {}
                            ).mvalue || "nf AddKillButton"
                          }
                          backgroundColor="#F7FFDD"
                          color="var(--primary-color)"
                        />
                      </div>
                      <SecondaryBtn
                        label={
                          (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "EditSkillButton"
                            ) || {}
                          ).mvalue || "nf EditSkillButton"
                        }
                        backgroundColor="#F7FFDD"
                        color="var(--primary-color)"
                        onClick={handleEdit}
                      />
                    </div>
                  </div>

                  {/* accordion one table */}
                  <div
                    className="accordion   "
                    id="accordionPanelsStayOpenExample"
                  >
                    <div className="accordion-item border-0  mb-2 rounded-top  ">
                      <h2 className="accordion-header   py-1">
                        <button
                          className="accordion-button flex justify-content-between py-2  "
                          onClick={handleAccordion1}
                          style={{
                            backgroundColor:
                              (
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "NavBarBgColor"
                                ) || {}
                              ).mvalue || "var(--primary-color)",
                            color:
                              (
                                content[selectedLanguage]?.find(
                                  (item) =>
                                    item.elementLabel === "NavBarFontColor"
                                ) || {}
                              ).mvalue || "#F7FFDD",
                            direction:
                              (
                                content[selectedLanguage]?.find(
                                  (item) => item.elementLabel === "Direction"
                                ) || {}
                              ).mvalue || "ltr",
                          }}
                          type="button"
                          data-bs-toggle="collapse"
                        >
                          <div className="w-75 ">
                            {(
                              content[selectedLanguage]?.find(
                                (item) => item.elementLabel === "Languages"
                              ) || {}
                            ).mvalue || "nf Languages"}{" "}
                          </div>
                        </button>
                      </h2>
                      <div
                        ref={pdfRef}
                        id="panelsStayOpen-collapseOne"
                        className="accordion-collapse   collapse show"
                      >
                        <div className="font-3 font-weight-1 d-none  show-in-print">
                          {(
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Languages"
                            ) || {}
                          ).mvalue || "nf Languages"}
                        </div>

                        <div className="px-3   py-3 ">
                          {/* table */}
                          <table className="table-sm table font-5   ">
                            <thead>
                              <tr>
                                <th scope="col" style={{ width: "30%" }}>
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel === "Languages"
                                    ) || {}
                                  ).mvalue || "nf Languages"}{" "}
                                </th>
                                <th scope="col" style={{ width: "20%" }}>
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "Read"
                                    ) || {}
                                  ).mvalue || "nf Read"}
                                  &nbsp;{" "}
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "Write"
                                    ) || {}
                                  ).mvalue || "nf Write"}
                                  &nbsp;{" "}
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) => item.elementLabel === "Speak"
                                    ) || {}
                                  ).mvalue || "nf Speak"}{" "}
                                </th>

                                <th
                                  scope="col"
                                  className="text-center "
                                  style={{ width: "25%" }}
                                >
                                  {(
                                    content[selectedLanguage]?.find(
                                      (item) =>
                                        item.elementLabel ===
                                        "ProjectValidation"
                                    ) || {}
                                  ).mvalue || "nf Validation"}
                                </th>
                                <th scope="col" style={{ width: "1%" }}></th>
                              </tr>
                            </thead>
                            <tbody>
                              {languageKnown.status === "loading" ? (
                                <TableLoaders />
                              ) : (
                                languageKnown.status === "success" &&
                                languageKnown.data.length > 0 &&
                                languageKnown.data.map((item) => (
                                  <tr>
                                    {console.log(
                                      item,
                                      "ITEM SCOONSON FOr CIHE"
                                    )}
                                    <td>{item.userLanguage}</td>
                                    <td className="d-flex pb-2  ">
                                      <input
                                        type="checkbox"
                                        checked={item.mystRead === "Yes"}
                                        className=" mx-3  "
                                        readonly
                                      />
                                      <input
                                        type="checkbox"
                                        checked={item.mystWrite === "Yes"}
                                        className=" mx-3  "
                                        readonly
                                      />
                                      <input
                                        type="checkbox"
                                        checked={item.mystSpeak === "Yes"}
                                        className=" mx-2 ms-2  "
                                        readonly
                                      />
                                    </td>
                                    <td className="text-center">No</td>

                                    <td className="d-flex gap-4">
                                      {editEnable ? (
                                        <>
                                          <div className="">
                                            <button
                                              className="border-0 bg-white"
                                              data-tooltip-id="my-tooltip"
                                              data-tooltip-content="Edit"
                                              data-bs-toggle="modal"
                                              data-bs-target="#EditDetailedProfileLanguageAndOthers"
                                              onClick={() =>
                                                handleEditForLang(item)
                                              }
                                            >
                                              <MdEdit />
                                            </button>
                                          </div>
                                          <ShowHideIcon
                                            value={
                                              item?.recordHide === "Yes"
                                                ? true
                                                : false
                                            }
                                            toggleable={true}
                                            form={item}
                                            fieldName={"recordHide"}
                                            api={"Skills Applied"}
                                            id={item.id}
                                          />
                                          <Anonimization
                                            value={
                                              item?.recordAnonymous === "Yes"
                                                ? true
                                                : false
                                            }
                                            toggleable={true}
                                            form={item}
                                            fieldName={"recordAnonymous"}
                                            api={"Skills Applied"}
                                            id={item.id}
                                          />
                                          <div
                                            data-tooltip-id="my-tooltip"
                                            data-tooltip-content="Delete"
                                            data-bs-toggle="modal"
                                            data-bs-target="#deleteformdetailedprofile"
                                            onClick={() => {
                                              dispatch(
                                                setDeleteDetailedProfileData(
                                                  item
                                                )
                                              );
                                            }}
                                          >
                                            <MdDelete />
                                          </div>
                                        </>
                                      ) : (
                                        <button
                                          className="border-0 bg-white"
                                          data-tooltip-id="my-tooltip"
                                          data-tooltip-content="Attachment"
                                          onClick={() => handleAttachment(item)}
                                          data-bs-toggle="modal"
                                          data-bs-target="#attachmentList"
                                        >
                                          <ImAttachment />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {/* VIEW OPPORTUNITIES */}
              {switchTab === "viewOpp" && (
                <>
                  <ViewOpportunities />
                </>
              )}
              {/* VIEW COURSES */}
              {switchTab === "viewCourses" && (
                <>
                  <ViewCourses />
                </>
              )}
              {switchTab === "premium" && (
                <>
                  <button
                    className="input-group-text  mt-2   ms-1 primary-green "
                    style={{
                      backgroundColor: "#",
                      color: "var(--primary-color)",
                      borderStyle: "solid",
                      borderColor: "",
                    }}
                    onClick={() => setSwitchTab("")}
                  >
                    back
                  </button>
                  <PremiumService />
                </>
              )}

              {switchTab === "customAnalytics" && (
                <>
                  <button
                    className="input-group-text  mt-2    ms-1 primary-green "
                    style={{
                      backgroundColor: "#",
                      color: "var(--primary-color)",
                      borderStyle: "solid",
                      borderColor: "",
                    }}
                    onClick={() => setSwitchTab("")}
                  >
                    back
                  </button>
                  <CustomAnalyticsPS />
                </>
              )}
            </div>

            <hr className="vr m-0 p-0" />

            <div className="col-md  rounded bg-white px-1 font-5 fixed-sidebar">
              <RightSideBar />
            </div>
          </div>
        </div>

        <Footer />
      </div>
      <div className="d-none d-print-block  ">
        <DetailedResume />
      </div>
    </>
  );
};

export default LanguageHistory;
