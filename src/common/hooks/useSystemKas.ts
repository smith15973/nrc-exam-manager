import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const useSystemKas = () => {
    const [system_kas, setSystemKas] = useState<SystemKa[]>([]);

    const addSystemKa = async (system_ka: SystemKa): Promise<void> => {
        if (!system_ka.system_number) {
            toast.error("Please fill in system number");
            return;
        }
        if (!system_ka.ka_number) {
            toast.error("Please fill in KA number");
            return;
        }
        if (!system_ka.category) {
            toast.error("Please fill in category");
            return;
        }

        try {
            const result = await window.db.system_kas.add(system_ka);
            if (result.success) {
                await getSystemKas();
                toast.success("System KA added");
            } else {
                toast.error(result.error || "Failed to add system KA");
            }
        } catch (err) {
            toast.error("Failed to add system KA");
        }
    };

    const getSystemKa = async (params?: DBSearchParams): Promise<SystemKa | null> => {
        try {
            const result = await window.db.system_kas.get(params);
            if (result.success) {
                setSystemKas(result.system_kas || []);
                return result.system_ka || null;
            } else {
                toast.error(result.error || "Failed to fetch system KA");
                return null;
            }
        } catch (err) {
            toast.error("Failed to fetch system KA");
            return null;
        }
    };

    const getSystemKas = async (params?: DBSearchParams): Promise<SystemKa[]> => {
        try {
            const result = await window.db.system_kas.getMany(params);
            if (result.success) {
                setSystemKas(result.system_kas || []);
                return result.system_kas || [];
            } else {
                toast.error(result.error || "Failed to fetch system KAs");
                return [];
            }
        } catch (err) {
            toast.error("Failed to fetch system KAs");
            return [];
        }
    };

    const updateSystemKa = async (system_ka: SystemKa): Promise<void> => {
        if (!system_ka.system_number) {
            toast.error("Please fill in system number");
            return;
        }
        if (!system_ka.ka_number) {
            toast.error("Please fill in KA number");
            return;
        }
        if (!system_ka.category) {
            toast.error("Please fill in category");
            return;
        }

        try {
            const result = await window.db.system_kas.update(system_ka);
            if (result.success) {
                await getSystemKas();
                toast.success("System KA updated");
            } else {
                toast.error(result.error || "Failed to update system KA");
            }
        } catch (err) {
            toast.error("Failed to update system KA");
        }
    };

    const deleteSystemKa = async (system_kaNum: string): Promise<void> => {
        try {
            const result = await window.db.system_kas.delete(system_kaNum);
            if (result.success) {
                await getSystemKas();
                toast.success("System KA deleted");
            } else {
                toast.error(result.error || "Failed to delete system KA");
            }
        } catch (err) {
            toast.error("Failed to delete system KA");
        }
    };

    useEffect(() => {
        getSystemKas();
    }, []);

    return {
        system_kas,
        getSystemKa,
        getSystemKas,
        addSystemKa,
        updateSystemKa,
        deleteSystemKa,
    };
};
