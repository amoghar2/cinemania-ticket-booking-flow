
// Updated API service to use Supabase instead of FastAPI backend
import { supabaseApiService } from './supabaseApi';

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
    return supabaseApiService.login(data);
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    return supabaseApiService.register(data);
  }

  async getCurrentUser() {
    return supabaseApiService.getCurrentUser();
  }

  async getMovies() {
    return supabaseApiService.getMovies();
  }

  async getMovie(movieId: string) {
    return supabaseApiService.getMovie(movieId);
  }

  async getMovieShows(movieId: string, city?: string, date?: string) {
    return supabaseApiService.getMovieShows(movieId, city, date);
  }

  async getShowSeats(showId: string) {
    return supabaseApiService.getShowSeats(showId);
  }

  async lockSeats(showId: string, seatIds: string[], userSession: string) {
    return supabaseApiService.lockSeats(showId, seatIds, userSession);
  }

  async createBooking(showId: string, seatIds: string[], userEmail: string) {
    return supabaseApiService.createBooking(showId, seatIds, userEmail);
  }

  async getUserBookings(userId: string) {
    return supabaseApiService.getUserBookings(userId);
  }

  async initiatePayment(bookingId: string, amount: number) {
    return supabaseApiService.initiatePayment(bookingId, amount);
  }

  async confirmPayment(transactionId: string, status: 'completed' | 'failed') {
    return supabaseApiService.confirmPayment(transactionId, status);
  }
}

export const apiService = new ApiService();
