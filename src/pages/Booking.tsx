
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Film, MapPin, Clock, Users, CreditCard, User as UserIcon } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const bookingData = location.state;

  const [contactInfo, setContactInfo] = useState({
    email: user?.email || '',
    phone: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);

  if (!bookingData) {
    navigate('/');
    return null;
  }

  const convenientFee = Math.round(bookingData.totalAmount * 0.1);
  const finalAmount = bookingData.totalAmount + convenientFee;

  const handlePayment = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Creating booking with data:', {
        showId: bookingData.showId,
        selectedSeats: bookingData.selectedSeats,
        email: contactInfo.email
      });

      // Create booking
      const booking = await apiService.createBooking(
        bookingData.showId,
        bookingData.selectedSeats.map((seat: any) => seat.id),
        contactInfo.email
      );

      console.log('Booking created:', booking);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create payment record
      const payment = await apiService.initiatePayment(booking.id, finalAmount);
      console.log('Payment initiated:', payment);
      
      // Confirm payment with 'completed' status
      await apiService.confirmPayment(payment.transaction_id, 'completed');
      console.log('Payment confirmed as completed');
      
      // Show success toast
      toast({
        title: "Payment Successful!",
        description: "Your booking has been confirmed. Redirecting to confirmation page...",
        variant: "default",
      });

      // Navigate to confirmation page with all details
      setTimeout(() => {
        navigate('/booking-confirmation', {
          state: {
            movie: bookingData.movie,
            theatre: bookingData.theatre,
            showtime: bookingData.show,
            selectedDate: bookingData.selectedDate,
            selectedSeats: bookingData.selectedSeats,
            totalAmount: finalAmount,
            userDetails: {
              name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email,
              email: contactInfo.email,
              phone: contactInfo.phone
            },
            bookingId: booking.id,
            paymentId: payment.transaction_id
          }
        });
      }, 1500);
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const BookingContent = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Film className="h-5 w-5" />
                  <span>Booking Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img 
                    src={bookingData.movie.poster_url} 
                    alt={bookingData.movie.title}
                    className="w-20 h-28 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://picsum.photos/80/112?random=' + bookingData.movie.id;
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{bookingData.movie.title}</h3>
                    <p className="text-gray-600">{bookingData.movie.genre} | {bookingData.movie.duration} mins</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{bookingData.theatre.name}, {bookingData.city}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{bookingData.selectedDate} at {bookingData.show.show_time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {bookingData.selectedSeats.map((seat: any) => (
                            <Badge key={seat.id} variant="outline" className="text-xs">
                              {seat.row_letter}{seat.seat_number}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5" />
                  <span>Contact Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tickets ({bookingData.selectedSeats.length})</span>
                    <span>₹{bookingData.totalAmount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span>₹{convenientFee}</span>
                  </div>
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="text-green-600">₹{finalAmount}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing || !contactInfo.email || !contactInfo.phone}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ₹{finalAmount}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By proceeding, you agree to our terms and conditions. 
                  This is a demo payment - no actual payment will be processed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <BookingContent />
    </ProtectedRoute>
  );
};

export default Booking;
