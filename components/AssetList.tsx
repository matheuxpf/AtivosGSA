import React, { useState } from 'react';
import { Asset, AssetType, AssetStatus, Region } from '../types';
import { Filter, Smartphone, Laptop, Monitor, MousePointer, MoreHorizontal, Eye, ArrowRightLeft, Trash2, Edit } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  onViewDetail: (assetId: string) => void;
  onInitiateMove: (assets: Asset[]) => void;
  onDelete: (assetId: string) => void;
  onEdit: (asset: Asset) => void;
  searchQuery: string;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onViewDetail, onInitiateMove, onDelete, onEdit, searchQuery }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterRegion, setFilterRegion] = useState<string>('ALL');

  // Filtering Logic
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = searchQuery === '' || 
      asset.tagPatrimonio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.imei1?.includes(searchQuery) ||
      asset.currentOwnerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'ALL' || asset.type === filterType;
    const matchesRegion = filterRegion === 'ALL' || asset.region === filterRegion;

    return matchesSearch && matchesType && matchesRegion;
  });

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.EM_USO: return 'bg-blue-100 text-blue-800';
      case AssetStatus.EM_ESTOQUE: return 'bg-gsa-green bg-opacity-20 text-green-800';
      case AssetStatus.EM_MANUTENCAO: return 'bg-amber-100 text-amber-800';
      case AssetStatus.BAIXADO: return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getTypeIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.CELULAR: return <Smartphone size={16} />;
      case AssetType.NOTEBOOK: return <Laptop size={16} />;
      case AssetType.DESKTOP: return <Monitor size={16} />;
      default: return <MousePointer size={16} />;
    }
  };

  // Batch action handlers
  const handleBatchMove = () => {
    const selectedAssetsList = assets.filter(a => selectedIds.has(a.id));
    onInitiateMove(selectedAssetsList);
    setSelectedIds(new Set()); // Clear selection after initiating
  };

  return (
    <div className="space-y-4">
      
      {/* Filters & Actions Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Filter size={16} className="text-slate-500" />
            <select 
              className="bg-transparent border-none text-sm text-slate-700 focus:ring-0 cursor-pointer"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Todos os Tipos</option>
              {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Filter size={16} className="text-slate-500" />
            <select 
              className="bg-transparent border-none text-sm text-slate-700 focus:ring-0 cursor-pointer"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              <option value="ALL">Todas Regiões</option>
              {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 animate-fade-in">
            <span className="text-sm font-bold text-blue-800 mr-4">{selectedIds.size} selecionado(s)</span>
            <button 
              onClick={handleBatchMove}
              className="flex items-center bg-gsa-blue text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <ArrowRightLeft size={16} className="mr-2" />
              Movimentar em Lote
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-gsa-blue focus:ring-gsa-green"
                    checked={selectedIds.size === filteredAssets.length && filteredAssets.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ativo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Identificadores</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Responsável Atual</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Região</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredAssets.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-10 text-center text-slate-500 text-sm">Nenhum ativo encontrado com os filtros atuais.</td>
                 </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-gsa-blue focus:ring-gsa-green"
                        checked={selectedIds.has(asset.id)}
                        onChange={() => toggleSelect(asset.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          {getTypeIcon(asset.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{asset.brand} {asset.model}</div>
                          <div className="text-xs text-slate-500">{asset.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-xs text-slate-600">
                         {asset.tagPatrimonio && <span>TAG: <b>{asset.tagPatrimonio}</b></span>}
                         {asset.serialNumber && <span>SN: {asset.serialNumber}</span>}
                         {asset.imei1 && <span>IMEI: {asset.imei1}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-slate-900 font-medium">{asset.currentOwnerName}</div>
                       <div className="text-xs text-slate-500">{asset.currentOwnerType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {asset.region}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onViewDetail(asset.id)} className="text-slate-400 hover:text-gsa-blue" title="Detalhes">
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => onInitiateMove([asset])} 
                          className="text-slate-400 hover:text-gsa-green"
                          title="Movimentar"
                          disabled={asset.status === AssetStatus.BAIXADO}
                        >
                          <ArrowRightLeft size={18} />
                        </button>
                         <button 
                          onClick={() => onEdit(asset)} 
                          className="text-slate-400 hover:text-amber-500"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                         <button 
                          onClick={() => {
                            if(window.confirm('Tem certeza que deseja excluir este ativo?')) onDelete(asset.id);
                          }} 
                          className="text-slate-400 hover:text-red-500"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};