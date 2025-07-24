import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useErrorHandler } from "./useErrorHandler";

export const useKas = () => {
    const [kas, setKas] = useState<Ka[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { handleError } = useErrorHandler();

    const getKa = async (params?: DBSearchParams): Promise<Ka | null> => {
        setIsLoading(true);
        try {
            const result = await window.db.kas.get(params);

            if (result.success) {
                setKas(result.kas || []);
                return result.ka || null;
            } else {
                const errorMsg = result.error || "Failed to fetch ka";

                if (errorMsg.toLowerCase().includes("not found")) {
                    return null;
                }

                throw new Error(errorMsg);
            }
        } catch (err) {
            const fallbackMsg = "Failed to fetch ka";
            console.error("Database error:", err);
            throw err instanceof Error ? err : new Error(fallbackMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const getKas = async (params?: DBSearchParams): Promise<Ka[]> => {
        setIsLoading(true);
        try {
            const result = await window.db.kas.getMany(params);

            if (result.success) {
                setKas(result.kas || []);
                return result.kas || [];
            } else {
                const errorMsg = result.error || "Failed to fetch kas";

                if (errorMsg.toLowerCase().includes("database connection")) {
                    throw new Error("Database connection error");
                }

                throw new Error(errorMsg);
            }
        } catch (err) {
            const fallbackMsg = "Failed to fetch kas";
            console.error("Database error:", err);
            throw err instanceof Error ? err : new Error(fallbackMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const addKa = async (ka: Ka): Promise<void> => {
        if (!ka.ka_number || !ka.stem_id) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const result = await window.db.kas.add(ka);

            if (result.success) {
                await getKas();
                toast.success("Ka added");
            } else {
                const errorMsg = result.error || "Failed to add ka";

                if (errorMsg.toLowerCase().includes("database connection")) {
                    handleError(new Error(errorMsg), "network");
                } else {
                    handleError(new Error(errorMsg), "general");
                }
            }
        } catch (err) {
            const fallbackMsg = "Failed to add ka";
            console.error("Database error:", err);
            handleError(err instanceof Error ? err : new Error(fallbackMsg), "general");
        } finally {
            setIsLoading(false);
        }
    };

    const updateKa = async (ka: Ka): Promise<void> => {
        if (!ka.ka_number || !ka.stem_id) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsLoading(true);
        try {
            const result = await window.db.kas.update(ka);

            if (result.success) {
                await getKas();
                toast.success("Ka updated");
            } else {
                const errorMsg = result.error || "Failed to update ka";

                if (errorMsg.toLowerCase().includes("not found")) {
                    handleError(new Error("Ka not found"), "notFound");
                } else if (errorMsg.toLowerCase().includes("database connection")) {
                    handleError(new Error(errorMsg), "network");
                } else {
                    handleError(new Error(errorMsg), "general");
                }
            }
        } catch (err) {
            const fallbackMsg = "Failed to update ka";
            console.error("Database error:", err);
            handleError(err instanceof Error ? err : new Error(fallbackMsg), "general");
        } finally {
            setIsLoading(false);
        }
    };

    const deleteKa = async (kaNum: string): Promise<void> => {
        setIsLoading(true);
        try {
            const result = await window.db.kas.delete(kaNum);

            if (result.success) {
                await getKas();
                toast.success("Ka deleted");
            } else {
                const errorMsg = result.error || "Failed to delete ka";

                if (errorMsg.toLowerCase().includes("not found")) {
                    handleError(new Error("Ka not found"), "notFound");
                } else if (errorMsg.toLowerCase().includes("database connection")) {
                    handleError(new Error(errorMsg), "network");
                } else {
                    handleError(new Error(errorMsg), "general");
                }
            }
        } catch (err) {
            const fallbackMsg = "Failed to delete ka";
            console.error("Database error:", err);
            handleError(err instanceof Error ? err : new Error(fallbackMsg), "general");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getKas().catch((err) => {
            const msg = err?.message?.toLowerCase?.() || "";
            if (msg.includes("database connection")) {
                handleError(err, "network");
            } else {
                handleError(err, "general");
            }
        });
    }, []);

    return {
        kas,
        getKa,
        getKas,
        addKa,
        updateKa,
        deleteKa,
        isLoading,
    };
};
