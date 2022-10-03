<template>
  <b-container>
    <div id="map"></div>
  </b-container>
</template>
<script>
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
export default {
  data() {
    return {
      access_token:
        "pk.eyJ1IjoiamF2eTNyMTgiLCJhIjoiY2w4b3Q3aTdmMDB6djNvbzhycGtmYXF1MSJ9.55Zc-lWR2Oc7YzjBt9S5ow",
      map: {},
    };
  },
  mounted() {
    this.createMap();
  },
  methods: {
    createMap() {
      mapboxgl.accessToken = this.access_token;
      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        zoom: 11,
        center: [107.61861, -6.90389],
      });

      this.map.addControl(
        new mapboxgl.FullscreenControl({
          container: document.querySelector("body"),
        })
      );

      this.map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );
    },
  },
};
</script>
<style>
#map {
  width: 100%;
  height: 100vh;
}
</style>
