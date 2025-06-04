const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal ? 'http://localhost:8000/api' : 'http://localhost:8000/api';

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
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
  private getHeaders(includeAuth = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(data: LoginData): Promise<LoginResponse> {
    console.log('Attempting login with API URL:', `${API_BASE_URL}/users/login`);
    
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Login successful');
    return result;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    console.log('Attempting registration with API URL:', `${API_BASE_URL}/users/register`);
    
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Registration failed:', response.status, errorText);
      throw new Error(`Registration failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('Registration successful');
    return result;
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  async getMovies() {
    console.log('Fetching movies from:', `${API_BASE_URL}/movies`);
    
    const response = await fetch(`${API_BASE_URL}/movies`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch movies:', response.status, errorText);
      throw new Error(`Failed to fetch movies: ${response.status}`);
    }

    const result = await response.json();
    console.log('Successfully fetched movies:', result.length);
    return result;
  }

  async getMovie(movieId: string) {
    const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movie');
    }

    return response.json();
  }

  async getMovieShows(movieId: string, city?: string, date?: string) {
    const params = new URLSearchParams();
    if (city) params.append('city', city);
    if (date) params.append('date', date);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/movies/${movieId}/shows${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch movie shows');
    }

    return response.json();
  }

  async getShowSeats(showId: string) {
    const response = await fetch(`${API_BASE_URL}/shows/${showId}/seats`, {
      headers: this.getHeaders(false),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch show seats');
    }

    return response.json();
  }

  async lockSeats(showId: string, seatIds: number[], userSession: string) {
    const response = await fetch(`${API_BASE_URL}/seats/lock`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({
        show_id: showId,
        seat_ids: seatIds,
        user_session: userSession,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to lock seats');
    }

    return response.json();
  }

  async createBooking(showId: string, seatIds: number[], userEmail: string) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        show_id: showId,
        seat_ids: seatIds,
        user_email: userEmail,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create booking');
    }

    return response.json();
  }

  async getUserBookings(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/bookings`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user bookings');
    }

    return response.json();
  }

  async initiatePayment(bookingId: number, amount: number) {
    const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        booking_id: bookingId,
        amount,
        payment_method: 'card',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate payment');
    }

    return response.json();
  }

  async confirmPayment(transactionId: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        transaction_id: transactionId,
        status,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    return response.json();
  }
}

export const apiService = new ApiService();
