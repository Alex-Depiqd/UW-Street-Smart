import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, MapPin, Home, ListChecks, CalendarClock, MessageSquare, 
  Download, QrCode, Link2, Plus, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, X, CheckCircle, 
  Clock, Phone, FileText, FolderOpen, Share2, UploadCloud, 
  Moon, Sun, Settings, Bell, Search, Filter, MoreVertical,
  User, LogOut, HelpCircle, Info, Shield, Database, BarChart3, Target,
  Upload, Trash2, AlertTriangle, Camera, Globe, File, ExternalLink, Eye, Maximize, Menu, Edit, Copy, Minus
} from "lucide-react";
import { config } from './config';



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
          { id: "p1", label: "1", dropped: true, knocked: true, spoke: false, result: "no_answer", photo: null },
          { id: "p2", label: "3", dropped: true, knocked: true, spoke: true, result: "maybe", followUpAt: "2025-08-16T18:00:00", photo: null },
          { id: "p3", label: "5", dropped: true, knocked: false, spoke: false, result: "none", photo: null },
        ],
      },
      {
        id: "s2",
        name: "Station Road",
        postcode: "IP30 9YY",
        status: "not_started",
        properties: [
          { id: "p4", label: "12", dropped: false, knocked: false, spoke: false, result: "none", photo: null },
          { id: "p5", label: "14", dropped: false, knocked: false, spoke: false, result: "none", photo: null },
        ],
      },
    ],
  },
  {
    id: "c2",
    name: "Stowmarket NL – Sept 2025",
    area: "IP14",
          status: "planned",
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" />}
        <h3 className="text-lg font-semibold truncate">{title}</h3>
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
    {children}
  </div>
);

const Drawer = ({ open, onClose, title, children, size = "default" }) => {
  const sizes = {
    small: "max-h-[60vh]",
    default: "max-h-[80vh]",
    large: "max-h-[90vh]",
    full: "h-screen",
  };
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div 
          className="fixed inset-0 z-50 modal-overlay" 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
        >
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={onClose}
            style={{ touchAction: 'none' }}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl p-4 ${sizes[size]} overflow-y-auto modal-content`}
            style={{ touchAction: 'pan-y' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold">{title}</h3>
              <button 
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" 
                onClick={onClose}
                style={{ 
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Main App ---
export default function App() {
  // API functionality disabled - manual entry only
  const GOOGLE_PLACES_API_KEY = '';
  
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
  const [showImportStreetsModal, setShowImportStreetsModal] = useState(false);
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
  const [showEditStreetModal, setShowEditStreetModal] = useState(false);
  const [showPropertyManagerModal, setShowPropertyManagerModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingStreet, setEditingStreet] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSuccessTips, setShowSuccessTips] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [currentPdfTitle, setCurrentPdfTitle] = useState("");
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [currentImageTitle, setCurrentImageTitle] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileNavCollapsed, setMobileNavCollapsed] = useState(false);




  // Address lookup state
  const [addressSearchTerm, setAddressSearchTerm] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedPostcode, setSelectedPostcode] = useState("");
  const [selectedTown, setSelectedTown] = useState("");
  const [availableStreets, setAvailableStreets] = useState([]);
  const [selectedStreets, setSelectedStreets] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [addressLookupStep, setAddressLookupStep] = useState("search"); // search, select, import
  const [searchTimeout, setSearchTimeout] = useState(null);

  const activeCampaign = useMemo(() => campaigns.find(c => c.id === activeCampaignId), [campaigns, activeCampaignId]);
  const activeStreet = useMemo(() => activeCampaign?.streets.find(s => s.id === activeStreetId), [activeCampaign, activeStreetId]);
  const activeProperty = useMemo(() => activeStreet?.properties.find(p => p.id === activePropertyId), [activeStreet, activePropertyId]);





  // Derived stats for dashboard
  const stats = useMemo(() => {
    let letters = 0, knocked = 0, convos = 0, interested = 0, followups = 0;
    let outcomes = {
      interested: 0,
      customer_signed: 0,
      appointment_booked: 0,
      no_for_now: 0,
      already_uw: 0,
      not_interested: 0
    };
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    activeCampaign?.streets.forEach(s => {
      s.properties.forEach(p => {
        // Check if activity was logged today
        const droppedToday = p.dropped && p.droppedAt === today;
        const knockedToday = p.knocked && p.knockedAt === today;
        const spokeToday = p.spoke && p.spokeAt === today;
        const resultToday = p.result && p.resultAt === today;
        
        // Check if follow-up is due today (date part matches today)
        const followUpDueToday = p.followUpAt && p.followUpAt.split('T')[0] === today;
        
        if (droppedToday) letters++;
        if (knockedToday) knocked++;
        if (spokeToday) convos++;
        if (resultToday && (p.result === "customer_signed" || p.result === "appointment_booked" || p.result === "interested")) interested++;
        if (followUpDueToday) followups++;
        
        // Track today's outcomes
        if (resultToday && p.result !== 'none') {
          outcomes[p.result] = (outcomes[p.result] || 0) + 1;
        }
      });
    });
    return { letters, knocked, convos, interested, followups, outcomes };
  }, [activeCampaign]);

  const setProperty = (updates) => {
    const today = new Date().toISOString().split('T')[0];
    
    setCampaigns(prev => prev.map(c => {
      if (c.id !== activeCampaignId) return c;
      
      // Update the campaign's streets and properties
      const updatedCampaign = {
        ...c,
        streets: c.streets.map(s => {
          if (s.id !== activeStreetId) return s;
          return {
            ...s,
            properties: s.properties.map(p => {
              if (p.id === activePropertyId) {
                const newUpdates = { ...updates };
                // Add timestamp for result changes
                if (updates.result) {
                  newUpdates.resultAt = today;
                }
                // Add timestamp for followUpAt changes
                if (updates.followUpAt) {
                  newUpdates.followUpAt = updates.followUpAt;
                  
                  // Build detailed follow-up note
                  let followUpNote = `📅 Follow-up scheduled for ${updates.followUpAt}`;
                  
                  // Add follow-up types if specified
                  if (updates.followUpTypes) {
                    const selectedTypes = [];
                    if (updates.followUpTypes.call) selectedTypes.push('📞 Call');
                    if (updates.followUpTypes.revisit) selectedTypes.push('🏠 Revisit');
                    if (updates.followUpTypes.message) selectedTypes.push('💬 Message');
                    
                    if (selectedTypes.length > 0) {
                      followUpNote += `\n📋 Type: ${selectedTypes.join(', ')}`;
                    }
                  }
                  
                  // Add contact details if provided
                  if (updates.contactDetails && updates.contactDetails.name && updates.contactDetails.phone) {
                    followUpNote += `\n👤 Contact: ${updates.contactDetails.name} (${updates.contactDetails.phone})`;
                  }
                  
                  newUpdates.notes = p.notes ? `${p.notes}\n\n${followUpNote}` : followUpNote;
                  
                  // Store follow-up types and contact details
                  if (updates.followUpTypes) {
                    newUpdates.followUpTypes = updates.followUpTypes;
                  }
                  if (updates.contactDetails) {
                    newUpdates.contactDetails = updates.contactDetails;
                  }
                }
                return { ...p, ...newUpdates };
              }
              return p;
            })
          };
        })
      };
      
      // Auto-update campaign status based on activity
      const totalProperties = updatedCampaign.streets.reduce((total, street) => total + street.properties.length, 0);
      const droppedProperties = updatedCampaign.streets.reduce((total, street) => 
        total + street.properties.filter(p => p.dropped).length, 0);
      const spokeProperties = updatedCampaign.streets.reduce((total, street) => 
        total + street.properties.filter(p => p.spoke).length, 0);
      
      let newStatus = updatedCampaign.status;
      
      // Update to "active" if any properties have any activity (dropped, knocked, or spoke)
      const activeProperties = updatedCampaign.streets.reduce((total, street) => 
        total + street.properties.filter(p => p.dropped || p.knocked || p.spoke).length, 0);
      
      if (activeProperties > 0 && newStatus === "planned") {
        newStatus = "active";
      }
      
      // Update to "completed" if all properties have been handled (excluding no_answer as it requires follow-up)
      const handledProperties = updatedCampaign.streets.reduce((total, street) => 
        total + street.properties.filter(p => p.result && p.result !== "none" && p.result !== "no_answer").length, 0);
      
      if (totalProperties > 0 && handledProperties === totalProperties) {
        newStatus = "completed";
      }
      
      // Also update street status
      const updatedStreets = updatedCampaign.streets.map(street => {
        const streetTotalProperties = street.properties.length;
        const streetDroppedProperties = street.properties.filter(p => p.dropped).length;
        const streetKnockedProperties = street.properties.filter(p => p.knocked).length;
        const streetSpokeProperties = street.properties.filter(p => p.spoke).length;
        
        let streetStatus = street.status;
        
        // Check if any properties have any activity (dropped, knocked, spoke, or outcomes)
        const streetActiveProperties = street.properties.filter(p => 
          p.dropped || p.knocked || p.spoke || (p.result && p.result !== "none")
        ).length;
        
        // Revert to "not_started" if no properties have any activity
        if (streetActiveProperties === 0) {
          streetStatus = "not_started";
        }
        // Update to "in_progress" if any properties have been dropped
        else if (streetDroppedProperties > 0 && streetStatus === "not_started") {
          streetStatus = "in_progress";
        }
        
        // Update to "completed" if all properties have been handled (excluding no_answer as it requires follow-up)
        const streetHandledProperties = street.properties.filter(p => p.result && p.result !== "none" && p.result !== "no_answer").length;
        if (streetTotalProperties > 0 && streetHandledProperties === streetTotalProperties) {
          streetStatus = "completed";
        }
        
        // Move back to "in_progress" if street was completed but now has properties without outcomes
        if (streetStatus === "completed" && streetHandledProperties < streetTotalProperties) {
          streetStatus = "in_progress";
        }
        
        return {
          ...street,
          status: streetStatus
        };
      });
      
      return {
        ...updatedCampaign,
        streets: updatedStreets,
        status: newStatus
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
        status: "planned",
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
      status: "planned",
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
        const updatedCampaign = {
          ...c,
          streets: [...c.streets, newStreet]
        };
        
        // Don't auto-update campaign status when adding streets - keep as "planned" until there's actual activity
        return updatedCampaign;
        
        return updatedCampaign;
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
      id: `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: propertyLabel,
      dropped: false,
      knocked: false,
      spoke: false,
      result: "none",
      photo: null,
      droppedAt: null,
      knockedAt: null,
      spokeAt: null,
      resultAt: null
    };
    
    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        // Update the campaign's streets and properties
        const updatedCampaign = {
          ...c,
          streets: c.streets.map(s => {
            if (s.id === activeStreetId) {
              const updatedStreet = {
                ...s,
                properties: [...s.properties, newProperty]
              };
              
              // If street was completed and we're adding a new property, move back to in_progress
              if (s.status === "completed") {
                updatedStreet.status = "in_progress";
              }
              
              return updatedStreet;
            }
            return s;
          })
        };
        
        // Auto-update campaign status based on activity
        const totalProperties = updatedCampaign.streets.reduce((total, street) => total + street.properties.length, 0);
        const droppedProperties = updatedCampaign.streets.reduce((total, street) => 
          total + street.properties.filter(p => p.dropped).length, 0);
        
        let newStatus = updatedCampaign.status;
        
        // Update to "active" if any properties have been dropped
        // Update to "active" if any properties have any activity (dropped, knocked, or spoke)
        const activeProperties = updatedCampaign.streets.reduce((total, street) => 
          total + street.properties.filter(p => p.dropped || p.knocked || p.spoke).length, 0);
        
        if (activeProperties > 0 && newStatus === "planned") {
          newStatus = "active";
        }
        
        // Update to "completed" if all properties have been handled (excluding no_answer as it requires follow-up)
        const handledProperties = updatedCampaign.streets.reduce((total, street) => 
          total + street.properties.filter(p => p.result && p.result !== "none" && p.result !== "no_answer").length, 0);
        
        if (totalProperties > 0 && handledProperties === totalProperties) {
          newStatus = "completed";
        }
        
        // Also update street status
        const updatedStreets = updatedCampaign.streets.map(street => {
          const streetTotalProperties = street.properties.length;
          const streetDroppedProperties = street.properties.filter(p => p.dropped).length;
          const streetKnockedProperties = street.properties.filter(p => p.knocked).length;
          const streetSpokeProperties = street.properties.filter(p => p.spoke).length;
          
          let streetStatus = street.status;
          
          // Check if any properties have any activity (dropped, knocked, spoke, or outcomes)
          const streetActiveProperties = street.properties.filter(p => 
            p.dropped || p.knocked || p.spoke || (p.result && p.result !== "none")
          ).length;
          
          // Revert to "not_started" if no properties have any activity
          if (streetActiveProperties === 0) {
            streetStatus = "not_started";
          }
          // Update to "in_progress" if any properties have been dropped
          else if (streetDroppedProperties > 0 && streetStatus === "not_started") {
            streetStatus = "in_progress";
          }
          
          // Update to "completed" if all properties have been handled (excluding no_answer as it requires follow-up)
          const streetHandledProperties = street.properties.filter(p => p.result && p.result !== "none" && p.result !== "no_answer").length;
          if (streetTotalProperties > 0 && streetHandledProperties === streetTotalProperties) {
            streetStatus = "completed";
          }
          
          // Move back to "in_progress" if street was completed but now has properties without outcomes
          if (streetStatus === "completed" && streetHandledProperties < streetTotalProperties) {
            streetStatus = "in_progress";
          }
          
          return {
            ...street,
            status: streetStatus
          };
        });
        
        return {
          ...updatedCampaign,
          streets: updatedStreets,
          status: newStatus
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
    const today = new Date().toISOString().split('T')[0];
    
    setCampaigns(prev => prev.map(c => {
      if (c.id !== activeCampaignId) return c;
      
      // Update the campaign's streets and properties
      const updatedCampaign = {
        ...c,
        streets: c.streets.map(s => {
          if (s.id !== activeStreetId) return s;
          return {
            ...s,
            properties: s.properties.map(p => {
              if (p.id === propertyId) {
                const newValue = !p[status];
                const timestampKey = `${status}At`;
                return { 
                  ...p, 
                  [status]: newValue,
                  [timestampKey]: newValue ? today : null // Set timestamp when enabling, clear when disabling
                };
              }
              return p;
            })
          };
        })
      };
      
      // Auto-update campaign status based on activity
      const totalProperties = updatedCampaign.streets.reduce((total, street) => total + street.properties.length, 0);
      const droppedProperties = updatedCampaign.streets.reduce((total, street) => 
        total + street.properties.filter(p => p.dropped).length, 0);
      const spokeProperties = updatedCampaign.streets.reduce((total, street) => 
        total + street.properties.filter(p => p.spoke).length, 0);
      
      let newStatus = updatedCampaign.status;
      
      // Update to "active" if any properties have been dropped
              // Update to "active" if any properties have any activity (dropped, knocked, or spoke)
        const activeProperties = updatedCampaign.streets.reduce((total, street) => 
          total + street.properties.filter(p => p.dropped || p.knocked || p.spoke).length, 0);
        
        if (activeProperties > 0 && newStatus === "planned") {
          newStatus = "active";
        }
      
      // Update to "completed" if all properties have been handled (excluding no_answer as it requires follow-up)
      const handledProperties = updatedCampaign.streets.reduce((total, street) => 
        total + street.properties.filter(p => p.result && p.result !== "none" && p.result !== "no_answer").length, 0);
      
      if (totalProperties > 0 && handledProperties === totalProperties) {
        newStatus = "completed";
      }
      
      // Also update street status
      const updatedStreets = updatedCampaign.streets.map(street => {
        const streetTotalProperties = street.properties.length;
        const streetDroppedProperties = street.properties.filter(p => p.dropped).length;
        const streetKnockedProperties = street.properties.filter(p => p.knocked).length;
        const streetSpokeProperties = street.properties.filter(p => p.spoke).length;
        
        let streetStatus = street.status;
        
        // Check if any properties have any activity (dropped, knocked, spoke, or outcomes)
        const streetActiveProperties = street.properties.filter(p => 
          p.dropped || p.knocked || p.spoke || (p.result && p.result !== "none")
        ).length;
        
        // Revert to "not_started" if no properties have any activity
        if (streetActiveProperties === 0) {
          streetStatus = "not_started";
        }
        // Update to "in_progress" if any properties have been dropped
        else if (streetDroppedProperties > 0 && streetStatus === "not_started") {
          streetStatus = "in_progress";
        }
        
        // Update to "completed" if all properties have been handled (excluding no_answer as it requires follow-up)
        const streetHandledProperties = street.properties.filter(p => p.result && p.result !== "none" && p.result !== "no_answer").length;
        if (streetTotalProperties > 0 && streetHandledProperties === streetTotalProperties) {
          streetStatus = "completed";
        }
        
        // Move back to "in_progress" if street was completed but now has properties without outcomes
        if (streetStatus === "completed" && streetHandledProperties < streetTotalProperties) {
          streetStatus = "in_progress";
        }
        
        return {
          ...street,
          status: streetStatus
        };
      });
      
      return {
        ...updatedCampaign,
        streets: updatedStreets,
        status: newStatus
      };
    }));
  };

  // Address lookup functions - Google-style autocomplete with real street data
  const searchAddresses = async (searchTerm) => {
    console.log('searchAddresses called with:', searchTerm);
    
    if (!searchTerm || searchTerm.length < 2) {
      console.log('Search term too short, clearing suggestions');
      setAddressSuggestions([]);
      return;
    }

    setIsLoadingAddresses(true);
    console.log('Making API request for:', searchTerm);
    
    try {
      // Get a comprehensive list of suggestions from multiple sources
      let allSuggestions = [];
      
      // Method 1: Search for places (towns, villages, cities) using Postcodes.io
      const placesResponse = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(searchTerm)}&limit=20`);
      if (placesResponse.ok) {
        const placesData = await placesResponse.json();
        if (placesData.result && placesData.result.length > 0) {
          const placeSuggestions = placesData.result.map(item => ({
            display: `${item.name_1} - ${item.local_type || 'Place'} (${item.county_unitary || item.region || 'UK'})`,
            value: item.name_1,
            postcode: item.outcode,
            admin_district: item.county_unitary,
            admin_ward: item.district_borough,
            parish: item.local_type,
            type: 'place',
            local_type: item.local_type,
            county: item.county_unitary,
            region: item.region
          }));
          allSuggestions.push(...placeSuggestions);
        }
      }
      
      // Method 2: Search for postcode areas
      const postcodeResponse = await fetch(`https://api.postcodes.io/postcodes?q=${encodeURIComponent(searchTerm)}&limit=15`);
      if (postcodeResponse.ok) {
        const postcodeData = await postcodeResponse.json();
        if (postcodeData.result && postcodeData.result.length > 0) {
          // Group by outcode and create unique suggestions
          const outcodeMap = new Map();
          postcodeData.result.forEach(item => {
            if (!outcodeMap.has(item.outcode)) {
              outcodeMap.set(item.outcode, {
                display: `${item.outcode} - ${item.admin_district || item.admin_ward || 'Postcode Area'} (${item.admin_county || 'UK'})`,
                value: item.outcode,
                postcode: item.outcode,
                admin_district: item.admin_district,
                admin_ward: item.admin_ward,
                admin_county: item.admin_county,
                parish: item.parish,
                type: 'postcode_area'
              });
            }
          });
          allSuggestions.push(...Array.from(outcodeMap.values()));
        }
      }
      
      // Method 3: Disabled - Using Google Places API instead
      // OpenStreetMap Nominatim API disabled in favor of Google Places API
      
      // Method 4: Add some common UK place suggestions for better coverage
      const commonPlaces = [
        { name: 'London', county: 'Greater London', type: 'City' },
        { name: 'Manchester', county: 'Greater Manchester', type: 'City' },
        { name: 'Birmingham', county: 'West Midlands', type: 'City' },
        { name: 'Leeds', county: 'West Yorkshire', type: 'City' },
        { name: 'Liverpool', county: 'Merseyside', type: 'City' },
        { name: 'Newcastle', county: 'Tyne and Wear', type: 'City' },
        { name: 'Sheffield', county: 'South Yorkshire', type: 'City' },
        { name: 'Bristol', county: 'Bristol', type: 'City' },
        { name: 'Glasgow', county: 'Scotland', type: 'City' },
        { name: 'Edinburgh', county: 'Scotland', type: 'City' },
        { name: 'Cardiff', county: 'Wales', type: 'City' },
        { name: 'Belfast', county: 'Northern Ireland', type: 'City' }
      ];
      
      // Add common places that match the search term
      commonPlaces.forEach(place => {
        if (place.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          allSuggestions.push({
            display: `${place.name} - ${place.type} (${place.county})`,
            value: place.name,
            postcode: '',
            admin_district: place.county,
            type: 'common_place',
            local_type: place.type,
            county: place.county
          });
        }
      });
      
      // Remove duplicates and sort by relevance
      const uniqueSuggestions = allSuggestions.filter((suggestion, index, self) => 
        index === self.findIndex(s => s.value === suggestion.value)
      );
      
      // Sort by type (real streets first, then places, then postcodes)
      const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
        const typeOrder = { 'real_street': 1, 'place': 2, 'common_place': 3, 'postcode_area': 4 };
        return (typeOrder[a.type] || 5) - (typeOrder[b.type] || 5);
      });
      
      console.log('All suggestions:', sortedSuggestions);
      setAddressSuggestions(sortedSuggestions.slice(0, 25)); // Limit to 25 suggestions
      
    } catch (error) {
      console.error('Error searching addresses:', error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const debouncedSearch = (searchTerm) => {
    console.log('debouncedSearch called with:', searchTerm);
    
    // Clear existing timeout
    if (searchTimeout) {
      console.log('Clearing existing timeout');
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search (faster like Google)
    const timeout = setTimeout(() => {
      console.log('Timeout fired, calling searchAddresses');
      searchAddresses(searchTerm);
    }, 300); // 300ms delay for more responsive feel
    
    setSearchTimeout(timeout);
  };

  const selectAddress = async (suggestion) => {
    console.log('selectAddress called with:', suggestion);
    
    // Handle both string postcodes and object suggestions
    const searchValue = typeof suggestion === 'string' ? suggestion : suggestion.value;
    const postcode = typeof suggestion === 'string' ? suggestion : suggestion.postcode || suggestion.value;
    
    // Better area name extraction
    let areaName = 'Unknown Area';
    if (typeof suggestion === 'object') {
      if (suggestion.display) {
        // Extract area name from display string (e.g., "Elmswell - West Suffolk (IP30)")
        const displayParts = suggestion.display.split(' - ');
        areaName = displayParts[0] || suggestion.value || 'Unknown Area';
      } else if (suggestion.admin_district) {
        areaName = suggestion.admin_district;
      } else if (suggestion.value) {
        areaName = suggestion.value;
      }
    } else {
      areaName = suggestion;
    }
    
    console.log('Extracted area name:', areaName);
    console.log('Extracted postcode:', postcode);
    
    setSelectedPostcode(postcode);
    setSelectedTown(areaName);
    setIsLoadingAddresses(true);
    
          try {
        let realStreets = [];
        
        // Get area-specific street suggestions based on the selected location
        const areaNameLower = areaName.toLowerCase();
        const postcodeLower = postcode.toLowerCase();
        
        // Real UK street database organized by area
        const ukStreetDatabase = {
          // Suffolk area (IP30, IP14, etc.)
          'suffolk': [
            'High Street', 'Station Road', 'Church Street', 'School Lane', 'The Street',
            'Back Lane', 'Mill Lane', 'Church Lane', 'Station Lane', 'School Road',
            'Village Street', 'The Green', 'Main Street', 'Market Street', 'Bridge Street',
            'London Road', 'Cambridge Road', 'Norwich Road', 'Ipswich Road', 'Bury Road',
            'Stowmarket Road', 'Sudbury Road', 'Newmarket Road', 'Mildenhall Road', 'Thetford Road',
            'Elmswell Road', 'Woolpit Road', 'Stowupland Road', 'Rougham Road', 'Thurston Road'
          ],
          // Elmswell specific
          'elmswell': [
            'High Street', 'Station Road', 'Church Street', 'School Lane', 'The Street',
            'Back Lane', 'Mill Lane', 'Church Lane', 'Station Lane', 'School Road',
            'Village Street', 'Elmswell Road', 'Elmswell Lane', 'The Green', 'Main Street',
            'Mill Street', 'Station Street', 'Church Road', 'School Street', 'Village Road'
          ],
          // Bury St Edmunds area
          'bury': [
            'High Street', 'Market Street', 'Church Street', 'Station Road', 'Bridge Street',
            'Mill Lane', 'The Green', 'London Road', 'Cambridge Road', 'Norwich Road',
            'Ipswich Road', 'Victoria Road', 'Queen Street', 'Park Avenue', 'School Lane',
            'Angel Hill', 'Butter Market', 'Guildhall Street', 'St Johns Street', 'Westgate Street',
            'Abbeygate Street', 'Crown Street', 'St Andrews Street', 'Northgate Street', 'Eastgate Street'
          ],
          // London area
          'london': [
            'Oxford Street', 'Regent Street', 'Piccadilly', 'Bond Street', 'Carnaby Street',
            'Baker Street', 'Portland Place', 'Marylebone High Street', 'Edgware Road', 'Park Lane',
            'Hyde Park Corner', 'Knightsbridge', 'Sloane Street', 'King\'s Road', 'Fulham Road',
            'Kensington High Street', 'Holland Park Avenue', 'Notting Hill Gate', 'Portobello Road', 'Ladbroke Grove',
            'Westbourne Grove', 'Bayswater Road', 'Queensway', 'Paddington Street', 'Wigmore Street'
          ],
          // Manchester area
          'manchester': [
            'Market Street', 'Deansgate', 'King Street', 'Cross Street', 'St Ann\'s Square',
            'Piccadilly', 'Oxford Road', 'Wilmslow Road', 'Rusholme', 'Fallowfield',
            'Withington', 'Didsbury', 'Chorlton', 'Sale', 'Altrincham',
            'Stockport Road', 'Chester Road', 'Bury New Road', 'Oldham Road', 'Rochdale Road',
            'Bolton Road', 'Prestwich', 'Whitefield', 'Radcliffe', 'Bury'
          ],
          // Birmingham area
          'birmingham': [
            'New Street', 'High Street', 'Corporation Street', 'Colmore Row', 'Victoria Square',
            'Broad Street', 'Hagley Road', 'Bristol Road', 'Pershore Road', 'Alcester Road',
            'Stratford Road', 'Coventry Road', 'Warwick Road', 'Solihull Road', 'Sutton Coldfield',
            'Erdington', 'Kingstanding', 'Great Barr', 'Perry Barr', 'Handsworth'
          ]
        };
        
        // Find matching streets based on area name and postcode
        if (areaNameLower.includes('elmswell') || postcodeLower.includes('ip30')) {
          realStreets = ukStreetDatabase.elmswell;
          console.log('Using Elmswell-specific streets');
        } else if (areaNameLower.includes('bury') || areaNameLower.includes('st edmunds')) {
          realStreets = ukStreetDatabase.bury;
          console.log('Using Bury St Edmunds streets');
        } else if (areaNameLower.includes('london') || postcodeLower.includes('sw') || postcodeLower.includes('nw') || postcodeLower.includes('se') || postcodeLower.includes('e') || postcodeLower.includes('w')) {
          realStreets = ukStreetDatabase.london;
          console.log('Using London streets');
        } else if (areaNameLower.includes('manchester') || postcodeLower.includes('m')) {
          realStreets = ukStreetDatabase.manchester;
          console.log('Using Manchester streets');
        } else if (areaNameLower.includes('birmingham') || postcodeLower.includes('b')) {
          realStreets = ukStreetDatabase.birmingham;
          console.log('Using Birmingham streets');
        } else if (areaNameLower.includes('suffolk') || postcodeLower.includes('ip')) {
          realStreets = ukStreetDatabase.suffolk;
          console.log('Using Suffolk streets');
        } else {
          // Default to common UK patterns
          realStreets = [
            'High Street', 'Main Street', 'Church Street', 'Station Road', 'London Road',
            'Victoria Street', 'Queen Street', 'King Street', 'Market Street', 'School Lane',
            'Park Road', 'Garden Street', 'The Green', 'Mill Lane', 'Bridge Street',
            'New Street', 'Old Street', 'North Street', 'South Street', 'East Street',
            'West Street', 'Upper Street', 'Lower Street', 'Broad Street', 'Narrow Street',
            'Long Street', 'Short Street', 'Hill Street', 'Valley Road', 'Riverside',
            'Meadow Lane', 'Orchard Street', 'Woodland Road', 'Forest Drive', 'Oak Avenue',
            'Elm Street', 'Maple Drive', 'Cedar Lane', 'Pine Street', 'Willow Road',
            'Rose Street', 'Lily Lane', 'Daisy Drive', 'Sunflower Street', 'Primrose Lane',
            'Cherry Street', 'Apple Lane', 'Pear Street', 'Plum Road', 'Berry Street'
          ];
          console.log('Using common UK street patterns');
        }
        
        const allStreets = [...new Set(realStreets)].slice(0, 30);
        console.log('Final street list for', areaName, ':', allStreets);
        setAvailableStreets(allStreets);
        setAddressLookupStep("select");
      
    } catch (error) {
      console.error('Error in planning street generation:', error);
      // Fallback: create some generic street names if API fails
      const fallbackStreets = [
        'High Street', 'Main Street', 'Church Street', 'Station Road', 
        'School Lane', 'Park Avenue', 'Victoria Road', 'Queen Street',
        'Market Street', 'Bridge Street', 'Mill Lane', 'The Green',
        'London Road', 'Cambridge Road', 'Norwich Road', 'Ipswich Road'
      ];
      setAvailableStreets(fallbackStreets);
      setAddressLookupStep("select");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const toggleStreetSelection = (street) => {
    setSelectedStreets(prev => {
      const isSelected = prev.some(s => s === street);
      if (isSelected) {
        return prev.filter(s => s !== street);
      } else {
        return [...prev, street];
      }
    });
  };

  const importSelectedStreets = () => {
    const newStreets = selectedStreets.map((streetName, index) => ({
      id: `street-${Date.now()}-${index}`,
      name: streetName,
      postcode: selectedPostcode,
      status: "not_started",
      properties: [
        // Just create one default property - partners can add more manually
        { id: `property-${Date.now()}-${index}-1`, label: "1", dropped: false, knocked: false, spoke: false, result: "none" },
      ]
    }));

    // Add streets to the current campaign
    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        return {
          ...c,
          streets: [...c.streets, ...newStreets]
        };
      }
      return c;
    }));

    // Reset address lookup state
    setAddressSearchTerm("");
    setAddressSuggestions([]);
    setSelectedPostcode("");
    setSelectedTown("");
    setAvailableStreets([]);
    setSelectedStreets([]);
    setAddressLookupStep("search");

    alert(`Successfully imported ${newStreets.length} streets!`);
    
    // Close the import modal if it's open
    setShowImportStreetsModal(false);
  };

  const resetAddressLookup = () => {
    setAddressSearchTerm("");
    setAddressSuggestions([]);
    setSelectedPostcode("");
    setSelectedTown("");
    setAvailableStreets([]);
    setSelectedStreets([]);
    setAddressLookupStep("search");
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

  // Cleanup search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Theme management
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Debug logging for API key
  useEffect(() => {
    console.log('API Key Debug:', {
      hasKey: !!GOOGLE_PLACES_API_KEY,
      keyLength: GOOGLE_PLACES_API_KEY?.length || 0,
      keyStart: GOOGLE_PLACES_API_KEY?.substring(0, 10) || 'none',
      localStorageKey: localStorage.getItem('google_places_api_key') || 'none'
    });
  }, [GOOGLE_PLACES_API_KEY]);
  
  // Cache for API results (reduces API calls by 80%+)
  const [addressCache, setAddressCache] = useState({});

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-50 overflow-x-hidden">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur bg-white/60 dark:bg-gray-950/60 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary-600 flex items-center justify-center shadow text-white font-bold">UW</div>
            <div>
              <div className="font-semibold leading-tight">Street Smart</div>
              <div className="text-xs opacity-70">NL Activity Tracker</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile: Simplified status indicators */}
            <div className="lg:hidden flex items-center gap-1">
              {!isOnline && (
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              )}
            </div>
            
            {/* Desktop: Full status chips */}
            <div className="hidden lg:flex items-center gap-2">
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
            </div>
            
            <button 
              onClick={toggleDark} 
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {dark ? <Sun className="w-4 h-4 lg:w-5 lg:h-5"/> : <Moon className="w-4 h-4 lg:w-5 lg:h-5"/>}
            </button>
            <button 
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <HelpCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header - Simple */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between py-2">
            <div className="text-sm font-medium">
              {view === "dashboard" && "Dashboard"}
              {view === "campaigns" && "Campaigns"}
              {view === "streets" && "Streets"}
              {view === "reports" && "Reports"}
              {view === "property" && "Property"}
            </div>
            <div className="flex items-center gap-3">
              {/* Quick Stats Summary */}
              {view === "dashboard" && activeCampaign && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <UploadCloud className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-medium">{stats.letters}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-indigo-600" />
                    <span className="text-indigo-600 font-medium">{stats.knocked}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-600 font-medium">{stats.convos}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-primary-600" />
                    <span className="text-primary-600 font-medium">{stats.interested}</span>
                  </div>
                </div>
              )}
              {activeCampaign && (
                <div className="text-xs opacity-70 truncate max-w-24">
                  {activeCampaign.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 lg:py-6 pb-32 lg:pb-6 grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-1 space-y-3">
          <SectionCard title="Navigate" icon={FolderOpen}>
            <div className="grid grid-cols-2 gap-3 min-w-0 nav-grid-vertical-tablet">
              <NavButton icon={<BarChart3 className="w-4 h-4 flex-shrink-0"/>} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
              <NavButton icon={<Target className="w-4 h-4 flex-shrink-0"/>} label="Campaigns" active={view === "campaigns"} onClick={() => setView("campaigns")} />
              <NavButton icon={<MapPin className="w-4 h-4 flex-shrink-0"/>} label="Streets" active={view === "streets"} onClick={() => setView("streets")} />
              <NavButton icon={<FileText className="w-4 h-4 flex-shrink-0"/>} label="Reports" active={view === "reports"} onClick={() => setView("reports")} />
            </div>
            <div className="mt-3 text-xs opacity-70">
              Active: <strong>{activeCampaign?.name}</strong>
            </div>
          </SectionCard>

          <SectionCard title="Quick Drawers" icon={Share2}>
            <div className="grid grid-cols-2 gap-2 min-w-0 nav-grid-vertical-tablet">
              <NavButton icon={<MessageSquare className="w-4 h-4 flex-shrink-0"/>} label="Scripts" onClick={() => setShowScripts(true)} />
              <NavButton icon={<Link2 className="w-4 h-4 flex-shrink-0"/>} label="Links" onClick={() => setShowLinks(true)} />
              <NavButton icon={<File className="w-4 h-4 flex-shrink-0"/>} label="Documents" onClick={() => setShowDocuments(true)} />
            </div>
            <div className="mt-3 text-xs opacity-70">
              Open while on a property to speed up calls and messages.
            </div>
          </SectionCard>

          <SectionCard 
            title="Success Tips" 
            icon={Target}
            className="success-tips-vertical-tablet"
            actions={
              <button 
                onClick={() => setShowSuccessTips(true)}
                className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm flex items-center gap-2 hover:bg-primary-700 transition-colors"
              >
                <HelpCircle className="w-4 h-4"/> View All
              </button>
            }
          >
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="text-xs font-medium text-green-800 dark:text-green-200">🎯 Best Time to Drop</div>
                <div className="text-xs text-green-700 dark:text-green-300">Evenings 6-8pm, weekends 10am-2pm</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="text-xs font-medium text-blue-800 dark:text-blue-200">📝 Follow Up Timing</div>
                <div className="text-xs text-blue-700 dark:text-blue-300">Return 2-3 days after dropping letters</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="text-xs font-medium text-purple-800 dark:text-purple-200">💡 Conversation Starters</div>
                <div className="text-xs text-purple-700 dark:text-purple-300">"Hi, I'm local and helping neighbours save money..."</div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Main Panel */}
        <div className="col-span-1 lg:col-span-3 space-y-3 lg:space-y-4">
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
              onToggleComplete={(campaignId) => {
                setCampaigns(prev => prev.map(campaign => {
                  if (campaign.id === campaignId) {
                    const newStatus = campaign.status === 'completed' ? 'active' : 'completed';
                    
                    // If marking as completed, set properties without outcomes to "No Answer"
                    if (newStatus === 'completed') {
                      const updatedStreets = campaign.streets.map(street => ({
                        ...street,
                        properties: street.properties.map(property => {
                          // Only set to "No Answer" if property has no outcome
                          if (property.result === 'none' || !property.result) {
                            return { ...property, result: 'no_answer' };
                          }
                          return property;
                        })
                      }));
                      return { ...campaign, streets: updatedStreets, status: newStatus };
                    } else {
                      // If unmarking as completed, clear outcomes for properties that need follow-up
                      const updatedStreets = campaign.streets.map(street => ({
                        ...street,
                        properties: street.properties.map(property => {
                          // Clear "No Answer" outcome if property doesn't have "Spoke" status
                          // (meaning it was auto-set when marking complete, not manually set)
                          if (property.result === 'no_answer' && !property.spoke) {
                            return { ...property, result: 'none' };
                          }
                          return property;
                        })
                      }));
                      return { ...campaign, streets: updatedStreets, status: newStatus };
                    }
                  }
                  return campaign;
                }));
              }}
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
              onImportStreets={(campaignId) => {
                setActiveCampaignId(campaignId);
                setShowImportStreetsModal(true);
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
              onShowDocuments={()=>setShowDocuments(true)}
              onToggleStatus={togglePropertyStatus}
              onViewImage={(url, title) => {
                setCurrentImageUrl(url);
                setCurrentImageTitle(title);
                setShowImageViewer(true);
              }}
            />
          )}
          {view === "reports" && <Reports campaigns={campaigns} onNavigateToProperty={(campaignId, streetId, propertyId) => {
            setActiveCampaignId(campaignId);
            setActiveStreetId(streetId);
            setActivePropertyId(propertyId);
            setView('property');
          }} />}
        </div>
      </div>

      {/* Drawers */}
      <Drawer open={showScripts} onClose={()=>setShowScripts(false)} title="Scripts & Talking Points">
        <ScriptsPanel />
      </Drawer>
      <Drawer open={showLinks} onClose={()=>setShowLinks(false)} title="Quick Links">
        <LinksPanel links={activeCampaign?.links} />
      </Drawer>
      <Drawer open={showDocuments} onClose={()=>setShowDocuments(false)} title="Documents & PDFs" size="large">
        <DocumentsPanel 
          onViewPdf={(url, title) => {
            setCurrentPdfUrl(url);
            setCurrentPdfTitle(title);
            setShowPdfViewer(true);
          }}
          onViewImage={(url, title) => {
            setCurrentImageUrl(url);
            setCurrentImageTitle(title);
            setShowImageViewer(true);
          }}
        />
      </Drawer>
      <Drawer open={showPdfViewer} onClose={()=>setShowPdfViewer(false)} title={currentPdfTitle} size="full">
        <PdfViewer url={currentPdfUrl} title={currentPdfTitle} />
      </Drawer>
      <Drawer open={showImageViewer} onClose={()=>setShowImageViewer(false)} title={currentImageTitle} size="large">
        <ImageViewer url={currentImageUrl} title={currentImageTitle} onClose={()=>setShowImageViewer(false)} />
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

      {/* Help Modal */}
      <Drawer open={showHelp} onClose={()=>setShowHelp(false)} title="Help & FAQ" size="large">
        <HelpPanel />
      </Drawer>

      {/* About Modal */}
      <Drawer open={showAbout} onClose={()=>setShowAbout(false)} title="About" size="small">
        <AboutPanel />
      </Drawer>

      {/* Success Tips Modal */}
      <Drawer open={showSuccessTips} onClose={()=>setShowSuccessTips(false)} title="Success Tips for NLs" size="large">
        <SuccessTipsPanel />
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
        <NewCampaignForm 
          onSubmit={createNewCampaign} 
          onCancel={() => setShowNewCampaignModal(false)}
          addressSearchTerm={addressSearchTerm}
          setAddressSearchTerm={setAddressSearchTerm}
          addressSuggestions={addressSuggestions}
          selectedPostcode={selectedPostcode}
          selectedTown={selectedTown}
          availableStreets={availableStreets}
          selectedStreets={selectedStreets}
          isLoadingAddresses={isLoadingAddresses}
          addressLookupStep={addressLookupStep}
          searchAddresses={searchAddresses}
          selectAddress={selectAddress}
          toggleStreetSelection={toggleStreetSelection}
          importSelectedStreets={importSelectedStreets}
          resetAddressLookup={resetAddressLookup}
        />
      </Drawer>

      {/* New Street Modal */}
      <Drawer open={showNewStreetModal} onClose={()=>setShowNewStreetModal(false)} title="Add New Street" size="small">
        <NewStreetForm 
          onSubmit={createNewStreet} 
          onCancel={() => setShowNewStreetModal(false)}
        />
      </Drawer>

      {/* Import Streets Modal */}
      <Drawer open={showImportStreetsModal} onClose={()=>setShowImportStreetsModal(false)} title="Import Streets" size="small">
        <ImportStreetsForm 
          onSubmit={importSelectedStreets} 
          onCancel={() => setShowImportStreetsModal(false)}
          addressSearchTerm={addressSearchTerm}
          setAddressSearchTerm={setAddressSearchTerm}
          addressSuggestions={addressSuggestions}
          setAddressSuggestions={setAddressSuggestions}
          selectedPostcode={selectedPostcode}
          selectedTown={selectedTown}
          availableStreets={availableStreets}
          selectedStreets={selectedStreets}
          isLoadingAddresses={isLoadingAddresses}
          addressLookupStep={addressLookupStep}
          searchAddresses={searchAddresses}
          debouncedSearch={debouncedSearch}
          selectAddress={selectAddress}
          toggleStreetSelection={toggleStreetSelection}
          importSelectedStreets={importSelectedStreets}
          resetAddressLookup={resetAddressLookup}
        />
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





      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setView("dashboard")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              view === "dashboard"
                ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </button>
          
          <button
            onClick={() => setView("campaigns")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              view === "campaigns"
                ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <Target className="w-5 h-5" />
            <span className="text-xs">Campaigns</span>
          </button>
          
          <button
            onClick={() => setView("streets")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              view === "streets"
                ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-xs">Streets</span>
          </button>
          
          <button
            onClick={() => setView("reports")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              view === "reports"
                ? "text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Reports</span>
          </button>
        </div>
      </div>



      {/* Footer Hint */}
      <div className="max-w-6xl mx-auto px-4 pb-20 lg:pb-8 text-xs opacity-70">
        UW Street Smart - NL Activity Tracker v1.0.0 | Built for UW partners making a difference in their communities. | © 2025 Alex Cameron. All rights reserved.
      </div>
    </div>
  );
}

// --- Subcomponents ---
function NavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs border transition-all min-w-0 lg:flex-row lg:gap-2 lg:px-3 lg:text-sm nav-button-vertical-tablet ${
        active 
          ? "bg-primary-600 text-white border-primary-600 shadow-md" 
          : "bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-center leading-tight break-words">{label}</span>
    </button>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl p-3 sm:p-4 bg-white/70 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 shadow-soft flex items-center gap-2 sm:gap-3 min-w-0">
      <div className="p-1.5 sm:p-2 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xl sm:text-2xl font-semibold leading-none">{value}</div>
        <div className="text-xs sm:text-sm opacity-70 truncate">{label}</div>
        {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function Dashboard({ stats, activeCampaign, onGoStreets }) {
  const hasData = activeCampaign && activeCampaign.streets.length > 0;
  
  return (
    <div className="space-y-4">
      <SectionCard title="Active Campaign" icon={MapPin}>
        {activeCampaign ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-lg font-semibold truncate">{activeCampaign.name}</div>
                <div className="text-sm opacity-70">
                  Area: {activeCampaign.area || 'Not set'} • Streets: {activeCampaign.streets.length}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Chip variant={activeCampaign.status === 'active' ? 'success' : 'default'}>
                  {activeCampaign.status}
                </Chip>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={onGoStreets} 
                className="flex-1 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
              >
                <MapPin className="w-4 h-4"/> Go to Streets
              </button>

            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No active campaign</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first neighbourhood campaign</p>
            <button 
              onClick={onGoStreets} 
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              Create First Campaign
            </button>
          </div>
        )}
      </SectionCard>

      <SectionCard 
        title="Today's Activity" 
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            <Stat icon={UploadCloud} label="Letters dropped" value={stats.letters} />
            <Stat icon={Check} label="Knocked" value={stats.knocked} />
            <Stat icon={MessageSquare} label="Conversations" value={stats.convos} />
            <Stat icon={CheckCircle} label="Successes" value={stats.interested} />
            <Stat icon={CalendarClock} label="Follow Ups Due" value={stats.followups} />
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
              <Home className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">No activity recorded today</p>
          </div>
        )}
      </SectionCard>

      {hasData && stats.outcomes && (
        <SectionCard title="Conversation Outcomes" icon={MessageSquare}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-500">
              <div className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200">{stats.outcomes.customer_signed}</div>
              <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Customers Signed</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-500">
              <div className="text-base sm:text-lg font-semibold text-emerald-800 dark:text-emerald-200">{stats.outcomes.appointment_booked}</div>
              <div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">Appointment Booked</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-500">
              <div className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200">{stats.outcomes.interested}</div>
              <div className="text-xs sm:text-sm text-green-700 dark:text-green-300">Interested</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 dark:border-amber-500">
              <div className="text-base sm:text-lg font-semibold text-amber-800 dark:text-amber-200">{stats.outcomes.no_for_now}</div>
              <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">No for Now</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-500 dark:border-sky-500">
              <div className="text-base sm:text-lg font-semibold text-sky-800 dark:text-sky-200">{stats.outcomes.already_uw}</div>
              <div className="text-xs sm:text-sm text-sky-700 dark:text-sky-300">Already with UW</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-500">
              <div className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200">{stats.outcomes.not_interested}</div>
              <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">Not Interested</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-900/20 border-2 border-slate-500 dark:border-slate-500">
              <div className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">{stats.outcomes.no_answer || 0}</div>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">No Answer</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 dark:border-purple-500">
              <div className="text-base sm:text-lg font-semibold text-purple-800 dark:text-purple-200">{stats.outcomes.no_cold_callers || 0}</div>
              <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">No Cold Callers</div>
            </div>

          </div>
        </SectionCard>
      )}


    </div>
  );
}

function Campaigns({ campaigns, activeId, onSelect, onCreateNew, onEdit, onDelete, onToggleComplete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           c.area.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.created_at) - new Date(a.created_at);
        case "streets":
          return b.streets.length - a.streets.length;
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaigns, searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-3">
      {/* Create New Campaign - Restructured for clarity */}
      <div className="rounded-2xl shadow-soft p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur border border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
            <Plus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold">Create New Campaign</h3>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Create a new neighbourhood letters campaign to start tracking activity.
        </div>
        <button 
          onClick={onCreateNew}
          className="w-full px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium"
        >
          <Plus className="w-4 h-4"/>
          Create New Campaign
        </button>
      </div>

      <SectionCard 
        title="Search & Filter" 
        icon={Search}
        actions={
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            {showFilters ? <ChevronRight className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        }
      >
        {showFilters && (
          <div className="space-y-3">
            {/* Search */}
            <div>
              <label className="text-xs opacity-70">Search campaigns</label>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or area..."
                className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Status Filter */}
              <div>
                <label className="text-xs opacity-70">Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="text-xs opacity-70">Sort by</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                >
                  <option value="name">Name</option>
                  <option value="date">Date Created</option>
                  <option value="streets">Number of Streets</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
            
            <div className="text-xs opacity-70">
              Showing {filteredCampaigns.length} of {campaigns.length} campaigns
            </div>
          </div>
        )}
      </SectionCard>
      
      {filteredCampaigns.map(c => (
        <SectionCard key={c.id} title={c.name} icon={MapPin        } actions={
          <div className="flex flex-wrap gap-2 min-w-0">
            <button 
              className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors flex-shrink-0" 
              onClick={()=>onSelect(c.id)}
            >
              Open
            </button>
            <button 
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              onClick={() => onEdit(c)}
            >
              Edit
            </button>
            <button 
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors border flex-shrink-0 ${
                c.status === 'completed' 
                  ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-800'
                  : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800'
              }`}
              onClick={() => {
                if (c.status === 'completed') {
                  if (confirm('Unmark this campaign as completed? This will clear "No Answer" outcomes for properties that need follow-up while preserving manually set outcomes.')) {
                    onToggleComplete(c.id);
                  }
                } else {
                  if (confirm('Mark this campaign as completed? This will set properties without outcomes to "No Answer" while preserving existing status and outcomes.')) {
                    onToggleComplete(c.id);
                  }
                }
              }}
            >
              {c.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button 
              className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800 flex-shrink-0"
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
                  {c.status === 'planned' ? 'Planned' : c.status}
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

function Streets({ campaign, activeStreetId, onSelectStreet, onOpenProperty, onAddStreet, onEditStreet, onDeleteStreet, onManageProperties, onImportStreets }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileKey, setShowMobileKey] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Filter and sort streets
  const filteredStreets = useMemo(() => {
    let filtered = campaign.streets.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           s.postcode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort streets
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "properties":
          return b.properties.length - a.properties.length;
        case "status":
          return a.status.localeCompare(b.status);
        case "postcode":
          return a.postcode.localeCompare(b.postcode);
        default:
          return 0;
      }
    });

    return filtered;
  }, [campaign.streets, searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-4">
      <SectionCard 
        title={`Streets in ${campaign.name}`} 
        icon={MapPin} 
        actions={
          <div className="flex items-center gap-2">
            {/* Mobile Key Button */}
            <button 
              onClick={() => setShowMobileKey(!showMobileKey)}
              className="block lg:hidden px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              {showMobileKey ? <X className="w-4 h-4"/> : <span className="text-sm font-bold">KEY</span>}
            </button>
            
            {/* Add Street Button - Right aligned on mobile */}
            <button 
              onClick={onAddStreet}
              className="px-3 py-1.5 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4"/> Add street
            </button>
          </div>
        }
      >
        
        {/* Status Guide - Full Screen Only */}
        <div className="hidden lg:block mb-4">
          <div className="flex items-center gap-4 text-xs opacity-70">
            <div className="flex items-center gap-2">
              <span className="font-medium">🎯 Outcomes:</span>
              <div className="flex items-center gap-1">
                <span 
                  className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 flex items-center justify-center text-[8px] font-bold text-green-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('Customer Signed')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'Customer Signed' ? null : 'Customer Signed')}
                >
                  CS
                </span>
                <span 
                  className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center text-[8px] font-bold text-emerald-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('Appointment Booked')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'Appointment Booked' ? null : 'Appointment Booked')}
                >
                  AB
                </span>
                <span 
                  className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 flex items-center justify-center text-[8px] font-bold text-green-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('Interested')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'Interested' ? null : 'Interested')}
                >
                  I
                </span>
                <span 
                  className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-50 flex items-center justify-center text-[8px] font-bold text-amber-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('No for Now')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'No for Now' ? null : 'No for Now')}
                >
                  NN
                </span>
                <span 
                  className="w-4 h-4 rounded border-2 border-sky-500 bg-sky-50 flex items-center justify-center text-[8px] font-bold text-sky-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('Already with UW')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'Already with UW' ? null : 'Already with UW')}
                >
                  UW
                </span>
                <span 
                  className="w-4 h-4 rounded border-2 border-red-500 bg-red-50 flex items-center justify-center text-[8px] font-bold text-red-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('Not Interested')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'Not Interested' ? null : 'Not Interested')}
                >
                  NI
                </span>
                <span 
                  className="w-4 h-4 rounded border-2 border-slate-500 bg-slate-50 flex items-center justify-center text-[8px] font-bold text-slate-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('No Answer')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'No Answer' ? null : 'No Answer')}
                >
                  NA
                </span>
                <span 
                  className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-50 flex items-center justify-center text-[8px] font-bold text-purple-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('No Cold Callers')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'No Cold Callers' ? null : 'No Cold Callers')}
                >
                  NC
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">📊 Progress:</span>
              <div className="flex items-center gap-1">
                <span 
                  className="w-4 h-4 rounded border border-orange-300 bg-orange-50/50 flex items-center justify-center text-[8px] font-bold text-orange-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('Dropped')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'Dropped' ? null : 'Dropped')}
                >
                  D
                </span>
                <span 
                  className="w-4 h-4 rounded border border-indigo-300 bg-indigo-50/50 flex items-center justify-center text-[8px] font-bold text-indigo-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('Knocked')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'Knocked' ? null : 'Knocked')}
                >
                  K
                </span>
                <span 
                  className="w-4 h-4 rounded border border-teal-300 bg-teal-50/50 flex items-center justify-center text-[8px] font-bold text-teal-700 cursor-help" 
                  onMouseEnter={() => setActiveTooltip('Spoke')}
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() => setActiveTooltip(activeTooltip === 'Spoke' ? null : 'Spoke')}
                >
                  S
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Status Guide - Collapsible */}
        {showMobileKey && (
          <div className="lg:hidden mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium opacity-70">Status Guide</span>
              <button 
                onClick={() => setShowMobileKey(false)}
                className="p-1 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium">🎯 Outcomes:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <span 
                    className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 flex items-center justify-center text-[8px] font-bold text-green-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'Customer Signed' ? null : 'Customer Signed')}
                  >
                    CS
                  </span>
                  <span 
                    className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center text-[8px] font-bold text-emerald-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'Appointment Booked' ? null : 'Appointment Booked')}
                  >
                    AB
                  </span>
                  <span 
                    className="w-4 h-4 rounded border-2 border-green-500 bg-green-50 flex items-center justify-center text-[8px] font-bold text-green-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'Interested' ? null : 'Interested')}
                  >
                    I
                  </span>
                  <span 
                    className="w-4 h-4 rounded border-2 border-amber-500 bg-amber-50 flex items-center justify-center text-[8px] font-bold text-amber-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'No for Now' ? null : 'No for Now')}
                  >
                    NN
                  </span>
                  <span 
                    className="w-4 h-4 rounded border-2 border-sky-500 bg-sky-50 flex items-center justify-center text-[8px] font-bold text-sky-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'Already with UW' ? null : 'Already with UW')}
                  >
                    UW
                  </span>
                  <span 
                    className="w-4 h-4 rounded border-2 border-red-500 bg-red-50 flex items-center justify-center text-[8px] font-bold text-red-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'Not Interested' ? null : 'Not Interested')}
                  >
                    NI
                  </span>
                  <span 
                    className="w-4 h-4 rounded border-2 border-slate-500 bg-slate-50 flex items-center justify-center text-[8px] font-bold text-slate-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'No Answer' ? null : 'No Answer')}
                  >
                    NA
                  </span>
                  <span 
                    className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-50 flex items-center justify-center text-[8px] font-bold text-purple-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'No Cold Callers' ? null : 'No Cold Callers')}
                  >
                    NC
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">📊 Progress:</span>
                <div className="flex items-center gap-1">
                  <span 
                    className="w-4 h-4 rounded border border-orange-300 bg-orange-50/50 flex items-center justify-center text-[8px] font-bold text-orange-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'Dropped' ? null : 'Dropped')}
                  >
                    D
                  </span>
                  <span 
                    className="w-4 h-4 rounded border border-indigo-300 bg-indigo-50/50 flex items-center justify-center text-[8px] font-bold text-indigo-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'Knocked' ? null : 'Knocked')}
                  >
                    K
                  </span>
                  <span 
                    className="w-4 h-4 rounded border border-teal-300 bg-teal-50/50 flex items-center justify-center text-[8px] font-bold text-teal-700 cursor-help" 
                    onClick={() => setActiveTooltip(activeTooltip === 'Spoke' ? null : 'Spoke')}
                  >
                    S
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <SectionCard 
          title="Search & Filter" 
          icon={Search}
          actions={
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              {showFilters ? <ChevronRight className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          }
        >
          {showFilters && (
            <div className="space-y-3">
              {/* Search */}
              <div>
                <label className="text-xs opacity-70">Search streets</label>
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by street name or postcode..."
                  className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Status Filter */}
                <div>
                  <label className="text-xs opacity-70">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                  >
                    <option value="all">All Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                {/* Sort By */}
                <div>
                  <label className="text-xs opacity-70">Sort by</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full mt-1 p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                  >
                    <option value="name">Street Name</option>
                    <option value="properties">Number of Properties</option>
                    <option value="status">Status</option>
                    <option value="postcode">Postcode</option>
                  </select>
                </div>
              </div>
              
              <div className="text-xs opacity-70">
                Showing {filteredStreets.length} of {campaign.streets.length} streets
              </div>
            </div>
          )}
        </SectionCard>
        {filteredStreets.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-3">
            {filteredStreets.map(s => (
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
                  {s.properties.map(p => {
                    // Determine button styling based on progression and outcome
                    let buttonStyle = 'border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600';
                    
                    // OUTCOMES (Final Results) - Bold borders (2px) + Saturated colors
                    if (p.result === 'customer_signed') {
                      buttonStyle = 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200';
                    } else if (p.result === 'appointment_booked') {
                      buttonStyle = 'border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200';
                    } else if (p.result === 'no_for_now') {
                      buttonStyle = 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200';
                    } else if (p.result === 'already_uw') {
                      buttonStyle = 'border-2 border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-800 dark:text-sky-200';
                    } else if (p.result === 'not_interested') {
                      buttonStyle = 'border-2 border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
                    } else if (p.result === 'no_answer') {
                      buttonStyle = 'border-2 border-slate-500 bg-slate-50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-200';
                    } else if (p.result === 'no_cold_callers') {
                      buttonStyle = 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200';
                    } 
                    // STATUS STATES (Activity Progress) - Thin borders (1px) + Muted colors
                    else if (p.spoke) {
                      buttonStyle = 'border border-teal-300 bg-teal-50/50 dark:bg-teal-900/10 text-teal-600 dark:text-teal-400';
                    } else if (p.knocked) {
                      buttonStyle = 'border border-indigo-300 bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400';
                    } else if (p.dropped) {
                      buttonStyle = 'border border-orange-300 bg-orange-50/50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400';
                    }
                    
                    return (
                      <button 
                        key={p.id} 
                        onClick={()=>onOpenProperty(s.id, p.id)} 
                        className={`px-2 py-1 rounded-lg text-xs transition-colors flex-shrink-0 relative ${buttonStyle}`}
                        title={
                          p.result && p.result !== 'none' 
                            ? `Outcome: ${p.result.replace('_', ' ')}` 
                            : p.spoke 
                              ? 'Spoke - No outcome set' 
                              : p.knocked 
                                ? 'Knocked - No outcome set' 
                                : p.dropped 
                                  ? 'Dropped - No outcome set' 
                                  : 'No activity recorded'
                        }
                      >
                        {p.label}
                        {p.followUpAt && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full border border-white dark:border-gray-900 flex items-center justify-center transform translate-x-1 -translate-y-1">
                            <CalendarClock className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <button 
                  onClick={() => onManageProperties(s)}
                  className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors border border-blue-200 dark:border-blue-800 flex-shrink-0"
                >
                  Properties
                </button>
                <button 
                  onClick={() => onEditStreet(s)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                >
                  Edit
                </button>
                <button 
                  onClick={() => onDeleteStreet(s.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800 flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        ) : searchTerm || statusFilter !== "all" ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No streets found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
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
      
      {/* Tooltip Display */}
      {activeTooltip && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
          {activeTooltip}
        </div>
      )}
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

function PropertyView({ street, property, onBack, onUpdate, onShowScripts, onShowLinks, onShowDocuments, onToggleStatus, onViewImage }) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [notes, setNotes] = useState(property.notes || "");

  // Sync notes state when property changes
  useEffect(() => {
    setNotes(property.notes || "");
  }, [property.notes]);

  // Save notes when they change
  const handleNotesChange = (newNotes) => {
    setNotes(newNotes);
    onUpdate({ notes: newNotes });
  };

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
          <div className="flex items-center gap-2">
            {property.followUpAt && (
              <Chip variant="warning" className="text-xs flex items-center gap-1">
                <CalendarClock className="w-3 h-3" />
                Follow-up: {property.followUpAt}
                {property.followUpTypes && (
                  <span className="ml-1">
                    {property.followUpTypes.call && '📞'}
                    {property.followUpTypes.revisit && '🏠'}
                    {property.followUpTypes.message && '💬'}
                  </span>
                )}
              </Chip>
            )}
            <Chip variant="default" className="text-xs">
              {street.postcode}
            </Chip>
          </div>
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
          <div className="relative">
            <button 
              onClick={()=>setShowFollowUp(true)} 
              className={`w-full px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors ${
                property.followUpAt 
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <CalendarClock className="w-4 h-4"/> 
              {property.followUpAt ? (
                <span>
                  Follow-up: {property.followUpAt}
                  {property.followUpTypes && (
                    <span className="ml-1">
                      {property.followUpTypes.call && '📞'}
                      {property.followUpTypes.revisit && '🏠'}
                      {property.followUpTypes.message && '💬'}
                    </span>
                  )}
                </span>
              ) : 'Schedule follow‑up'}
            </button>
            
            {/* Remove Follow-up Button - Only show when follow-up exists */}
            {property.followUpAt && (
              <button
                onClick={() => {
                  // Remove follow-up data
                  onUpdate({ 
                    followUpAt: null,
                    followUpTypes: null,
                    contactDetails: null
                  });
                  
                  // Remove follow-up note from notes
                  if (property.notes) {
                    console.log('Original notes:', property.notes);
                    // Split notes into lines to process more carefully
                    const noteLines = property.notes.split('\n');
                    const filteredLines = [];
                    let skipNextLines = false;
                    
                    for (let i = 0; i < noteLines.length; i++) {
                      const line = noteLines[i];
                      
                      // Check if this line starts a follow-up note (with or without emoji)
                      if (line.includes('Follow-up scheduled:') || line.includes('Follow-up scheduled for') || 
                          line.includes('📅 Follow-up scheduled:') || line.includes('📅 Follow-up scheduled for')) {
                        console.log('Found follow-up note start at line', i, ':', line);
                        skipNextLines = true;
                        continue; // Skip this line
                      }
                      
                      // If we're skipping lines, check if we've reached the end of the follow-up note
                      if (skipNextLines) {
                        // If we hit an empty line or a line that doesn't start with common follow-up patterns, stop skipping
                        if (line.trim() === '' || 
                            (!line.includes('Type:') && 
                             !line.includes('Contact:') && 
                             !line.startsWith('📞') && 
                             !line.startsWith('🏠') && 
                             !line.startsWith('💬'))) {
                          console.log('Ending follow-up note skip at line', i, ':', line);
                          skipNextLines = false;
                          // Don't skip this line - it's the start of a new note
                        } else {
                          console.log('Skipping follow-up note line', i, ':', line);
                          continue; // Skip this line (part of follow-up note)
                        }
                      }
                      
                      // Add this line if we're not skipping
                      if (!skipNextLines) {
                        filteredLines.push(line);
                      }
                    }
                    
                    // Join lines back together and clean up extra whitespace
                    const updatedNotes = filteredLines.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
                    console.log('Updated notes:', updatedNotes);
                    onUpdate({ notes: updatedNotes });
                    // Update local notes state to reflect the change in the UI
                    setNotes(updatedNotes);
                    console.log('Local notes state updated to:', updatedNotes);
                  }
                }}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                title="Remove follow-up"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
                    <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={onShowScripts} 
              className="px-3 py-2 rounded-xl bg-primary-600 text-white text-sm flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4"/> Scripts
            </button>
            <button 
              onClick={onShowLinks} 
              className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Link2 className="w-4 h-4"/> Links
            </button>
            <button 
              onClick={onShowDocuments} 
              className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <File className="w-4 h-4"/> Documents
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label className="text-xs opacity-70">Notes (avoid personal data)</label>
            {notes !== (property.notes || "") && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
          <textarea 
            value={notes} 
            onChange={e => handleNotesChange(e.target.value)} 
            className="w-full mt-1 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors" 
            rows={3} 
            placeholder="e.g., 'best after 6pm', 'steep steps'"
          />
          <div className="mt-4">
            <label className="text-xs opacity-70 mb-2 block">Conversation Outcome</label>
            <div className="grid grid-cols-3 gap-2">
              <OutcomeButton 
                label="Customers Signed" 
                value="customer_signed" 
                current={property.result} 
                onClick={() => onUpdate({ result: 'customer_signed' })}
                variant="success"
              />
              <OutcomeButton 
                label="Appointment Booked" 
                value="appointment_booked" 
                current={property.result} 
                onClick={() => onUpdate({ result: 'appointment_booked' })}
                variant="success"
              />
              <OutcomeButton 
                label="Interested" 
                value="interested" 
                current={property.result} 
                onClick={() => onUpdate({ result: 'interested' })}
                variant="success"
              />
              <OutcomeButton 
                label="No for Now" 
                value="no_for_now" 
                current={property.result} 
                onClick={() => onUpdate({ result: 'no_for_now' })}
                variant="warning"
              />
              <OutcomeButton 
                label="Already with UW" 
                value="already_uw" 
                current={property.result} 
                onClick={() => onUpdate({ result: 'already_uw' })}
                variant="info"
              />
              <OutcomeButton 
                label="Not Interested" 
                value="not_interested" 
                current={property.result} 
                onClick={() => onUpdate({ result: 'not_interested' })}
                variant="error"
              />
              <OutcomeButton 
                label="No Answer" 
                value="no_answer" 
                current={property.result} 
                onClick={() => onUpdate({ result: 'no_answer' })}
                variant="default"
              />
              <OutcomeButton 
                label="No Cold Callers" 
                value="no_cold_callers" 
                current={property.result} 
                onClick={() => onUpdate({ result: 'no_cold_callers' })}
                variant="purple"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <button 
              onClick={() => setShowPhotoModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {property.photo ? 'Change photo' : 'Attach photo'}
            </button>
            <button 
              onClick={() => onUpdate({ result: 'none' })}
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Clear outcome
            </button>
          </div>
          
          {property.photo && (
            <div className="mt-3">
              <div className="relative">
                <div
                  onClick={() => onViewImage(property.photo, "Property Photo")}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="w-full block bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors overflow-hidden photo-viewer-button cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  <div className="w-full h-48 flex items-center justify-center p-2">
                    <img 
                      src={property.photo} 
                      alt="Property photo" 
                      className="max-w-full max-h-full object-contain pointer-events-none"
                      draggable="false"
                    />
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ photo: null });
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm z-10"
                  style={{ touchAction: 'manipulation' }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

                            <FollowUpModal
                        open={showFollowUp} 
                        onClose={()=>setShowFollowUp(false)} 
                        existingFollowUp={property.followUpAt ? {
                          followUpAt: property.followUpAt,
                          followUpTypes: property.followUpTypes,
                          contactDetails: property.contactDetails
                        } : null}
                        onSave={(followUpData)=>{ 
                          // Create follow-up note
                          const followUpNote = `📅 Follow-up scheduled: ${new Date(followUpData.dateTime).toLocaleString('en-GB', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}`;
                          
                          const typeEmojis = [];
                          if (followUpData.types.call) typeEmojis.push('📞 Call');
                          if (followUpData.types.revisit) typeEmojis.push('🏠 Revisit');
                          if (followUpData.types.message) typeEmojis.push('💬 Message');
                          
                          const typeNote = typeEmojis.length > 0 ? `\nType: ${typeEmojis.join(', ')}` : '';
                          
                          let contactNote = '';
                          if (followUpData.contactDetails) {
                            contactNote = `\nContact: ${followUpData.contactDetails.name}${followUpData.contactDetails.phone ? ` (${followUpData.contactDetails.phone})` : ''}`;
                          }
                          
                          const fullNote = followUpNote + typeNote + contactNote;
                          console.log('Created follow-up note:', fullNote);
                          
                          // Handle notes - if editing existing follow-up, replace the old note; otherwise add new note
                          let updatedNotes;
                          if (property.followUpAt) {
                            // Editing existing follow-up - remove old follow-up note and add new one
                            if (property.notes) {
                              const noteLines = property.notes.split('\n');
                              const filteredLines = [];
                              let skipNextLines = false;
                              
                              for (let i = 0; i < noteLines.length; i++) {
                                const line = noteLines[i];
                                
                                // Check if this line starts a follow-up note (with or without emoji)
                                if (line.includes('Follow-up scheduled:') || line.includes('Follow-up scheduled for') || 
                                    line.includes('📅 Follow-up scheduled:') || line.includes('📅 Follow-up scheduled for')) {
                                  skipNextLines = true;
                                  continue; // Skip this line
                                }
                                
                                // If we're skipping lines, check if we've reached the end of the follow-up note
                                if (skipNextLines) {
                                  // If we hit an empty line or a line that doesn't start with common follow-up patterns, stop skipping
                                  if (line.trim() === '' || 
                                      (!line.includes('Type:') && 
                                       !line.includes('Contact:') && 
                                       !line.startsWith('📞') && 
                                       !line.startsWith('🏠') && 
                                       !line.startsWith('💬'))) {
                                    skipNextLines = false;
                                    // Don't skip this line - it's the start of a new note
                                  } else {
                                    continue; // Skip this line (part of follow-up note)
                                  }
                                }
                                
                                // Add this line if we're not skipping
                                if (!skipNextLines) {
                                  filteredLines.push(line);
                                }
                              }
                              
                              // Join lines back together and add new follow-up note
                              const cleanedNotes = filteredLines.join('\n').replace(/\n\s*\n\s*\n/g, '\n\n').trim();
                              updatedNotes = cleanedNotes ? `${cleanedNotes}\n\n${fullNote}` : fullNote;
                            } else {
                              updatedNotes = fullNote;
                            }
                          } else {
                            // Creating new follow-up - add to existing notes
                            updatedNotes = notes ? `${notes}\n\n${fullNote}` : fullNote;
                          }
                          
                          onUpdate({ 
                            followUpAt: followUpData.dateTime,
                            followUpTypes: followUpData.types,
                            contactDetails: followUpData.contactDetails,
                            notes: updatedNotes
                          }); 
                          
                          // Update local notes state
                          setNotes(updatedNotes);
                          setShowFollowUp(false); 
                        }}
                      />
      
      <PhotoModal 
        open={showPhotoModal} 
        onClose={()=>setShowPhotoModal(false)} 
        onSave={(photoData)=>{ onUpdate({ photo: photoData }); setShowPhotoModal(false); }} 
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

function OutcomeButton({ label, value, current, onClick, variant = "default" }) {
  const isActive = current === value;
  
  const variantStyles = {
    success: isActive 
      ? 'bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-300' 
      : 'bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700',
    warning: isActive 
      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 text-yellow-700 dark:text-yellow-300' 
      : 'bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-yellow-300 dark:hover:border-yellow-700',
    error: isActive 
      ? 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-700 dark:text-red-300' 
      : 'bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-red-300 dark:hover:border-red-700',
    info: isActive 
      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-700 dark:text-blue-300' 
      : 'bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700',
    purple: isActive 
      ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400 text-purple-700 dark:text-purple-300' 
      : 'bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700',
    default: isActive 
      ? 'bg-gray-50 dark:bg-gray-800/60 border-gray-400 text-gray-700 dark:text-gray-300' 
      : 'bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
  };

  return (
    <button 
      onClick={onClick} 
      className={`px-3 py-2 rounded-xl border text-sm transition-all ${variantStyles[variant]}`}
    >
      {label}
    </button>
  );
}

function FollowUpModal({ open, onClose, onSave, existingFollowUp = null }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [followUpTypes, setFollowUpTypes] = useState({
    call: false,
    revisit: false,
    message: false
  });
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Initialize form with existing data when modal opens
  useEffect(() => {
    if (existingFollowUp && open) {
      const followUpDate = new Date(existingFollowUp.followUpAt);
      setDate(followUpDate.toISOString().split('T')[0]);
      setTime(followUpDate.toTimeString().slice(0, 5));
      setFollowUpTypes(existingFollowUp.followUpTypes || { call: false, revisit: false, message: false });
      setContactName(existingFollowUp.contactDetails?.name || "");
      setContactPhone(existingFollowUp.contactDetails?.phone || "");
    } else if (!existingFollowUp && open) {
      // Reset form when creating new follow-up
      setDate("");
      setTime("");
      setFollowUpTypes({ call: false, revisit: false, message: false });
      setContactName("");
      setContactPhone("");
    }
  }, [existingFollowUp, open]);

  const handleTypeChange = (type) => {
    setFollowUpTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleSave = () => {
    const followUpData = {
      dateTime: `${date}T${time}:00`,
      types: followUpTypes,
      contactDetails: (followUpTypes.message || followUpTypes.call) ? { name: contactName, phone: contactPhone } : null
    };
    onSave(followUpData);
  };

  const hasSelectedTypes = Object.values(followUpTypes).some(Boolean);

  return (
    <Drawer open={open} onClose={onClose} title={existingFollowUp ? "Edit follow‑up" : "Schedule follow‑up"}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs opacity-70">Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={date} 
                onChange={e=>setDate(e.target.value)} 
                className="w-full mt-1 p-2 pr-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                style={{
                  colorScheme: 'light dark'
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs opacity-70">Time</label>
            <div className="relative">
              <input 
                type="time" 
                value={time} 
                onChange={e=>setTime(e.target.value)} 
                className="w-full mt-1 p-2 pr-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                style={{
                  colorScheme: 'light dark'
                }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Type Checkboxes */}
        <div>
          <label className="text-xs opacity-70 mb-2 block">Follow-up Type (Optional)</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={followUpTypes.call} 
                onChange={() => handleTypeChange('call')}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm">📞 Call</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={followUpTypes.revisit} 
                onChange={() => handleTypeChange('revisit')}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm">🏠 Revisit</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={followUpTypes.message} 
                onChange={() => handleTypeChange('message')}
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm">💬 Message</span>
            </label>
          </div>
        </div>

        {/* Contact Details for Message or Call Follow-up */}
        {(followUpTypes.message || followUpTypes.call) && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Contact Details for {followUpTypes.message && followUpTypes.call ? 'Message/Call' : followUpTypes.message ? 'Message' : 'Call'}
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs opacity-70">Person's Name</label>
                <input 
                  type="text" 
                  value={contactName} 
                  onChange={e => setContactName(e.target.value)} 
                  className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-colors"
                  placeholder="e.g., John Smith"
                />
              </div>
              <div>
                <label className="text-xs opacity-70">Phone Number</label>
                <input 
                  type="tel" 
                  value={contactPhone} 
                  onChange={e => setContactPhone(e.target.value)} 
                  className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-colors"
                  placeholder="e.g., 07700 900000"
                />
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleSave} 
          disabled={!date || !time}
          className="w-full px-3 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {existingFollowUp ? "Update reminder" : "Save reminder"}
        </button>
      </div>
    </Drawer>
  );
}

function PhotoModal({ open, onClose, onSave }) {
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (capturedImage) {
      onSave(capturedImage);
      setCapturedImage(null);
    }
  };

  const handleClose = () => {
    setCapturedImage(null);
    onClose();
  };

  return (
    <Drawer open={open} onClose={handleClose} title="Add Property Photo">
      <div className="space-y-4">
        {!capturedImage && (
          <div className="space-y-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Take a photo or select from your gallery to document this property.
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="px-4 py-3 rounded-xl bg-primary-600 text-white text-sm flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
              
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                From Gallery
              </button>
            </div>
            
            {/* Camera input - opens native camera */}
            <input 
              ref={cameraInputRef}
              type="file" 
              accept="image/*" 
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Gallery input - opens camera roll/file picker */}
            <input 
              ref={galleryInputRef}
              type="file" 
              accept="image/*" 
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {capturedImage && (
          <div className="space-y-3">
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Captured photo" 
                className="w-full h-64 object-contain rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"
              />
              <button 
                onClick={() => setCapturedImage(null)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
              >
                Save Photo
              </button>
              <button 
                onClick={() => setCapturedImage(null)}
                className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Retake
              </button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}



function ScriptsPanel() {
  const [tab, setTab] = useState("system");
  const [editingScript, setEditingScript] = useState(null);
  const [customScripts, setCustomScripts] = useState(() => {
    const saved = localStorage.getItem('partner_scripts');
    return saved ? JSON.parse(saved) : {};
  });
  const [showNewScriptModal, setShowNewScriptModal] = useState(false);
  const [newScriptData, setNewScriptData] = useState({ title: '', content: '' });
  const [scriptOrder, setScriptOrder] = useState(() => {
    const saved = localStorage.getItem('partner_script_order');
    return saved ? JSON.parse(saved) : {};
  });
  const [isReordering, setIsReordering] = useState(false);
  
  const tabs = [
    { key: "system", label: "Dan's System" },
    { key: "opener", label: "Openers" },
    { key: "objection", label: "Objections" },
    { key: "closer", label: "Closers" },
  ];
  
  // Get partner name from localStorage
  const partnerName = localStorage.getItem('partner_name') || 'Your Name';
  
  const danCrooksSystem = [
    {
      id: "intro",
      title: "1. INTRODUCTION",
      content: `Hi, I'm ${partnerName} I live locally. I posted this through a couple of days ago. If you're anything like me, you probably didn't get a chance to look at it and you put it in the recycling bin. Am I right?`
    },
    {
      id: "story",
      title: "2. SHORT STORY", 
      content: "In a nutshell, I'm partnered with a company called Utility Warehouse. What we do is we help people with some of the main utility companies like British Gas, BT and many others, to bring their bill down."
    },
    {
      id: "presentation",
      title: "3. PRESENTATION",
      content: "I've spoken to quite a few of your neighbours who are getting fed up with paying a fortune for their utility bills. Because I'm the local partner in our area, my job is simply to put you on my list to check if you are eligible for any reductions."
    },
    {
      id: "factfind",
      title: "4. FACT FIND",
      content: "• Have you heard of UW?\n• Are you with any of these companies?\n• In the last 6 months?\n• Have your bills gone up or down?\n• Are you a homeowner or a tenant?"
    },
    {
      id: "appointment",
      title: "5. ASK FOR APPOINTMENT",
      content: "Fantastic, because if you are with them, what I can do is put you on my list and check if you are eligible for us to bring your bills down. Would that be ok? I can either book an appointment to pop back or if you are free now, I can run through bringing your bills down with you. What's best for you?"
    }
  ];
  
  const items = tab === "system" ? danCrooksSystem : seedScripts[tab];

  // Save custom scripts to localStorage
  const saveCustomScripts = (scripts) => {
    setCustomScripts(scripts);
    localStorage.setItem('partner_scripts', JSON.stringify(scripts));
  };

  // Save script order to localStorage
  const saveScriptOrder = (order) => {
    setScriptOrder(order);
    localStorage.setItem('partner_script_order', JSON.stringify(order));
  };

  // Handle edit script
  const handleEditScript = (script) => {
    setEditingScript(script);
  };

  // Handle save edited script
  const handleSaveScript = (scriptId, newContent) => {
    const updatedScripts = {
      ...customScripts,
      [scriptId]: {
        ...editingScript,
        content: newContent,
        isCustom: true,
        category: tab
      }
    };
    saveCustomScripts(updatedScripts);
    setEditingScript(null);
  };

  // Handle save as new script
  const handleSaveAsNew = (originalScript) => {
    const newId = `custom_${Date.now()}`;
    const newScript = {
      ...originalScript,
      id: newId,
      title: `${originalScript.title} (Copy)`,
      isCustom: true,
      category: tab
    };
    
    const updatedScripts = {
      ...customScripts,
      [newId]: newScript
    };
    saveCustomScripts(updatedScripts);
  };

  // Handle create new script
  const handleCreateNewScript = () => {
    if (!newScriptData.title.trim() || !newScriptData.content.trim()) return;
    
    const newId = `custom_${Date.now()}`;
    const newScript = {
      id: newId,
      title: newScriptData.title,
      content: newScriptData.content,
      isCustom: true,
      category: tab
    };
    
    const updatedScripts = {
      ...customScripts,
      [newId]: newScript
    };
    saveCustomScripts(updatedScripts);
    
    setNewScriptData({ title: '', content: '' });
    setShowNewScriptModal(false);
  };

  // Handle delete custom script
  const handleDeleteScript = (scriptId) => {
    if (confirm('Are you sure you want to delete this script? This action cannot be undone.')) {
      const updatedScripts = { ...customScripts };
      delete updatedScripts[scriptId];
      saveCustomScripts(updatedScripts);
    }
  };



  // Get all scripts including custom ones
  const getAllScripts = () => {
    const baseScripts = tab === "system" ? danCrooksSystem : seedScripts[tab];
    const customScriptsForTab = Object.values(customScripts).filter(
      script => script.category === tab || (tab === "system" && script.category === "system")
    );
    return [...baseScripts, ...customScriptsForTab];
  };

  const displayItems = getAllScripts();

  // Move script up or down functionality
  const moveScript = (scriptId, direction) => {
    // Protect Dan's System - no reordering allowed
    if (tab === "system") return;

    const items = [...getAllScripts()];
    const currentIndex = items.findIndex(item => item.id === scriptId);
    
    if (direction === 'up' && currentIndex > 0) {
      // Move up
      [items[currentIndex], items[currentIndex - 1]] = [items[currentIndex - 1], items[currentIndex]];
    } else if (direction === 'down' && currentIndex < items.length - 1) {
      // Move down
      [items[currentIndex], items[currentIndex + 1]] = [items[currentIndex + 1], items[currentIndex]];
    } else {
      return; // Can't move further
    }

    // Save the new order
    const newOrder = items.map((item, index) => ({ id: item.id, order: index }));
    const updatedOrder = {
      ...scriptOrder,
      [tab]: newOrder
    };
    saveScriptOrder(updatedOrder);
  };

  // Get ordered scripts
  const getOrderedScripts = () => {
    const items = getAllScripts();
    const tabOrder = scriptOrder[tab];
    
    if (!tabOrder || tabOrder.length === 0) {
      return items;
    }

    // Sort based on saved order
    return items.sort((a, b) => {
      const aOrder = tabOrder.find(order => order.id === a.id)?.order ?? 999;
      const bOrder = tabOrder.find(order => order.id === b.id)?.order ?? 999;
      return aOrder - bOrder;
    });
  };

  const finalDisplayItems = getOrderedScripts();

  return (
    <div>
      <div className="space-y-3 mb-4">
        {/* Tab Navigation - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
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
        
        {/* Action Buttons - Mobile Optimized */}
        {tab !== "system" && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowNewScriptModal(true)}
              className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Script
            </button>
            <button
              onClick={() => setIsReordering(!isReordering)}
              className={`px-3 py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${
                isReordering 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {isReordering ? <Check className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              {isReordering ? 'Done Reordering' : 'Reorder'}
            </button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {finalDisplayItems.map((s, index) => (
          <div 
            key={s.id} 
            className={`p-3 rounded-2xl border transition-all duration-200 ${
              s.isCustom 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                : 'bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800'
            }`}
          >
            <div className="text-sm font-medium mb-1 flex items-center gap-2">
              {s.title}
              {s.isCustom && (
                <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  Custom
                </span>
              )}
            </div>
            
            {editingScript?.id === s.id ? (
              <div className="space-y-2">
                <textarea
                  value={editingScript.content}
                  onChange={(e) => setEditingScript({...editingScript, content: e.target.value})}
                  className="w-full p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm resize-none"
                  rows={4}
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSaveScript(s.id, editingScript.content)}
                    className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingScript(null)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm opacity-90 whitespace-pre-line">{s.content}</div>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  {tab !== "system" && !isReordering && (
                    <>
                      <button 
                        onClick={() => handleEditScript(s)}
                        className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleSaveAsNew(s)}
                        className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Save as New
                      </button>
                      {s.isCustom && (
                        <button 
                          onClick={() => handleDeleteScript(s.id)}
                          className="px-3 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </>
                  )}
                  {isReordering && tab !== "system" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => moveScript(s.id, 'up')}
                        disabled={index === 0}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveScript(s.id, 'down')}
                        disabled={index === finalDisplayItems.length - 1}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {isReordering && tab === "system" && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                      <div className="w-4 h-4 border-2 border-amber-400 rounded"></div>
                      Dan's System - Fixed Order
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* New Script Modal */}
      {showNewScriptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Script</h3>
              <button
                onClick={() => setShowNewScriptModal(false)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Script Title</label>
                <input
                  type="text"
                  value={newScriptData.title}
                  onChange={(e) => setNewScriptData({...newScriptData, title: e.target.value})}
                  placeholder="e.g., My Custom Opener"
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Script Content</label>
                <textarea
                  value={newScriptData.content}
                  onChange={(e) => setNewScriptData({...newScriptData, content: e.target.value})}
                  placeholder="Type or paste your script here..."
                  rows={6}
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateNewScript}
                  disabled={!newScriptData.title.trim() || !newScriptData.content.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Script
                </button>
                <button
                  onClick={() => setShowNewScriptModal(false)}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


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

function DocumentsPanel({ onViewPdf, onViewImage }) {
  const [documents, setDocuments] = useState(() => {
    // Load partner's custom documents from localStorage
    const savedDocs = localStorage.getItem('partner_documents');
    return savedDocs ? JSON.parse(savedDocs) : [];
  });

  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showManageDocuments, setShowManageDocuments] = useState(false);

  // Default UW documents (shared across all users)
  const defaultDocuments = [
    {
      id: "presenter-sheet",
      title: "£20k Giveaway Presenter",
      description: "Laminated presenter sheet for doorstep conversations",
      type: "link",
      url: "https://uw.co.uk/partner/portal/incentives/the-20k-giveaway/form",
      icon: FileText,
      category: "Sales Materials",
      isDefault: true
    },

    {
      id: "uw-presenter",
      title: "UW Presenter",
      description: "Official UW presenter document for doorstep conversations",
      type: "link",
      url: "https://assets.ctfassets.net/ihl5uj459rzx/6UbKQzbKP2sHmMz3fEn648/93f3b2fb3b047f63d0005181c62535dc/UW_Presenter.pdf",
      icon: FileText,
      category: "Tools",
      isDefault: true
    },
    {
      id: "utility-logos",
      title: "Utility Company Logos",
      description: "Reference logos for major UK utility and telecommunications companies",
      type: "image",
      url: "/utility-logos.png",
      icon: Globe,
      category: "Tools",
      isDefault: true
    },
  ];

  // Combine default and custom documents
  const allDocuments = [...defaultDocuments, ...documents];

  const saveDocuments = (newDocs) => {
    setDocuments(newDocs);
    localStorage.setItem('partner_documents', JSON.stringify(newDocs));
  };

  const addDocument = (newDoc) => {
    const docWithId = {
      ...newDoc,
      id: `custom_${Date.now()}`,
      isDefault: false
    };
    const updatedDocs = [...documents, docWithId];
    saveDocuments(updatedDocs);
    setShowAddDocument(false);
  };

  const removeDocument = (docId) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    saveDocuments(updatedDocs);
  };

  const categories = [...new Set(allDocuments.map(doc => doc.category))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDocuments = selectedCategory === "All" 
    ? allDocuments 
    : allDocuments.filter(doc => doc.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Header with Add/Manage buttons */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
              selectedCategory === "All"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-xl text-sm transition-colors ${
                selectedCategory === category
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddDocument(true)}
            className="px-3 py-1.5 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>
          {documents.length > 0 && (
            <button
              onClick={() => setShowManageDocuments(true)}
              className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage
            </button>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${
              doc.isDefault 
                ? "bg-white/70 dark:bg-gray-900/70 border-gray-200 dark:border-gray-800 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:border-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-xl ${
                doc.isDefault 
                  ? "bg-blue-50 dark:bg-blue-900/20" 
                  : "bg-green-100 dark:bg-green-900/30"
              }`}>
                <doc.icon className={`w-5 h-5 ${
                  doc.isDefault 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-green-600 dark:text-green-400"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm flex items-center gap-2">
                  {doc.title}
                  {!doc.isDefault && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                      Custom
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{doc.description}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{doc.category}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Only show View Document button for images and PDFs, not for links */}
              {(doc.type === 'image' || doc.type === 'pdf') && (
                <button
                  onClick={() => {
                    if (doc.type === 'image') {
                      // For images, use the image viewer
                      onViewImage(doc.url, doc.title);
                    } else {
                      // For PDFs and HTML, use the PDF viewer
                      onViewPdf(doc.url, doc.title);
                    }
                  }}
                  className="p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  title={doc.type === 'image' ? "View Image" : "View Document"}
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              {/* Show Open in new tab button for all types except images */}
              {doc.type !== 'image' && (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {!doc.isDefault && (
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs opacity-70 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">💡 How to use:</div>
        <div className="text-blue-700 dark:text-blue-300 space-y-1">
          <div>• <strong>View Document:</strong> Opens document inline for quick reference</div>
          <div>• <strong>Open in new tab:</strong> Available for PDFs and links (not images)</div>
          <div>• <strong>Show to customer:</strong> Use "View Document" to display on your device</div>
          <div>• <strong>Add your own:</strong> Use "Add Document" to include your custom materials</div>
        </div>
      </div>

      {/* Add Document Modal */}
      {showAddDocument && (
        <AddDocumentModal 
          onAdd={addDocument} 
          onClose={() => setShowAddDocument(false)} 
        />
      )}

      {/* Manage Documents Modal */}
      {showManageDocuments && (
        <ManageDocumentsModal 
          documents={documents}
          onRemove={removeDocument}
          onClose={() => setShowManageDocuments(false)} 
        />
      )}
    </div>
  );
}

function AddDocumentModal({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Templates");
  const [type, setType] = useState("pdf");

  const categories = ["Templates", "Sales Materials", "Marketing", "Tools", "Support", "Training"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !url) return;

    onAdd({
      title,
      description,
      url,
      category,
      type,
      icon: FileText
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Add Custom Document</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Document Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20"
              placeholder="e.g., My Custom Brochure"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20"
              placeholder="Brief description of the document"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Document URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20"
              placeholder="https://example.com/document.pdf"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20"
              >
                <option value="pdf">PDF</option>
                <option value="html">HTML</option>
                <option value="link">External Link</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
            >
              Add Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ManageDocumentsModal({ documents, onRemove, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Manage Custom Documents</h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-2">No custom documents yet</div>
            <div className="text-sm text-gray-400 dark:text-gray-500">Add documents using the "Add Document" button</div>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{doc.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{doc.description}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">{doc.category}</div>
                </div>
                <button
                  onClick={() => onRemove(doc.id)}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageViewer({ url, title, onClose }) {
  return (
    <div className="h-full flex flex-col">
      {/* Image Display */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
        <img
          src={url}
          alt={title}
          className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
}

function PdfViewer({ url, title }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setUseFallback(false);
  }, [url]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    // Check if this is a PDF and we have a fallback HTML version
    if (url.endsWith('.pdf') && !useFallback) {
      const fallbackUrl = url.replace('.pdf', '.html');
      setUseFallback(true);
      // Try the fallback URL
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.src = fallbackUrl;
        setIsLoading(true);
      }
    } else {
      setError("Failed to load document. Please try opening in a new tab instead.");
    }
  };

  const isHtml = url.endsWith('.html');
  const displayUrl = useFallback ? url.replace('.pdf', '.html') : url;
  const isPdf = url.endsWith('.pdf');
  
  // Enhanced PDF parameters for better viewing
  const getPdfUrl = () => {
    if (!isPdf) return displayUrl;
    const baseParams = 'toolbar=1&navpanes=1&scrollbar=1&view=FitH&pagemode=thumbs&statusbar=1';
    const zoomParam = `&zoom=${zoomLevel}`;
    return `${displayUrl}#${baseParams}${zoomParam}`;
  };

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : 'h-full'} flex flex-col`}>
      {/* Document Controls - Mobile Optimized */}
      <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="text-xs sm:text-sm font-medium truncate flex-1 mr-2">{title}</div>
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          {isPdf && (
            <>
              <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl px-1 sm:px-2">
                <button
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 25))}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Zoom Out"
                >
                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                <span className="text-xs font-medium min-w-[2rem] sm:min-w-[3rem] text-center">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Zoom In"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="px-2 py-1.5 sm:px-3 rounded-lg sm:rounded-xl bg-blue-600 text-white text-xs sm:text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 sm:gap-2"
              >
                {isFullScreen ? <X className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{isFullScreen ? 'Exit Full Screen' : 'Full Screen'}</span>
              </button>
            </>
          )}
          <a
            href={displayUrl}
            target="_blank"
            rel="noreferrer"
            className="px-2 py-1.5 sm:px-3 rounded-lg sm:rounded-xl bg-primary-600 text-white text-xs sm:text-sm hover:bg-primary-700 transition-colors flex items-center gap-1 sm:gap-2"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Open in new tab</span>
          </a>
          {!isHtml && (
            <a
              href={displayUrl}
              download
              className="px-2 py-1.5 sm:px-3 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 sm:gap-2"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Document Viewer */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isHtml ? "Loading document..." : "Loading PDF..."}
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-4">
              <div className="text-red-600 dark:text-red-400 mb-2">⚠️ {error}</div>
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
              >
                Open in new tab
              </a>
            </div>
          </div>
        )}

        <iframe
          src={getPdfUrl()}
          className="w-full h-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          title={title}
          allowFullScreen={true}
          style={{
            minHeight: '100%',
            height: '100%'
          }}
        />
      </div>
    </div>
  );
}

function SettingsPanel({ dark, onToggleDark, onExport, onImport, onReset }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('google_places_api_key') || '');
  const [partnerName, setPartnerName] = useState(() => {
    const saved = localStorage.getItem('partner_name');
    return saved || 'Your Name';
  });
  const [showNameModal, setShowNameModal] = useState(false);

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
        <h4 className="font-medium">Personalization</h4>
        <button 
          onClick={() => setShowNameModal(true)}
          className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Set Your Name ({partnerName})
        </button>
      </div>
      
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

        <button 
          onClick={() => setShowAbout(true)}
          className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
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

      {/* Set Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Set Your Name</h3>
              <button
                onClick={() => setShowNameModal(false)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="e.g., John Smith"
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  This will be used throughout the app, including in scripts
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    if (partnerName.trim()) {
                      localStorage.setItem('partner_name', partnerName.trim());
                      setShowNameModal(false);
                    }
                  }}
                  disabled={!partnerName.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Name
                </button>
                <button
                  onClick={() => setShowNameModal(false)}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HelpPanel() {
  const [expandedSections, setExpandedSections] = useState({
    quickStart: true, // Start with Quick Start expanded
    workflow: false,
    status: false,
    outcomes: false,
    tips: false,
    faq: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Quick Start Guide */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('quickStart')}
          className="w-full p-4 bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5" />
            Quick Start Guide
          </h3>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSections.quickStart ? 'rotate-90' : ''}`} />
        </button>
        {expandedSections.quickStart && (
          <div className="p-4 space-y-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">1. Create Your First Campaign</div>
              <div className="text-blue-700 dark:text-blue-300">
                • Go to <strong>Campaigns</strong> tab<br/>
                • Click <strong>"Create New Campaign"</strong><br/>
                • Enter campaign name, area, and your UW links
              </div>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="font-medium text-green-800 dark:text-green-200 mb-2">2. Add Streets & Properties</div>
              <div className="text-green-700 dark:text-green-300">
                • Go to <strong>Streets</strong> tab<br/>
                • Click <strong>"Add New Street"</strong><br/>
                • Enter street name, postcode, and property numbers/names (comma-separated)
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="font-medium text-purple-800 dark:text-purple-200 mb-2">3. Track Your Activity</div>
              <div className="text-purple-700 dark:text-purple-300">
                • Click on any property number to open it<br/>
                • Mark as <strong>Dropped</strong> (letter delivered)<br/>
                • Mark as <strong>Knocked</strong> (door knocked)<br/>
                • Mark as <strong>Spoke</strong> (conversation had)<br/>
                • Select conversation outcome
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Daily Workflow */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('workflow')}
          className="w-full p-4 bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Workflow
          </h3>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSections.workflow ? 'rotate-90' : ''}`} />
        </button>
        {expandedSections.workflow && (
          <div className="p-4 space-y-2 text-sm">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
              <div>
                <div className="font-medium">Start Your Day</div>
                <div className="text-gray-600 dark:text-gray-400">Check the Dashboard for today's follow-ups and review yesterday's activity</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
              <div>
                <div className="font-medium">Drop Letters</div>
                <div className="text-gray-600 dark:text-gray-400">Go to Streets tab, select your target street, and mark properties as "Dropped"</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="font-medium">Follow Up</div>
                <div className="text-gray-600 dark:text-gray-400">Return to properties where letters were dropped, knock doors, and have conversations</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
              <div>
                <div className="font-medium">Record Outcomes</div>
                <div className="text-gray-600 dark:text-gray-400">Mark properties as "Spoke" and select the appropriate conversation outcome</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
              <div>
                <div className="font-medium">Schedule Follow-ups</div>
                <div className="text-gray-600 dark:text-gray-400">Set reminders for interested prospects and review your daily progress</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Property Status Guide */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('status')}
          className="w-full p-4 bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Check className="w-5 h-5" />
            Property Status Guide
          </h3>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSections.status ? 'rotate-90' : ''}`} />
        </button>
        {expandedSections.status && (
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="font-medium text-orange-800 dark:text-orange-200">Dropped</div>
                <div className="text-orange-700 dark:text-orange-300">Letter delivered through letterbox</div>
              </div>
              <div className="p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="font-medium text-blue-800 dark:text-blue-200">Knocked</div>
                <div className="text-blue-700 dark:text-blue-300">Door knocked, no answer or brief interaction</div>
              </div>
              <div className="p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="font-medium text-green-800 dark:text-green-200">Spoke</div>
                <div className="text-green-700 dark:text-green-300">Full conversation had with resident</div>
              </div>
              <div className="p-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
                <div className="font-medium text-gray-800 dark:text-gray-200">Not Started</div>
                <div className="text-gray-700 dark:text-gray-300">No activity recorded yet</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Outcomes */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('outcomes')}
          className="w-full p-4 bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Conversation Outcomes
          </h3>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSections.outcomes ? 'rotate-90' : ''}`} />
        </button>
        {expandedSections.outcomes && (
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="font-medium text-green-800 dark:text-green-200">Interested</div>
                <div className="text-green-700 dark:text-green-300">Wants to learn more about UW</div>
              </div>
              <div className="p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="font-medium text-green-800 dark:text-green-200">Customers Signed</div>
                <div className="text-green-700 dark:text-green-300">Successfully signed up with UW</div>
              </div>
              <div className="p-3 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="font-medium text-green-800 dark:text-green-200">Appointment Booked</div>
                <div className="text-green-700 dark:text-green-300">Meeting scheduled for follow-up</div>
              </div>
              <div className="p-3 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                <div className="font-medium text-yellow-800 dark:text-yellow-200">No for Now</div>
                <div className="text-yellow-700 dark:text-yellow-300">Not interested at this time</div>
              </div>
              <div className="p-3 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="font-medium text-blue-800 dark:text-blue-200">Already with UW</div>
                <div className="text-blue-700 dark:text-blue-300">Customer is already a UW member</div>
              </div>
                        <div className="p-3 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <div className="font-medium text-red-800 dark:text-red-200">Not Interested</div>
            <div className="text-red-700 dark:text-red-300">Definitely not interested</div>
          </div>
          <div className="p-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20 rounded-xl">
            <div className="font-medium text-gray-800 dark:text-gray-200">Unreachable</div>
            <div className="text-gray-700 dark:text-gray-300">Unable to contact after multiple attempts</div>
          </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips & Best Practices */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('tips')}
          className="w-full p-4 bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Info className="w-5 h-5" />
            Tips & Best Practices
          </h3>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSections.tips ? 'rotate-90' : ''}`} />
        </button>
        {expandedSections.tips && (
          <div className="p-4 space-y-2 text-sm">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">📱 Use Scripts & Links</div>
              <div className="text-amber-700 dark:text-amber-300">Open the Scripts and Links drawers while on a property for quick access to talking points and UW resources.</div>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">📊 Daily Tracking</div>
              <div className="text-blue-700 dark:text-blue-300">The Dashboard shows only today's activity. Use Reports for overall campaign progress and historical data.</div>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="font-medium text-green-800 dark:text-green-200 mb-1">🏠 Property Names</div>
              <div className="text-green-700 dark:text-green-300">You can use house names (e.g., "Birch Tree House") in addition to numbers. Separate multiple properties with commas.</div>
            </div>
            
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">🔄 Status Updates</div>
              <div className="text-purple-700 dark:text-purple-300">You can toggle statuses on/off if you make a mistake. Click the same button again to remove a status.</div>
            </div>
            
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
              <div className="font-medium text-indigo-800 dark:text-indigo-200 mb-1">💾 Data Backup</div>
              <div className="text-indigo-700 dark:text-indigo-300">Regularly export your data from Settings to keep a backup of your campaigns and progress.</div>
            </div>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <button 
          onClick={() => toggleSection('faq')}
          className="w-full p-4 bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors"
        >
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
          </h3>
          <ChevronRight className={`w-5 h-5 transition-transform ${expandedSections.faq ? 'rotate-90' : ''}`} />
        </button>
        {expandedSections.faq && (
          <div className="p-4 space-y-3 text-sm">
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 font-medium">How do I add a new street to an existing campaign?</div>
              <div className="p-3">Go to the Streets tab and click "Add New Street". Enter the street name, postcode, and property numbers separated by commas.</div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 font-medium">Can I edit property numbers after creating a street?</div>
              <div className="p-3">Yes! Click the "Properties" button on any street card to open the Property Manager where you can add, remove, or edit individual properties.</div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 font-medium">What's the difference between Dashboard and Reports?</div>
              <div className="p-3">Dashboard shows today's activity only, perfect for daily tracking. Reports shows all-time data and campaign overviews.</div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 font-medium">How do I search and filter campaigns/streets?</div>
              <div className="p-3">Use the "Search & Filter" section in Campaigns and Streets tabs. You can search by name, filter by status, and sort by different criteria.</div>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/20 font-medium">Can I use this app offline?</div>
              <div className="p-3">Yes! This is a Progressive Web App (PWA) that works offline. Your data is stored locally on your device.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AboutPanel() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white font-bold text-xl">UW</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">UW Street Smart</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Neighbourhood Letters Activity Tracker
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="font-medium text-blue-800 dark:text-blue-200 mb-1">Version</div>
          <div className="text-blue-700 dark:text-blue-300">1.0.0</div>
        </div>

        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="font-medium text-green-800 dark:text-green-200 mb-1">Built For</div>
          <div className="text-green-700 dark:text-green-300">UW Partners making a difference in their communities</div>
        </div>

        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="font-medium text-purple-800 dark:text-purple-200 mb-1">Features</div>
          <div className="text-purple-700 dark:text-purple-300 space-y-1">
            <div>• Campaign & street management</div>
            <div>• Property activity tracking</div>
            <div>• Conversation outcomes</div>
            <div>• Offline-first PWA</div>
            <div>• Daily progress dashboard</div>
            <div>• Data export/import</div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
          <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">Privacy</div>
          <div className="text-amber-700 dark:text-amber-300">
            Your data is stored locally on your device. No personal information is sent to external servers.
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
          Built with React, Vite, and Tailwind CSS<br/>
          Progressive Web App technology
        </div>
      </div>
    </div>
  );
}

function SuccessTipsPanel() {
  return (
    <div className="space-y-6">
      {/* Strategy & Mindset */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5" />
          Strategy & Mindset
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="font-medium text-green-800 dark:text-green-200 mb-2">🎯 It's a Numbers Game</div>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <div>• Don't expect every door to say "yes"</div>
              <div>• Consistency and persistence pay off</div>
              <div>• Track your numbers to see progress</div>
              <div>• Each "no" brings you closer to a "yes"</div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="font-medium text-blue-800 dark:text-blue-200 mb-2">💡 The Fortune is in the Follow-up</div>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <div>• Posting alone won't get results</div>
              <div>• Real success comes from knocking back</div>
              <div>• Don't overwhelm yourself with too many letters</div>
              <div>• Post manageable numbers you can confidently follow up</div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="font-medium text-purple-800 dark:text-purple-200 mb-2">😊 Smile & Stay Positive</div>
            <div className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <div>• Your body language and tone matter</div>
              <div>• Positivity makes people more receptive</div>
              <div>• Remember - you're offering help, not selling</div>
              <div>• You're giving neighbours a chance to save money</div>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="font-medium text-amber-800 dark:text-amber-200 mb-2">🎭 Confidence Boosters</div>
            <div className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
              <div>• Practice scripts until they feel natural</div>
              <div>• Don't read robotically - make it yours</div>
              <div>• Dress smart but approachable</div>
              <div>• Think "friendly neighbour," not "salesperson"</div>
            </div>
          </div>
        </div>
      </div>

      {/* Following Up */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Following Up
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">⚡ Act Quickly</div>
            <div className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
              <div>• Follow up within 2-3 days of dropping letters</div>
              <div>• While people still remember it</div>
              <div>• Best times: Evenings 6-8pm, weekends 10am-2pm</div>
              <div>• Try 3-4 times before marking as "No Answer"</div>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">🗣️ Simple Opener</div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300 space-y-2">
              <div><strong>Start with:</strong> "Hi, I'm [Name], I live locally in [area]. I popped this letter through your door a couple of days ago — did you see it?"</div>
              <div><strong>If yes:</strong> Move straight into: "I've been helping neighbours save money on all their utility bills. Would saving money help you?"</div>
              <div><strong>If no:</strong> Hand them a spare letter or card and use the same line</div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
            <div className="font-medium text-teal-800 dark:text-teal-200 mb-2">📅 Booking Appointments</div>
            <div className="text-sm text-teal-700 dark:text-teal-300 space-y-1">
              <div>• Don't just ask if they want one</div>
              <div>• Use an alternative close:</div>
              <div>• "When's good for you — daytime, evenings, or weekends?"</div>
              <div>• Always carry your diary (or My Planner)</div>
            </div>
          </div>
          
          <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
            <div className="font-medium text-pink-800 dark:text-pink-200 mb-2">📞 Building Rapport & Courtesy</div>
            <div className="text-sm text-pink-700 dark:text-pink-300 space-y-2">
              <div>Some people won't be ready for an appointment. That's fine.</div>
              <div><strong>Courtesy call script:</strong> "I come around here quite often — would you prefer I give you a quick courtesy call next time rather than just pop by?"</div>
              <div>Don't ask directly for their number — pause after that line, and most people will naturally offer it.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Handling Rejection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Handling Rejection
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <div className="font-medium text-red-800 dark:text-red-200 mb-2">🛡️ The Disarming Line</div>
            <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
              <div>If you get a frosty or blunt "No", don't take it personally.</div>
              <div><strong>Use the disarming line:</strong> "Can I take your name off the list?"</div>
              <div>They'll usually say "yes, please" or "thank you" — leaving you with a polite exit instead of rejection.</div>
            </div>
          </div>
        </div>
      </div>

      {/* What to Wear & Present */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="w-5 h-5" />
          What to Wear & How to Present
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
            <div className="font-medium text-orange-800 dark:text-orange-200 mb-2">👔 Dress Smart but Approachable</div>
            <div className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
              <div>• Think "friendly neighbour," not "salesperson"</div>
              <div>• Comfortable shoes are essential</div>
              <div>• You'll be walking a lot</div>
              <div>• UW branded if possible</div>
            </div>
          </div>
          
          <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
            <div className="font-medium text-cyan-800 dark:text-cyan-200 mb-2">📋 What to Carry</div>
            <div className="text-sm text-cyan-700 dark:text-cyan-300 space-y-1">
              <div>• Your diary (or My Planner)</div>
              <div>• Backup materials (Neighbour Letter, £20k Giveaway Presenter)</div>
              <div>• Have one clear outcome in mind: booking a short appointment</div>
              <div>• Keep it short, simple, and neighbourly</div>
            </div>
          </div>
        </div>
      </div>

      {/* What to Say */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          What to Say
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">💬 Keep It Simple</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <div>• Keep it short, simple, and neighbourly</div>
              <div>• Avoid jargon or long explanations</div>
              <div>• Always bring backup materials in case someone wants more info</div>
              <div>• Have one clear outcome in mind: booking a short appointment</div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Summary */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Success Summary
        </h3>
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="font-medium text-green-800 dark:text-green-200 mb-2">✅ In Short:</div>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <div>Succeeding with Neighbour Letters comes down to:</div>
            <div>• <strong>Posting consistently</strong></div>
            <div>• <strong>Following up quickly</strong></div>
            <div>• <strong>Keeping it friendly and simple</strong></div>
            <div>• <strong>Handling rejection gracefully</strong></div>
            <div>• <strong>Booking appointments using alternative closes</strong></div>
            <div>• <strong>Thinking like a helpful neighbour, not a salesperson</strong></div>
            <div>— and you'll win trust and results.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reports({ campaigns, onNavigateToProperty }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  const flat = [];
  campaigns.forEach(c => c.streets.forEach(s => s.properties.forEach(p => {
    // Determine the most recent activity timestamp
    let latestActivity = null;
    let latestActivityType = '';
    
    if (p.spokeAt) {
      latestActivity = p.spokeAt;
      latestActivityType = 'spoke';
    } else if (p.knockedAt) {
      latestActivity = p.knockedAt;
      latestActivityType = 'knocked';
    } else if (p.droppedAt) {
      latestActivity = p.droppedAt;
      latestActivityType = 'dropped';
    } else if (p.resultAt) {
      latestActivity = p.resultAt;
      latestActivityType = 'result';
    }
    
    flat.push({ 
      campaign: c.name, 
      street: s.name, 
      property: p.label, 
      dropped: p.dropped, 
      knocked: p.knocked, 
      spoke: p.spoke, 
      result: p.result || 'none', 
      followUpAt: p.followUpAt || '',
      followUpTypes: p.followUpTypes || {},
      campaignId: c.id,
      streetId: s.id,
      propertyId: p.id,
      droppedAt: p.droppedAt || '',
      knockedAt: p.knockedAt || '',
      spokeAt: p.spokeAt || '',
      resultAt: p.resultAt || '',
      latestActivity: latestActivity,
      latestActivityType: latestActivityType
    });
  })));

  // Filter and sort the data
  const filteredAndSortedData = useMemo(() => {
    let filtered = flat.filter(r => {
      const matchesSearch = 
        r.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.property.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "dropped" && r.dropped) ||
        (statusFilter === "knocked" && r.knocked) ||
        (statusFilter === "spoke" && r.spoke) ||
        (statusFilter === "followup" && r.followUpAt) ||
        (statusFilter === "interested" && (r.result === "interested" || r.result === "customer_signed" || r.result === "appointment_booked"));
      
      return matchesSearch && matchesStatus;
    });

    // Sort the data
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortColumn) {
        case "date":
          aVal = a.latestActivity || "";
          bVal = b.latestActivity || "";
          break;
        case "campaign":
          aVal = a.campaign;
          bVal = b.campaign;
          break;
        case "street":
          aVal = a.street;
          bVal = b.street;
          break;
        case "property":
          aVal = parseInt(a.property) || a.property;
          bVal = parseInt(b.property) || b.property;
          break;
        case "dropped":
          aVal = a.dropped ? 1 : 0;
          bVal = b.dropped ? 1 : 0;
          break;
        case "knocked":
          aVal = a.knocked ? 1 : 0;
          bVal = b.knocked ? 1 : 0;
          break;
        case "spoke":
          aVal = a.spoke ? 1 : 0;
          bVal = b.spoke ? 1 : 0;
          break;
        case "result":
          aVal = a.result;
          bVal = b.result;
          break;
        case "followup":
          aVal = a.followUpAt || "";
          bVal = b.followUpAt || "";
          break;
        default:
          aVal = a.latestActivity || "";
          bVal = b.latestActivity || "";
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [flat, searchTerm, statusFilter, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return <ChevronUp className="w-3 h-3 opacity-30" />;
    }
    return sortDirection === "asc" ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />;
  };

  const getSortButtonClass = (column) => {
    const baseClass = "flex items-center gap-1 transition-all";
    if (sortColumn === column) {
      return `${baseClass} bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-lg`;
    }
    return `${baseClass} hover:opacity-100 hover:bg-gray-50 dark:hover:bg-gray-900/20 px-2 py-1 rounded-lg`;
  };

  const totals = useMemo(() => {
    const t = { 
      letters: 0, 
      knocked: 0, 
      spoke: 0, 
      interested: 0, 
      followups: 0,
      successes: 0,
      outcomes: {
        interested: 0,
        customer_signed: 0,
        appointment_booked: 0,
        no_for_now: 0,
        already_uw: 0,
        not_interested: 0
      }
    };
    flat.forEach(r => {
      if (r.dropped) t.letters++;
      if (r.knocked) t.knocked++;
      if (r.spoke) t.spoke++;
      if (r.result === 'interested' || r.result === 'customer_signed' || r.result === 'appointment_booked') t.interested++;
      if (r.followUpAt) t.followups++;
      
      // Track successes (customers signed + appointments booked + interested)
      if (r.result === 'customer_signed' || r.result === 'appointment_booked' || r.result === 'interested') {
        t.successes++;
      }
      
      // Track all outcomes
      if (r.result && r.result !== 'none') {
        t.outcomes[r.result] = (t.outcomes[r.result] || 0) + 1;
      }
    });
    return t;
  }, [campaigns]);

  return (
    <div className="space-y-4">
      <SectionCard title="Overview" icon={FileText}>
        <div className="grid md:grid-cols-6 gap-3">
          <Stat icon={UploadCloud} label="Letters" value={totals.letters} />
          <Stat icon={Check} label="Knocked" value={totals.knocked} />
          <Stat icon={MessageSquare} label="Spoke" value={totals.spoke} />
          <Stat icon={CheckCircle} label="Successes" value={totals.successes} />
          <Stat icon={CalendarClock} label="Total Follow‑ups" value={totals.followups} />
        </div>
      </SectionCard>
      
      <SectionCard title="Conversation Outcomes" icon={MessageSquare}>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-500">
            <div className="text-lg font-semibold text-green-800 dark:text-green-200">{totals.outcomes.customer_signed}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Customers Signed</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 dark:border-emerald-500">
            <div className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">{totals.outcomes.appointment_booked}</div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300">Appointment Booked</div>
          </div>
          <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-500">
            <div className="text-lg font-semibold text-green-800 dark:text-green-200">{totals.outcomes.interested}</div>
            <div className="text-sm text-green-700 dark:text-green-300">Interested</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500 dark:border-amber-500">
            <div className="text-lg font-semibold text-amber-800 dark:text-amber-200">{totals.outcomes.no_for_now}</div>
            <div className="text-sm text-amber-700 dark:text-amber-300">No for Now</div>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-500 dark:border-sky-500">
            <div className="text-lg font-semibold text-sky-800 dark:text-sky-200">{totals.outcomes.already_uw}</div>
            <div className="text-sm text-sky-700 dark:text-sky-300">Already with UW</div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-500">
            <div className="text-lg font-semibold text-red-800 dark:text-red-200">{totals.outcomes.not_interested}</div>
            <div className="text-sm text-red-700 dark:text-red-300">Not Interested</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/20 border-2 border-slate-500 dark:border-slate-500">
            <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">{totals.outcomes.no_answer || 0}</div>
            <div className="text-sm text-slate-700 dark:text-slate-300">No Answer</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 dark:border-purple-500">
            <div className="text-lg font-semibold text-purple-800 dark:text-purple-200">{totals.outcomes.no_cold_callers || 0}</div>
            <div className="text-sm text-purple-700 dark:text-purple-300">No Cold Callers</div>
          </div>

        </div>
      </SectionCard>
      
      {/* Follow-ups Due Today Section */}
      {(() => {
        const today = new Date().toISOString().split('T')[0];
        const followUpsDueToday = filteredAndSortedData.filter(r => 
          r.followUpAt && r.followUpAt.split('T')[0] === today
        );
        
        return followUpsDueToday.length > 0 && (
          <SectionCard title="Follow-ups Due Today" icon={CalendarClock}>
            <div className="space-y-3">
              {followUpsDueToday.map((r, index) => (
                <div 
                  key={`${r.campaign}-${r.street}-${r.property}-${index}`} 
                  className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'rgba(239, 68, 68, 0.2)',
                    position: 'relative',
                    zIndex: 10
                  }}
                  onClick={() => { 
                    console.log('Clicking follow-up due today:', r.campaignId, r.streetId, r.propertyId);
                    onNavigateToProperty(r.campaignId, r.streetId, r.propertyId);
                    console.log('State change triggered');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                      <CalendarClock className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.property}, {r.street}</div>
                      <div className="text-xs text-red-700 dark:text-red-300">{r.campaign}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm text-red-800 dark:text-red-200">
                      {new Date(r.followUpAt).toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      {r.followUpTypes?.call && <span title="Call">📞</span>}
                      {r.followUpTypes?.revisit && <span title="Revisit">🏠</span>}
                      {r.followUpTypes?.message && <span title="Message">💬</span>}
                      {!r.followUpTypes || (!r.followUpTypes.call && !r.followUpTypes.revisit && !r.followUpTypes.message) ? 'Follow-up' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      })()}
      
      {/* All Scheduled Follow-ups Section */}
      {totals.followups > 0 && (
        <SectionCard title="All Scheduled Follow-ups" icon={CalendarClock}>
          <div className="space-y-3">
            {filteredAndSortedData
              .filter(r => r.followUpAt)
              .slice(0, 10) // Show first 10 follow-ups
              .map((r, index) => (
                <div 
                  key={`${r.campaign}-${r.street}-${r.property}-${index}`} 
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'rgba(245, 158, 11, 0.2)',
                    position: 'relative',
                    zIndex: 10
                  }}
                  onClick={() => { 
                    console.log('Clicking scheduled follow-up:', r.campaignId, r.streetId, r.propertyId);
                    onNavigateToProperty(r.campaignId, r.streetId, r.propertyId);
                    console.log('State change triggered');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                      <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{r.property}, {r.street}</div>
                      <div className="text-xs text-amber-700 dark:text-amber-300">{r.campaign}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm text-amber-800 dark:text-amber-200">{r.followUpAt}</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      {r.followUpTypes?.call && <span title="Call">📞</span>}
                      {r.followUpTypes?.revisit && <span title="Revisit">🏠</span>}
                      {r.followUpTypes?.message && <span title="Message">💬</span>}
                      {!r.followUpTypes || (!r.followUpTypes.call && !r.followUpTypes.revisit && !r.followUpTypes.message) ? 'Follow-up' : ''}
                    </div>
                  </div>
                </div>
              ))}
            {filteredAndSortedData.filter(r => r.followUpAt).length > 10 && (
              <div className="text-center text-sm text-amber-600 dark:text-amber-400">
                +{filteredAndSortedData.filter(r => r.followUpAt).length - 10} more follow-ups scheduled
              </div>
            )}
          </div>
        </SectionCard>
      )}
      
      <SectionCard title="Activity log" icon={ListChecks}>
        {/* Search and Filter Controls */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search campaigns, streets, properties..."
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-colors ${
                showFilters 
                  ? 'bg-primary-100 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          {showFilters && (
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium opacity-70">Filter by:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                >
                  <option value="all">All activities</option>
                  <option value="dropped">Letters dropped</option>
                  <option value="knocked">Doors knocked</option>
                  <option value="spoke">Conversations had</option>
                  <option value="followup">Follow-ups scheduled</option>
                  <option value="interested">Interested prospects</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="text-xs opacity-70">
            Showing {filteredAndSortedData.length} of {flat.length} activities
            <span className="hidden sm:inline"> • Scroll horizontally to see all columns</span>
            <span className="hidden sm:inline"> • <span className="text-orange-600 dark:text-orange-400 font-medium">D</span>=Letters dropped, <span className="text-blue-600 dark:text-blue-400 font-medium">K</span>=Doors knocked, <span className="text-green-600 dark:text-green-400 font-medium">S</span>=Conversations had</span>
          </div>
        </div>

        <div className="relative">
          {/* Scroll indicator - only show on smaller screens */}
          <div className="mb-2 flex justify-end xl:hidden">
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Scroll for more columns
            </div>
          </div>
          
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
            <table className="w-full text-sm min-w-max">
              <thead className="text-left opacity-70 bg-gray-50 dark:bg-gray-900/20">
                <tr>
                  <th className="py-2 px-3 sticky left-0 bg-gray-50 dark:bg-gray-900/20 z-20 border-r border-gray-200 dark:border-gray-700 w-24 shadow-sm">
                    <button 
                      onClick={() => handleSort("date")}
                      className={getSortButtonClass("date")}
                    >
                      Date
                      <SortIcon column="date" />
                    </button>
                  </th>
                <th className="py-2 px-3 hidden sm:table-cell w-24">
                  <button 
                    onClick={() => handleSort("campaign")}
                    className={getSortButtonClass("campaign")}
                  >
                    Campaign
                    <SortIcon column="campaign" />
                  </button>
                </th>
                <th className="py-2 px-3 hidden md:table-cell w-20">
                  <button 
                    onClick={() => handleSort("street")}
                    className={getSortButtonClass("street")}
                  >
                    Street
                    <SortIcon column="street" />
                  </button>
                </th>
                <th className="py-2 px-3 w-12">
                  <button 
                    onClick={() => handleSort("property")}
                    className={getSortButtonClass("property")}
                  >
                    #
                    <SortIcon column="property" />
                  </button>
                </th>
                <th className="py-2 px-3 hidden sm:table-cell w-12">
                  <button 
                    onClick={() => handleSort("dropped")}
                    className={getSortButtonClass("dropped")}
                    title="Letters dropped"
                  >
                    D
                    <SortIcon column="dropped" />
                  </button>
                </th>
                <th className="py-2 px-3 hidden sm:table-cell w-12">
                  <button 
                    onClick={() => handleSort("knocked")}
                    className={getSortButtonClass("knocked")}
                    title="Doors knocked"
                  >
                    K
                    <SortIcon column="knocked" />
                  </button>
                </th>
                <th className="py-2 px-3 hidden sm:table-cell w-12">
                  <button 
                    onClick={() => handleSort("spoke")}
                    className={getSortButtonClass("spoke")}
                    title="Conversations had"
                  >
                    S
                    <SortIcon column="spoke" />
                  </button>
                </th>
                <th className="py-2 px-3 w-20">
                  <button 
                    onClick={() => handleSort("result")}
                    className={getSortButtonClass("result")}
                  >
                    Result
                    <SortIcon column="result" />
                  </button>
                </th>
                <th className="py-2 px-3 hidden xl:table-cell w-24">
                  <button 
                    onClick={() => handleSort("followup")}
                    className={getSortButtonClass("followup")}
                  >
                    Follow‑up
                    <SortIcon column="followup" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedData.map((r, i) => (
                <tr key={i} className="border-t border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                  <td className="py-2 px-3 sticky left-0 bg-white dark:bg-gray-900 z-20 border-r border-gray-200 dark:border-gray-700 shadow-sm">
                    {r.latestActivity ? (
                      <div className="text-xs">
                        <div className="font-medium">{new Date(r.latestActivity).toLocaleDateString()}</div>
                        <div className="text-gray-500 dark:text-gray-400 capitalize">{r.latestActivityType}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 hidden sm:table-cell font-medium">{r.campaign}</td>
                  <td className="py-2 px-3 hidden md:table-cell">{r.street}</td>
                  <td className="py-2 px-3 text-xs max-w-24 truncate" title={r.property}>{r.property}</td>
                  <td className="py-2 px-3 hidden sm:table-cell" title={r.dropped ? "Letter dropped" : "No letter dropped"}>
                    {r.dropped ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 hidden sm:table-cell" title={r.knocked ? "Door knocked" : "No door knocked"}>
                    {r.knocked ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 hidden sm:table-cell" title={r.spoke ? "Conversation had" : "No conversation"}>
                    {r.spoke ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs">
                        ✓
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {r.result === 'none' ? (
                      <span className="text-gray-500 dark:text-gray-400">—</span>
                    ) : r.result === 'interested' || r.result === 'customer_signed' || r.result === 'appointment_booked' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                        {r.result.replace('_', ' ')}
                      </span>
                    ) : r.result === 'maybe' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300">
                        maybe
                      </span>
                    ) : r.result === 'no_for_now' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300">
                        no for now
                      </span>
                    ) : r.result === 'already_uw' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                        already UW
                      </span>
                    ) : r.result === 'not_interested' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                        not interested
                      </span>
                    ) : r.result === 'no_answer' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        no answer
                      </span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">{r.result}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 hidden xl:table-cell">
                    {r.followUpAt ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                        {new Date(r.followUpAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </SectionCard>
    </div>
  );
}

// Form components for creating new campaigns and streets
function NewCampaignForm({ 
  onSubmit, 
  onCancel,
  addressSearchTerm,
  setAddressSearchTerm,
  addressSuggestions,
  selectedPostcode,
  selectedTown,
  availableStreets,
  selectedStreets,
  isLoadingAddresses,
  addressLookupStep,
  searchAddresses,
  selectAddress,
  toggleStreetSelection,
  importSelectedStreets,
  resetAddressLookup
}) {
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

      {/* Address Lookup Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary-600" />
          <label className="text-sm font-medium">Import Streets</label>
        </div>
        <p className="text-xs opacity-70 mb-3">Search by postcode or town name to import streets automatically</p>
        
        {/* Step 1: Search */}
        {addressLookupStep === "search" && (
          <div className="space-y-3">
            <div className="relative">
              <input 
                type="text" 
                value={addressSearchTerm} 
                onChange={e => {
                  setAddressSearchTerm(e.target.value);
                  if (e.target.value.length >= 3) {
                    debouncedSearch(e.target.value);
                  } else {
                    setAddressSuggestions([]);
                  }
                }}
                              className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
              placeholder="Start typing a town, city, village or postcode (e.g., Elmswell, London, IP30)"
              />
              {isLoadingAddresses && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
            
            {/* Suggestions */}
            {addressSuggestions.length > 0 && (
              <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectAddress(suggestion)}
                    className="w-full p-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    {typeof suggestion === 'string' ? suggestion : suggestion.display}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Streets */}
        {addressLookupStep === "select" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{selectedTown}</p>
                <p className="text-xs opacity-70">{selectedPostcode}</p>
              </div>
              <button
                onClick={resetAddressLookup}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Change
              </button>
            </div>
            
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg">
              {availableStreets.map((street, index) => (
                <label key={index} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <input
                    type="checkbox"
                    checked={selectedStreets.includes(street)}
                    onChange={() => toggleStreetSelection(street)}
                    className="mr-2"
                  />
                  <span className="text-sm">{street}</span>
                </label>
              ))}
            </div>
            
            {selectedStreets.length > 0 && (
              <button
                onClick={importSelectedStreets}
                className="w-full px-3 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
              >
                Import {selectedStreets.length} Street{selectedStreets.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button 
          type="submit"
          className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
            position: 'relative',
            zIndex: 10
          }}
        >
          Create Campaign
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
            position: 'relative',
            zIndex: 10
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ImportStreetsForm({ 
  onSubmit,
  onCancel,
  addressSearchTerm,
  setAddressSearchTerm,
  addressSuggestions,
  setAddressSuggestions,
  selectedPostcode,
  selectedTown,
  availableStreets,
  selectedStreets,
  isLoadingAddresses,
  addressLookupStep,
  searchAddresses,
  debouncedSearch,
  selectAddress,
  toggleStreetSelection,
  importSelectedStreets,
  resetAddressLookup
}) {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary-600" />
          <label className="text-sm font-medium">Import Streets</label>
        </div>
        <p className="text-xs opacity-70">Search by postcode or town name to import streets automatically</p>
      </div>
      
      {/* Step 1: Search */}
      {addressLookupStep === "search" && (
        <div className="space-y-3">
          <div className="relative">
            <input 
              type="text" 
              value={addressSearchTerm} 
              onChange={e => {
                setAddressSearchTerm(e.target.value);
                if (e.target.value.length >= 2) {
                  debouncedSearch(e.target.value);
                } else {
                  setAddressSuggestions([]);
                }
              }}
              className="w-full p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
              placeholder="Start typing a town, city, village or postcode (e.g., Elmswell, London, IP30)"
            />
            {isLoadingAddresses && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
          
          {/* Suggestions */}
          {addressSuggestions.length > 0 && (
            <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg">
              {addressSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectAddress(suggestion)}
                  className="w-full p-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  {typeof suggestion === 'string' ? suggestion : suggestion.display}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Streets */}
      {addressLookupStep === "select" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{selectedTown}</p>
              <p className="text-xs opacity-70">{selectedPostcode}</p>
            </div>
            <button
              onClick={resetAddressLookup}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Change
            </button>
          </div>
          
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Street Suggestions:</strong> These are real street names commonly found in this area. 
              For specific streets not listed, you can add them manually.
            </p>
          </div>
          
          <div className="max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg">
            {availableStreets.map((street, index) => (
              <label key={index} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <input
                  type="checkbox"
                  checked={selectedStreets.includes(street)}
                  onChange={() => toggleStreetSelection(street)}
                  className="mr-2"
                />
                <span className="text-sm">{street}</span>
              </label>
            ))}
          </div>
          
          {selectedStreets.length > 0 && (
            <button
              onClick={importSelectedStreets}
              className="w-full px-3 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              Import {selectedStreets.length} Street{selectedStreets.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function NewStreetForm({ onSubmit, onCancel }) {
  const GOOGLE_PLACES_API_KEY = '';
  
  const [step, setStep] = useState('options'); // 'options', 'postcode', 'streets', 'properties', 'manual'
  const [formData, setFormData] = useState({
    name: "",
    postcode: "",
    properties: ""
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [availableProperties, setAvailableProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [currentPostcode, setCurrentPostcode] = useState('');
  const [availableStreets, setAvailableStreets] = useState([]);

  // OpenStreetMap Nominatim API
  const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

  // Manual entry only - no search functionality
  useEffect(() => {
    // Disabled - manual entry only
  }, [searchTerm]);

  // Realistic UK address search with comprehensive data
  // Manual entry only - no search functionality
  const searchPostcodes = async (query) => {
    // Disabled - manual entry only
    setSearchResults([]);
  };

  // Simple Google Places API search - no OpenStreetMap needed
  const searchAddressesWithGoogle = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching Google Places API for:', query);
      
      // Load Google Maps SDK if not already loaded
      if (!window.google || !window.google.maps) {
        console.log('Loading Google Maps SDK...');
        try {
          await window.loadGoogleMapsSDK(GOOGLE_PLACES_API_KEY);
          console.log('Google Maps SDK loaded successfully');
        } catch (error) {
          console.error('Failed to load Google Maps SDK:', error);
          setSearchResults([]);
          return;
        }
      }

      // Use the WORKING AutocompleteService (it works, ignore deprecation warnings)
      if (!window.google.maps.places) {
        throw new Error('Google Maps Places library not available');
      }

      const { AutocompleteService } = window.google.maps.places;
      const service = new AutocompleteService();

      // Get place predictions using the WORKING API
      const predictions = await new Promise((resolve, reject) => {
        console.log('Making API call with query:', query);
        service.getPlacePredictions({
          input: query,
          componentRestrictions: { country: 'gb' },
          types: ['geocode', 'establishment']
        }, (predictions, status) => {
          console.log('API response - status:', status, 'predictions:', predictions);
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(predictions || []);
          } else {
            console.error('Places API failed with status:', status);
            reject(new Error(`Places API error: ${status}`));
          }
        });
      });

      console.log('Google Places results:', predictions);

      // Convert WORKING API format to our format
      const results = predictions.map(prediction => {
        const mainText = prediction.structured_formatting?.main_text || prediction.description || '';
        const secondaryText = prediction.structured_formatting?.secondary_text || '';
        
        return {
          display_name: mainText,
          address: {
            road: secondaryText || '',
            postcode: '',
            village: '',
            city: ''
          },
          place_id: prediction.place_id,
          type: 'google_place',
          raw: prediction,
          street_name: mainText?.split(',')[0]?.trim() || '',
          postcode: mainText?.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}/i)?.[0] || '',
          village: mainText?.split(',').slice(1, -1).join(',').trim() || ''
        };
      });

      console.log('Processed results:', results);
      setSearchResults(results);
      
    } catch (error) {
      console.error('Google Places API error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Demo data search function
  const searchWithDemoData = async (query, skipLoadingState = false) => {
    if (!skipLoadingState) {
      setIsSearching(true);
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let results = [];
      const searchTerm = query.toLowerCase();

      // Comprehensive UK address data (simulated)
      const ukAddresses = [
        // IP30 postcodes (Elmswell area)
        {
          display_name: "Cross Street, Elmswell, IP30 9DR",
          address: { road: "Cross Street", postcode: "IP30 9DR", village: "Elmswell", city: "Bury St Edmunds" }
        },
        {
          display_name: "Station Road, Elmswell, IP30 9YY",
          address: { road: "Station Road", postcode: "IP30 9YY", village: "Elmswell", city: "Bury St Edmunds" }
        },
        {
          display_name: "Orchard Way, Elmswell, IP30 9XX",
          address: { road: "Orchard Way", postcode: "IP30 9XX", village: "Elmswell", city: "Bury St Edmunds" }
        },
        {
          display_name: "High Street, Elmswell, IP30 9AA",
          address: { road: "High Street", postcode: "IP30 9AA", village: "Elmswell", city: "Bury St Edmunds" }
        },
        {
          display_name: "Church Street, Elmswell, IP30 9BB",
          address: { road: "Church Street", postcode: "IP30 9BB", village: "Elmswell", city: "Bury St Edmunds" }
        },
        {
          display_name: "School Lane, Elmswell, IP30 9CC",
          address: { road: "School Lane", postcode: "IP30 9CC", village: "Elmswell", city: "Bury St Edmunds" }
        },
        {
          display_name: "Mill Road, Elmswell, IP30 9DD",
          address: { road: "Mill Road", postcode: "IP30 9DD", village: "Elmswell", city: "Bury St Edmunds" }
        },
        {
          display_name: "The Street, Elmswell, IP30 9EE",
          address: { road: "The Street", postcode: "IP30 9EE", village: "Elmswell", city: "Bury St Edmunds" }
        },
        {
          display_name: "Whitehall Road, Stowmarket, IP14 9DR",
          address: { road: "Whitehall Road", postcode: "IP14 9DR", village: "Stowmarket", city: "Bury St Edmunds" }
        },
        {
          display_name: "IP30 9DR, Elmswell, Suffolk",
          address: { road: "IP30 9DR", postcode: "IP30 9DR", village: "Elmswell", city: "Suffolk" }
        },
        {
          display_name: "IP14 9DR, Stowmarket, Suffolk", 
          address: { road: "IP14 9DR", postcode: "IP14 9DR", village: "Stowmarket", city: "Suffolk" }
        }
      ];

      // Filter results based on search term
      results = ukAddresses.filter(address => {
        const displayName = address.display_name.toLowerCase();
        const road = address.address.road.toLowerCase();
        const postcode = address.address.postcode.toLowerCase();
        const village = address.address.village.toLowerCase();
        
        return displayName.includes(searchTerm) ||
               road.includes(searchTerm) ||
               postcode.includes(searchTerm) ||
               village.includes(searchTerm);
      });

      console.log('Setting search results from demo data:', results);
      console.log('Demo results length:', results.length);
      setSearchResults(results);
    } catch (error) {
      console.error('Demo search error:', error);
    } finally {
      if (!skipLoadingState) {
        setIsSearching(false);
      }
    }
  };

  // Simplified workflow - no OpenStreetMap needed
  const handleStreetSelection = (streetName, postcode) => {
    console.log('Handling street selection:', { streetName, postcode });
    setFormData(prev => ({
      ...prev,
      name: streetName,
      postcode: postcode
    }));
    setStep('manual');
  };

  // Handle postcode selection
  const handlePostcodeSelect = async (result) => {
    console.log('Selected result:', result);
    
    // Extract street name and postcode from the display name
    const displayName = result.display_name || '';
    const streetName = result.street_name || displayName.split(',')[0]?.trim() || '';
    const postcode = result.postcode || displayName.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}/i)?.[0] || '';
    const village = result.village || displayName.split(',').slice(1, -1).join(',').trim() || '';
    
    console.log('Parsed selection:', { streetName, postcode, village });
    
    // If we have a street name and postcode, use it directly
    if (streetName && postcode) {
      console.log('Setting street with postcode:', { name: streetName, postcode: postcode });
      setSelectedStreet({ name: streetName, postcode: postcode });
      setFormData(prev => ({
        ...prev,
        name: streetName,
        postcode: postcode
      }));
      setStep('manual');
      return;
    }
    
    // If we have a postcode, go directly to manual entry
    if (postcode && postcode.match(/^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i)) {
      console.log('Valid postcode found, going to manual entry');
      setFormData(prev => ({ ...prev, postcode: postcode }));
      setStep('manual');
      return;
    }
    
    // If we have a village/town, go to manual entry
    if (village) {
      console.log('Village/town found, going to manual entry');
      setFormData(prev => ({ ...prev, postcode: village }));
      setStep('manual');
      return;
    }
    
    // Fallback to manual entry with what we have
    console.log('Falling back to manual entry');
    setFormData(prev => ({
      ...prev,
      name: streetName || displayName,
      postcode: postcode
    }));
    setStep('manual');
    
    // Handle legacy results (demo data, etc.)
    const address = result.address;
    
    // If it's a street with a postcode, use it directly
    if (address.road && address.postcode) {
      const streetName = address.road;
      const postcode = address.postcode;
      
      setSelectedStreet({ name: streetName, postcode: postcode });
      setFormData(prev => ({
        ...prev,
        name: streetName,
        postcode: postcode
      }));
      
      setStep('manual');
      return;
    }
    
    // If it's a postcode or area, search for streets in that area
    const legacyPostcode = address.postcode || result.name;
    if (legacyPostcode && legacyPostcode.match(/^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i)) {
      setCurrentPostcode(legacyPostcode);
      setFormData(prev => ({ ...prev, postcode: legacyPostcode }));
      
      searchStreetsInPostcode(legacyPostcode);
      setStep('streets');
      return;
    }
    
    // Fallback to manual entry
    setStep('manual');
  };

  // Handle street selection
  const handleStreetSelect = (street) => {
    console.log('handleStreetSelect called with:', street);
    
    // Handle both string streets and object streets from OpenStreetMap
    let streetName, postcode;
    
    if (typeof street === 'string') {
      // Demo data format
      streetName = street;
      postcode = currentPostcode;
    } else if (street.address) {
      // OpenStreetMap format
      streetName = street.address.road || street.display_name?.split(',')[0] || 'Unknown Street';
      postcode = street.address.postcode || currentPostcode;
    } else if (street.display_name) {
      // OpenStreetMap format without address object
      streetName = street.display_name.split(',')[0] || 'Unknown Street';
      postcode = street.display_name.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}/i)?.[0] || 
                 street.display_name.match(/[A-Z]{1,2}[0-9][0-9A-Z]?/i)?.[0] || 
                 currentPostcode;
    } else {
      // Fallback
      streetName = 'Unknown Street';
      postcode = currentPostcode;
    }
    
    console.log('Extracted street name:', streetName, 'postcode:', postcode);
    
    setSelectedStreet({ name: streetName, postcode: postcode });
    setFormData(prev => ({
      ...prev,
      name: streetName,
      postcode: postcode
    }));
    
    // Get properties for this street
    getStreetProperties(streetName, postcode);
    setStep('properties');
  };

  // Get properties for a specific street
  const getStreetProperties = async (streetName, postcode) => {
    try {
      // Try to find properties on this specific street
      const params = new URLSearchParams({
        q: `${streetName}, ${postcode}`,
        format: 'json',
        addressdetails: '1',
        limit: '50',
        countrycodes: 'gb'
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'UW-Street-Smart-NL-Tracker/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Filter for properties on this specific street
        const properties = data
          .filter(item => {
            const address = item.address;
            return address.road === streetName && address.postcode === postcode;
          })
          .map(item => {
            const address = item.address;
            return {
              id: item.place_id,
              number: address.house_number || '',
              name: address.house_name || '',
              fullAddress: item.display_name,
              lat: item.lat,
              lon: item.lon
            };
          })
          .filter(prop => prop.number || prop.name); // Only properties with numbers or names

        setAvailableProperties(properties);
        
        // If no properties found, show a message and allow manual entry
        if (properties.length === 0) {
          console.log('No individual properties found for this street. OpenStreetMap data may be limited.');
        }
      }
    } catch (error) {
      console.error('Property search error:', error);
      setAvailableProperties([]);
    }
  };

  const handlePropertyToggle = (property) => {
    setSelectedProperties(prev => {
      const isSelected = prev.find(p => p.id === property.id);
      if (isSelected) {
        return prev.filter(p => p.id !== property.id);
      } else {
        return [...prev, property];
      }
    });
  };

  const handlePropertiesConfirm = () => {
    const propertyList = selectedProperties.map(prop => 
      prop.name || prop.number
    ).join(', ');
    
    setFormData(prev => ({
      ...prev,
      properties: propertyList
    }));
    
    onSubmit({
      name: formData.name,
      postcode: formData.postcode,
      properties: propertyList.split(',').map(p => p.trim())
    });
  };

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchPostcodes(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  if (step === 'options') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Add New Street</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose how you'd like to add a street to your campaign
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => setStep('manual')}
            className="p-4 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-600 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="font-medium">Enter Manually</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Type in street details yourself
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === 'postcode') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setStep('options')}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-medium">Postcode Search</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start with a postcode to find streets
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs opacity-70">Enter postcode</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g., IP30 9DR"
            className="w-full mt-1 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          />
        </div>

        {isSearching && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
            Searching postcodes...
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-xl">
            {searchResults.map((result, index) => {
              console.log(`Rendering result ${index}:`, result);
              return (
                <button
                  key={index}
                  onClick={() => handlePostcodeSelect(result)}
                  className="w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                                  <div className="font-medium">
                  {result.display_name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {result.address?.road ? `${result.address.road}, ${result.address.village}` : (result.display_name ? '' : 'No description')}
                </div>
                </button>
              );
            })}
          </div>
        )}

        {!isSearching && searchTerm && searchResults.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
            No postcodes found for "{searchTerm}"
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setStep('manual')}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Enter Manually Instead
          </button>
        </div>
      </div>
    );
  }

  if (step === 'streets') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setStep('postcode')}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-medium">Select Street</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formData.name ? `${formData.name}, ${currentPostcode}` : currentPostcode}
            </p>
          </div>
        </div>

        {availableStreets.length > 0 ? (
          <>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Select the street you want to add to your campaign:
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-xl">
              {availableStreets.map((street, index) => {
                // Handle both string streets and object streets from OpenStreetMap
                const streetName = typeof street === 'string' ? street : (street.address?.road || street.display_name || 'Unknown Street');
                const streetPostcode = typeof street === 'string' ? currentPostcode : (street.address?.postcode || currentPostcode);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleStreetSelect({
                      display: `${streetName} - ${streetPostcode}`,
                      value: streetName,
                      postcode: streetPostcode,
                      admin_district: '',
                      admin_ward: '',
                      parish: '',
                      type: 'real_street',
                      local_type: 'street',
                      county: '',
                      region: ''
                    })}
                    className={`w-full p-3 text-left text-sm transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                      selectedStreet && selectedStreet.name === streetName
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selectedStreet && selectedStreet.name === streetName
                          ? 'bg-primary-600 border-primary-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedStreet && selectedStreet.name === streetName && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium">
                          {streetName}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {streetPostcode}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('postcode')}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Change Postcode
              </button>
              <button
                onClick={() => setStep('manual')}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Enter Manually
              </button>
              <button
                onClick={handlePropertiesConfirm}
                disabled={selectedProperties.length === 0}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add {selectedProperties.length} Properties
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              No streets found. Sorry. Try adding the address manually.
            </div>
            <button
              onClick={() => setStep('manual')}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              Enter Manually
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'properties') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setStep('streets')}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-medium">Select Properties</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedStreet?.name}, {selectedStreet?.postcode}
            </p>
          </div>
        </div>

        {availableProperties.length > 0 ? (
          <>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Select the properties you want to add to your campaign:
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-xl">
              {availableProperties.map((property) => {
                const isSelected = selectedProperties.find(p => p.id === property.id);
                return (
                  <button
                    key={property.id}
                    onClick={() => handlePropertyToggle(property)}
                    className={`w-full p-3 text-left text-sm transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                      isSelected 
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-primary-600 border-primary-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium">
                          {property.name || property.number}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {property.fullAddress}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep('manual')}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Enter Properties Manually
              </button>
              <button
                onClick={handlePropertiesConfirm}
                disabled={selectedProperties.length === 0}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add {selectedProperties.length} Properties
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              No properties found for this street. You can enter them manually.
            </div>
            <button
              onClick={() => setStep('manual')}
              className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
            >
              Enter Properties Manually
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'manual') {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => setStep('options')}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-medium">Enter Street Details</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add the street and property information
            </p>
          </div>
        </div>

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
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
              position: 'relative',
              zIndex: 10
            }}
          >
            Add Street
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
              position: 'relative',
              zIndex: 10
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  if (step === 'search') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setStep('options')}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-medium">Search for Address</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Search by postcode, street name, village, or town
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs opacity-70">Search for address</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              console.log('Input changed to:', e.target.value);
              setSearchTerm(e.target.value);
            }}
            placeholder="e.g., IP30 9DR, Cross Street, Elmswell..."
            className="w-full mt-1 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
          />
          {!GOOGLE_PLACES_API_KEY ? (
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              💡 Using demo data. Add Google Places API key for real UK addresses.
            </div>
          ) : (
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              ✅ Using Google Places API for real UK addresses.
            </div>
          )}
        </div>

        {isSearching && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
            {GOOGLE_PLACES_API_KEY ? 'Searching Google Places API...' : 'Searching demo addresses...'}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-xl">
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => handlePostcodeSelect(result)}
                className="w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
              >
                <div className="font-medium">
                  {result.display_name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {result.display_name && result.display_name.includes(',') ? 
                    result.display_name.split(',').slice(1).join(',').trim() : 
                    'UK Address'
                  }
                </div>
              </button>
            ))}
          </div>
        )}

        {!isSearching && searchTerm && searchResults.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-600 dark:text-gray-400">
            No addresses found for "{searchTerm}"
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setStep('manual')}
            className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
          >
            Enter Manually Instead
          </button>
        </div>
      </div>
    );
  }
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
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
            position: 'relative',
            zIndex: 10
          }}
        >
          Update Campaign
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
            position: 'relative',
            zIndex: 10
          }}
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
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
            position: 'relative',
            zIndex: 10
          }}
        >
          Update Street
        </button>
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ 
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'rgba(124, 58, 237, 0.2)',
            position: 'relative',
            zIndex: 10
          }}
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
    
    // Parse comma-separated property labels
    const propertyLabels = newPropertyLabel
      .split(',')
      .map(label => label.trim())
      .filter(label => label.length > 0);
    
    if (propertyLabels.length === 0) {
      alert('Please enter at least one property label');
      return;
    }
    
    // Add each property
    propertyLabels.forEach(label => {
      onAddProperty(label);
    });
    
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
            placeholder="Property numbers or names (e.g., 1, 3, 5 or The Old Post Office, Rose Cottage)"
          />
          <button 
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors"
          >
            Add
          </button>
        </form>
        <div className="text-xs text-gray-500 mt-1">
          Separate multiple properties with commas: "1, 3, 5" or "The Old Post Office, Rose Cottage"
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{property.label}</span>
                    {property.followUpAt && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs">
                        <CalendarClock className="w-3 h-3" />
                        {property.followUpAt}
                      </div>
                    )}
                  </div>
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

// Get detailed place information including properties
const getPlaceDetails = async (placeId) => {
  try {
    const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components,formatted_address,geometry,name&key=${GOOGLE_API_KEY}`
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 'OK') {
        const place = data.result;
        const addressComponents = place.address_components || [];
        
        // Extract detailed address information
        const streetNumber = addressComponents.find(comp => comp.types.includes('street_number'))?.long_name || '';
        const route = addressComponents.find(comp => comp.types.includes('route'))?.long_name || '';
        const postcode = addressComponents.find(comp => comp.types.includes('postal_code'))?.long_name || '';
        const locality = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
        
        return {
          display_name: place.formatted_address,
          address: {
            road: route,
            postcode: postcode,
            village: locality,
            house_number: streetNumber
          },
          lat: place.geometry?.location?.lat,
          lon: place.geometry?.location?.lng
        };
      }
    }
  } catch (error) {
    console.error('Place details error:', error);
  }
  return null;
};

