
from datetime import datetime, timedelta
from typing import Dict, List, Set
import threading

class InMemorySeatLock:
    """
    In-memory seat locking system for development/testing.
    In production, use database-based locking or Redis.
    """
    
    def __init__(self):
        self.locks: Dict[str, datetime] = {}  # seat_id -> expiry_time
        self.lock = threading.Lock()
    
    def lock_seats(self, show_id: int, seat_ids: List[int], user_session: str, lock_duration_minutes: int = 5) -> bool:
        """Lock seats for a user session"""
        with self.lock:
            current_time = datetime.utcnow()
            expiry_time = current_time + timedelta(minutes=lock_duration_minutes)
            
            # Check if any seats are already locked
            for seat_id in seat_ids:
                lock_key = f"{show_id}:{seat_id}"
                if lock_key in self.locks and self.locks[lock_key] > current_time:
                    return False  # Seat is already locked
            
            # Lock all seats
            for seat_id in seat_ids:
                lock_key = f"{show_id}:{seat_id}"
                self.locks[lock_key] = expiry_time
            
            return True
    
    def is_seat_locked(self, show_id: int, seat_id: int) -> bool:
        """Check if a seat is currently locked"""
        with self.lock:
            lock_key = f"{show_id}:{seat_id}"
            if lock_key in self.locks:
                if self.locks[lock_key] > datetime.utcnow():
                    return True
                else:
                    # Remove expired lock
                    del self.locks[lock_key]
            return False
    
    def release_seats(self, show_id: int, seat_ids: List[int]):
        """Release locked seats"""
        with self.lock:
            for seat_id in seat_ids:
                lock_key = f"{show_id}:{seat_id}"
                if lock_key in self.locks:
                    del self.locks[lock_key]
    
    def cleanup_expired_locks(self):
        """Remove all expired locks"""
        with self.lock:
            current_time = datetime.utcnow()
            expired_keys = [key for key, expiry in self.locks.items() if expiry <= current_time]
            for key in expired_keys:
                del self.locks[key]

# Global instance for the application
seat_lock_manager = InMemorySeatLock()
