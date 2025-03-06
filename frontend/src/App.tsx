import { useState } from 'react'
import movie_theater from '../public/movie_theather.png'

function App() {

  return (

      <div className='h-full flex justify-center items-center bg-[${movie_theater}] text-white'>
        <div className='flex flex-col justify-center items-center gap-4'>
          <h1 className='text-6xl font-extrabold mb-6'>Welcome to Movie Finder</h1>
          <p>Please input the year of the movies you would like to learn about</p>
          <input placeholder="Input Year Here" className='p-2 bg-white text-black rounded-md' />
        </div>

      </div>
  )
}

export default App;
