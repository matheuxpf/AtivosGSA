import React, { useState } from 'react';
import { Asset, AssetCondition, AssetStatus, AssetType, Channel, Employee, OwnerType, Region, Team, Role } from '../types';
import { PlusCircle, Users, Briefcase, Monitor, Trash2, Edit, Save, X, MapPin } from 'lucide-react';
import { STOCK_OWNER_ID, STOCK_OWNER_NAME } from '../constants';

interface AdminPanelProps {
  assets: Asset[];
  employees: Employee[];
  teams: Team[];
  roles: Role[];
  
  onAddAsset: (asset: Asset) => void;
  onUpdateAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;

  onAddEmployee: (employee: Employee) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;

  onAddTeam: (team: Team) => void;
  onUpdateTeam: (team: Team) => void;
  onDeleteTeam: (id: string) => void;

  onAddRole: (role: Role) => void;
  onUpdateRole: (role: Role) => void;
  onDeleteRole: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  assets, employees, teams, roles,
  onAddAsset, onUpdateAsset, onDeleteAsset,
  onAddEmployee, onUpdateEmployee, onDeleteEmployee,
  onAddTeam, onUpdateTeam, onDeleteTeam,
  onAddRole, onUpdateRole, onDeleteRole
}) => {
  const [activeTab, setActiveTab] = useState<'ASSETS' | 'EMPLOYEES' | 'TEAMS' | 'ROLES'>('ASSETS');
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<any>({});

  const startCreate = () => {
    setIsEditing(true);
    if (activeTab === 'ASSETS') setFormState({ type: AssetType.NOTEBOOK, status: AssetStatus.EM_ESTOQUE, condition: AssetCondition.NOVO, region: Region.GO });
    if (activeTab === 'EMPLOYEES') setFormState({ region: Region.GO, active: true });
    if (activeTab === 'TEAMS') setFormState({ region: Region.GO, channel: Channel.CV });
    if (activeTab === 'ROLES') setFormState({ region: Region.GO, status: 'VAGA_ABERTA' });
  };

  const startEdit = (item: any) => {
    setFormState({...item});
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormState({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // IMPORTANTE: Removemos a geração manual de IDs (ex: id: Date.now())
    // para que o Supabase gere UUIDs automaticamente conforme o SQL executado.

    if (activeTab === 'ASSETS') {
      if (formState.id) {
        onUpdateAsset(formState as Asset);
      } else {
        onAddAsset({ 
          ...formState, 
          currentOwnerType: OwnerType.ESTOQUE, 
          currentOwnerId: STOCK_OWNER_ID, 
          currentOwnerName: STOCK_OWNER_NAME 
        } as Asset);
      }
    }

    if (activeTab === 'EMPLOYEES') {
      if (formState.id) onUpdateEmployee(formState as Employee);
      else onAddEmployee(formState as Employee);
    }

    if (activeTab === 'TEAMS') {
      if (formState.id) onUpdateTeam(formState as Team);
      else onAddTeam(formState as Team);
    }

    if (activeTab === 'ROLES') {
      if (formState.id) onUpdateRole(formState as Role);
      else onAddRole(formState as Role);
    }

    setIsEditing(false);
    setFormState({});
  };

  const TabButton = ({ tab, label, icon: Icon }: any) => (
    <button
      type="button"
      onClick={() => { setActiveTab(tab); cancelEdit(); }}
      className={`flex items-center px-6 py-3 border-b-2 font-medium transition-colors ${
        activeTab === tab
          ? 'border-gsa-green text-gsa-green'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      <Icon size={18} className="mr-2" />
      {label}
    </button>
  );

  const InputClass = "w-full border-slate-300 rounded-lg shadow-sm focus:ring-gsa-green focus:border-gsa-green p-2 border mt-1 bg-white text-slate-900";
  const LabelClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
        <div className="border-b border-slate-200 flex overflow-x-auto">
          <TabButton tab="ASSETS" label="Gerenciar Ativos" icon={Monitor} />
          <TabButton tab="EMPLOYEES" label="Gerenciar Funcionários" icon={Users} />
          <TabButton tab="TEAMS" label="Gerenciar Equipes" icon={Briefcase} />
          <TabButton tab="ROLES" label="Gerenciar Vagas" icon={MapPin} />
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {!isEditing && (
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {activeTab === 'ASSETS' && 'Lista de Ativos'}
                {activeTab === 'EMPLOYEES' && 'Lista de Funcionários'}
                {activeTab === 'TEAMS' && 'Lista de Equipes'}
                {activeTab === 'ROLES' && 'Lista de Vagas'}
              </h2>
              <button 
                type="button"
                onClick={startCreate}
                className="bg-gsa-blue text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
              >
                <PlusCircle size={18} className="mr-2" />
                Adicionar Novo
              </button>
            </div>
          )}

          {isEditing && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800">{formState.id ? 'Editar Item' : 'Criar Novo Item'}</h3>
                 <button type="button" onClick={cancelEdit} className="text-slate-500 hover:text-slate-700"><X size={24}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'ASSETS' && (
                  <>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className={LabelClass}>Tipo</label><select className={InputClass} value={formState.type} onChange={e => setFormState({...formState, type: e.target.value})}>{Object.values(AssetType).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                        <div><label className={LabelClass}>Marca</label><input required className={InputClass} value={formState.brand || ''} onChange={e => setFormState({...formState, brand: e.target.value})} /></div>
                        <div><label className={LabelClass}>Modelo</label><input required className={InputClass} value={formState.model || ''} onChange={e => setFormState({...formState, model: e.target.value})} /></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className={LabelClass}>Patrimônio</label><input className={InputClass} value={formState.tagPatrimonio || ''} onChange={e => setFormState({...formState, tagPatrimonio: e.target.value})} /></div>
                        <div><label className={LabelClass}>Serial</label><input className={InputClass} value={formState.serialNumber || ''} onChange={e => setFormState({...formState, serialNumber: e.target.value})} /></div>
                        <div><label className={LabelClass}>IMEI</label><input className={InputClass} value={formState.imei1 || ''} onChange={e => setFormState({...formState, imei1: e.target.value})} /></div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className={LabelClass}>Região</label><select className={InputClass} value={formState.region} onChange={e => setFormState({...formState, region: e.target.value})}>{Object.values(Region).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                        <div><label className={LabelClass}>Condição</label><select className={InputClass} value={formState.condition} onChange={e => setFormState({...formState, condition: e.target.value})}>{Object.values(AssetCondition).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                     </div>
                  </>
                )}

                {activeTab === 'EMPLOYEES' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={LabelClass}>Nome</label><input required className={InputClass} value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} /></div>
                      <div><label className={LabelClass}>Cargo</label><input required className={InputClass} value={formState.role || ''} onChange={e => setFormState({...formState, role: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={LabelClass}>Região</label><select className={InputClass} value={formState.region} onChange={e => setFormState({...formState, region: e.target.value})}>{Object.values(Region).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                      <div><label className={LabelClass}>Equipe</label><select className={InputClass} value={formState.teamId || ''} onChange={e => setFormState({...formState, teamId: e.target.value})}><option value="">Sem Equipe</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                    </div>
                  </>
                )}

                {activeTab === 'TEAMS' && (
                  <>
                    <div><label className={LabelClass}>Nome da Equipe</label><input required className={InputClass} value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={LabelClass}>Região</label><select className={InputClass} value={formState.region} onChange={e => setFormState({...formState, region: e.target.value})}>{Object.values(Region).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                      <div><label className={LabelClass}>Canal</label><select className={InputClass} value={formState.channel} onChange={e => setFormState({...formState, channel: e.target.value})}>{Object.values(Channel).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                    </div>
                  </>
                )}

                {activeTab === 'ROLES' && (
                   <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className={LabelClass}>Código da Vaga</label><input required className={InputClass} value={formState.code || ''} onChange={e => setFormState({...formState, code: e.target.value})} /></div>
                      <div><label className={LabelClass}>Descrição</label><input required className={InputClass} value={formState.description || ''} onChange={e => setFormState({...formState, description: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><label className={LabelClass}>Região</label><select className={InputClass} value={formState.region} onChange={e => setFormState({...formState, region: e.target.value})}>{Object.values(Region).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                      <div><label className={LabelClass}>Equipe</label><select className={InputClass} value={formState.teamId || ''} onChange={e => setFormState({...formState, teamId: e.target.value})}><option value="">Sem Equipe</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                      <div><label className={LabelClass}>Status</label><select className={InputClass} value={formState.status} onChange={e => setFormState({...formState, status: e.target.value})}><option value="VAGA_ABERTA">Aberta</option><option value="ATIVA">Ativa</option><option value="INATIVA">Inativa</option></select></div>
                    </div>
                   </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                   <button type="button" onClick={cancelEdit} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100">Cancelar</button>
                   <button type="submit" className="px-4 py-2 bg-gsa-green text-white rounded-lg flex items-center hover:bg-lime-600"><Save size={18} className="mr-2"/> Salvar</button>
                </div>
              </form>
            </div>
          )}

          {!isEditing && (
            <div className="flex-1 overflow-auto bg-slate-50 border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Detalhes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status/Info</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-slate-200">
                    {activeTab === 'ASSETS' && assets.map(item => (
                       <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-slate-800">{item.brand} {item.model}</div><div className="text-xs text-slate-500">{item.type}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm">{item.tagPatrimonio || 'S/ Tag'}</div><div className="text-xs text-slate-400">{item.serialNumber}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 rounded-full text-xs bg-slate-100">{item.status}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button type="button" onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3 inline-block"><Edit size={18}/></button>
                            <button type="button" onClick={() => { if(confirm('Deletar este ativo?')) onDeleteAsset(item.id) }} className="text-red-600 hover:text-red-800 inline-block"><Trash2 size={18}/></button>
                          </td>
                       </tr>
                    ))}
                    {activeTab === 'EMPLOYEES' && employees.map(item => (
                       <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-slate-800">{item.name}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm">{item.role}</div><div className="text-xs text-slate-400">{item.region}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm">{item.teamId ? teams.find(t=>t.id === item.teamId)?.name : '-'}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                             <button type="button" onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3 inline-block"><Edit size={18}/></button>
                             <button type="button" onClick={() => { if(confirm('Deletar este funcionário?')) onDeleteEmployee(item.id) }} className="text-red-600 hover:text-red-800 inline-block"><Trash2 size={18}/></button>
                          </td>
                       </tr>
                    ))}
                     {activeTab === 'TEAMS' && teams.map(item => (
                       <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-slate-800">{item.name}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm">{item.region}</div><div className="text-xs text-slate-400">{item.channel}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm">{employees.filter(e => e.teamId === item.id).length} Membros</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                             <button type="button" onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3 inline-block"><Edit size={18}/></button>
                             <button type="button" onClick={() => { if(confirm('Deletar esta equipe?')) onDeleteTeam(item.id) }} className="text-red-600 hover:text-red-800 inline-block"><Trash2 size={18}/></button>
                          </td>
                       </tr>
                    ))}
                    {activeTab === 'ROLES' && roles.map(item => (
                       <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="font-bold text-slate-800">{item.code}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm">{item.description}</div><div className="text-xs text-slate-400">{item.region}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-1 rounded-full text-xs bg-slate-100">{item.status}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                             <button type="button" onClick={() => startEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3 inline-block"><Edit size={18}/></button>
                             <button type="button" onClick={() => { if(confirm('Deletar esta vaga?')) onDeleteRole(item.id) }} className="text-red-600 hover:text-red-800 inline-block"><Trash2 size={18}/></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};