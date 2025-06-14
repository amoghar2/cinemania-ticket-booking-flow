
import { supabase } from "@/integrations/supabase/client";

export class MoviesService {
  async getMovies(city?: string) {
    console.log('Fetching movies from Supabase for city:', city);
    
    // Handle both 'Bangalore' and 'Bengaluru' city names
    const searchCity = city === 'Bangalore' ? 'Bengaluru' : city;
    console.log('Normalized city for search:', searchCity);
    
    let query = supabase
      .from('movies')
      .select('*')
      .order('title');

    const { data: movies, error } = await query;

    if (error) {
      console.error('Failed to fetch movies:', error);
      throw new Error(`Failed to fetch movies: ${error.message}`);
    }

    console.log('Total movies found in database:', movies?.length || 0);

    // If city is specified, filter movies that have shows in that city
    if (searchCity) {
      console.log('Filtering movies for city:', searchCity);
      
      const { data: showsData, error: showsError } = await supabase
        .from('shows')
        .select(`
          movie_id,
          theatre:theatres!inner(city)
        `)
        .eq('theatre.city', searchCity);

      if (showsError) {
        console.error('Failed to fetch shows for city filter:', showsError);
        return movies || [];
      }

      console.log('Shows found for city filter:', showsData?.length || 0);

      // Get unique movie IDs that have shows in the specified city
      const movieIdsWithShows = [...new Set(showsData?.map(show => show.movie_id) || [])];
      console.log('Unique movie IDs with shows in', searchCity, ':', movieIdsWithShows.length);
      
      // Filter movies to only include those with shows in the city
      const filteredMovies = movies?.filter(movie => movieIdsWithShows.includes(movie.id)) || [];
      console.log(`Found ${filteredMovies.length} movies with shows in ${searchCity}`);
      return filteredMovies;
    }

    console.log('Successfully fetched movies:', movies?.length || 0);
    return movies || [];
  }

  async getMovie(movieId: string) {
    console.log('Fetching movie details for ID:', movieId);
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', movieId)
      .single();

    if (error) {
      console.error('Failed to fetch movie:', error);
      throw new Error(`Failed to fetch movie: ${error.message}`);
    }

    console.log('Movie found:', data?.title);
    return data;
  }
}

export const moviesService = new MoviesService();
