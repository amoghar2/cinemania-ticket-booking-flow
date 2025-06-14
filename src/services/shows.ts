
import { supabase } from "@/integrations/supabase/client";

export class ShowsService {
  async getMovieShows(movieId: string, city?: string, date?: string) {
    console.log('=== MOVIE SHOWS DEBUG ===');
    console.log('Input params:', { movieId, city, date });
    
    // Handle both 'Bangalore' and 'Bengaluru' city names
    const searchCity = city === 'Bangalore' ? 'Bengaluru' : city;
    console.log('Normalized city:', searchCity);
    
    // First, let's check what shows exist for this movie without any filters
    const { data: allShows, error: allShowsError } = await supabase
      .from('shows')
      .select(`
        *,
        movie:movies(*),
        theatre:theatres(*)
      `)
      .eq('movie_id', movieId);
    
    console.log('Total shows found for movie (no filters):', allShows?.length || 0);
    if (allShows && allShows.length > 0) {
      console.log('Sample show data:', allShows[0]);
      console.log('Available cities for this movie:', [...new Set(allShows.map(s => s.theatre?.city))]);
      console.log('Available dates for this movie:', [...new Set(allShows.map(s => s.show_date))]);
    }

    let query = supabase
      .from('shows')
      .select(`
        *,
        movie:movies(*),
        theatre:theatres(*)
      `)
      .eq('movie_id', movieId);

    if (searchCity) {
      console.log('Adding city filter:', searchCity);
      query = query.eq('theatre.city', searchCity);
    }

    if (date) {
      console.log('Adding date filter:', date);
      query = query.eq('show_date', date);
    }

    const { data, error } = await query.order('show_date').order('show_time');

    if (error) {
      console.error('Failed to fetch movie shows:', error);
      throw new Error(`Failed to fetch movie shows: ${error.message}`);
    }

    console.log(`Final filtered shows: ${data?.length || 0} shows for movie ${movieId} in ${searchCity} on ${date || 'all dates'}`);
    
    if (data && data.length > 0) {
      console.log('Sample filtered show:', data[0]);
    } else {
      console.log('No shows found with current filters - debugging...');
      
      // Let's check what theatres exist in the city
      const { data: theatres } = await supabase
        .from('theatres')
        .select('*')
        .eq('city', searchCity);
      console.log('Theatres in', searchCity, ':', theatres?.length || 0);
      
      // Check shows for those theatres
      if (theatres && theatres.length > 0) {
        const theatreIds = theatres.map(t => t.id);
        const { data: showsInCity } = await supabase
          .from('shows')
          .select('*')
          .in('theatre_id', theatreIds);
        console.log('Total shows in city theatres:', showsInCity?.length || 0);
      }
    }
    
    console.log('=== END DEBUG ===');
    return data || [];
  }
}

export const showsService = new ShowsService();
