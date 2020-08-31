import React from "react";
import { ListItem, ListItemIcon, ListItemText, Badge } from "@material-ui/core";
import { KeyboardBackspace } from "@material-ui/icons";
import "../../style/infobox.css";
import CustomIcon from "../../Common/CustomIcon";

const DetailedResults = ({
  resultLayer,
  primaryText,
  secondaryText,
  numberResults,
  hideDetailedResults
}) => {
  const isLargeIcon = tema => {
    return ["Arealressurs", "Arter", "Klima", "Skog", "Landskap"].includes(
      tema
    );
  };

  const sublayers = resultLayer.underlag;

  const resultText = resultArray => {
    if (!resultArray.isArray && resultArray.length === 0) {
      return "Ingen treff";
    }
    if (!resultArray.isArray && resultArray.length > 0) {
      return resultArray;
    }
    if (resultArray.length === 0) {
      return "Ingen treff";
    }
    const filteredResult = resultArray.filter(
      item => item && item !== "" && item !== " "
    );
    if (filteredResult.length === 0) {
      return "Ingen treff";
    }
    return resultArray;
  };

  return (
    <div className="infobox-details-container">
      <ListItem
        // Kartlag
        id="infobox-details-title-wrapper"
        button
        onClick={() => {
          hideDetailedResults();
        }}
      >
        <ListItemIcon>
          <KeyboardBackspace />
        </ListItemIcon>
        <ListItemText>
          <span className="infobox-details-title-text">
            Detaljerte resultater
          </span>
        </ListItemText>
      </ListItem>
      <ListItem id="infobox-details-layer" divider>
        <ListItemIcon className="infobox-list-icon-wrapper">
          <Badge
            className={"badge-enabled"}
            badgeContent={numberResults || 0}
            color="primary"
          >
            <CustomIcon
              id="infobox-list-icon"
              icon={resultLayer.tema}
              size={isLargeIcon(resultLayer.tema) ? 30 : 26}
              padding={isLargeIcon(resultLayer.tema) ? 0 : 2}
              color="#666"
            />
          </Badge>
        </ListItemIcon>
        <ListItemText
          primary={resultLayer.tittel}
          secondary={resultLayer.dataeier}
        />
      </ListItem>
      <div className="infobox-details-wrapper">
        {sublayers &&
          primaryText &&
          Object.keys(sublayers).map((key, index) => {
            return (
              <div key={index} className="infobox-details-content-wrapper">
                <div className="infobox-details-title">
                  {sublayers[key].tittel}
                </div>
                <div className="infobox-details-primary-text">
                  {resultText(primaryText[key].elementer)}
                </div>
                <div className="infobox-details-secondary-text">
                  {resultText(secondaryText[key].elementer)}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default DetailedResults;