// src/components/Test.tsx
import { IconButton, List, ListItem, Box, ListItemButton, ListItemAvatar, Avatar, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';



interface PlantListProps {
  plants: Plant[];
  deletePlant: (plantId: number) => void;
  sx?: SxProps
}

export default function PlantsList(props: PlantListProps) {
  const { plants, deletePlant, sx } = props
  return (
      <List sx={sx}>
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
  );
};