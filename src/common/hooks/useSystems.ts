// useDatabase.ts 
import { useState, useEffect } from "react";


export const useSystems = () => {
    const [systems, setSystems] = useState<System[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addSystem = async (system: System): Promise<void> => {
        if (!system.system_name) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.db.systems.add(system);
            if (result.success) {
                setError(null);
                await getSystems();
            } else {
                setError(result.error || 'Failed to add system');
            }
        }
        catch (err) {
            setError("Failed to add system");
        }
    };

    const getSystem = async (params?: DBSearchParams): Promise<System | null> => {
        try {
            const result = await window.db.systems.get(params);
            if (result.success) {
                setSystems(result.systems || []);
                return result.system || null;
            } else {
                setError(result.error || 'Failed to fetch systems');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch systems");
            return null;
        }
    };

    const getSystems = async (params?: DBSearchParams): Promise<System[]> => {
        try {
            const result = await window.db.systems.getMany(params);
            if (result.success) {
                setSystems(result.systems || []);
                return result.systems || [];
            } else {
                setError(result.error || 'Failed to fetch systems');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch systems");
            return [];
        }
    };



    const updateSystem = async (system: System): Promise<void> => {
        if (!system.system_name) {
            setError('Please fill in all fields');
            return
        }
        try {
            const result = await window.db.systems.update(system);
            if (result.success) {
                setError(null);
                await getSystems();
                return
            } else {
                setError(result.error || 'Failed to update system');
                return;
            }
        } catch (err) {
            setError("Failed to update system");
            return;
        }
    };

    const deleteSystem = async (systemNum: string): Promise<void> => {
        try {
            const result = await window.db.systems.delete(systemNum);
            if (result.success) {
                await getSystems();
            } else {
                setError(result.error || 'Failed to delete system');
            }
        } catch (err) {
            setError("Failed to delete system")
        }
    }
    useEffect(() => {
        getSystems();
    }, []);

    return {
        systems, getSystem, getSystems, addSystem, updateSystem, deleteSystem, error
    }
}