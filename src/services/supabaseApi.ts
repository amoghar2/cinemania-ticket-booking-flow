
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
    
    let query = supabase
      .from('movies')
      .select(`
        *,
        shows!inner(
          theatre:theatres!inner(city)
        )
      `)
      .order('title');

    if (city) {
      query = query.eq('shows.theatre.city', city);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch movies:', error);
      throw new Error(`Failed to fetch movies: ${error.message}`);
    }

    // Remove duplicates by movie id
    const uniqueMovies = data?.reduce((acc: any[], movie: any) => {
      if (!acc.find(m => m.id === movie.id)) {
        acc.push(movie);
      }
      return acc;
    }, []) || [];

    console.log('Successfully fetched movies:', uniqueMovies?.length || 0);
    return uniqueMovies;
  }

  async getMovie(movieId: string) {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', movieId)
      .single();

    if (error) {
      console.error('Failed to fetch movie:', error);
      throw new Error(`Failed to fetch movie: ${error.message}`);
    }

    return data;
  }

  async getMovieShows(movieId: string, city?: string, date?: string) {
    let query = supabase
      .from('shows')
      .select(`
        *,
        movie:movies(*),
        theatre:theatres(*)
      `)
      .eq('movie_id', movieId);

    if (city) {
      query = query.eq('theatre.city', city);
    }

    if (date) {
      query = query.eq('show_date', date);
    }

    const { data, error } = await query.order('show_date').order('show_time');

    if (error) {
      console.error('Failed to fetch movie shows:', error);
      throw new Error(`Failed to fetch movie shows: ${error.message}`);
    }

    return data || [];
  }

  async getShowSeats(showId: string) {
    const { data, error } = await supabase
      .from('seats')
      .select('*')
      .eq('show_id', showId)
      .order('row_letter')
      .order('seat_number');

    if (error) {
      console.error('Failed to fetch show seats:', error);
      throw new Error(`Failed to fetch show seats: ${error.message}`);
    }

    return data || [];
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

    const totalAmount = show.price * seatIds.length;

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

    return booking;
  }

  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        show:shows(*),
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

  async initiatePayment(bookingId: string, amount: number) {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
      console.error('Failed to initiate payment:', error);
      throw new Error(`Failed to initiate payment: ${error.message}`);
    }

    return data;
  }

  async confirmPayment(transactionId: string, status: 'pending' | 'completed' | 'failed' | 'refunded') {
    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('transaction_id', transactionId)
      .select()
      .single();

    if (error) {
      console.error('Failed to confirm payment:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }

    // Update booking status
    if (status === 'completed') {
      await supabase
        .from('bookings')
        .update({ 
          status: 'confirmed',
          payment_id: transactionId 
        })
        .eq('id', payment.booking_id);
    }

    return payment;
  }
}

export const supabaseApiService = new SupabaseApiService();
