import React from "react";
import { ListSubheader } from "@material-ui/core";
import Klikktekster from "./Klikktekster";

const Underlag = ({
  underlag,
  feature,
  selectedLayerIndex,
  onChangeSelectedLayer
}) => {
  const layer = underlag[selectedLayerIndex];
  const onUpdate = (key, value) => {
    console.log({ key, value });
  };
  return (
    <>
      <ListSubheader disableSticky>Kartlag</ListSubheader>
      <div style={{ marginLeft: 24, marginRight: 24 }}>
        {underlag.map((ul, index) => {
          const isSelected = index === selectedLayerIndex;
          return (
            <span
              key={ul.wmslayer}
              style={{
                cursor: "pointer",
                margin: 4,
                fontWeight: isSelected && "bold"
              }}
              onClick={() => onChangeSelectedLayer(index)}
            >
              {isSelected ? "[" + ul.tittel + "]" : ul.tittel}
            </span>
          );
        })}
      </div>
      <ListSubheader disableSticky>{layer.tittel}</ListSubheader>
      <Klikktekster
        underlag={layer}
        selectedLayerIndex={selectedLayerIndex}
        feature={feature}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default Underlag;
