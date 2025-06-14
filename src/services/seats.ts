
import { supabase } from "@/integrations/supabase/client";

export class SeatsService {
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
}

export const seatsService = new SeatsService();
