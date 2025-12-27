import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  setAcquiredSkills,
  setAppliedSkills,
  setDetailedProfileData,
} from "../../reducer/SkillSeeker/SkillBasedSearch/SkillBasedResultSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import SkillProfileView from "../../components/SkillAvailer/SkillProfileView";
import SkillPRofileOfUserAndUserSkill from "../../api/SkillSeeker/SkillPRofileOfUserAndUserSkill";
import ValidationByItemIdAPI from "../../api/SkillSeeker/ValidationByItemIdAPI";
import { FetchDetailedDataByUsedId } from "../../api/fetchAllData/FetchDetailedDataByUsedId";
import PrimaryBtn from "../../components/Buttons/PrimaryBtn";
import DetailedProfileViewSeeker from "../../components/SkillAvailer/DetailedProfileViewSeeker";
import { FaArrowRight } from "react-icons/fa6";

const DetailPanel = ({ row }) => {
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);

  const dispatch = useDispatch();
  const [skillProfileLoader, setSkillProfileLoader] = useState(false);
  const [appliedSkillData, setAppliedSkillData] = useState([]);
  const [acquiredSkillData, setAcquiredSkillData] = useState([]);
  const [detailProfileLoader, setDetailProfileLoader] = useState(false);
  const [detailProfileView, setDetailProfileView] = useState(false);

  const [skillProfileView, setSkillProfileView] = useState(true);

  const SkillBasedResult = useSelector((state) => state.SkillBasedResult);

  const handleDetailedProfileClick = async (userDetail) => {
    if (skillProfileView) {
      setSkillProfileView(false);
      setDetailProfileView(true);
    } else {
      setSkillProfileView(true);
      setDetailProfileView(false);
    }

    if (!userDetail.detailedProfileData) {
      try {
        console.log("Setting loader to true");
        setDetailProfileLoader(true);
        const res = await FetchDetailedDataByUsedId(userDetail?.userId);

        dispatch(setDetailedProfileData(res));
        console.log(
          "all details of detailed Profile ",
          userDetail?.detailedProfileData
        );
      } catch (error) {
        // Handle errors appropriately
        console.error("Error fetching skills:", error);
      } finally {
        setDetailProfileLoader(false);
      }
    }
  };

  useEffect(() => {
    console.log("useEfffff triggered grid ");

    const fetchData = async () => {
      console.log();
      try {
        // Reset acquired and applied skill data arrays
        setAcquiredSkillData([]);
        setAppliedSkillData([]);

        // Call your API function here
        const skillProfileData = await apilooper(row?.original);

        if (
          skillProfileData?.skillsAcquired &&
          skillProfileData.skillsAcquired.length > 0
        ) {
          setAcquiredSkillData(skillProfileData.skillsAcquired);
        }

        if (
          skillProfileData?.skillsApplied &&
          skillProfileData.skillsApplied.length > 0
        ) {
          setAppliedSkillData(skillProfileData.skillsApplied);
        }
      } catch (error) {
        console.error("Error fetching skills: grid", error);
      } finally {
        // Handle loading state if needed
        setSkillProfileLoader(false);
      }
    };

    if (
      (!row?.original?.skillacq || row.original.skillacq.length === 0) &&
      (!row?.original?.skillapp || row.original.skillapp.length === 0)
    ) {
      console.log("fetch data is called grid ");
      setSkillProfileLoader(true);
      fetchData();
    }
    setSkillProfileView(true);
  }, []);

  useEffect(() => {
    if (acquiredSkillData.length > 0) {
      dispatch(
        setAcquiredSkills({
          userId: row.original.userId,
          acquiredSkillData: acquiredSkillData,
        })
      );
    }
    if (appliedSkillData.length > 0) {
      dispatch(
        setAppliedSkills({
          userId: row.original.userId,
          appliedSkillData: appliedSkillData,
        })
      );
    }
  }, [acquiredSkillData, appliedSkillData]);

  const SkillProfileAPICaller = async (skill, userDetail) => {
    try {
      const data = await SkillPRofileOfUserAndUserSkill(
        userDetail.userId,
        skill
      );
      console.log("sACqval  SkillProfileAPICaller", skill, " ", data);
      if (data?.SkillsAcquired?.length > 0) {
        // Use Promise.all to wait for all validations to complete
        await Promise.all(
          data.map(async (item) => {
            if (item?.id) {
              console.log("sACqval  Acquired spinning acq ");
              const validationData = await validationApiCaller(item?.id);
              console.log("individual validationData ", validationData);
              item.ValidationData = validationData ? validationData : [];
            }
            console.log("individual Item ", item);
          })
        );
      }
      if (data?.skillsApplied?.length > 0) {
        // Use Promise.all to wait for all validations to complete

        await Promise.all(
          data.skillsApplied.map(async (item) => {
            if (item?.id) {
              console.log("sACqval Applied spinning acq ");
              const validationData = await validationApiCaller(item?.id);
              console.log("individual validationData ", validationData);
              item.ValidationData = validationData ? validationData : [];
            }
            console.log("individual Item ", item);
          })
        );
      }

      return data;
    } catch (error) {
      console.error("Error fetching Applied or val data:", error);
      return null;
    }
  };

  const validationApiCaller = async (skillID) => {
    console.log("sACqval ", skillID);
    try {
      const skillValidation = await ValidationByItemIdAPI(skillID);

      console.log("sACqval ", skillValidation);
      return skillValidation;
    } catch (error) {
      console.log("error in validation api sACqval ", error);
    }
  };

  const apilooper = async (userDetail) => {
    const promises = userDetail?.availableSkills.map(async (skills) => {
      const skillProfileData = await SkillProfileAPICaller(
        skills?.skillOccupation,
        userDetail
      );
      const apidataAcquired = skillProfileData?.skillsAcquired;
      const apidataApplied = skillProfileData?.skillsApplied;
      if (apidataAcquired && apidataAcquired.length > 0) {
        console.log("logging in acq....", apidataAcquired);

        setAcquiredSkillData((prev) => [...prev, ...apidataAcquired]);
      }
      if (apidataApplied && apidataApplied.length > 0) {
        console.log("logging in app....", apidataApplied);

        setAppliedSkillData((prev) => [...prev, ...apidataApplied]);
      }
    });

    // Wait for all promises to resolve
    await Promise.all(promises);
  };

  return (
    <div className="d-flex flex-column">
      <div
        className="d-flex  align-baseline align-content-center align-items-baseline"
        style={{ marginLeft: "auto" }}
      >
        <p>Switch to </p>
        <PrimaryBtn
          label={
            skillProfileView
              ? (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "DetailedProfile"
                  ) || {}
                ).mvalue || "nf DetailedProfile"
              : (
                  content[selectedLanguage]?.find(
                    (item) => item.elementLabel === "SkillProfile"
                  ) || {}
                ).mvalue || "nf SkillProfile"
          }
          onClick={() => handleDetailedProfileClick(row.original)}
          backgroundColor="#F7FFDD"
          color="var(--primary-color)"
          font={"400"}
        />
        <FaArrowRight />
      </div>
      <div
        style={{
          overflowX: "hidden",
        }}
      >
        <SkillProfileView
          skillProfileView={skillProfileView}
          userDetail={row.original}
          skillPofileLoader={skillProfileLoader}
          listView={true}
        />
        <DetailedProfileViewSeeker
          detailProfileView={detailProfileView}
          userDetail={row.original}
          detailProfileLoader={detailProfileLoader}
        />
      </div>
    </div>
  );
};

export default DetailPanel;
