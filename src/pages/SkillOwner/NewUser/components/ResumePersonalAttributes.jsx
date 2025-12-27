import React from 'react'
import { MdDelete, MdDoneOutline, MdEdit } from 'react-icons/md'
import useContentLabel from '../../../../hooks/useContentLabel';
import SuccessBtn from '../../../../components/Buttons/SuccessBtn';

const ResumePersonalAttributes = ({ resumePersonalAtt, setResumePersonalAtt }) => {
    const contentLabel = useContentLabel()
    console.log(resumePersonalAtt);
    return (
        <>
            <div className='d-flex align-items-center justify-content-end gap-2 px-2 ' style={{ position: 'absolute', right: '20px', top: '20px', zIndex: '9999' }}>
                {
                    resumePersonalAtt?.edit ?
                        <MdDoneOutline style={{ cursor: 'pointer' }} onClick={() => setResumePersonalAtt({ ...resumePersonalAtt, edit: false })} />
                        :
                        <MdEdit style={{ cursor: 'pointer' }} onClick={() => setResumePersonalAtt({ ...resumePersonalAtt, edit: true })} />
                }
                <MdDelete style={{ cursor: 'pointer' }} />
            </div>
            <div className='d-flex justify-content-center align-items-center flex-column gap-3 row' style={{ pointerEvents: resumePersonalAtt?.edit ? '' : 'none' }} >


                {resumePersonalAtt && Object?.keys(resumePersonalAtt)?.map((item, i) => {
                    
                  
                  if(resumePersonalAtt[`${item}`] && item !== 'edit'){
                    return(
                <div class=" d-md-flex d-block  gap-4 justify-content-center align-items-center col-md-6 col-12" >
                    <label htmlFor={item} className='w-25 text-start text-md-end text-capitalize'>{item}</label>
                    <input type="Text" class="form-control" id={item} placeholder={`Enter your ${item}`} value={resumePersonalAtt[`${item}`]} onChange={(e) => setResumePersonalAtt({ ...resumePersonalAtt, [item]: e.target.value })} />
                </div>
                    )
                  }
                    
                })}



                {/* <div class=" d-md-flex d-block  gap-4 justify-content-center align-items-center col-md-6 col-12" >
                    <label htmlFor="first-name" className='w-25 text-start text-md-end'>availability</label>
                    <input type="Text" class="form-control" id="first-name" placeholder="Enter your availability" value={resumePersonalAtt?.availability}  onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, availability:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="last-name" className='w-25 text-start text-md-end'>birthplace</label>
                    <input type="Text" class="form-control" id="last-name" placeholder="Enter your birthplace" value={resumePersonalAtt?.birthplace} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, birthplace:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block  gap-4 justify-content-center align-items-center col-md-6 col-12" >
                    <label htmlFor="Address" className='w-25 text-start text-md-end'>currentLocation</label>
                    <input type="Text" class="form-control" id="Address" placeholder="Enter your currentLocation" value={resumePersonalAtt?.currentLocation} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, currentLocation:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="city" className='w-25 text-start text-md-end'>drivingLicense </label>
                    <input type="Text" class="form-control" id="city" placeholder="Enter your drivingLicense" value={resumePersonalAtt?.drivingLicense } onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, drivingLicense :e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="Region" className='w-25 text-start text-md-end'>familyComposition</label>
                    <input type="Text" class="form-control" id="Region" placeholder="Enter your familyComposition" value={resumePersonalAtt?.familyComposition} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, familyComposition:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="fathersName" className='w-25 text-start text-md-end'>fathersName</label>
                    <input type="Text" class="form-control" id="fathersName" placeholder="Enter your fathersName" value={resumePersonalAtt?.fathersName} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, fathersName:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="gender " className='w-25 text-start text-md-end'>gender </label>
                    <input type="Text" class="form-control" id="gender " placeholder="Enter your gender " value={resumePersonalAtt?.gender } onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, gender :e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="maritalStatus" className='w-25 text-start text-md-end'>maritalStatus</label>
                    <input type="Text" class="form-control" id="maritalStatus" placeholder="Enter your maritalStatus" value={resumePersonalAtt?.maritalStatus} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, maritalStatus:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="mothersMaidenName" className='w-25 text-start text-md-end'>mothersMaidenName</label>
                    <input type="Text" class="form-control" id="mothersMaidenName" placeholder="Enter your mothersMaidenName" value={resumePersonalAtt?.mothersMaidenName} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, mothersMaidenName:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="motherTongue" className='w-25 text-start text-md-end'>motherTongue</label>
                    <input type="Text" class="form-control" id="motherTongue" placeholder="Enter your motherTongue" value={resumePersonalAtt?.motherTongue} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, motherTongue:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="nationality" className='w-25 text-start text-md-end'>nationality</label>
                    <input type="Text" class="form-control" id="nationality" placeholder="Enter your mothersMaidenName" value={resumePersonalAtt?.nationality} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, nationality:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="nationalIdentities" className='w-25 text-start text-md-end'>nationalIdentities</label>
                    <input type="Text" class="form-control" id="nationalIdentities" placeholder="Enter your nationalIdentities" value={resumePersonalAtt?.nationalIdentities} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, nationalIdentities:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="passportNumber" className='w-25 text-start text-md-end'>passportNumber</label>
                    <input type="Text" class="form-control" id="passportNumber" placeholder="Enter your passportNumber" value={resumePersonalAtt?.passportNumber} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, passportNumber:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="preferredLocation" className='w-25 text-start text-md-end'>preferredLocation</label>
                    <input type="Text" class="form-control" id="preferredLocation" placeholder="Enter your preferredLocation" value={resumePersonalAtt?.preferredLocation} onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, preferredLocation:e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="visaStatus " className='w-25 text-start text-md-end'>visaStatus </label>
                    <input type="Text" class="form-control" id="visaStatus " placeholder="Enter your visaStatus " value={resumePersonalAtt?.visaStatus } onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, visaStatus :e.target.value})}/>
                </div>
                <div class=" d-md-flex d-block gap-4 justify-content-center align-items-center col-md-6 col-12">
                    <label htmlFor="willingToRelocate " className='w-25 text-start text-md-end'>willingToRelocate </label>
                    <input type="Text" class="form-control" id="willingToRelocate " placeholder="Enter your willingToRelocate " value={resumePersonalAtt?.willingToRelocate } onChange={(e)=>setResumePersonalAtt({...resumePersonalAtt, willingToRelocate :e.target.value})}/>
                </div> */}


            </div>
            <div className='d-flex justify-content-end'>

            <SuccessBtn
                  label={contentLabel("Import", "nf Import")}
                //   onClick={handleSubmit}
                //   isLoading={isLoading}
                //   disable={isLoading}
                />
</div>

        </>
    )
}

export default ResumePersonalAttributes
