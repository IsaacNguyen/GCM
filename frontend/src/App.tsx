import { useState } from 'react'
import movie_theater from '/movie_theater.jpeg'

function App() {
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const downloadLink = document.createElement('a');
      downloadLink.href = `http://localhost:3001/generate-csv?year=${year}`;
      downloadLink.setAttribute('download', `movies_${year}.csv`);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setSuccess("Movies were fetched successfully!!");
    } catch (err: any) {
      console.error(err);
      setError("Could not fetch movies. Sorry....");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-full relative'>
      
      <div className='relative z-10 h-full flex justify-center items-center text-white'
        style={{ 
          backgroundImage: `url(${movie_theater})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
        }}>
       
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <h1 className='text-6xl text-white font-semibold mb-6'>Welcome to Movie Finder</h1>
          <p>Please input the year of the movies you would like to learn about</p>
          <input
            type="number"
            placeholder="Input Year Here"
            className="px-4 py-2 bg-white text-black rounded-md"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <button
            type="submit"
            className="rounded-lg bg-white text-black px-4 py-1 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </form>
      </div>
    </div>
  )
}
export default App;
