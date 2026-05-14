import { useState, useEffect } from "react";
import { 
    collection, setDoc, doc, updateDoc, 
    deleteDoc, onSnapshot, query, orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserProfile, RolePermission } from "./types";

export const ROLES = [
    "superadmin", 
    "General Manager", 
    "House Keeping", 
    "Purchasing", 
    "Kasir", 
    "Kitchen"
];

export const useUsers = (menuItems: any[]) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [rolesPerms, setRolesPerms] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to Users
        const unsubUsers = onSnapshot(query(collection(db, "users_master"), orderBy("name")), (snap) => {
            const list: UserProfile[] = [];
            snap.forEach(d => list.push({ id: d.id, ...d.data() } as UserProfile));
            
            // Check for Hardcoded Admin
            const adminEmail = "nexura.management@gmail.com";
            const adminExists = list.some(u => u.email === adminEmail);
            if (!adminExists) {
                const adminId = adminEmail.replace(/[@.]/g, '_');
                setDoc(doc(db, "users_master", adminId), {
                    name: "Nexura Management",
                    email: adminEmail,
                    password: "000000",
                    role: "superadmin"
                });
            }

            setUsers(list);
            setLoading(false);
        });

        // Listen to Role Permissions
        const unsubRoles = onSnapshot(collection(db, "roles_master"), (snap) => {
            const list: RolePermission[] = [];
            snap.forEach(d => list.push({ id: d.id, ...d.data() } as RolePermission));
            
            if (list.length < ROLES.length) {
                initializeRoles(list, menuItems);
            } else {
                setRolesPerms(list);
            }
        });

        return () => {
            unsubUsers();
            unsubRoles();
        };
    }, []);

    const initializeRoles = async (existing: RolePermission[], menuItems: any[]) => {
        const existingIds = existing.map(r => r.id);
        for (const role of ROLES) {
            const roleId = role.toLowerCase().replace(/\s+/g, '_');
            if (!existingIds.includes(roleId)) {
                const defaultPerms: Record<string, boolean> = {};
                menuItems.forEach(m => defaultPerms[m.id] = role === "superadmin");
                
                await setDoc(doc(db, "roles_master", roleId), {
                    label: role,
                    permissions: defaultPerms
                });
            }
        }
    };

    const handleSaveUser = async (formData: any, editingUser: UserProfile | null) => {
        try {
            if (editingUser) {
                const userDoc = doc(db, "users_master", editingUser.id);
                // Remove password from formData if it's there to avoid accidental overwrite
                const { password, ...updateData } = formData;
                await updateDoc(userDoc, updateData);
                console.log("User updated successfully:", editingUser.id);
            } else {
                const newId = formData.email.replace(/[@.]/g, '_');
                await setDoc(doc(db, "users_master", newId), formData);
                console.log("User created successfully:", newId);
            }
            return true;
        } catch (error) {
            console.error("Error saving user:", error);
            throw error;
        }
    };

    const handleDeleteUser = async (id: string) => {
        try {
            await deleteDoc(doc(db, "users_master", id));
            console.log("User deleted successfully:", id);
            return true;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    };

    const togglePermission = async (roleId: string, menuId: string, currentValue: boolean) => {
        const roleDoc = doc(db, "roles_master", roleId);
        await updateDoc(roleDoc, {
            [`permissions.${menuId}`]: !currentValue
        });
    };

    return {
        users,
        rolesPerms,
        loading,
        handleSaveUser,
        handleDeleteUser,
        togglePermission
    };
};
