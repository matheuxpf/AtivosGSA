import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AssetList } from './components/AssetList';
import { AssetDetail } from './components/AssetDetail';
import { MovementForm } from './components/MovementForm';
import { AdminPanel } from './components/AdminPanel';
import { TeamView } from './components/TeamView';
import { Asset, Movement, ViewState, AssetStatus, OwnerType, Employee, Team, Role } from './types';
import { supabase } from './lib/supabase'; // Certifica-te de que este ficheiro existe
import { ArrowRightLeft, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // --- Estados Globais ---
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI State
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [assetsToMove, setAssetsToMove] = useState<Asset[]>([]);

  // --- Procura Inicial de Dados (Supabase) ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: assetsData },
        { data: employeesData },
        { data: teamsData },
        { data: rolesData },
        { data: movementsData }
      ] = await Promise.all([
        supabase.from('assets').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('roles').select('*'),
        supabase.from('movements').select('*').order('date', { ascending: false })
      ]);

      if (assetsData) setAssets(assetsData);
      if (employeesData) setEmployees(employeesData);
      if (teamsData) setTeams(teamsData);
      if (rolesData) setRoles(rolesData);
      if (movementsData) setMovements(movementsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao ligar ao Supabase. Verifica a tua configuração.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers de Navegação ---
  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    if (view !== 'DETAILS') setSelectedAssetId(null);
  };

  const handleViewDetail = (id: string) => {
    setSelectedAssetId(id);
    setCurrentView('DETAILS');
  };

  const handleInitiateMove = (selectedAssets: Asset[]) => {
    setAssetsToMove(selectedAssets);
    setIsMovementModalOpen(true);
  };

  // --- Lógica Principal de Movimentação em Lote ---
  const handleConfirmMovement = async (
    newMovements: Partial<Movement>[], 
    newStatus: AssetStatus,
    newOwner: { type: OwnerType, id: string, name: string }
  ) => {
    try {
      // 1. Inserir registos de movimentação
      const { error: moveError } = await supabase.from('movements').insert(newMovements);
      if (moveError) throw moveError;

      // 2. Atualizar o estado de cada ativo selecionado
      const assetUpdates = newMovements.map(m => 
        supabase.from('assets').update({
          status: newStatus,
          current_owner_type: newOwner.type,
          current_owner_id: newOwner.id,
          current_owner_name: newOwner.name,
          region: newOwner.type === OwnerType.FUNCIONARIO 
            ? (employees.find(e => e.id === newOwner.id)?.region || assets.find(a => a.id === m.assetId)?.region)
            : assets.find(a => a.id === m.assetId)?.region
        }).eq('id', m.assetId)
      );

      await Promise.all(assetUpdates);

      // 3. Recarregar dados para garantir sincronia
      await fetchData();
      
      setIsMovementModalOpen(false);
      setAssetsToMove([]);
      alert(`${newMovements.length} ativo(s) movimentado(s) com sucesso!`);
    } catch (error) {
      console.error('Erro na movimentação:', error);
      alert('Falha ao processar movimentação.');
    }
  };

  // --- CRUD Handlers (Supabase Sync) ---

  const handleAddAsset = async (newAsset: Asset) => {
    const { error } = await supabase.from('assets').insert([newAsset]);
    if (!error) fetchData();
  };

  const handleUpdateAsset = async (updatedAsset: Asset) => {
    const { error } = await supabase.from('assets').update(updatedAsset).eq('id', updatedAsset.id);
    if (!error) fetchData();
  };

  const handleDeleteAsset = async (id: string) => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (!error) fetchData();
  };

  const handleAddEmployee = async (newEmp: Employee) => {
    const { error } = await supabase.from('employees').insert([newEmp]);
    if (!error) fetchData();
  };

  const handleDeleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (!error) fetchData();
  };

  // --- Renderização de Conteúdo ---
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-gsa-blue animate-spin" />
          <p className="text-slate-600 font-medium">A carregar sistema GSA...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard assets={assets} />;
      case 'ASSETS': return (
        <AssetList 
          assets={assets} 
          onViewDetail={handleViewDetail}
          onInitiateMove={handleInitiateMove}
          onDelete={handleDeleteAsset}
          onEdit={() => alert("Usa o painel de Administração para editar ativos.")}
          searchQuery={searchQuery}
        />
      );
      case 'DETAILS':
        const asset = assets.find(a => a.id === selectedAssetId);
        return asset ? <AssetDetail asset={asset} movements={movements} onBack={() => setCurrentView('ASSETS')} /> : <div>Não encontrado</div>;
      case 'TEAMS': return (
        <TeamView 
          teams={teams} employees={employees} assets={assets}
          onAddMember={(tId, eId) => supabase.from('employees').update({ team_id: tId }).eq('id', eId).then(fetchData)}
          onRemoveMember={(eId) => supabase.from('employees').update({ team_id: null }).eq('id', eId).then(fetchData)}
          onDeleteTeam={(id) => supabase.from('teams').delete().eq('id', id).then(fetchData)}
          onEditTeam={(team) => supabase.from('teams').update(team).eq('id', team.id).then(fetchData)}
        />
      );
      case 'ADMIN': return (
        <AdminPanel 
          assets={assets} employees={employees} teams={teams} roles={roles}
          onAddAsset={handleAddAsset} onUpdateAsset={handleUpdateAsset} onDeleteAsset={handleDeleteAsset}
          onAddEmployee={handleAddEmployee} onUpdateEmployee={(emp) => supabase.from('employees').update(emp).eq('id', emp.id).then(fetchData)} onDeleteEmployee={handleDeleteEmployee}
          onAddTeam={(team) => supabase.from('teams').insert([team]).then(fetchData)} onUpdateTeam={(t) => supabase.from('teams').update(t).eq('id', t.id).then(fetchData)} onDeleteTeam={() => {}} 
          onAddRole={(role) => supabase.from('roles').insert([role]).then(fetchData)} onUpdateRole={(r) => supabase.from('roles').update(r).eq('id', r.id).then(fetchData)} onDeleteRole={(id) => supabase.from('roles').delete().eq('id', id).then(fetchData)}
        />
      );
      case 'MOVEMENTS':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">Histórico de Movimentações</h2>
              <button onClick={() => setCurrentView('ASSETS')} className="bg-gsa-green text-white px-4 py-2 rounded-lg flex items-center hover:bg-lime-600 transition-colors">
                <ArrowRightLeft size={18} className="mr-2" /> Nova Movimentação
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ativo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Origem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Destino</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {movements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm text-slate-500">{new Date(m.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gsa-blue">{assets.find(a => a.id === m.assetId)?.model || 'Ativo'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.fromOwnerName}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{m.toOwnerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{m.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default: return <div>View não encontrada</div>;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate} onSearch={setSearchQuery} searchValue={searchQuery}>
      {renderContent()}
      {isMovementModalOpen && (
        <MovementForm 
          selectedAssets={assetsToMove} employees={employees} 
          onClose={() => setIsMovementModalOpen(false)} 
          onSubmit={handleConfirmMovement} 
        />
      )}
    </Layout>
  );
};

export default App;