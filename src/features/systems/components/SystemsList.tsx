// src/components/Test.tsx
import { IconButton, List, ListItem, ListItemButton, ListItemAvatar, Avatar, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';



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
                        key={system.system_number}
                        secondaryAction={
                            <IconButton edge='end' aria-label='delete'>
                                <ConfirmDelete
                                    message='Are you sure you want to delete this system? This action cannot be undone!'
                                    onConfirmDelete={() => deleteSystem(system.system_number)}
                                    button={({ onClick, disabled }) => (
                                        <DeleteIcon
                                            onClick={onClick}
                                            style={{
                                                cursor: disabled ? 'not-allowed' : 'pointer',
                                                opacity: disabled ? 0.5 : 1
                                            }}
                                        />
                                    )}
                                />
                            </IconButton>
                        }
                        divider
                        disablePadding
                    >
                        <ListItemAvatar>
                            <Avatar variant='rounded' alt={system.system_name} />
                        </ListItemAvatar>
                        <ListItemButton component={Link} to={`/systems/${system.system_number}`}>
                            {system.system_number} {system.system_name}
                        </ListItemButton>
                    </ListItem>
                )
            })}
        </List>
    );
}