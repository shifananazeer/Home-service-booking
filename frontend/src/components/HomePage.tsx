import React from 'react'
import { useNavigate } from 'react-router-dom'
import { HowItWorks } from './About'
import { motion } from 'framer-motion'

const HomePage = () => {
  const navigate = useNavigate()

  const handleFindService = () => {
    navigate('/services')
  }

  return (
    <div className="relative min-h-screen bg-black">
      <div 
        className="relative h-[900px] w-full bg-cover bg-center bg-no-repeat "
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("wp.webp")',
        }}
      >
       
<div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 lg:px-8 -ml-2"> 
  <div className="max-w-xl mx-auto text-center sm:text-left">
    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
      Your Trusted Partner for Home Services
    </h1>
    
    <p className="mt-4 text-xl text-gray-300">
      Book expert workers for all your home needs—plumbing, cleaning, repairs, and more. Quick, reliable, and hassle-free!
    </p>
    
    <div className="mt-8">
      <button
        onClick={handleFindService}
        className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Find a Service
      </button>
    </div>
  </div>
</div>

      </div>
      <HowItWorks />
    </div>
  )
}

export default HomePage

