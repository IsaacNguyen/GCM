import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import express, { Request, Response } from 'express';
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


app.get('/generate-csv', async (req: Request, res: Response) => {
    const year = req.query.year;
    if (!year){
        res.status(400).json({ error: 'Year is required' });
        return;
    } 

    try {
        // Fetch movies from TMDB
        const response = await axios.get(`https://api.themoviedb.org/3/discover/movie`, {
            params: { primary_release_year: year, sort_by: 'vote_average.desc', api_key: process.env.TMDB_API_KEY }
        });

        let movies = response.data.results.slice(0, 10);
        console.log(movies)
        
        // Sorting
        // const sortedByVotes = [...movies].sort((a, b) => b.vote_count - a.vote_count);
        // const sortedByTitle = [...movies].sort((a, b) => a.title.localeCompare(b.title));
        // const sortedByTitleIgnoringArticles = [...movies].sort((a, b) => {
        //     const normalize = (title) => title.replace(/^(A |The )/i, '');
        //     return normalize(a.title).localeCompare(normalize(b.title));
        // });

        // // CSV File Creation
        // const csvPath = `./public/exports/movies_${year}.csv`;
        // const csvWriter = createObjectCsvWriter({
        //     path: csvPath,
        //     header: [{ id: 'title', title: 'Title' }, { id: 'vote_count', title: 'Votes' }],
        // });

        // await csvWriter.writeRecords(sortedByVotes);
        // await csvWriter.writeRecords(sortedByTitle);
        // await csvWriter.writeRecords(sortedByTitleIgnoringArticles);

        res.json({ downloadUrl: `http://localhost:${PORT}/exports/movies_${year}.csv` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get movies' });
    }
});

app.use('/exports', express.static('public/exports'));

export default app;