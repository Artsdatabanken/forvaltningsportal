import { OpenInNew, Info, Close } from "@material-ui/icons";
import {
  ListItem,
  ListItemIcon,
  Modal,
  Button,
  IconButton
} from "@material-ui/core";
import React, { useState } from "react";
import { Badge } from "@material-ui/core";
import formatterKlikktekst from "./Klikktekst";
import url_formatter from "../../Funksjoner/url_formatter";
import CustomIcon from "../../Common/CustomIcon";
import CustomTooltip from "../../Common/CustomTooltip";

const GeneriskElement = ({
  coordinates_area,
  kartlag,
  resultat,
  element,
  showDetailedResults
}) => {
  const [open, setOpen] = useState(false);
  const [primaryTextHeader, setPrimaryTextHeader] = useState({
    harData: false,
    elementer: []
  });

  let layer = kartlag[element];
  if (!layer) return null;
  const faktaark_url = url_formatter(layer.faktaark, {
    ...coordinates_area,
    ...resultat
  });

  const isLargeIcon = tema => {
    return ["Arealressurs", "Arter", "Klima", "Skog", "Landskap"].includes(
      tema
    );
  };

  let primaryText = {};
  let secondaryText = {};
  let numberResults = 0;
  let numberNoMatches = 0;
  Object.keys(layer.underlag).forEach(subkey => {
    if (!resultat.underlag) return;
    if (resultat.underlag[subkey] && resultat.underlag[subkey].loading) return;

    // TODO: Should also add a check where, if no changes, skip re-calculations

    const sublayer = layer.underlag[subkey];
    const primary = formatterKlikktekst(
      sublayer.klikktekst,
      resultat.underlag[subkey] || resultat
    );
    const secondary = formatterKlikktekst(
      sublayer.klikktekst2,
      resultat.underlag[subkey] || resultat
    );
    primaryText = { ...primaryText, [subkey]: primary };
    secondaryText = { ...secondaryText, [subkey]: secondary };

    if (!primaryTextHeader.harData && primary.harData) {
      setPrimaryTextHeader(primary);
    }

    if (sublayer.aggregatedwmslayer && primary.harData) {
      setPrimaryTextHeader(primary);
    }

    if (
      (primaryTextHeader.elementer.length === 0 ||
        !primaryTextHeader.elementer[0] ||
        primaryTextHeader.elementer[0] === "" ||
        primaryTextHeader.elementer[0] === " ") &&
      primary.elementer.length > 0 &&
      primary.elementer[0] &&
      primary.elementer[0] !== "" &&
      primary.elementer[0] !== " "
    ) {
      setPrimaryTextHeader(primary);
    }

    if (primary.elementer && primary.elementer[0]) {
      numberResults += 1;
    } else {
      numberNoMatches += 1;
    }
  });

  return (
    <div className="generic_element">
      {primaryTextHeader.elementer && primaryTextHeader.elementer.length > 0 && (
        <ListItem
          id="generic-element-list"
          button
          divider
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            showDetailedResults(
              layer,
              primaryText,
              secondaryText,
              numberResults
            );
          }}
        >
          <ListItemIcon className="infobox-list-icon-wrapper">
            <Badge
              badgeContent={
                resultat.error
                  ? "!"
                  : numberResults + "/" + (numberNoMatches + numberResults)
              }
              color={
                resultat.error
                  ? "error"
                  : numberResults > 0
                  ? "primary"
                  : "secondary"
              }
            >
              <CustomIcon
                id="infobox-list-icon"
                icon={layer.tema}
                size={isLargeIcon(layer.tema) ? 30 : 26}
                padding={isLargeIcon(layer.tema) ? 0 : 2}
                color={"#777"}
              />
            </Badge>
          </ListItemIcon>
          <div
            style={{
              flex: 1
            }}
          >
            <div className="generic-element-primary-text">
              {primaryTextHeader &&
              primaryTextHeader.harData &&
              primaryTextHeader.elementer[0]
                ? primaryTextHeader.elementer
                : resultat.error
                ? "Kunne ikke hente data"
                : "Ingen treff"}
            </div>
            <div className="generic-element-secondary-text">{layer.tittel}</div>
            <div className="generic-element-data-owner">{layer.dataeier}</div>
          </div>
          {faktaark_url && (
            <CustomTooltip placement="right" title="Vis faktaark">
              <IconButton
                id="show-faktaark-button"
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(true);
                }}
              >
                <Info id="open-facts-icon" color="primary" />
              </IconButton>
            </CustomTooltip>
          )}
        </ListItem>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        className="facts-modal-body"
      >
        <div className="facts-modal-wrapper">
          <div className="facts-modal-title">
            <div>Faktaark</div>
            <div className="facts-modal-buttons-div">
              <Button
                id="infobox-detail-facts"
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => window.open(faktaark_url)}
                endIcon={<OpenInNew />}
              >
                Åpne i nytt vindu
              </Button>
              <button
                tabIndex="0"
                className="close-modal-button-wrapper"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <div className="close-modal-button">
                  <Close />
                </div>
              </button>
            </div>
          </div>
          {layer.type !== "naturtype" && (
            <iframe
              className="facts-modal-content"
              allowtransparency="true"
              title="Faktaark"
              src={faktaark_url}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GeneriskElement;
