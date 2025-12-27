// React Library Imports
import {  Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useEffect} from "react";

import useContentLabel from "../../../../hooks/useContentLabel";
import SearchMethods from "../../../../views/profile management/skills data/new skill management/SearchMethods";
import { resetAddMultipleSkillsState, setSelectedSkillsforAdd } from "../../../../reducer/mySkills/AddMultipleSkillsSlice";
import { sessionDecrypt } from "../../../../config/encrypt/encryptData";

//API Imports
import PostApi from "../../../../api/PostData/PostApi";
import EditApi from "../../../../api/editData/EditApi";
import { exceptionPOSTapi } from "../../../../api/PostData/exceptionsPOSTapi";
import { getSkillExceptionRecord } from "../../../../api/PostData/ExceptionAPI/getSkillExceptionRecord";
import { fetchTopSkill } from "../../../../api/fetchAllData/fetchTopSkill";

import { setIsApiLoading } from "../../../../reducer/loading/isApiLoadingSlice";

import { showSuccessToast } from "../../../../components/ToastNotification/showSuccessToast";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";

import CouresSkillSearchThruOccupation from "./CouresSkillSearchThruOccupation";
import CouresSkillSearchDirect from "./CouresSkillSearchDirect";
import CouresSkillSearchThruCategory from "./CouresSkillSearchThruCategory";
import { getCookie } from '../../../../config/cookieService';


const CouresSkillComponent = ({ isActiveCard, isAddOpen, setIsAddOpen, isOnboarding = false }) => {
    /* STORES */
    const contentLabel = useContentLabel()
    const dispatch = useDispatch()
    const selectedLanguage = useSelector((state) => state.language);
    const topSkill = useSelector((state) => state.TopSkill);
    const { selectedSkillsforAdd, skillSearchMethod, masterDataCreated } = useSelector((state) => state.addMultipleSkills);

    useEffect(() => {
        if (topSkill?.data?.length > 0) {
            const formattedSkills = topSkill?.data?.map((skill) => {
                if (skill?.skill) {
                    return ({
                        ...skill,
                        isUserSkill: true,
                        isNew: false
                    })
                }
            })
            dispatch(setSelectedSkillsforAdd(formattedSkills || []))
        }
    }, [topSkill]);

    const handleExceptionForMaster = async (responseDatas) => {
        const userId = getCookie("userId")
        const updatedArrayForException = masterDataCreated.map(item => {
            const match = responseDatas.find(skill => skill.skillId === item.id);

            return {
                mlanguage: selectedLanguage,
                masterTable: "skill",
                masterTableRecordID: item.id,
                module: "skill",
                userId: userId,
                candidateId: userId,
                content: item.skill,
                isUserPosted: !!match,
                ...(match && { relatedId: match.id }),
            };
        });


        console.log("exception", updatedArrayForException);

        // Loop and call APIs
        for (const record of updatedArrayForException) {
            try {
                const existing = await getSkillExceptionRecord(record.masterTableRecordID);


                if (existing?.data?.length > 0) {
                    // Record exists, call edit API
                    const currentRelatedIds = existing?.data[0]?.relatedIds || [];

                    // If already exists, no need to update
                    if (!currentRelatedIds.includes(record.relatedId)) {
                        const updatedRelatedIds = [...currentRelatedIds, record.relatedId].join("||");

                        const updatedBody = {
                            relatedIds: updatedRelatedIds,
                        };

                        await EditApi("Exceptions", existing?.data[0]?.id, updatedBody);
                    }

                } else {
                    // Record doesn't exist, call post API
                    await exceptionPOSTapi("Exceptions", { ...record, relatedIds: (record.relatedId || ""), });
                }
            } catch (error) {
                console.error(`Error processing record ${record.masterTableRecordID}:`, error);
            }
        }

    }

    const handleSaveSkills = async () => {
        const baseSkillData = {
            selectedLanguage,
            yoe: "0",
            userId:getCookie("userId"),
        };
        dispatch(setIsApiLoading(true));
        try {
            const nonUserSkills = selectedSkillsforAdd?.filter((skill) => !skill?.isUserSkill) ?? [];

            if (nonUserSkills.length === 0) {
                console.log("No new skills to add.");
                return;
            }

            const findRank = topSkill?.data?.filter(
                (item) => item.mlanguage === selectedLanguage
            ) ?? [];

            const postDataPromises = nonUserSkills.map((item, index) => {

                const newUserSkill = {
                    ...baseSkillData,
                    skillOccupation: item?.skill,
                    skill: item?.skill,
                    // occupation: item?.occupation,
                    // occupationId: item?.occupationId,
                    // skillCategory: item?.skillCategory,
                    skillId: item?.id,
                    userRank: findRank.length + (index + 1),
                };
                return PostApi("User Skills", newUserSkill);
            });

            const responses = await Promise.all(postDataPromises);
            console.log("Skills successfully saved:", responses);

            const responseDatas = responses?.map((res) => res?.data)

            if (masterDataCreated?.length > 0) {
                await handleExceptionForMaster(responseDatas)
            }

            dispatch(fetchTopSkill());
            dispatch(resetAddMultipleSkillsState())
            setIsAddOpen(false)
            showSuccessToast(
                contentLabel(
                    "SkillsUpdatedSuccessfully",
                    "Skills updated successfully"
                )
            );
            // Optionally show a success message to the user here

        } catch (error) {
            console.error("Error saving skills:", error);
            showErrorToast(
                contentLabel("SomethingWentWrong", "nf Something went wrong")
            );
            // Optionally show an error message to the user here

        } finally {
            dispatch(setIsApiLoading(false));
        }
    };

    const handleConfrim = () => {
        setIsAddOpen(false)
        dispatch(resetAddMultipleSkillsState())
    }


    return (
        <>
            <div className='d-flex flex-column justify-content-between h-100'>
                <div>
                    <SearchMethods />
                    {
                        skillSearchMethod === "direct" &&
                        <Row>
                            <CouresSkillSearchDirect isActiveCard={isActiveCard}/>
                        </Row>
                    }
                    {
                        skillSearchMethod === "occupation" &&
                        <Row>
                            <CouresSkillSearchThruOccupation isActiveCard={isActiveCard} />
                        </Row>
                    }
                    {
                        skillSearchMethod === "category" &&
                        <Row>
                            <CouresSkillSearchThruCategory isActiveCard={isActiveCard} />
                        </Row>
                    }                   
                </div>
             </div>
        </>
    )
}

export default CouresSkillComponent