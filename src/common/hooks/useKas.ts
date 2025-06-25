// useDatabase.ts 
import { useState, useEffect } from "react";


export const useKas = () => {
    const [kas, setKas] = useState<Ka[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addKa = async (ka: Ka): Promise<void> => {
        if (!ka.ka_number || !ka.stem_id) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.db.kas.add(ka);
            if (result.success) {
                setError(null);
                await getKas();
            } else {
                setError(result.error || 'Failed to add ka');
            }
        }
        catch (err) {
            setError("Failed to add ka");
        }
    };

    const getKa = async (params?: DBSearchParams): Promise<Ka | null> => {
        try {
            const result = await window.db.kas.get(params);
            if (result.success) {
                setKas(result.kas || []);
                return result.ka || null;
            } else {
                setError(result.error || 'Failed to fetch kas');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch kas");
            return null;
        }
    };

    const getKas = async (params?: DBSearchParams): Promise<Ka[]> => {
        try {
            const result = await window.db.kas.getMany(params);
            if (result.success) {
                setKas(result.kas || []);
                return result.kas || [];
            } else {
                setError(result.error || 'Failed to fetch kas');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch kas");
            return [];
        }
    };



    const updateKa = async (ka: Ka): Promise<void> => {
        if (!ka.ka_number || !ka.stem_id) {
            setError('Please fill in all fields');
            return
        }
        try {
            const result = await window.db.kas.update(ka);
            if (result.success) {
                setError(null);
                await getKas();
                return
            } else {
                setError(result.error || 'Failed to update ka');
                return;
            }
        } catch (err) {
            setError("Failed to update ka");
            return;
        }
    };

    const deleteKa = async (kaNum: string): Promise<void> => {
        try {
            const result = await window.db.kas.delete(kaNum);
            if (result.success) {
                await getKas();
            } else {
                setError(result.error || 'Failed to delete ka');
            }
        } catch (err) {
            setError("Failed to delete ka")
        }
    }
    useEffect(() => {
        getKas();
    }, []);

    return {
        kas, getKa, getKas, addKa, updateKa, deleteKa, error
    }
}