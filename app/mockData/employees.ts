import { Startup } from '@prisma/client';
import { FullEmployee } from 'types/employee';

// compte principal pour se connecter
export const accountManager: FullEmployee = {
  id: 'sourcien@hubvisory.com',
  email: 'sourcien@hubvisory.com',
  luccaID: 3,
  name: 'Sourcien Hubvisory',
  position: 'Account Executive',
  manager: null,
  managerId: null,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.source,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const accountManager2: FullEmployee = {
  id: 'scott.knowles@hubvisory.com',
  email: 'scott.knowles@hubvisory.com',
  luccaID: 4,
  name: 'Scott Knowles',
  position: 'Account Executive',
  manager: null,
  managerId: null,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.central,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const ceo: FullEmployee = {
  id: 'roger.buno@hubvisory.com',
  email: 'roger.buno@hubvisory.com',
  luccaID: 15,
  name: 'Roger Buno',
  position: 'VP',
  manager: null,
  managerId: null,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const ceo2: FullEmployee = {
  id: 'may.sito@hubvisory.com',
  email: 'may.busitono@hubvisory.com',
  luccaID: 15,
  name: 'May Sito',
  position: 'VP',
  manager: null,
  managerId: null,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.source,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const manager: FullEmployee = {
  id: 'scott.johnson@hubvisory.com',
  email: 'scott.johnson@hubvisory.com',
  luccaID: 1,
  name: 'Scott Johnson',
  position: 'Design Team Manager',
  manager: ceo,
  managerId: ceo.id,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const manager2: FullEmployee = {
  id: 'emily.barnes@hubvisory.com',
  email: 'emily.barnes@hubvisory.com',
  luccaID: 2,
  name: 'Emily Barnes',
  position: 'Tech Team Manager',
  manager: ceo2,
  managerId: ceo2.id,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.source,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const manager3: FullEmployee = {
  id: 'billy.damone@hubvisory.com',
  email: 'billy.damone@hubvisory.com',
  luccaID: 1,
  name: 'Billy Damone',
  position: 'Design Team Manager',
  manager: ceo,
  managerId: ceo.id,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const manager4: FullEmployee = {
  id: 'mark.delon@hubvisory.com',
  email: 'mark.delon@hubvisory.com',
  luccaID: 2,
  name: 'Mark Delon',
  position: 'Product Team Manager',
  manager: ceo,
  managerId: ceo.id,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const consultant: FullEmployee = {
  id: 'john.doe@hubvisory.com',
  email: 'john.doe@hubvisory.com',
  luccaID: 5,
  name: 'John Doe',
  position: 'Consultant',
  manager: manager,
  managerId: manager.email,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const consultant2: FullEmployee = {
  id: 'elliot.alderson@hubvisory.com',
  email: 'elliot.alderson@hubvisory.com',
  luccaID: 6,
  name: 'Elliot Alderson',
  position: 'Consultant',
  manager: manager,
  managerId: manager.email,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.source,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const consultant3: FullEmployee = {
  id: 'theo.laterre@hubvisory.com',
  email: 'theo.laterre@hubvisory.com',
  luccaID: 7,
  name: 'Théo Laterre',
  position: 'Consultant',
  manager: manager2,
  managerId: manager2.email,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.campus,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const consultant4: FullEmployee = {
  id: 'celia.marven@hubvisory.com',
  email: 'celia.marven@hubvisory.com',
  luccaID: 8,
  name: 'Celia Marven',
  position: 'Consultant',
  manager: manager2,
  managerId: manager2.email,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.source,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const consultant5: FullEmployee = {
  id: 'bob.salsa@hubvisory.com',
  email: 'bob.salsa@hubvisory.com',
  luccaID: 9,
  name: 'Bob Salsa',
  position: 'Consultant',
  manager: manager3,
  managerId: manager3.email,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const consultant6: FullEmployee = {
  id: 'manuel.durion@hubvisory.com',
  email: 'manuel.durion@hubvisory.com',
  luccaID: 10,
  name: 'Manuel Durion',
  position: 'Consultant',
  manager: manager3,
  managerId: manager3.email,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const consultant7: FullEmployee = {
  id: 'karen.simons@hubvisory.com',
  email: 'karen.simons@hubvisory.com',
  luccaID: 11,
  name: 'Karen Simons',
  position: 'Consultant',
  manager: manager4,
  managerId: manager4.email,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const consultant8: FullEmployee = {
  id: 'laura.lita@hubvisory.com',
  email: 'laura.lita@hubvisory.com',
  luccaID: 12,
  name: 'Laura Lita',
  position: 'Consultant',
  manager: manager4,
  managerId: manager4.email,
  pictureURL: '/images/hubvisor.svg',
  startup: Startup.epic,
  contractStartDate: new Date('2022-12-01'),
  contractEndDate: null,
};

export const manyAccountManagers: FullEmployee[] = [accountManager, accountManager2];
export const manyVPs: FullEmployee[] = [ceo, ceo2];
export const manyManagers: FullEmployee[] = [manager, manager2, manager3, manager4];
export const manyConsultants: FullEmployee[] = [
  consultant,
  consultant2,
  consultant3,
  consultant4,
  consultant5,
  consultant6,
  consultant7,
  consultant8,
];
export const manyEmployees: FullEmployee[] = [
  ...manyConsultants,
  ...manyManagers,
  ...manyAccountManagers,
  ...manyVPs,
];
