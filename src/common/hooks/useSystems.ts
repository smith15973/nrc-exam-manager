import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const useSystems = () => {
    const [systems, setSystems] = useState<System[]>([]);

    const addSystem = async (system: System): Promise<void> => {
        if (!system.system_number) {
            toast.error("Please fill in system number");
            return;
        }
        if (!system.system_name) {
            toast.error("Please fill in system name");
            return;
        }

        try {
            const result = await window.db.systems.add(system);
            if (result.success) {
                await getSystems();
                toast.success("System added");
            } else {
                toast.error(result.error || "Failed to add system");
            }
        } catch (err) {
            toast.error("Failed to add system");
        }
    };

    const getSystem = async (params?: DBSearchParams): Promise<System | null> => {
        try {
            const result = await window.db.systems.get(params);
            if (result.success) {
                setSystems(result.systems || []);
                return result.system || null;
            } else {
                toast.error(result.error || "Failed to fetch systems");
                return null;
            }
        } catch (err) {
            toast.error("Failed to fetch systems");
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
                toast.error(result.error || "Failed to fetch systems");
                return [];
            }
        } catch (err) {
            toast.error("Failed to fetch systems");
            return [];
        }
    };

    const updateSystem = async (system: System): Promise<void> => {
        if (!system.system_name) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            const result = await window.db.systems.update(system);
            if (result.success) {
                await getSystems();
                toast.success("System updated");
            } else {
                toast.error(result.error || "Failed to update system");
            }
        } catch (err) {
            toast.error("Failed to update system");
        }
    };

    const deleteSystem = async (systemNum: string): Promise<void> => {
        try {
            const result = await window.db.systems.delete(systemNum);
            if (result.success) {
                await getSystems();
                toast.success("System deleted");
            } else {
                toast.error(result.error || "Failed to delete system");
            }
        } catch (err) {
            toast.error("Failed to delete system");
        }
    };

    useEffect(() => {
        getSystems();
    }, []);

    return {
        systems,
        getSystem,
        getSystems,
        addSystem,
        updateSystem,
        deleteSystem,
    };
};
