import React, { useState } from 'react';
import { 
  Asset, 
  OwnerType, 
  Movement, 
  AssetStatus,
  Employee
} from '../types';
import { 
  STOCK_OWNER_ID, 
  STOCK_OWNER_NAME 
} from '../constants';
import { X, Save, AlertCircle } from 'lucide-react';

interface MovementFormProps {
  selectedAssets: Asset[];
  employees: Employee[]; // Passed from App state
  onClose: () => void;
  onSubmit: (movements: Partial<Movement>[], newStatus: AssetStatus, newOwner: { type: OwnerType, id: string, name: string }) => void;
}

export const MovementForm: React.FC<MovementFormProps> = ({ selectedAssets, employees, onClose, onSubmit }) => {
  // Form State
  const [targetType, setTargetType] = useState<OwnerType>(OwnerType.FUNCIONARIO);
  const [targetId, setTargetId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [newStatus, setNewStatus] = useState<AssetStatus>(AssetStatus.EM_USO);

  // Validation
  const canSubmit = targetId && reason && selectedAssets.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    let targetName = '';
    
    // Resolve Target Name Logic
    if (targetType === OwnerType.FUNCIONARIO) {
      const emp = employees.find(e => e.id === targetId);
      targetName = emp ? emp.name : 'Desconhecido';
    } else if (targetType === OwnerType.ESTOQUE) {
      targetName = STOCK_OWNER_NAME;
    } else if (targetType === OwnerType.MANUTENCAO) {
      targetName = 'Assistência Técnica'; // Simplified
    } else {
      targetName = targetId; // Fallback
    }

    // Prepare batch data
    const movementTemplate: Partial<Movement> = {
      toOwnerType: targetType,
      toOwnerId: targetId,
      toOwnerName: targetName,
      reason,
      observations,
      registeredBy: 'Admin (Atual)', // Mock user
      date: new Date().toISOString()
    };

    const movementsPayload = selectedAssets.map(asset => ({
      ...movementTemplate,
      assetId: asset.id,
      fromOwnerType: asset.currentOwnerType,
      fromOwnerId: asset.currentOwnerId,
      fromOwnerName: asset.currentOwnerName,
    }));

    onSubmit(movementsPayload, newStatus, { type: targetType, id: targetId, name: targetName });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gsa-blue text-white p-4 flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold">Nova Movimentação</h2>
            <p className="text-sm text-blue-200">
              Movimentando {selectedAssets.length} ativo(s)
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Selected Assets Summary */}
          <div className="mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Ativos Selecionados</h4>
            <div className="flex flex-wrap gap-2">
              {selectedAssets.map(asset => (
                <span key={asset.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {asset.type} - {asset.tagPatrimonio || asset.imei1 || asset.serialNumber}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* DESTINO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Destino</label>
                <select 
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-gsa-green focus:border-gsa-green p-2 border"
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value as OwnerType);
                    setTargetId(''); // Reset selection
                    // Auto-set status suggestion based on type
                    if(e.target.value === OwnerType.ESTOQUE) setNewStatus(AssetStatus.EM_ESTOQUE);
                    if(e.target.value === OwnerType.FUNCIONARIO) setNewStatus(AssetStatus.EM_USO);
                    if(e.target.value === OwnerType.MANUTENCAO) setNewStatus(AssetStatus.EM_MANUTENCAO);
                  }}
                >
                  {Object.values(OwnerType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Selecionar Destinatário</label>
                {targetType === OwnerType.FUNCIONARIO ? (
                  <select 
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-gsa-green focus:border-gsa-green p-2 border"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    required
                  >
                    <option value="">Selecione um funcionário...</option>
                    {employees.filter(e => e.active).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                ) : targetType === OwnerType.ESTOQUE ? (
                  <select 
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-gsa-green focus:border-gsa-green p-2 border"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    required
                  >
                     <option value="">Selecione...</option>
                     <option value={STOCK_OWNER_ID}>{STOCK_OWNER_NAME}</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-gsa-green focus:border-gsa-green p-2 border"
                    placeholder="ID ou Nome do Destino"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>

            {/* STATUS & MOTIVO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Novo Status do Ativo</label>
                <select 
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-gsa-green focus:border-gsa-green p-2 border"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as AssetStatus)}
                >
                  {Object.values(AssetStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                <select 
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-gsa-green focus:border-gsa-green p-2 border"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="Admissão">Admissão</option>
                  <option value="Demissão">Demissão</option>
                  <option value="Troca/Upgrade">Troca/Upgrade</option>
                  <option value="Manutenção">Envio para Manutenção</option>
                  <option value="Retorno Manutenção">Retorno de Manutenção</option>
                  <option value="Empréstimo">Empréstimo Temporário</option>
                  <option value="Inventário">Ajuste de Inventário</option>
                </select>
              </div>
            </div>

            {/* OBSERVAÇÕES */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea 
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-gsa-green focus:border-gsa-green p-2 border"
                rows={3}
                placeholder="Detalhes adicionais sobre a movimentação ou estado do equipamento..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-md flex items-start">
               <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
               <p className="text-sm text-yellow-700">
                 Ao confirmar, serão gerados registros individuais de movimentação para cada ativo selecionado.
               </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-lg text-white font-medium flex items-center transition-colors ${
              canSubmit ? 'bg-gsa-green hover:bg-lime-600 shadow-md' : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Save size={18} className="mr-2" />
            Confirmar Movimentação
          </button>
        </div>
      </div>
    </div>
  );
};