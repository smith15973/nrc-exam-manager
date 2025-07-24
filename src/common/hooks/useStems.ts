import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export const useStems = () => {
    const [stems, setStems] = useState<Stem[]>([]);

    const addStem = async (stem: Stem): Promise<void> => {
        if (!stem.stem_id) {
            toast.error("Please fill in stem number");
            return;
        }
        if (!stem.stem_statement) {
            toast.error("Please fill in stem statement");
            return;
        }

        try {
            const result = await window.db.stems.add(stem);
            if (result.success) {
                await getStems();
                toast.success("Stem added");
            } else {
                toast.error(result.error || "Failed to add stem");
            }
        } catch (err) {
            toast.error("Failed to add stem");
        }
    };

    const getStem = async (params?: DBSearchParams): Promise<Stem | null> => {
        try {
            const result = await window.db.stems.get(params);
            if (result.success) {
                setStems(result.stems || []);
                return result.stem || null;
            } else {
                toast.error(result.error || "Failed to fetch stem");
                return null;
            }
        } catch (err) {
            toast.error("Failed to fetch stem");
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
                toast.error(result.error || "Failed to fetch stems");
                return [];
            }
        } catch (err) {
            toast.error("Failed to fetch stems");
            return [];
        }
    };

    const updateStem = async (stem: Stem): Promise<void> => {
        if (!stem.stem_statement) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            const result = await window.db.stems.update(stem);
            if (result.success) {
                await getStems();
                toast.success("Stem updated");
            } else {
                toast.error(result.error || "Failed to update stem");
            }
        } catch (err) {
            toast.error("Failed to update stem");
        }
    };

    const deleteStem = async (stemNum: string): Promise<void> => {
        try {
            const result = await window.db.stems.delete(stemNum);
            if (result.success) {
                await getStems();
                toast.success("Stem deleted");
            } else {
                toast.error(result.error || "Failed to delete stem");
            }
        } catch (err) {
            toast.error("Failed to delete stem");
        }
    };

    useEffect(() => {
        getStems();
    }, []);

    return {
        stems,
        getStem,
        getStems,
        addStem,
        updateStem,
        deleteStem,
    };
};
