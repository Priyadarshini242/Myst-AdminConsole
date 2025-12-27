import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SecondaryToggleBtn from '../../components/Buttons/SecondaryToggleBtn';
import { LiaFileExportSolid } from 'react-icons/lia';
import Loader from '../../components/Loader';
import UserCardA from '../../components/SkillAvailer/UserCardA';
import { Pagination, TablePagination } from '@mui/material';
import { setView } from '../../reducer/SkillSeeker/SkillBasedSearch/SkillBasedResultSlice';
import SearchResultGrid from './SearchResultGrid';


const ResultMIddlePanel = ({ Result, contentHeight }) => {

    const dispatch = useDispatch();

    const selectedLanguage = useSelector(state => state.language);
    const content = useSelector(state => state.content);


    //refine my req
    const { skillsInRefined } = useSelector(state => state.RefMyRequirements);
    //Regional country Data
    const regionalData = useSelector(state => state.regionalData);



    return (
        <div className='px-2 py-2' style={{ height: "85vh" }}>
            {Result.status !== 'idle' &&
                <div className=" d-md-flex flex-column " >

                    <div className="d-md-flex align-items-center justify-content-between   "  >
                        <div className='d-md-flex align-items-center  ' style={{ width: "10%" }}>

                            {/* result for */}
                            <div className=' d-flex justify-content-center  align-items-center' style={{ width: "100%", backgroundColor: (content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#000", color: (content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarFontColor') || {}).mvalue || "#fff", height: "30px", borderRadius: "10px", }}>

                                <div className='font-6' style={{ display: "flex" }}>
                                    {Result.noOfResult + " results for"}
                                </div>
                            </div>


                        </div>
                        <div className=' ' style={{ width: "70%" }}>
                            <div className='mx-1   d-md-flex  flex-wrap' >
                                {skillsInRefined?.map((skill, index) =>
                                    skill.show &&
                                    <span className='mx-1 mt-1 badge ms-1 border-1 '
                                        style={{
                                            borderStyle: "solid", borderWidth: "1px", borderColor: "#815F0B",
                                            backgroundColor: "#E7E7E7", color: "#815F0B", padding: "3px 6px",
                                            borderRadius: "7px", alignContent: "center", alignItems: "center", fontSize: "11px",
                                        }}
                                        id={index}>{skill.label}

                                    </span>
                                )
                                }
                            </div>
                        </div>
                        <div className='d-flex align-items-center '>
                            <div className='d-flex'>
                                <SecondaryToggleBtn label={Result.view === "card" ? (content[selectedLanguage]?.find(item => item.elementLabel === 'CardView') || {}).mvalue || "nf Card View" : (content[selectedLanguage]?.find(item => item.elementLabel === 'Card') || {}).mvalue || "nf Card"} onClick={() => dispatch(setView("card"))} isActive={Result.view === "card"} />
                                <SecondaryToggleBtn label={Result.view === "list" ? (content[selectedLanguage]?.find(item => item.elementLabel === 'ListView') || {}).mvalue || "nf List View" : (content[selectedLanguage]?.find(item => item.elementLabel === 'List') || {}).mvalue || "nf List"} onClick={() => dispatch(setView("list"))} isActive={Result.view === "list"} />
                                <SecondaryToggleBtn label={Result.view === "map" ? (content[selectedLanguage]?.find(item => item.elementLabel === 'MapView') || {}).mvalue || "nf Map View" : (content[selectedLanguage]?.find(item => item.elementLabel === 'Map') || {}).mvalue || "nf Map"} onClick={() => dispatch(setView("map"))} isActive={Result.view === "map"} />
                            </div>

                        </div>
                    </div>


                </div>
            }
            <div className=" rounded  font-5 overflow-y-auto mt-1" style={{ height: `75vh `, backgroundColor: "#E7E7E7" }} >

                <div>



                    {/* cards */}
                    <div>
                        {Result.status === "loading" ? <Loader /> :

                            (Result.status === "success" && Result.noOfResult > 0) &&
                                Result.view === "card" ?
                                <React.Fragment>
                                    <div className='d-flex justify-content-center my-2'>
                                        <Pagination count={11} />
                                    </div>
                                    {Result.data.map((result) => {
                                        return (
                                            <div key={result.userId}>
                                                <UserCardA userDetail={result} SelectedRefSkillFilter={skillsInRefined} />
                                            </div>)
                                    })}
                                </React.Fragment>
                                :
                                Result.view === "list" &&
                                <div>
                                    <SearchResultGrid data={Result?.data} />
                                </div>

                        }


                        {/* just ignore the error id not found */}
                        <div id='map' style={{ height: "0", width: "100%" }} ></div>
                        {/* {Result.view === "map" && (
                                <div
                                    id="googleMap"
                                    style={{ width: '100%', height: '77vh' }}
                                ></div>
                            )} */}
                       

                    </div>
                </div>
               

            </div>
        </div>
    )
}

export default ResultMIddlePanel