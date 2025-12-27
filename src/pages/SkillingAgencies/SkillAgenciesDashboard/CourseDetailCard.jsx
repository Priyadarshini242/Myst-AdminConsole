import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from 'react-redux'
// import BookmarkBtn from "../../atoms/bookmark btn/BookmarkBtn";
//import JobOtherInfo from "./JobOtherInfo";
import { images, icons } from "../../../constants";
import getCurrencySymbol from "./currencyUtils";
import { useSelector } from "react-redux";
import { BASE_URL } from "../../../config/Properties";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ImageIcon from "@mui/icons-material/Image";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import useContentLabel from "../../../hooks/useContentLabel";
import { toTitleCase2 } from "../../../components/SkillOwner/HelperFunction/toTitleCase";
import { formatSalary } from "../../../hooks/useFormatSalary";
import { GetAttachment } from "../../../api/Attachment  API/DownloadAttachmentApi";
import { setEditCourse, setSelectedCourse } from '../../../reducer/skilling agency/course data/courseDataSlice'
import { GetUserForSelectedLanguage } from "../../../components/SkillOwner/HelperFunction/GetUserForSelectedLanguage";
import CourseInfoTabs from '../CourseInfoTabs';
const CourseDetailCard = ({
    courseDetails,
     newTotal = false
}) => {

  
  const content = useSelector((state) => state.content);
  const dispatch = useDispatch()
  const [isLogoLoading, setIsLogoLoading] = useState(true);
  const currencySymbol = getCurrencySymbol(courseDetails?.currency ? courseDetails?.currency : "");
  //const dataToSend = { externalSite: "bluecollar", jdId: courseDetails?.id };
  //const searchParams = new URLSearchParams(dataToSend).toString();
  const navigate = useNavigate();
  const contentLabel = useContentLabel();
  const [isRedirect,setIsRedirect ]= useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

   const { language: selectedLanguage } = useSelector((state) => state);
    const userDetails_ = useSelector((state) =>
      GetUserForSelectedLanguage(state.userProfile.data, selectedLanguage)
    );

const durationPhase = courseDetails?.durationPhase
  ? (
      content[selectedLanguage].find(
        (item) => item.elementLabel === courseDetails?.durationPhase
      )?.mvalue || `nf ${courseDetails?.durationPhase}`
    )
  : "";

 const imagesUrl=()=>{
  const imagesGet = (courseDetails?.attachmentFileNames
        ? JSON.parse(courseDetails?.attachmentFileNames)
        : [])
        ?.filter((att) => att?.fileType?.startsWith("image"))
        .map((att) => {
          return {
            label: att?.fileName,
            value: att,
          };
        });
if (imagesGet.length > 0) {
       const imageUrl = GetAttachment(
                 imagesGet[0].value?.userId,
                 imagesGet[0].value?.fileName,
                 imagesGet[0].value?.fileId
               );               
               return imageUrl;  
      }else{
        return images.company_image;
      }
 }  
 
if(isRedirect){<CourseInfoTabs></CourseInfoTabs>}else{
  return (
    <div
      className="inner-box"
      style={{
        width: "100%" ,
        height:"100%"
      }}
    >
      <div
        className="content "
        style={{cursor: "pointer"}}
        onClick={() => {
             setIsRedirect(true);
             dispatch(setSelectedCourse(courseDetails))
             navigate(`/skilling-agency/courseview`);
        }}
      >
        <span className={`company-logo ${isLogoLoading ? 'skeleton-loading-img-default' : ""}`}>
                      <img
              src={imagesUrl()}              
              alt="company"
              style={{
                display: "inline-block",
                maxWidth: "100%",
                height: "auto",
                borderRadius: "10px",
              }}
              onError={(e) => {
                e.target.src = images.company_image;
                setIsLogoLoading(false);
              }}
              onLoad={() => setIsLogoLoading(false)}
            />
         
        </span>
        {/* <h4>
          <Link to={`/jd/${id}`}>{`${jTitle ? courseDetails?.courseName : ""}`}</Link>
        </h4> */}
        <h4
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          className="mb-2"
        >
          <Link
            to={ `/skilling-agency/courseview`
            }
            className="d-flex justify-content-center align-items-center"
            style={{ marginLeft: "3px" }}
          >
            {courseDetails?.courseName ? courseDetails?.courseName : ""}
            {
              
              <icons.FaCircle
                size={10}
                style={{
                  color:
                    (courseDetails?.courseStatus === "PUBLISH" && "#00BA49") ||
                    (courseDetails?.courseStatus === "CLOSED" && "var(--primary-color)") ||
                    (courseDetails?.courseStatus === "DRAFT" && "gray"),
                    marginLeft:'.5rem'
                }}
              />
            }
          </Link>
          {courseDetails?.courseStatus && (
            <span
              style={{ color: "var(--primary-color)", marginRight: "20px" }}
            >
              { ''}
              {/* ? toTitleCase2(courseDetails?.courseStatus) */}
            </span>
          )}
        </h4>
        <p
          className="mb-2"
          style={{ fontWeight: "bold", color: "var(--primary-color)" ,marginLeft:'3px'}}
        >
          {newTotal}

        </p>
        <ul className="job-info">
          {courseDetails?.location && (
            <li>
              <span style={{ marginRight: "5px" }}>
                <icons.FmdGoodOutlinedIcon />
              </span>
              {courseDetails?.location}
            </li>
          )}
          {courseDetails?.price && (
            <li>
              <span style={{ marginRight: "5px" }}>
                <AccountBalanceWalletIcon />
              </span>
              { ` ${currencySymbol}${formatSalary(courseDetails?.price)}`}
            </li>
          )}
          {courseDetails?.durationNumber && <li>
            <span style={{ marginRight: "5px" }}>
              <AccessTimeIcon />
            </span>
            {`${courseDetails?.durationNumber} ${durationPhase}`}
          </li>}
        </ul>
      </div>
   
    </div>
  );
}
};

export default CourseDetailCard;


