export const state = () => ({
    polygons: {
        features: []
    },
})

export const mutations = {
    polygons: (state, polygons) => state.polygons = polygons,
}

export const getters = {
    polygons: state => state.polygons,
}


export const actions = {
    async get({commit}, params){
        // let query = Object.keys(params).map(key => key+'='+ params[key]).join('&')
        let response = await this.$axios.get('https://seal-app-x5cdr.ondigitalocean.app/polygons/' + params.lng + '/' + params.lat);
        commit('polygons', response.data);
    },
}

