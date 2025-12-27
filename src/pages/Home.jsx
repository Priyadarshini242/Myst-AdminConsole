import React from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const navigate = useNavigate()
  return (
    <div className='d-flex justify-content-end p-3' >
    <div className='d-flex gap-2'>
      <button className='btn btn-primary' onClick={()=>{navigate('/skill-owner/email')}}>Login</button>
      <button className='btn btn-primary' onClick={()=>{navigate('/services/email')}}>Services</button>
    </div>
    </div>
  )
}

export default Home
