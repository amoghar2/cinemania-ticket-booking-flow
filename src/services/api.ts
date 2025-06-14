
// Updated API service to use modular Supabase services
import { authService } from './auth';
import { moviesService } from './movies';
import { showsService } from './shows';
import { seatsService } from './seats';
import { bookingsService } from './bookings';
import { paymentsService } from './payments';

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

class ApiService {
  async login(data: LoginData): Promise<LoginResponse> {
    return authService.login(data);
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    return authService.register(data);
  }

  async getCurrentUser() {
    return authService.getCurrentUser();
  }

  async getMovies(city?: string) {
    return moviesService.getMovies(city);
  }

  async getMovie(movieId: string) {
    return moviesService.getMovie(movieId);
  }

  async getMovieShows(movieId: string, city?: string, date?: string) {
    return showsService.getMovieShows(movieId, city, date);
  }

  async getShowSeats(showId: string) {
    return seatsService.getShowSeats(showId);
  }

  async lockSeats(showId: string, seatIds: string[], userSession: string) {
    return seatsService.lockSeats(showId, seatIds, userSession);
  }

  async createBooking(showId: string, seatIds: string[], userEmail: string) {
    return bookingsService.createBooking(showId, seatIds, userEmail);
  }

  async getUserBookings(userId: string) {
    return bookingsService.getUserBookings(userId);
  }

  async initiatePayment(bookingId: string, amount: number) {
    return paymentsService.initiatePayment(bookingId, amount);
  }

  async confirmPayment(transactionId: string, status: 'completed' | 'failed') {
    return paymentsService.confirmPayment(transactionId, status);
  }
}

export const apiService = new ApiService();
