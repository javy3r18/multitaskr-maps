import geocoder from '@mapbox/mapbox-gl-geocoder'

export default (context, inject) => {
    inject("geocoder", geocoder)
}