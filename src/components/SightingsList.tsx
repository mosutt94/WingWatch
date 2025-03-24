import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { BirdSighting } from '../types';

interface SightingsListProps {
  sightings: BirdSighting[];
}

const SightingsList = ({ sightings }: SightingsListProps) => {
  if (sightings.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No sightings found in this area.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recent Sightings
      </Typography>
      <List>
        {sightings.map((sighting, index) => (
          <ListItem 
            key={`${sighting.checklistId}-${sighting.species}-${index}`}
            divider
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1">
                    {sighting.species}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ({sighting.count})
                  </Typography>
                </Box>
              }
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {sighting.location.name}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2" color="text.secondary">
                    {new Date(sighting.date).toLocaleDateString()} by {sighting.observerName}
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                href={sighting.checklistUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInNewIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SightingsList; 