import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useDispatch } from "react-redux";
import {
  setFilterStore,
  setPaginationStore,
  setSelectedJd,
  setSortingStore,
} from "../../../reducer/SkillSeeker/JdData/JdDataSlice";
import { useSelector } from "react-redux";
import { FetchJdList } from "../../../api/SkillSeeker/FetchJdList";
import { GetJdSkillAndQnWithId } from "../../../api/SkillSeeker/job detail/GetJdSkillAndQnWithId";
import {
  handleFavorite,
  paginationSizeCalculator,
  paginationStartCalcualtor,
  setStatus,
} from "../../../components/helperFunctions/GridHelperFunction";
import { GoStar, GoStarFill } from "react-icons/go";
import JDListGridOptions from "../../../components/SkillAvailer/JDRelatedComponents/JDListGridOptions";
import { formatTimestampToDate } from "../../../components/SkillOwner/HelperFunction/FormatTimestampToDate";
import useContentLabel from "../../../hooks/useContentLabel";
import icons from "./../../../constants/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { emptyOpCreate } from "../../../reducer/SkillSeeker/JdData/OpportunityCreationSlice";
import "../Css/JdColumnStyles.css";
import GridComponent from "../../../components/SkillAvailer/JDRelatedComponents/GRIDS/GridComponent";
const JdListGrid = ({ leftColW, setOnClick, handleShowForPlusBtn }) => {
  /* CONTENT LABEL */
  const [showDropdown, setShowDropdown] = useState(false);
  const contentLabel = useContentLabel();
  const navigate = useNavigate();
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);
  const dispatch = useDispatch();
  const jdStore = useSelector((state) => state.JdDataSlice);
  const { searchQuery, metaData, JdList, SelectedJd } = jdStore;
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
  // console.log("Extracted Data:", data); // Log extracted data

  const location = useLocation();
  // console.log("Location console", location)
  const getQueryParams = useCallback(() => {
    const jdOppParams = new URLSearchParams(location.search);
    return {
      redirect: jdOppParams.get("redirect"),
      // id: jdOppParams.get('id'),
    };
  }, [location.search]);

  useEffect(() => {
    const { redirect, id } = getQueryParams();

    if (redirect && JdList?.length) {
      // dispatch(GetJdSkillAndQnWithId(id));
      // dispatch(setSelectedJd(id));
      setOnClick();
    }
  }, [getQueryParams, JdList?.length]);

  const handleFavouriteClick = async (id, changeTo) => {
    setBtnDisableApiClick(true);
    setIsRefetching(true);
    try {
      await handleFavorite(id, "JDS", changeTo);
      setRefresh((prev) => !prev);
    } catch (error) {
      // Handle the error here
    } finally {
      setBtnDisableApiClick(false);
      setIsRefetching(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        enableColumnFilter: false,
        accessorKey: "favorite",
        header: "fav",
        minSize: 10,
        maxSize: 10,
        size: 10,
        Header: () => <GoStar size={17} />,
        enableGlobalFilter: false,
        enableColumnActions: false,
        enableColumnFilterModes: false,
        Cell: ({ cell }) => (
          <Tooltip title="Mark as Favorite" arrow>
            <div
              className={
                btnDisableApiClick
                  ? "disabled-jd-column cell-size-20-jd-column"
                  : "cell-size-20-jd-column"
              }
            >
              {cell.row.original.favorite === "Yes" ? (
                <GoStarFill
                  className="clickable-icon-jd-column"
                  onClick={(event) => {
                    if (!btnDisableApiClick) {
                      handleFavouriteClick(cell.row.original.id, "No");
                      event.stopPropagation();
                    }
                  }}
                />
              ) : (
                <GoStar
                  className="clickable-icon-jd-column"
                  onClick={(event) => {
                    if (!btnDisableApiClick) {
                      handleFavouriteClick(cell.row.original.id, "Yes");
                      event.stopPropagation();
                    }
                  }}
                />
              )}
            </div>
          </Tooltip>
        ),
      },
      {
        accessorKey: "createdTime",
        header: "Date",
        minSize: 80,
        maxSize: 80,
        size: 80,
        muiTableBodyCellProps: { align: "left" },
        enableColumnFilter: false,
        accessorFn: (row) => formatTimestampToDate(Number(row.createdTime)),
        Cell: ({ cell }) => (
          <Tooltip
            title={formatTimestampToDate(Number(cell.row.original.createdTime))}
            arrow
          >
            <span className="  cell-size-80-jd-column fixed-cell-jd-column">
              {formatTimestampToDate(Number(cell.row.original.createdTime))}
            </span>
          </Tooltip>
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        minSize: 140,
        maxSize: 140,
        size: 140,
        Cell: ({ cell }) => (
          <Tooltip title={cell.getValue()} arrow>
            <span className="  cell-size-200-jd-column fixed-cell-jd-column">
              {cell.getValue()}
            </span>
          </Tooltip>
        ),
      },
      {
        accessorKey: "jdsType",
        header: "Type",
        minSize: 80,
        maxSize: 80,
        size: 80,
        Cell: ({ cell }) => (
          <Tooltip title={cell.getValue()} arrow>
            <span className="    cell-size-80-jd-column fixed-cell-jd-column">
              {cell.getValue()}
            </span>
          </Tooltip>
        ),
      },
      {
        accessorKey: "jdCompany",
        header: "Company",
        minSize: 160,
        maxSize: 160,
        size: 160,
        Cell: ({ cell }) => (
          <Tooltip title={cell.getValue()} arrow>
            <span className="   cell-size-160-jd-column fixed-cell-jd-column">
              {cell.getValue()}
            </span>
          </Tooltip>
        ),
      },
      {
        id: "mstatus",
        header: "Status",
        minSize: 20,
        maxSize: 20,
        size: 20,
        enableColumnFilter: false,
        accessorFn: (row) => {
          const mstatus = row.mstatus;
          const label =
            content[selectedLanguage]?.find(
              (item) =>
                item.elementLabel ===
                ((mstatus === "PUBLISH" && "Published") ||
                  (mstatus === "DRAFT" && "Draft") ||
                  (mstatus === "CANCEL" && "Cancel") ||
                  (mstatus === "CLOSED" && "Closed"))
            )?.mvalue ||
            (mstatus === "PUBLISH" && "nf Published") ||
            (mstatus === "DRAFT" && "nf Draft") ||
            (mstatus === "CANCEL" && "nf Cancel") ||
            (mstatus === "CLOSED" && "nf Closed");

          return (
            <Tooltip title={label} arrow>
              <div className="cell-size-120-jd-column status-container-jd-column">
                <icons.FaCircle
                  className="status-icon-jd-column"
                  style={{
                    color:
                      (mstatus === "PUBLISH" && "#00BA49") ||
                      (mstatus === "CLOSED" && "var(--primary-color)") ||
                      (mstatus === "DRAFT" && "gray"),
                  }}
                />
                <span className="   fixed-cell-jd-column">{label}</span>
              </div>
            </Tooltip>
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
          <Tooltip
            title={`${row.original.newResponses || 0} (${
              row.original.totalResponses || 0
            })`}
            arrow
          >
            <span className="  cell-size-80-jd-column fixed-cell-jd-column">
              {row.original.newResponses || 0} (
              {row.original.totalResponses || 0})
            </span>
          </Tooltip>
        ),
      },
    ],
    [leftColW]
  );

  useEffect(() => {
    dispatch(
      FetchJdList({
        start: paginationStartCalcualtor(searchQuery.start, searchQuery.size),
        size: paginationSizeCalculator(searchQuery.start, searchQuery.size),
        sortOrder: searchQuery.sortOrder,
        sortField: searchQuery.sortField,
        filter: searchQuery.filter,
      })
    );
  }, [dispatch, searchQuery, refresh]);

  useEffect(() => {
    setData(JdList);
    // setRowCount(JdList[jdStore.length - 1]?.totalCount);
  }, [JdList]);

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
    // console.info(row);
    let id = row.original.id;
    let data = JdList?.find((item) => item.id === id) || -1;
    // console.log(" Jd to check ", data);
    let result = "";
    let check = true;
    if (data !== -1) {
      if (
        !data.hasOwnProperty("JdSkills") ||
        !data.hasOwnProperty("Questions")
      ) {
        result = await dispatch(GetJdSkillAndQnWithId(id));
        // console.log("first time", result);
      } else {
        await dispatch(setSelectedJd(id));
      }
    }
    if (redirect) {
      setOnClick();
    }

    //return
    if (!data.hasOwnProperty("JdSkills") || !data.hasOwnProperty("Questions")) {
      return {
        jdSkills:
          result?.payload &&
          result.payload?.jdSkillsList &&
          result.payload.hasOwnProperty("jdSkillsList")
            ? result.payload.jdSkillsList
            : [],
        Questions:
          result?.payload &&
          result.payload?.jdQuestionsList &&
          result.payload.hasOwnProperty("jdQuestionsList")
            ? result.payload.jdQuestionsList
            : [],
      };
    } else {
      return {
        jdSkills: data && data?.JdSkills ? data.JdSkills : [],
        Questions: data && data?.Questions ? data.Questions : [],
      };
    }
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

    // ✅ This makes all switches in MRT green
    muiSwitchProps: {
      color: "default", // prevent MUI's theme primary from overriding
      sx: {
        "& .MuiSwitch-switchBase.Mui-checked": {
          color: "var(--primary-color)", // thumb color
        },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
          backgroundColor: "var(--primary-color) !important", // track color
        },
      },
    },

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
      <Box className="d-flex">
        <Tooltip arrow title="Refresh Data">
          <IconButton
          // onClick={() => refetch()}
          >
            <RefreshIcon
              style={{ color: "var(--primary-color)" }}
              onClick={() => {
                setIsRefetching(true);
                setRefresh(!refresh);
                setIsRefetching(false);
              }}
            />
          </IconButton>
        </Tooltip>
        {/* <icons.MdAdd size={30} color="var(--primary-color)" onClick={handleShowForPlusBtn} /> */}
        <Dropdown
          align="end"
          className="drp-user"
          drop="right"
          show={showDropdown}
          onToggle={() => setShowDropdown(!showDropdown)}
          style={{ zIndex: "10" }}
        >
          <Dropdown.Toggle
            variant="link"
            to="#"
            id="dropdown-basic"
            style={{ color: "gray" }}
          >
            <icons.MdAdd size={30} color="var(--primary-color)" />
          </Dropdown.Toggle>
          <Dropdown.Menu align="start" className="action-dropdown shadow p-0">
            <div className="d-flex flex-column justify-content-around p-0">
              <button
                type="button"
                class="btn btn-light text-start"
                onClick={() => {
                  navigate("/skill-seeker/Opportunities/Opportunity-Parser");
                }}
              >
                {contentLabel("OpportunityParser", "nf Opportunity Parser")}
              </button>
              <button
                type="button"
                class="btn btn-light text-start"
                onClick={() => {
                  dispatch(emptyOpCreate());
                  navigate(
                    "/skill-seeker/Opportunities/Create/Opportunity-Definition"
                  );
                }}
              >
                {contentLabel("Manual", "nf Manual")}
              </button>
            </div>
          </Dropdown.Menu>
        </Dropdown>
      </Box>
    ),
    positionActionsColumn: "last",
    enableRowActions: true,
    renderRowActionMenuItems: ({ row }) => [
      <JDListGridOptions
        row={row}
        refresh={refresh}
        setRefresh={setRefresh}
        jdSelectOnClick={jdSelectOnClick}
      />,
    ],

    state: {
      columnFilters,
      globalFilter,
      isLoading: jdStore.jdListLoading,
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

export default JdListGrid;
