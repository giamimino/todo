import React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '@iconify/react/dist/iconify.js'

type Props = {
  image: string,
  name: string,
  edit: boolean,
  handleUpload: (uploaded: File) => void
}

export default function Profile(props: Props) {
  return (
    <div className='p-2.5 flex justify-center items-center
    flex-col w-full gap-2.5'>
      <div className='p-0.75 rounded-full border-1
      border-solid border-[var(--BlushPink-400)] relative w-21 h-21'>
          <Image
            className='rounded-full w-full h-full object-cover'
            src={props.image}
            alt='profile-image'
            width={84}
            height={84}
            priority
          />
        <AnimatePresence>
          {props.edit && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.1}}
              className=''
            >
              <label htmlFor='imageuploader' className='
               absolute bottom-1/10 right-0 w-5 h-5 flex
               justify-center items-center bg-[var(--SeaShell-50)] border-1 border-solid
               border-[#FF73FA] rounded-full cursor-pointer'>
                <Icon icon={"lets-icons:edit-light"} />
              </label>
              <input type="file" accept='image/' 
              id='imageuploader' hidden className='hidden' onChange={(e) => {
                const file = e.target.files?.[0]
                if(file)
                props.handleUpload(file)}}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <h1 className='text-base font-semibold 
      text-[var(--SeaShell-950)]'>{props.name}</h1>
    </div>
  )
}
