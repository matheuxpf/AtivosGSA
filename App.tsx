import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AssetList } from './components/AssetList';
import { AssetDetail } from './components/AssetDetail';
import { MovementHistory } from './components/MovementHistory';
import { MovementForm } from './components/MovementForm';
import { AdminPanel } from './components/AdminPanel';
import { TeamView } from './components/TeamView';
import { Asset, Movement, ViewState, AssetStatus, AssetState, OwnerType, Employee, Team, Role } from './types';
import { supabase } from './lib/supabase';
import { STOCK_OWNER_ID, STOCK_OWNER_NAME } from './constants';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [assetsToMove, setAssetsToMove] = useState<Asset[]>([]);

  const fetchData = async () => {
    try {
      const [{ data: aData }, { data: eData }, { data: tData }, { data: rData }, { data: mData }] = await Promise.all([
        supabase.from('assets').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('roles').select('*'),
        supabase.from('movements').select('*').order('date', { ascending: false })
      ]);

      setAssets(aData?.map(a => ({
        id: a.id,
        type: a.type,
        brand: a.brand,
        
        // --- MAPEAMENTO DOS NOVOS CAMPOS ---
        assetTag: a.asset_tag || 'S/TAG', // Etiqueta GSA
        primaryId: a.primary_id || '',    // Serial ou IMEI
        // -----------------------------------

        status: a.status as AssetStatus,
        state: a.physical_condition as AssetState,
        color: a.color || '',
        details: a.details || '',
        value: Number(a.value) || 0,
        currentOwnerType: a.current_owner_type,
        currentOwnerId: a.current_owner_id,
        currentOwnerName: a.current_owner_name,
        region: a.region
      })) || []);

      setEmployees(eData?.map(e => ({ 
        id: e.id, 
        name: e.name, 
        role: e.role, 
        roleId: e.role_id, 
        region: e.region, 
        teamId: e.team_id, 
        active: e.active 
      })) || []);

      setTeams(tData?.map(t => ({ id: t.id, name: t.name, region: t.region, channel: t.channel, leaderId: t.leader_id })) || []);
      setRoles(rData?.map(r => ({ id: r.id, code: r.code, description: r.description, region: r.region, teamId: r.team_id, status: r.status })) || []);
      setMovements(mData?.map(m => ({
        id: m.id, assetId: m.asset_id, date: m.date,
        fromOwnerType: m.from_owner_type, fromOwnerId: m.from_owner_id, fromOwnerName: m.from_owner_name,
        toOwnerType: m.to_owner_type, toOwnerId: m.to_owner_id, toOwnerName: m.to_owner_name,
        reason: m.reason, observations: m.observations, registeredBy: m.registered_by
      })) || []);

    } catch (error) { console.error('Sync Error:', error); } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    setIsLoading(true);
    fetchData(); 
  }, []);

  const handleDbOperation = async (operation: any) => {
    const { error } = await operation;
    if (error) {
      alert('Erro na operação: ' + error.message);
      console.error(error);
    } else {
      fetchData();
    }
  };

  const onUpdateTeam = (t: Team) => {
    const update = async () => {
      const { error } = await supabase.from('teams').update({ name: t.name, region: t.region, channel: t.channel, leader_id: t.leaderId || null }).eq('id', t.id);
      if (t.leaderId && !error) await supabase.from('employees').update({ team_id: t.id }).eq('id', t.leaderId);
      if (error) alert(error.message);
      fetchData();
    };
    update();
  };

  const handleConfirmMovement = async (newMovements: Partial<Movement>[], newStatus: AssetStatus, newOwner: { type: OwnerType, id: string, name: string }) => {
    try {
      const movementsToInsert = newMovements.map(m => ({
        asset_id: m.assetId,
        from_owner_type: m.fromOwnerType, from_owner_id: m.fromOwnerId, from_owner_name: m.fromOwnerName,
        to_owner_type: m.toOwnerType, to_owner_id: m.toOwnerId, to_owner_name: m.toOwnerName,
        reason: m.reason, observations: m.observations, registered_by: m.registeredBy, date: m.date
      }));
      await supabase.from('movements').insert(movementsToInsert);
      
      const assetUpdates = newMovements.map(m => 
        supabase.from('assets').update({
          status: newStatus, 
          current_owner_type: newOwner.type,
          current_owner_id: newOwner.id,
          current_owner_name: newOwner.name
        }).eq('id', m.assetId)
      );
      await Promise.all(assetUpdates);
      await fetchData();
      setIsMovementModalOpen(false);
      setAssetsToMove([]);
    } catch (error: any) { alert('Erro: ' + error.message); }
  };

  const renderContent = () => {
    if (isLoading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-gsa-blue" size={48} /></div>;

    switch (currentView) {
      case 'DASHBOARD': return <Dashboard assets={assets} />;
      case 'ASSETS': return (
        <AssetList 
          assets={assets} onViewDetail={(id) => { setSelectedAssetId(id); setCurrentView('DETAILS'); }}
          onInitiateMove={(list) => { setAssetsToMove(list); setIsMovementModalOpen(true); }} 
          onDelete={(id) => handleDbOperation(supabase.from('assets').delete().eq('id', id))}
          onEdit={() => {}} searchQuery={searchQuery}
        />
      );
      case 'DETAILS':
        const asset = assets.find(a => a.id === selectedAssetId);
        return asset ? <AssetDetail asset={asset} movements={movements} onBack={() => setCurrentView('ASSETS')} /> : null;
      case 'TEAMS': return (
        <TeamView teams={teams} employees={employees} assets={assets}
          onAddMember={(tId, eId) => handleDbOperation(supabase.from('employees').update({ team_id: tId }).eq('id', eId))}
          onRemoveMember={(eId) => handleDbOperation(supabase.from('employees').update({ team_id: null }).eq('id', eId))}
          onDeleteTeam={(id) => handleDbOperation(supabase.from('teams').delete().eq('id', id))}
          onEditTeam={() => setCurrentView('ADMIN')} 
        />
      );
      case 'MOVEMENTS': return <MovementHistory movements={movements} assets={assets} />;
      case 'ADMIN': return (
        <AdminPanel 
          assets={assets} employees={employees} teams={teams} roles={roles}
          
          onAddAsset={(a) => handleDbOperation(supabase.from('assets').insert([{ 
            type: a.type, brand: a.brand, 
            asset_tag: a.assetTag,   // Novo
            primary_id: a.primaryId, // Novo
            status: AssetStatus.EM_ESTOQUE, physical_condition: a.state, 
            color: a.color, details: a.details, value: a.value,
            current_owner_type: OwnerType.ESTOQUE, current_owner_id: STOCK_OWNER_ID, current_owner_name: STOCK_OWNER_NAME 
          }]))}
          
          onUpdateAsset={(a) => handleDbOperation(supabase.from('assets').update({ 
            type: a.type, brand: a.brand, 
            asset_tag: a.assetTag,   // Novo
            primary_id: a.primaryId, // Novo
            physical_condition: a.state, color: a.color, details: a.details, value: a.value
          }).eq('id', a.id))}
          
          onDeleteAsset={(id) => handleDbOperation(supabase.from('assets').delete().eq('id', id))}
          
          onAddEmployee={(e) => handleDbOperation(supabase.from('employees').insert([{ 
            name: e.name, role: e.role, role_id: e.roleId || null, region: e.region, team_id: e.teamId || null, active: true 
          }]))}
          
          onUpdateEmployee={(e) => handleDbOperation(supabase.from('employees').update({ 
            name: e.name, role: e.role, role_id: e.roleId || null, region: e.region, team_id: e.teamId || null, active: e.active 
          }).eq('id', e.id))}
          
          onDeleteEmployee={(id) => handleDbOperation(supabase.from('employees').delete().eq('id', id))}
          
          onAddTeam={(t) => handleDbOperation(supabase.from('teams').insert([{ name: t.name, region: t.region, channel: t.channel }]))}
          onUpdateTeam={onUpdateTeam}
          onDeleteTeam={(id) => handleDbOperation(supabase.from('teams').delete().eq('id', id))}
          
          onAddRole={(r) => handleDbOperation(supabase.from('roles').insert([{ code: r.code, description: r.description, region: r.region, team_id: r.teamId || null, status: 'VAGA_ABERTA' }]))}
          onUpdateRole={(r) => handleDbOperation(supabase.from('roles').update({ code: r.code, description: r.description, status: r.status }).eq('id', r.id))}
          onDeleteRole={(id) => handleDbOperation(supabase.from('roles').delete().eq('id', id))}
        />
      );
      default: return null;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} onSearch={setSearchQuery} searchValue={searchQuery}>
      {renderContent()}
      {isMovementModalOpen && <MovementForm selectedAssets={assetsToMove} employees={employees} onClose={() => { setIsMovementModalOpen(false); setAssetsToMove([]); }} onSubmit={handleConfirmMovement} />}
    </Layout>
  );
};

export default App;