"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
    Plus, Search, ShieldCheck,
    LayoutDashboard, TrendingUp, FileText, PieChart,
    FileImage, Home as HomeIcon, Layout as LayoutIcon, 
    Info, Grid, Settings as SettingsIcon, MapPin, 
    Gift, Package, Users, ShoppingCart
} from "lucide-react";

import { toast } from "sonner";
import { useUsers, ROLES } from "./useUsers";
import { UserCard } from "./components/UserCard";
import { RoleCard } from "./components/RoleCard";
import { UserDrawer } from "./components/UserDrawer";
import { MenuItem, UserProfile } from "./types";
import "./UsersStyles.css";

/* ── Brand Colors ── */
const SAGE = "#788069";

/* ── Menu Definition ── */
const MENU_ITEMS: MenuItem[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={14} /> },
    { id: "forecast", label: "Forecast", icon: <TrendingUp size={14} /> },
    { id: "pos", label: "POS Terminal", icon: <ShoppingCart size={14} /> },
    { id: "invoice", label: "Create Invoice", icon: <FileText size={14} /> },
    { id: "pnl", label: "PNL Statement", icon: <PieChart size={14} /> },
    { id: "logo", label: "Logo Management", icon: <FileImage size={14} /> },
    { id: "hero", label: "Hero Management", icon: <HomeIcon size={14} /> },
    { id: "room-type", label: "Room Categories", icon: <LayoutIcon size={14} /> },
    { id: "about", label: "About Us", icon: <Info size={14} /> },
    { id: "gallery", label: "Gallery", icon: <Grid size={14} /> },
    { id: "footer", label: "Footer Info", icon: <SettingsIcon size={14} /> },
    { id: "attractions", label: "Nearby Attractions", icon: <MapPin size={14} /> },
    { id: "promo", label: "Promo Management", icon: <Gift size={14} /> },
    { id: "packages", label: "Custom Packages", icon: <Package size={14} /> },
    { id: "seo", label: "SEO & Metadata", icon: <Search size={14} /> },
    { id: "users", label: "User Management", icon: <Users size={14} /> },
];

/* ── Animations ── */
const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const rise = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const UsersSection: React.FC = () => {
    const { 
        users, rolesPerms, loading, 
        handleSaveUser, handleDeleteUser, togglePermission 
    } = useUsers(MENU_ITEMS);

    const [activeTab, setActiveTab] = useState<"users" | "permissions">("users");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        role: "Kasir",
        password: ""
    });

    const openCreateDrawer = () => {
        setEditingUser(null);
        setFormData({ email: "", name: "", role: "Kasir", password: "" });
        setIsDrawerOpen(true);
    };

    const openEditDrawer = (user: UserProfile) => {
        setEditingUser(user);
        setFormData({ email: user.email, name: user.name, role: user.role });
        setIsDrawerOpen(true);
    };

    const onSave = async () => {
        if (!formData.name || !formData.email) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSaving(true);
        try {
            await handleSaveUser(formData, editingUser);
            setIsDrawerOpen(false);
            
            toast.success(editingUser ? "Personnel profile updated." : "New personnel created.", {
                description: `${formData.name} has been synchronized with the database.`,
                className: "luxury-toast",
            });
        } catch (error) {
            toast.error("Failed to save personnel profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const onDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove ${name} from the system?`)) {
            try {
                await handleDeleteUser(id);
                toast.success("Personnel removed successfully.", {
                    description: `${name} has been purged from the database.`,
                    className: "luxury-toast",
                });
            } catch (error) {
                toast.error("Failed to delete personnel.");
            }
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-[1440px] mx-auto px-6 md:px-10 py-8 flex flex-col gap-8 font-sans">
            {/* ─── Header ─── */}
            <motion.header variants={rise} initial="hidden" animate="show" className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-100">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3.5 mb-1">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center bg-sage/10 text-sage transition-transform hover:rotate-12" style={{ backgroundColor: `${SAGE}1A`, color: SAGE }}>
                            <ShieldCheck size={13} />
                        </div>
                        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-stone-400">Security & Access</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                        User <span style={{ color: SAGE }}>Management</span>
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setActiveTab("users")}
                            className={`h-[46px] min-w-[150px] px-6 rounded-xl text-[10px] font-medium uppercase tracking-[0.2em] transition-all ${activeTab === "users" ? "text-white shadow-lg shadow-sage/20" : "bg-white border border-stone-100 text-stone-400 hover:text-stone-600 hover:border-stone-200"}`}
                            style={activeTab === "users" ? { backgroundColor: SAGE } : {}}
                        >
                            Users
                        </button>
                        <button 
                            onClick={() => setActiveTab("permissions")}
                            className={`h-[46px] min-w-[150px] px-6 rounded-xl text-[10px] font-medium uppercase tracking-[0.2em] transition-all ${activeTab === "permissions" ? "text-white shadow-lg shadow-black/20" : "bg-white border border-stone-100 text-stone-400 hover:text-stone-600 hover:border-stone-200"}`}
                            style={activeTab === "permissions" ? { backgroundColor: "#1A1C14" } : {}}
                        >
                            Permissions
                        </button>
                    </div>
                    
                    {activeTab === "users" && (
                        <div className="flex items-center gap-3 border-l border-stone-100 pl-4">
                            <button 
                                onClick={openCreateDrawer}
                                className="h-[46px] min-w-[150px] px-6 rounded-xl text-[10px] font-medium uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-stone-200/40 text-stone-900"
                                style={{ backgroundColor: "#ffd8a6" }}
                            >
                                <Plus size={14} />
                                Add User
                            </button>
                        </div>
                    )}
                </div>
            </motion.header>

            {/* ─── Main Content ─── */}
            <AnimatePresence mode="wait">
                {activeTab === "users" ? (
                    <motion.section 
                        key="users-tab"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex flex-col gap-6"
                    >
                        {/* Search Bar */}
                        <div className="relative max-w-md w-full group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-stone-400 group-focus-within:text-sage transition-colors">
                                <Search size={16} />
                            </div>
                            <input 
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 pr-4 bg-white border border-stone-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sage/5 focus:border-sage transition-all placeholder:text-stone-300 shadow-sm"
                                style={{ paddingLeft: '3.5rem' }}
                            />
                        </div>

                        {/* User Grid */}
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-stone-300">
                                <p className="text-xs uppercase font-bold tracking-[0.3em] animate-pulse">Syncing Personnel Database...</p>
                            </div>
                        ) : (
                            <motion.div 
                                variants={stagger}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {filteredUsers.map((user) => (
                                    <UserCard 
                                        key={user.id}
                                        user={user}
                                        onEdit={openEditDrawer}
                                        onDelete={onDelete}
                                        variants={rise}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </motion.section>
                ) : (
                    <motion.section 
                        key="perms-tab"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                    >
                        {rolesPerms.map((rp) => (
                            <RoleCard 
                                key={rp.id}
                                role={rp}
                                menuItems={MENU_ITEMS}
                                onToggle={togglePermission}
                            />
                        ))}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ─── Add/Edit User Drawer ─── */}
            <UserDrawer 
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                editingUser={editingUser}
                formData={formData}
                setFormData={setFormData}
                roles={ROLES}
                onSave={onSave}
                isSaving={isSaving}
            />
        </div>
    );
};
