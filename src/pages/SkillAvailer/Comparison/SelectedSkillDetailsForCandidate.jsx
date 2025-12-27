import React, { useEffect, useState } from 'react'
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import SkillPRofileOfUserAndUserSkill from '../../../api/SkillSeeker/SkillPRofileOfUserAndUserSkill';
import SkillAppliedDetailedView from '../../../components/SkillAvailer/SkillApplied/SkillAppliedDetailedView';
import { setSelectedSkillDetails } from '../../../reducer/SkillSeeker/Comparison/SkillComparisonSlice';
import { showErrorToast } from '../../../components/ToastNotification/showErrorToast';
import { useDispatch } from 'react-redux';
import useContentLabel from '../../../hooks/useContentLabel';
import { icons } from '../../../constants';

const SelectedSkillDetailsForCandidate = () => {
    const { skillComparisonSkillsData, selectedSkillDetails } = useSelector(state => state.SkillComparison);
    const dispatch = useDispatch()
    const contentLabel = useContentLabel()
    const [loader, setLoader] = useState(false)
    useEffect(() => {
        const candidateId = selectedSkillDetails?.candidateDetails?.candidateId;
        const candidateSkill = selectedSkillDetails?.candidateDetails?.candidateSkill;
        console.log(candidateId, candidateSkill);


        if (candidateId && candidateSkill) {
            setLoader(true)
            SkillPRofileOfUserAndUserSkill(candidateId, candidateSkill)
                .then((res) => {
                    dispatch(setSelectedSkillDetails({ ...selectedSkillDetails, skillDetails: res })); // or whatever part of res is needed
                    setLoader(false)
                })
                .catch((err) => {
                    showErrorToast("SomethingWentWrong", "nf Something Went Wrong")
                    console.error("Error fetching skill profile:", err);
                    setLoader(false)
                });
        }
    }, []);

    console.log(selectedSkillDetails?.skillDetails?.skillsApplied);


    return (
        <Card>
        <Card.Header>
                <icons.FaAngleLeft size={25} className='mb-2 cursor-pointer' onClick={() => { dispatch(setSelectedSkillDetails(null)) }} />
        </Card.Header>
            <Card.Body className="card-scroll-hidden" style={{ minHeight: 'var(--cardBodyWithB-F)' }}>
                <div>
                    <div className="my-2 font-weight-2 font-4 bg-light p-2">
                        {/* {contentLabel("SkillsApplied,nf Skills Applied")} */}
                        Skills Applied
                    </div>
                    {
                        loader ?
                        <div class="text-center p-2">
                            <div class="spinner-border" style={{width: "2rem", height: "2rem"}}role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                            </div>
                            :
                            <SkillAppliedDetailedView
                                skillName={selectedSkillDetails?.candidateDetails?.candidateSkill}
                                SkillAppliedData={selectedSkillDetails?.skillDetails?.skillsApplied || []}
                                validationData={null}
                            />

                    }
                </div>

                <div className='mt-2'>
                    <div className="my-2 font-weight-2 font-4 bg-light p-2">
                        {/* {contentLabel("SkillsAcquired,nf Skills Acquired")} */}
                        Skills Acquired
                    </div>
                    {
                        loader ?
                        <div class="text-center p-2">
                            <div class="spinner-border" style={{width: "2rem", height: "2rem"}}role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                            </div>
                            :
                            <SkillAppliedDetailedView
                                skillName={selectedSkillDetails?.candidateDetails?.candidateSkill}
                                SkillAppliedData={selectedSkillDetails?.skillDetails?.skillsAcquired || []}
                                validationData={null}
                            />
                    }

                </div>
            </Card.Body>
        </Card>

    )
}

export default SelectedSkillDetailsForCandidate
