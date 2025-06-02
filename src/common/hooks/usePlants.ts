// useDatabase.ts 
import { useState, useEffect } from "react";


export const usePlants = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [plantsWithExams, setPlantsWithExams] = useState<Plant[]>([]);
    const [error, setError] = useState<string | null>(null);

    const addPlant = async (plant: Plant): Promise<void> => {
        if (!plant.name) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.db.plants.add(plant);
            if (result.success) {
                setError(null);
                await getPlants();
                await getPlantsWithExams();
            } else {
                setError(result.error || 'Failed to add plant');
            }
        }
        catch (err) {
            setError("Failed to add plant");
        }
    };

    const getPlants = async (): Promise<Plant[]> => {
        try {
            const result = await window.db.plants.get();
            if (result.success) {
                setPlants(result.plants || []);
                return result.plants || [];
            } else {
                setError(result.error || 'Failed to fetch plants');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch plants");
            return [];
        }
    };

    const getPlantsWithExams = async (): Promise<Plant[]> => {
        try {
            const result = await window.db.plants.getWithExams();
            if (result.success) {
                setPlantsWithExams(result.plants || [])
                return result.plants || [];
            } else {
                setError(result.error || 'Failed to fetch plants with exams');
                return [];
            }
        } catch (err) {
            setError("Failed to fetch plants with exams");
            return [];
        }
    };
    const getPlantById = async (plantId: number): Promise<Plant | null> => {
        try {
            const result = await window.db.plants.getById(plantId);
            if (result.success) {
                return result.plant || null;
            } else {
                setError(result.error || 'Failed to fetch plant');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch plant");
            return null;
        }
    };

    const getPlantByIdWithExams = async (plantId: number): Promise<Plant | null> => {
        try {
            const result = await window.db.plants.getByIdWithExams(plantId);
            if (result.success) {
                return result.plant || null;
            } else {
                setError(result.error || 'Failed to fetch plants with exams');
                return null;
            }
        } catch (err) {
            setError("Failed to fetch plants with exams");
            return null;
        }
    };



    const updatePlant = async (plant: Plant): Promise<void> => {
        if (!plant.name) {
            setError('Please fill in all fields');
            return
        }
        try {
            const result = await window.db.plants.update(plant);
            if (result.success) {
                setError(null);
                await getPlants();
                await getPlantsWithExams();
                return
            } else {
                setError(result.error || 'Failed to update plant');
                return;
            }
        } catch (err) {
            setError("Failed to update plant");
            return;
        }
    };

    const deletePlant = async (plantId: number): Promise<void> => {
        try {
            const result = await window.db.plants.delete(plantId);
            if (result.success) {
                await getPlants();
                await getPlantsWithExams();
            } else {
                setError(result.error || 'Failed to delete plant');
            }
        } catch (err) {
            setError("Failed to delete plant")
        }
    }
    useEffect(() => {
        getPlants();
        getPlantsWithExams();
    }, []);

    return {
        plants, getPlantById, getPlantByIdWithExams, plantsWithExams, addPlant, updatePlant, deletePlant, error
    }
}