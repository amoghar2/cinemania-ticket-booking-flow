
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import MovieDetails from "./pages/MovieDetails";
import Showtime from "./pages/Showtime";
import Booking from "./pages/Booking";
import BookingConfirmation from "./pages/BookingConfirmation";
import UserBookings from "./pages/UserBookings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/showtime/:movieId/:theatreId/:showtime" element={<Showtime />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="/my-bookings" element={<UserBookings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
