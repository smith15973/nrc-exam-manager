// src/components/Test.tsx
import { IconButton, List, ListItem, ListItemButton, ListItemAvatar, Avatar, SxProps } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import ConfirmDelete from '../../../common/components/ConfirmDelete';



interface StemListProps {
    stems: Stem[];
    deleteStem: (stemNum: string) => void;
    sx?: SxProps
}

export default function StemsList(props: StemListProps) {
    const { stems, deleteStem, sx } = props
    return (
        <List sx={sx}>
            {stems.map((stem) => {
                return (
                    <ListItem
                        key={stem.stem_id}
                        secondaryAction={
                            <IconButton edge='end' aria-label='delete'>
                                <ConfirmDelete
                                    message='Are you sure you want to delete this stem? This action cannot be undone!'
                                    onConfirmDelete={() => deleteStem(stem.stem_id)}
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
                            <Avatar variant='rounded' alt={stem.stem_statement} />
                        </ListItemAvatar>
                        <ListItemButton component={Link} to={`/stems/${stem.stem_id}`}>
                            {stem.stem_id} {stem.stem_statement}
                        </ListItemButton>
                    </ListItem>
                )
            })}
        </List>
    );
}