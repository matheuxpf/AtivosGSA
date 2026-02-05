import React, { useState } from 'react';
import { Team, Employee, Asset } from '../types';
import { Users, MapPin, Edit, Trash2, Monitor } from 'lucide-react';

interface TeamViewProps {
  teams: Team[];
  employees: Employee[];
  assets: Asset[];
  onAddMember: (teamId: string, employeeId: string) => void;
  onRemoveMember: (employeeId: string) => void;
  onDeleteTeam: (id: string) => void;
  onEditTeam: () => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ teams, employees, assets, onDeleteTeam, onEditTeam }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('GO');

  const filteredTeams = teams.filter(t => t.region === selectedRegion);

  return (
    <div className="space-y-6">
      {/* Filtro de Regiões */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['GO', 'MT', 'TO', 'ADM', 'INDIRETO'].map(region => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              selectedRegion === region ? 'bg-gsa-blue text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'
            }`}
          >
            {region === 'INDIRETO' ? 'EXTERNO' : region === 'ADM' ? 'ADMINISTRATIVO' : region}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeams.map(team => {
          const teamMembers = employees.filter(e => e.teamId === team.id);
          const teamAssets = assets.filter(a => a.currentOwnerId === team.id); // Ativos direto na equipe

          return (
            <div key={team.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Users size={18} className="text-gsa-blue"/> {team.name}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-white border px-1.5 rounded mt-1 inline-block">
                    {team.channel}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={onEditTeam} className="text-slate-400 hover:text-blue-500"><Edit size={16}/></button>
                  <button onClick={() => onDeleteTeam(team.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Membros */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Membros ({teamMembers.length})</h4>
                  <div className="space-y-2">
                    {teamMembers.length === 0 ? <p className="text-xs text-slate-400 italic">Vazio</p> : teamMembers.map(emp => (
                      <div key={emp.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border border-slate-100">
                        <span className="font-medium text-slate-700">{emp.name}</span>
                        <span className="text-xs text-slate-500">{emp.role}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ativos da Equipe */}
                {teamAssets.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Ativos da Área ({teamAssets.length})</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {teamAssets.map(asset => (
                        <div key={asset.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-100 text-xs text-blue-800">
                          <Monitor size={14}/> 
                          {/* CORREÇÃO AQUI: Trocado model por brand */}
                          <span className="font-bold truncate">{asset.type} {asset.brand}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredTeams.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
          <p>Nenhuma equipe encontrada nesta região.</p>
        </div>
      )}
    </div>
  );
};