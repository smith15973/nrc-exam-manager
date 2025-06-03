// src/components/Test.tsx
import { IconButton, List, ListItem, Box, ListItemButton, ListItemAvatar, Avatar, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';



interface SystemListProps {
    systems: System[];
    deleteSystem: (systemNum: string) => void;
    sx?: SxProps
}

export default function SystemsList(props: SystemListProps) {
    const { systems, deleteSystem, sx } = props
    return (
        <List sx={sx}>
            {systems.map((system) => {
                return (
                    <ListItem
                        key={system.number}
                        secondaryAction={
                            <IconButton edge='end' aria-label='delete'>
                                <DeleteIcon onClick={() => deleteSystem(system.number)} />
                            </IconButton>
                        }
                        divider
                        disablePadding
                    >
                        <ListItemAvatar>
                            <Avatar variant='rounded' alt={system.name} />
                        </ListItemAvatar>
                        <ListItemButton component={Link} to={`/systems/${system.number}`}>
                            {system.number} {system.name}
                        </ListItemButton>
                    </ListItem>
                )
            })}
        </List>
    );
};