import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer'
import { Outlet } from 'react-router-dom';
import DeleteFormDetailedProfile from '../../../components/DeleteFormDetailedProfile';
import FindSkillByOccModal from './components/FindSkillByOccModal';

const NavbarForNewUser = () => {
    const navbarRef = useRef(null);
    const [contentHeight, setContentHeight] = useState('100vh');

    useEffect(() => {
        if (navbarRef.current) {
            const navbarHeight = navbarRef.current.offsetHeight;
            setContentHeight(`calc(98vh - ${navbarHeight}px)`);
        }
    }, []);

    const handlePdf = () => {
        window.print();
    }


    return (
        <>
            <DeleteFormDetailedProfile />
            <FindSkillByOccModal />

        

            <div>
                <div ref={navbarRef} id="yourNavbarId" >
                    <Navbar handlePdf={handlePdf}></Navbar>
                </div>

                <hr className='p-0 m-0 ' />

                <div style={{ height: contentHeight, position: 'relative', isolation: 'isolate' }} >
                    <Outlet/>
                </div>

                <Footer />

            </div>

        </>
    )
}

export default NavbarForNewUser
