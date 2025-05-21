// src/components/Test.tsx
import { IconButton, List, ListItem, Typography, Box, ListItemButton, ListItemAvatar, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';



interface PlantListProps {
  plants: Plant[];
  deletePlant: (plantId: number) => void;
}

export default function PlantsList(props: PlantListProps) {
  const { plants, deletePlant } = props
  return (
    <Box style={{ padding: '20px' }}>
      <Typography variant='h4'>Plants</Typography>
      <List>
        {plants.map((plant) => (
          <ListItem
            key={plant.plant_id}
            secondaryAction={
              <IconButton edge='end' aria-label='delete'>
                <DeleteIcon onClick={() => deletePlant(plant.plant_id!)} />
              </IconButton>
            }
            divider
            disablePadding
          >
            <ListItemAvatar>
              <Avatar variant='rounded' alt={plant.name} />
            </ListItemAvatar>
            <ListItemButton component={Link} to={`/plants/${plant.plant_id}`}>
              {plant.plant_id} {plant.name}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};