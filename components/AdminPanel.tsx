import React, { useState, useEffect } from 'react';
import { Asset, Channel, Employee, OwnerType, Team, Role } from '../types';
import { PlusCircle, Users, Briefcase, Monitor, Trash2, Edit, Save, X } from 'lucide-react';
import { STOCK_OWNER_ID, STOCK_OWNER_NAME } from '../constants';

interface AdminPanelProps {
  assets: Asset[]; employees: Employee[]; teams: Team[]; roles: Role[];
  onAddAsset: (a: Asset) => void; onUpdateAsset: (a: Asset) => void; onDeleteAsset: (id: string) => void;
  onAddEmployee: (e: Employee) => void; onUpdateEmployee: (e: Employee) => void; onDeleteEmployee: (id: string) => void;
  onAddTeam: (t: Team) => void; onUpdateTeam: (t: Team) => void; onDeleteTeam: (id: string) => void;
  onAddRole: (r: Role) => void; onUpdateRole: (r: Role) => void; onDeleteRole: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'ASSETS' | 'EMPLOYEES' | 'TEAMS' | 'ROLES'>('ASSETS');
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<any>({});

  // --- TRADUÇÃO DOS TÍTULOS ---
  const tabNames = {
    ASSETS: 'ATIVOS',
    EMPLOYEES: 'FUNCIONÁRIOS',
    TEAMS: 'EQUIPES',
    ROLES: 'VAGAS'
  };

  const ASSET_TYPES = ['NOTEBOOK', 'CELULAR', 'TABLET', 'MONITOR', 'ACESSÓRIO'];
  const ASSET_BRANDS = ['Samsung', 'Dell', 'Lenovo', 'Apple'];
  const ASSET_STATES = ['NOVO', 'USADO', 'QUEBRADO', 'COM DEFEITO'];
  const REGIONS = ['GO', 'MT', 'TO', 'ADM', 'INDIRETO'];
  const CHANNELS = ['CV', 'ATACADO', 'KEY ACCOUNT', 'ADMINISTRATIVO', 'VETOR'];

  useEffect(() => { setIsEditing(false); setFormState({}); }, [activeTab]);

  const startCreate = () => {
    setIsEditing(true);
    if (activeTab === 'ASSETS') setFormState({ type: 'NOTEBOOK', brand: 'Samsung', state: 'NOVO', region: 'GO', value: 0 });
    if (activeTab === 'EMPLOYEES') setFormState({ region: 'GO', active: true, roleId: '' });
    if (activeTab === 'TEAMS') setFormState({ region: 'GO', channel: 'CV' });
    if (activeTab === 'ROLES') setFormState({ region: 'GO', status: 'VAGA_ABERTA' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'ASSETS') {
        const payload = { 
          ...formState, 
          currentOwnerType: formState.currentOwnerType || OwnerType.ESTOQUE, 
          currentOwnerId: formState.currentOwnerId || STOCK_OWNER_ID, 
          currentOwnerName: formState.currentOwnerName || STOCK_OWNER_NAME 
        };
        formState.id ? props.onUpdateAsset(payload) : props.onAddAsset(payload);
      }
      if (activeTab === 'EMPLOYEES') {
        const role = props.roles.find(r => r.id === formState.roleId);
        const payload = { ...formState, role: role?.description || 'Cargo Indefinido' };
        formState.id ? props.onUpdateEmployee(payload) : props.onAddEmployee(payload);
      }
      if (activeTab === 'TEAMS') formState.id ? props.onUpdateTeam(formState) : props.onAddTeam(formState);
      if (activeTab === 'ROLES') formState.id ? props.onUpdateRole(formState) : props.onAddRole(formState);
      
      setIsEditing(false); 
      setFormState({});
    } catch (err) { alert("Erro ao salvar dados."); }
  };

  const InputClass = "w-full border-slate-300 rounded p-2 border mt-1 text-sm bg-white";
  const LabelClass = "block text-xs font-bold text-slate-500 uppercase";

  const renderTable = () => {
    const data = activeTab === 'ASSETS' ? props.assets : activeTab === 'EMPLOYEES' ? props.employees : activeTab === 'TEAMS' ? props.teams : props.roles;
    if (!data || data.length === 0) return <tbody><tr><td colSpan={3} className="p-12 text-center text-slate-400">Nenhum registro encontrado.</td></tr></tbody>;

    return (
      <tbody className="divide-y divide-slate-200">
        {data.map((item: any) => (
          <tr key={item.id} className="text-sm hover:bg-slate-50 transition-colors">
            <td className="px-6 py-4 font-bold text-slate-700">
              {activeTab === 'ASSETS' ? (
                <div>
                  <div className="flex items-center gap-2"><span className="uppercase text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">{item.type}</span> <span className="text-gsa-blue">{item.brand}</span></div>
                  <div className="text-xs font-mono font-normal text-slate-400 mt-1">ID: {item.primaryId}</div>
                </div>
              ) : activeTab === 'ROLES' ? item.code : item.name}
            </td>
            
            <td className="px-6 py-4 text-xs text-slate-500">
              {activeTab === 'ASSETS' ? (
                <div className="flex flex-col gap-1">
                  <span className={`font-bold w-fit ${item.state === 'NOVO' ? 'text-green-600' : 'text-slate-500'}`}>{item.state}</span>
                  <span className="text-xs bg-yellow-50 text-yellow-700 px-1 py-0.5 rounded w-fit border border-yellow-100">{item.status}</span>
                  <span>R$ {Number(item.value).toFixed(2)}</span>
                </div>
              ) : activeTab === 'ROLES' ? item.description : activeTab === 'TEAMS' ? `${item.region} - ${item.channel}` : item.region}
            </td>
            
            <td className="px-6 py-4 text-right whitespace-nowrap">
              <button onClick={() => {setFormState(item); setIsEditing(true);}} className="text-blue-600 hover:bg-blue-50 p-2 rounded mr-2"><Edit size={16}/></button>
              <button onClick={() => { if(confirm('Excluir?')) { if(activeTab === 'ASSETS') props.onDeleteAsset(item.id); if(activeTab === 'EMPLOYEES') props.onDeleteEmployee(item.id); if(activeTab === 'TEAMS') props.onDeleteTeam(item.id); if(activeTab === 'ROLES') props.onDeleteRole(item.id); } }} className="text-red-400 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
            </td>
          </tr>
        ))}
      </tbody>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
      <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto">
        {[{id:'ASSETS',label:'Ativos',icon:Monitor},{id:'EMPLOYEES',label:'Funcionários',icon:Users},{id:'TEAMS',label:'Equipes',icon:Users},{id:'ROLES',label:'Vagas',icon:Briefcase}].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)} className={`flex items-center px-8 py-4 font-bold border-r border-slate-200 whitespace-nowrap transition-colors ${activeTab===tab.id ? 'bg-white text-gsa-blue border-b-2 border-b-gsa-blue' : 'text-slate-400 hover:bg-slate-100'}`}><tab.icon size={18} className="mr-2"/>{tab.label}</button>
        ))}
      </div>
      <div className="p-8 flex-1">
        {!isEditing ? (
          <>
            <div className="flex justify-between items-center mb-6">
              {/* --- AQUI ESTÁ A CORREÇÃO PRINCIPAL: Usamos tabNames[activeTab] --- */}
              <h2 className="text-xl font-black uppercase text-slate-800">Gerenciar {tabNames[activeTab]}</h2>
              <button onClick={startCreate} className="bg-gsa-blue text-white px-6 py-2.5 rounded-lg font-bold flex items-center shadow hover:bg-blue-700 transition-all"><PlusCircle size={18} className="mr-2"/> Adicionar</button>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400"><tr><th className="px-6 py-3 text-left">Item</th><th className="px-6 py-3 text-left">Detalhes</th><th className="px-6 py-3 text-right">Ações</th></tr></thead>{renderTable()}</table></div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-inner space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4"><h3 className="font-black text-xl text-slate-800 uppercase">{formState.id ? 'Editar' : 'Novo'} Cadastro</h3><button type="button" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button></div>
            
            {activeTab === 'ASSETS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div><label className={LabelClass}>Tipo</label><select className={InputClass} value={formState.type} onChange={e => setFormState({...formState, type: e.target.value})}>{ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className={LabelClass}>Marca</label><select className={InputClass} value={formState.brand} onChange={e => setFormState({...formState, brand: e.target.value})}>{ASSET_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                <div><label className={LabelClass}>ID Único</label><input required className={InputClass} value={formState.primaryId || ''} onChange={e => setFormState({...formState, primaryId: e.target.value})} /></div>
                <div><label className={LabelClass}>Estado Físico</label><select className={InputClass} value={formState.state} onChange={e => setFormState({...formState, state: e.target.value})}>{ASSET_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className={LabelClass}>Cor</label><input className={InputClass} value={formState.color || ''} onChange={e => setFormState({...formState, color: e.target.value})} /></div>
                <div><label className={LabelClass}>Valor (R$)</label><input type="number" step="0.01" className={InputClass} value={formState.value || ''} onChange={e => setFormState({...formState, value: e.target.value})} /></div>
                <div className="md:col-span-2"><label className={LabelClass}>Detalhes</label><input className={InputClass} value={formState.details || ''} onChange={e => setFormState({...formState, details: e.target.value})} /></div>
                <div><label className={LabelClass}>Região</label><select className={InputClass} value={formState.region} onChange={e => setFormState({...formState, region: e.target.value})}>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              </div>
            )}
            
            {activeTab === 'EMPLOYEES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className={LabelClass}>Nome Completo</label><input required className={InputClass} value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} /></div>
                <div><label className={LabelClass}>Vaga</label><select required className={InputClass} value={formState.roleId || ''} onChange={e => setFormState({...formState, roleId: e.target.value})}><option value="">Selecione...</option>{props.roles.map(r => <option key={r.id} value={r.id}>[{r.region}] {r.code} - {r.description}</option>)}</select></div>
                <div><label className={LabelClass}>Equipe</label><select className={InputClass} value={formState.teamId || ''} onChange={e => setFormState({...formState, teamId: e.target.value})}><option value="">Sem Equipe</option>{props.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className={LabelClass}>Região</label><select className={InputClass} value={formState.region} onChange={e => setFormState({...formState, region: e.target.value})}>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
              </div>
            )}
            {activeTab === 'TEAMS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2"><label className={LabelClass}>Nome da Equipe</label><input required className={InputClass} value={formState.name || ''} onChange={e => setFormState({...formState, name: e.target.value})} /></div>
                <div><label className={LabelClass}>Região</label><select className={InputClass} value={formState.region} onChange={e => setFormState({...formState, region: e.target.value})}>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className={LabelClass}>Canal</label><select className={InputClass} value={formState.channel} onChange={e => setFormState({...formState, channel: e.target.value})}>{CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div className="md:col-span-2"><label className={LabelClass}>Supervisor</label><select className={InputClass} value={formState.leaderId || ''} onChange={e => setFormState({...formState, leaderId: e.target.value})}><option value="">Selecione...</option>{props.employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
              </div>
            )}
            {activeTab === 'ROLES' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className={LabelClass}>Código Vaga</label><input required className={InputClass} value={formState.code || ''} onChange={e => setFormState({...formState, code: e.target.value})} /></div>
                <div><label className={LabelClass}>Descrição</label><input required className={InputClass} value={formState.description || ''} onChange={e => setFormState({...formState, description: e.target.value})} /></div>
                <div><label className={LabelClass}>Região</label><select className={InputClass} value={formState.region} onChange={e => setFormState({...formState, region: e.target.value})}>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className={LabelClass}>Equipe Fixa</label><select className={InputClass} value={formState.teamId || ''} onChange={e => setFormState({...formState, teamId: e.target.value})}><option value="">Vaga Avulsa</option>{props.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
              </div>
            )}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200"><button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button><button type="submit" className="px-8 py-2.5 bg-gsa-green text-white rounded-lg font-black shadow-md hover:bg-green-600">SALVAR</button></div>
          </form>
        )}
      </div>
    </div>
  );
};