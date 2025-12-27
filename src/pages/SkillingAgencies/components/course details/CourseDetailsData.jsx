import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useContentLabel from "../../../../hooks/useContentLabel";
import { GetAttachment } from "../../../../api/Attachment  API/DownloadAttachmentApi";
import LazyLoadingImageComponent from "../../../../components/Lazy Loading Images/LazyLoadingImageComponent";
import { MdOpenInNew, MdPlayCircleOutline } from "react-icons/md";
import company_image from "../../../../Images/skyline.png";
import { icons, images } from "../../../../constants";
import { timestampToYYYYMMDD } from "../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";
import { getCookie } from "../../../../config/cookieService";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";

const CourseDetailsData = () => {
  const isLoading = false;
  const navBarBgColor = "var(--primary-color";
  const { selectedCourse: data } = useSelector((state) => state.myCourses);
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
   const { regionalData } = useSelector((state) => state);

  const contentLabel = useContentLabel();

  const [linkAttachment, setLinkAttachment] = useState(null);
  const [linkImage, setLinkImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (data) {
      const attachments = data?.attachmentFileNames
        ? JSON.parse(data?.attachmentFileNames)
        : [];
      const files = attachments
        ?.filter((att) => att?.fileType?.endsWith("pdf"))
        .map((att) => {
          return {
            label: att?.fileName,
            value: att,
          };
        });
      setLinkAttachment(files);
      const images = attachments
        ?.filter((att) => att?.fileType?.startsWith("image"))
        .map((att) => {
          return {
            label: att?.fileName,
            value: att,
          };
        });
      setLinkImage(images);
      if (images.length > 0) {
        const imageUrl = GetAttachment(
          images[0].value?.userId,
          images[0].value?.fileName,
          images[0].value?.fileId
        );
        setSelectedImage(imageUrl);
      } else {
        setSelectedImage(null);
      }
    }
  }, [data]);

  if (!data?.id) {
    return (
      <div
        className=" d-flex justify-content-center align-items-center p-2"
        style={{ width: "100%", height: "100%" }}
      >
        {contentLabel(
          "SelectACourseToViewData",
          "nf Select a course to view data"
        )}
      </div>
    );
  }

  return (
    <>
      <section
        className="row"
        style={{ borderBottom: "2px solid var(--light-color)" }}
      >
        <div className="col-lg-12  p-4">
          <div className="d-flex align-items-center">
            <div
              className={`border p-1 d-inline-block rounded ${
                isLoading && "skeleton-loading"
              }`}
            >
              {/* {
                    !imgLoadingState &&
                        userInfo?.profilePictureFileName &&
                        userInfo?.profilePictureFileName.length > 2 && (
                          <LazyLoadingImageComponent
                            style={{
                              objectFit: "cover",
                              display: imgLoadingState ? "none" : "block",
                            }}
                            src={GetAttachment(
                              userInfo?.id,
                              profilePicObj?.fileName,
                              profilePicObj?.fileId
                            )}
                            alt="Profile picture"
                            className="rounded-circle"
                            width="150"
                            height="150"
                            onLoad={() => setImgLoadingState(false)}
                          />)


                  } */}

              <LazyLoadingImageComponent
                src={selectedImage || images.company_image}
                className={`${isLoading & "skeleton-loading"}`}
                alt={"Company-Image"}
                style={{ width: "100px", height: "100px" }}
                onError={(e) => {
                  e.target.src = images.company_image;
                }}
              />
            </div>
            <div style={{ marginLeft: "20px" }}>
              <h2
                style={{ color: navBarBgColor }}
                className={`${isLoading ? "skeleton-loading" : ""}`}
              >
                {data?.courseName}
              </h2>

              <div className="d-flex align-items-start justify-content-start mt-3 flex-wrap gap-3">
                
                {data?.courseStartingDate &&
                <div className="d-md-flex  align-items-center">
                  <DateRangeOutlinedIcon style={{ color: 'var(--primary-color)' }} />
                  <span className="">
                    &nbsp;{formatTimestampToDate(Number(data?.courseStartingDate),regionalData?.selectedCountry?.dateFormat
)}
                  </span>
                </div>}
                
                {data?.location && <div className="d-md-flex align-items-center  ">
                  <icons.FmdGoodOutlinedIcon
                    style={{ color: "var(--primary-color)" }}
                  />
                  <span className="">{data?.location}</span>
                </div>}

              {data?.durationNumber && <div className="d-md-flex align-items-center ">
                  <icons.AccessTimeOutlinedIcon
                    style={{ color: "var(--primary-color)" }}
                  />
                  <span className="">
                    {data?.durationNumber}&nbsp;
                    {data?.durationPhase}
                  </span>
                </div>}
              </div>
            </div>
          </div>
        </div>
      </section>

     {(data?.courseDescription || data?.skillerName || data?.skillerBio) &&<section
        className="row mb-3"
        style={{ borderBottom: "2px solid var(--light-color)" }}
      >
        <article className="col-lg-12  p-4">
         {data?.courseDescription && <div className="mb-4">
            <h3
              className="h5 d-flex align-items-center mb-2 fw-bold"
              style={{ color: navBarBgColor }}
            >
              {contentLabel("Description", "nf Description")}
            </h3>
            <p className={`${isLoading ? "skeleton-loading" : ""} `}>
              {data?.courseDescription}
            </p>
            <p className={`${isLoading ? "skeleton-loading" : ""} `}></p>
            <p className={`${isLoading ? "skeleton-loading" : ""} `}></p>
          </div> }

         {data?.skillerName && <div className="mb-2 d-flex gap-3">
            <strong className="fw-bold">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "SkillerName"
                ) || {}
              ).mvalue || "nf Skiller Name"}
              :
            </strong>
            {data?.skillerName}
          </div> }

         {data?.skillerBio && <div className="mb-2 ">
            <span className="fw-bold me-3">
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "SkillerBio"
                ) || {}
              ).mvalue || "nf Skiller Bio"}
              :
            </span>
            {data?.skillerBio}
          </div> }
        </article>
      </section>}

     {(data?.courseLanguage || data?.location || data?.price || (linkAttachment?.length > 0)|| data?.courseStartingDate) && <section
        className="row   p-2"
        style={{ borderBottom: "2px solid var(--light-color)" }}
      >
        <article className="col-lg-12 ">
          <aside
            className="pb-3"
            style={{ borderBottom: "2px solid var(--light-color)" }}
          >
            <h3 className=" h5 mb-4 fw-bold" style={{ color: navBarBgColor }}>
              {(
                content[selectedLanguage]?.find(
                  (item) => item.elementLabel === "CourseSummary"
                ) || {}
              ).mvalue || "nf Course Summary"}
            </h3>
            <ul className="list-unstyled pl-3 mb-0">
             {data?.courseLanguage && <li className="mb-2 d-flex gap-3">
                <strong className="fw-bold">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "CourseLanguage"
                    ) || {}
                  ).mvalue || "nf Course Language"}
                  :
                </strong>
                <p className={`${isLoading ? "skeleton-loading" : ""} mb-0`}>
                  {data?.courseLanguage}
                </p>
              </li> }

              {data?.location && <li className="mb-2 d-flex gap-3">
                <strong className="fw-bold">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "CourseLocation"
                    ) || {}
                  ).mvalue || "nf CourseLocation"}
                  :
                </strong>
                <p className={`${isLoading ? "skeleton-loading" : ""} mb-0`}>
                  {data?.location}
                </p>
              </li>}

             {data?.price &&  <li className="mb-2 d-flex gap-3">
                <strong className="fw-bold">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "CoursePrice"
                    ) || {}
                  ).mvalue || "nf Course Price"}
                  :
                </strong>
                <p className={`${isLoading ? "skeleton-loading" : ""} mb-0`}>
                  {data?.price}&nbsp;
                  {data?.currency}
                </p>
              </li>}

              {linkAttachment?.length > 0 && (
                <li className="mb-2 d-flex gap-3">
                  <strong className="fw-bold">
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "CoursePdf"
                      ) || {}
                    ).mvalue || "nf Course Pdf"}
                    :
                  </strong>
                  <p className={`${isLoading ? "skeleton-loading" : ""} mb-0`}>
                    {linkAttachment?.map((attachment) => {
                      return (
                        <div className="d-flex ">
                          <div>{attachment?.value?.fileName}</div>
                          <div>
                            <a
                              rel="noreferrer"
                              href={GetAttachment(
                                getCookie("userId"),
                                attachment?.value?.fileName,
                                attachment?.value?.fileId
                              )}
                              target="_blank"
                            >
                              {!attachment?.value?.fileName?.endsWith(
                                ".mp4"
                              ) ? (
                                <MdOpenInNew
                                  className=""
                                  style={{
                                    color: "var(--primary-color)",
                                    height: "16px",
                                    width: "16px",
                                  }}
                                />
                              ) : (
                                <MdPlayCircleOutline
                                  className=""
                                  style={{
                                    color: "var(--primary-color)",
                                    height: "16px",
                                    width: "16px",
                                  }}
                                />
                              )}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </p>
                </li>
              )}
             
          {data?.courseStartingDate && <li className="mb-2 d-flex gap-3">
                <strong className="fw-bold">
                  {(
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "CourseStartDate"
                    ) || {}
                  ).mvalue || "nf Course Start Date"}
                  :
                </strong>
                {timestampToYYYYMMDD(Number(data?.courseStartingDate))}
              </li>}
            </ul>
          </aside>

          <aside>
            {data.courseQuestions?.length > 0 && (
              <div className="col-12 mt-3" style={{ pointerEvents: "none" }}>
                <h3
                  className=" h5 mb-4 fw-bold"
                  style={{ color: navBarBgColor }}
                >
                  {contentLabel("Questions", "nf Questions")}
                </h3>
                {data.courseQuestions?.map((que) => (
                  <div className="fs-6 mb-3 mt-3" key={que.id}>
                    <h6>
                      {que.cqLabel}{" "}
                      {que.cqRequired === "Yes" && (
                        <span style={{ color: "red" }}> *</span>
                      )}
                    </h6>
                    {(que.cqType === "Options" ||
                      que.cqType === "nf Options") && (
                      <div className="form-check">
                        {JSON.parse(que.cqValues).map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <input
                              className="form-check-input text-primary-color"
                              type="radio"
                              value={option}
                            />
                            <label className="form-check-label">{option}</label>
                          </div>
                        ))}
                      </div>
                    )}

                    {(que.cqType === "Text" || que.cqType === "nf Text") && (
                      <div className="form-group">
                        <textarea className="form-control" rows="3"></textarea>
                      </div>
                    )}
                    {(que.cqType === "Number" ||
                      que.cqType === "nf Number") && (
                      <div className="form-group w-25">
                        <input type="Number" className="form-control" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </aside>
        </article>
      </section>}
    </>
  );
};

export default CourseDetailsData;
