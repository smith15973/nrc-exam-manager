// useDatabase.ts 
import { useState, useEffect } from "react";
import { Database } from "../lib/db";


export const useDatabase = () => {
    const [plants, setPlants] = useState<Plant[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPlants = async () => {
        try {
            const result = await window.api.getPlants();
            if (result.success) {
                setPlants(result.plants || []);
            } else {
                setError(result.error || 'Failed to fetch plants');
            }
        } catch (err) {
            setError("Failed to fetch plants");
        }
    };
    const fetchPlant = async (plantId: number) => {
        try {
            const result = await window.api.getPlant(plantId);
            if (result.success) {
                return result.plant ?? null;
            } else {
                setError(result.error || 'Failed to fetch plant');
            }
        } catch (err) {
            setError("Failed to fetch plant");
        }
    };

    const addPlant = async (plant: Plant) => {
        if (!plant.name) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.api.addPlant(plant);
            if (result.success) {
                setError(null);
                await fetchPlants();
            } else {
                setError(result.error || 'Failed to add plant');
            }
        }
        catch (err) {
            setError("Failed to add plant");
        }
    };

    const updatePlant = async (plant: Plant) => {
        if (!plant.name) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await window.api.updatePlant(plant);
            if (result.success) {
                setError(null);
                await fetchPlants();
            } else {
                setError(result.error || 'Failed to update plant');
            }
        } catch (err) {
            setError("Failed to update plant");
        }
    };

    const deletePlant = async (plantId: number) => {
        try {
            const result = await window.api.deletePlant(plantId);
            if (result.success) {
                await fetchPlants();
            } else {
                setError(result.error || 'Failed to delete plant');
            }
        } catch (err) {
            setError("Failed to delete plant")
        }
    }

    useEffect(() => {
        fetchPlants();
    }, []);

    return { plants, fetchPlant, addPlant, updatePlant, deletePlant, error }
}