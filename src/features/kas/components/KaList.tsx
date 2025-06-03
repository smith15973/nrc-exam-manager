// src/components/Test.tsx
import { IconButton, List, ListItem, Box, ListItemButton, ListItemAvatar, Avatar, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';



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
                                <DeleteIcon onClick={() => deleteKa(ka.ka_number)} />
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