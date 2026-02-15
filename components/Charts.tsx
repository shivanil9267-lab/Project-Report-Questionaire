import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { SurveyData } from '../types';

interface ChartsProps {
  data: SurveyData[];
}

const COLORS = ['#FF9933', '#138808', '#000080', '#FF8042', '#0088FE'];

export const PublicCharts: React.FC<ChartsProps> = ({ data }) => {
  
  const violationData = useMemo(() => {
    if (data.length === 0) return [{ name: 'No Data', value: 0 }];
    const counts = { Littering: 0, Traffic: 0, Spitting: 0 };
    data.forEach(d => {
      counts.Littering += d.behavior.littering;
      counts.Traffic += d.behavior.trafficViolations;
      counts.Spitting += d.behavior.spitting;
    });
    return Object.entries(counts).map(([name, value]) => ({ 
      name, 
      value: +(value / data.length).toFixed(1) // Average score
    }));
  }, [data]);

  const costData = useMemo(() => {
    if (data.length === 0) return [{ name: 'No Data', value: 1 }];
    const counts = { Medical: 0, Household: 0, Other: 0 };
    data.forEach(d => {
      // Simplified categorization logic for demo
      if (d.economic.medicalExpenses !== 'None') counts.Medical++;
      if (d.economic.extraHouseholdCost !== 'None') counts.Household++;
      else counts.Other++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  const trafficData = useMemo(() => {
     if (data.length === 0) return [];
     // Simulate a time-series or sequential view of last 10 entries for line chart
     return data.slice(-10).map((d, i) => ({
        index: i + 1,
        delay: d.economic.trafficDelay
     }));
  }, [data]);

  const avgDelay = useMemo(() => {
    if (data.length === 0) return 0;
    const total = data.reduce((acc, curr) => acc + curr.economic.trafficDelay, 0);
    return (total / data.length).toFixed(0);
  }, [data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* Bar Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-t-4 border-india-saffron">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Avg. Civic Violation Intensity (1-5 Scale)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={violationData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="#888888" />
              <YAxis stroke="#888888" domain={[0, 5]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#000' }}
              />
              <Bar dataKey="value" fill="#FF9933" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-t-4 border-india-green">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Economic Impact Distribution</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

       {/* Line Chart */}
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-t-4 border-india-blue lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Traffic Delay Trend (Last 10 Responses)
            <span className="ml-4 text-sm font-normal text-india-saffron">Avg Delay: {avgDelay} mins</span>
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="index" stroke="#888888" label={{ value: 'Respondent', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#888888" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <Line type="monotone" dataKey="delay" stroke="#000080" strokeWidth={3} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
