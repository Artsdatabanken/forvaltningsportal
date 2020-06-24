import React from "react";

function MapLegend({ style }) {
  return (
    <svg
      {...style}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path d="M9 3L3.36 4.9c-.21.07-.36.25-.36.48V20.5a.5.5 0 00.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5a.5.5 0 00-.5-.5l-.16.03L15 5.1 9 3M8 5.45v11.7l-3 1.16V6.46l3-1.01m2 .02l4 1.4v11.66l-4-1.4V5.47m9 .23v11.84l-3 1.01V6.86l3-1.16m-11.54.6l-1.89.67v2.15l1.89-.67V6.3m0 2.75l-1.89.67v2.15l1.89-.67V9.05m0 2.75l-1.89.67v2.15l1.89-.67V11.8m0 2.75l-1.89.67v2.15l1.89-.67v-2.15z"></path>
    </svg>
  );
}

export default MapLegend;
