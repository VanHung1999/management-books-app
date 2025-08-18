import { DonationRecord } from "../interface/donationRecord";

const DONATION_RECORDS_STORAGE_KEY = 'donation-records-data';

export const createDonationRecord = (donationRecord: Omit<DonationRecord, 'id' | 'donationDate' | 'status'>) => {
    if (typeof window !== 'undefined') {
        try {
            const existingDonationRecords = localStorage.getItem(DONATION_RECORDS_STORAGE_KEY);
            const donationRecords = existingDonationRecords ? JSON.parse(existingDonationRecords) : [];
            const newDonationRecord = {
                ...donationRecord,
                id: String(donationRecords.length + 1),
                donationDate: new Date(),
                status: 'pending'
            };
            donationRecords.push(newDonationRecord);
            localStorage.setItem(DONATION_RECORDS_STORAGE_KEY, JSON.stringify(donationRecords));
        } catch (error) {
            throw new Error('Error creating donation record: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
};

export const getDonationRecords = (): DonationRecord[] => {
    if (typeof window !== 'undefined') {
        try {
            const donationRecords = localStorage.getItem(DONATION_RECORDS_STORAGE_KEY);
            return donationRecords ? JSON.parse(donationRecords) : [];
        } catch (error) {
            throw new Error('Error getting donation records: ' + (error instanceof Error ? error.message : String(error)));
        }
    }
    return [];
};

export const getDonationRecordById = (id: string): DonationRecord | null => {
    const donationRecords = getDonationRecords();
    return donationRecords.find((donationRecord) => donationRecord.id === id) || null;
};

export const updateDonationRecord = (id: string, updates: Partial<DonationRecord>) => {
    const donationRecords = getDonationRecords();
    const index = donationRecords.findIndex((donationRecord) => donationRecord.id === id);
    if (index !== -1) {
        donationRecords[index] = { ...donationRecords[index], ...updates };
        localStorage.setItem(DONATION_RECORDS_STORAGE_KEY, JSON.stringify(donationRecords));
    }
};

export const deleteDonationRecord = (id: string) => {
    const donationRecords = getDonationRecords();
    const index = donationRecords.findIndex((donationRecord) => donationRecord.id === id);
    if (index !== -1) {
        donationRecords.splice(index, 1);
        localStorage.setItem(DONATION_RECORDS_STORAGE_KEY, JSON.stringify(donationRecords));
    }
};
