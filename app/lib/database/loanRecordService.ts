import { LoanRecord } from "../../types/loanRecord";

export const LOAN_RECORDS_STORAGE_KEY = 'loan-records-data';

export const createLoanRecord = (loanRecord: Omit<LoanRecord, 'id' | 'delivererName' | 'returnConfirmerName' | 'borrowedAt' | 'deliveredAt' | 'receivedAt' | 'returnedAt' | 'returnConfirmedAt' | 'status'>): Promise<LoanRecord | null> => {
    return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined') {
            try {
                const existingLoanRecords = localStorage.getItem(LOAN_RECORDS_STORAGE_KEY);
                const loanRecords = existingLoanRecords ? JSON.parse(existingLoanRecords) : [];

                const newLoanRecord: LoanRecord = {
                    ...loanRecord,
                    id: String(loanRecords.length + 1),
                    borrowedAt: new Date(),
                    status: "pending"
                };

                loanRecords.push(newLoanRecord);
                localStorage.setItem(LOAN_RECORDS_STORAGE_KEY, JSON.stringify(loanRecords));
                resolve(newLoanRecord);
            } catch (error) {
                reject(new Error('Error creating loan record: ' + (error instanceof Error ? error.message : String(error))));
            }
        } else {
            resolve(null);
        }
    });
};

export const getLoanRecords = (): LoanRecord[] => {
    if (typeof window !== 'undefined') {
        try {
            const loanRecords = localStorage.getItem(LOAN_RECORDS_STORAGE_KEY);
            return loanRecords ? JSON.parse(loanRecords) : [];
        } catch (error) {
            throw new Error('Error getting loan records: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    return [];
};

export const getLoanRecordById = (id: string): LoanRecord | null => {
    const loanRecords = getLoanRecords();
    return loanRecords.find((loanRecord) => loanRecord.id === id) || null;
};

export const updateLoanRecord = (id: string, updates: Partial<LoanRecord>): Promise<LoanRecord | null> => {
    return new Promise((resolve, reject) => {
        try {
            const loanRecords = getLoanRecords();
            const index = loanRecords.findIndex((loanRecord) => loanRecord.id === id);
            if (index === -1) {
                reject(new Error(`Loan record not found with id: ${id}`));
                return;
            }
            const updatedRecord = { ...loanRecords[index], ...updates };
            loanRecords[index] = updatedRecord;
            localStorage.setItem(LOAN_RECORDS_STORAGE_KEY, JSON.stringify(loanRecords));
            resolve(updatedRecord);
        } catch (error) {
            reject(new Error('Error updating loan record: ' + (error instanceof Error ? error.message : String(error))));
        }
    });
};

export const deleteLoanRecord = (id: string): Promise<LoanRecord | null> => {
    return new Promise((resolve, reject) => {
        try {
            const loanRecords = getLoanRecords();
            const index = loanRecords.findIndex((loanRecord) => loanRecord.id === id);
            if (index === -1) {
                reject(new Error(`Loan record not found with id: ${id}`));
                return;
            }
            const deletedRecord = loanRecords[index];
            loanRecords.splice(index, 1);
            localStorage.setItem(LOAN_RECORDS_STORAGE_KEY, JSON.stringify(loanRecords));
            resolve(deletedRecord);
        } catch (error) {
            reject(new Error('Error deleting loan record: ' + (error instanceof Error ? error.message : String(error))));
        }
    });
};
