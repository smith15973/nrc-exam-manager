// useDatabase.ts 
import { useState, useEffect } from "react";


export const useSystemKas = () => {
    const [system_kas, setSystemKas] = useState<SystemKa[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addSystemKa = async (system_ka: SystemKa): Promise<void> => {
        if (!system_ka.system_number) {
            setError('Please fill in system number');
            return;
        }
        if (!system_ka.ka_number) {
            setError('Please fill in system number');
            return;
        }

        if (!system_ka.category) {
            setError('Please fill in category');
            return;
        }
        try {
            const result = await window.db.system_kas.add(system_ka);
            if (result.success) {
                setError(null);
                await getSystemKas();
            } else {
                setError(result.error || 'Failed to add system_ka');
            }
        }
        catch (err) {
            setError("Failed to add system_ka");
        }
    };

    const getSystemKa = async (params?: DBSearchParams): Promise<SystemKa | null> => {
        try {
            const result = await window.db.system_kas.get(params);
            if (result.success) {
                setSystemKas(result.systemKas || []);
                return result.systemKa || null;
            } else {
                setError(result.error || 'Failed to fetch system_kas');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch system_kas");
            return null;
        }
    };

    const getSystemKas = async (params?: DBSearchParams): Promise<SystemKa[]> => {
        try {
            const result = await window.db.system_kas.getMany(params);
            if (result.success) {
                setSystemKas(result.systemKas || []);
                return result.systemKas || [];
            } else {
                setError(result.error || 'Failed to fetch system_kas');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch system_kas");
            return [];
        }
    };



    const updateSystemKa = async (system_ka: SystemKa): Promise<void> => {
        if (!system_ka.system_number) {
            setError('Please fill in system number');
            return;
        }
        if (!system_ka.ka_number) {
            setError('Please fill in system number');
            return;
        }

        if (!system_ka.category) {
            setError('Please fill in category');
            return;
        }
        try {
            const result = await window.db.system_kas.update(system_ka);
            if (result.success) {
                setError(null);
                await getSystemKas();
                return
            } else {
                setError(result.error || 'Failed to update system_ka');
                return;
            }
        } catch (err) {
            setError("Failed to update system_ka");
            return;
        }
    };

    const deleteSystemKa = async (system_kaNum: string): Promise<void> => {
        try {
            const result = await window.db.system_kas.delete(system_kaNum);
            if (result.success) {
                await getSystemKas();
            } else {
                setError(result.error || 'Failed to delete system_ka');
            }
        } catch (err) {
            setError("Failed to delete system_ka")
        }
    }
    useEffect(() => {
        getSystemKas();
    }, []);

    return {
        system_kas, getSystemKa, getSystemKas, addSystemKa, updateSystemKa, deleteSystemKa, error
    }
}