import React, { useEffect, useRef, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import "./Css/SidebarSeekerStyle.css";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../Images/logo.png";
import user from "../../Images/avatar-placeholder.webp";
import { GetUserForSelectedLanguage } from "../../components/SkillOwner/HelperFunction/GetUserForSelectedLanguage";
import { GetAttachment } from "../../api/Attachment  API/DownloadAttachmentApi";

import AccountSettings from "../../components/Modals/AccountSettings";
import UserProfileSeeker from "../../components/SkillAvailer/UserProfileSeeker";
import AttachmentsModal from "../../components/Modals/AttachmentsModal";
import { ImAttachment } from "react-icons/im";

function SidebarSeeker({
  sidebarHeight,
  menuItems,
  subMenuItems,
  collapsed = true,
}) {
  const userDetailsAll = useSelector((state) => state.userProfile.data);

  const [currentPage, setCurrentPage] = useState();
  const pathNameString = useLocation().pathname;
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const navigate = useNavigate();

  //profile pic
  const profileRef = useRef(null);
  const profileImgRef = useRef(null);
  const [profilePicObj, setProfilePicObj] = useState({});
  const [profileOptionShow, setProfileOptionShow] = useState(false);
  const [userDetails, setuserDetails] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        profileImgRef.current &&
        !profileImgRef.current.contains(event.target)
      ) {
        setProfileOptionShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef, profileImgRef]);

  useEffect(() => {
    setuserDetails(
      GetUserForSelectedLanguage(userDetailsAll, selectedLanguage)
    );
  }, [selectedLanguage, userDetailsAll]);

  function splitStringToObject(str) {
    try {
      const parts = str.split("||").map((part) => part.trim());
      const obj = {};
      parts?.forEach((part) => {
        const [key, value] = part.split("=").map((item) => item.trim());
        obj[key] = value;
      });
      return obj;
    } catch (error) {
      console.error("Error occurred while parsing the string:", error.message);
      return {}; //Return an empty object in case of failure
    }
  }

  useEffect(() => {
    setProfilePicObj(splitStringToObject(userDetails?.profilePictureFileName));
  }, [userDetails]);

  ///path related
  useEffect(() => {
    let ph = pathNameString.split("/");
    console.log("pathNameString ", ph[ph.length - 1]);
    setCurrentPage(ph[ph.length - 1]);
  }, []);
  const navigateTo = (e) => {
    navigate(`/${e.module}/${e.path}`);
  };

  return (
    <React.Fragment>
      <AccountSettings />
      <UserProfileSeeker />
      <AttachmentsModal />

      <Sidebar
        style={{ overflow: "hidden" }}
        width="220px"
        collapsedWidth="4.5rem"
        backgroundColor="#ffff"
        collapsed={true}
      >
        <Menu>
          <div
            className=" d-flex flex-column "
            style={{ height: "100vh", minHeight: "100vh", maxHeight: "100vh" }}
          >
            <div
              className="d-flex pt-1 mb-2"
              style={{ marginLeft: "1.1rem", color: "var(--primary-color)" }}
            >
              <img
                src={logo}
                alt="Logo"
                width="39"
                height="39"
                className="d-inline-block mt-2"
              />
              {!collapsed && (
                <div
                  className="d-flex flex-column ms-1 "
                  style={{ color: "var(--primary-color)" }}
                >
                  <div
                    className="font-weight-1 "
                    style={{
                      color:
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBarFondtColor"
                          ) || {}
                        ).mvalue || "var(--primary-color)",
                      direction:
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "Direction"
                          ) || {}
                        ).mvalue || "ltr",
                    }}
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "ApplicationName"
                      ) || {}
                    ).mvalue || "nf Skill dashboard"}
                  </div>
                  <div
                    className="d-flex px-1 pt-0  font-weight-0  font-6 fst-italic   "
                    style={{
                      color:
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "NavBardFontColor"
                          ) || {}
                        ).mvalue || "var(--primary-color)",
                      direction:
                        (
                          content[selectedLanguage]?.find(
                            (item) => item.elementLabel === "Direction"
                          ) || {}
                        ).mvalue || "ltr",
                    }}
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "SkillSeeker"
                      ) || {}
                    ).mvalue || "nf Skill Seeker"}
                  </div>
                </div>
              )}
            </div>

            {menuItems?.map((data, index) => (
              <MenuItem
                style={{ color: "var(--primary-color)" }}
                data-toggle="tooltip"
                data-placement="right"
                title={data.name}
                className={`  ${
                  pathNameString.includes(data.path) ? "bg-light" : ""
                }`}
                id={index}
                onClick={() => navigateTo(data)}
                icon={data.icon}
              >
                {" "}
                {data.name}
              </MenuItem>
            ))}

            <div style={{ marginTop: "auto" }}>
              <MenuItem
                style={{ color: "var(--primary-color)", marginBottom: "" }}
                data-toggle="tooltip"
                data-placement="right"
                title={
                  (
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Attachments"
                    ) || {}
                  ).mvalue || "nf Attachments"
                }
                data-bs-toggle="modal"
                data-bs-target="#attachmentModal"
                className="my-3"
                // id={index}
                //  onClick={() => navigateTo(data)}
                icon={
                  <ImAttachment
                    style={{ color: "var(--primary-color)" }}
                    size={25}
                  />
                }
              >
                {" "}
                {(
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "Attachments"
                  ) || {}
                ).mvalue || "nf Attachments"}
              </MenuItem>

              <SubMenu
                style={{
                  color: "var(--primary-color)",
                  backgroundColor: "#ffff",
                }}
                className=" p-0 mb-4 "
                label={!collapsed && "Profile"}
                icon={
                  <img
                    src={
                      userDetails?.profilePictureFileName &&
                      userDetails?.profilePictureFileName?.length > 1
                        ? GetAttachment(
                            userDetails?.id,
                            profilePicObj?.fileName,
                            profilePicObj?.fileId
                          )
                        : user
                    }
                    alt={
                      (
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Profile Picture"
                        ) || {}
                      ).mvalue || "NF"
                    }
                    width="40"
                    height="40"
                    className=" rounded-circle p-0  "
                  />
                }
              >
                <MenuItem
                  style={{
                    color: "var(--primary-color)",
                    backgroundColor: "#ffff",
                  }}
                >
                  <button
                    className="btn  p-0 m-0"
                    data-bs-toggle="modal"
                    data-bs-target="#accountsettings"
                    onClick={() => setProfileOptionShow(false)}
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "AccountSettings"
                      ) || {}
                    ).mvalue || "nf Account Settings"}
                  </button>
                </MenuItem>
                <MenuItem
                  style={{
                    color: "var(--primary-color)",
                    backgroundColor: "#D6E2B3",
                  }}
                >
                  <Link to="/skill-owner/email">
                    <button className="btn  p-0 m-0">
                      {(
                        content[selectedLanguage]?.find(
                          (item) => item.elementLabel === "Logout"
                        ) || {}
                      ).mvalue || "nf Logout"}
                    </button>
                  </Link>
                </MenuItem>
                <MenuItem
                  style={{
                    color: "var(--primary-color)",
                    backgroundColor: "#D6E2B3",
                  }}
                >
                  <button
                    className="btn  p-0 m-0"
                    data-bs-toggle="modal"
                    data-bs-target="#setting"
                  >
                    {(
                      content[selectedLanguage]?.find(
                        (item) => item.elementLabel === "MyProfile"
                      ) || {}
                    ).mvalue || "nf My Profile"}
                  </button>
                </MenuItem>
              </SubMenu>
            </div>
          </div>
        </Menu>
      </Sidebar>
    </React.Fragment>
  );
}

export default SidebarSeeker;
