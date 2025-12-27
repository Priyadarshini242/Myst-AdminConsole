import React, { useEffect, useRef, useState } from 'react'
import Footer from '../../../components/Footer'
import Navbar from '../../../components/Navbar';
import { useSelector } from 'react-redux';
import { MdDelete } from 'react-icons/md';
import AcquiredFormForNewUser from './components/AcquiredFormForNewUser';
import AppliedFormForNewUser from './components/AppliedFormForNewUser';
import DeleteFormDetailedProfile from '../../../components/DeleteFormDetailedProfile';

const NewUserLinkSkills = () => {
    const navbarRef = useRef(null);
    const content = useSelector(state => state.content);
    const selectedLanguage = useSelector(state => state.language);
    const [contentHeight, setContentHeight] = useState('100vh');

    const [selectedField, setSelectedField] = useState('Acquired')

    const [selectedAcquired, setSelectedAcquired] = useState(null)


    const handlePdf = () => {
        window.print();
    }


    useEffect(() => {
        if (navbarRef.current) {
            const navbarHeight = navbarRef.current.offsetHeight;
            setContentHeight(`calc(98vh - ${navbarHeight}px)`);
        }
    }, []);

    return (
        <>




                <div class="py-4 px-md-5 px-1 bg-white rounded ">
                    <p class="text-muted mb-4 text-center" style={{ letterSpacing: '.1rem' }} id="Employment">{(content[selectedLanguage]?.find(item => item.elementLabel === "ConnectSkills") || {}).mvalue || "nf ConnectSkills"}
                    </p>

                    <ul id="myTab1" role="tablist" class="nav nav-tabs nav-pills with-arrow flex-column gap-2 flex-sm-row text-center">
                        <li class="nav-item flex-sm-fill" style={{ cursor: 'pointer' }} onClick={() => setSelectedField('Acquired')}>
                            <span className='px-2 py-1 rounded-circle' style={{ color: (selectedField === 'Acquired') ? 'white' : '', backgroundColor: (selectedField === 'Acquired') ? `${(content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#000"}` : '', border: (selectedField === 'Acquired') ?  `4px solid ${(content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#000"}`  : '2px solid #555' }}>6</span>
                            <div class={` mt-2  font-weight-bold mr-sm-3 rounded-0   fs-6 `} style={{ color: (selectedField === 'Acquired') ? `${(content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#000"}` : '#555', fontWeight: 'bolder' }}>{(content[selectedLanguage]?.find(item => item.elementLabel === "WhereDidYouAcquired") || {}).mvalue || "nf WhereDidYouAcquired"}</div>
                        </li>

                        <li class="nav-item flex-sm-fill" style={{ cursor: 'pointer' }} onClick={() => setSelectedField('Applied')}>
                            <span className='px-2 py-1 rounded-circle' style={{ color: (selectedField === 'Applied') ? 'white' : '', backgroundColor: (selectedField === 'Applied') ? `${(content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#000"}` : '', border: (selectedField === 'Applied') ?  `4px solid ${(content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#000"}`  : '2px solid #555' }}>7</span>
                            <div class={` mt-2  font-weight-bold mr-sm-3 rounded-0   fs-6 `} style={{ color: (selectedField === 'Applied') ? `${(content[selectedLanguage]?.find(item => item.elementLabel === 'NavBarBgColor') || {}).mvalue || "#000"}` : '#555', fontWeight: 'bolder' }}>{(content[selectedLanguage]?.find(item => item.elementLabel === "WhereDidYouApplied") || {}).mvalue || "nf WhereDidYouApplied"}</div>
                        </li>


                    </ul>






                    {
                        selectedField === 'Acquired' && <AcquiredFormForNewUser setSelectedField={setSelectedField}/>
                    }



                    {
                        selectedField === 'Applied' && <AppliedFormForNewUser setSelectedField={setSelectedField}/>
                        
                    }



                </div>





        </>
    )
}

export default NewUserLinkSkills
