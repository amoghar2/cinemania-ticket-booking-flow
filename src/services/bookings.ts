
import { supabase } from "@/integrations/supabase/client";

export class BookingsService {
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

export const bookingsService = new BookingsService();
