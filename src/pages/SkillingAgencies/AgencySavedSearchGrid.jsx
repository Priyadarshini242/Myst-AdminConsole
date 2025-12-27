import { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, IconButton, MenuItem, Tooltip } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { GoStar, GoStarFill } from "react-icons/go";
import { useLocation, useNavigate } from "react-router-dom";
import { GetJdSkillAndQnWithId } from "../../api/SkillSeeker/job detail/GetJdSkillAndQnWithId";
import { fetchAgencySavedSearch } from "../../api/SkillingAgency/fetchAgencySavedSearch";
import { icons } from "../../constants";
import useContentLabel from "../../hooks/useContentLabel";
import JDListGridOptions from "../../components/SkillAvailer/JDRelatedComponents/JDListGridOptions";
import {
  handleCourseFavorite,
  handleFavorite,
  paginationSizeCalculator,
  paginationStartCalcualtor,
  setStatus,
} from "../../components/helperFunctions/GridHelperFunction";
import { formatTimestampToDate } from "../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import {
  setFilterStore,
  setPaginationStore,
  setSelectedCourse,
  setSortingStore,
} from "../../reducer/skilling agency/search/AgencySavedSearchSlice";
import { setMyReqSkills } from "../../reducer/SkillSeeker/SkillBasedSearch/MyRequirementSkillSlice";
import { emptySkillSearchResult } from "../../reducer/SkillSeeker/SkillBasedSearch/SkillBasedResultSlice";
import {
  setMyRefinedLocations,
  setMyRefinedSkills,
} from "../../reducer/SkillSeeker/SkillBasedSearch/RefMyRequirementsSkillSlice";
import { sessionEncrypt } from "../../config/encrypt/encryptData";
import { convertDaysToPhase } from "../../components/SkillAvailer/helperFunction/conversion";
import GridComponent from "../../components/SkillAvailer/JDRelatedComponents/GRIDS/GridComponent";

const AgencySavedSearchGrid = ({
  leftColW,
  setOnClick,
  handleShowForPlusBtn,
}) => {
  /* CONTENT LABEL */

  const contentLabel = useContentLabel();
  const navigate = useNavigate();
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const dispatch = useDispatch();
  const SavedSearch = useSelector((state) => state.agencySavedSearch);
  const { searchQuery, metaData, myCoursesList, selectedCourse } = SavedSearch;

  const MyRequirement = useSelector((state) => state.MyRequirement);
  //refine my req
  const RefMyRequirements = useSelector((state) => state.RefMyRequirements);
  //manage our own state for stuff we want to pass to the API
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [btnDisableApiClick, setBtnDisableApiClick] = useState(false);
  const [dispatchComplete, setDispatchComplete] = useState(false);
  console.log("Extracted Data:", data); // Log extracted data

  const handleFavouriteClick = async (id, changeTo) => {
    setBtnDisableApiClick(true);
    try {
      await handleCourseFavorite(id, "User Courses", changeTo);
      setRefresh((prev) => !prev);
    } catch (error) {
      // Handle the error here
    } finally {
      setBtnDisableApiClick(false);
    }
  };

  const updateSkillFilter = () => {
    const updatedSkillFilterRef = MyRequirement?.skillsInMyReq?.map(
      (skill) => ({
        ...skill,
        value: skill.skillOccupation,
        label: skill.skillOccupation,
        // Add other properties as needed
      })
    );
    const updatedLocationFilterRef = MyRequirement?.MyRequirement?.map(
      (location) => ({
        value: location.value,
        label: location.value,
        show: true,
        // Add other properties as needed
      })
    );

    dispatch(setMyRefinedLocations(updatedLocationFilterRef || []));
    dispatch(setMyRefinedSkills(updatedSkillFilterRef));

    sessionStorage.setItem(
      "SelectedJdInnitialRequirment",
      sessionEncrypt(
        JSON.stringify({
          skillsInRefined: updatedSkillFilterRef,
          locationsInRefined: updatedLocationFilterRef || [],
        })
      )
    );
  };

  const handleAccessDb = async (row) => {


    
    dispatch(setSelectedCourse(row?.original?.id));
if (row?.original?.preRequisiteSkillsList || row?.original?.attainableSkillsList) {

  const skills = [
      ...(row?.original?.preRequisiteSkillsList
        ? row.original.preRequisiteSkillsList.map((data) => ({
            ...data,
            experienceReq: data.yoeMin !== "0" && data.yoeMax !== "0",
            minExp: convertDaysToPhase(data.yoeMin, data.yoePhase),
            maxExp: convertDaysToPhase(data.yoeMax, data.yoePhase),
            range: data.yoePhase,
            required: false,
            validated: data?.skillValidation === "Yes",
            TopSkill: data?.topSkill === "Yes",
            edit: false,
            show: data?.isMandatory === "Yes",
            label: data.skillId,
            value: data.skillId,
            skillOccupation: data.skillId,
          }))
        : []),

      ...(row?.original?.attainableSkillsList
        ? row.original.attainableSkillsList.map((data) => ({
            ...data,
            experienceReq: false,
            minExp: 0,
            maxExp: 0,
            range: "year",
            required: false,
            validated: false,
            TopSkill: false,
            edit: false,
            show: true,
            label: data.skill,
            value: data.skill,
            skillOccupation: data.skill,
            isAptain: true,
          }))
        : [])
      ]

      const location = (row?.original?.location && row?.original?.location !== "-") ? row?.original?.location?.split(',')?.map((loc)=>({value:loc?.trim() || '',label:loc?.trim() || '',show:true})) : []
  dispatch(setMyReqSkills(skills),);
  dispatch(setMyRefinedSkills(skills));
  dispatch(setMyRefinedLocations( location || []));

    sessionStorage.setItem(
      "SelectedJdInnitialRequirment",
      sessionEncrypt(
        JSON.stringify({
          skillsInRefined: skills,
          locationsInRefined: location || [],
        })
      )
    );

  // updateSkillFilter();
  dispatch(emptySkillSearchResult());
  navigate(
    `/skilling-agency/Skill-Search/Access-Database?courseId=${
      row?.original?.id
    }&courseName=${row?.original?.courseName}&Saved=${true}`
  );
}

  };

  //NO NEED TO USE THIS USE EFFECT FOR AGENCY
  // useEffect(() => {
  //     if (dispatchComplete) {
  //         updateSkillFilter();
  //         setDispatchComplete(false); // Reset the state to avoid repeated calls
  //         dispatch(emptySkillSearchResult());
  //         // navigate(`/skill-seeker/Skill-Search/Access-Database?Title=${selectedCourse.title}&Id=${selectedCourse.id}&Saved=${true}`);
  //         navigate(`/skilling-agency/Skill-Search/Access-Database?courseId=${selectedCourse?.id}&courseName=${selectedCourse?.courseName}&Saved=${true}`);

  //     }
  // }, [dispatchComplete]);

  const columns = useMemo(
    () => [
      // {
      //     enableColumnFilter: false,

      //     accessorKey: 'favorite',
      //     header: "fav",
      //     minSize: 20, //allow columns to get smaller than default //min size enforced during resizing
      //     maxSize: 20, //max size enforced during resizing
      //     size: 20,
      //     Header: ({ column }) => (
      //         <GoStar size={17} />//re-use the header we already defined
      //     ), //arrow function
      //     enableGlobalFilter: false,
      //     enableColumnActions: false,
      //     enableColumnFilterModes: false,
      //     Cell: ({ cell }) => (
      //         <div className={btnDisableApiClick ? "disabled" : ""}>
      //             {cell.row.original.favorite === 'Yes' ? (
      //                 <GoStarFill
      //                     color={'var(--primary-color)'}
      //                     size={17}

      //                     onClick={(event) => {
      //                         if (!btnDisableApiClick) {
      //                             handleFavouriteClick(cell.row.original.id, "No");
      //                             event.stopPropagation();
      //                         }
      //                     }}
      //                 />
      //             ) : (
      //                 <GoStar
      //                     size={17}

      //                     onClick={(event) => {
      //                         if (!btnDisableApiClick) {
      //                             handleFavouriteClick(cell.row.original.id, "Yes");
      //                             event.stopPropagation();
      //                         }
      //                     }}
      //                 />
      //             )}
      //         </div>
      //     ),

      // },
      {
        accessorKey: "createdTime",
        header:
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Date"
            ) || {}
          ).mvalue || "nf Date",
        minSize: 40, //min size enforced during resizing
        maxSize: 40, //max size enforced during resizing
        size: 40,
        muiTableBodyCellProps: {
          align: "left",
        },

        enableColumnFilter: false,

        accessorFn: (row) =>
          `${formatTimestampToDate(Number(row.createdTime))}`,
        // Cell: ({ cell }) => <p>{formatTimestampToDate(Number(cell.row.original.createdTime))}</p>,
      },
      {
        accessorKey: "courseName",
        header:
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Tittle"
            ) || {}
          ).mvalue || "nf Title",
        minSize: 160, //min size enforced during resizing
        maxSize: 160, //max size enforced during resizing
        size: 160,
      },
      {
        accessorKey: "courseDescription",
        header:
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Description"
            ) || {}
          ).mvalue || "nf Description",
      },

      // Add more columns as needed
    ],
    [leftColW]
  );

  useEffect(() => {
    dispatch(
      fetchAgencySavedSearch({
        start: paginationStartCalcualtor(searchQuery.start, searchQuery.size),
        size: paginationSizeCalculator(searchQuery.start, searchQuery.size),
        sortOrder: searchQuery.sortOrder,
        sortField: searchQuery.sortField,
        filter: searchQuery.filter,
      })
    );
  }, [dispatch, searchQuery, refresh]);

  useEffect(() => {
    setData(myCoursesList);
    // setRowCount(JdList[jdStore.length - 1]?.totalCount);
  }, [myCoursesList]);

  // Function to handle pagination changes
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };
  useEffect(() => {
    console.log("pagination ", pagination);
    dispatch(
      setPaginationStore({
        start: pagination.pageIndex,
        size: pagination.pageSize,
      })
    );
  }, [pagination]);

  const handleColumnFiltersChange = (columnFilter) => {
    //  setPagination(newPagination);
    setColumnFilters(columnFilter);
  };

  useEffect(() => {
    console.log("columnFilter ", columnFilters);
    //filter=userId%3AUSERD-3367989*%7Cid%3AJDS-3368000
    let FilterString = "%7C";
    columnFilters.map((item) => {
      const temp = `${item.id}%3A${item.value}*%7C`;
      FilterString = FilterString + temp;
    });
    console.log(FilterString);
    dispatch(setFilterStore({ filter: FilterString }));
  }, [columnFilters]);

  const handleGlobalFiltersChange = (globalFilter) => {
    // setPagination(newPagination);
    setGlobalFilter(globalFilter);
  };
  useEffect(() => {
    console.log("globalFilter ", globalFilter);
    //dispatch(setPaginationStore({ start: pagination.pageIndex, size: pagination.pageSize }))
  }, [globalFilter]);

  const handleSortingChange = (sorting) => {
    setSorting(sorting);
  };
  useEffect(() => {
    console.log(sorting);
    const { id: sortField, desc: sortOrder } = sorting[0] || {};
    console.log(sortField, " ", sortOrder);
    if (sortField && (sortOrder || !sortOrder)) {
      dispatch(
        setSortingStore({ sortField, sortOrder: sortOrder ? "desc" : "asc" })
      );
    }
  }, [sorting]);

  const jdSelectOnClick = async (row, redirect = true) => {
    console.info(row);
    let id = row.original.id;
    let data = myCoursesList?.find((item) => item.id === id) || -1;
    if (data !== -1) {
      await dispatch(setSelectedCourse(id));
    }
    if (redirect) {
      setOnClick();
    }
  };

  const handleJdSelect = async (row) => {
    await jdSelectOnClick(row, false);
    navigate(
      `/skilling-agency/candidate-management?id=${row.original.id}&Type=Search`
    );
  };

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: metaData?.totalCount,
    initialState: { showColumnFilters: false, density: "compact" },
    manualFiltering: true, //turn off built-in client-side filtering
    manualPagination: true, //turn off built-in client-side pagination
    manualSorting: true, //turn off built-in client-side sorting
    enableStickyHeader: true,
    muiTableContainerProps: { sx: { maxHeight: "64vh", minHeight: "64vh" } },

    muiTableHeadCellProps: ({ column }) => ({
      //conditionally style pinned columns
      sx: {
        backgroundColor: "#f5f5f5",
      },
    }),

    muiTableBodyRowProps: ({ row }) => ({
      //conditionally style pinned columns
      sx: {
        fontWeight: row.original.id === selectedCourse?.id ? "1000" : "normal",
        backgroundColor:
          row.original.id === selectedCourse?.id ? "#F5F5F5" : "",
      },
      onClick: (event) => {
        jdSelectOnClick(row);
      },
    }),

    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: "Error loading data",
        }
      : undefined,
    onColumnFiltersChange: handleColumnFiltersChange,
    onGlobalFilterChange: handleGlobalFiltersChange,
    //dispatch(setFilter(globalFilter));
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    renderTopToolbarCustomActions: ({ table }) => (
      <Box>
        <Tooltip arrow title="Refresh Data">
          <IconButton
          // onClick={() => refetch()}
          >
            <RefreshIcon onClick={() => setRefresh(!refresh)} />
          </IconButton>
        </Tooltip>
        {/* <icons.MdAdd size={30} color="var(--primary-color)" onClick={handleShowForPlusBtn} /> */}
        {/* <icons.MdAdd size={30} color="var(--primary-color)" onClick={() => navigate('/skill-seeker/Opportunities/Create/Opportunity-Definition')} /> */}
      </Box>
    ),
    positionActionsColumn: "last",
    enableRowActions: true,
    renderRowActionMenuItems: ({ row }) => [
      <MenuItem key="edit" onClick={() => handleAccessDb(row)}>
        {contentLabel("DatabaseAccess", "nf Database Access")}
      </MenuItem>,
      <MenuItem
        onClick={() => {
          console.log(row.original);
          handleJdSelect(row);
        }}
      >
        {(
          content[selectedLanguage]?.find(
            (item) => item.elementLabel === "ManageCandidates"
          ) || {}
        ).mvalue || "nf ManageCandidates"}
      </MenuItem>,
      // <MenuItem key="delete" onClick={() => console.info('Delete')}>
      //     {contentLabel("Delete", "nf Delete")}
      // </MenuItem>,
    ],

    state: {
      columnFilters,
      globalFilter,
      isLoading: SavedSearch.myCoursesListLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      leftColW,
    },
  });

  return (
    <div>
      <GridComponent table={table} />
    </div>
  );
};

export default AgencySavedSearchGrid;
