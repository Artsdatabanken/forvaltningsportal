import React from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  ListItemSecondaryAction
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import LayersIcon from "@material-ui/icons/Layers";
import ReportIcon from "@material-ui/icons/Report";
import CheckIcon from "@material-ui/icons/Check";

const Kartlagliste = ({ kartlag }) => {
  const history = useHistory();
  if (!kartlag) return null;
  return (
    <List>
      <ListSubheader>Kartlag</ListSubheader>
      {Object.keys(kartlag).map(k => {
        const lag = kartlag[k];
        const aok =
          lag.wmsurl && lag.wmsversion && lag.projeksjon && lag.wmsinfoformat;
        return (
          <ListItem
            key={k}
            button
            onClick={() => {
              const url = new URL(window.location);
              url.searchParams.set("ulid", k);
              url.searchParams.delete("sub");
              history.push("/" + url.search);
            }}
          >
            <ListItemAvatar>
              <LayersIcon></LayersIcon>
            </ListItemAvatar>
            <ListItemText primary={kartlag[k].tittel} secondary="Kartlag" />
            <ListItemSecondaryAction>
              {aok ? (
                <CheckIcon style={{ color: "#3e3" }} />
              ) : (
                <ReportIcon style={{ color: "#ea0" }} />
              )}
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

export default Kartlagliste;
