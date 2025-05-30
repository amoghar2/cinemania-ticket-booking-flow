
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, theatre, showtime, selectedDate, selectedSeats, totalAmount } = location.state || {};
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePayment = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill all required fields');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const bookingId = 'BK' + Date.now().toString().slice(-6);
      navigate(`/confirmation/${bookingId}`, {
        state: {
          movie,
          theatre,
          showtime,
          selectedDate,
          selectedSeats,
          totalAmount: totalAmount + Math.round(totalAmount * 0.1),
          userDetails: formData,
          bookingId
        }
      });
    }, 2000);
  };

  if (!movie || !selectedSeats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid booking details</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const finalAmount = totalAmount + Math.round(totalAmount * 0.1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Seat Selection
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Details */}
          <div>
            <Card className="mb-6">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{movie.title}</h3>
                  <p className="text-gray-600">{movie.genre} • {movie.duration}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Theatre</h4>
                  <p>{theatre.name}</p>
                  <p className="text-gray-600">{theatre.location}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Date</h4>
                    <p>{selectedDate}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Time</h4>
                    <p>{showtime.time}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Selected Seats</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeats.map(seat => (
                      <Badge key={seat.id} variant="outline">{seat.id}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Details Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Ticket Price ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenience Fee</span>
                    <span>₹{Math.round(totalAmount * 0.1)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount</span>
                    <span>₹{finalAmount}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Tickets are non-refundable</li>
                    <li>• Please arrive 15 minutes before showtime</li>
                    <li>• Carry a valid ID for verification</li>
                  </ul>
                </div>

                <Button 
                  className="w-full h-12 text-lg"
                  onClick={handlePayment}
                  disabled={isProcessing || !formData.name || !formData.email || !formData.phone}
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Pay ₹{finalAmount}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By proceeding, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
