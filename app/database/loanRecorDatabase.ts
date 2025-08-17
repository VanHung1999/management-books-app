import { LoanRecord } from "../interface/loanRecord";

export const LOAN_RECORDS_STORAGE_KEY = 'loan-records-data';

export const createLoanRecord = (loanRecord: Omit<LoanRecord, 'id' | 'delivererName' | 'returnConfirmerName' | 'borrowedAt' | 'deliveredAt' | 'receivedAt' | 'returnedAt' | 'returnConfirmedAt' | 'status'>) => {
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
        } catch (error) {
            throw new Error('Error creating loan record: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
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

export const updateLoanRecord = (id: string, updates: Partial<LoanRecord>) => {
    const loanRecords = getLoanRecords();
    const index = loanRecords.findIndex((loanRecord) => loanRecord.id === id);
    if (index !== -1) {
        loanRecords[index] = { ...loanRecords[index], ...updates };
        localStorage.setItem(LOAN_RECORDS_STORAGE_KEY, JSON.stringify(loanRecords));
    }
};

export const deleteLoanRecord = (id: string) => {
    const loanRecords = getLoanRecords();
    const index = loanRecords.findIndex((loanRecord) => loanRecord.id === id);
    if (index !== -1) {
        loanRecords.splice(index, 1);
        localStorage.setItem(LOAN_RECORDS_STORAGE_KEY, JSON.stringify(loanRecords));
    }
};
