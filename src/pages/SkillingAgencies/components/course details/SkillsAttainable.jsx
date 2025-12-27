import React, { useEffect, useState } from 'react'

import { BASE_URL } from '../../../../config/Properties'
import { showErrorToast } from '../../../../components/ToastNotification/showErrorToast'
import { useSelector } from 'react-redux'
import TableLoaders from '../../../../components/CustomLoader/TableLoaders'
import { Col, Row } from 'react-bootstrap'
import useContentLabel from '../../../../hooks/useContentLabel'


const SkillsAttainable = () => {


    const contentLabel = useContentLabel()
    const {attainableSkillsList:skillsAttainable} = useSelector((state) => state.myCourses.selectedCourse)

    return (
        <>
               <div className="d-flex align-items-center  ">
                                  <div className="font-3 mb-2">
                                   {contentLabel('SkillsAttainable', 'nf Skills Attainable')}
                                  </div>
               </div>
            <table class="ms-2 opportunity-tables table-hover table-responsive table-bordered  align-self-center font-5 w-100">
                <thead>
                    <tr>
                        <th className='p-1' scope="col" style={{ width: '5%' }}>#</th>
                        <th className='p-1' scope="col" style={{ width: '70%' }}>{contentLabel('SkillsAttainable', 'nf Skills Attainable')}</th>
                        <th className='p-1' scope="col" style={{ width: '20%' }}>{contentLabel('Duration', 'nf Duration')}</th>
                    </tr>
                </thead>
                <tbody>

                    {/* {skillsAttainableLoading &&
                        <>
                            <tr className=''>
                                <th className='p-1' > </th>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                            </tr>
                            <tr>
                                <th className='p-1' > </th>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                            </tr>
                            <tr>
                                <th className='p-1'> </th>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                                <td className='p-1'> <p className="skeleton-loading w-100" ></p></td>
                            </tr>

                        </>

                    } */}
                    {
                        skillsAttainable?.map((topic, i) => {
                            if (topic.skill) {
                                return (
                                    <tr>
                                        <th className='p-1' scope="row">{i + 1}</th>
                                        <td className='p-1'>{topic.skill}</td>
                                        <td className='p-1'>{topic.duration} {topic.durationPhase}</td>

                                    </tr>
                                )

                            }
                        })
                    }
                </tbody>
            </table>

        </>
    )
}

export default SkillsAttainable
