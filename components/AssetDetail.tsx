import React from 'react';
import { Asset, Movement } from '../types';
import { ArrowLeft, Calendar, User, FileText, ArrowDownCircle } from 'lucide-react';

interface AssetDetailProps {
  asset: Asset;
  movements: Movement[];
  onBack: () => void;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({ asset, movements, onBack }) => {
  // Sort movements by date descending
  const history = [...movements].filter(m => m.assetId === asset.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center text-slate-600 hover:text-gsa-blue transition-colors font-medium"
      >
        <ArrowLeft size={20} className="mr-2" />
        Voltar para Lista
      </button>

      {/* Asset Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
               <h2 className="text-2xl font-bold text-slate-900">{asset.brand} {asset.model}</h2>
               <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{asset.type}</span>
            </div>
            <p className="text-slate-500 mt-1">Responsável Atual: <span className="font-semibold text-gsa-blue">{asset.currentOwnerName}</span></p>
          </div>
          <div className="text-right">
             <div className="text-sm text-slate-500">Status</div>
             <div className="text-lg font-bold text-slate-800">{asset.status}</div>
             <div className="text-xs text-slate-400">Condição: {asset.condition}</div>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
             <label className="text-xs font-bold text-slate-400 uppercase">Identificadores</label>
             <div className="bg-slate-50 p-3 rounded-md space-y-1">
                {asset.tagPatrimonio && <p className="text-sm text-slate-700 flex justify-between"><span>Patrimônio:</span> <b>{asset.tagPatrimonio}</b></p>}
                {asset.serialNumber && <p className="text-sm text-slate-700 flex justify-between"><span>Serial:</span> <b>{asset.serialNumber}</b></p>}
                {asset.imei1 && <p className="text-sm text-slate-700 flex justify-between"><span>IMEI 1:</span> <b>{asset.imei1}</b></p>}
                {asset.imei2 && <p className="text-sm text-slate-700 flex justify-between"><span>IMEI 2:</span> <b>{asset.imei2}</b></p>}
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-slate-400 uppercase">Especificações</label>
             <div className="bg-slate-50 p-3 rounded-md">
                <p className="text-sm text-slate-700">{asset.specs || 'Nenhuma especificação registrada.'}</p>
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-slate-400 uppercase">Localização</label>
             <div className="bg-slate-50 p-3 rounded-md">
                <p className="text-sm text-slate-700">Região: <b>{asset.region}</b></p>
             </div>
           </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <Calendar size={20} className="mr-2 text-gsa-green" />
          Histórico de Movimentações
        </h3>

        <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
          {history.length === 0 ? (
            <p className="ml-6 text-slate-500 italic">Nenhuma movimentação registrada.</p>
          ) : (
            history.map((move, idx) => (
              <div key={move.id} className="relative ml-6">
                <span className="absolute -left-[31px] top-1 bg-white border-2 border-gsa-blue rounded-full w-4 h-4"></span>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start bg-slate-50 p-4 rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">{new Date(move.date).toLocaleDateString('pt-BR')} às {new Date(move.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                    <h4 className="font-bold text-slate-800 text-lg">{move.reason}</h4>
                    
                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <div className="flex items-center text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                         <span className="font-medium">{move.fromOwnerName}</span>
                         <span className="text-xs ml-1 text-slate-400">({move.fromOwnerType})</span>
                      </div>
                      <ArrowDownCircle size={16} className="text-slate-400 -rotate-90" />
                      <div className="flex items-center text-gsa-blue bg-blue-50 px-2 py-1 rounded border border-blue-100">
                         <User size={14} className="mr-1" />
                         <span className="font-bold">{move.toOwnerName}</span>
                         <span className="text-xs ml-1 text-blue-400">({move.toOwnerType})</span>
                      </div>
                    </div>

                    {move.observations && (
                      <div className="mt-3 text-sm text-slate-600 bg-white p-2 rounded border-l-4 border-slate-300">
                        <span className="font-semibold text-xs text-slate-400 block mb-1">OBSERVAÇÕES:</span>
                        {move.observations}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 sm:mt-0 sm:text-right">
                    <span className="text-xs text-slate-400 flex items-center sm:justify-end">
                      <FileText size={12} className="mr-1" />
                      Reg. por: {move.registeredBy}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};