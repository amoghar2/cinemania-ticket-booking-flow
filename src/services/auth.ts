
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

export class AuthService {
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
}

export const authService = new AuthService();
