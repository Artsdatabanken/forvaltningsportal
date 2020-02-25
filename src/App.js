import React from "react";
import { withRouter } from "react-router";
import XML from "pixl-xml";
import { SettingsContext } from "SettingsContext";
import layers from "./Data/layers";
import adb_layers from "./Data/adb_layers";
import url_formatter from "./Data/url_formatter";
import metadata from "./metadata";
import metaSjekk from "AppSettings/AppFunksjoner/metaSjekk";
import backend from "Funksjoner/backend";
import TopBarContainer from "./TopBar/TopBarContainer";
import RightWindow from "./Forvaltningsportalen/RightWindow";
import FeatureInfo from "./Forvaltningsportalen/FeatureInfo";
import KartVelger from "./Forvaltningsportalen/KartVelger";
import Kart from "Kart/LeafletTangram/Leaflet";

import bakgrunnskarttema from "AppSettings/bakgrunnskarttema";
import { setValue } from "AppSettings/AppFunksjoner/setValue";
export let exportableSpraak;
export let exportableFullscreen;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      kartlag: {
        bakgrunnskart: JSON.parse(JSON.stringify(bakgrunnskarttema)),
        ...metaSjekk(metadata)
      },
      opplystKode: "",
      opplyst: {},
      actualBounds: null,
      fitBounds: null,
      navigation_history: [],
      showCurrent: true,
      showFullscreen: false,
      spraak: "nb",
      showExtensiveInfo: true
    };
    exportableSpraak = this;
    exportableFullscreen = this;
  }

  render() {
    const { history } = this.props;
    const path = this.props.location.pathname;
    const basiskart = this.state.kartlag.bakgrunnskart;
    return (
      <SettingsContext.Consumer>
        {context => {
          return (
            <>
              <>
                <TopBarContainer
                  _tittel={"Økologisk grunnkart forvaltningsportal"}
                />
                <KartVelger
                  onUpdateLayerProp={this.handleForvaltningsLayerProp}
                  aktivtFormat={basiskart.kart.aktivtFormat}
                />
                <Kart
                  showExtensiveInfo={this.state.showExtensiveInfo}
                  handleExtensiveInfo={this.handleExtensiveInfo}
                  handleLokalitetUpdate={this.hentInfoAlleLag}
                  handleValgteLag={this.hentInfoValgteLag}
                  forvaltningsportal={true}
                  show_current={this.state.showCurrent}
                  bounds={this.state.fitBounds}
                  latitude={65.4}
                  longitude={15.8}
                  zoom={3.1}
                  aktiveLag={this.state.kartlag}
                  opplyst={this.state.opplyst}
                  opplystKode={this.state.opplystKode}
                  onMapBoundsChange={this.handleActualBoundsChange}
                  onMapMove={context.onMapMove}
                  history={history}
                />
                <RightWindow
                  {...this.state}
                  path={path}
                  history={history}
                  show_current={this.state.showCurrent}
                  handleShowCurrent={this.handleShowCurrent}
                  onFitBounds={this.handleFitBounds}
                  onUpdateLayerProp={this.handleForvaltningsLayerProp}
                  kartlag={this.state.kartlag}
                />
                <FeatureInfo
                  {...this.state}
                  handleExtensiveInfo={this.handleExtensiveInfo}
                  showExtensiveInfo={this.state.showExtensiveInfo}
                  path={path}
                  history={history}
                  show_current={this.state.showCurrent}
                  handleShowCurrent={this.handleShowCurrent}
                  onFitBounds={this.handleFitBounds}
                  onUpdateLayerProp={this.handleForvaltningsLayerProp}
                  kartlag={this.state.kartlag}
                />
              </>
            </>
          );
        }}
      </SettingsContext.Consumer>
    );
  }

  handleActualBoundsChange = bounds => {
    this.setState({ actualBounds: bounds, fitBounds: null });
  };
  handleExtensiveInfo = showExtensiveInfo => {
    // funksjonen som bestemmer om man søker eller ikke ved klikk
    this.setState({ showExtensiveInfo: showExtensiveInfo });
  };
  handleFitBounds = bbox => {
    this.setState({ fitBounds: bbox });
  };
  handleShowCurrent = show_current => {
    this.setState({ showCurrent: show_current });
  };
  handleBoundsChange = bbox => {
    this.setState({ actualBounds: bbox });
  };
  handleSpraak = spraak => {
    this.setState({ spraak: spraak });
  };

  handleLatLng = (lng, lat) => {
    // Denne henter koordinatet og dytter det som state. Uten det kommer man ingensted.
    this.setState({
      lat,
      lng,
      sted: null,
      wms1: null
    });
  };

  handleStedsNavn = (lng, lat) => {
    // returnerer stedsnavn som vist øverst i feltet
    backend.hentStedsnavn(lng, lat).then(sted => {
      this.setState({
        sted: sted
      });
    });
  };

  handleADBSøk = (lng, lat) => {
    // Denne henter utvalgte lag fra artsdatabanken
    backend.hentAdbPunkt(lng, lat).then(el => {
      const dict = adb_layers(el);
      this.setState(dict);
    });
  };

  handleLayersSøk = (lng, lat) => {
    // Denne henter utvalgte lag baser på listen layers
    Object.keys(layers).forEach(key => {
      let url = url_formatter(layers[key], lat, lng);
      const delta = key === "naturtype" ? 0.0001 : 0.01; // målestokk?
      backend.wmsFeatureInfo(url, lat, lng, delta).then(response => {
        const res = XML.parse(response.text);
        res.url = response.url;
        //if (key === "naturvern") console.log(key, JSON.stringify(res)); // unødvendig?
        this.setState({ [key]: res.FIELDS || res });
      });
    });
  };

  hentInfoValgteLag = async (lng, lat) => {
    console.log("valgte_resultat");
  };

  hentInfoAlleLag = async (lng, lat) => {
    this.handleLatLng(lng, lat);
    this.handleStedsNavn(lng, lat);
    this.handleADBSøk(lng, lat);
    this.handleLayersSøk(lng, lat);
  };

  handleForvaltningsLayerProp = (layer, key, value) => {
    let nye_lag = this.state.kartlag;
    for (let item in this.state.kartlag) {
      if (nye_lag[item].kode === layer) {
        //        nye_lag[item][key] = value;
        setValue(nye_lag[item], key, value);
        break;
      }
    }
    this.setState({
      kartlag: Object.assign({}, nye_lag)
    });
  };

  static contextType = SettingsContext;
}

export default withRouter(App);
