// src/components/Test.tsx
import { IconButton, List, ListItem, ListItemButton, ListItemAvatar, Avatar, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';



interface SystemKaListProps {
    system_kas: SystemKa[];
    deleteSystemKa: (system_kaNum: string) => void;
    sx?: SxProps
}

export default function SystemKasList(props: SystemKaListProps) {
    const { system_kas, deleteSystemKa, sx } = props
    return (
        <List sx={sx}>
            {system_kas.map((system_ka) => {
                return (
                    <ListItem
                        key={system_ka.system_ka_number}
                        secondaryAction={
                            <IconButton edge='end' aria-label='delete'>
                                <ConfirmDelete
                                    message='Are you sure you want to delete this KA? This action cannot be undone!'
                                    onConfirmDelete={() => deleteSystemKa(system_ka.system_ka_number)}
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
                            <Avatar variant='rounded' alt={system_ka.system_ka_number} />
                        </ListItemAvatar>
                        <ListItemButton component={Link} to={`/system_kas/${system_ka.system_ka_number}`}>
                            {system_ka.system_ka_number} 
                        </ListItemButton>
                    </ListItem>
                )
            })}
        </List>
    );
}