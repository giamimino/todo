import React from 'react'

export default function Loading() {
  return (
    <div className='fixed inset-0 flex justify-center items-center bg-white/50 backdrop-blur-lg z-50'>
      <div
        className="w-20 h-20 border-4 border-t-[var(--SeaShell-950)] border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin"
      ></div>
    </div>
  )
}