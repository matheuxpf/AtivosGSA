import { Asset, AssetCondition, AssetStatus, AssetType, Channel, Employee, Movement, OwnerType, Region, Team, Role } from './types';

export const MOCK_TEAMS: Team[] = [
  { id: 'T001', name: 'Equipe Vendas GO-Sul', region: Region.GO, channel: Channel.CV, leaderId: 'E006' },
  { id: 'T002', name: 'Equipe Key Account MT', region: Region.MT, channel: Channel.KEY_ACCOUNT, leaderId: 'E002' },
  { id: 'T003', name: 'TI Matriz', region: Region.GO, channel: Channel.ADMIN, leaderId: 'E004' },
  { id: 'T004', name: 'Representantes SP', region: Region.INDIRETO, channel: Channel.ATACADO, leaderId: 'E007' },
];

export const MOCK_ROLES: Role[] = [
  { id: 'R001', code: 'VEND-GO-01', description: 'Vendedor Externo Rota 1', region: Region.GO, teamId: 'T001', status: 'ATIVA' },
  { id: 'R002', code: 'SUP-MT-01', description: 'Supervisor Regional MT', region: Region.MT, teamId: 'T002', status: 'ATIVA' },
];

export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'E001', name: 'João Silva', role: 'Vendedor Externo', region: Region.GO, teamId: 'T001', active: true },
  { id: 'E002', name: 'Maria Santos', role: 'Gerente Regional', region: Region.MT, teamId: 'T002', active: true },
  { id: 'E003', name: 'Carlos Oliveira', role: 'Supervisor Merchan', region: Region.TO, active: true }, // No team yet
  { id: 'E004', name: 'Ana Costa', role: 'Gerente TI', region: Region.GO, teamId: 'T003', active: true },
  { id: 'E005', name: 'Pedro Souza', role: 'Auxiliar Admin', region: Region.GO, teamId: 'T003', active: true },
  { id: 'E006', name: 'Roberto Lima', role: 'Supervisor Vendas', region: Region.GO, teamId: 'T001', active: true },
  { id: 'E007', name: 'Fernanda Indireta', role: 'Gerente Contas', region: Region.INDIRETO, teamId: 'T004', active: true },
];

export const STOCK_OWNER_ID = 'TI_STOCK';
export const STOCK_OWNER_NAME = 'Estoque TI';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'A001',
    type: AssetType.NOTEBOOK,
    brand: 'Dell',
    model: 'Latitude 3420',
    tagPatrimonio: 'GSA-NT-0501',
    serialNumber: '8H2K92',
    status: AssetStatus.EM_USO,
    condition: AssetCondition.BOM,
    currentOwnerType: OwnerType.FUNCIONARIO,
    currentOwnerId: 'E004',
    currentOwnerName: 'Ana Costa',
    region: Region.GO,
    specs: 'i5 11th, 16GB, 512SSD'
  },
  {
    id: 'A002',
    type: AssetType.CELULAR,
    brand: 'Samsung',
    model: 'Galaxy A32',
    imei1: '356987000123456',
    status: AssetStatus.EM_USO,
    condition: AssetCondition.REGULAR,
    currentOwnerType: OwnerType.FUNCIONARIO,
    currentOwnerId: 'E001',
    currentOwnerName: 'João Silva',
    region: Region.GO,
  },
  {
    id: 'A003',
    type: AssetType.CELULAR,
    brand: 'Samsung',
    model: 'Galaxy A54',
    imei1: '359999000888777',
    status: AssetStatus.EM_ESTOQUE,
    condition: AssetCondition.NOVO,
    currentOwnerType: OwnerType.ESTOQUE,
    currentOwnerId: STOCK_OWNER_ID,
    currentOwnerName: STOCK_OWNER_NAME,
    region: Region.GO,
  },
  {
    id: 'A004',
    type: AssetType.NOTEBOOK,
    brand: 'Lenovo',
    model: 'Thinkpad E14',
    tagPatrimonio: 'GSA-NT-0502',
    serialNumber: 'LNV-9988',
    status: AssetStatus.EM_MANUTENCAO,
    condition: AssetCondition.RUIM,
    currentOwnerType: OwnerType.MANUTENCAO,
    currentOwnerId: 'EXT_TECH',
    currentOwnerName: 'Assistência Técnica Externa',
    region: Region.GO,
  },
   {
    id: 'A005',
    type: AssetType.TABLET,
    brand: 'Samsung',
    model: 'Tab A7',
    tagPatrimonio: 'GSA-TB-0100',
    serialNumber: 'TAB-123',
    status: AssetStatus.EM_USO,
    condition: AssetCondition.BOM,
    currentOwnerType: OwnerType.FUNCIONARIO,
    currentOwnerId: 'E003',
    currentOwnerName: 'Carlos Oliveira',
    region: Region.TO,
  }
];

export const INITIAL_MOVEMENTS: Movement[] = [
  {
    id: 'M001',
    assetId: 'A001',
    date: '2023-10-01T09:00:00Z',
    fromOwnerType: OwnerType.ESTOQUE,
    fromOwnerId: STOCK_OWNER_ID,
    fromOwnerName: STOCK_OWNER_NAME,
    toOwnerType: OwnerType.FUNCIONARIO,
    toOwnerId: 'E004',
    toOwnerName: 'Ana Costa',
    reason: 'Admissão',
    registeredBy: 'Admin'
  },
  {
    id: 'M002',
    assetId: 'A002',
    date: '2023-11-15T14:30:00Z',
    fromOwnerType: OwnerType.ESTOQUE,
    fromOwnerId: STOCK_OWNER_ID,
    fromOwnerName: STOCK_OWNER_NAME,
    toOwnerType: OwnerType.FUNCIONARIO,
    toOwnerId: 'E001',
    toOwnerName: 'João Silva',
    reason: 'Troca de Aparelho',
    registeredBy: 'Admin'
  },
  {
    id: 'M003',
    assetId: 'A004',
    date: '2024-01-10T10:00:00Z',
    fromOwnerType: OwnerType.FUNCIONARIO,
    fromOwnerId: 'E002',
    fromOwnerName: 'Maria Santos',
    toOwnerType: OwnerType.MANUTENCAO,
    toOwnerId: 'EXT_TECH',
    toOwnerName: 'Assistência Técnica Externa',
    reason: 'Tela quebrada',
    observations: 'Queda acidental durante visita',
    registeredBy: 'Ana Costa'
  }
];