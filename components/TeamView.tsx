import React, { useState } from 'react';
import { Asset, Employee, Region, Team } from '../types';
import { Users, MapPin, ChevronRight, User, Laptop, Smartphone, ArrowLeft, Crown, Plus, Trash2, Edit } from 'lucide-react';

interface TeamViewProps {
  teams: Team[];
  employees: Employee[];
  assets: Asset[];
  onAddMember: (teamId: string, employeeId: string) => void;
  onRemoveMember: (employeeId: string) => void;
  onDeleteTeam: (teamId: string) => void;
  onEditTeam: (team: Team) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ teams, employees, assets, onAddMember, onRemoveMember, onDeleteTeam, onEditTeam }) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  // CHANGED: Store ID instead of object to ensure we always render the latest data from props
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');

  // Derived state: Get the actual team object from the props based on ID
  const selectedTeam = selectedTeamId ? teams.find(t => t.id === selectedTeamId) : null;

  // -- View 1: Region Selection --
  if (!selectedRegion) {
    const mainRegions = [Region.GO, Region.MT, Region.TO];
    
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800">Selecione a Regional</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainRegions.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-gsa-blue transition-all group flex flex-col items-center justify-center gap-4"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-gsa-blue group-hover:bg-gsa-blue group-hover:text-white transition-colors">
                <MapPin size={32} />
              </div>
              <span className="text-xl font-bold text-slate-700 group-hover:text-gsa-blue">{region}</span>
              <span className="text-sm text-slate-400">
                {teams.filter(t => t.region === region).length} Equipes
              </span>
            </button>
          ))}
          
          <button
            onClick={() => setSelectedRegion(Region.INDIRETO)}
            className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-gsa-green transition-all group flex flex-col items-center justify-center gap-4"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-gsa-green group-hover:bg-gsa-green group-hover:text-white transition-colors">
              <Users size={32} />
            </div>
            <span className="text-xl font-bold text-slate-700 group-hover:text-gsa-green">Indireto</span>
            <span className="text-sm text-slate-400">
               {teams.filter(t => t.region === Region.INDIRETO).length} Equipes (Outros Estados)
            </span>
          </button>
        </div>
      </div>
    );
  }

  // -- View 2: Team List --
  if (selectedRegion && !selectedTeam) {
    const filteredTeams = teams.filter(t => t.region === selectedRegion);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-6">
           <button onClick={() => setSelectedRegion(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
             <ArrowLeft size={24} className="text-slate-600" />
           </button>
           <h2 className="text-2xl font-bold text-slate-800">Equipes - {selectedRegion === Region.INDIRETO ? 'Indireto' : selectedRegion}</h2>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center text-slate-500 border border-slate-200 border-dashed">
            Nenhuma equipe cadastrada nesta região.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map(team => {
               const memberCount = employees.filter(e => e.teamId === team.id).length;
               return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 hover:border-gsa-blue hover:shadow-md transition-all text-left flex justify-between items-center group"
                >
                  <div>
                    <div className="text-xs font-bold text-gsa-blue uppercase mb-1">{team.channel}</div>
                    <h3 className="font-bold text-slate-800 text-lg">{team.name}</h3>
                    <div className="mt-2 flex items-center text-slate-500 text-sm">
                       <Users size={16} className="mr-2" />
                       {memberCount} Membros
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-gsa-blue" />
                </button>
               );
            })}
          </div>
        )}
      </div>
    );
  }

  // -- View 3: Team Detail --
  // If selectedTeam is null here (e.g. it was deleted), it will naturally fall back to the list view or show error
  if (selectedTeam) {
    const leader = employees.find(e => e.id === selectedTeam.leaderId);
    const members = employees.filter(e => e.teamId === selectedTeam.id && e.id !== selectedTeam.leaderId);
    const availableEmployees = employees.filter(e => !e.teamId || e.teamId !== selectedTeam.id);
    
    // Helper to render assets for a person
    const renderAssets = (personId: string) => {
       const personAssets = assets.filter(a => a.currentOwnerId === personId);
       if (personAssets.length === 0) return <span className="text-xs text-slate-400 italic">Sem ativos vinculados</span>;
       
       return (
         <div className="flex flex-wrap gap-2 mt-2">
           {personAssets.map(asset => (
             <div key={asset.id} className="flex items-center bg-slate-100 px-2 py-1 rounded text-xs text-slate-700 border border-slate-200" title={`${asset.brand} ${asset.model}`}>
                {asset.type === 'CELULAR' ? <Smartphone size={12} className="mr-1"/> : <Laptop size={12} className="mr-1"/>}
                <span className="font-medium truncate max-w-[100px]">{asset.tagPatrimonio || asset.model}</span>
             </div>
           ))}
         </div>
       );
    };

    return (
       <div className="space-y-6 animate-fade-in relative">
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
           <div className="flex items-center gap-4">
             <button onClick={() => setSelectedTeamId(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
               <ArrowLeft size={24} className="text-slate-600" />
             </button>
             <div>
               <div className="text-sm text-slate-500 font-medium">Equipes {selectedRegion} / {selectedTeam.channel}</div>
               <h2 className="text-2xl font-bold text-slate-800">{selectedTeam.name}</h2>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
              <button onClick={() => {
                 const newName = prompt('Novo nome da equipe:', selectedTeam.name);
                 if (newName && newName !== selectedTeam.name) {
                    onEditTeam({...selectedTeam, name: newName});
                 }
              }} className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 text-sm font-medium flex items-center">
                 <Edit size={16} className="mr-2"/> Editar Equipe
              </button>
              <button onClick={() => {
                 if(window.confirm('Tem certeza que deseja excluir esta equipe? Os membros ficarão sem equipe.')) {
                   onDeleteTeam(selectedTeam.id);
                   setSelectedTeamId(null); // Go back to list
                 }
              }} className="px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm font-medium flex items-center">
                 <Trash2 size={16} className="mr-2"/> Excluir Equipe
              </button>
           </div>
        </div>

        {/* Supervisor / Leader Section */}
        <div className="bg-gradient-to-r from-blue-50 to-white p-6 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Crown size={100} className="text-gsa-blue" />
           </div>
           <h3 className="text-sm font-bold text-gsa-blue uppercase mb-4 flex items-center">
             <Crown size={16} className="mr-2" /> Supervisor / Líder
           </h3>
           
           {leader ? (
             <div className="flex flex-col md:flex-row md:items-center gap-4 relative z-10 group">
                <button 
                  onClick={() => {
                     if(confirm('Remover supervisor da equipe?')) onRemoveMember(leader.id);
                  }}
                  className="absolute top-0 right-0 text-slate-400 hover:text-red-500 bg-white rounded-full p-1 shadow-sm border border-slate-200"
                  title="Remover Supervisor"
                >
                  <Trash2 size={16} />
                </button>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gsa-blue border-2 border-gsa-blue shadow-sm">
                   <User size={32} />
                </div>
                <div>
                   <div className="font-bold text-xl text-slate-900">{leader.name}</div>
                   <div className="text-slate-600">{leader.role}</div>
                   {renderAssets(leader.id)}
                </div>
             </div>
           ) : (
             <div className="text-slate-400 italic">Nenhum líder definido para esta equipe. Adicione um membro e defina como líder (via Admin por enquanto).</div>
           )}
        </div>

        {/* Members List */}
        <div>
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-bold text-slate-800 flex items-center">
               <Users size={20} className="mr-2 text-slate-500" /> 
               Membros da Equipe ({members.length})
             </h3>
             <button onClick={() => setIsAddMemberOpen(true)} className="text-sm text-gsa-blue font-bold hover:underline flex items-center">
               <Plus size={16} className="mr-1" /> Adicionar Membro
             </button>
           </div>
           
           {members.length === 0 ? (
              <div className="text-slate-500 italic p-4 bg-white rounded-lg border border-slate-200">Nenhum outro membro nesta equipe.</div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map(member => (
                  <div key={member.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all relative group">
                     {/* Make button always visible and stopPropagation to prevent issues */}
                     <button 
                        onClick={(e) => { 
                           e.stopPropagation();
                           if(confirm('Remover membro da equipe?')) onRemoveMember(member.id); 
                        }}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 bg-white p-1 rounded-full shadow-sm border border-slate-100 z-10"
                        title="Remover da equipe"
                     >
                        <Trash2 size={16} />
                     </button>
                     <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
                           <User size={20} />
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                           <div className="font-bold text-slate-800 truncate">{member.name}</div>
                           <div className="text-xs text-slate-500 truncate">{member.role}</div>
                           {renderAssets(member.id)}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>
        
        {/* Add Member Modal */}
        {isAddMemberOpen && (
           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                 <h3 className="text-lg font-bold mb-4">Adicionar Membro</h3>
                 <p className="text-sm text-slate-500 mb-4">Selecione um funcionário para adicionar à {selectedTeam.name}.</p>
                 <select 
                    className="w-full border p-2 rounded mb-4" 
                    value={memberToAdd} 
                    onChange={e => setMemberToAdd(e.target.value)}
                 >
                    <option value="">Selecione...</option>
                    {availableEmployees.map(e => (
                       <option key={e.id} value={e.id}>
                          {e.name} {e.teamId ? '(Em outra equipe)' : ''}
                       </option>
                    ))}
                 </select>
                 <div className="flex justify-end gap-2">
                    <button onClick={() => setIsAddMemberOpen(false)} className="px-4 py-2 text-slate-600">Cancelar</button>
                    <button onClick={() => {
                       if(memberToAdd) {
                          onAddMember(selectedTeam.id, memberToAdd);
                          setIsAddMemberOpen(false);
                          setMemberToAdd('');
                       }
                    }} className="px-4 py-2 bg-gsa-blue text-white rounded">Adicionar</button>
                 </div>
              </div>
           </div>
        )}

       </div>
    );
  }

  // Fallback if ID exists but object doesn't (rare edge case during deletion)
  return <div>Equipe não encontrada ou excluída. <button onClick={() => setSelectedTeamId(null)} className="text-blue-500 underline">Voltar</button></div>;
};