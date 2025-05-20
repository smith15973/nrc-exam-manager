// PlantForm.tsx
import React, { useState, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import { defaultPlant, plantSchema } from '../lib/schema';

interface PlantFormProps {
    plantId?: number;
}

const PlantsForm: React.FC<PlantFormProps> = ({ plantId }) => {
    const [plant, setPlant] = useState<Plant>(defaultPlant);
    const { addPlant, error, fetchPlant } = useDatabase();

    useEffect(() => {
        if (plantId) {
            fetchPlant(plantId).then((fetchedPlant) => {
                if (fetchedPlant) {
                    setPlant(fetchedPlant);
                }
            });
        }
    }, [plantId, fetchPlant]);

    const handleChange = (key: string, value: string) => {
        setPlant((prev) => ({ ...prev, [key]: value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault;
        if (!plant.name.trim()) return;

        try {
            await addPlant(plant);
            setPlant(defaultPlant);
        } catch (err) {
            // error handled by useDatabase hook
        }
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Plant Management</h1>
            <form onSubmit={handleSubmit}>
                {plantSchema.map((field) => (
                    <div key={field.key}>
                        <label htmlFor={`${field.label}`}>{field.label}</label>
                        <input type={field.type}
                            value={(plant as any)[field.key] || ''}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            required={field.required}
                        />
                    </div>
                ))}
                <button type='submit'>Add Plant</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default PlantsForm;