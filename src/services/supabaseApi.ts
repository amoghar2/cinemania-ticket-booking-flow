import { supabase } from "@/integrations/supabase/client";

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface LoginData {
  email: string;
  password: string;
}

class SupabaseApiService {
  async login(data: LoginData): Promise<LoginResponse> {
    console.log('Attempting login with Supabase');
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error('Login failed:', error.message);
      throw new Error(`Login failed: ${error.message}`);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Login failed: No user data returned');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Failed to fetch profile:', profileError);
    }

    console.log('Login successful');
    return {
      access_token: authData.session.access_token,
      token_type: 'bearer',
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
      },
    };
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    console.log('Attempting registration with Supabase');
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      console.error('Registration failed:', error.message);
      throw new Error(`Registration failed: ${error.message}`);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Registration failed: No user data returned');
    }

    console.log('Registration successful');
    return {
      access_token: authData.session.access_token,
      token_type: 'bearer',
      user: {
        id: authData.user.id,
        email: authData.user.email || '',
        first_name: data.first_name,
        last_name: data.last_name,
      },
    };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error('Failed to get user info');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    };
  }

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

  async createSeatsForShow(showId: string) {
    console.log('Creating seats for show:', showId);
    
    // Check if seats already exist for this show
    const { data: existingSeats } = await supabase
      .from('seats')
      .select('id')
      .eq('show_id', showId);
      
    if (existingSeats && existingSeats.length > 0) {
      console.log('Seats already exist for this show:', existingSeats.length);
      return;
    }
    
    // Create seats for the show (5 rows, 20 seats per row)
    const seats = [];
    const rows = ['A', 'B', 'C', 'D', 'E'];
    
    for (const row of rows) {
      for (let seatNum = 1; seatNum <= 20; seatNum++) {
        seats.push({
          show_id: showId,
          row_letter: row,
          seat_number: seatNum.toString(),
          is_booked: false,
          is_locked: false,
        });
      }
    }
    
    console.log('Inserting', seats.length, 'seats for show', showId);
    
    const { data, error } = await supabase
      .from('seats')
      .insert(seats);
      
    if (error) {
      console.error('Failed to create seats:', error);
      throw new Error(`Failed to create seats: ${error.message}`);
    }
    
    console.log('Successfully created seats for show');
    return data;
  }

  async getShowSeats(showId: string) {
    console.log('Fetching seats for show:', showId);
    
    // First check if seats exist
    const { data: existingSeats, error: fetchError } = await supabase
      .from('seats')
      .select('*')
      .eq('show_id', showId)
      .order('row_letter')
      .order('seat_number');

    if (fetchError) {
      console.error('Failed to fetch show seats:', fetchError);
      throw new Error(`Failed to fetch show seats: ${fetchError.message}`);
    }

    // If no seats exist, create them
    if (!existingSeats || existingSeats.length === 0) {
      console.log('No seats found for show, creating them...');
      await this.createSeatsForShow(showId);
      
      // Fetch seats again after creation
      const { data: newSeats, error: refetchError } = await supabase
        .from('seats')
        .select('*')
        .eq('show_id', showId)
        .order('row_letter')
        .order('seat_number');
        
      if (refetchError) {
        console.error('Failed to refetch seats after creation:', refetchError);
        throw new Error(`Failed to refetch seats: ${refetchError.message}`);
      }
      
      console.log('Created and fetched', newSeats?.length || 0, 'seats for show');
      return newSeats || [];
    }

    console.log('Found', existingSeats.length, 'existing seats for show');
    return existingSeats;
  }

  async lockSeats(showId: string, seatIds: string[], userSession: string) {
    // Note: Seat locking logic would need to be implemented as a Supabase function
    // For now, we'll simulate the response
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    const { data, error } = await supabase
      .from('seats')
      .update({
        is_locked: true,
        locked_until: expiresAt.toISOString(),
      })
      .in('id', seatIds)
      .eq('show_id', showId)
      .eq('is_booked', false)
      .eq('is_locked', false);

    if (error) {
      console.error('Failed to lock seats:', error);
      throw new Error(`Failed to lock seats: ${error.message}`);
    }

    return {
      success: true,
      locked_seats: seatIds,
      expires_at: expiresAt,
      message: 'Seats locked successfully',
    };
  }

  async createBooking(showId: string, seatIds: string[], userEmail: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get show details for pricing
    const { data: show, error: showError } = await supabase
      .from('shows')
      .select('price')
      .eq('id', showId)
      .single();

    if (showError) {
      throw new Error('Failed to get show details');
    }

    // Enforce minimum ticket price per seat
    const perSeatPrice = Math.max(show.price, 199); // ₹199 minimum
    const totalAmount = perSeatPrice * seatIds.length;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        show_id: showId,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Failed to create booking:', bookingError);
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Mark seats as booked and create booking_seats entries
    const { error: seatsError } = await supabase
      .from('seats')
      .update({ is_booked: true, is_locked: false, locked_until: null })
      .in('id', seatIds);

    if (seatsError) {
      throw new Error('Failed to update seats');
    }

    // Create booking_seats relationships
    const bookingSeats = seatIds.map(seatId => ({
      booking_id: booking.id,
      seat_id: seatId,
    }));

    const { error: bookingSeatsError } = await supabase
      .from('booking_seats')
      .insert(bookingSeats);

    if (bookingSeatsError) {
      throw new Error('Failed to create booking seats');
    }

    return { ...booking, per_seat_price: perSeatPrice };
  }

  async initiatePayment(bookingId: string, amount: number) {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("[Mock]: initiatePayment called", { bookingId, amount, transactionId });

    // Simulate payment creation in the DB
    const { data, error } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount,
        payment_method: 'card',
        transaction_id: transactionId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[Mock] Failed to initiate payment:', error);
      // Still return a payment object for mocking success
      return {
        booking_id: bookingId,
        amount,
        payment_method: 'card',
        transaction_id: transactionId,
        status: 'pending',
        id: null,
        created_at: new Date().toISOString(),
      };
    }

    console.log("[Mock]: Payment initiated (pending), moving to confirmed.");
    return data;
  }

  async confirmPayment(transactionId: string, _status: 'pending' | 'completed' | 'failed' | 'refunded') {
    // Always set as completed regardless of input (pure mock)
    const status: 'completed' = 'completed';
    console.log('[Mock]: confirmPayment called for', transactionId, 'setting status to', status);

    // Attempt update but ignore error as this is a pure mock
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('[Mock] Error in confirmPayment, but still returning completed:', error);
      // Still return a payment object for mocking success
      return {
        transaction_id: transactionId,
        status,
        id: null,
        created_at: new Date().toISOString(),
      };
    }

    // Update bookings table to confirmed (payment_id = transactionId)
    if (payment && payment.booking_id) {
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_id: transactionId
        })
        .eq('id', payment.booking_id);
    }
    console.log('[Mock]: Payment successfully confirmed');
    return payment;
  }

  async getUserBookings(userId: string) {
    // Fetch bookings for a user, including show and seat detail relationships
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        show:shows(*, movie:movies(*), theatre:theatres(*)),
        booking_seats(
          seat:seats(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch user bookings:', error);
      throw new Error(`Failed to fetch user bookings: ${error.message}`);
    }

    return data || [];
  }
}

export const supabaseApiService = new SupabaseApiService();
