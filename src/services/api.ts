
const API_BASE_URL = 'https://your-api-base-url.com/api';

// API service class to handle all backend calls
export class CinemaAPI {
  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  }

  // 🔍 Movies & Show Listing
  static async getMovies(city?: string) {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    return this.request(`/movies${query}`);
  }

  static async getMovie(movieId: string) {
    return this.request(`/movies/${movieId}`);
  }

  static async getMovieShows(movieId: string, city: string, date: string) {
    return this.request(`/movies/${movieId}/shows?city=${city}&date=${date}`);
  }

  // 🏟️ Theatres & Shows
  static async getTheatres(city: string) {
    return this.request(`/theatres?city=${city}`);
  }

  static async getShow(showId: string) {
    return this.request(`/shows/${showId}`);
  }

  static async getShowSeats(showId: string) {
    return this.request(`/shows/${showId}/seats`);
  }

  // 🎫 Seat Locking & Booking
  static async lockSeats(seatIds: string[], showId: string) {
    return this.request('/seats/lock', {
      method: 'POST',
      body: JSON.stringify({ seatIds, showId })
    });
  }

  static async createBooking(bookingData: {
    showId: string;
    seatIds: string[];
    userId: string;
    userInfo: {
      name: string;
      email: string;
      phone: string;
    };
  }) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  }

  static async getBooking(bookingId: string) {
    return this.request(`/bookings/${bookingId}`);
  }

  // 💰 Payment (Mocked)
  static async initiatePayment(amount: number, bookingId: string) {
    return this.request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ amount, bookingId })
    });
  }

  static async confirmPayment(paymentId: string, success: boolean = true) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentId, success })
    });
  }

  // 👤 User Bookings
  static async getUserBookings(userId: string) {
    return this.request(`/users/${userId}/bookings`);
  }
}

// Helper function to get user ID from Clerk
export const getUserId = (user: any): string => {
  return user?.id || '';
};
