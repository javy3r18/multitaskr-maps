import { StylesControl } from "mapbox-gl-controls";
import "mapbox-gl-controls/lib/controls.css";
export default (context, inject) => {
  inject("StylesControl", StylesControl);
};
