import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MRT_ShowHideColumnsButton, MRT_ToggleDensePaddingButton, MRT_ToggleFiltersButton, useMaterialReactTable, MRT_GlobalFilterTextField } from 'material-react-table';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCourseApplication } from '../../../../reducer/skilling agency/course data/courseDataSlice';
import GridComponent from '../../../../components/SkillAvailer/JDRelatedComponents/GRIDS/GridComponent';
import OpportunitiesGridActions from '../../../../components/SkillAvailer/JDRelatedComponents/GRIDS/Grid Actions/OpportunitiesGridActions';
import OpporApplicationCols from '../../../../components/SkillAvailer/JDRelatedComponents/GRIDS/Grid Columns/OpporApplicationCols';
import { fetchCourseApplicationList } from '../../../../api/SkillingAgency/fetchCourseApplicationList';
import { fetchCourseResponseGridApi } from '../../../../api/SkillingAgency/fetchCourseResponseGridApi';

import { paginationSizeCalculator, paginationStartCalcualtor } from '../../../../components/helperFunctions/GridHelperFunction';
import images from './../../../../constants/images';
import { emptyJdApplicationDetails, resetSearchQuery, setFilterStore, setPaginationStore, setSortingStore } from '../../../../reducer/skilling agency/candidate management/courseApplicationSlice';
import { setSkillComparisonCandidateData } from '../../../../reducer/SkillSeeker/Comparison/SkillComparisonSlice';
import { Box, IconButton, Tooltip } from '@mui/material';
import { CSVLink } from 'react-csv';
import useContentLabel from '../../../../hooks/useContentLabel';
import { sessionDecrypt } from '../../../../config/encrypt/encryptData';
import { getCookie } from '../../../../config/cookieService';

const CourseShortlistGrid = ({ toolbarStatus = true, handleSwitchPane , SelectedOp }) => {
    //Data and fetching state
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
     const contentLabel = useContentLabel();
    const [rowCount, setRowCount] = useState(0);
    const isFirstRender = useRef(true);
    // const [expanded, setExpanded] = useState({});
    const [refresh, setRefresh] = useState(false);
    //table state
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([]);
    // const SelectedOp = useSelector(state => state.myCourses);
    const { metaData, courseAppList, courseApplicationLoading, searchQuery,currentStatus } = useSelector(state => state.courseApplication);
    const dispatch = useDispatch();
    const isInitialSelect = useRef(true); // Tracks whether it's the first selection
    const {questionFilter } = useSelector(state => state.selectedCourseApplicationSlice);
     const [csvHeaders, setCsvHeaders] = useState([]);

    const [rowSelection, setRowSelection] = useState({}); //ts type available
    const [rowSelectionForCsv, setRowSelectionForCsv] = useState([]);
    

    // useEffect(() => {
    //     setData(courseAppList?.filter(x=>x.status?.toLowerCase()==="shortlist"));
    // }, [courseAppList]);

    useEffect(() => {

        if (SelectedOp.selectedCourse.hasOwnProperty("id")) {

            dispatch(resetSearchQuery())
            // dispatch(fetchCourseApplicationList({
            //     courseId: SelectedOp.selectedCourse.id,
            //     start: 0,
            //     size: 20,
            //     sortOrder: "desc",
            //     sortField: "createdTime",
            // }));
        }     // Reset expanded state whenever the JD changes

    }, [SelectedOp.myCoursesApiTrigger, SelectedOp.selectedCourse]);

    // Consolidated API call when either JD or searchQuery changes
    useEffect(() => {
//whenever response api is called the questions of thje jd is acquired and stored in a array 
        let questionHeader = [];
        if (SelectedOp.selectedCourse?.Questions?.length > 0) {
            SelectedOp.selectedCourse.Questions.forEach((qn) => {
                let qnOb = {}
                // console.log("question", qn);
                if (qn.qnLabel && qn.id) {
                    qnOb["key"] = qn.id;
                    qnOb["label"] = qn.qnLabel;
                    questionHeader.push(qnOb);
                }
            });
            // console.log("questionHeader ", questionHeader);
        } else {
            // console.log("No questions found or invalid data.");
        }
        //default headers for csv
        let csvHeaderFinal = [
            { "key": "firstName", "label": "firstName" },
            { "key": "lastName", "label": "lastName" },
            { "key": "emailAddress", "label": "email address" },
            { "key": "jrPhone", "label": "Phone" },
            { "key": "mgender", "label": "Gender" },
            { "key": "numMatch", "label": "Skills Matched" },
            { "key": "status", "label": "Status" },
            { "key": "formattedCreatedTime", "label": `created Time ${getCookie("dateFormat") ? getCookie("dateFormat") : ""}` },]
        //default csv  headeers + question for
        let concatHeaders = csvHeaderFinal.concat(questionHeader);

        setCsvHeaders(concatHeaders);

        if (SelectedOp.selectedCourse.hasOwnProperty("id")) {
            // Ensure it's not the initial render
            if (isInitialSelect.current || searchQuery) {
                // dispatch(fetchCourseApplicationList({
                //     courseId: SelectedOp.selectedCourse.id,
                //     start: paginationStartCalcualtor(searchQuery.start, searchQuery.size),
                //     size: paginationSizeCalculator(searchQuery.start, searchQuery.size),
                //     sortOrder: searchQuery.sortOrder || "desc",
                //     sortField: searchQuery.sortField || "createdTime",
                //     filter: searchQuery.filter || '',

                // }));

                     let apiBody = {
                                                start: paginationStartCalcualtor(searchQuery.start, searchQuery.size),
                                                size: paginationSizeCalculator(searchQuery.start, searchQuery.size),
                                                sortOrder: searchQuery.sortOrder || "desc",
                                                sortField: searchQuery.sortField || "createdTime",
                                                payload: {
                                                    userCourseId: SelectedOp.selectedCourse.id,                                   
                                                    questionsFilter: ((questionFilter && questionFilter.length > 0) ? questionFilter : []) || []
                                                }
                                
                                            }                          
                                
                                 dispatch(fetchCourseResponseGridApi(apiBody));
                isInitialSelect.current = false; // Mark that initial selection has passed
            }
        }
    }, [searchQuery]);

    // Handle pagination change
    const handlePaginationChange = (newPagination) => {
        setPagination(newPagination);
    };

    useEffect(() => {
        dispatch(setPaginationStore({ start: pagination.pageIndex, size: pagination.pageSize }));
    }, [pagination]);

    // Handle column filters
    const handleColumnFiltersChange = (columnFilter) => {
        setColumnFilters(columnFilter);
    };

    useEffect(() => {
        let FilterString = '%7C';
        columnFilters.forEach(item => {
            FilterString += `${item.id}%3A${item.value}*%7C`;
        });
        dispatch(setFilterStore({ filter: FilterString }));
    }, [columnFilters]);

    // Handle global filter change
    const handleGlobalFiltersChange = (globalFilter) => {
        setGlobalFilter(globalFilter);
    };

    // Handle sorting change
    const handleSortingChange = (sorting) => {
        setSorting(sorting);
    };

    useEffect(() => {
        const { id: sortField, desc: sortOrder } = sorting[0] || {};
        if (sortField) {
            dispatch(setSortingStore({ sortField, sortOrder: sortOrder ? 'desc' : 'asc' }));
        }
    }, [sorting]);

    useEffect(() => {
        setRowSelectionForCsv((prevCsvList) => {
            const selectedIds = new Set(Object.keys(rowSelection)); // Get selected IDs
            const newSelections = courseAppList.filter((item) => selectedIds.has(item.id)); // Find current page selections

            // Merge previous selections with new ones, removing unselected items
            const updatedList = [
                ...prevCsvList.filter((item) => selectedIds.has(item.id)), // Keep previously selected
                ...newSelections.filter((item) => !prevCsvList.some((prevItem) => prevItem.id === item.id)), // Add new selections
            ];

            return updatedList;
        });
       

            const selectedIds = new Set(Object.keys(rowSelection)); // Get selected IDs
            const newSelections = courseAppList.filter((item) => selectedIds.has(item.id)); // Find current page selections
            dispatch(setSkillComparisonCandidateData(newSelections || []))

    }, [rowSelection]);

    useEffect(() => {
        // console.log("rowSelection ForCsv ", rowSelectionForCsv);

    }, [rowSelectionForCsv]);

  useEffect(() => {
       // setRowSelection({});
        if (currentStatus !== "*") {
            table.setColumnVisibility({ status: false }); //programmatically hide status column if its not equal to application
        } else {
            table.setColumnVisibility({ status: true }); //pelse show the status column
        }
    }, [currentStatus]);

    const table = useMaterialReactTable({
        manualPagination: true,
        muiTableContainerProps: { sx: { height: "56vh", maxHeight: "56vh" } },
        muiTableHeadCellProps: ({ column }) => ({
            sx: {
                backgroundColor: '#f5f5f5',
            },
        }),
        columns: OpporApplicationCols(SelectedOp),
        data:courseAppList?.filter(x=>x.status?.toLowerCase()==="shortlist"),
        enableStickyHeader: true,
        getRowId: row => row?.id,
        initialState: { showColumnFilters: false, density: 'compact' },
        enableTopToolbar: true,
        onColumnFiltersChange: handleColumnFiltersChange,
        onGlobalFilterChange: handleGlobalFiltersChange,
        onPaginationChange: handlePaginationChange,
        onSortingChange: handleSortingChange,
        positionActionsColumn: 'last',
        enableRowActions: true,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        renderTopToolbarCustomActions: ({ table }) => (
            <div className="d-flex w-100 justify-content-center h-100 "

                style={{ paddingTop: "9px" }}>


            </div>

        ),
        positionGlobalFilter: 'right', //move the search box to the left of the top toolbar
        positionToolbarAlertBanner: 'bottom',  //row selection message table head, top toolbar, or bottom toolbar
      
        renderRowActionMenuItems: ({ row }) => [
            <OpportunitiesGridActions row={row} setRefresh={setRefresh} allowShortlist={true} allowReject={true} allowScreening={true} allowSelect={true} />,

        ],
        muiTableBodyRowProps: ({ row }) => ({
            sx: {
                fontWeight: row?.original.id === SelectedOp.selectedApplication?.id ? '1000' : 'normal',
                backgroundColor: row?.original.id === SelectedOp.selectedApplication?.id ? "#F5F5F5" : "",
            },
            onClick: (event) => {
                let selectedId = row?.original.id;
                if (SelectedOp.selectedApplication?.id !== selectedId) {
                dispatch(setSelectedCourseApplication(row?.original));
                handleSwitchPane();
                }

            },
        }),
         renderTopToolbar: ({ table }) => (
                    <Box className=""
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '16px',
                            justifyContent: 'space-between',
                            padding: '12px 10px',
        
                        }}
                    >
        
                        <Box className="d-flex  move-right-end" sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
                            {rowSelection && Object.keys(rowSelection).length > 0 &&
                                <Tooltip title={contentLabel('ExportToCsv', 'nf Export to CSV')}>
        
        
                                    <Box className="move-right-end "
                                    >
        
                                        <CSVLink
                                            filename={"Generated List.csv"}
                                            data={rowSelectionForCsv} headers={csvHeaders}>
                                            <img
                                                src={images.csvExport} alt={"csvExport"} style={{ height: 19, width: 22 }} />
                                        </CSVLink>
                                    </Box>
                                </Tooltip>
                            }
                            <MRT_GlobalFilterTextField table={table} />
                            <MRT_ToggleFiltersButton table={table} />
                            <MRT_ShowHideColumnsButton table={table} />
                            <MRT_ToggleDensePaddingButton table={table} />
                        </Box>
                    </Box>
                ),
        muiPaginationProps: {
            rowsPerPageOptions: [10, 15, 20],
            showFirstButton: false,
            showLastButton: false,
        },
        rowCount : courseAppList.length,
        state: {
            columnFilters,
            globalFilter,
            isLoading: courseApplicationLoading,
            pagination,
            sorting,
            rowSelection
        },
    });

    return (

        <GridComponent table={table} />
    );
};

export default React.memo(CourseShortlistGrid);
