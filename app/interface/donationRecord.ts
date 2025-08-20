  // Donation book interface for users to donate books
export interface DonationRecord {
    id: string;
    donationerName: string;
    confirmerName?: string;
    receiverName?: string;
    bookTitle: string;
    author: string;
    category: string;
    publishYear?: number;
    coverImage?: string;
    description?: string;
    num: number;
    donationDate: Date;
    confirmDate?: Date;
    sendDate?: Date;
    receiveDate?: Date;
    notes?: string;
    hasExist: boolean;
    status: "pending" | "confirmed" | "sent"| "received" | "canceled";
  }