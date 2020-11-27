import React from "react";
import "../../style/searchbar.css";
import TreffListe from "./TreffListe";
import backend from "../../Funksjoner/backend";
import { Menu as MenuIcon } from "@material-ui/icons";
import DrawerMenu from "./DrawerMenu";

class SearchBar extends React.Component {
  state = {
    treffliste_lag: null,
    treffliste_sted: null,
    fylker: null,
    kommuner: null,
    isSearching: false,
    treffliste_knrgnrbnr: null,
    treffliste_kommune: null,
    treffliste_knr: null,
    treffliste_gnr: null,
    treffliste_bnr: null,
    treffliste_adresse: null,
    searchTerm: null,
    countermax: 50,
    anchorEl: null,
    number_places: 0,
    number_knrgnrbnr: 0,
    number_kommune: 0,
    number_knr: 0,
    number_gnr: 0,
    number_bnr: 0,
    number_addresses: 0,
    number_layers: 0,
    openDrawer: false
  };

  handleRemoveTreffliste = () => {
    this.setState({
      treffliste_sted: null,
      treffliste_lag: null,
      isSearching: false,
      treffliste_knrgnrbnr: null,
      treffliste_kommune: null,
      treffliste_knr: null,
      treffliste_gnr: null,
      treffliste_bnr: null,
      treffliste_adresse: null,
      number_places: 0,
      number_knrgnrbnr: 0,
      number_kommune: 0,
      number_knr: 0,
      number_gnr: 0,
      number_bnr: 0,
      number_addresses: 0,
      number_layers: 0
    });
  };

  searchInLayer = (criteria, searchTerm, layer) => {
    if (layer[criteria]) {
      let lagstring = layer[criteria];
      if (criteria === "tags") {
        lagstring = JSON.stringify(layer[criteria]);
      }
      lagstring = lagstring.toLowerCase();
      // Try with complete string
      if (lagstring.indexOf(searchTerm) !== -1) {
        return true;
      }
      // Break string only for title
      if (criteria === "tittel") {
        const termList = searchTerm.split(" ");
        let match = true;
        for (const element of termList) {
          if (lagstring.indexOf(element) === -1) {
            match = false;
            break;
          }
        }
        if (match) return true;
      }
    }
    return false;
  };

  searchForKey = (criteria, counter, searchTerm) => {
    const treffliste_lag = [];
    const treffliste_underlag = [];
    const countermax = this.state.countermax;
    const layers = this.props.kartlag;
    // Search in layers
    for (let i in layers) {
      if (counter >= countermax) {
        break;
      } else {
        const layer = layers[i];
        const found = this.searchInLayer(criteria, searchTerm, layer);
        if (found) {
          treffliste_lag.push(layer);
          counter += 1;
        }
        // Search in sublayers
        const sublayers = layer.underlag;
        if (!sublayers) continue;
        for (let j in sublayers) {
          if (counter >= countermax) {
            break;
          } else if (layer.aggregatedwmslayer === sublayers[j].wmslayer) {
            break;
          } else {
            const found = this.searchInLayer(
              criteria,
              searchTerm,
              sublayers[j]
            );
            if (found) {
              const sublayer = {
                ...sublayers[j],
                id: j,
                parentId: i,
                tema: layer.tema
              };
              treffliste_underlag.push(sublayer);
              counter += 1;
            }
          }
        }
      }
    }
    return { treffliste_lag, treffliste_underlag, counter };
  };

  handleSearchButton = () => {
    const term = document.getElementById("searchfield").value;
    this.setState({ searchTerm: null }, () => {
      this.handleSearchBar(term, true);
    });
  };

  handleSearchBar = (
    term,
    resultpage,
    page = 0,
    numberPerPage = 20,
    resultType = "all",
    pageDistribution = "",
    forceSearch = false
  ) => {
    let searchTerm = term ? term.trim() : null;
    if (!searchTerm) {
      this.setState({
        isSearching: false,
        searchTerm: null
      });
      return null;
    }

    // Remove weird symbols from search
    searchTerm = searchTerm.replace(/-/g, " ").replace(/&/g, " ");
    searchTerm = searchTerm.replace(/\?/g, " ").replace(/!/g, " ");
    searchTerm = searchTerm.replace(/"/g, " ").replace(/'/g, " ");
    searchTerm = searchTerm.replace(/\+/g, " ").replace(/\*/g, " ");
    searchTerm = searchTerm.replace(/\(/g, " ").replace(/\)/g, " ");
    searchTerm = searchTerm.replace(/\{/g, " ").replace(/\}/g, " ");
    searchTerm = searchTerm.replace(/\[/g, " ").replace(/\]/g, " ");
    searchTerm = searchTerm.replace(/  +/g, " ").trim();

    // If no change in search term, return same results
    let search = true;
    if (this.state.searchTerm === searchTerm) search = false;

    if (resultpage) {
      this.props.onSelectSearchResult(true);
      this.setState({
        isSearching: false,
        searchTerm: searchTerm,
        countermax: 15
      });
    } else {
      this.setState({
        isSearching: true,
        searchTerm: searchTerm,
        countermax: 50
      });
    }
    // DCo not search in no relevant change has happened
    // i.e., either new search term or page change (force search)
    if (!search && !forceSearch) return;
    searchTerm = searchTerm.toLowerCase();

    if (resultType === "all") {
      this.fetchSearchLayers(searchTerm);
      this.fetchSearchProperties(searchTerm);
      this.fetchSearchPlaces(searchTerm, page);
      this.fetchSearchAddresses(searchTerm, page);
    } else if (resultType === "layers") {
      this.fetchSearchLayers(searchTerm);
    } else if (resultType === "properties") {
      this.fetchSearchProperties(
        searchTerm,
        page,
        numberPerPage,
        pageDistribution
      );
    } else if (resultType === "places") {
      this.fetchSearchPlaces(searchTerm, page, numberPerPage);
    } else if (resultType === "addresses") {
      this.fetchSearchAddresses(searchTerm, page, numberPerPage);
    }
  };

  fetchSearchLayers = searchTerm => {
    let counter = 0;
    let treffliste_lag = [];
    let treffliste_underlag = [];

    if (searchTerm && searchTerm.length > 0) {
      // Search in title
      let title_search = this.searchForKey("tittel", counter, searchTerm);
      treffliste_lag = title_search.treffliste_lag;
      treffliste_underlag = title_search.treffliste_underlag;
      counter = title_search.counter;
      // Search in data owner
      let owner_search = this.searchForKey("dataeier", counter, searchTerm);
      treffliste_lag = treffliste_lag.concat(owner_search.treffliste_lag);
      treffliste_underlag = treffliste_underlag.concat(
        owner_search.treffliste_underlag
      );
      counter += owner_search.counter;
      // Search in tema
      let theme_search = this.searchForKey("tema", counter, searchTerm);
      treffliste_lag = treffliste_lag.concat(theme_search.treffliste_lag);
      treffliste_underlag = treffliste_underlag.concat(
        theme_search.treffliste_underlag
      );
      counter += theme_search.counter;
      // Search in tags
      let tags_search = this.searchForKey("tags", counter, searchTerm);
      treffliste_lag = treffliste_lag.concat(tags_search.treffliste_lag);
      treffliste_underlag = treffliste_underlag.concat(
        tags_search.treffliste_underlag
      );
      counter += tags_search.counter;
    }
    const number_layers = treffliste_lag.length + treffliste_underlag.length;
    this.setState({
      treffliste_lag,
      treffliste_underlag,
      number_layers
    });
  };

  fetchSearchProperties = (
    searchTerm,
    page = 0,
    numberPerPage = 20,
    pageDistribution = ""
  ) => {
    /* Kommunenummer, gårdsnummer og bruksnummer */
    if (page === 0) {
      this.setState({
        number_knrgnrbnr: 0,
        number_knr: 0,
        number_gnr: 0,
        number_bnr: 0
      });
    }
    let knr = null;
    let gnr = null;
    let bnr = null;

    if (!isNaN(searchTerm)) {
      // Hvis det sendes inn utelukkende ett nummer, slå opp i alle hver for seg
      if (page === 0) {
        // Only if there is no page, search for kommune
        backend.hentKommune(searchTerm).then(resultat => {
          // henter kommune fra ssr
          if (resultat && resultat["stedsnavn"]) {
            resultat["stedsnavn"]["knr"] = searchTerm;
          }
          const treffliste_kommune =
            resultat && resultat.stedsnavn ? resultat.stedsnavn : [];
          const number_kommune = Array.isArray(treffliste_kommune)
            ? treffliste_kommune.length
            : 1;
          this.setState({
            treffliste_knrgnrbnr: null,
            treffliste_kommune: resultat,
            number_knrgnrbnr: 0,
            number_kommune
          });
        });
      } else {
        this.setState({ treffliste_kommune: null });
      }

      // If there is page, as specified by "pageDistribution" with format
      // "{ knr: { page: 2, number: 10}, gnr: {...}, bnr: {...} }"
      // which specifies page and number of items per page for each.
      // If not required, the page and number are null
      let page_knr = page;
      let numberPerPage_knr = numberPerPage;
      let page_gnr = page;
      let numberPerPage_gnr = numberPerPage;
      let page_bnr = page;
      let numberPerPage_bnr = numberPerPage;
      if (
        page !== 0 &&
        pageDistribution &&
        JSON.stringify(pageDistribution) !== "{}"
      ) {
        page_knr = pageDistribution.knr.page;
        numberPerPage_knr = pageDistribution.knr.number;
        page_gnr = pageDistribution.gnr.page;
        numberPerPage_gnr = pageDistribution.gnr.number;
        page_bnr = pageDistribution.bnr.page;
        numberPerPage_bnr = pageDistribution.bnr.number;
      }

      if (page_knr !== null) {
        backend
          .hentKnrGnrBnr(searchTerm, null, null, page_knr, numberPerPage_knr)
          .then(resultat => {
            this.setState({
              treffliste_knrgnrbnr: null,
              treffliste_knr: resultat,
              number_knrgnrbnr: 0
            });
            if (page === 0) {
              const number_knr =
                resultat &&
                resultat.metadata &&
                resultat.metadata.totaltAntallTreff
                  ? resultat.metadata.totaltAntallTreff
                  : 0;
              this.setState({ number_knr });
            }
          });
      } else {
        this.setState({ treffliste_knr: null });
      }

      if (page_gnr !== null) {
        backend
          .hentKnrGnrBnr(null, searchTerm, null, page_gnr, numberPerPage_gnr)
          .then(resultat => {
            this.setState({
              treffliste_knrgnrbnr: null,
              treffliste_gnr: resultat,
              number_knrgnrbnr: 0
            });
            if (page === 0) {
              const number_gnr =
                resultat &&
                resultat.metadata &&
                resultat.metadata.totaltAntallTreff
                  ? resultat.metadata.totaltAntallTreff
                  : 0;
              this.setState({ number_gnr });
            }
          });
      } else {
        this.setState({ treffliste_gnr: null });
      }

      if (page_bnr !== null) {
        backend
          .hentKnrGnrBnr(null, null, searchTerm, page_bnr, numberPerPage_bnr)
          .then(resultat => {
            this.setState({
              treffliste_knrgnrbnr: null,
              treffliste_bnr: resultat,
              number_knrgnrbnr: 0
            });
            if (page === 0) {
              const number_bnr =
                resultat &&
                resultat.metadata &&
                resultat.metadata.totaltAntallTreff
                  ? resultat.metadata.totaltAntallTreff
                  : 0;
              this.setState({ number_bnr });
            }
          });
      } else {
        this.setState({ treffliste_bnr: null });
      }
    } else {
      // Hvis det som sendes inn er rene nummer separert med mellomrom, slash eller bindestrek
      let numbercheck = searchTerm.replace(/ /g, "-");
      numbercheck = numbercheck.replace(/\//g, "-");
      numbercheck = numbercheck.replace(/;/g, "-");
      numbercheck = numbercheck.replace(/,/g, "-");
      let checknr = numbercheck.replace(/-/g, "");
      if (!isNaN(checknr)) {
        let list = numbercheck.split("-");
        if (list[0]) {
          knr = list[0];
        }
        if (list[1]) {
          gnr = list[1];
        }
        if (list[2]) {
          bnr = list[2];
        }
        backend
          .hentKnrGnrBnr(knr, gnr, bnr, page, numberPerPage)
          .then(resultat => {
            const number_knrgnrbnr =
              resultat &&
              resultat.metadata &&
              resultat.metadata.totaltAntallTreff
                ? resultat.metadata.totaltAntallTreff
                : 0;
            this.setState({
              treffliste_knrgnrbnr: resultat,
              treffliste_knr: null,
              treffliste_gnr: null,
              treffliste_bnr: null,
              number_knrgnrbnr,
              number_knr: 0,
              number_gnr: 0,
              number_bnr: 0
            });
          });
      } else {
        this.setState({
          treffliste_knrgnrbnr: null,
          treffliste_knr: null,
          treffliste_gnr: null,
          treffliste_bnr: null,
          number_knrgnrbnr: 0,
          number_knr: 0,
          number_gnr: 0,
          number_bnr: 0
        });
      }
    }
  };

  fetchSearchPlaces = (searchTerm, page = 0, numberPerPage = 20) => {
    backend.hentSteder(searchTerm, page, numberPerPage).then(resultat => {
      let max_items = 20;
      let entries = resultat ? resultat.stedsnavn : null;
      const resultatliste = {};
      // If only one entry is returned from backend, this is
      // returned as an object, not as array of objects.
      // In that case, convert to array
      if (!entries) {
        entries = [];
      } else if (!Array.isArray(entries) && entries.constructor === Object) {
        const object = { ...entries };
        entries = [];
        entries.push(object);
      }
      for (const i in entries) {
        const id = entries[i].ssrId;
        if (resultatliste[id]) {
          const gammel = resultatliste[id];
          const ny = entries[i];
          const variasjon = {};
          for (const j in gammel) {
            if (gammel[j] !== ny[j]) {
              if (j !== "variasjon") {
                variasjon[j] = [gammel[j], ny[j]];
              }
            }
          }
          resultatliste[id].variasjon = variasjon;
        } else {
          if (Object.keys(resultatliste).length < max_items) {
            resultatliste[id] = entries[i];
            if (resultatliste[id]) {
              resultatliste[id].ssrpri = i || 100;
            }
          }
        }
      }
      const prioritertliste = {};
      for (let i in resultatliste) {
        const element = resultatliste[i];
        prioritertliste[element.ssrpri] = element;
      }
      this.setState({ treffliste_sted: Object.values(prioritertliste) });
      if (page === 0) {
        const number_places =
          resultat && resultat.totaltAntallTreff
            ? resultat.totaltAntallTreff
            : 0;
        this.setState({ number_places });
      }
    });
  };

  fetchSearchAddresses = (searchTerm, page = 0, numberPerPage = 20) => {
    let address = [];
    // Use strict search approach
    backend.hentAdresse(searchTerm, page, numberPerPage).then(resultat => {
      let entries = resultat ? resultat.adresser : null;
      // If only one entry is returned from backend, this is
      // returned as an object, not as array of objects.
      // In that case, convert to array
      if (!entries) {
        entries = [];
      } else if (!Array.isArray(entries) && entries.constructor === Object) {
        const object = { ...entries };
        entries = [];
        entries.push(object);
      }
      if (entries.length > 0) {
        address = entries;
      }

      // Use less strict search approach if no results
      if (address.length === 0) {
        backend
          .hentAdresse(searchTerm + "*", page, numberPerPage)
          .then(resultat => {
            entries = resultat ? resultat.adresser : null;
            // If only one entry is returned from backend, this is
            // returned as an object, not as array of objects.
            // In that case, convert to array
            if (!entries) {
              entries = [];
            } else if (
              !Array.isArray(entries) &&
              entries.constructor === Object
            ) {
              const object = { ...entries };
              entries = [];
              entries.push(object);
            }
            if (entries.length > 0) {
              address = entries;
            }
            this.setState({ treffliste_adresse: address });
            if (page === 0) {
              const number_addresses =
                resultat &&
                resultat.metadata &&
                resultat.metadata.totaltAntallTreff
                  ? resultat.metadata.totaltAntallTreff
                  : 0;
              this.setState({ number_addresses });
            }
          });
      } else {
        this.setState({ treffliste_adresse: address });
        if (page === 0) {
          const number_addresses =
            resultat && resultat.metadata && resultat.metadata.totaltAntallTreff
              ? resultat.metadata.totaltAntallTreff
              : 0;
          this.setState({ number_addresses });
        }
      }
    });
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = event => {
    if (
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target) &&
      !this.props.searchResultPage
    ) {
      this.handleRemoveTreffliste();
    }
  };

  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  handleOpenDrawer = () => {
    this.setState({ openDrawer: true });
  };

  handleCloseDrawer = () => {
    this.setState({ openDrawer: false });
  };

  handleSearchKeyDown = e => {
    if (e.keyCode === 27 && !this.props.searchResultPage) {
      this.handleRemoveTreffliste();
      this.handleSearchBar(null);
      document.getElementById("searchfield").value = "";
      document.getElementById("searchfield").focus();
      return;
    }
    if (e.keyCode === 27 && this.props.searchResultPage) {
      document.getElementById("search-button").focus();
      return;
    }
    const searchBar = document.getElementsByClassName(
      "searchlist-item-wrapper"
    );
    const length = searchBar.length;
    if (e.key === "ArrowDown" && e.keyCode === 40 && searchBar && length > 0) {
      searchBar[0].focus();
    }
  };

  render() {
    return (
      <>
        <div
          className={
            this.props.isMobile && this.props.searchResultPage
              ? "searchbar_container_results"
              : "searchbar_container"
          }
          ref={this.setWrapperRef}
        >
          <div className="searchbar">
            <input
              className="searchbarfield"
              id="searchfield"
              type="text"
              autoComplete="off"
              placeholder="Søk etter kartlag eller område..."
              onFocus={e => this.handleSearchBar(e.target.value)}
              onChange={e => {
                this.handleSearchBar(e.target.value);
              }}
              onKeyDown={e => {
                this.handleSearchKeyDown(e);
              }}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  this.handleSearchButton();
                  if (
                    !this.props.isMobile &&
                    !this.props.showSideBar &&
                    document.getElementById("searchfield").value.length > 0
                  ) {
                    this.props.handleSideBar(true);
                  }
                }
              }}
            />

            {this.state.isSearching && (
              <button
                className="x"
                onClick={() => {
                  this.handleRemoveTreffliste();
                  this.handleSearchBar(null);
                  document.getElementById("searchfield").value = "";
                }}
              >
                <div className="x-button-div">X</div>
              </button>
            )}
            <button
              id="search-button"
              className="search-button"
              onClick={() => {
                this.handleSearchButton();
                if (
                  !this.props.isMobile &&
                  !this.props.showSideBar &&
                  document.getElementById("searchfield").value.length > 0
                ) {
                  this.props.handleSideBar(true);
                }
              }}
            >
              Søk
            </button>
          </div>
          {(this.state.isSearching || this.props.searchResultPage) && (
            <TreffListe
              onSelectSearchResult={this.props.onSelectSearchResult}
              searchResultPage={this.props.searchResultPage}
              searchTerm={this.state.searchTerm}
              handleSearchBar={this.handleSearchBar}
              treffliste_lag={this.state.treffliste_lag}
              treffliste_underlag={this.state.treffliste_underlag}
              treffliste_sted={this.state.treffliste_sted}
              treffliste_kommune={this.state.treffliste_kommune}
              treffliste_knr={this.state.treffliste_knr}
              treffliste_gnr={this.state.treffliste_gnr}
              treffliste_bnr={this.state.treffliste_bnr}
              treffliste_adresse={this.state.treffliste_adresse}
              treffliste_knrgnrbnr={this.state.treffliste_knrgnrbnr}
              number_places={this.state.number_places}
              number_knrgnrbnr={this.state.number_knrgnrbnr}
              number_kommune={this.state.number_kommune}
              number_knr={this.state.number_knr}
              number_gnr={this.state.number_gnr}
              number_bnr={this.state.number_bnr}
              number_addresses={this.state.number_addresses}
              number_layers={this.state.number_layers}
              removeValgtLag={this.props.removeValgtLag}
              addValgtLag={this.props.addValgtLag}
              handleGeoSelection={this.props.handleGeoSelection}
              handleRemoveTreffliste={this.handleRemoveTreffliste}
              isMobile={this.props.isMobile}
              windowHeight={this.props.windowHeight}
              handleSideBar={this.props.handleSideBar}
              handleInfobox={this.props.handleInfobox}
              handleFullscreenInfobox={this.props.handleFullscreenInfobox}
            />
          )}

          <button
            className="help_button"
            tabIndex="0"
            onClick={() => {
              if (!this.props.loadingFeatures) {
                this.handleOpenDrawer();
              }
            }}
          >
            <MenuIcon />
          </button>
          <DrawerMenu
            anchorEl={this.state.anchorEl}
            openDrawer={this.state.openDrawer}
            handleCloseDrawer={this.handleCloseDrawer}
            handleAboutModal={this.props.handleAboutModal}
            showFavoriteLayers={this.props.showFavoriteLayers}
            toggleShowFavoriteLayers={this.props.toggleShowFavoriteLayers}
            toggleEditLayers={this.props.toggleEditLayers}
            uploadPolygonFile={this.props.uploadPolygonFile}
            getSavedPolygons={this.props.getSavedPolygons}
          />
        </div>
      </>
    );
  }
}

export default SearchBar;