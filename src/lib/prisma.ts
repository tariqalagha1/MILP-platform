// Mock Prisma client for development without database
// In production, this would connect to a real PostgreSQL database

const mockClaims: any[] = [];
const mockPatients: any[] = [];
const mockAppointments: any[] = [];

export const prisma = {
  claim: {
    findMany: async ({ where, orderBy, take, include, select }: any) => {
      let results = [...mockClaims];
      if (where?.branchId) results = results.filter(c => c.branchId === where.branchId);
      if (where?.status) results = results.filter(c => c.status === where.status);
      if (orderBy?.submittedAt === 'desc') results.reverse();
      if (orderBy?.createdAt === 'desc') results.reverse();
      let finalResults = take ? results.slice(0, take) : results;
      // If select is specified, filter fields
      if (select) {
        finalResults = finalResults.map((claim: any) => {
          const filtered: any = {};
          Object.keys(select).forEach(key => {
            if (claim[key] !== undefined) {
              filtered[key] = claim[key];
            }
          });
          return filtered;
        });
      }
      return finalResults;
    },
    create: async ({ data }: any) => {
      const claim = { 
        ...data, 
        id: `claim-${Date.now()}`, 
        createdAt: new Date(), 
        updatedAt: new Date(),
        rejectionRisk: data.rejectionRisk ?? 0,
        missingFields: data.missingFields ?? [],
      };
      mockClaims.push(claim);
      return claim;
    },
    update: async ({ where, data }: any) => {
      const index = mockClaims.findIndex(c => c.id === where.id);
      if (index === -1) throw new Error('Claim not found');
      mockClaims[index] = { ...mockClaims[index], ...data, updatedAt: new Date() };
      return mockClaims[index];
    },
    count: async ({ where }: any) => {
      let count = mockClaims.length;
      if (where?.branchId) count = mockClaims.filter(c => c.branchId === where.branchId).length;
      if (where?.status) count = mockClaims.filter(c => c.status === where.status).length;
      return count;
    },
    groupBy: async ({ by, where }: any) => {
      const groups: any = {};
      mockClaims.forEach(claim => {
        const key = claim[by[0]];
        if (!groups[key]) groups[key] = { [by[0]]: key, _count: { status: 0 }, _sum: { amount: 0 } };
        groups[key]._count.status++;
        groups[key]._sum.amount += claim.amount;
      });
      return Object.values(groups);
    },
    aggregate: async ({ where }: any) => {
      const filtered = where ? mockClaims.filter(c => {
        if (where.branchId && c.branchId !== where.branchId) return false;
        return true;
      }) : mockClaims;
      return {
        _count: { id: filtered.length },
        _sum: { amount: filtered.reduce((sum, c) => sum + c.amount, 0) },
      };
    },
  },
  patient: {
    findMany: async ({ where, orderBy, take, include }: any) => {
      let results = [...mockPatients];
      if (where?.branchId) results = results.filter(p => p.branchId === where.branchId);
      if (where?.nextDueAt?.lt) results = results.filter(p => p.nextDueAt && new Date(p.nextDueAt) < new Date(where.nextDueAt.lt));
      if (where?.noShowRisk?.gt) results = results.filter(p => p.noShowRisk > where.noShowRisk.gt);
      if (orderBy?.nextDueAt === 'asc') results.sort((a, b) => new Date(a.nextDueAt || 0).getTime() - new Date(b.nextDueAt || 0).getTime());
      return take ? results.slice(0, take) : results;
    },
    create: async ({ data }: any) => {
      const patient = { ...data, id: `patient-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
      mockPatients.push(patient);
      return patient;
    },
    count: async ({ where }: any) => {
      let count = mockPatients.length;
      if (where?.branchId) count = mockPatients.filter(p => p.branchId === where.branchId).length;
      if (where?.nextDueAt?.lt) count = mockPatients.filter(p => p.nextDueAt && new Date(p.nextDueAt) < new Date(where.nextDueAt.lt)).length;
      if (where?.noShowRisk?.gt) count = mockPatients.filter(p => p.noShowRisk > where.noShowRisk.gt).length;
      return count;
    },
  },
  appointment: {
    findMany: async ({ where, orderBy, take, include }: any) => {
      let results = [...mockAppointments];
      if (where?.branchId) results = results.filter(a => a.branchId === where.branchId);
      if (where?.status) results = results.filter(a => a.status === where.status);
      if (where?.scheduledAt?.gte) results = results.filter(a => new Date(a.scheduledAt) >= new Date(where.scheduledAt.gte));
      if (orderBy?.scheduledAt === 'desc') results.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
      if (orderBy?.scheduledAt === 'asc') results.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
      return take ? results.slice(0, take) : results;
    },
    create: async ({ data }: any) => {
      const appointment = { ...data, id: `appt-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
      mockAppointments.push(appointment);
      return appointment;
    },
    count: async ({ where }: any) => {
      let count = mockAppointments.length;
      if (where?.branchId) count = mockAppointments.filter(a => a.branchId === where.branchId).length;
      if (where?.status) count = mockAppointments.filter(a => a.status === where.status).length;
      return count;
    },
  },
};

export default prisma
