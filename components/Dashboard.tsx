import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Asset, AssetStatus, AssetType, Region } from '../types';
import { Smartphone, Laptop, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardProps {
  assets: Asset[];
}

export const Dashboard: React.FC<DashboardProps> = ({ assets }) => {
  
  // Stats Calculation
  const totalAssets = assets.length;
  const inUse = assets.filter(a => a.status === AssetStatus.EM_USO).length;
  const inStock = assets.filter(a => a.status === AssetStatus.EM_ESTOQUE).length;
  const maintenance = assets.filter(a => a.status === AssetStatus.EM_MANUTENCAO).length;

  // Chart Data Preparation
  const statusData = [
    { name: 'Em Uso', value: inUse, color: '#0047AB' }, // GSA Blue
    { name: 'Em Estoque', value: inStock, color: '#76BC21' }, // GSA Green
    { name: 'Manutenção', value: maintenance, color: '#F59E0B' }, // Amber
    { name: 'Baixado/Perdido', value: assets.filter(a => a.status === AssetStatus.BAIXADO || a.status === AssetStatus.PERDIDO).length, color: '#EF4444' } // Red
  ];

  const typeData = Object.values(AssetType).map(type => ({
    name: type,
    count: assets.filter(a => a.type === type).length
  })).filter(d => d.count > 0);

  const regionData = Object.values(Region).map(region => ({
    name: region,
    count: assets.filter(a => a.region === region).length
  })).filter(d => d.count > 0);

  const StatCard = ({ title, value, icon: Icon, colorClass, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-4 rounded-full ${colorClass} bg-opacity-20`}>
        <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Ativos" 
          value={totalAssets} 
          icon={Laptop} 
          colorClass="bg-blue-600"
          subtext="Base completa"
        />
        <StatCard 
          title="Em Uso" 
          value={inUse} 
          icon={CheckCircle} 
          colorClass="bg-green-600"
          subtext={`${((inUse/totalAssets)*100).toFixed(1)}% da base`}
        />
        <StatCard 
          title="Em Estoque" 
          value={inStock} 
          icon={Smartphone} 
          colorClass="bg-gsa-green"
          subtext="Disponível para alocação"
        />
        <StatCard 
          title="Em Manutenção" 
          value={maintenance} 
          icon={AlertTriangle} 
          colorClass="bg-amber-500"
          subtext="Aguardando reparo"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Assets by Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-gsa-green pl-3">Status dos Ativos</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assets by Region Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-gsa-blue pl-3">Ativos por Região</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="count" name="Quantidade" fill="#0047AB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Charts Row 2 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-slate-500 pl-3">Distribuição por Tipo de Ativo</h3>
        <div className="h-64 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" name="Quantidade" fill="#76BC21" radius={[4, 4, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};