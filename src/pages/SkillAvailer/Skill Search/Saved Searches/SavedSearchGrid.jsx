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
import { GetJdSkillAndQnWithId } from "../../../../api/SkillSeeker/job detail/GetJdSkillAndQnWithId";
import { FetchSavedSearches } from "../../../../api/SkillSeeker/FetchSavedSearches";
import icons from "./../../../../constants/icons";
import useContentLabel from "../../../../hooks/useContentLabel";
import JDListGridOptions from "../../../../components/SkillAvailer/JDRelatedComponents/JDListGridOptions";
import {
  handleFavorite,
  paginationSizeCalculator,
  paginationStartCalcualtor,
  setStatus,
} from "../../../../components/helperFunctions/GridHelperFunction";
import { formatTimestampToDate } from "../../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import {
  setFilterStore,
  setPaginationStore,
  setSelectedJd,
  setSortingStore,
} from "../../../../reducer/SkillSeeker/SkillBasedSearch/SavedSearchSlice";
import { setMyReqSkills } from "../../../../reducer/SkillSeeker/SkillBasedSearch/MyRequirementSkillSlice";
import {
  setMyRefinedLocations,
  setMyRefinedSkills,
} from "../../../../reducer/SkillSeeker/SkillBasedSearch/RefMyRequirementsSkillSlice";
import {
  convertDaysToPhase,
  convertToLabelValueArray,
} from "../../../../components/SkillAvailer/helperFunction/conversion";
import { emptySkillSearchResult } from "../../../../reducer/SkillSeeker/SkillBasedSearch/SkillBasedResultSlice";
import { unwrapResult } from "@reduxjs/toolkit";
import { sessionEncrypt } from "../../../../config/encrypt/encryptData";
import GridComponent from "../../../../components/SkillAvailer/JDRelatedComponents/GRIDS/GridComponent";

const SavedSearchGrid = ({ leftColW, setOnClick, handleShowForPlusBtn }) => {
  /* CONTENT LABEL */
  const contentLabel = useContentLabel();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const dispatch = useDispatch();
  const SavedSearch = useSelector((state) => state.SavedSearchSlice);
  const { searchQuery, metaData, dataList, SelectedJd } = SavedSearch;
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

  // console.log("Extracted Data:", data); // Log extracted data

  const handleFavouriteClick = async (id, changeTo) => {
    setBtnDisableApiClick(true);
    try {
      await handleFavorite(id, "JDS", changeTo);
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
    // const updatedLocationFilterRef = MyRequirement?.MyRequirement?.map(location => ({
    //     value: location.value,
    //     label: location.value,
    //     show: true,
    //     // Add other properties as needed
    // }));

    // dispatch(setMyRefinedLocations(updatedLocationFilterRef || []));
    dispatch(setMyRefinedSkills(updatedSkillFilterRef));

    // sessionStorage.setItem("SelectedJdInnitialRequirment", JSON.stringify({
    //     skillsInRefined: updatedSkillFilterRef,
    //     locationsInRefined: updatedLocationFilterRef || [],

    // }))
  };

  const handleAccessDb = async (row) => {
    // console.log("row", row);

    // Step 1: Call jdSelectOnClick
    const result = await jdSelectOnClick(row, false);

    // Step 2: Check if the result was successful
    if (result) {
      try {
        // Step 3: Await the completion of the API call (SelectedJd populated)
        const actionResult = await dispatch(
          GetJdSkillAndQnWithId(row.original.id)
        );
        const jdSkillData = unwrapResult(actionResult); // Unwrap the result

        dispatch(
          setMyRefinedLocations(
            row.original.jobLocation
              ? convertToLabelValueArray(row.original.jobLocation)
              : []
          )
        );

        // Step 4: Once the data is populated, call setMyReqSkills
        if (jdSkillData?.jdSkillsList?.length) {
          dispatch(
            setMyReqSkills(
              jdSkillData.jdSkillsList.map((data) => ({
                ...data,
                experienceReq: data.yoeMin !== "0" && data.yoeMax !== "0",
                minExp: convertDaysToPhase(data.yoeMin, data.yoePhase),
                maxExp: convertDaysToPhase(data.yoeMax, data.yoePhase),
                range: data.yoePhase,
                required: false,
                validated: false,
                TopSkill: false,
                edit: false,
                show: true,
                label: data.skillOccupation,
                value: data.skillOccupation,
                skillOccupation: data.skillOccupation,
              }))
            )
          );

          setDispatchComplete(true); // Mark the operation as complete
        }
      } catch (error) {
        console.error("Failed to fetch JD skills: ", error);
      }
    }
  };

  useEffect(() => {
    if (dispatchComplete) {
      updateSkillFilter();
      setDispatchComplete(false); // Reset the state to avoid repeated calls
      dispatch(emptySkillSearchResult());
      // console.log("SelectedJd ", SelectedJd);
      navigate(
        `/skill-seeker/Skill-Search/Database-Access?Title=${
          SelectedJd?.title
        }&Id=${SelectedJd?.id}&Saved=${true}`
      );
    }
  }, [dispatchComplete]);
  useEffect(() => {
    // console.log("myReq ", MyRequirement?.skillsInMyReq);
  }, [MyRequirement?.skillsInMyReq]);

  const columns = useMemo(
    () => [
      {
        enableColumnFilter: false,

        accessorKey: "favorite",
        header: "fav",
        minSize: 20, //allow columns to get smaller than default //min size enforced during resizing
        maxSize: 20, //max size enforced during resizing
        size: 20,
        Header: ({ column }) => (
          <GoStar size={17} /> //re-use the header we already defined
        ), //arrow function
        enableGlobalFilter: false,
        enableColumnActions: false,
        enableColumnFilterModes: false,
        Cell: ({ cell }) => (
          <div className={btnDisableApiClick ? "disabled" : ""}>
            {cell.row.original.favorite === "Yes" ? (
              <GoStarFill
                color={"var(--primary-color)"}
                size={17}
                onClick={(event) => {
                  if (!btnDisableApiClick) {
                    handleFavouriteClick(cell.row.original.id, "No");
                    event.stopPropagation();
                  }
                }}
              />
            ) : (
              <GoStar
                size={17}
                onClick={(event) => {
                  if (!btnDisableApiClick) {
                    handleFavouriteClick(cell.row.original.id, "Yes");
                    event.stopPropagation();
                  }
                }}
              />
            )}
          </div>
        ),
      },
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
        accessorKey: "title",
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
        accessorKey: "jobLocation",
        header:
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Location"
            ) || {}
          ).mvalue || "nf Location",
        minSize: 100, //min size enforced during resizing
        maxSize: 100, //max size enforced during resizing
        size: 100,
      },
      {
        accessorKey: "description",
        header:
          (
            content[selectedLanguage]?.find(
              (item) => item.elementLabel === "Description"
            ) || {}
          ).mvalue || "nf description",
      },

      // Add more columns as needed
    ],
    [leftColW]
  );

  useEffect(() => {
    dispatch(
      FetchSavedSearches({
        start: paginationStartCalcualtor(searchQuery.start, searchQuery.size),
        size: paginationSizeCalculator(searchQuery.start, searchQuery.size),
        sortOrder: searchQuery.sortOrder,
        sortField: searchQuery.sortField,
        filter: searchQuery.filter,
      })
    );
  }, [dispatch, searchQuery, refresh]);

  useEffect(() => {
    setData(dataList);
    // setRowCount(JdList[jdStore.length - 1]?.totalCount);
  }, [dataList]);

  // Function to handle pagination changes
  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
  };
  useEffect(() => {
    // console.log("pagination ", pagination);
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
    // console.log("columnFilter ", columnFilters);
    //filter=userId%3AUSERD-3367989*%7Cid%3AJDS-3368000
    let FilterString = "%7C";
    columnFilters.map((item) => {
      const temp = `${item.id}%3A${item.value}*%7C`;
      FilterString = FilterString + temp;
    });
    // console.log(FilterString);
    dispatch(setFilterStore({ filter: FilterString }));
  }, [columnFilters]);

  const handleGlobalFiltersChange = (globalFilter) => {
    // setPagination(newPagination);
    setGlobalFilter(globalFilter);
  };
  useEffect(() => {
    // console.log("globalFilter ", globalFilter);
    //dispatch(setPaginationStore({ start: pagination.pageIndex, size: pagination.pageSize }))
  }, [globalFilter]);

  const handleSortingChange = (sorting) => {
    setSorting(sorting);
  };
  useEffect(() => {
    // console.log(sorting);
    const { id: sortField, desc: sortOrder } = sorting[0] || {};
    // console.log(sortField, " ", sortOrder);
    if (sortField && (sortOrder || !sortOrder)) {
      dispatch(
        setSortingStore({ sortField, sortOrder: sortOrder ? "desc" : "asc" })
      );
    }
  }, [sorting]);

  const jdSelectOnClick = async (row, redirect = true) => {
    console.info(row);
    let id = row.original.id;
    let data = dataList?.find((item) => item.id === id) || -1;
    // console.log(" Jd to check ", data);
    let check = true;
    if (data !== -1) {
      if (!data.hasOwnProperty("JdSkills")) {
        //this calls api and also sets  current jd to SelectedJd
        const data = await dispatch(GetJdSkillAndQnWithId(id));

        // console.log("GetJdSkillAndQnWithId ", data);
      } else {
        //this sets current jd to SelectedJd
        await dispatch(setSelectedJd(row.original));
      }
    }
    if (redirect) {
      setOnClick();
    }

    return true;
  };

  const handleJdSelect = async (row) => {
    // await jdSelectOnClick(row, false);  //no need of this (setting selectedJd according to query params)
    navigate(
      `/skill-seeker/Skill-Search/Saved-Searches/Candidate-management?Title=${row?.original?.title}&Id=${row?.original?.id}&Type=Search`
      // `/skill-seeker/Skill-Search/Saved-Searches/Candidate-management?Title=${row?.original?.title}&Id=${sessionEncrypt(row?.original?.id)}&Type=Search`      //enable this for encrytion
    );
  };

  const table = useMaterialReactTable({
    columns,
    data,
    rowCount: metaData.totalCount,
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
        fontWeight: row.original.id === SelectedJd?.id ? "1000" : "normal",
        backgroundColor: row.original.id === SelectedJd?.id ? "#F5F5F5" : "",
      },
      onClick: (event) => {
        //Title=${SelectedJd?.title}&Id=${SelectedJd?.id}
        // queryParams.set("Title", row.original.title);
        // queryParams.set("Id", row.original.id);
        navigate(
          `/skill-seeker/Skill-Search/Saved-Searches?Title=${
            row.original.title
          }&Id=${row.original.id}&Saved=${true}`
        );
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
      </Box>
    ),
    positionActionsColumn: "last",
    enableRowActions: true, // Use state to control row actions
    renderRowActionMenuItems: ({ row }) => [
      <MenuItem key="DatabaseAccess" onClick={() => handleAccessDb(row)}>
        {contentLabel("DatabaseAccess", "nf Database Access")}
      </MenuItem>,
      <MenuItem
        onClick={() => {
          // console.log(row.original);
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
      //     Delete
      // </MenuItem>,
      //  {/* manage candidates */}
    ],

    state: {
      columnFilters,
      globalFilter,
      isLoading: SavedSearch.dataListLoading,
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

export default SavedSearchGrid;
