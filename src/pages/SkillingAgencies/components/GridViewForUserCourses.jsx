import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch } from "react-redux";
import { Box, IconButton, Tooltip } from "@mui/material";
import { fetchUserCourses } from "../../../api/SkillingAgency/fetchUserCourses";
import { GoStar, GoStarFill } from "react-icons/go";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import CourseActions from "./CourseActions";
import {
  handleCourseFavorite,
  handleFavorite,
  paginationSizeCalculator,
  paginationStartCalcualtor,
} from "../../../components/helperFunctions/GridHelperFunction";
import {
  setSortingStore,
  setFilterStore,
  setPaginationStore,
} from "../../../reducer/skilling agency/course data/courseDataSlice";
import useContentLabel from "../../../hooks/useContentLabel";
import { icons } from "../../../constants";
import { setSelectedCourse } from "../../../reducer/skilling agency/course data/courseDataSlice";
import { emptyCourseCreate } from "../../../reducer/SkillingAgency/CreateCourse/CourseCreationSlice";
import GridComponent from "../../../components/SkillAvailer/JDRelatedComponents/GRIDS/GridComponent";

// import DetailPanel from './DetailPanel';

const GridViewForUserCourses = ({
  leftColW,
  setOnClick,
  handleShowForPlusBtn,
}) => {
  const {
    myCoursesList: data,
    status,
    error,
    searchQuery,
    metaData,
  } = useSelector((state) => state.myCourses);
  console.log(metaData);
  console.log(searchQuery);

  const navigate = useNavigate();
  const contentLabel = useContentLabel();
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const dispatch = useDispatch();
  const jdStore = useSelector((state) => state.JdDataSlice);
  const { selectedCourse } = useSelector((state) => state.myCourses);

  //manage our own state for stuff we want to pass to the API
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isError, setIsError] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [btnDisableApiClick, setBtnDisableApiClick] = useState(false);

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

  function sliceUntilPipe(str) {
    if (typeof str !== "string") {
      return "";
    }
    const index = str.indexOf("|");
    if (index !== -1) {
      return str.slice(0, index);
    }
    return str; // return the original string if '|' is not found
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: "favorite",
        header: contentLabel("Fav", "nf Fav"),
        minSize: 20, //allow columns to get smaller than default //min size enforced during resizing
        maxSize: 20, //max size enforced during resizing
        size: 20,

        enableGlobalFilter: false,
        enableColumnActions: false,
        Cell: ({ cell }) => (
          <div>
            {cell.row.original.courseFavorite === "Yes" ? (
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
        accessorKey: "courseName", //access nested data with dot notation
        header: contentLabel("CourseName", "nf Course Name"),
        size: 100,
      },

      // {
      //   accessorKey: "courseStartingDate",
      //   header: contentLabel("StartDate", "nf Start Date"),
      //   Cell: ({ row }) => (
      //     <div>
      //       {formatTimestampToDate(Number(row?.original?.courseStartingDate))}
      //     </div>
      //   ),
      //   size: 150,
      // },
      // {
      //   accessorKey: "duration",
      //   header: contentLabel("Duration", "nf Duration"),
      //   Cell: ({ row }) => (
      //     <div>
      //       {row.original.durationNumber} {row.original.durationPhase}
      //     </div>
      //   ),
      //   size: 150,
      // },

      {
        id: "courseStatus",
        header: contentLabel("Status", "nf Status"),
        minSize: 20,
        maxSize: 20,
        size: 20,
        muiTableHeadCellProps: {
          align: "start",
        },
        muiTableBodyCellProps: {
          align: "start",
        },
        Cell: ({ cell }) => {
          const { courseStatus } = cell.row.original;
          const label =
            content[selectedLanguage]?.find(
              (item) =>
                item.elementLabel ===
                ((courseStatus === "PUBLISH" && "Publish") ||
                  (courseStatus === "DRAFT" && "Draft") ||
                  (courseStatus === "CLOSED" && "Closed"))
            )?.mvalue ||
            (courseStatus === "PUBLISH" && "nf Publish") ||
            (courseStatus === "DRAFT" && "nf Draft") ||
            (courseStatus === "CLOSED" && "nf Closed");

          return (
            <div
              className="text-start"
              onClick={(event) => {
                // handleFavorite(cell.row.original, cell.row.original.id, "JDS", "No");
                event.stopPropagation();
              }}
            >
              <icons.FaCircle
                size={10}
                style={{
                  color:
                    (courseStatus === "PUBLISH" && "#00BA49") ||
                    (courseStatus === "CLOSED" && "var(--primary-color)") ||
                    (courseStatus === "DRAFT" && "gray"),
                }}
              />{" "}
              {label}
            </div>
          );
        },
      },

            {
              accessorKey: "newResponses",
              id: "newResponses",
              header: "New (Total)",
              minSize: 80,
              maxSize: 80,
              size: 80,
              Cell: ({ row }) => (
                <Tooltip title={`${row.original.newResponses || 0} (${row.original.totalResponses || 0})`} arrow>
                  <span className="  cell-size-80-jd-column fixed-cell-jd-column">
                    {row.original.newResponses || 0} ({row.original.totalResponses || 0})
                  </span>
                </Tooltip>
              ),
            },
    ],
    [selectedLanguage]
  );

  useEffect(() => {
    dispatch(
      fetchUserCourses({
        start: paginationStartCalcualtor(searchQuery.start, searchQuery.size),
        size: paginationSizeCalculator(searchQuery.start, searchQuery.size),
        sortOrder: searchQuery.sortOrder,
        sortField: "",
        filter: searchQuery.filter,
      })
    );
  }, [dispatch, searchQuery, refresh]);

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
        // console.info(row);
        // let id = row.original.id;
        // let data = JdList?.find(item => item.id === id) || -1;
        // console.log(" Jd to check ", data);
        // let check = true;
        // if (data !== -1) {
        //     if (!data.hasOwnProperty("JdSkills") || !data.hasOwnProperty("Questions")) {
        //         dispatch(GetJdSkillAndQnWithId(id));

        //     } else {
        //         dispatch(setSelectedJd(id));
        //     }
        // }
        dispatch(setSelectedCourse(row?.original));
        console.log(row?.original);

        setOnClick();
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
          <IconButton>
            <RefreshIcon    style={{ color: "var(--primary-color)" }} onClick={() => setRefresh(!refresh)} />
          </IconButton>
        </Tooltip>
        <icons.MdAdd
          size={30}
          color="var(--primary-color)"
          onClick={() =>{
           dispatch(emptyCourseCreate());
           navigate('/skilling-agency/my-courses/Create/Course-Details')
           //navigate("create")
          }
           }
        />
      </Box>
    ),
    positionActionsColumn: "last",
    enableRowActions: true,
    renderRowActionMenuItems: ({ row }) => [
      <CourseActions row={row} setRefresh={setRefresh} />,
    ],

    state: {
      columnFilters,
      globalFilter,
      isLoading: status === "loading",
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

export default GridViewForUserCourses;
