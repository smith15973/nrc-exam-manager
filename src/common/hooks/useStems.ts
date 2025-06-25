// useDatabase.ts 
import { useState, useEffect } from "react";


export const useStems = () => {
    const [stems, setStems] = useState<Stem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addStem = async (stem: Stem): Promise<void> => {
        if (!stem.stem_id) {
            setError('Please fill in stem number');
            return;
        }
        if (!stem.stem_statement) {
            setError('Please fill in stem name');
            return;
        }
        try {
            const result = await window.db.stems.add(stem);
            if (result.success) {
                setError(null);
                await getStems();
            } else {
                setError(result.error || 'Failed to add stem');
            }
        }
        catch (err) {
            setError("Failed to add stem");
        }
    };

    const getStem = async (params?: DBSearchParams): Promise<Stem | null> => {
        try {
            const result = await window.db.stems.get(params);
            if (result.success) {
                setStems(result.stems || []);
                return result.stem || null;
            } else {
                setError(result.error || 'Failed to fetch stems');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch stems");
            return null;
        }
    };

    const getStems = async (params?: DBSearchParams): Promise<Stem[]> => {
        try {
            const result = await window.db.stems.getMany(params);
            if (result.success) {
                setStems(result.stems || []);
                return result.stems || [];
            } else {
                setError(result.error || 'Failed to fetch stems');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch stems");
            return [];
        }
    };



    const updateStem = async (stem: Stem): Promise<void> => {
        if (!stem.stem_statement) {
            setError('Please fill in all fields');
            return
        }
        try {
            const result = await window.db.stems.update(stem);
            if (result.success) {
                setError(null);
                await getStems();
                return
            } else {
                setError(result.error || 'Failed to update stem');
                return;
            }
        } catch (err) {
            setError("Failed to update stem");
            return;
        }
    };

    const deleteStem = async (stemNum: string): Promise<void> => {
        try {
            const result = await window.db.stems.delete(stemNum);
            if (result.success) {
                await getStems();
            } else {
                setError(result.error || 'Failed to delete stem');
            }
        } catch (err) {
            setError("Failed to delete stem")
        }
    }
    useEffect(() => {
        getStems();
    }, []);

    return {
        stems, getStem, getStems, addStem, updateStem, deleteStem, error
    }
}