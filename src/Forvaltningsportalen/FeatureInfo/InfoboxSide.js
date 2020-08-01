import React from "react";
import {
  Close,
  MyLocation,
  Place,
  Home,
  Flag,
  Terrain,
  ExpandMore
} from "@material-ui/icons";
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  ListItemIcon
} from "@material-ui/core";
import CustomTooltip from "../../Common/CustomTooltip";
import "../../style/infobox.css";
import DetailedInfo from "./DetailedInfo";
import LoadingPlaceholder from "./LoadingPlaceholder";

const InfoBox = ({
  coordinates_area,
  layerevent,
  getBackendData,
  handleInfobox,
  onUpdateLayerProp,
  layersResult,
  valgteLag,
  sted,
  adresse,
  resultat,
  kartlag,
  showExtensiveInfo: showAllLayers,
  handleExtensiveInfo
}) => {
  const coords = `${Math.round(coordinates_area.lat * 10000) /
    10000}° N  ${Math.round(coordinates_area.lng * 10000) / 10000}° Ø`;

  const hentAdresse = adresse => {
    if (adresse.loading) return <LoadingPlaceholder />;

    if (!adresse || !adresse.adressetekst) return null;
    return adresse.adressetekst;
  };

  const hentGardsnummer = adresse => {
    if (adresse.loading) return <LoadingPlaceholder />;

    if (!adresse.gardsnummer) return null;
    return "Matrikkel: " + adresse.gardsnummer + "/" + adresse.bruksnummer;
  };

  const toggleAllLayers = () => {
    const fetchData = !showAllLayers;
    handleExtensiveInfo(!showAllLayers);
    if (fetchData) {
      getBackendData(coordinates_area.lng, coordinates_area.lat, layerevent);
    }
  };
  const adressetekst = hentAdresse(adresse);

  return (
    <div className="infobox-container-side">
      <div className="infobox-side">
        <div className="layer-results-scrollable-side">
          <div className="infobox-title-wrapper">
            <div className="infobox-title-content">
              <CustomTooltip placement="right" title="Sted / Områdetype">
                {false ? (
                  <MyLocation />
                ) : (
                  <img
                    alt=""
                    width={32}
                    height={48}
                    style={{ transform: "rotate(-15deg)" }}
                    src="/marker/Location-marker.png"
                  />
                )}
              </CustomTooltip>
              <div className="infobox-title-text">
                <div className="infobox-title-text-primary">
                  {`${sted ? sted.komplettskrivemåte[0] : "-"}`}
                </div>
                <div className="infobox-title-text-secondary">
                  {`${sted ? sted.navneobjekttype : "-"}`}
                </div>
              </div>
            </div>
            <IconButton
              tabIndex="0"
              className="close-infobox-button"
              onClick={e => {
                handleInfobox(false);
              }}
            >
              <Close style={{ color: "rgba(255,255,255,0.9)" }} />
            </IconButton>
          </div>

          {sted && (
            <>
              <ListItem button onClick={() => {}}>
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText
                  primary={adressetekst || hentGardsnummer(adresse)}
                  secondary={sted.kommunenavn[0] + ", " + sted.fylkesnavn[0]}
                ></ListItemText>
                <ListItemSecondaryAction>
                  <ExpandMore style={{ color: "rgba(0,0,0,0.48)" }} />
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem button onClick={() => {}}>
                <ListItemIcon>
                  <Place />
                </ListItemIcon>
                <ListItemText
                  primary={coords}
                  secondary={"test"}
                ></ListItemText>
                <ListItemSecondaryAction>
                  <ExpandMore style={{ color: "rgba(0,0,0,0.48)" }} />
                </ListItemSecondaryAction>
              </ListItem>
            </>
          )}
          <List>
            <DetailedInfo
              showExtensiveInfo={showAllLayers}
              kartlag={showAllLayers ? kartlag : valgteLag}
              coordinates_area={coordinates_area}
              onUpdateLayerProp={onUpdateLayerProp}
              layersResult={layersResult}
              resultat={resultat}
            />
            {!showAllLayers && (
              <ListItem button onClick={toggleAllLayers}>
                <ListItemText primary="Vis alle..."></ListItemText>
                <ListItemSecondaryAction>
                  <ExpandMore style={{ color: "#888" }} />
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </List>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
