export enum Region {
  GO = 'GO',
  TO = 'TO',
  MT = 'MT',
  INDIRETO = 'INDIRETO'
}

export enum Channel {
  CV = 'CV',
  ATACADO = 'ATACADO',
  KEY_ACCOUNT = 'KEY ACCOUNT',
  ADMIN = 'ADMINISTRATIVO',
  LOGISTICA = 'LOGÍSTICA'
}

export enum AssetType {
  NOTEBOOK = 'NOTEBOOK',
  DESKTOP = 'DESKTOP',
  CELULAR = 'CELULAR',
  TABLET = 'TABLET',
  ACESSORIO = 'ACESSÓRIO',
  MONITOR = 'MONITOR'
}

export enum AssetStatus {
  EM_USO = 'EM USO',
  EM_ESTOQUE = 'EM ESTOQUE',
  EM_MANUTENCAO = 'EM MANUTENÇÃO',
  BAIXADO = 'BAIXADO',
  PERDIDO = 'PERDIDO'
}

export enum AssetCondition {
  NOVO = 'NOVO',
  BOM = 'BOM',
  REGULAR = 'REGULAR',
  RUIM = 'RUIM',
  SUCATA = 'SUCATA'
}

export enum OwnerType {
  FUNCIONARIO = 'FUNCIONÁRIO',
  VAGA = 'VAGA',
  EQUIPE = 'EQUIPE',
  ESTOQUE = 'ESTOQUE', // TI Inventory
  MANUTENCAO = 'MANUTENÇÃO' // External or Internal repair
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  region: Region;
  teamId?: string; // Link to Team
  active: boolean;
}

export interface Team {
  id: string;
  name: string;
  region: Region;
  channel: Channel;
  leaderId?: string; // Link to Employee (Supervisor)
}

export interface Role {
  id: string;
  code: string;
  description: string;
  region: Region;
  teamId?: string;
  status: 'ATIVA' | 'INATIVA' | 'VAGA_ABERTA';
}

export interface Asset {
  id: string;
  type: AssetType;
  brand: string;
  model: string;
  tagPatrimonio?: string;
  serialNumber?: string;
  imei1?: string;
  imei2?: string;
  status: AssetStatus;
  condition: AssetCondition;
  currentOwnerType: OwnerType;
  currentOwnerId: string; // Could be Employee ID, "TI_STOCK", etc.
  currentOwnerName: string; // Denormalized for easier display
  region: Region; // Physical location approximation
  specs?: string; // e.g., "i5 8GB 256SSD"
}

export interface Movement {
  id: string;
  assetId: string;
  date: string; // ISO String
  fromOwnerType: OwnerType;
  fromOwnerId: string;
  fromOwnerName: string;
  toOwnerType: OwnerType;
  toOwnerId: string;
  toOwnerName: string;
  reason: string;
  observations?: string;
  registeredBy: string; // User ID
}

export type ViewState = 'DASHBOARD' | 'ASSETS' | 'MOVEMENTS' | 'DETAILS' | 'ADMIN' | 'TEAMS';

// Filter State Interface
export interface AssetFilter {
  search: string;
  type: AssetType | 'ALL';
  status: AssetStatus | 'ALL';
  region: Region | 'ALL';
}