import React from 'react'
import LeftPanelSeeker from './LeftPanelSeeker'
import ResultMIddlePanel from './ResultMIddlePanel'

const SkillSeekerSearch = ({ contentHeight, SkillBasedResult }) => {
    return (
        <div className="  d-flex container-fluid gap-2 " style={{ margin: 0, padding: 0 }} >





            {/* LEft bar */}
            <div className=" col  font-5 overflow-y-auto   " style={{ margin: 0, padding: 0 }} >
                <LeftPanelSeeker contentHeight={contentHeight} />
            </div>



            {/* Middle Sections */}
            <div className=" col-lg-9 card  font-5  mt-1  "  >
                <div className=' ' >
                    <ResultMIddlePanel Result={SkillBasedResult} contentHeight={contentHeight} />
                </div>
            </div>



        </div>





    )
}

export default SkillSeekerSearch