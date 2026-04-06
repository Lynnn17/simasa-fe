// Role code constants
export const ROLE = {
    SUPERADMIN: 'HA01',        // Superadmin
    ORG_ADMIN: 'HA02',         // Admin Organisasi
    SCHOOL_ADMIN: 'HA03',     // Admin Sekolah
    TEACHER: 'HA04',              // Guru
    STUDENT: 'HA05',             // Siswa
} as const;

// Type for role codes
export type Role = typeof ROLE[keyof typeof ROLE];
