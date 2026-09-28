export interface PlayerResponse {
  id: number;
  teamId: number | null;
  teamName: string | null;
  teamLogoUrl: string | null;
  fullName: string;
  firstName: string;
  lastName: string;
  position: string;
  shirtNumber: string | null;
  batSide: string | null;   // L / R / S
  pitchHand: string | null; // L / R / S
  dateOfBirth: string | null;
  nationality: string | null;
  photoUrl: string | null;
  isActive: boolean;
}