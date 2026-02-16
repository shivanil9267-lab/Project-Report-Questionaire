import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Sun, Moon, Database, ChevronDown, 
  ExternalLink, FileText, BarChart2, Shield, Share2, Copy 
} from 'lucide-react';
import { SurveyForm } from './components/SurveyForm';
import { PublicCharts } from './components/Charts';
import { AdminDashboard } from './components/AdminDashboard';
import { Button } from './components/Button';
import { getResponses } from './services/storageService';
import { SurveyData } from './types';

// Drive Link Constant
const DRIVE_LINK = "https://drive.google.com/drive/folders/1RahLUz_Hr5rT2kupss7dcvapc1TIwAGX?usp=drive_link";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [responses, setResponses] = useState<SurveyData[]>([]);
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const [showSurvey, setShowSurvey] = useState(false);

  // Initialize Theme & Data
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
    const loadData = () => setResponses(getResponses());
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollToSection = (id: string) => {
    setCurrentView('home');
    setShowSurvey(false);
    setMobileMenuOpen(false);
    // Simple timeout to allow view switch before scroll
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStartSurvey = () => {
    setCurrentView('home');
    setShowSurvey(true);
    setTimeout(() => {
      document.getElementById('survey-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Robust Copy Function
  const copyToClipboard = (text: string) => {
    const fallbackCopy = () => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      
      // Ensure textarea is not visible but part of DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('Link copied to clipboard!');
        } else {
          alert('Could not copy link automatically. Please copy the URL from the address bar.');
        }
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        alert('Could not copy link automatically. Please copy the URL from the address bar.');
      }
      
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => {
          console.warn('Clipboard API failed, trying fallback...', err);
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Economic Cost of Poor Civic Sense',
      text: 'Participate in this academic research study on civic behaviour in India.',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share API failed or cancelled, falling back to clipboard', err);
        copyToClipboard(window.location.href);
      }
    } else {
      copyToClipboard(window.location.href);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => { setCurrentView('home'); setShowSurvey(false); window.scrollTo(0,0); }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-india-saffron via-white to-india-green rounded-full border border-gray-200 mr-2 shadow-sm"></div>
              <span className="font-bold text-lg md:text-xl text-gray-800 dark:text-white tracking-tight">
                Civic<span className="text-india-saffron">Cost</span><span className="text-india-green">India</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('about')} className="text-gray-600 dark:text-gray-300 hover:text-india-saffron transition-colors">About</button>
              <button onClick={() => scrollToSection('impact')} className="text-gray-600 dark:text-gray-300 hover:text-india-saffron transition-colors">Impact</button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-600 dark:text-gray-300 hover:text-india-saffron transition-colors">Contact</button>
              <Button onClick={handleStartSurvey} size="sm" variant="primary">Take Survey</Button>
              <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-india-blue dark:text-blue-400" title="Share Survey">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center">
              <button onClick={handleShare} className="p-2 mr-2 text-india-blue dark:text-blue-400">
                <Share2 className="w-5 h-5" />
              </button>
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 mr-2">
                 {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                {mobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 animate-fade-in">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <button onClick={() => scrollToSection('about')} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50">About</button>
              <button onClick={() => scrollToSection('impact')} className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50">Impact</button>
              <Button onClick={handleStartSurvey} className="w-full mt-4">Take Survey</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="pt-16 flex-grow">
        {currentView === 'admin' ? (
          <AdminDashboard data={responses} onLogout={() => setCurrentView('home')} />
        ) : (
          <>
            {/* Hero Section */}
            {!showSurvey && (
              <section className="relative overflow-hidden">
                {/* Simulated Split Background with Overlay */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src="https://picsum.photos/1920/1080?grayscale" 
                    alt="Indian City" 
                    className="w-full h-full object-cover opacity-20 dark:opacity-10"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-india-saffron/10 via-transparent to-india-green/10 pointer-events-none"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col items-center text-center">
                  <div className="inline-block p-1 px-3 mb-6 rounded-full bg-blue-100 text-india-blue font-semibold text-sm border border-blue-200 shadow-sm animate-bounce-slow">
                    Academic Research Study
                  </div>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                    Economic Cost of <br className="hidden md:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-india-saffron to-red-600">Poor Civic Sense</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mb-10 font-light">
                    An empirical study analysing the direct and indirect economic impact of irresponsible civic behaviour in Indian cities.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button onClick={handleStartSurvey} size="lg" className="shadow-xl shadow-orange-500/20">
                      Fill Questionnaire
                    </Button>
                  </div>

                  {/* Live Counter */}
                  <div className="mt-16 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 max-w-md w-full animate-fade-in-up">
                    <p className="text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">Total Responses Collected</p>
                    <div className="text-5xl font-mono font-bold text-india-blue dark:text-blue-400">
                      {responses.length.toString().padStart(4, '0')}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Survey Container (Conditional) */}
            {showSurvey && (
              <section id="survey-container" className="py-12 bg-gray-50 dark:bg-slate-900 min-h-screen">
                <div className="container mx-auto px-4">
                  <div className="mb-8 text-center">
                    <button 
                      onClick={() => setShowSurvey(false)} 
                      className="text-gray-500 hover:text-india-blue flex items-center justify-center mx-auto mb-4"
                    >
                       <ChevronDown className="rotate-90 w-4 h-4 mr-1" /> Return to Home
                    </button>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Participation Survey</h2>
                    <p className="text-gray-600 dark:text-gray-400">Estimated time: 2 minutes</p>
                  </div>
                  <SurveyForm 
                    onComplete={() => setTimeout(() => setResponses(getResponses()), 500)} 
                    onClose={() => {
                      setShowSurvey(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              </section>
            )}

            {/* Policy & Impact Section */}
            <section id="impact" className="py-16 bg-white dark:bg-slate-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Economic & Policy Analysis</h2>
                  <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400">
                    Estimates based on Boston Consulting Group (BCG) congestion reports, official municipal budgets (BMC/BBMP), and World Bank sanitation impact data for major Indian metros.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-12">
                   {/* Cost Table */}
                   <div className="bg-gray-50 dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700">
                      <div className="p-6 border-b border-gray-200 dark:border-slate-700 bg-india-blue/5">
                        <h3 className="text-xl font-bold text-india-blue dark:text-blue-300">Annual Cost Estimation (Per Major Metro)</h3>
                      </div>
                      <div className="p-6">
                        <table className="w-full">
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                            {[
                              { label: 'Traffic Congestion Loss', val: '₹ 38,000 - 63,000 Cr', trend: 'Critical' },
                              { label: 'Municipal Cleaning Cost', val: '₹ 3,000 - 5,500 Cr', trend: 'High' },
                              { label: 'Healthcare Burden (Sanitation)', val: '₹ 10,000 - 15,000 Cr', trend: 'Rising' },
                              { label: 'Tourism Revenue Loss', val: '₹ 750 Cr', trend: 'Estimated' },
                            ].map((row, i) => (
                              <tr key={i}>
                                <td className="py-4 text-gray-600 dark:text-gray-300">{row.label}</td>
                                <td className="py-4 text-right font-bold text-gray-900 dark:text-white">{row.val}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-t-2 border-gray-300 dark:border-slate-600">
                             <tr>
                                <td className="py-4 font-bold text-lg text-red-600">Total Economic Loss</td>
                                <td className="py-4 text-right font-bold text-lg text-red-600">&gt; ₹ 52,000 Cr</td>
                             </tr>
                          </tfoot>
                        </table>
                      </div>
                   </div>

                   {/* Cost Benefit Card */}
                   <div className="bg-gradient-to-br from-india-saffron to-orange-600 rounded-xl shadow-lg text-white p-8">
                      <h3 className="text-2xl font-bold mb-6">Cost-Benefit of Intervention</h3>
                      <p className="mb-6 opacity-90 leading-relaxed">
                        Comprehensive infrastructure upgrades and strict enforcement yield significant economic returns by reducing healthcare burdens and recovering lost productivity.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-white/20 p-4 rounded-lg backdrop-blur-md">
                           <span>Cost of Intervention (Infrastructure)</span>
                           <span className="font-bold">~ ₹ 12,000 Cr</span>
                        </div>
                         <div className="flex items-center justify-between bg-white/20 p-4 rounded-lg backdrop-blur-md">
                           <span>Expected Annual Savings</span>
                           <span className="font-bold">~ ₹ 54,000 Cr</span>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/30 text-center">
                          <span className="text-sm font-semibold uppercase tracking-wider opacity-80">ROI Factor</span>
                          <div className="text-4xl font-extrabold mt-1">4.5x</div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Data Sources Footer */}
                <div className="bg-blue-50 dark:bg-slate-800/50 rounded-lg p-6 border border-blue-100 dark:border-slate-700">
                   <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                      <Database className="w-4 h-4 mr-2" /> Verified Data Sources
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <a href="https://web-assets.bcg.com/img-src/BCG-Unlocking-Cities-Ridesharing-India_tcm9-185213.pdf" target="_blank" rel="noreferrer" className="flex items-center text-india-blue dark:text-blue-400 hover:underline">
                         <ExternalLink className="w-3 h-3 mr-2" /> BCG "Unlocking Cities" Report (Traffic)
                      </a>
                      <a href="https://timesofindia.indiatimes.com/city/bengaluru/bengalurus-civic-budget-solid-waste-management-budget-boosted-to-1400-crore/articleshow/119722324.cms" target="_blank" rel="noreferrer" className="flex items-center text-india-blue dark:text-blue-400 hover:underline">
                         <ExternalLink className="w-3 h-3 mr-2" /> Official Municipal Budgets (BMC/BBMP)
                      </a>
                      <a href="https://www.worldbank.org/en/news/feature/2011/01/13/india-cost-of-inadequate-sanitation" target="_blank" rel="noreferrer" className="flex items-center text-india-blue dark:text-blue-400 hover:underline">
                         <ExternalLink className="w-3 h-3 mr-2" /> World Bank: Cost of Inadequate Sanitation
                      </a>
                       <a href="https://news.un.org/en/story/2014/11/484032" target="_blank" rel="noreferrer" className="flex items-center text-india-blue dark:text-blue-400 hover:underline">
                         <ExternalLink className="w-3 h-3 mr-2" /> UN/WHO Benefit-Cost Analysis
                      </a>
                   </div>
                </div>

              </div>
            </section>

            {/* Researcher Info */}
            <section id="contact" className="py-16 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
               <div className="max-w-4xl mx-auto px-4 text-center">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center">
                     <Shield className="w-10 h-10 text-gray-400" />
                  </div>
                  
                  {/* Principal Researcher */}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Principal Researcher</h2>
                  <p className="text-xl text-india-blue dark:text-blue-400 font-semibold mt-2">Shivam Tripathi</p>
                  <p className="text-md text-gray-700 dark:text-gray-300 mt-1">Bachelor of Arts (Delhi University)</p>
                  <p className="text-md text-gray-700 dark:text-gray-300">Student - MA (Economics) (IGNOU)</p>
                  <a href="mailto:tripathishivanil9267@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-india-saffron mt-1 block mb-10">
                    tripathishivanil9267@gmail.com
                  </a>

                  {/* Project Supervisor */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Supervisor</h2>
                  <p className="text-lg text-india-green dark:text-green-400 font-semibold mt-2">Prof. Deepika Sharma</p>
                  <p className="text-md text-gray-700 dark:text-gray-300 mt-1">Professor</p>
                  <p className="text-md text-gray-700 dark:text-gray-300">PGDAV (Eve) College, Delhi University</p>
                  
                  <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                     <p className="text-sm text-gray-600 dark:text-gray-300">
                        "This research aims to quantify the invisible tax we pay due to lack of civic sense. Your data is crucial for policy formulation."
                     </p>
                  </div>
               </div>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
           <div>
              <h4 className="text-white font-bold text-lg mb-4">Civic Sense Study</h4>
              <p className="text-sm text-gray-400">
                Academic Research Project <br/>
                Year: 2025-26
              </p>
           </div>
           <div>
              <h4 className="text-white font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                 <li><a href={DRIVE_LINK} target="_blank" rel="noreferrer" className="hover:text-india-saffron">Research Drive Folder</a></li>
                 <li><button onClick={() => scrollToSection('contact')} className="hover:text-india-saffron">Contact Researcher</button></li>
                 <li><button onClick={() => setCurrentView('admin')} className="hover:text-india-saffron">Admin Login</button></li>
              </ul>
           </div>
           <div>
              <h4 className="text-white font-bold text-lg mb-4">Privacy</h4>
              <p className="text-xs text-gray-500 mb-2">
                 Data collected is strictly for academic research purposes. No personally identifiable information (PII) is shared publicly.
              </p>
              <div className="flex justify-center md:justify-start space-x-4 mt-4">
                 {/* Social placeholders */}
                 <div onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Check out this research on the Economic Cost of Poor Civic Sense in India: " + window.location.href)}`, '_blank')} className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-india-saffron transition-colors cursor-pointer">
                    <Share2 className="w-4 h-4" />
                 </div>
              </div>
           </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
           © 2024 Shivam Tripathi. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default App;