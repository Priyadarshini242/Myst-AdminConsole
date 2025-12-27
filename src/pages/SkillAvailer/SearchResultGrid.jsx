import React, { useEffect, useState, useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { MenuItem, Tooltip } from '@mui/material';
import DetailPanel from './DetailPanel';
import { setSelectedOwner } from '../../reducer/SkillSeeker/SkillBasedSearch/SkillBasedResultSlice';
import GridComponent from '../../components/SkillAvailer/JDRelatedComponents/GRIDS/GridComponent';
import useContentLabel from '../../hooks/useContentLabel';
import PostApi from '../../api/PostData/PostApi';
import { showErrorToast } from '../../components/ToastNotification/showErrorToast';
import { showSuccessToast } from '../../components/ToastNotification/showSuccessToast';
import { setChatListsOpen, setReceiverPreferences, setSelectedChat, setSelectedChatOpen, setSelectedPreferencesDirectly } from '../../reducer/chat engine/chatStoreSlice';
import { GetAttachment } from '../../api/Attachment  API/DownloadAttachmentApi';
import "./Css/DbAccessGridColsStyle.css"
import { FilterChannels } from '../../config/constant';
const SearchResultGrid = ({ data, handleSwitchPane }) => {
    const { selectedChatOpen, selectedChat, chatList } = useSelector((state) => state.chatStore);
    const SkillBasedResult = useSelector(state => state.SkillBasedResult);
    const dispatch = useDispatch();
    const { search, pathname } = useLocation(); // Get search params from the URL
    const queryParams = new URLSearchParams(search); // Parse the query params
    const contentLabel = useContentLabel();
    const selectedLanguage = useSelector(state => state.language);
    const content = useSelector(state => state.content);
    const SavedSearch = useSelector(state => state.SavedSearchSlice);
    const [showAction, setShowAction] = useState(false); // Use state to track showAction

    useEffect(() => {
        //       navigate(`/skill-seeker/Skill-Search/Database-Access?Title=${title}&Id=${id}&Saved=${false}`);
        const jid = queryParams.get("courseId");
        const showActionParam = queryParams.get("Saved") === 'true'; // Ensure comparison is correct
        // console.log(jid, " ", showActionParam);
        const Id = queryParams.get("Id") || "null";
        // console.log("id ", Id);
        if (SavedSearch.SelectedJd && (Id === SavedSearch.SelectedJd.id)) {
            setShowAction(true);
        }
        // Update state based on the URL params
        else if (jid && showActionParam) {
            setShowAction(true);
        } else {
            setShowAction(false);
        }
    }, [search]); // Dependency on search to update when the URL changes

    function sliceUntilPipe(str) {
        if (typeof str !== 'string') {
            return '';
        }
        const index = str.indexOf('|');
        if (index !== -1) {
            return str.slice(0, index);
        }
        return str; // return the original string if '|' is not found
    }

    const columns = useMemo(
        () => [
            {
                accessorKey: 'firstName', //access nested data with dot notation
                header: (content[selectedLanguage]?.find(item => item.elementLabel === 'Name') || {}).mvalue || "nf Name",
                minSize: 120,
                maxSize: 120,
                size: 120,
                Cell: ({ cell }) => (
                    <Tooltip title={cell.getValue()} arrow>
                        <span className="    cell-size-120-dbGrid-column fixed-cell-dbGrid-column">{cell.getValue() || contentLabel('NotAvailable','nf Not Available')}</span>
                    </Tooltip>
                ),
            },
            {
                accessorFn: (row) => ("skill"),
                header: contentLabel("Skills", "nf Skills"),
                minSize: 140,
                maxSize: 140,
                size: 140,
                Cell: ({ cell, row }) => {
                    let skills = "";
                    console.log("rowwwww ,", row.original.availableSkills)
                    if (row.original.availableSkills && Array.isArray(row.original.availableSkills)) {
                        try {
                            skills = row.original.availableSkills?.map(skill => skill.Skill)
                                .join(', ');
                        } catch (error) {
                            console.error("error ", error)
                            skills = "";
                        }
                    }
                    return (
                        <Tooltip title={skills} arrow>
                            <span className="  cell-size-160-dbGrid-column fixed-cell-dbGrid-column">{skills || contentLabel('NotAvailable','nf Not Available')}</span>
                        </Tooltip>
                    )
                },
            },
            {
                accessorKey: 'Email',
                header: contentLabel("Email", "nf Email"),
                minSize: 120,
                maxSize: 120,
                size: 120,
                Cell: ({ cell }) => (
                    <Tooltip title={cell.getValue()} arrow>
                        <span className="    cell-size-120-dbGrid-column fixed-cell-dbGrid-column">{cell.getValue() || contentLabel('NotAvailable','nf Not Available')}</span>
                    </Tooltip>
                ),
            },
            {
                accessorKey: 'PrefferedLocation', //normal accessorKey
                header: contentLabel("Location", "nf Location"),
                minSize: 120,
                maxSize: 120,
                size: 120,
                Cell: ({ cell }) => (
                    <Tooltip title={cell.getValue()} arrow>
                        <span className="   cell-size-120-dbGrid-column fixed-cell-dbGrid-column">{cell.getValue() || contentLabel('NotAvailable','nf Not Available')}</span>
                    </Tooltip>
                ),
            },
            {
                accessorKey: 'PhoneNumber',
                header: contentLabel("Phone", "nf Phone"),
                minSize: 120,
                maxSize: 120,
                size: 120,
                Cell: ({ cell }) => (
                    <Tooltip title={cell.getValue()} arrow>
                        <span className="    cell-size-120-dbGrid-column fixed-cell-dbGrid-column">{cell.getValue() || contentLabel('NotAvailable','nf Not Available')}</span>
                    </Tooltip>
                ),
            },
        ],
        [content, selectedLanguage, contentLabel], // Add contentLabel and other dependencies
    );

console.log("data", data);
console.log("columns", columns);
    //action items functions

    const [isPosting, setIsPosting] = useState(false);

    const handlePost = async (row) => {
        // if (row.availableSkills.length === 0) {
        //     console.log("No skills to post. Skipping JAnswers and JRSkills.");
        //     return;
        // }

        setIsPosting(true);

        try {

            const { FirstName, LastName, Email, PhoneNumber, userId } = row;

            const res = await PostApi("JResponse", {
                "jid": queryParams.get("Id"),
                "jdTitle": queryParams.get("title"),
                "firstName": FirstName,
                "lastName": LastName,
                "emailAddress": Email,
                "jrPhone": PhoneNumber,
                "status": 'New',
                "mystProfile": userId,
                "numMatch": row.availableSkills.length
            });

            // console.log("posted JResponse", res.data);

            const newId = res.data.id;

            // Only proceed to post answers and JRSkills if mergedSkills.length > 0
            if (row.availableSkills.length > 0) {


                const postJRSkillsPromises = row.availableSkills.map(async (obj) => {
                    // console.log("obj", obj);
                    try {
                        const secondRes = await PostApi("JRSkills", {
                            "jid": queryParams.get("Id"),
                            "jrid": newId,
                            "skill": obj.Skill,
                            "occupation": obj.Occupation,
                            "skillOccupation": obj.skillOccupation,
                            "jdType": obj.yoePhase,
                            "expMax": obj.AppliedExp ? obj.AppliedExp : "0",
                            "expMin": obj.skillAcquiredExp ? obj.skillAcquiredExp : "0",
                            "skillAppliedExp": obj.AppliedExp ? obj.AppliedExp : "0",
                            "skillAcquiredExp": obj.skillAcquiredExp ? obj.skillAcquiredExp : "0",
                            "expPhase": obj.yoePhase,
                            "topFive": obj.Rank <= 5 ? "yes" : "no",
                            "jdValidated": "no",
                            "userId": obj.UserID,
                            "jdMatch": "Perfect",
                            "skillId": obj.SkillID,

                        });

                        console.log("Successfully posted to JRskills table", secondRes.data);
                    } catch (error) {
                        console.error("Error posting JRSkills", error);
                    }
                });

                await Promise.all(postJRSkillsPromises);
                showSuccessToast(
                    (content[selectedLanguage]?.find(
                        (item) => item.elementLabel === 'Saved'
                    ) || {}).mvalue || "nf Saved"
                );
            }
            // removeLocalStorage('Jlang', 'JD_ID');
        } catch (err) {
            console.log(err);
            showErrorToast(
                (content[selectedLanguage]?.find(
                    (item) => item.elementLabel === 'SomethingWentWrong'
                ) || {}).mvalue || "Something went wrong"
            );
            setIsPosting(false);
        } finally {
            setIsPosting(false);
        }
    };


    const handlePostForAgency = async (row) => {

        setIsPosting(true);

        try {

            const { FirstName, LastName, Email, PhoneNumber, userId } = row;

            const res = await PostApi("Course Response", {
                "userCourseId": queryParams.get("courseId"),
                "firstName": FirstName,
                "lastName": LastName,
                "emailAddress": Email,
                "coursePhone": PhoneNumber,
                "mystProfile": userId,
                "numMatch": row.availableSkills.length,
                "status" : 'New'
            });

            // console.log("posted Course Response", res.data);

            const newId = res.data.id;

            // Only proceed to post answers and JRSkills if mergedSkills.length > 0
            if (row.availableSkills.length > 0) {

                const postJRSkillsPromises = row.availableSkills.map(async (obj) => {
                    // console.log("obj", obj);
                    try {
                        const secondRes = await PostApi("CRSkills", {
                            "cid": queryParams.get("courseId"),
                            "crId": newId,
                            "skill": obj.Skill,
                            "occupation": obj.Occupation,
                            "skillOccupation": obj.skillOccupation,
                            "crsType": obj.yoePhase,
                            "expMax": obj.AppliedExp ? obj.AppliedExp : "0",
                            "expMin": obj.skillAcquiredExp ? obj.skillAcquiredExp : "0",
                            "skillAppliedExp": obj.AppliedExp ? obj.AppliedExp : "0",
                            "skillAcquiredExp": obj.skillAcquiredExp ? obj.skillAcquiredExp : "0",
                            "expPhase": obj.yoePhase,
                            "topFive": obj.Rank <= 5 ? "yes" : "no",
                            "crsIsValidated": "no",
                            "userId": obj.UserID,
                            "crsMatch": "Perfect",
                            "skillId": obj.SkillID,

                        });

                        console.log("Successfully posted to JRskills table", secondRes.data);
                    } catch (error) {
                        console.error("Error posting JRSkills", error);
                    }
                });

                await Promise.all(postJRSkillsPromises);
                showSuccessToast(
                    (content[selectedLanguage]?.find(
                        (item) => item.elementLabel === 'Saved'
                    ) || {}).mvalue || "nf Saved"
                );
            }
            // removeLocalStorage('Jlang', 'JD_ID');
        } catch (err) {
            console.log(err);
            showErrorToast(
                (content[selectedLanguage]?.find(
                    (item) => item.elementLabel === 'SomethingWentWrong'
                ) || {}).mvalue || "Something went wrong"
            );
            setIsPosting(false);
        }finally{
              setIsPosting(false);
        }

    }

    const handleSave = (row) => {
        if (pathname.includes('skilling-agency')) {
            handlePostForAgency(row.original)
        } else {
            handlePost(row.original);
        }

    }


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
            return {}; /* RETURN EMPTY OBJECT INCASE OF FAILURE */
        }
    }

    const table = useMaterialReactTable({
        columns,
        data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enablePagination: true,
        enableColumnFilters: false, // Disable filters
        enableSorting: false, // Disable sorting
        enableBottomToolbar: true,
        enableRowVirtualization: false,
        muiTableContainerProps: { sx: { height: "auto" } },
        muiTableHeadCellProps: ({ column }) => ({
            sx: { backgroundColor: '#f5f5f5' },
        }),
        enableStickyHeader: true,
        initialState: { showColumnFilters: false, density: 'compact' },
        enableRowSelection: true,
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                fontWeight: row.original.userId === SkillBasedResult.SelectedOwner?.userId ? '1000' : 'normal',
                backgroundColor: row.original.userId === SkillBasedResult.SelectedOwner?.userId ? "#F5F5F5" : "#FFFFFF",
            },
            onClick: (event) => {
                console.info(row.original);
                let userId = row.original.userId;
                if (SkillBasedResult.SelectedOwner.hasOwnProperty("userId") && SkillBasedResult.SelectedOwner.userId === userId) {
                    // console.log("Same Owner");
                } else {
                    dispatch(setSelectedOwner(row.original));
                    // console.log("selected Owner");
                }
                handleSwitchPane();
            },
        }),
        positionActionsColumn: 'last',
        // enableRowActions: showAction, // Use state to control row actions
        enableRowActions: true,
        renderRowActionMenuItems: ({closeMenu, row }) => [


            <MenuItem key="message" onClick={() => {
                // console.log(row?.original)
                // console.log(chatList)

                const chatExist = chatList?.find((chat) => chat.userId === row?.original?.userId)
                if (chatExist?.conversationId) {
                    dispatch(setSelectedChat({ ...chatExist, "email": row?.original?.email || "" }))
                } else {
                    dispatch(setSelectedChat({
                        "online": "No",
                        "userId": row?.original?.userId,
                        "firstName": row?.original?.FirstName,
                        "lastName": row?.original?.LastName,
                        "expired": false,
                        // "conversationId": "cb9148c8-921b-43ea-afba-4b2a47538220",
                        "profilePictureFileName": row?.original?.ProfilePictureFileName,
                        "email": row?.original?.email || ""
                    }))
                }

                const receiverPreferences = ['im'];
                if (row?.original?.whatsappPreference === "Yes") {
                    receiverPreferences.push("whatsapp");
                }
                if (row?.original?.emailPreference === "Yes") {
                    receiverPreferences.push("mail");
                }

                console.log("receiverPreferences", receiverPreferences);


                dispatch(setReceiverPreferences(receiverPreferences));
                dispatch(setSelectedPreferencesDirectly(FilterChannels))
                dispatch(setSelectedChatOpen(true))
                dispatch(setChatListsOpen(true))
                closeMenu()

            }}>
                {contentLabel("Message", "nf Message")}
            </MenuItem>,
            showAction &&
            <MenuItem key="save" disabled={isPosting} onClick={() => handleSave(row)}>
                {contentLabel("Save", "nf Save")}
            </MenuItem>,

        ],
    });

    return <div>
        <GridComponent table={table} />
    </div>;
};

export default SearchResultGrid;
