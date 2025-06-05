// src/components/Test.tsx
import { IconButton, List, ListItem, Box, ListItemButton, ListItemAvatar, Avatar, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';



interface KaListProps {
    kas: Ka[];
    deleteKa: (kaNum: string) => void;
    sx?: SxProps
}

export default function KasList(props: KaListProps) {
    const { kas, deleteKa, sx } = props
    return (
        <List sx={sx}>
            {kas.map((ka) => {
                return (
                    <ListItem
                        key={ka.ka_number}
                        secondaryAction={
                            <IconButton edge='end' aria-label='delete'>
                                <ConfirmDelete
                                    message='Are you sure you want to delete this KA? This action cannot be undone!'
                                    onConfirmDelete={() => deleteKa(ka.ka_number)}
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
                            <Avatar variant='rounded' alt={ka.ka_description} />
                        </ListItemAvatar>
                        <ListItemButton component={Link} to={`/kas/${ka.ka_number}`}>
                            {ka.ka_number} {ka.ka_description}
                        </ListItemButton>
                    </ListItem>
                )
            })}
        </List>
    );
};