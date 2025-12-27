import React, { useCallback, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { MdDelete, MdDoneOutline, MdEdit } from "react-icons/md";
import { useSelector } from "react-redux";
import PostApi from "../../../../api/PostData/PostApi";
import SuccessBtn from "../../../../components/Buttons/SuccessBtn";
import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import useContent from "../../../../hooks/useContent";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from '../../../../config/cookieService';


const ResumeLang = ({ data, setResumeLang, index }) => {
  /* STORES */
  const content = useSelector((state) => state.content);
  const selectedLanguage = useSelector((state) => state.language);
  const langList = useSelector((state) => state?.langList);

  /* STATES INIT*/
  const [isLoading, setIsLoading] = useState(false);

  /* HANDLE LANUGAGE DATA IMPORT */
  const handleSubmitLang = useCallback(async () => {
    setIsLoading(true);
    try {
      /* PAYLOAD */
      const payload = {
        mystSpeak: "No",
        mystWrite: "No",
        mystRead: "No",
        mlanguage: getCookie("HLang"),
        userLanguage: data?.language || "",
        validation: "No",
        userId:getCookie("userId"),
      };
      await PostApi("User Languages", payload);
      showSuccessToast(
        (
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "NewLanguageAddedSuccessful"
          ) || {}
        ).mvalue || "nf New Language Added Successful"
      );
    } catch (error) {
      console.error("Error importing language: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [data?.language, content, selectedLanguage]);

  return (
    <>
      <div class="accordion w-100 resumeAccordion" id="accordionPanelsStayOpenExample">
        <div class="accordion-item  ">
          <h2 class="accordion-header ">
            <button
              class={`accordion-button collapsed `}
              style={{ color: "black" }}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#panelsStayOpen-collapseLang${data?.id}`}
              aria-expanded="false"
              aria-controls={`panelsStayOpen-collapseLang${data?.id}`}
            >
              {data?.language}
            </button>
          </h2>
          <div
            id={`panelsStayOpen-collapseLang${data?.id}`}
            class={`accordion-collapse collapse `}
          >
            <div class="accordion-body" style={{ position: "relative" }}>
              <div
                className="d-flex align-items-center justify-content-end gap-2 px-2 "
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  zIndex: "9999",
                }}
              >
                {data.edit ? (
                  <MdDoneOutline
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setResumeLang((prev) => {
                        return prev.map((item) =>
                          item.id === data.id ? { ...item, edit: false } : item
                        );
                      });
                    }}
                  />
                ) : (
                  <MdEdit
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setResumeLang((prev) => {
                        return prev.map((item) =>
                          item.id === data.id ? { ...item, edit: true } : item
                        );
                      });
                    }}
                  />
                )}

                <MdDelete
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setResumeLang((prev) => {
                      return prev.filter((item) => item.id !== data.id);
                    });
                  }}
                />
              </div>

              <div
                className="d-flex justify-content-center align-items-center flex-column gap-3 w-100 row"
                style={{ pointerEvents: data.edit ? "" : "none" }}
              >
                <div class=" d-md-flex d-block  gap-4 justify-content-center align-items-center col-md-6 col-12">
                  <label
                    htmlFor="first-name"
                    className="w-25 text-start text-md-end"
                  >
                    Name
                  </label>
                  <input
                    type="Text"
                    class="form-control"
                    id="first-name"
                    placeholder="Enter your first name"
                    value={data?.language}
                    onChange={(e) => {
                      setResumeLang((prev) => {
                        return prev.map((item) =>
                          item.id === data.id
                            ? { ...item, language: e.target.value }
                            : item
                        );
                      });
                    }}
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
                <div class=" d-md-flex d-block  gap-4 justify-content-center align-items-center col-md-6 col-12">
                  <label
                    htmlFor="first-name"
                    className="w-25 text-start text-md-end"
                  >
                    Code
                  </label>
                  <input
                    type="Text"
                    class="form-control"
                    id="first-name"
                    placeholder="Enter your first name"
                    value={data?.languageCode}
                    onChange={(e) => {
                      setResumeLang((prev) => {
                        return prev.map((item) =>
                          item.id === data.id
                            ? { ...item, languageCode: e.target.value }
                            : item
                        );
                      });
                    }}
                  />
                </div>
              </div>
              {/* IMPORT BUTTON */}
              <div className="d-flex justify-content-end">
                <SuccessBtn
                  label={useContent("Import", "nf Import")}
                  onClick={handleSubmitLang}
                  isLoading={isLoading}
                  disable={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResumeLang;
