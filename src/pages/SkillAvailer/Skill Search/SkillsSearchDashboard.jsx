import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import OccupationModal from "../../../components/SkillAvailer/OccupationModal";
import SkillSeekerSearch from "../SkillSeekerSearch";
import { setMyRefinedSkills } from "../../../reducer/SkillSeeker/SkillBasedSearch/RefMyRequirementsSkillSlice";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import { getCookie } from '../../../config/cookieService';


const SkillsSearchDashboard = () => {
  const userRole = getCookie("USER_ROLE");
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const skillSuggestionRef = useRef(null);

  //auto hides popups
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        skillSuggestionRef.current &&
        !skillSuggestionRef.current.contains(event.target)
      ) {
        setSkillSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [skillSuggestionRef]);

  //store imports

  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);

  const [locationForNewEmployment, setLocationForNewEmployment] = useState("");
  //search results
  const SkillBasedResult = useSelector((state) => state.SkillBasedResult);
  //my requiremnet
  const MyRequirement = useSelector((state) => state.MyRequirement);
  //refine my req
  const RefMyRequirements = useSelector((state) => state.RefMyRequirements);
  //Regional country Data
  const regionalData = useSelector((state) => state.regionalData);

  useEffect(() => {
    console.log("ssssssss ", locationForNewEmployment);
  }, [locationForNewEmployment]);

  //Suggestions inside skill search
  const [SkillSuggestions, setSkillSuggestions] = useState(false);
  //my req add skill

  useEffect(() => {
    console.log("ref my req ", RefMyRequirements?.skillsInRefined);
  }, [RefMyRequirements?.skillsInRefined]);

  const navbarRef = useRef(null);
  const [contentHeight, setContentHeight] = useState("100vh");
  const [sidebarHeight, setSidebarHeight] = useState("100vh");

  useEffect(() => {
    if (navbarRef.current) {
      const navbarHeight = navbarRef.current.offsetHeight;
      setContentHeight(`calc(98vh - ${navbarHeight}px)`);
      setSidebarHeight(`calc(100vh - ${navbarHeight}px)`);
    }
  }, []);

  const handleRemoveListOfMyReqSkill = (e) => {
    console.log(e.target.id);
    // remove from list of skills

    //setRefineSkillFilter(RefineSkillFilter.map((item, i) => i === parseInt(e.target.id) ? { ...item, show: !item.show } : item));

    dispatch(
      setMyRefinedSkills(
        MyRequirement?.skillsInMyReq?.map((item, i) =>
          i === parseInt(e.target.id) ? { ...item, show: !item.show } : item
        )
      )
    );
  };

  return (
    <div className="" style={{ height: "79vh" }}>
      {/*occupation modal */}

      <OccupationModal />
      <SkillSeekerSearch
        SkillBasedResult={SkillBasedResult}
        contentHeight={"84vh"}
      />
    </div>
  );
};

export default SkillsSearchDashboard;
