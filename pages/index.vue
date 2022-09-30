<template>
  <b-container id="map"> <button @click="bro">sasa</button></b-container>
</template>
<script>
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
        style: "mapbox://styles/javy3r18/cl8ow1ggb000514p3f9590uoe",
        zoom: 11,
        center: [107.61861, -6.90389],
      });
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
