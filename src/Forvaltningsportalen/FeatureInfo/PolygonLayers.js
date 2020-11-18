import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  ListItem,
  ListItemText,
  Collapse
} from "@material-ui/core";
import { ExpandLess, ExpandMore } from "@material-ui/icons";
import "../../style/infobox.css";
import backend from "../../Funksjoner/backend";
import { getPolygonDepth } from "../../Funksjoner/polygonTools";
import { getTextAreaReport } from "../../Funksjoner/translateAreaReport";

const PolygonLayers = ({
  availableLayers,
  polygon,
  handlePolygonResults,
  handleLoadingFeatures
}) => {
  const [searchLayers, setSearchLayers] = useState(availableLayers);
  const [menuOpen, setMenuOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const polygonJSON = JSON.stringify(polygon);

  const calculateAreaReport = () => {
    if (!polygon || polygon.length === 0) return;
    handlePolygonResults(null);
    const layerCodes = [];
    let errorResult = {};
    for (const layer of searchLayers) {
      if (!layer.selected || !layer.code) continue;
      layerCodes.push(layer.code);
      errorResult[layer.code] = { error: true };
    }
    if (layerCodes.length > 0) {
      const depth = getPolygonDepth(polygon);
      let wkt;
      if (depth === 2) {
        let points = "";
        for (const coord of polygon) {
          points = points + coord[1] + " " + coord[0] + ",";
        }
        // Last point has to be the same as the initial point
        points = points + polygon[0][1] + " " + polygon[0][0];
        points = "((" + points + "))";
        wkt = `SRID=4326;POLYGON ${points}`;
      } else if (depth === 3) {
        let points = "";
        for (const poly of polygon) {
          points = points + "(";
          for (const coord of poly) {
            points = points + coord[1] + " " + coord[0] + ",";
          }
          // Remove last comma
          points = points.slice(0, -1);
          points = points + "),";
        }
        // Remove last comma
        points = points.slice(0, -1);
        points = "(" + points + ")";
        wkt = `SRID=4326;POLYGON ${points}`;
      } else if (depth === 4) {
        let points = "";
        for (const multi of polygon) {
          points = points + "(";
          for (const poly of multi) {
            points = points + "(";
            for (const coord of poly) {
              points = points + coord[1] + " " + coord[0] + ",";
            }
            // Remove last comma
            points = points.slice(0, -1);
            points = points + "),";
          }
          // Remove last comma
          points = points.slice(0, -1);
          // points = "(" + points + "),";
          points = points + "),";
        }
        // Remove last comma
        points = points.slice(0, -1);
        points = "(" + points + ")";
        wkt = `SRID=4326;MULTIPOLYGON ${points}`;
      } else {
        handlePolygonResults(errorResult);
        return;
      }
      handleLoadingFeatures(true);
      backend.makeAreaReport(layerCodes, wkt).then(result => {
        if (!result) handlePolygonResults(errorResult);
        else sortAndHandlePolygonResults(result);
        handleLoadingFeatures(false);
      });
    }
  };

  const sortAndHandlePolygonResults = result => {
    let extendedResult = {};
    for (const code in result) {
      const detailResult = result[code];
      let sorted = detailResult.sort((a, b) => {
        return b.km2 - a.km2;
      });
      if (code === "MAT") {
        sorted = sorted.map(item => {
          return {
            ...item,
            navn: item.kode,
            kode: ""
          };
        });
      }
      if (code === "N13") {
        sorted = sorted.map(item => {
          // NOTE: A08 has been moved to A11, but data still returns A08
          return {
            ...item,
            navn: getTextAreaReport(
              "N13",
              item.kode === "A08" ? "A11" : item.kode,
              "name"
            ),
            beskrivelse: getTextAreaReport(
              "N13",
              item.kode === "A08" ? "A11" : item.kode,
              "description"
            )
          };
        });
      }
      if (code === "ANF") {
        sorted = sorted.map(item => {
          return {
            ...item,
            navn: item.kode,
            kode: ""
            // beskrivelse: getTextAreaReport("ANF", item.kode, "description")
          };
        });
      }
      extendedResult[code] = sorted;
    }
    handlePolygonResults(extendedResult);
  };

  const handleChange = (e, selectedLayerName) => {
    let layers = [...searchLayers];
    for (let layer of layers) {
      if (layer.name === selectedLayerName) {
        layer.selected = e.target.checked;
      }
    }
    setSearchLayers(layers);
  };

  useEffect(() => {
    if (!polygon) {
      setDisabled(true);
      return;
    }
    const depth = getPolygonDepth(polygon);
    // Only one polygon
    if (depth === 2 && polygon.length > 2) setDisabled(false);
    else if (depth === 3 && polygon[0].length > 2) setDisabled(false);
    else if (depth === 4 && polygon[0][0].length > 2) setDisabled(false);
    else setDisabled(true);
  }, [polygon, polygonJSON]);

  return (
    <div
      className={
        menuOpen ? "polygon-layers-wrapper expanded" : "polygon-layers-wrapper"
      }
    >
      <ListItem
        id={disabled ? "polygon-layer-disabled" : "polygon-layer-expander"}
        button
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <ListItemText
          primary={
            disabled ? "Arealrapport (polygon ikke definert)" : "Arealrapport"
          }
        />
        {menuOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={menuOpen} timeout="auto" unmountOnExit>
        <div className="polygon-layers-content">
          <div className="polygon-checkbox-content">
            {searchLayers.map((layer, index) => {
              return (
                <div key={index} className="polygon-layers-item">
                  <div className={disabled ? "polygon-layers-disabled" : ""}>
                    {layer.name}
                  </div>
                  <Checkbox
                    id="select-layers-checkbox"
                    checked={layer.selected}
                    onChange={e => handleChange(e, layer.name)}
                    color="default"
                    disabled={disabled}
                  />
                </div>
              );
            })}
          </div>
          <div className="polygon-button-wrapper">
            <Button
              id="polygon-run-button"
              variant="contained"
              size="small"
              onClick={() => {
                calculateAreaReport();
              }}
              disabled={disabled}
            >
              Lag arealrapport
            </Button>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default PolygonLayers;
