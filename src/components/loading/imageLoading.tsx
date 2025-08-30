import React from 'react'

export default function ImageLoading() {
  return (
    <div className='p-2.5 flex justify-center items-center
    flex-col w-full gap-2.5'>
      <div className='rounded-full w-21 h-21 bg-gray-400 animate-pulse'>
      </div>
      <div className='w-11 h-4 bg-gray-400 animate-pulse'></div>
    </div>
  )
}
