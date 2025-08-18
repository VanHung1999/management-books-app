import { DonationRecord } from "../interface/donationRecord";

const DONATION_RECORDS_STORAGE_KEY = 'donation-records-data';

export const createDonationRecord = (donationRecord: Omit<DonationRecord, 'id' | 'donationDate' | 'status'>) => {
    if (typeof window !== 'undefined') {
        try {
            const existingDonationRecords = localStorage.getItem(DONATION_RECORDS_STORAGE_KEY);
            const donationRecords = existingDonationRecords ? JSON.parse(existingDonationRecords) : [];
        }
    }
};

export const getDonationRecords = (): DonationRecord[] => {
    if (typeof window !== 'undefined') {
        try {
            const donationRecords = localStorage.getItem(DONATION_RECORDS_STORAGE_KEY);
            return donationRecords ? JSON.parse(donationRecords) : [];
        }
    }
}