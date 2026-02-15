import React, { useState, useMemo, useEffect } from 'react';
import { SurveyData } from '../types';
import { clearResponses, exportToCSV } from '../services/storageService';
import { Button } from './Button';
import { Lock, Download, Trash2, LogOut, Activity, TrendingUp, AlertTriangle, Users, BarChart2, Share2, Copy, Check, Globe } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter
} from 'recharts';

interface AdminProps {
  data: SurveyData[];
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminProps> = ({ data, onLogout }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Check if running locally
    const hostname = window.location.hostname;
    setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
    setCurrentUrl(window.location.origin);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'shivanil9971@') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const dashboardData = useMemo(() => {
    if (!data.length) return null;
    const total = data.length;
    
    // 1. Demographics
    const ageMap: Record<string, number> = { "18-24": 21, "25-34": 30, "35-50": 42, "50+": 60 };
    const avgAge = Math.round(data.reduce((acc, curr) => acc + (ageMap[curr.demographics.age] || 25), 0) / total);
    
    // 2. Behavior Averages (Radar Chart)
    const behaviors = ['littering', 'spitting', 'trafficViolations', 'encroachment', 'propertyDamage'] as const;
    const behaviorProfile = behaviors.map(b => {
      const sum = data.reduce((acc, curr) => acc + (curr.behavior[b] || 0), 0);
      const label = b.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return { 
        subject: label, 
        A: parseFloat((sum / total).toFixed(2)), 
        fullMark: 5 
      };
    });

    // 3. Behavior Frequency (Stacked Bar)
    const behaviorFreq = behaviors.map(b => {
       const counts = {1:0, 2:0, 3:0, 4:0, 5:0};
       data.forEach(d => {
           const val = d.behavior[b] as 1|2|3|4|5;
           if(counts[val] !== undefined) counts[val]++;
       });
       const label = b.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
       return {
           name: label,
           "Very Low (1)": counts[1],
           "Low (2)": counts[2],
           "Moderate (3)": counts[3],
           "High (4)": counts[4],
           "Severe (5)": counts[5],
       };
    });

    // 4. Scatter: Behavior Score vs Traffic Delay
    const correlationData = data.map(d => {
        const totalScore = behaviors.reduce((acc, b) => acc + d.behavior[b], 0);
        const avgScore = parseFloat((totalScore / 5).toFixed(2));
        return { 
            x: avgScore, 
            y: d.economic.trafficDelay,
            z: 1 // size
        };
    });

    // 5. Income vs Awareness
    const incomeGroups: Record<string, { name: string; Fully: number; Partially: number; Not: number }> = {};
    data.forEach(d => {
        const inc = d.demographics.income || 'Unknown';
        if (!incomeGroups[inc]) incomeGroups[inc] = { name: inc, Fully: 0, Partially: 0, Not: 0 };
        const aware = d.awareness.swachhBharat || "";
        if (aware.includes('Fully')) incomeGroups[inc].Fully++;
        else if (aware.includes('Partially')) incomeGroups[inc].Partially++;
        else incomeGroups[inc].Not++;
    });
    const incomeAwarenessData = Object.values(incomeGroups);

    // 6. Medical Cost
    const medicalCostCount = data.filter(d => d.economic.medicalExpenses !== 'None').length;
    const medicalCostPerc = Math.round((medicalCostCount / total) * 100);

    return { total, avgAge, behaviorProfile, behaviorFreq, correlationData, incomeAwarenessData, medicalCostPerc };
  }, [data]);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
      clearResponses();
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-2xl max-w-sm w-full border border-gray-100 dark:border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-india-saffron/10 rounded-full">
                <Lock className="w-8 h-8 text-india-saffron" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-india-saffron focus:outline-none"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full">Unlock Dashboard</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-india-blue dark:text-blue-400 flex items-center">
             <BarChart2 className="w-8 h-8 mr-3" />
             Researcher Dashboard
           </h2>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Authorized access: Shivam Tripathi</p>
        </div>
        <div className="flex space-x-3">
             <Button onClick={exportToCSV} variant="primary" size="sm" className="flex items-center">
                <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={handleReset} variant="danger" size="sm" className="flex items-center">
                <Trash2 className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button variant="outline" onClick={onLogout} size="sm" className="flex items-center">
                <LogOut className="w-4 h-4 mr-2" /> Exit
            </Button>
        </div>
      </div>

      {/* Distribution Link Section */}
      <div className={`border rounded-xl p-6 mb-8 flex flex-col gap-4 shadow-sm ${isLocalhost ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              {isLocalhost ? <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" /> : <Globe className="w-5 h-5 mr-2 text-india-blue dark:text-blue-400" />}
              Survey Link for Respondents
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {isLocalhost 
                ? "WARNING: You are on a local server (Localhost). This link will NOT work for other people." 
                : "Copy this link to send to respondents via WhatsApp, Email, or Social Media."}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-300 dark:border-slate-700">
            <code className="text-sm px-2 text-gray-600 dark:text-gray-300 font-mono truncate max-w-[200px] md:max-w-[300px]">
              {currentUrl}
            </code>
            <Button size="sm" onClick={handleCopyLink} className="flex items-center whitespace-nowrap min-w-[120px] justify-center">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>
          </div>
        </div>
        
        {isLocalhost && (
          <div className="text-xs text-orange-800 bg-orange-100 p-3 rounded-md">
            <strong>How to fix this?</strong> To get a link that works for everyone, you must <u>deploy</u> this website. 
            Use free services like <strong>Vercel, Netlify, or GitHub Pages</strong>.
          </div>
        )}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-l-4 border-india-saffron">
          <div className="flex justify-between items-start">
            <div>
               <p className="text-gray-500 text-sm dark:text-gray-400">Total Responses</p>
               <p className="text-4xl font-bold text-gray-900 dark:text-white">{dashboardData?.total || 0}</p>
            </div>
            <Users className="text-india-saffron w-6 h-6 opacity-50" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-l-4 border-india-green">
          <div className="flex justify-between items-start">
             <div>
               <p className="text-gray-500 text-sm dark:text-gray-400">Avg. Respondent Age</p>
               <p className="text-4xl font-bold text-gray-900 dark:text-white">{dashboardData?.avgAge || 0}</p>
             </div>
             <Activity className="text-india-green w-6 h-6 opacity-50" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border-l-4 border-india-blue">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-gray-500 text-sm dark:text-gray-400">Reporting Health Costs</p>
                <p className="text-4xl font-bold text-gray-900 dark:text-white">{dashboardData?.medicalCostPerc || 0}%</p>
             </div>
             <AlertTriangle className="text-india-blue w-6 h-6 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-india-saffron to-orange-600 p-6 rounded-lg shadow-md text-white">
           <p className="text-white/80 text-sm">Most Frequent Violation</p>
           <p className="text-2xl font-bold mt-1">Traffic Violations</p>
           <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded">Top Reported Issue</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Radar Chart: Mean Civic Behaviour */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-6 flex items-center text-gray-800 dark:text-white">
              <TrendingUp className="w-5 h-5 mr-2 text-india-saffron" />
              Mean Civic Behaviour Profile (1-5 Scale)
          </h3>
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dashboardData?.behaviorProfile || []}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} />
                  <Radar name="Avg Score" dataKey="A" stroke="#FF9933" fill="#FF9933" fillOpacity={0.6} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </RadarChart>
             </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">Higher score indicates higher frequency of violation</p>
        </div>

        {/* Scatter Plot: Correlation */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold mb-6 flex items-center text-gray-800 dark:text-white">
              <Activity className="w-5 h-5 mr-2 text-india-blue" />
              Correlation: Violation Intensity vs. Traffic Delay
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis type="number" dataKey="x" name="Avg Behavior Score" unit="/5" stroke="#888" label={{ value: 'Behavior Score', position: 'insideBottom', offset: -10 }} />
                <YAxis type="number" dataKey="y" name="Traffic Delay" unit=" min" stroke="#888" label={{ value: 'Delay (min)', angle: -90, position: 'insideLeft' }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px' }} />
                <Scatter name="Responses" data={dashboardData?.correlationData || []} fill="#000080" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">Each dot represents a respondent. X: Avg Violation Score, Y: Reported Daily Delay</p>
        </div>

        {/* Stacked Bar: Behavior Frequency Distribution (Heatmap style) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
           <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">
              Frequency Distribution of Violations
           </h3>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={dashboardData?.behaviorFreq || []} layout="vertical" margin={{ left: 40 }}>
                 <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                 <XAxis type="number" stroke="#888" />
                 <YAxis dataKey="name" type="category" width={100} stroke="#888" tick={{fontSize: 12}} />
                 <Tooltip contentStyle={{ borderRadius: '8px' }} />
                 <Legend wrapperStyle={{ fontSize: '12px' }} />
                 <Bar dataKey="Very Low (1)" stackId="a" fill="#138808" />
                 <Bar dataKey="Low (2)" stackId="a" fill="#84cc16" />
                 <Bar dataKey="Moderate (3)" stackId="a" fill="#eab308" />
                 <Bar dataKey="High (4)" stackId="a" fill="#f97316" />
                 <Bar dataKey="Severe (5)" stackId="a" fill="#ef4444" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Stacked Bar: Income vs Awareness */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
           <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">
              Swachh Bharat Awareness by Income Group
           </h3>
           <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={dashboardData?.incomeAwarenessData || []}>
                 <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                 <XAxis dataKey="name" stroke="#888" />
                 <YAxis stroke="#888" />
                 <Tooltip contentStyle={{ borderRadius: '8px', color: '#000' }} />
                 <Legend wrapperStyle={{ fontSize: '12px' }} />
                 <Bar dataKey="Fully" stackId="a" fill="#138808" name="Fully Aware" />
                 <Bar dataKey="Partially" stackId="a" fill="#FF9933" name="Partially Aware" />
                 <Bar dataKey="Not" stackId="a" fill="#ef4444" name="Not Aware" />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
        <h4 className="font-bold text-yellow-800 dark:text-yellow-400">Researcher Note</h4>
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
            This dashboard is confidential. Ensure all data exports are handled according to university ethics guidelines.
            "Civic Behaviour Profile" uses a mean score of self-reported behavior (1=Never, 5=Frequently).
        </p>
      </div>
    </div>
  );
};