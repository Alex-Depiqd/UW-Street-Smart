import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, MapPin, Home, ListChecks, CalendarClock, MessageSquare, 
  Download, QrCode, Link2, Plus, ChevronRight, X, CheckCircle, 
  Clock, Phone, FileText, FolderOpen, Share2, UploadCloud, 
  Moon, Sun, Settings, Bell, Search, Filter, MoreVertical,
  User, LogOut, HelpCircle, Info, Shield, Database, BarChart3, Target,
  Upload, Trash2, AlertTriangle
} from "lucide-react";

// --- Mock Seed Data ---
const seedScripts = {
  opener: [
    {
      id: "op1",
      title: "Door opener (15s)",
      content:
        "Hi! I'm local and helping neighbours shave a chunk off household bills—no obligation. I've popped a letter through; if you're open, I can check your postcode now and see if you qualify for the best UW bundles. Takes two minutes.",
    },
    {
      id: "op2",
      title: "Evening approach",
      content:
        "Good evening! I'm from UW and I've been helping families in this area save money on their bills. I left a letter earlier - have you had a chance to look at it?",
    },
  ],
  objection: [
    {
      id: "ob1",
      title: "Not interested → graceful exit",
      content:
        "Totally fine. If things change, the letter's got a QR to a 60‑second checker—no sales calls, just the numbers. Have a great day!",
    },
    {
      id: "ob2",
      title: "Already with UW",
      content:
        "That's great! You might be eligible for additional savings or better bundles. Would you like me to check your current setup?",
    },
  ],
  closer: [
    {
      id: "cl1",
      title: "Soft close",
      content:
        "If you text me your postcode I'll send a quick checker link—no pressure. If it looks good, we can book a 10‑minute run‑through.",
    },
    {
      id: "cl2",
      title: "Follow-up close",
      content:
        "Perfect! I'll send you the details and we can arrange a time that works for you. When would be best?",
    },
  ],
  sms: [
    {
      id: "sm1",
      title: "WhatsApp Prefill CTA",
      content:
        "Hi Alex, I've got your Neighbour Letter. My postcode is _______. Can you check if I'm eligible for the best bundle?",
    },
    {
      id: "sm2",
      title: "Follow-up reminder",
      content:
        "Hi! Just following up on our conversation about UW savings. Are you still interested in checking your eligibility?",
    },
  ],
};

const seedCampaigns = [
  {
    id: "c1",
    name: "Elmswell NL – Aug 2025",
    area: "IP30",
    status: "active",
    created_at: "2025-08-01",
    links: {
      connector: "https://example.com/connector",
      quote: "https://example.com/quote",
      booking: "https://example.com/book",
      faq: "https://example.com/faq",
    },
    streets: [
      {
        id: "s1",
        name: "Orchard Way",
        postcode: "IP30 9XX",
        status: "in_progress",
        properties: [
          { id: "p1", label: "1", dropped: true, knocked: true, spoke: false, result: "no_answer" },
          { id: "p2", label: "3", dropped: true, knocked: true, spoke: true, result: "maybe", followUpAt: "2025-08-16T18:00:00" },
          { id: "p3", label: "5", dropped: true, knocked: false, spoke: false, result: "none" },
        ],
      },
      {
        id: "s2",
        name: "Station Road",
        postcode: "IP30 9YY",
        status: "not_started",
        properties: [
          { id: "p4", label: "12", dropped: false, knocked: false, spoke: false, result: "none" },
          { id: "p5", label: "14", dropped: false, knocked: false, spoke: false, result: "none" },
        ],
      },
    ],
  },
  {
    id: "c2",
    name: "Stowmarket NL – Sept 2025",
    area: "IP14",
    status: "draft",
    created_at: "2025-08-15",
    links: {
      connector: "https://example.com/connector",
      quote: "https://example.com/quote",
      booking: "https://example.com/book",
      faq: "https://example.com/faq",
    },
    streets: [],
  },
];

// Utility components
const Chip = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
    success: "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/40 dark:text-secondary-300",
    warning: "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300",
    error: "bg-error-100 text-error-700 dark:bg-error-900/40 dark:text-error-300",
  };
  
  return (
    <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full shadow-sm ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const SectionCard = ({ title, icon: Icon, children, actions, className = "" }) => (
  <div className={`rounded-2xl shadow-soft p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur border border-gray-200/50 dark:border-gray-800/50 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary-600" />}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
    {children}
  </div>
);

const Drawer = ({ open, onClose, title, children, size = "default" }) => {
  const sizes = {
    small: "max-h-[60vh]",
    default: "max-h-[80vh]",
    large: "max-h-[90vh]",
  };
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          className="fixed inset-0 z-50" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl p-4 ${sizes[size]} overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">{title}</h3>
              <button 
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---
export default function App() {
  const [dark, setDark] = useState(true);
  const [view, setView] = useState("dashboard");
  const [campaigns, setCampaigns] = useState(seedCampaigns);
  const [activeCampaignId, setActiveCampaignId] = useState("c1");
  const [activeStreetId, setActiveStreetId] = useState("s1");
  const [activePropertyId, setActivePropertyId] = useState("p2");
  const [showScripts, setShowScripts] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showNewStreetModal, setShowNewStreetModal] = useState(false);
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
  const [showEditStreetModal, setShowEditStreetModal] = useState(false);
  const [showPropertyManagerModal, setShowPropertyManagerModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingStreet, setEditingStreet] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const activeCampaign = useMemo(() => campaigns.find(c => c.id === activeCampaignId), [campaigns, activeCampaignId]);
  const activeStreet = useMemo(() => activeCampaign?.streets.find(s => s.id === activeStreetId), [activeCampaign, activeStreetId]);
  const activeProperty = useMemo(() => activeStreet?.properties.find(p => p.id === activePropertyId), [activeStreet, activePropertyId]);

  // Derived stats for dashboard
  const stats = useMemo(() => {
    let letters = 0, convos = 0, interested = 0, followups = 0;
    activeCampaign?.streets.forEach(s => {
      s.properties.forEach(p => {
        if (p.dropped) letters++;
        if (p.spoke) convos++;
        if (p.result === "maybe" || p.result === "interested") interested++;
        if (p.followUpAt) followups++;
      });
    });
    return { letters, convos, interested, followups };
  }, [activeCampaign]);

  const setProperty = (updates) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== activeCampaignId) return c;
      return {
        ...c,
        streets: c.streets.map(s => {
          if (s.id !== activeStreetId) return s;
          return {
            ...s,
            properties: s.properties.map(p => p.id === activePropertyId ? { ...p, ...updates } : p)
          };
        })
      };
    }));
  };

  const toggleDark = () => setDark(d => !d);

  // Data management functions
  const exportData = () => {
    const data = {
      campaigns,
      settings: { dark },
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uw-street-smart-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.campaigns && Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
          if (data.settings?.dark !== undefined) {
            setDark(data.settings.dark);
          }
          setShowImportModal(false);
          alert('Data imported successfully!');
        } else {
          alert('Invalid data format. Please select a valid export file.');
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const resetData = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    // Reset to truly empty state with just one empty campaign
    const emptyCampaigns = [
      {
        id: "new-campaign",
        name: "New Campaign",
        area: "",
        status: "draft",
        created_at: new Date().toISOString().split('T')[0],
        links: {
          connector: "",
          quote: "",
          booking: "",
          faq: "",
        },
        streets: [],
      }
    ];
    
    setCampaigns(emptyCampaigns);
    setActiveCampaignId("new-campaign");
    setActiveStreetId("");
    setActivePropertyId("");
    setShowResetModal(false);
    alert('All data has been cleared. You can now start fresh with a new campaign.');
  };

  // Campaign and Street management functions
  const createNewCampaign = (campaignData) => {
    const newCampaign = {
      id: `campaign-${Date.now()}`,
      name: campaignData.name,
      area: campaignData.area,
      status: "draft",
      created_at: new Date().toISOString().split('T')[0],
      links: {
        connector: campaignData.connector || "",
        quote: campaignData.quote || "",
        booking: campaignData.booking || "",
        faq: campaignData.faq || "",
      },
      streets: [],
    };
    
    setCampaigns(prev => [...prev, newCampaign]);
    setActiveCampaignId(newCampaign.id);
    setShowNewCampaignModal(false);
    alert('New campaign created successfully!');
  };

  const createNewStreet = (streetData) => {
    const newStreet = {
      id: `street-${Date.now()}`,
      name: streetData.name,
      postcode: streetData.postcode,
      status: "not_started",
      properties: streetData.properties.map((prop, index) => ({
        id: `property-${Date.now()}-${index}`,
        label: prop,
        dropped: false,
        knocked: false,
        spoke: false,
        result: "none"
      }))
    };
    
    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          streets: [...c.streets, newStreet]
        };
      }
      return c;
    }));
    
    setActiveStreetId(newStreet.id);
    setShowNewStreetModal(false);
    alert('New street added successfully!');
  };

  // Edit campaign function
  const editCampaign = (campaignData) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === editingCampaign.id) {
        return {
          ...c,
          name: campaignData.name,
          area: campaignData.area,
          links: {
            connector: campaignData.connector || "",
            quote: campaignData.quote || "",
            booking: campaignData.booking || "",
            faq: campaignData.faq || "",
          }
        };
      }
      return c;
    }));
    setShowEditCampaignModal(false);
    setEditingCampaign(null);
    alert('Campaign updated successfully!');
  };

  // Delete campaign function
  const deleteCampaign = (campaignId) => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      if (activeCampaignId === campaignId) {
        const remainingCampaigns = campaigns.filter(c => c.id !== campaignId);
        if (remainingCampaigns.length > 0) {
          setActiveCampaignId(remainingCampaigns[0].id);
        } else {
          setActiveCampaignId("");
        }
      }
      alert('Campaign deleted successfully!');
    }
  };

  // Edit street function
  const editStreet = (streetData) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          streets: c.streets.map(s => {
            if (s.id === editingStreet.id) {
              return {
                ...s,
                name: streetData.name,
                postcode: streetData.postcode
              };
            }
            return s;
          })
        };
      }
      return c;
    }));
    setShowEditStreetModal(false);
    setEditingStreet(null);
    alert('Street updated successfully!');
  };

  // Delete street function
  const deleteStreet = (streetId) => {
    if (confirm('Are you sure you want to delete this street? This action cannot be undone.')) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === activeCampaignId) {
          return {
            ...c,
            streets: c.streets.filter(s => s.id !== streetId)
          };
        }
        return c;
      }));
      if (activeStreetId === streetId) {
        const activeCampaign = campaigns.find(c => c.id === activeCampaignId);
        const remainingStreets = activeCampaign?.streets.filter(s => s.id !== streetId) || [];
        if (remainingStreets.length > 0) {
          setActiveStreetId(remainingStreets[0].id);
        } else {
          setActiveStreetId("");
        }
      }
      alert('Street deleted successfully!');
    }
  };

  // Property management functions
  const addProperty = (propertyLabel) => {
    const newProperty = {
      id: `property-${Date.now()}`,
      label: propertyLabel,
      dropped: false,
      knocked: false,
      spoke: false,
      result: "none"
    };
    
    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          streets: c.streets.map(s => {
            if (s.id === activeStreetId) {
              return {
                ...s,
                properties: [...s.properties, newProperty]
              };
            }
            return s;
          })
        };
      }
      return c;
    }));
  };

  const removeProperty = (propertyId) => {
    if (confirm('Are you sure you want to remove this property?')) {
      setCampaigns(prev => prev.map(c => {
        if (c.id === activeCampaignId) {
          return {
            ...c,
            streets: c.streets.map(s => {
              if (s.id === activeStreetId) {
                return {
                  ...s,
                  properties: s.properties.filter(p => p.id !== propertyId)
                };
              }
              return s;
            })
          };
        }
        return c;
      }));
    }
  };

  const editPropertyLabel = (propertyId, newLabel) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          streets: c.streets.map(s => {
            if (s.id === activeStreetId) {
              return {
                ...s,
                properties: s.properties.map(p => {
                  if (p.id === propertyId) {
                    return { ...p, label: newLabel };
                  }
                  return p;
                })
              };
            }
            return s;
          })
        };
      }
      return c;
    }));
  };

  // Toggle property status (allows removing status)
  const togglePropertyStatus = (propertyId, status) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          streets: c.streets.map(s => {
            if (s.id === activeStreetId) {
              return {
                ...s,
                properties: s.properties.map(p => {
                  if (p.id === propertyId) {
                    return { ...p, [status]: !p[status] };
                  }
                  return p;
                })
              };
            }
            return s;
          })
        };
      }
      return c;
    }));
  };

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Theme management
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur bg-white/60 dark:bg-gray-950/60 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary-600 flex items-center justify-center shadow text-white font-bold">UW</div>
            <div>
              <div className="font-semibold leading-tight">Street Smart</div>
              <div className="text-xs opacity-70">NL Activity Tracker</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Chip variant="warning" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Offline
              </Chip>
            )}
            <Chip variant="success" className="text-xs">
              <Database className="w-3 h-3 mr-1" />
              Local storage
            </Chip>
            <button 
              onClick={toggleDark} 
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {dark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <SectionCard title="Navigate" icon={FolderOpen}>
            <div className="grid grid-cols-2 gap-2">
              <NavButton icon={<BarChart3 className="w-4 h-4"/>} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
              <NavButton icon={<Target className="w-4 h-4"/>} label="Campaigns" active={view === "campaigns"} onClick={() => setView("campaigns")} />
              <NavButton icon={<MapPin className="w-4 h-4"/>} label="Streets" active={view === "streets"} onClick={() => setView("streets")} />
              <NavButton icon={<FileText className="w-4 h-4"/>} label="Reports" active={view === "reports"} onClick={() => setView("reports")} />
            </div>
            <div className="mt-3 text-xs opacity-70">
              Active: <strong>{activeCampaign?.name}</strong>
            </div>
          </SectionCard>

          <SectionCard title="Quick Drawers" icon={Share2}>
            <div className="grid grid-cols-2 gap-2">
              <NavButton icon={<MessageSquare className="w-4 h-4"/>} label="Scripts" onClick={() => setShowScripts(true)} />
              <NavButton icon={<Link2 className="w-4 h-4"/>} label="Links" onClick={() => setShowLinks(true)} />
            </div>
            <div className="mt-3 text-xs opacity-70">
              Open while on a property to speed up calls and messages.
            </div>
          </SectionCard>

          <SectionCard 
            title="Printables" 
            icon={QrCode}
            actions={
              <button className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Download className="w-4 h-4"/> Export CSV
              </button>
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">Campaign QR (UTM‑tagged)</div>
                <div className="text-xs opacity-70">Scan → tracks street responses</div>
              </div>
              <button className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm flex items-center gap-2 hover:bg-primary-700 transition-colors">
                <QrCode className="w-4 h-4"/> Generate
              </button>
            </div>
          </SectionCard>
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-3 space-y-4">
          {view === "dashboard" && <Dashboard stats={stats} activeCampaign={activeCampaign} onGoStreets={() => setView("streets")} />}
          {view === "campaigns" && (
            <Campaigns 
              campaigns={campaigns} 
              activeId={activeCampaignId} 
              onSelect={(id)=>{setActiveCampaignId(id); setView("streets");}} 
              onCreateNew={() => setShowNewCampaignModal(true)}
              onEdit={(campaign) => {
                setEditingCampaign(campaign);
                setShowEditCampaignModal(true);
              }}
              onDelete={deleteCampaign}
            />
          )}
          {view === "streets" && activeCampaign && (
            <Streets
              campaign={activeCampaign}
              activeStreetId={activeStreetId}
              onSelectStreet={(id)=>{setActiveStreetId(id); setView("streets");}}
              onOpenProperty={(streetId, propId)=>{setActiveStreetId(streetId); setActivePropertyId(propId); setView("property");}}
              onAddStreet={() => setShowNewStreetModal(true)}
              onEditStreet={(street) => {
                setEditingStreet(street);
                setShowEditStreetModal(true);
              }}
              onDeleteStreet={deleteStreet}
              onManageProperties={(street) => {
                setActiveStreetId(street.id);
                setShowPropertyManagerModal(true);
              }}
            />
          )}
          {view === "property" && activeStreet && activeProperty && (
            <PropertyView
              street={activeStreet}
              property={activeProperty}
              onBack={()=>setView("streets")}
              onUpdate={setProperty}
              onShowScripts={()=>setShowScripts(true)}
              onShowLinks={()=>setShowLinks(true)}
              onToggleStatus={togglePropertyStatus}
            />
          )}
          {view === "reports" && <Reports campaigns={campaigns} />}
        </div>
      </div>

      {/* Drawers */}
      <Drawer open={showScripts} onClose={()=>setShowScripts(false)} title="Scripts & Talking Points">
        <ScriptsPanel />
      </Drawer>
      <Drawer open={showLinks} onClose={()=>setShowLinks(false)} title="Quick Links">
        <LinksPanel links={activeCampaign?.links} />
      </Drawer>
      <Drawer open={showSettings} onClose={()=>setShowSettings(false)} title="Settings" size="small">
        <SettingsPanel 
          dark={dark} 
          onToggleDark={toggleDark} 
          onExport={exportData}
          onImport={importData}
          onReset={resetData}
        />
      </Drawer>

      {/* Reset Confirmation Modal */}
      <Drawer open={showResetModal} onClose={()=>setShowResetModal(false)} title="Reset Data" size="small">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div className="text-sm">
              <div className="font-medium text-red-800 dark:text-red-200">Warning</div>
              <div className="text-red-600 dark:text-red-400">This action cannot be undone.</div>
            </div>
          </div>
          
          <div className="text-sm">
            <p className="mb-3">Are you sure you want to reset all data? This will:</p>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Remove all campaigns and activity data</li>
              <li>• Reset to empty state with one new campaign</li>
              <li>• Clear all progress and follow-ups</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={confirmReset}
              className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
            >
              Yes, Reset All Data
            </button>
            <button 
              onClick={() => setShowResetModal(false)}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Drawer>

      {/* New Campaign Modal */}
      <Drawer open={showNewCampaignModal} onClose={()=>setShowNewCampaignModal(false)} title="Create New Campaign" size="small">
        <NewCampaignForm onSubmit={createNewCampaign} onCancel={() => setShowNewCampaignModal(false)} />
      </Drawer>

      {/* New Street Modal */}
      <Drawer open={showNewStreetModal} onClose={()=>setShowNewStreetModal(false)} title="Add New Street" size="small">
        <NewStreetForm onSubmit={createNewStreet} onCancel={() => setShowNewStreetModal(false)} />
      </Drawer>

      {/* Edit Campaign Modal */}
      <Drawer open={showEditCampaignModal} onClose={()=>setShowEditCampaignModal(false)} title="Edit Campaign" size="small">
        <EditCampaignForm campaign={editingCampaign} onSubmit={editCampaign} onCancel={() => setShowEditCampaignModal(false)} />
      </Drawer>

      {/* Edit Street Modal */}
      <Drawer open={showEditStreetModal} onClose={()=>setShowEditStreetModal(false)} title="Edit Street" size="small">
        <EditStreetForm street={editingStreet} onSubmit={editStreet} onCancel={() => setShowEditStreetModal(false)} />
      </Drawer>

      {/* Property Manager Modal */}
      <Drawer open={showPropertyManagerModal} onClose={()=>setShowPropertyManagerModal(false)} title="Manage Properties" size="large">
        <PropertyManager street={activeStreet} onAddProperty={addProperty} onRemoveProperty={removeProperty} onEditProperty={editPropertyLabel} onClose={() => setShowPropertyManagerModal(false)} />
      </Drawer>

      {/* Footer Hint */}
      <div className="max-w-6xl mx-auto px-4 pb-8 text-xs opacity-70">
        UW Street Smart - NL Activity Tracker v1.0.0 | Built for UW partners making a difference in their communities.
      </div>
    </div>
  );
}

// --- Subcomponents ---
function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all ${
        active 
          ? "bg-primary-600 text-white border-primary-600 shadow-md" 
          : "bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl p-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 shadow-soft flex items-center gap-3">
      <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
        <Icon className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <div className="text-2xl font-semibold leading-none">{value}</div>
        <div className="text-sm opacity-70">{label}</div>
        {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function Dashboard({ stats, activeCampaign, onGoStreets }) {
  const hasData = activeCampaign && activeCampaign.streets.length > 0;
  
  return (
    <div className="space-y-4">
      <SectionCard 
        title="Today at a glance" 
        icon={Home} 
        actions={
          hasData ? (
            <button 
              onClick={onGoStreets} 
              className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm flex items-center gap-2 hover:bg-primary-700 transition-colors"
            >
              Go to Streets <ChevronRight className="w-4 h-4"/>
            </button>
          ) : (
            <button 
              onClick={onGoStreets} 
              className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm flex items-center gap-2 hover:bg-primary-700 transition-colors"
            >
              Create Campaign <ChevronRight className="w-4 h-4"/>
            </button>
          )
        }
      >
        {hasData ? (
          <div className="grid md:grid-cols-4 gap-3">
            <Stat icon={UploadCloud} label="Letters dropped" value={stats.letters} />
            <Stat icon={MessageSquare} label="Conversations" value={stats.convos} />
            <Stat icon={CheckCircle} label="Interested / Maybe" value={stats.interested} />
            <Stat icon={CalendarClock} label="Follow‑ups due" value={stats.followups} />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first neighbourhood campaign</p>
            <button 
              onClick={() => setShowNewCampaignModal(true)} 
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              Create First Campaign
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Active campaign" icon={MapPin}>
        {activeCampaign ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{activeCampaign.name}</div>
              <div className="text-xs opacity-70">
                Area: {activeCampaign.area || 'Not set'} • Streets: {activeCampaign.streets.length}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Chip variant={activeCampaign.status === 'active' ? 'success' : 'default'}>
                {activeCampaign.status}
              </Chip>
              <button className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Plus className="w-4 h-4"/> New street
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400">No active campaign</p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function Campaigns({ campaigns, activeId, onSelect, onCreateNew, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      <SectionCard 
        title="Create New Campaign" 
        icon={Plus}
        actions={
          <button 
            onClick={onCreateNew}
            className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4"/> New Campaign
          </button>
        }
      >
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Create a new neighbourhood letters campaign to start tracking activity.
        </div>
      </SectionCard>
      
      {campaigns.map(c => (
        <SectionCard key={c.id} title={c.name} icon={MapPin} actions={
          <div className="flex gap-2">
            <button 
              className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors" 
              onClick={()=>onSelect(c.id)}
            >
              Open
            </button>
            <button 
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={() => onEdit(c)}
            >
              Edit
            </button>
            <button 
              className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
              onClick={() => onDelete(c.id)}
            >
              Delete
            </button>
          </div>
        }>
          <div className="flex items-center justify-between text-sm">
            <div>Area: <strong>{c.area || 'Not set'}</strong></div>
            <div className="flex items-center gap-2">
              <Chip variant={c.status === 'active' ? 'success' : 'default'}>
                {c.status}
              </Chip>
              <div className="text-xs opacity-70">
                {c.streets.length} streets • Created {c.created_at}
              </div>
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function Streets({ campaign, activeStreetId, onSelectStreet, onOpenProperty, onAddStreet, onEditStreet, onDeleteStreet, onManageProperties }) {
  return (
    <div className="space-y-4">
      <SectionCard 
        title={`Streets in ${campaign.name}`} 
        icon={MapPin} 
        actions={
          <button 
            onClick={onAddStreet}
            className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4"/> Add street
          </button>
        }
      >
        {campaign.streets.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {campaign.streets.map(s => (
            <div 
              key={s.id} 
              className={`rounded-2xl border p-4 bg-white/70 dark:bg-gray-900/70 transition-all ${
                s.id===activeStreetId 
                  ? 'border-primary-400 shadow-md' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">
                  {s.name} <span className="opacity-60 text-sm">• {s.postcode}</span>
                </div>
                <Chip variant={
                  s.status === 'completed' ? 'success' : 
                  s.status === 'in_progress' ? 'warning' : 'default'
                }>
                  {s.status.replace('_',' ')}
                </Chip>
              </div>
              <div className="text-xs opacity-70 mb-3">{s.properties.length} properties</div>
              
              {/* Property buttons with better layout */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {s.properties.map(p => (
                    <button 
                      key={p.id} 
                      onClick={()=>onOpenProperty(s.id, p.id)} 
                      className={`px-2 py-1 rounded-lg text-xs border transition-colors flex-shrink-0 ${
                        p.spoke 
                          ? 'border-secondary-400 bg-secondary-50 dark:bg-secondary-900/20' 
                          : p.dropped 
                            ? 'border-warning-400 bg-warning-50 dark:bg-warning-900/20' 
                            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={()=>onSelectStreet(s.id)} 
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Select
                </button>
                <button 
                  onClick={() => onManageProperties(s)}
                  className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800"
                >
                  Properties
                </button>
                <button 
                  onClick={() => onEditStreet(s)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDeleteStreet(s.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No streets yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Add your first street to start tracking neighbourhood letters</p>
            <button 
              onClick={onAddStreet}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              Add First Street
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-sm">{label}</div>
      <button 
        onClick={()=>onChange(!value)} 
        className={`w-11 h-6 rounded-full p-1 transition-colors ${
          value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
        }`}
      >
        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`}></div>
      </button>
    </div>
  );
}

function PropertyView({ street, property, onBack, onUpdate, onShowScripts, onShowLinks, onToggleStatus }) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-4">
      <button 
        onClick={onBack} 
        className="text-sm opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to streets
      </button>

      <SectionCard 
        title={`${property.label} · ${street.name}`} 
        icon={Home} 
        actions={
          <Chip variant="default" className="text-xs">
            {street.postcode}
          </Chip>
        }
      >
        <div className="grid md:grid-cols-3 gap-3">
          <ActionButton 
            active={property.dropped} 
            icon={UploadCloud} 
            label="Dropped" 
            onClick={() => onToggleStatus(property.id, 'dropped')} 
          />
          <ActionButton 
            active={property.knocked} 
            icon={Check} 
            label="Knocked" 
            onClick={() => onToggleStatus(property.id, 'knocked')} 
          />
          <ActionButton 
            active={property.spoke} 
            icon={MessageSquare} 
            label="Spoke" 
            onClick={() => onToggleStatus(property.id, 'spoke')} 
          />
        </div>

        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <button 
            onClick={()=>setShowFollowUp(true)} 
            className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <CalendarClock className="w-4 h-4"/> Schedule follow‑up
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onShowScripts} 
              className="flex-1 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4"/> Scripts
            </button>
            <button 
              onClick={onShowLinks} 
              className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Link2 className="w-4 h-4"/> Links
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs opacity-70">Notes (avoid personal data)</label>
          <textarea 
            value={notes} 
            onChange={e=>setNotes(e.target.value)} 
            className="w-full mt-1 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors" 
            rows={3} 
            placeholder="e.g., 'best after 6pm', 'steep steps'"
          />
          <div className="flex items-center justify-between mt-2">
            <ToggleRow 
              label="Mark as interested" 
              value={property.result === 'interested'} 
              onChange={(v)=>onUpdate({ result: v ? 'interested' : 'maybe' })} 
            />
            <button className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Attach photo
            </button>
          </div>
        </div>
      </SectionCard>

      <FollowUpModal 
        open={showFollowUp} 
        onClose={()=>setShowFollowUp(false)} 
        onSave={(dt)=>{ onUpdate({ followUpAt: dt }); setShowFollowUp(false); }} 
      />
    </div>
  );
}

function ActionButton({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`px-3 py-3 rounded-2xl border shadow-sm flex items-center justify-center gap-2 text-sm transition-all ${
        active 
          ? 'bg-secondary-50 dark:bg-secondary-900/20 border-secondary-400 text-secondary-700 dark:text-secondary-300' 
          : 'bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function FollowUpModal({ open, onClose, onSave }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <Drawer open={open} onClose={onClose} title="Schedule follow‑up">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs opacity-70">Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e=>setDate(e.target.value)} 
              className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs opacity-70">Time</label>
            <input 
              type="time" 
              value={time} 
              onChange={e=>setTime(e.target.value)} 
              className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
            />
          </div>
        </div>
        <button 
          onClick={()=>onSave(`${date}T${time}:00`)} 
          className="w-full px-3 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          Save reminder
        </button>
      </div>
    </Drawer>
  );
}

function ScriptsPanel() {
  const [tab, setTab] = useState("opener");
  const tabs = [
    { key: "opener", label: "Openers" },
    { key: "objection", label: "Objections" },
    { key: "closer", label: "Closers" },
    { key: "sms", label: "SMS/WhatsApp" },
  ];
  const items = seedScripts[tab];

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {tabs.map(t => (
          <button 
            key={t.key} 
            onClick={()=>setTab(t.key)} 
            className={`px-3 py-2 rounded-xl text-sm transition-colors ${
              tab===t.key 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {items.map(s => (
          <div key={s.id} className="p-3 rounded-2xl border bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800">
            <div className="text-sm font-medium mb-1">{s.title}</div>
            <div className="text-sm opacity-90">{s.content}</div>
            <div className="mt-2 flex gap-2">
              <button className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Copy
              </button>
              <button className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Edit
              </button>
              <button className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                Save as new
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinksPanel({ links }) {
  const linkRows = [
    { label: "Connector sign‑up", url: links?.connector, icon: Link2 },
    { label: "Quote / eligibility form", url: links?.quote, icon: FileText },
    { label: "Book a call", url: links?.booking, icon: CalendarClock },
    { label: "FAQs", url: links?.faq, icon: FileText },
  ];
  
  return (
    <div className="space-y-2">
      {linkRows.map((r, idx) => (
        <a 
          key={idx} 
          href={r.url} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center justify-between p-3 rounded-2xl border bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm">
            <r.icon className="w-4 h-4"/> {r.label}
          </div>
          <ChevronRight className="w-4 h-4 opacity-60"/>
        </a>
      ))}
      <div className="text-xs opacity-70">
        Tip: add UTM tags to links so scans/visits attribute to this campaign.
      </div>
    </div>
  );
}

function SettingsPanel({ dark, onToggleDark, onExport, onImport, onReset }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      alert('Please select a valid JSON file.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium">Appearance</h4>
        <ToggleRow 
          label="Dark mode" 
          value={dark} 
          onChange={onToggleDark} 
        />
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Data & Privacy</h4>
        <button className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Privacy settings
        </button>
        <button 
          onClick={onExport}
          className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export all data
        </button>
        <button 
          onClick={() => document.getElementById('import-file').click()}
          className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Import data
        </button>
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {selectedFile && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">Selected file: {selectedFile.name}</div>
                <div className="text-xs opacity-70">Ready to import</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onImport(selectedFile)}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                >
                  Import
                </button>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <button 
          onClick={onReset}
          className="w-full text-left px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 border border-red-200 dark:border-red-800"
        >
          <Trash2 className="w-4 h-4" />
          Reset all data
        </button>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Support</h4>
        <button className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Help & FAQ
        </button>
        <button className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
          <Info className="w-4 h-4" />
          About
        </button>
      </div>
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-error-600 dark:text-error-400">
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function Reports({ campaigns }) {
  const flat = [];
  campaigns.forEach(c => c.streets.forEach(s => s.properties.forEach(p => flat.push({ 
    campaign: c.name, 
    street: s.name, 
    property: p.label, 
    dropped: p.dropped, 
    knocked: p.knocked, 
    spoke: p.spoke, 
    result: p.result || 'none', 
    followUpAt: p.followUpAt || '' 
  }))));

  const totals = useMemo(() => {
    const t = { letters: 0, knocked: 0, spoke: 0, interested: 0, followups: 0 };
    flat.forEach(r => {
      if (r.dropped) t.letters++;
      if (r.knocked) t.knocked++;
      if (r.spoke) t.spoke++;
      if (r.result === 'maybe' || r.result === 'interested') t.interested++;
      if (r.followUpAt) t.followups++;
    });
    return t;
  }, [campaigns]);

  return (
    <div className="space-y-4">
      <SectionCard title="Overview" icon={FileText}>
        <div className="grid md:grid-cols-5 gap-3">
          <Stat icon={UploadCloud} label="Letters" value={totals.letters} />
          <Stat icon={Check} label="Knocked" value={totals.knocked} />
          <Stat icon={MessageSquare} label="Spoke" value={totals.spoke} />
          <Stat icon={CheckCircle} label="Interested" value={totals.interested} />
          <Stat icon={CalendarClock} label="Follow‑ups" value={totals.followups} />
        </div>
      </SectionCard>
      <SectionCard title="Activity log (sample)" icon={ListChecks}>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left opacity-70">
              <tr>
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Street</th>
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Dropped</th>
                <th className="py-2 pr-4">Knocked</th>
                <th className="py-2 pr-4">Spoke</th>
                <th className="py-2 pr-4">Result</th>
                <th className="py-2 pr-4">Follow‑up</th>
              </tr>
            </thead>
            <tbody>
              {flat.map((r, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-gray-800">
                  <td className="py-2 pr-4">{r.campaign}</td>
                  <td className="py-2 pr-4">{r.street}</td>
                  <td className="py-2 pr-4">{r.property}</td>
                  <td className="py-2 pr-4">{r.dropped ? '✓' : ''}</td>
                  <td className="py-2 pr-4">{r.knocked ? '✓' : ''}</td>
                  <td className="py-2 pr-4">{r.spoke ? '✓' : ''}</td>
                  <td className="py-2 pr-4">{r.result}</td>
                  <td className="py-2 pr-4">{r.followUpAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

// Form components for creating new campaigns and streets
function NewCampaignForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    area: "",
    connector: "",
    quote: "",
    booking: "",
    faq: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs opacity-70">Campaign Name *</label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="e.g., Elmswell NL – Aug 2025"
          required
        />
      </div>
      
      <div>
        <label className="text-xs opacity-70">Postcode Area</label>
        <input 
          type="text" 
          value={formData.area} 
          onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="e.g., IP30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs opacity-70">Campaign Links (Optional)</label>
        <input 
          type="url" 
          value={formData.connector} 
          onChange={e => setFormData(prev => ({ ...prev, connector: e.target.value }))}
          className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="Connector sign-up URL"
        />
        <input 
          type="url" 
          value={formData.quote} 
          onChange={e => setFormData(prev => ({ ...prev, quote: e.target.value }))}
          className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="Quote/eligibility form URL"
        />
        <input 
          type="url" 
          value={formData.booking} 
          onChange={e => setFormData(prev => ({ ...prev, booking: e.target.value }))}
          className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="Booking page URL"
        />
        <input 
          type="url" 
          value={formData.faq} 
          onChange={e => setFormData(prev => ({ ...prev, faq: e.target.value }))}
          className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="FAQ page URL"
        />
      </div>

      <div className="flex gap-3">
        <button 
          type="submit"
          className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          Create Campaign
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function NewStreetForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    postcode: "",
    properties: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a street name');
      return;
    }
    if (!formData.properties.trim()) {
      alert('Please enter property numbers');
      return;
    }

    // Parse property numbers and names (comma separated only)
    const propertyList = formData.properties
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (propertyList.length === 0) {
      alert('Please enter at least one property number');
      return;
    }

    onSubmit({
      name: formData.name,
      postcode: formData.postcode,
      properties: propertyList
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs opacity-70">Street Name *</label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="e.g., Orchard Way"
          required
        />
      </div>
      
      <div>
        <label className="text-xs opacity-70">Postcode</label>
        <input 
          type="text" 
          value={formData.postcode} 
          onChange={e => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="e.g., IP30 9XX"
        />
      </div>

      <div>
        <label className="text-xs opacity-70">Property Numbers *</label>
        <textarea 
          value={formData.properties} 
          onChange={e => setFormData(prev => ({ ...prev, properties: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="Enter property numbers or names separated by commas&#10;e.g., 1, 3, 5, 7, 9&#10;or: 12, 14, 16, 18&#10;or: The Old Post Office, Rose Cottage, 1, 3"
          rows={3}
          required
        />
        <div className="text-xs text-gray-500 mt-1">
          Separate property numbers or names with commas only. Supports house names like "The Old Post Office", "Rose Cottage"
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          type="submit"
          className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          Add Street
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Edit Campaign Form
function EditCampaignForm({ campaign, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: campaign.name,
    area: campaign.area,
    connector: campaign.links.connector,
    quote: campaign.links.quote,
    booking: campaign.links.booking,
    faq: campaign.links.faq
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a campaign name');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs opacity-70">Campaign Name *</label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="e.g., Elmswell NL – Aug 2025"
          required
        />
      </div>
      
      <div>
        <label className="text-xs opacity-70">Postcode Area</label>
        <input 
          type="text" 
          value={formData.area} 
          onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="e.g., IP30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs opacity-70">Campaign Links (Optional)</label>
        <input 
          type="url" 
          value={formData.connector} 
          onChange={e => setFormData(prev => ({ ...prev, connector: e.target.value }))}
          className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="Connector sign-up URL"
        />
        <input 
          type="url" 
          value={formData.quote} 
          onChange={e => setFormData(prev => ({ ...prev, quote: e.target.value }))}
          className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="Quote/eligibility form URL"
        />
        <input 
          type="url" 
          value={formData.booking} 
          onChange={e => setFormData(prev => ({ ...prev, booking: e.target.value }))}
          className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="Booking page URL"
        />
        <input 
          type="url" 
          value={formData.faq} 
          onChange={e => setFormData(prev => ({ ...prev, faq: e.target.value }))}
          className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="FAQ page URL"
        />
      </div>

      <div className="flex gap-3">
        <button 
          type="submit"
          className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          Update Campaign
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Edit Street Form
function EditStreetForm({ street, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: street.name,
    postcode: street.postcode
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a street name');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs opacity-70">Street Name *</label>
        <input 
          type="text" 
          value={formData.name} 
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="e.g., Orchard Way"
          required
        />
      </div>
      
      <div>
        <label className="text-xs opacity-70">Postcode</label>
        <input 
          type="text" 
          value={formData.postcode} 
          onChange={e => setFormData(prev => ({ ...prev, postcode: e.target.value }))}
          className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          placeholder="e.g., IP30 9XX"
        />
      </div>

      <div className="flex gap-3">
        <button 
          type="submit"
          className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
        >
          Update Street
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// Property Manager Component
function PropertyManager({ street, onAddProperty, onRemoveProperty, onEditProperty, onClose }) {
  const [newPropertyLabel, setNewPropertyLabel] = useState("");
  const [editingProperty, setEditingProperty] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  const handleAddProperty = (e) => {
    e.preventDefault();
    if (!newPropertyLabel.trim()) {
      alert('Please enter a property label');
      return;
    }
    onAddProperty(newPropertyLabel.trim());
    setNewPropertyLabel("");
  };

  const handleEditProperty = (propertyId, newLabel) => {
    if (!newLabel.trim()) {
      alert('Please enter a property label');
      return;
    }
    onEditProperty(propertyId, newLabel.trim());
    setEditingProperty(null);
    setEditLabel("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Add New Property</h4>
        <form onSubmit={handleAddProperty} className="flex gap-2">
          <input 
            type="text" 
            value={newPropertyLabel} 
            onChange={e => setNewPropertyLabel(e.target.value)}
            className="flex-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
            placeholder="Property number or name (e.g., 1, 3, 5 or The Old Post Office)"
          />
          <button 
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </form>
        <div className="text-xs text-gray-500 mt-1">
          Supports numbers (1, 3, 5) or house names (The Old Post Office, Rose Cottage)
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Existing Properties ({street.properties.length})</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {street.properties.map(property => (
            <div key={property.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              {editingProperty === property.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input 
                    type="text" 
                    value={editLabel} 
                    onChange={e => setEditLabel(e.target.value)}
                    className="flex-1 p-1 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm"
                    autoFocus
                  />
                  <button 
                    onClick={() => handleEditProperty(property.id, editLabel)}
                    className="px-2 py-1 rounded bg-green-600 text-white text-xs hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => {
                      setEditingProperty(null);
                      setEditLabel("");
                    }}
                    className="px-2 py-1 rounded bg-gray-600 text-white text-xs hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-sm">{property.label}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setEditingProperty(property.id);
                        setEditLabel(property.label);
                      }}
                      className="px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => onRemoveProperty(property.id)}
                      className="px-2 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <button 
          onClick={onClose}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}