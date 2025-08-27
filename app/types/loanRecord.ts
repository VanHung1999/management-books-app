export interface LoanRecord {
    id: string;
    borrowerName: string;
    bookTitle: string;        
    delivererName?: string;     
    returnConfirmerName?: string;
    quantity: number;         
    borrowedAt: Date;         
    deliveredAt?: Date;        
    receivedAt?: Date;        
    returnedAt?: Date;         
    returnConfirmedAt?: Date;  
    status: "pending" | "delivered" | "received" | "returned" | "completed" | "canceled";
}