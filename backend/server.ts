import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import express, { Request, Response } from 'express';
import { createObjectCsvWriter } from 'csv-writer';
import fs from "fs";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

interface Movie {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

interface CsvRowData {
    title: string;
    vote_count: number | string;
}

/**
 * Sorting functions for movies
 */
const sortingFunctions = {
    byTitle: (movies: Movie[]) => [...movies].sort((a, b) => a.title.localeCompare(b.title)),
    byTitleIgnoringArticles: (movies: Movie[]) => {
      return [...movies].sort((a, b) => {
        const normalize = (title: string) => title.replace(/^(A |The )/i, '');
        return normalize(a.title).localeCompare(normalize(b.title));
      });
    }
};

/**
 * Processes movies data with different sorting methods
 * 
 * @param movies - Array of movie objects outputted from the TMDB API
 * @returns Array of array containing differently sorted movies (w/ separators)
 */
function processMovieData(movies: Movie[]): CsvRowData[][] {
  // Take top 10 by vote count first
  const topMovies = movies.slice(0, 10);
  
  // Define sorting methods using anonymous functions
  const sortingMethods = [
    { sortFn: () => topMovies },
    { sortFn: () => sortingFunctions.byTitle(topMovies) },
    { sortFn: () => sortingFunctions.byTitleIgnoringArticles(topMovies) }
  ];
  
  // Build the result array dynamically
  const result: CsvRowData[][] = [];
  
  // Dynamically add data using the anonymous sortiny functions and add separators
  sortingMethods.forEach((method, index) => {
    result.push(method.sortFn());

    if (index < sortingMethods.length - 1) {
      result.push([{ title: '---', vote_count: '' }]);
    }
  });
  
  return result;
}

/**
 * Creates a CSV file with movie data
 * 
 * @param year - The year we got these movies from 
 * @param movieDataArrays - Array of array containing differently sorted movies (w/ separators)
 * @returns Path to the created CSV file
 */
async function createMovieCSV(year: string, movieDataArrays: CsvRowData[][]): Promise<string> {
    const csvPath = `../frontend/public/exports/movies_${year}.csv`;
    
    const csvWriter = createObjectCsvWriter({
        path: csvPath,
        header: [
        { id: 'title', title: 'Title' }, 
        { id: 'vote_count', title: 'Votes' }
        ],
    });

    // Write each section dynamically
    for (const dataArray of movieDataArrays) {
        await csvWriter.writeRecords(dataArray);
    }

    return csvPath;
}

/**
 * GET request to retrieve movies from TMDB API and generate a CSV file
 * 
 * @param year - The year we want to search for movies in the TMDB API
 * @returns CSV file with the top 10 movies by vote count, sorted by title, and sorted ignoring articles
 */
app.get('/generate-csv', async (req: Request, res: Response) => {
  const year = req.query.year;
  
  if (!year) {
    res.status(400).json({ error: 'Year is required' });
    return;
  } 

  try {
    // Fetch movies from TMDB using API KEY and Access Token
    const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
      params: { 
        primary_release_year: year, 
        sort_by: 'vote_count.desc', 
        api_key: process.env.TMDB_API_KEY 
      },
      headers: {
        Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`, 
        accept: "application/json",
      },
    });
    
    const movies: Movie[] = response.data.results;
    
    // Process and sort the data
    const processedDataArrays = processMovieData(movies);
    
    // Create the CSV file
    const csvPath = await createMovieCSV(year as string, processedDataArrays);
    
    // Set headers to trigger download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=movies_${year}.csv`);
    
    // Read and send the file
    const fileStream = fs.createReadStream(csvPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error! Something went wrong finding your movies' });
  }
});

export default app;