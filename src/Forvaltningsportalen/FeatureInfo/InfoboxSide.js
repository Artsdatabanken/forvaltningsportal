import React from "react";
import { Close, MyLocation, Place, Home, Flag } from "@material-ui/icons";
import { Terrain } from "@material-ui/icons";
import { withStyles } from "@material-ui/core/styles";
import { Tooltip } from "@material-ui/core";
import GeneriskElement from "./GeneriskElement";
import "../../style/infobox.css";
import DetailedInfo from "./DetailedInfo";

const styles = {
  tooltip: {
    backgroundColor: "#000000",
    fontSize: "12px",
    position: "relative",
    left: "-5px"
  }
};
const CustomTooltip = withStyles(styles)(Tooltip);

const InfoBox = ({
  coordinates_area,
  layerevent,
  getBackendData,
  handleInfobox,
  onUpdateLayerProp,
  layersresultat,
  valgteLag,
  sted,
  adresse,
  handleForvaltningsLayerProp,
  resultat,
  showExtensiveInfo,
  kartlag,
  handleExtensiveInfo
}) => {
  const coords = `${Math.round(coordinates_area.lat * 10000) /
    10000}° N  ${Math.round(coordinates_area.lng * 10000) / 10000}° Ø`;

  // Kommune kommer når ting er slått sammen, bruker ikke tid på det før da.
  console.log(sted);

  const hentAdresse = adresse => {
    if (adresse && adresse.adressetekst) {
      return adresse.adressetekst;
    }
    return "-";
  };

  const hentGardsnummer = adresse => {
    if (adresse && adresse.gardsnummer) {
      return adresse.gardsnummer;
    }
    return "-";
  };

  const hentBruksnummer = adresse => {
    if (adresse && adresse.bruksnummer) {
      return adresse.bruksnummer;
    }
    return "-";
  };

  return (
    <div className="infobox-container-side">
      <div className="infobox-side">
        <div className="infobox-title-wrapper">
          <div className="infobox-title-content">
            <CustomTooltip placement="right" title="Sted / Områdetype">
              <MyLocation />
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
          <button
            tabIndex="0"
            className="close-infobox-button"
            onClick={e => {
              handleInfobox(false);
            }}
          >
            <Close />
          </button>
        </div>

        {sted && (
          <div className="infobox-content">
            <div className="infobox-text-wrapper">
              <CustomTooltip placement="right" title="Fylke / Fylkesnr.">
                <Terrain />
              </CustomTooltip>
              <div className="infobox-text-multiple">
                <div className="infobox-text-primary">{sted.fylkesnavn[0]}</div>
                <div className="infobox-text-secondary">
                  {sted.fylkesnummer[0]}
                </div>
              </div>
            </div>
            <div className="infobox-text-wrapper">
              <CustomTooltip placement="right" title="Kommune / Kommunenr.">
                <Flag />
              </CustomTooltip>
              <div className="infobox-text-multiple">
                <div className="infobox-text-primary">
                  {sted.kommunenavn[0]}
                </div>
                <div className="infobox-text-secondary">
                  {sted.kommunenummer[0]}
                </div>
              </div>
            </div>
            <div className="infobox-text-wrapper">
              <CustomTooltip
                placement="right"
                title="Adresse / Gårdsnr. / Bruksnr."
              >
                <Home />
              </CustomTooltip>
              <div className="infobox-text-multiple">
                <div className="infobox-text-primary">
                  {hentAdresse(adresse)}
                </div>
                <div className="infobox-text-secondary">
                  {`${hentGardsnummer(adresse)}/${hentBruksnummer(adresse)}`}
                </div>
              </div>
            </div>
            <div className="infobox-text-wrapper">
              <CustomTooltip placement="right" title="Koordinater">
                <Place />
              </CustomTooltip>
              <div className="infobox-text-primary">
                {coordinates_area ? coords : "--° N --° Ø"}
              </div>
            </div>
          </div>
        )}
        <div className="window_scrollable">
          {layersresultat !== undefined &&
            Object.keys(layersresultat).map(key => {
              return (
                <GeneriskElement
                  onUpdateLayerProp={onUpdateLayerProp}
                  coordinates_area={coordinates_area}
                  key={key}
                  kartlag={valgteLag}
                  resultat={layersresultat[key]}
                  element={key}
                />
              );
            })}
        </div>
        <div className="search-layers-button-wrapper">
          <button
            tabIndex="0"
            className="search_layers"
            title="Marker tool"
            alt="Marker tool"
            onClick={e => {
              getBackendData(
                coordinates_area.lng,
                coordinates_area.lat,
                layerevent
              );
            }}
          >
            Søk informasjon for alle lag i dette punktet
          </button>
        </div>
        <DetailedInfo
          showExtensiveInfo={showExtensiveInfo}
          kartlag={kartlag}
          handleExtensiveInfo={handleExtensiveInfo}
          coordinates_area={coordinates_area}
          onUpdateLayerProp={onUpdateLayerProp}
          layersresultat={layersresultat}
          resultat={resultat}
          handleForvaltningsLayerProp={handleForvaltningsLayerProp}
        />
      </div>
    </div>
  );
};

export default InfoBox;