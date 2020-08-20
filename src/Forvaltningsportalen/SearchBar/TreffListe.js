import React from "react";
import { KeyboardBackspace } from "@material-ui/icons";
const TreffListe = props => {
  let list_items = [];
  let max_list_length = 200;

  function addToList(inputlist, type, criteria) {
    if (inputlist) {
      let list_to_update = inputlist;
      if (criteria) {
        if (inputlist[criteria]) {
          list_to_update = inputlist[criteria];
        } else {
          return list_items;
        }
      }

      for (let i in list_to_update) {
        list_to_update[i]["trefftype"] = type;
      }
      return list_items.concat(list_to_update);
    }
    return list_items;
  }

  if (!props.searchResultPage) {
    list_items = addToList(
      [{ searchTerm: props.searchTerm }],
      "Søkeelement",
      null
    );
    max_list_length = 20;
  }

  list_items = addToList(props.treffliste_lag, "Kartlag", null);
  list_items = addToList(props.treffliste_underlag, "Underlag", null);
  list_items = addToList(props.treffliste_sted, "Stedsnavn", null);
  list_items = addToList(props.treffliste_knrgnrbnr, "KNR-GNR-BNR", "adresser");

  if (props.treffliste_knr && props.treffliste_knr.stedsnavn) {
    let knr = props.treffliste_knr.stedsnavn;
    knr["trefftype"] = "Kommune";
    list_items = list_items.concat(knr);
  }

  list_items = addToList(props.treffliste_gnr, "GNR", "adresser");
  list_items = addToList(props.treffliste_bnr, "BNR", "adresser");

  function movefocus(e, index) {
    if (e.keyCode === 27) {
      if (props.handleRemoveTreffliste) {
        props.handleRemoveTreffliste();
        props.onSearchBar(null);
        document.getElementById("searchfield").value = "";
        document.getElementById("searchfield").focus();
      }
    }
    if (document.getElementsByClassName("searchbar_item")) {
      // nedoverpil
      if (e.keyCode === 40) {
        if (index < list_items.length - 1) {
          document.getElementsByClassName("searchbar_item")[index + 1].focus();
        }
      }
      // oppoverpil
      if (e.keyCode === 38) {
        let nextindex = index - 1;
        if (nextindex < 0) {
          document.getElementById("searchfield").focus();
        } else {
          document.getElementsByClassName("searchbar_item")[index - 1].focus();
        }
        // if (props.searchResultPage && nextindex < 0) {
        //   document.getElementById("searchfield").focus();
        // } else if (!props.searchResultPage && nextindex < 1) {
        //   document.getElementById("searchfield").focus();
        // } else {
        //   document.getElementsByClassName("searchbar_item")[index - 1].focus();
        // }
      }
    }
  }

  function onActivate(item, trefftype) {
    if (props.searchResultPage) {
      props.onSelectSearchResult(false);
    }
    props.handleRemoveTreffliste();
    props.removeValgtLag();
    document.getElementById("searchfield").value = "";
    if (trefftype === "Kartlag" || trefftype === "Underlag") {
      props.addValgtLag(item, trefftype);
    } else {
      props.handleGeoSelection(item);
    }
  }

  list_items = list_items.slice(0, max_list_length);
  list_items = list_items.filter(item => item.trefftype !== "Søkeelement");

  return (
    <>
      {props.searchResultPage && (
        <div className="valgtLag">
          <button
            className="listheadingbutton all-results"
            onClick={e => {
              props.onSelectSearchResult(false);
            }}
          >
            <span className="listheadingbutton-icon all-results">
              <KeyboardBackspace />
            </span>
            <span className="listheadingbutton-text">Søkeresultater</span>
          </button>
        </div>
      )}
      <ul
        className={
          props.searchResultPage ? "treffliste searchresultpage" : "treffliste"
        }
        id="treffliste"
        tabIndex="0"
        onKeyDown={e => {
          if (e.keyCode === 40 || e.keyCode === 38) {
            e.preventDefault();
          }
        }}
      >
        {list_items &&
          list_items.map((item, index) => {
            // if (item.trefftype === "Søkeelement") {
            //   return (
            //     <li
            //       id={index}
            //       key={index}
            //       tabIndex={index > 0 ? 0 : -1}
            //       className="searchbar_item  search_all"
            //       onKeyDown={e => {
            //         if (e.keyCode === 13) {
            //           //Enterpressed
            //           props.onSearchButton();
            //         } else {
            //           movefocus(e, index);
            //         }
            //       }}
            //       onClick={() => {
            //         props.onSearchButton();
            //       }}
            //     >
            //       <span className="itemname">
            //         Søk etter "{props.searchTerm}"{" "}
            //       </span>
            //     </li>
            //   );
            // }

            let itemname = item.adressetekst || "";
            let trefftype = item.trefftype || "annet treff";
            let itemtype = item.navnetype || "";
            let itemnr = "";
            if (item.trefftype === "Kommune") {
              itemname = item.kommunenavn || "finner ikke kommunenavnet";
              itemnr = item.knr || "";
            } else if (item.trefftype === "Kartlag") {
              itemname = item.tittel;
              itemnr = item.tema || "Kartlag";
            } else if (item.trefftype === "Underlag") {
              itemname = item.tittel;
              itemnr = item.tema || "Underlag";
            } else if (item.trefftype === "Stedsnavn") {
              itemname = item.stedsnavn || "finner ikke stedsnavn";
              itemtype = item.navnetype || "";
              itemnr = item.ssrId || "";
            }

            return (
              <li
                id={index}
                key={index}
                tabIndex="0"
                className="searchbar_item"
                onKeyDown={e => {
                  if (e.keyCode === 13) {
                    onActivate(item, trefftype);
                  } else {
                    movefocus(e, index);
                  }
                }}
                onClick={() => {
                  onActivate(item, trefftype);
                }}
              >
                <div className="searchlist-item-wrapper">
                  <span className="itemname">{itemname} </span>
                  <span className="itemtype">
                    {trefftype}{" "}
                    {trefftype === "Stedsnavn" ? (
                      <>{itemtype} </>
                    ) : (
                      <>
                        {item.postnummer} {item.poststed}
                      </>
                    )}
                  </span>
                  <span className="itemnr">
                    {trefftype === "Kommune" ||
                    trefftype === "Stedsnavn" ||
                    trefftype === "Kartlag" ||
                    trefftype === "Underlag" ? (
                      <>{itemnr}</>
                    ) : (
                      <>
                        {trefftype === "KNR" ? (
                          <b>{item.kommunenummer}</b>
                        ) : (
                          <>{item.kommunenummer}</>
                        )}
                        -
                        {trefftype === "GNR" ? (
                          <b>{item.gardsnummer}</b>
                        ) : (
                          <>{item.gardsnummer}</>
                        )}
                        -
                        {trefftype === "BNR" ? (
                          <b>{item.bruksnummer}</b>
                        ) : (
                          <>{item.bruksnummer}</>
                        )}
                      </>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default TreffListe;
