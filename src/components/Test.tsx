// src/components/Test.tsx
import React, { useState, useEffect } from 'react';

const Test: React.FC = () => {
  const [name, setName] = useState('');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchPlants = async () => {
    const result = await window.api.getPlants();
    if (result.success) {
      setPlants(result.plants || []);
    } else {
      setError(result.error || 'Failed to fetch users');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Please fill in all fields');
      return;
    }
    const result = await window.api.addPlant({ name });
    if (result.success) {
      setName('');
      setError(null);
      fetchPlants();
    } else {
      setError(result.error || 'Failed to add user');
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Plant Management</h1>
      <form onSubmit={handleAddUser}>
        <div>
          <label>Name: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit">Add Plant</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <h2>Plants</h2>
      <ul>
        {plants.map((plant) => (
          <li key={plant.plant_id}>
            {plant.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Test;